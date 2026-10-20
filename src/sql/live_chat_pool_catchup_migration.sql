-- ============================================================
-- Anadolu Hastaneleri Grubu - Canlı destek: havuz boşaltma
--
-- Sorun: Yeni görüşme açıldığında müsait operatör yoksa görüşme havuzda
-- (assigned_to NULL) kalıyor. Operatörler yalnızca kendine atananları
-- gördüğü için (call_center_operator_scope_migration.sql) havuzdaki
-- görüşmeler kimseye düşmüyordu.
--
-- Çözüm:
--   1) chat_assign_pool(): havuzdaki açık görüşmeleri, en eskisinden
--      başlayarak en az yüklü müsait OPERATÖRE (agent_role = 'agent')
--      dağıtır. Operatör yoksa müsait süpervizöre verir.
--   2) chat_agent_heartbeat(): operatör "çevrimiçi" sinyali her
--      geldiğinde havuzu boşaltır — panele giren operatör bekleyenleri
--      hemen alır, gece birikenler sabah ilk girene düşer.
--   3) Şu an havuzda bekleyen görüşmeleri aktif operatörlere dağıtır
--      (son 30 günde görülen, en az yüklü önce).
--
-- SIRA: live_chat_agents_migration.sql'den SONRA.
-- Idempotent: birden fazla kez çalıştırılabilir.
-- Çalıştırma: Supabase SQL Editor'a yapıştırıp Run.
-- ============================================================


-- 1) HAVUZU MÜSAİT OPERATÖRLERE DAĞIT
CREATE OR REPLACE FUNCTION public.chat_assign_pool()
RETURNS INTEGER
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  conv RECORD;
  pick RECORD;
  assigned INTEGER := 0;
BEGIN
  FOR conv IN
    SELECT id
    FROM public.chat_conversations
    WHERE assigned_to IS NULL AND status <> 'closed'
    ORDER BY created_at ASC
    -- Aynı anda iki operatörün sinyali gelirse aynı görüşmeyi iki kez almasınlar
    FOR UPDATE SKIP LOCKED
  LOOP
    SELECT user_id, display_name INTO pick
    FROM public.chat_available_agents
    WHERE is_available AND active_load < max_concurrent
    -- Önce operatörler, sonra süpervizörler; aynı gruptaysa en az yüklü
    ORDER BY (agent_role = 'agent') DESC, active_load ASC, last_seen_at DESC
    LIMIT 1;

    EXIT WHEN pick.user_id IS NULL;

    UPDATE public.chat_conversations
    SET assigned_to = pick.user_id, assigned_name = pick.display_name
    WHERE id = conv.id AND assigned_to IS NULL;

    assigned := assigned + 1;
  END LOOP;

  RETURN assigned;
END;
$$;

REVOKE ALL ON FUNCTION public.chat_assign_pool() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.chat_assign_pool() TO authenticated;


-- 2) ÇEVRİMİÇİ SİNYALİNDE HAVUZU BOŞALT
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

  -- Sinyal gönderen çevrimiçiyse bekleyen görüşmeleri dağıt
  IF EXISTS (
    SELECT 1 FROM public.chat_agents
    WHERE user_id = auth.uid() AND is_active AND status = 'online'
  ) THEN
    PERFORM public.chat_assign_pool();
  END IF;
END;
$$;

GRANT EXECUTE ON FUNCTION public.chat_agent_heartbeat(TEXT) TO authenticated;


-- 3) ŞU AN HAVUZDA BEKLEYENLERİ AKTİF OPERATÖRLERE DAĞIT
--
-- Müsaitlik (son 90 sn sinyal) şartı aranmaz: operatörler şu an panelde
-- olmayabilir. Son 30 günde panele girmiş aktif operatörler arasında,
-- en az yüklü olana sırayla verilir.
DO $$
DECLARE
  conv RECORD;
  pick RECORD;
BEGIN
  FOR conv IN
    SELECT id FROM public.chat_conversations
    WHERE assigned_to IS NULL AND status <> 'closed'
    ORDER BY created_at ASC
  LOOP
    SELECT a.user_id, a.display_name INTO pick
    FROM public.chat_agents a
    WHERE a.is_active
      AND a.agent_role = 'agent'
      AND a.last_seen_at > now() - INTERVAL '30 days'
    ORDER BY (SELECT count(*) FROM public.chat_conversations c
              WHERE c.assigned_to = a.user_id AND c.status <> 'closed') ASC,
             a.last_seen_at DESC
    LIMIT 1;

    EXIT WHEN pick.user_id IS NULL;

    UPDATE public.chat_conversations
    SET assigned_to = pick.user_id, assigned_name = pick.display_name
    WHERE id = conv.id;
  END LOOP;
END;
$$;


-- KONTROL: 0 beklenir (havuzda bekleyen açık görüşme kalmamalı)
SELECT count(*) AS havuzda_kalan
FROM public.chat_conversations
WHERE assigned_to IS NULL AND status <> 'closed';
