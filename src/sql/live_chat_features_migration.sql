-- ============================================================
-- Anadolu Hastaneleri Grubu - Canlı Destek: Ek Özellikler
--
-- SIRA ÖNEMLİ. Bu dosya şu ikisinden SONRA çalıştırılmalıdır:
--   1) live_chat_migration.sql
--   2) live_chat_tags_stats_migration.sql
--
-- Eklenenler:
--   * Hazır yanıtlar (operatör kısayolları)
--   * "Yazıyor..." göstergesi
--   * Görüşme sonrası memnuniyet anketi (1-5)
--   * Dosya eki desteği
--   * İstatistiklere memnuniyet metrikleri
--
-- Idempotent: birden fazla kez çalıştırılabilir.
-- ============================================================

-- ============================================================
-- 1) HAZIR YANITLAR
--
-- Operatör "/" yazınca açılan liste. Kısayol yazıp Tab/Enter ile
-- metni komposere basar.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.chat_canned_responses (
  id SERIAL PRIMARY KEY,
  -- "/" olmadan yazılır: "randevu" -> operatör "/randevu" ile çağırır
  shortcut TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  -- Kaç kez kullanıldı — hangi metinlerin işe yaradığını gösterir
  use_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.chat_canned_responses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins manage canned responses" ON public.chat_canned_responses;
CREATE POLICY "Admins manage canned responses" ON public.chat_canned_responses
  FOR ALL TO authenticated
  USING (public.chat_is_admin())
  WITH CHECK (public.chat_is_admin());

REVOKE ALL ON public.chat_canned_responses FROM anon;

INSERT INTO public.chat_canned_responses (shortcut, title, content, category, display_order) VALUES
  ('selam', 'Karşılama',
   'Merhaba, Anadolu Hastaneleri Grubu canlı destek hattına hoş geldiniz. Size nasıl yardımcı olabilirim?',
   'Genel', 10),
  ('bekle', 'Kısa bekletme',
   'Bilgiyi kontrol ediyorum, birkaç dakika içinde size dönüş yapacağım. Hattan ayrılmayın lütfen.',
   'Genel', 20),
  ('randevu', 'Randevu yönlendirme',
   E'Randevunuzu 444 50 58 numaralı çağrı merkezimizden ya da web sitemizdeki "Randevu ve E-Sonuç" bölümünden oluşturabilirsiniz.\nDilerseniz bilgilerinizi alıp sizi arayabiliriz — hangisini tercih edersiniz?',
   'Randevu', 30),
  ('bolum', 'Bölüm bilgisi',
   'Hangi şubemiz ve hangi bölüm için bilgi almak istediğinizi paylaşabilir misiniz? Bölümlerimizin tam listesi web sitemizin "Bölümlerimiz" sayfasında yer alıyor.',
   'Randevu', 40),
  ('sgk', 'SGK / anlaşmalı kurum',
   'Anlaşmalı kurumlarımızın güncel listesi web sitemizin "Anlaşmalı Kurumlar" sayfasında yer alıyor. Sigortanızın adını paylaşırsanız kapsam durumunu sizin için kontrol edebilirim.',
   'Ödeme', 50),
  ('fiyat', 'Fiyat bilgisi',
   'İşlem ücretleri hastanın durumuna ve hekimin planlayacağı tedaviye göre değiştiği için net fiyatı muayene sonrasında paylaşabiliyoruz. Sizi ilgili birimimize yönlendireyim mi?',
   'Ödeme', 60),
  ('ikinci', 'İkinci görüş',
   E'İkinci görüş başvurunuzu web sitemizdeki "İkinci Görüş" formundan oluşturabilirsiniz.\nMevcut tetkik ve raporlarınızı forma eklerseniz hekimlerimiz daha hızlı değerlendirir.',
   'Klinik', 70),
  ('kapanis', 'Görüşme kapanışı',
   'Başka bir konuda yardımcı olabilir miyim? Değilse görüşmeyi sonlandırıyorum. Anadolu Hastaneleri Grubu''nu tercih ettiğiniz için teşekkür ederiz, sağlıklı günler dileriz.',
   'Genel', 80)
ON CONFLICT (shortcut) DO NOTHING;

-- Kullanım sayacı — operatör hangi metni kullandığını raporlayabilsin
CREATE OR REPLACE FUNCTION public.chat_bump_canned_use(p_id INTEGER)
RETURNS VOID
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.chat_is_admin() THEN
    RAISE EXCEPTION 'Yetkisiz.' USING ERRCODE = '42501';
  END IF;
  UPDATE public.chat_canned_responses
  SET use_count = use_count + 1
  WHERE id = p_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.chat_bump_canned_use(INTEGER) TO authenticated;

-- ============================================================
-- 2) "YAZIYOR..." GÖSTERGESİ
--
-- Ayrı tabloda tutulur ve BİLEREK Realtime yayınına eklenmez:
-- her tuş vuruşunda chat_conversations güncellenseydi, operatör
-- panosu saniyede birkaç kez tüm listeyi yeniden çekerdi.
-- Ziyaretçi bilgiyi zaten chat_poll ile, operatör de seçili
-- görüşme için kısa aralıklı sorgu ile alır.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.chat_typing (
  conversation_id UUID PRIMARY KEY
    REFERENCES public.chat_conversations(id) ON DELETE CASCADE,
  visitor_at TIMESTAMPTZ,
  agent_at TIMESTAMPTZ
);

ALTER TABLE public.chat_typing ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins manage typing" ON public.chat_typing;
CREATE POLICY "Admins manage typing" ON public.chat_typing
  FOR ALL TO authenticated
  USING (public.chat_is_admin())
  WITH CHECK (public.chat_is_admin());

REVOKE ALL ON public.chat_typing FROM anon;

-- Ziyaretçi yazıyor (token doğrulamalı)
CREATE OR REPLACE FUNCTION public.chat_set_visitor_typing(
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

  INSERT INTO public.chat_typing (conversation_id, visitor_at)
  VALUES (p_conversation_id, now())
  ON CONFLICT (conversation_id)
  DO UPDATE SET visitor_at = now();
END;
$$;

GRANT EXECUTE ON FUNCTION public.chat_set_visitor_typing(UUID, UUID) TO anon, authenticated;

-- Operatör yazıyor
CREATE OR REPLACE FUNCTION public.chat_set_agent_typing(p_conversation_id UUID)
RETURNS VOID
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.chat_is_admin() THEN
    RAISE EXCEPTION 'Yetkisiz.' USING ERRCODE = '42501';
  END IF;

  INSERT INTO public.chat_typing (conversation_id, agent_at)
  VALUES (p_conversation_id, now())
  ON CONFLICT (conversation_id)
  DO UPDATE SET agent_at = now();
END;
$$;

GRANT EXECUTE ON FUNCTION public.chat_set_agent_typing(UUID) TO authenticated;

-- ============================================================
-- 3) MEMNUNİYET ANKETİ
-- ============================================================

ALTER TABLE public.chat_conversations
  ADD COLUMN IF NOT EXISTS rating INTEGER
    CHECK (rating IS NULL OR (rating BETWEEN 1 AND 5)),
  ADD COLUMN IF NOT EXISTS rating_comment TEXT,
  ADD COLUMN IF NOT EXISTS rated_at TIMESTAMPTZ;

CREATE OR REPLACE FUNCTION public.chat_rate_conversation(
  p_conversation_id UUID,
  p_token UUID,
  p_rating INTEGER,
  p_comment TEXT DEFAULT NULL
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

  IF p_rating IS NULL OR p_rating < 1 OR p_rating > 5 THEN
    RAISE EXCEPTION 'Puan 1 ile 5 arasında olmalı.' USING ERRCODE = '22023';
  END IF;

  -- Bir görüşme yalnızca bir kez puanlanır
  IF conv.rated_at IS NOT NULL THEN
    RAISE EXCEPTION 'Bu görüşme zaten değerlendirilmiş.' USING ERRCODE = '42501';
  END IF;

  UPDATE public.chat_conversations
  SET rating = p_rating,
      rating_comment = NULLIF(btrim(COALESCE(p_comment, '')), ''),
      rated_at = now()
  WHERE id = p_conversation_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.chat_rate_conversation(UUID, UUID, INTEGER, TEXT)
  TO anon, authenticated;

-- ============================================================
-- 4) DOSYA EKİ
--
-- Depolama tarafı için bkz. CHAT_SETUP.md — "chat-attachments"
-- bucket'ı elle oluşturulmalı. Varsayılan olarak KAPALIDIR;
-- açmadan önce dokümandaki gizlilik notunu okuyun.
-- ============================================================

ALTER TABLE public.chat_messages
  ADD COLUMN IF NOT EXISTS attachment_url TEXT,
  ADD COLUMN IF NOT EXISTS attachment_name TEXT,
  ADD COLUMN IF NOT EXISTS attachment_type TEXT,
  ADD COLUMN IF NOT EXISTS attachment_size INTEGER;

ALTER TABLE public.chat_settings
  ADD COLUMN IF NOT EXISTS allow_attachments BOOLEAN NOT NULL DEFAULT false,
  -- Ziyaretçi başına tek dosya boyutu tavanı (MB)
  ADD COLUMN IF NOT EXISTS max_attachment_mb INTEGER NOT NULL DEFAULT 5;

-- Eski 3 parametreli sürüm kaldırılıp ek alanları olan sürüm konur.
-- Varsayılan değerler sayesinde yalnızca 3 argümanla çağırmak da çalışır.
DROP FUNCTION IF EXISTS public.chat_post_visitor_message(UUID, UUID, TEXT);

CREATE OR REPLACE FUNCTION public.chat_post_visitor_message(
  p_conversation_id UUID,
  p_token UUID,
  p_content TEXT,
  p_attachment_url TEXT DEFAULT NULL,
  p_attachment_name TEXT DEFAULT NULL,
  p_attachment_type TEXT DEFAULT NULL,
  p_attachment_size INTEGER DEFAULT NULL
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
  body TEXT;
BEGIN
  conv := public.chat_assert_access(p_conversation_id, p_token);

  IF conv.status = 'closed' THEN
    RAISE EXCEPTION 'Bu görüşme kapatıldı.' USING ERRCODE = '42501';
  END IF;

  body := btrim(COALESCE(p_content, ''));

  -- Dosya varsa metin boş olabilir
  IF body = '' AND p_attachment_url IS NULL THEN
    RAISE EXCEPTION 'Mesaj boş olamaz.' USING ERRCODE = '22023';
  END IF;

  IF length(body) > 4000 THEN
    RAISE EXCEPTION 'Mesaj çok uzun (en fazla 4000 karakter).' USING ERRCODE = '22023';
  END IF;

  SELECT count(*) INTO msg_count
  FROM public.chat_messages WHERE conversation_id = p_conversation_id;

  IF msg_count > 500 THEN
    RAISE EXCEPTION 'Bu görüşmede mesaj sınırına ulaşıldı.' USING ERRCODE = '42501';
  END IF;

  INSERT INTO public.chat_messages (
    conversation_id, sender_role, sender_name, content,
    attachment_url, attachment_name, attachment_type, attachment_size
  )
  VALUES (
    p_conversation_id, 'visitor', conv.visitor_name, body,
    p_attachment_url, p_attachment_name, p_attachment_type, p_attachment_size
  )
  RETURNING id INTO new_msg_id;

  UPDATE public.chat_conversations
  SET last_message_at = now(), visitor_read_at = now()
  WHERE id = p_conversation_id;

  -- Yazıyor göstergesini düşür
  UPDATE public.chat_typing SET visitor_at = NULL
  WHERE conversation_id = p_conversation_id;

  RETURN new_msg_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.chat_post_visitor_message(
  UUID, UUID, TEXT, TEXT, TEXT, TEXT, INTEGER
) TO anon, authenticated;

DROP FUNCTION IF EXISTS public.chat_post_agent_message(UUID, TEXT, TEXT);

CREATE OR REPLACE FUNCTION public.chat_post_agent_message(
  p_conversation_id UUID,
  p_content TEXT,
  p_agent_name TEXT,
  p_attachment_url TEXT DEFAULT NULL,
  p_attachment_name TEXT DEFAULT NULL,
  p_attachment_type TEXT DEFAULT NULL,
  p_attachment_size INTEGER DEFAULT NULL
)
RETURNS BIGINT
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_msg_id BIGINT;
  body TEXT;
BEGIN
  IF NOT public.chat_is_admin() THEN
    RAISE EXCEPTION 'Yetkisiz.' USING ERRCODE = '42501';
  END IF;

  body := btrim(COALESCE(p_content, ''));

  IF body = '' AND p_attachment_url IS NULL THEN
    RAISE EXCEPTION 'Mesaj boş olamaz.' USING ERRCODE = '22023';
  END IF;

  INSERT INTO public.chat_messages (
    conversation_id, sender_role, sender_name, sender_id, content,
    attachment_url, attachment_name, attachment_type, attachment_size
  )
  VALUES (
    p_conversation_id, 'agent', p_agent_name, auth.uid(), body,
    p_attachment_url, p_attachment_name, p_attachment_type, p_attachment_size
  )
  RETURNING id INTO new_msg_id;

  UPDATE public.chat_conversations
  SET last_message_at = now(),
      agent_read_at = now(),
      status = CASE WHEN status = 'open' THEN 'active' ELSE status END,
      assigned_to = COALESCE(assigned_to, auth.uid()),
      assigned_name = COALESCE(assigned_name, p_agent_name)
  WHERE id = p_conversation_id;

  UPDATE public.chat_typing SET agent_at = NULL
  WHERE conversation_id = p_conversation_id;

  RETURN new_msg_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.chat_post_agent_message(
  UUID, TEXT, TEXT, TEXT, TEXT, TEXT, INTEGER
) TO authenticated;

-- ============================================================
-- 5) ZİYARETÇİ POLL RPC'Sİ
--
-- Tek çağrıda: yeni mesajlar + görüşme durumu + operatör yazıyor mu
-- + puanlanmış mı. Eskiden durum yalnızca yeni mesaj varsa dönüyordu;
-- "yazıyor" göstergesi için durumun her turda gelmesi gerekiyor.
-- ============================================================

CREATE OR REPLACE FUNCTION public.chat_poll(
  p_conversation_id UUID,
  p_token UUID,
  p_after_id BIGINT DEFAULT 0
)
RETURNS JSONB
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  conv public.chat_conversations;
  agent_typing BOOLEAN;
BEGIN
  conv := public.chat_assert_access(p_conversation_id, p_token);

  -- Son 8 saniye içinde yazma sinyali geldiyse "yazıyor" say
  SELECT COALESCE(t.agent_at > now() - INTERVAL '8 seconds', false)
  INTO agent_typing
  FROM public.chat_typing t
  WHERE t.conversation_id = p_conversation_id;

  RETURN jsonb_build_object(
    'status', conv.status,
    'agent_typing', COALESCE(agent_typing, false),
    'rated', conv.rated_at IS NOT NULL,
    'messages', COALESCE((
      SELECT jsonb_agg(
        jsonb_build_object(
          'id', m.id,
          'sender_role', m.sender_role,
          'sender_name', m.sender_name,
          'content', m.content,
          'created_at', m.created_at,
          'attachment_url', m.attachment_url,
          'attachment_name', m.attachment_name,
          'attachment_type', m.attachment_type,
          'attachment_size', m.attachment_size
        ) ORDER BY m.id
      )
      FROM (
        SELECT * FROM public.chat_messages
        WHERE conversation_id = p_conversation_id
          AND id > COALESCE(p_after_id, 0)
        ORDER BY id
        LIMIT 200
      ) m
    ), '[]'::JSONB)
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.chat_poll(UUID, UUID, BIGINT) TO anon, authenticated;

-- Operatörün seçili görüşme için "ziyaretçi yazıyor" sorgusu
CREATE OR REPLACE FUNCTION public.chat_visitor_typing(p_conversation_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  typing BOOLEAN;
BEGIN
  IF NOT public.chat_is_admin() THEN
    RAISE EXCEPTION 'Yetkisiz.' USING ERRCODE = '42501';
  END IF;

  SELECT COALESCE(t.visitor_at > now() - INTERVAL '8 seconds', false)
  INTO typing
  FROM public.chat_typing t
  WHERE t.conversation_id = p_conversation_id;

  RETURN COALESCE(typing, false);
END;
$$;

GRANT EXECUTE ON FUNCTION public.chat_visitor_typing(UUID) TO authenticated;

-- ============================================================
-- 6) İSTATİSTİKLERE MEMNUNİYET EKLE
-- ============================================================

CREATE OR REPLACE FUNCTION public.chat_stats(p_days INTEGER DEFAULT 30)
RETURNS JSONB
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  since TIMESTAMPTZ;
  result JSONB;
BEGIN
  IF NOT public.chat_is_admin() THEN
    RAISE EXCEPTION 'Yetkisiz.' USING ERRCODE = '42501';
  END IF;

  since := now() - (LEAST(GREATEST(COALESCE(p_days, 30), 1), 365) || ' days')::INTERVAL;

  WITH conv AS (
    SELECT * FROM public.chat_conversations WHERE created_at >= since
  ),
  first_response AS (
    SELECT c.id, EXTRACT(EPOCH FROM (MIN(m.created_at) - c.created_at)) AS seconds
    FROM conv c
    JOIN public.chat_messages m
      ON m.conversation_id = c.id AND m.sender_role = 'agent'
    GROUP BY c.id, c.created_at
  ),
  msg AS (
    SELECT m.* FROM public.chat_messages m
    JOIN conv c ON c.id = m.conversation_id
  )
  SELECT jsonb_build_object(
    'period_days', LEAST(GREATEST(COALESCE(p_days, 30), 1), 365),

    'totals', jsonb_build_object(
      'conversations', (SELECT count(*) FROM conv),
      'open',          (SELECT count(*) FROM conv WHERE status = 'open'),
      'active',        (SELECT count(*) FROM conv WHERE status = 'active'),
      'closed',        (SELECT count(*) FROM conv WHERE status = 'closed'),
      'messages',      (SELECT count(*) FROM msg WHERE sender_role <> 'system'),
      'unanswered',    (SELECT count(*) FROM conv c
                        WHERE c.status <> 'closed'
                          AND NOT EXISTS (
                            SELECT 1 FROM public.chat_messages m
                            WHERE m.conversation_id = c.id AND m.sender_role = 'agent'
                          )),
      'with_phone',    (SELECT count(*) FROM conv WHERE visitor_phone IS NOT NULL),
      'attachments',   (SELECT count(*) FROM msg WHERE attachment_url IS NOT NULL)
    ),

    'response', jsonb_build_object(
      'answered',            (SELECT count(*) FROM first_response),
      'avg_first_seconds',   (SELECT COALESCE(round(avg(seconds)), 0) FROM first_response),
      'median_first_seconds',(SELECT COALESCE(round(
                                percentile_cont(0.5) WITHIN GROUP (ORDER BY seconds)
                              ), 0) FROM first_response),
      'avg_messages_per_conversation', (
        SELECT COALESCE(round(count(*)::NUMERIC / NULLIF((SELECT count(*) FROM conv), 0), 1), 0)
        FROM msg WHERE sender_role <> 'system'
      )
    ),

    'satisfaction', jsonb_build_object(
      'rated',   (SELECT count(*) FROM conv WHERE rating IS NOT NULL),
      'average', (SELECT COALESCE(round(avg(rating)::NUMERIC, 2), 0) FROM conv WHERE rating IS NOT NULL),
      'breakdown', COALESCE((
        SELECT jsonb_agg(jsonb_build_object('stars', s, 'count', n) ORDER BY s DESC)
        FROM (SELECT rating AS s, count(*) AS n FROM conv WHERE rating IS NOT NULL GROUP BY 1) x
      ), '[]'::JSONB),
      'comments', COALESCE((
        SELECT jsonb_agg(jsonb_build_object(
          'stars', rating, 'comment', rating_comment,
          'name', visitor_name, 'at', rated_at
        ) ORDER BY rated_at DESC)
        FROM (
          SELECT rating, rating_comment, visitor_name, rated_at
          FROM conv WHERE rating_comment IS NOT NULL
          ORDER BY rated_at DESC LIMIT 10
        ) y
      ), '[]'::JSONB)
    ),

    'daily', COALESCE((
      SELECT jsonb_agg(jsonb_build_object('date', d, 'count', n) ORDER BY d)
      FROM (
        SELECT (created_at AT TIME ZONE 'Europe/Istanbul')::DATE AS d, count(*) AS n
        FROM conv GROUP BY 1
      ) x
    ), '[]'::JSONB),

    'hourly', COALESCE((
      SELECT jsonb_agg(jsonb_build_object('hour', h, 'count', n) ORDER BY h)
      FROM (
        SELECT EXTRACT(HOUR FROM created_at AT TIME ZONE 'Europe/Istanbul')::INT AS h,
               count(*) AS n
        FROM conv GROUP BY 1
      ) x
    ), '[]'::JSONB),

    'tags', COALESCE((
      SELECT jsonb_agg(jsonb_build_object('tag', tag, 'count', n) ORDER BY n DESC)
      FROM (SELECT unnest(tags) AS tag, count(*) AS n FROM conv GROUP BY 1) x
    ), '[]'::JSONB),

    'agents', COALESCE((
      SELECT jsonb_agg(jsonb_build_object('name', name, 'messages', n) ORDER BY n DESC)
      FROM (
        SELECT COALESCE(sender_name, 'Bilinmiyor') AS name, count(*) AS n
        FROM msg WHERE sender_role = 'agent' GROUP BY 1
      ) x
    ), '[]'::JSONB),

    'canned', COALESCE((
      SELECT jsonb_agg(jsonb_build_object('title', title, 'count', use_count) ORDER BY use_count DESC)
      FROM (
        SELECT title, use_count FROM public.chat_canned_responses
        WHERE use_count > 0 ORDER BY use_count DESC LIMIT 8
      ) z
    ), '[]'::JSONB)
  ) INTO result;

  RETURN result;
END;
$$;

GRANT EXECUTE ON FUNCTION public.chat_stats(INTEGER) TO authenticated;

-- ============================================================
-- KONTROL
-- ============================================================
SELECT 'hazır yanıt' AS nesne, count(*)::TEXT AS deger FROM public.chat_canned_responses
UNION ALL
SELECT 'etiket', count(*)::TEXT FROM public.chat_tags
UNION ALL
SELECT 'dosya eki açık mı', allow_attachments::TEXT FROM public.chat_settings WHERE id = 1;
