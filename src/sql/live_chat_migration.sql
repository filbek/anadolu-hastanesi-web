-- ============================================================
-- Anadolu Hastaneleri Grubu - Canlı Destek (Live Chat)
--
-- JivoChat benzeri, kendi altyapımızda çalışan canlı destek sistemi.
-- Ziyaretçi tarafı anonimdir (giriş gerektirmez), operatör tarafı
-- admin panelinden yönetilir.
--
-- GÜVENLİK MODELİ — burası önemli:
-- Sohbet içeriği hasta verisi barındırabilir (isim, telefon, şikâyet).
-- Bu yüzden anon rolüne tablolar üzerinde DOĞRUDAN erişim VERİLMEZ.
-- Ziyaretçi yalnızca SECURITY DEFINER fonksiyonlar üzerinden, elindeki
-- `access_token` ile KENDİ konuşmasına erişebilir. Token tarayıcıda
-- localStorage'da saklanır; bilmeyen biri başka bir konuşmayı okuyamaz.
--
-- Bunun bedeli: anon rolünün SELECT hakkı olmadığı için ziyaretçi
-- tarafında Realtime çalışmaz — widget açıkken kısa aralıklı polling
-- kullanılır (bkz. src/services/chatService.ts). Operatör tarafı
-- authenticated admin olduğu için Realtime ile anlık çalışır.
--
-- Idempotent: birden fazla kez çalıştırılabilir.
-- Çalıştırma: Supabase SQL Editor'a yapıştırıp Run.
-- ============================================================

-- gen_random_uuid() için
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ============================================================
-- 1) TABLOLAR
-- ============================================================

CREATE TABLE IF NOT EXISTS public.chat_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  -- Ziyaretçinin kendi konuşmasına erişim anahtarı. Yalnızca ziyaretçinin
  -- tarayıcısında bulunur; RPC çağrılarında doğrulanır.
  access_token UUID NOT NULL DEFAULT gen_random_uuid(),

  visitor_name TEXT,
  visitor_email TEXT,
  visitor_phone TEXT,
  subject TEXT,
  -- Ziyaretçinin ilgilendiği şube (hospitals.name ile aynı yazım)
  hospital_name TEXT,

  -- 'open'   : yeni, operatör henüz yanıtlamadı
  -- 'active' : operatör konuşmaya katıldı
  -- 'closed' : kapatıldı
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'active', 'closed')),

  -- Konuşmanın başladığı sayfa — operatöre bağlam verir
  page_url TEXT,
  user_agent TEXT,

  assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  assigned_name TEXT,

  last_message_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  -- Okundu bilgisi: bu zamandan sonraki karşı taraf mesajları "okunmamış"
  visitor_read_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  agent_read_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  closed_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.chat_messages (
  id BIGSERIAL PRIMARY KEY,
  conversation_id UUID NOT NULL
    REFERENCES public.chat_conversations(id) ON DELETE CASCADE,
  -- 'visitor' | 'agent' | 'system' (otomatik karşılama, kapatma notu vb.)
  sender_role TEXT NOT NULL CHECK (sender_role IN ('visitor', 'agent', 'system')),
  sender_name TEXT,
  sender_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Operatör panosu konuşmaları son mesaja göre sıralar
CREATE INDEX IF NOT EXISTS idx_chat_conversations_recent
  ON public.chat_conversations(status, last_message_at DESC);

-- Mesaj çekme her zaman konuşma + id sırası ile yapılır
CREATE INDEX IF NOT EXISTS idx_chat_messages_conversation
  ON public.chat_messages(conversation_id, id);

-- ============================================================
-- 2) AYARLAR (tek satır)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.chat_settings (
  id INT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  is_enabled BOOLEAN NOT NULL DEFAULT true,

  widget_title TEXT NOT NULL DEFAULT 'Canlı Destek',
  widget_subtitle TEXT NOT NULL DEFAULT 'Genellikle birkaç dakika içinde yanıtlıyoruz',
  welcome_message TEXT NOT NULL DEFAULT 'Merhaba! 👋 Anadolu Hastaneleri Grubu canlı destek hattına hoş geldiniz. Size nasıl yardımcı olabiliriz?',
  -- Mesai dışında gösterilen metin
  offline_message TEXT NOT NULL DEFAULT 'Şu anda çevrimiçi değiliz. Mesajınızı bırakın, mesai saatlerinde size dönüş yapalım.',
  agent_display_name TEXT NOT NULL DEFAULT 'Hasta Danışmanı',
  agent_avatar_url TEXT,

  -- Ön form: hangi alanlar zorunlu olsun
  require_name BOOLEAN NOT NULL DEFAULT true,
  require_phone BOOLEAN NOT NULL DEFAULT true,
  require_email BOOLEAN NOT NULL DEFAULT false,

  -- Çalışma saatleri (Europe/Istanbul). online_days: 1=Pazartesi ... 7=Pazar
  online_days INT[] NOT NULL DEFAULT '{1,2,3,4,5,6}',
  online_start TIME NOT NULL DEFAULT '08:00',
  online_end TIME NOT NULL DEFAULT '20:00',

  -- Çevrimdışıyken widget'ta gösterilecek WhatsApp alternatifi (yalnızca rakam)
  whatsapp_fallback_number TEXT,

  -- Ziyaretçiye tek tıkla sorulabilecek hazır sorular: ["Randevu almak istiyorum", ...]
  quick_replies JSONB NOT NULL DEFAULT '["Randevu almak istiyorum","Bölümleriniz hakkında bilgi almak istiyorum","Anlaşmalı kurumlarınız neler?"]'::jsonb,

  -- KVKK aydınlatma onayı metni; boş bırakılırsa onay kutusu gösterilmez
  consent_text TEXT DEFAULT 'Paylaştığım bilgilerin destek talebimin karşılanması amacıyla işlenmesini kabul ediyorum.',

  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO public.chat_settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 3) RLS — varsayılan: anon'a kapalı
-- ============================================================

ALTER TABLE public.chat_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_settings ENABLE ROW LEVEL SECURITY;

-- Giriş yapmış kullanıcının admin olup olmadığı. profiles tablosunu
-- okurken kendi RLS'ine takılmamak için SECURITY DEFINER.
CREATE OR REPLACE FUNCTION public.chat_is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid()
      AND p.role IN ('admin', 'super_admin')
  );
$$;

-- --- Konuşmalar: yalnızca admin ---
DROP POLICY IF EXISTS "Admins manage chat conversations" ON public.chat_conversations;
CREATE POLICY "Admins manage chat conversations" ON public.chat_conversations
  FOR ALL TO authenticated
  USING (public.chat_is_admin())
  WITH CHECK (public.chat_is_admin());

-- --- Mesajlar: yalnızca admin ---
DROP POLICY IF EXISTS "Admins manage chat messages" ON public.chat_messages;
CREATE POLICY "Admins manage chat messages" ON public.chat_messages
  FOR ALL TO authenticated
  USING (public.chat_is_admin())
  WITH CHECK (public.chat_is_admin());

-- --- Ayarlar: herkes okuyabilir (widget'ın çalışması için), admin yazar ---
DROP POLICY IF EXISTS "Anyone can read chat settings" ON public.chat_settings;
CREATE POLICY "Anyone can read chat settings" ON public.chat_settings
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins update chat settings" ON public.chat_settings;
CREATE POLICY "Admins update chat settings" ON public.chat_settings
  FOR UPDATE TO authenticated
  USING (public.chat_is_admin())
  WITH CHECK (public.chat_is_admin());

-- anon rolü tablolara doğrudan dokunamaz; her şey RPC üzerinden.
REVOKE ALL ON public.chat_conversations FROM anon;
REVOKE ALL ON public.chat_messages FROM anon;
GRANT SELECT ON public.chat_settings TO anon;

-- ============================================================
-- 4) ZİYARETÇİ RPC'LERİ (SECURITY DEFINER, token doğrulamalı)
-- ============================================================

-- Girdi sınırları: kötü niyetli/otomatik istekleri sınırlar.
-- Mesaj uzunluğu ve konuşma başına mesaj adedi tavanı.
CREATE OR REPLACE FUNCTION public.chat_assert_access(
  p_conversation_id UUID,
  p_token UUID
)
RETURNS public.chat_conversations
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  conv public.chat_conversations;
BEGIN
  SELECT * INTO conv
  FROM public.chat_conversations
  WHERE id = p_conversation_id AND access_token = p_token;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Konuşma bulunamadı veya erişim anahtarı geçersiz.'
      USING ERRCODE = '42501';
  END IF;

  RETURN conv;
END;
$$;

-- Yeni konuşma başlatır ve ilk mesajı yazar.
-- Dönen access_token ziyaretçinin tarayıcısında saklanır.
CREATE OR REPLACE FUNCTION public.chat_start_conversation(
  p_name TEXT,
  p_phone TEXT,
  p_email TEXT,
  p_subject TEXT,
  p_hospital_name TEXT,
  p_page_url TEXT,
  p_user_agent TEXT,
  p_message TEXT
)
RETURNS TABLE (conversation_id UUID, access_token UUID)
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_id UUID;
  new_token UUID;
  settings public.chat_settings;
BEGIN
  IF p_message IS NULL OR btrim(p_message) = '' THEN
    RAISE EXCEPTION 'Mesaj boş olamaz.' USING ERRCODE = '22023';
  END IF;

  IF length(p_message) > 4000 THEN
    RAISE EXCEPTION 'Mesaj çok uzun (en fazla 4000 karakter).' USING ERRCODE = '22023';
  END IF;

  SELECT * INTO settings FROM public.chat_settings WHERE id = 1;

  IF settings.is_enabled IS NOT TRUE THEN
    RAISE EXCEPTION 'Canlı destek şu anda kapalı.' USING ERRCODE = '42501';
  END IF;

  INSERT INTO public.chat_conversations (
    visitor_name, visitor_phone, visitor_email, subject,
    hospital_name, page_url, user_agent
  ) VALUES (
    NULLIF(btrim(p_name), ''),
    NULLIF(btrim(p_phone), ''),
    NULLIF(btrim(p_email), ''),
    NULLIF(btrim(p_subject), ''),
    NULLIF(btrim(p_hospital_name), ''),
    left(COALESCE(p_page_url, ''), 500),
    left(COALESCE(p_user_agent, ''), 500)
  )
  RETURNING id, chat_conversations.access_token INTO new_id, new_token;

  -- Karşılama mesajı transkriptin parçası olsun ki operatör de görsün
  IF COALESCE(btrim(settings.welcome_message), '') <> '' THEN
    INSERT INTO public.chat_messages (conversation_id, sender_role, sender_name, content)
    VALUES (new_id, 'system', settings.agent_display_name, settings.welcome_message);
  END IF;

  INSERT INTO public.chat_messages (conversation_id, sender_role, sender_name, content)
  VALUES (new_id, 'visitor', NULLIF(btrim(p_name), ''), btrim(p_message));

  UPDATE public.chat_conversations
  SET last_message_at = now()
  WHERE id = new_id;

  RETURN QUERY SELECT new_id, new_token;
END;
$$;

-- Ziyaretçinin sonraki mesajları
CREATE OR REPLACE FUNCTION public.chat_post_visitor_message(
  p_conversation_id UUID,
  p_token UUID,
  p_content TEXT
)
RETURNS BIGINT
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  conv public.chat_conversations;
  msg_count INT;
  new_msg_id BIGINT;
BEGIN
  conv := public.chat_assert_access(p_conversation_id, p_token);

  IF conv.status = 'closed' THEN
    RAISE EXCEPTION 'Bu görüşme kapatıldı.' USING ERRCODE = '42501';
  END IF;

  IF p_content IS NULL OR btrim(p_content) = '' THEN
    RAISE EXCEPTION 'Mesaj boş olamaz.' USING ERRCODE = '22023';
  END IF;

  IF length(p_content) > 4000 THEN
    RAISE EXCEPTION 'Mesaj çok uzun (en fazla 4000 karakter).' USING ERRCODE = '22023';
  END IF;

  -- Tek konuşmanın sınırsız büyümesini engelle
  SELECT count(*) INTO msg_count
  FROM public.chat_messages WHERE conversation_id = p_conversation_id;

  IF msg_count > 500 THEN
    RAISE EXCEPTION 'Bu görüşmede mesaj sınırına ulaşıldı.' USING ERRCODE = '42501';
  END IF;

  INSERT INTO public.chat_messages (conversation_id, sender_role, sender_name, content)
  VALUES (p_conversation_id, 'visitor', conv.visitor_name, btrim(p_content))
  RETURNING id INTO new_msg_id;

  UPDATE public.chat_conversations
  SET last_message_at = now(),
      visitor_read_at = now()
  WHERE id = p_conversation_id;

  RETURN new_msg_id;
END;
$$;

-- Ziyaretçi tarafı polling: yalnızca p_after_id'den sonraki mesajları döner
CREATE OR REPLACE FUNCTION public.chat_fetch_messages(
  p_conversation_id UUID,
  p_token UUID,
  p_after_id BIGINT DEFAULT 0
)
RETURNS TABLE (
  id BIGINT,
  sender_role TEXT,
  sender_name TEXT,
  content TEXT,
  created_at TIMESTAMPTZ,
  conversation_status TEXT
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  conv public.chat_conversations;
BEGIN
  conv := public.chat_assert_access(p_conversation_id, p_token);

  RETURN QUERY
  SELECT m.id, m.sender_role, m.sender_name, m.content, m.created_at, conv.status
  FROM public.chat_messages m
  WHERE m.conversation_id = p_conversation_id
    AND m.id > COALESCE(p_after_id, 0)
  ORDER BY m.id
  LIMIT 200;
END;
$$;

-- Ziyaretçi sohbeti okudu olarak işaretler (operatör panosundaki gösterge)
CREATE OR REPLACE FUNCTION public.chat_mark_visitor_read(
  p_conversation_id UUID,
  p_token UUID
)
RETURNS VOID
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM public.chat_assert_access(p_conversation_id, p_token);
  UPDATE public.chat_conversations
  SET visitor_read_at = now()
  WHERE id = p_conversation_id;
END;
$$;

-- Ziyaretçi görüşmeyi kendisi kapatır
CREATE OR REPLACE FUNCTION public.chat_close_by_visitor(
  p_conversation_id UUID,
  p_token UUID
)
RETURNS VOID
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  conv public.chat_conversations;
BEGIN
  conv := public.chat_assert_access(p_conversation_id, p_token);
  IF conv.status = 'closed' THEN RETURN; END IF;

  UPDATE public.chat_conversations
  SET status = 'closed', closed_at = now(), last_message_at = now()
  WHERE id = p_conversation_id;

  INSERT INTO public.chat_messages (conversation_id, sender_role, content)
  VALUES (p_conversation_id, 'system', 'Görüşme ziyaretçi tarafından sonlandırıldı.');
END;
$$;

-- Yetkiler: bu fonksiyonlar anon'un tek erişim kapısı
REVOKE ALL ON FUNCTION public.chat_assert_access(UUID, UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.chat_start_conversation(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.chat_post_visitor_message(UUID, UUID, TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.chat_fetch_messages(UUID, UUID, BIGINT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.chat_mark_visitor_read(UUID, UUID) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.chat_close_by_visitor(UUID, UUID) TO anon, authenticated;

-- ============================================================
-- 5) OPERATÖR TARAFI YARDIMCILARI
-- ============================================================

-- Operatör mesajı: yazarken konuşmayı da günceller (tek gidiş-dönüş)
CREATE OR REPLACE FUNCTION public.chat_post_agent_message(
  p_conversation_id UUID,
  p_content TEXT,
  p_agent_name TEXT
)
RETURNS BIGINT
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_msg_id BIGINT;
BEGIN
  IF NOT public.chat_is_admin() THEN
    RAISE EXCEPTION 'Yetkisiz.' USING ERRCODE = '42501';
  END IF;

  IF p_content IS NULL OR btrim(p_content) = '' THEN
    RAISE EXCEPTION 'Mesaj boş olamaz.' USING ERRCODE = '22023';
  END IF;

  INSERT INTO public.chat_messages
    (conversation_id, sender_role, sender_name, sender_id, content)
  VALUES
    (p_conversation_id, 'agent', p_agent_name, auth.uid(), btrim(p_content))
  RETURNING id INTO new_msg_id;

  UPDATE public.chat_conversations
  SET last_message_at = now(),
      agent_read_at = now(),
      -- İlk operatör yanıtı konuşmayı üstlenir
      status = CASE WHEN status = 'open' THEN 'active' ELSE status END,
      assigned_to = COALESCE(assigned_to, auth.uid()),
      assigned_name = COALESCE(assigned_name, p_agent_name)
  WHERE id = p_conversation_id;

  RETURN new_msg_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.chat_post_agent_message(UUID, TEXT, TEXT) TO authenticated;

-- ============================================================
-- 6) REALTIME (yalnızca operatör panosu kullanır)
-- ============================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public' AND tablename = 'chat_messages'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public' AND tablename = 'chat_conversations'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_conversations;
  END IF;
END $$;

-- ============================================================
-- KONTROL
-- ============================================================
SELECT 'chat_settings' AS tablo, count(*) AS kayit FROM public.chat_settings
UNION ALL
SELECT 'chat_conversations', count(*) FROM public.chat_conversations
UNION ALL
SELECT 'chat_messages', count(*) FROM public.chat_messages;
