-- ============================================================
-- Anadolu Hastaneleri Grubu - Canlı destek: hareketsiz görüşmeler
--
-- Sorun: Kimse kapatmadığı için açık görüşmeler birikiyordu (60 açık
-- görüşmenin 55'i 24 saatten eski). Otomatik atama yalnızca
-- active_load < max_concurrent olan operatöre görüşme verdiği için
-- operatörler sürekli "dolu" görünüyor, yeni görüşmeler süpervizöre ya da
-- havuza düşüyordu.
--
-- Bu dosya:
--   1) chat_close_stale(): son mesajı 24 saatten eski açık görüşmeleri
--      kapatır, görüşmeye sistem notu düşer.
--   2) Yük (active_load) yalnızca son 4 saatte hareket görmüş açık
--      görüşmeleri sayar — terk edilmiş görüşme operatörü kilitlemesin.
--   3) Otomatik atama önce operatörleri (agent), sonra süpervizörleri
--      seçer; eşzamanlı atamada sınır aşılmasın diye kilit alır.
--   4) pg_cron ile chat_close_stale() 15 dakikada bir çalışır.
--   5) Şu an biriken hareketsiz görüşmeleri kapatır.
--
-- 2026-10-20'de SQL Editor'dan uygulandı (55 görüşme kapatıldı).
-- SIRA: live_chat_pool_catchup_migration.sql'den SONRA.
-- Idempotent: birden fazla kez çalıştırılabilir.
-- ============================================================


-- 1) HAREKETSİZ GÖRÜŞMELERİ KAPAT
CREATE OR REPLACE FUNCTION public.chat_close_stale(p_hours INTEGER DEFAULT 24)
RETURNS INTEGER LANGUAGE plpgsql VOLATILE SECURITY DEFINER SET search_path = public
AS $$
DECLARE closed_count INTEGER;
BEGIN
  WITH stale AS (
    UPDATE public.chat_conversations
    SET status = 'closed', closed_at = now()
    WHERE status <> 'closed'
      AND last_message_at < now() - make_interval(hours => p_hours)
    RETURNING id
  ), notes AS (
    INSERT INTO public.chat_messages (conversation_id, sender_role, content)
    SELECT id, 'system', 'Görüşme ' || p_hours || ' saat hareketsiz kaldığı için otomatik olarak kapatıldı.'
    FROM stale RETURNING 1
  )
  SELECT count(*) INTO closed_count FROM notes;
  RETURN closed_count;
END;
$$;
REVOKE ALL ON FUNCTION public.chat_close_stale(INTEGER) FROM PUBLIC, anon, authenticated;


-- 2) YÜK: YALNIZCA SON 4 SAATTE HAREKETLİ GÖRÜŞMELER
CREATE OR REPLACE VIEW public.chat_available_agents AS
SELECT a.user_id, a.display_name, a.agent_role, a.max_concurrent, a.status, a.last_seen_at,
  (a.status = 'online' AND a.last_seen_at > now() - INTERVAL '90 seconds') AS is_available,
  (SELECT count(*) FROM public.chat_conversations c
   WHERE c.assigned_to = a.user_id AND c.status <> 'closed'
     AND c.last_message_at > now() - INTERVAL '4 hours') AS active_load
FROM public.chat_agents a
WHERE a.is_active;
GRANT SELECT ON public.chat_available_agents TO authenticated;


-- 3) OTOMATİK ATAMA: ÖNCE OPERATÖR
CREATE OR REPLACE FUNCTION public.chat_autoassign()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE pick RECORD;
BEGIN
  PERFORM pg_advisory_xact_lock(hashtext('chat_autoassign'));
  SELECT user_id, display_name INTO pick
  FROM public.chat_available_agents
  WHERE is_available AND active_load < max_concurrent
  ORDER BY (agent_role = 'agent') DESC, active_load ASC, last_seen_at DESC
  LIMIT 1;
  IF pick.user_id IS NOT NULL THEN
    UPDATE public.chat_conversations
    SET assigned_to = pick.user_id, assigned_name = pick.display_name
    WHERE id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$;


-- 4) ZAMANLANMIŞ İŞ: 15 DAKİKADA BİR
CREATE EXTENSION IF NOT EXISTS pg_cron;
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'chat-close-stale') THEN
    PERFORM cron.unschedule('chat-close-stale');
  END IF;
  PERFORM cron.schedule('chat-close-stale', '*/15 * * * *', 'SELECT public.chat_close_stale(24)');
END;
$$;


-- 5) BİRİKENLERİ ŞİMDİ KAPAT
SELECT public.chat_close_stale(24) AS kapatilan;
