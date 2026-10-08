-- ============================================================
-- Anadolu Hastaneleri Grubu - Çağrı Merkezi Süpervizörü
--
-- Ekip rolü 'supervisor' olan çağrı merkezi kullanıcısı canlı destek
-- modülünü yönetir (ekip, hazır yanıt, etiket, ayar, tüm ekibin raporu);
-- 'agent' yalnızca kendi görüşmelerini ve KENDİ rakamlarını görür.
--
-- Bu dosya:
--   1) Görüşme görünürlüğünü yorumdaki kurala indirir (agent: kendine
--      atanan + havuz). Eski koşulda OR'lar yüzünden agent başkasına
--      atanmış açık görüşmeleri ve son 30 günün tümünü görebiliyordu.
--   2) chat_stats: supervisor/admin tüm ekibi, agent yalnızca kendini görür.
--   3) chat_agents'ta süpervizörün yetkisini sınırlar: süpervizör atamak,
--      ekipten silmek ve başka süpervizörü düzenlemek yöneticiye aittir.
--   4) chat_team_accounts(): Ekip ekranı için hesap bilgisi (e-posta,
--      profil rolü, giriş açık mı). profiles/auth.users RLS'ine
--      dokunmadan, yalnızca supervisor/admin'e.
--
-- Hesap açma / şifre / giriş kapatma işlemleri admin-users edge
-- function'ındadır (süpervizör yalnızca call_center hesaplarına).
--
-- SIRA: call_center_role_migration.sql'den SONRA.
-- Idempotent: birden fazla kez çalıştırılabilir.
-- Çalıştırma: Supabase SQL Editor'a yapıştırıp Run.
-- ============================================================


-- ============================================================
-- 1) GÖRÜŞME GÖRÜNÜRLÜĞÜ
--
-- supervisor -> hepsi
-- agent      -> kendine atanan (kapalıysa son 30 gün) + havuz (atanmamış,
--               kapanmamış)
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
        (
          p_assigned_to = auth.uid()
          AND (p_status <> 'closed' OR p_created_at > now() - INTERVAL '30 days')
        )
        OR (p_assigned_to IS NULL AND p_status <> 'closed')
      )
    );
$$;

GRANT EXECUTE ON FUNCTION public.chat_can_view_conversation(UUID, TIMESTAMPTZ, TEXT)
  TO authenticated;


-- ============================================================
-- 2) İSTATİSTİK: ekip mi, kendisi mi
--
-- Dönüşe 'scope' eklendi: 'team' | 'self'. Agent için görüşmeler
-- assigned_to'ya, mesajlar sender_id'ye göre süzülür; hazır yanıt
-- kullanım sayaçları ekip geneli olduğundan agent'a boş döner.
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
  v_self BOOLEAN;
  v_uid UUID := auth.uid();
BEGIN
  IF public.is_admin() OR public.chat_is_supervisor() THEN
    v_self := false;
  ELSIF public.chat_can_serve() THEN
    v_self := true;
  ELSE
    RAISE EXCEPTION 'Yetkisiz.' USING ERRCODE = '42501';
  END IF;

  since := now() - (LEAST(GREATEST(COALESCE(p_days, 30), 1), 365) || ' days')::INTERVAL;

  WITH conv AS (
    SELECT * FROM public.chat_conversations
    WHERE created_at >= since
      AND (NOT v_self OR assigned_to = v_uid)
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
    'scope', CASE WHEN v_self THEN 'self' ELSE 'team' END,
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
        FROM msg
        WHERE sender_role = 'agent' AND (NOT v_self OR sender_id = v_uid)
        GROUP BY 1
      ) x
    ), '[]'::JSONB),

    'canned', CASE WHEN v_self THEN '[]'::JSONB ELSE COALESCE((
      SELECT jsonb_agg(jsonb_build_object('title', title, 'count', use_count) ORDER BY use_count DESC)
      FROM (
        SELECT title, use_count FROM public.chat_canned_responses
        WHERE use_count > 0 ORDER BY use_count DESC LIMIT 8
      ) z
    ), '[]'::JSONB) END
  ) INTO result;

  RETURN result;
END;
$$;

GRANT EXECUTE ON FUNCTION public.chat_stats(INTEGER) TO authenticated;


-- ============================================================
-- 3) SÜPERVİZÖRÜN EKİP YETKİSİ
--
-- RLS ("Supervisors manage team") süpervizöre tablonun tamamını açıyor;
-- satır/alan bazlı sınırlar trigger'da:
--   - ekipten SİLME yalnızca yönetici (süpervizör pasife alır; geçmiş
--     görüşmelerdeki atama bilgisi zaten korunuyor)
--   - agent_role değiştirmek / süpervizör eklemek yalnızca yönetici
--   - başka bir süpervizörün kaydını düzenlemek yalnızca yönetici
--   - ekibe yalnızca call_center rolündeki kullanıcı eklenebilir
--
-- auth.uid() NULL ise (service_role: edge function, SQL Editor,
-- sync_call_center_agent tetikleyicisi admin işleminden) dokunulmaz.
-- Heartbeat (yalnızca status/last_seen_at) her zaman geçer.
-- ============================================================
CREATE OR REPLACE FUNCTION public.chat_agents_guard()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $fn$
DECLARE
  v_uid UUID := auth.uid();
BEGIN
  IF v_uid IS NULL OR public.is_admin() THEN
    RETURN COALESCE(NEW, OLD);
  END IF;

  IF TG_OP = 'DELETE' THEN
    RAISE EXCEPTION 'Ekipten çıkarma yöneticiye aittir; operatörü pasife alın.'
      USING ERRCODE = '42501';
  END IF;

  IF TG_OP = 'INSERT' THEN
    IF NEW.agent_role <> 'agent' THEN
      RAISE EXCEPTION 'Süpervizör atamasını yalnızca yönetici yapabilir.'
        USING ERRCODE = '42501';
    END IF;
    IF NOT EXISTS (
      SELECT 1 FROM public.profiles p WHERE p.id = NEW.user_id AND p.role = 'call_center'
    ) THEN
      RAISE EXCEPTION 'Ekibe yalnızca çağrı merkezi kullanıcıları eklenebilir.'
        USING ERRCODE = '42501';
    END IF;
    RETURN NEW;
  END IF;

  -- UPDATE: yalnızca çevrimiçi durumu değiştiyse (heartbeat) serbest
  IF NEW.display_name IS NOT DISTINCT FROM OLD.display_name
     AND NEW.avatar_url IS NOT DISTINCT FROM OLD.avatar_url
     AND NEW.agent_role IS NOT DISTINCT FROM OLD.agent_role
     AND NEW.max_concurrent IS NOT DISTINCT FROM OLD.max_concurrent
     AND NEW.is_active IS NOT DISTINCT FROM OLD.is_active
     AND NEW.user_id IS NOT DISTINCT FROM OLD.user_id THEN
    RETURN NEW;
  END IF;

  IF NEW.agent_role IS DISTINCT FROM OLD.agent_role THEN
    RAISE EXCEPTION 'Süpervizör atamasını yalnızca yönetici yapabilir.'
      USING ERRCODE = '42501';
  END IF;

  IF OLD.agent_role = 'supervisor' AND OLD.user_id <> v_uid THEN
    RAISE EXCEPTION 'Başka bir süpervizörü yalnızca yönetici düzenleyebilir.'
      USING ERRCODE = '42501';
  END IF;

  IF OLD.user_id = v_uid AND NEW.is_active IS DISTINCT FROM OLD.is_active THEN
    RAISE EXCEPTION 'Kendinizi pasife alamazsınız.' USING ERRCODE = '42501';
  END IF;

  RETURN NEW;
END $fn$;

DROP TRIGGER IF EXISTS trg_chat_agents_guard ON public.chat_agents;
CREATE TRIGGER trg_chat_agents_guard
  BEFORE INSERT OR UPDATE OR DELETE ON public.chat_agents
  FOR EACH ROW EXECUTE FUNCTION public.chat_agents_guard();


-- ============================================================
-- 4) EKİP EKRANI İÇİN HESAP BİLGİSİ
--
-- Süpervizör profiles/auth.users'ı okuyamaz (okumamalı da). Ekip
-- ekranının ihtiyacı olan üç alan buradan, yalnızca ekip üyeleri için.
-- ============================================================
CREATE OR REPLACE FUNCTION public.chat_team_accounts()
RETURNS TABLE (
  user_id UUID,
  email TEXT,
  full_name TEXT,
  profile_role TEXT,
  account_active BOOLEAN
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $fn$
BEGIN
  IF NOT (public.is_admin() OR public.chat_is_supervisor()) THEN
    RAISE EXCEPTION 'Yetkisiz.' USING ERRCODE = '42501';
  END IF;

  RETURN QUERY
  SELECT
    a.user_id,
    u.email::TEXT,
    p.full_name,
    p.role,
    NOT (u.banned_until IS NOT NULL AND u.banned_until > now())
  FROM public.chat_agents a
  JOIN auth.users u ON u.id = a.user_id
  LEFT JOIN public.profiles p ON p.id = a.user_id;
END $fn$;

REVOKE ALL ON FUNCTION public.chat_team_accounts() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.chat_team_accounts() TO authenticated;


-- PostgREST şema önbelleğini tazele
NOTIFY pgrst, 'reload schema';


-- ============================================================
-- KONTROL
-- ============================================================
SELECT a.display_name, a.agent_role, a.is_active, p.email, p.role
FROM public.chat_agents a
LEFT JOIN public.profiles p ON p.id = a.user_id
ORDER BY a.agent_role DESC, a.display_name;
