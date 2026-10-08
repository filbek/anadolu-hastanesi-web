-- ============================================================
-- Anadolu Hastaneleri Grubu - Canlı Destek: Çoklu Operatör
--
-- SIRA: diğer tüm canlı destek migration'larından ve
-- rls_hardening_migration.sql'den SONRA çalıştırın.
--
-- Plan: CHAT_MULTI_AGENT_PLAN.md
--
-- Neden ayrı tablo? profiles.role tek değerlidir, oysa biri hem içerik
-- editörü hem hasta danışmanı olabilir. Ayrıca operatöre özel alanlar
-- (görüşme tavanı, çevrimiçi durumu, ziyaretçiye görünen ad) profiles'a
-- ait değildir.
--
-- Idempotent: birden fazla kez çalıştırılabilir.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.chat_agents (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  -- Ziyaretçiye görünen ad. "Dr. Ayşe Yılmaz" değil "Hasta Danışmanı Ayşe"
  -- yazdırmak isteyebilirsiniz; bu yüzden profiles.full_name'den ayrı.
  display_name TEXT NOT NULL,
  avatar_url TEXT,
  -- 'agent'      : kendi + havuzdaki görüşmeleri görür
  -- 'supervisor' : hepsini görür, devredebilir, tüm raporu alır
  agent_role TEXT NOT NULL DEFAULT 'agent'
    CHECK (agent_role IN ('agent', 'supervisor')),
  -- Otomatik atamada aynı anda en fazla kaç açık görüşme verilir
  max_concurrent INTEGER NOT NULL DEFAULT 5,
  -- 'online' | 'away' | 'offline' — operatörün kendi seçimi
  status TEXT NOT NULL DEFAULT 'offline'
    CHECK (status IN ('online', 'away', 'offline')),
  -- Panel açıkken 30 sn'de bir tazelenir; 90 sn'den eskiyse offline sayılır
  last_seen_at TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Realtime yayınına BİLEREK eklenmiyor: heartbeat 30 sn'de bir yazıyor,
-- yayına girse her operatöre saniyede bir olay giderdi.

-- ============================================================
-- 1) YETKİ FONKSİYONLARI
-- ============================================================

/*
 * Canlı desteğe erişebilir mi?
 *
 * Geriye dönük uyum: chat_agents BOŞSA eski davranışa düşer (tüm adminler
 * operatördür). Böylece bu migration çalıştığı an hiçbir şey bozulmaz;
 * ekip tabloyu doldurdukça sistem kademeli olarak sıkılaşır.
 */
CREATE OR REPLACE FUNCTION public.chat_can_serve()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    CASE
      WHEN NOT EXISTS (SELECT 1 FROM public.chat_agents WHERE is_active)
        THEN public.is_admin()
      ELSE
        EXISTS (
          SELECT 1 FROM public.chat_agents a
          WHERE a.user_id = auth.uid() AND a.is_active
        )
        OR EXISTS (
          SELECT 1 FROM public.profiles p
          WHERE p.id = auth.uid() AND p.role = 'super_admin'
        )
    END;
$$;

CREATE OR REPLACE FUNCTION public.chat_is_supervisor()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    EXISTS (
      SELECT 1 FROM public.chat_agents a
      WHERE a.user_id = auth.uid() AND a.is_active AND a.agent_role = 'supervisor'
    )
    OR EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'super_admin'
    )
    OR NOT EXISTS (SELECT 1 FROM public.chat_agents WHERE is_active);
$$;

GRANT EXECUTE ON FUNCTION public.chat_can_serve() TO authenticated;
GRANT EXECUTE ON FUNCTION public.chat_is_supervisor() TO authenticated;

-- ============================================================
-- 2) chat_agents RLS
-- ============================================================

ALTER TABLE public.chat_agents ENABLE ROW LEVEL SECURITY;

-- Operatörler birbirini görebilmeli (devretme listesi, vardiya görünümü)
DROP POLICY IF EXISTS "Agents read team" ON public.chat_agents;
CREATE POLICY "Agents read team" ON public.chat_agents
  FOR SELECT TO authenticated
  USING (public.chat_can_serve());

-- Ekibi yalnızca supervisor/admin düzenler
DROP POLICY IF EXISTS "Supervisors manage team" ON public.chat_agents;
CREATE POLICY "Supervisors manage team" ON public.chat_agents
  FOR ALL TO authenticated
  USING (public.is_admin() OR public.chat_is_supervisor())
  WITH CHECK (public.is_admin() OR public.chat_is_supervisor());

REVOKE ALL ON public.chat_agents FROM anon;

-- ============================================================
-- 3) GÖRÜŞME ERİŞİMİNİ DARALT
--
-- supervisor -> hepsi
-- agent      -> kendine atanan + havuz (atanmamış) + 30 günden yeni kapalılar
--
-- 30 gün sınırı: eski transkriptler hasta verisidir, günlük işte
-- gerekmiyor. Supervisor hepsini görmeye devam eder.
-- ============================================================

CREATE OR REPLACE FUNCTION public.chat_can_view_conversation(
  p_assigned_to UUID,
  p_created_at TIMESTAMPTZ,
  p_status TEXT
)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
AS $$
  SELECT
    public.chat_is_supervisor()
    OR (
      public.chat_can_serve()
      AND (
        p_assigned_to = auth.uid()
        OR p_assigned_to IS NULL
        OR (p_status <> 'closed')
        OR p_created_at > now() - INTERVAL '30 days'
      )
    );
$$;

GRANT EXECUTE ON FUNCTION public.chat_can_view_conversation(UUID, TIMESTAMPTZ, TEXT)
  TO authenticated;

DROP POLICY IF EXISTS "Admins manage chat conversations" ON public.chat_conversations;

DROP POLICY IF EXISTS "Agents read conversations" ON public.chat_conversations;
CREATE POLICY "Agents read conversations" ON public.chat_conversations
  FOR SELECT TO authenticated
  USING (public.chat_can_view_conversation(assigned_to, created_at, status));

DROP POLICY IF EXISTS "Agents update conversations" ON public.chat_conversations;
CREATE POLICY "Agents update conversations" ON public.chat_conversations
  FOR UPDATE TO authenticated
  USING (public.chat_can_view_conversation(assigned_to, created_at, status))
  WITH CHECK (public.chat_can_serve());

DROP POLICY IF EXISTS "Supervisors delete conversations" ON public.chat_conversations;
CREATE POLICY "Supervisors delete conversations" ON public.chat_conversations
  FOR DELETE TO authenticated
  USING (public.chat_is_supervisor());

-- Mesajlar konuşmanın görünürlüğünü izler
DROP POLICY IF EXISTS "Admins manage chat messages" ON public.chat_messages;

DROP POLICY IF EXISTS "Agents read messages" ON public.chat_messages;
CREATE POLICY "Agents read messages" ON public.chat_messages
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.chat_conversations c
    WHERE c.id = conversation_id
      AND public.chat_can_view_conversation(c.assigned_to, c.created_at, c.status)
  ));

DROP POLICY IF EXISTS "Agents write messages" ON public.chat_messages;
CREATE POLICY "Agents write messages" ON public.chat_messages
  FOR INSERT TO authenticated
  WITH CHECK (public.chat_can_serve());

-- Etiket / hazır yanıt / yazıyor tablolarını operatörlere aç
DROP POLICY IF EXISTS "Admins manage chat tags" ON public.chat_tags;
DROP POLICY IF EXISTS "Agents read tags" ON public.chat_tags;
CREATE POLICY "Agents read tags" ON public.chat_tags
  FOR SELECT TO authenticated USING (public.chat_can_serve());
DROP POLICY IF EXISTS "Supervisors manage tags" ON public.chat_tags;
CREATE POLICY "Supervisors manage tags" ON public.chat_tags
  FOR ALL TO authenticated
  USING (public.is_admin() OR public.chat_is_supervisor())
  WITH CHECK (public.is_admin() OR public.chat_is_supervisor());

DROP POLICY IF EXISTS "Admins manage canned responses" ON public.chat_canned_responses;
DROP POLICY IF EXISTS "Agents read canned" ON public.chat_canned_responses;
CREATE POLICY "Agents read canned" ON public.chat_canned_responses
  FOR SELECT TO authenticated USING (public.chat_can_serve());
DROP POLICY IF EXISTS "Supervisors manage canned" ON public.chat_canned_responses;
CREATE POLICY "Supervisors manage canned" ON public.chat_canned_responses
  FOR ALL TO authenticated
  USING (public.is_admin() OR public.chat_is_supervisor())
  WITH CHECK (public.is_admin() OR public.chat_is_supervisor());

DROP POLICY IF EXISTS "Admins manage typing" ON public.chat_typing;
CREATE POLICY "Agents manage typing" ON public.chat_typing
  FOR ALL TO authenticated
  USING (public.chat_can_serve()) WITH CHECK (public.chat_can_serve());

-- Operatörün mesaj yazma RPC'si artık chat_can_serve() ile çalışsın
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
  who TEXT;
BEGIN
  IF NOT public.chat_can_serve() THEN
    RAISE EXCEPTION 'Yetkisiz.' USING ERRCODE = '42501';
  END IF;

  body := btrim(COALESCE(p_content, ''));

  IF body = '' AND p_attachment_url IS NULL THEN
    RAISE EXCEPTION 'Mesaj boş olamaz.' USING ERRCODE = '22023';
  END IF;

  -- Ziyaretçiye görünen ad her zaman ekip kaydından gelsin
  SELECT display_name INTO who FROM public.chat_agents WHERE user_id = auth.uid();
  who := COALESCE(who, p_agent_name);

  INSERT INTO public.chat_messages (
    conversation_id, sender_role, sender_name, sender_id, content,
    attachment_url, attachment_name, attachment_type, attachment_size
  )
  VALUES (
    p_conversation_id, 'agent', who, auth.uid(), body,
    p_attachment_url, p_attachment_name, p_attachment_type, p_attachment_size
  )
  RETURNING id INTO new_msg_id;

  UPDATE public.chat_conversations
  SET last_message_at = now(),
      agent_read_at = now(),
      status = CASE WHEN status = 'open' THEN 'active' ELSE status END,
      assigned_to = COALESCE(assigned_to, auth.uid()),
      assigned_name = COALESCE(assigned_name, who)
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
-- 4) ÇEVRİMİÇİ DURUMU (heartbeat)
--
-- NOT: Presence WIDGET'A YANSITILMAZ. Çağrı merkezi 7/24 çalışıyor;
-- gece vardiyasında biri paneli kapatmayı unutsa ya da heartbeat bir
-- aksaklıkla dursa widget "çevrimdışı" derdi ve teknik bir arıza
-- doğrudan hasta erişimine dönüşürdü. Presence yalnızca atama ve
-- vardiya görünümü için kullanılır.
-- ============================================================

CREATE OR REPLACE FUNCTION public.chat_agent_heartbeat(p_status TEXT DEFAULT NULL)
RETURNS VOID
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.chat_agents
  SET last_seen_at = now(),
      status = COALESCE(NULLIF(btrim(COALESCE(p_status, '')), ''), status)
  WHERE user_id = auth.uid();
END;
$$;

GRANT EXECUTE ON FUNCTION public.chat_agent_heartbeat(TEXT) TO authenticated;

-- Gerçekten müsait operatörler (heartbeat tazeliği dahil)
CREATE OR REPLACE VIEW public.chat_available_agents AS
SELECT
  a.user_id,
  a.display_name,
  a.agent_role,
  a.max_concurrent,
  a.status,
  a.last_seen_at,
  (a.status = 'online' AND a.last_seen_at > now() - INTERVAL '90 seconds') AS is_available,
  (SELECT count(*) FROM public.chat_conversations c
   WHERE c.assigned_to = a.user_id AND c.status <> 'closed') AS active_load
FROM public.chat_agents a
WHERE a.is_active;

GRANT SELECT ON public.chat_available_agents TO authenticated;

-- ============================================================
-- 5) ATAMA
-- ============================================================

/*
 * Görüşmeyi üstlen. Yarış koşulunu önleyen koşullu güncelleme:
 * iki operatör aynı anda basarsa yalnızca biri kazanır, diğerine
 * false döner ve arayüz "başkası aldı" der.
 */
CREATE OR REPLACE FUNCTION public.chat_claim_conversation(p_conversation_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  who TEXT;
  ok BOOLEAN;
BEGIN
  IF NOT public.chat_can_serve() THEN
    RAISE EXCEPTION 'Yetkisiz.' USING ERRCODE = '42501';
  END IF;

  SELECT display_name INTO who FROM public.chat_agents WHERE user_id = auth.uid();

  UPDATE public.chat_conversations
  SET assigned_to = auth.uid(),
      assigned_name = COALESCE(who, 'Operatör')
  WHERE id = p_conversation_id
    AND assigned_to IS NULL          -- <-- kilit burada
  RETURNING true INTO ok;

  RETURN COALESCE(ok, false);
END;
$$;

GRANT EXECUTE ON FUNCTION public.chat_claim_conversation(UUID) TO authenticated;

/* Başka bir operatöre devret */
CREATE OR REPLACE FUNCTION public.chat_transfer_conversation(
  p_conversation_id UUID,
  p_target_user_id UUID,
  p_note TEXT DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  from_name TEXT;
  to_name TEXT;
BEGIN
  IF NOT public.chat_can_serve() THEN
    RAISE EXCEPTION 'Yetkisiz.' USING ERRCODE = '42501';
  END IF;

  SELECT display_name INTO from_name FROM public.chat_agents WHERE user_id = auth.uid();
  SELECT display_name INTO to_name FROM public.chat_agents WHERE user_id = p_target_user_id;

  IF to_name IS NULL THEN
    RAISE EXCEPTION 'Hedef operatör bulunamadı.' USING ERRCODE = '22023';
  END IF;

  UPDATE public.chat_conversations
  SET assigned_to = p_target_user_id,
      assigned_name = to_name
  WHERE id = p_conversation_id;

  -- Transkripte iz düşsün; ziyaretçi de görür
  INSERT INTO public.chat_messages (conversation_id, sender_role, content)
  VALUES (
    p_conversation_id, 'system',
    format('Görüşme %s tarafından %s adlı danışmana devredildi.%s',
           COALESCE(from_name, 'operatör'), to_name,
           CASE WHEN btrim(COALESCE(p_note, '')) <> ''
                THEN E'\nNot: ' || btrim(p_note) ELSE '' END)
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.chat_transfer_conversation(UUID, UUID, TEXT) TO authenticated;

-- ============================================================
-- 6) OTOMATİK ATAMA
--
-- Yeni görüşme açıldığında en az yüklü müsait operatöre verilir.
-- "En az yüklü", round-robin'den iyidir: round-robin uzun süren
-- görüşmeleri saymaz, biri 5 zor vakayla boğuşurken ona 6.'yı yollar.
-- Müsait kimse yoksa görüşme HAVUZDA kalır (assigned_to NULL).
-- ============================================================

CREATE OR REPLACE FUNCTION public.chat_autoassign()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  pick RECORD;
BEGIN
  SELECT user_id, display_name INTO pick
  FROM public.chat_available_agents
  WHERE is_available AND active_load < max_concurrent
  ORDER BY active_load ASC, last_seen_at DESC
  LIMIT 1;

  IF pick.user_id IS NOT NULL THEN
    UPDATE public.chat_conversations
    SET assigned_to = pick.user_id, assigned_name = pick.display_name
    WHERE id = NEW.id;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_chat_autoassign ON public.chat_conversations;
CREATE TRIGGER trg_chat_autoassign
  AFTER INSERT ON public.chat_conversations
  FOR EACH ROW
  EXECUTE FUNCTION public.chat_autoassign();

-- ============================================================
-- 7) MEVCUT ADMİNLERİ EKİBE AL
--
-- Böylece migration sonrası kimse erişimini kaybetmez. İstemediğiniz
-- kişileri panelden pasife alabilirsiniz.
-- ============================================================

INSERT INTO public.chat_agents (user_id, display_name, agent_role)
SELECT p.id,
       COALESCE(NULLIF(btrim(p.full_name), ''), split_part(p.email, '@', 1)),
       'supervisor'
FROM public.profiles p
WHERE p.role IN ('admin', 'super_admin')
ON CONFLICT (user_id) DO NOTHING;

-- ============================================================
-- KONTROL
-- ============================================================
SELECT display_name, agent_role, status, max_concurrent, is_active
FROM public.chat_agents ORDER BY agent_role, display_name;
