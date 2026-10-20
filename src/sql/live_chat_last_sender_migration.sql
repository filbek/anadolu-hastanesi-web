-- ============================================================
-- Anadolu Hastaneleri Grubu - Canlı destek: son mesajı kim yazdı
--
-- Operatör panelindeki "Yanıt Bekleyen" kuyruğu için: son mesajı hasta
-- mı (yanıt bekliyor) yoksa operatör mü yazdı (top hastada). Okundu
-- bilgisi bunu söylemez — operatör görüşmeyi açıp okuduğu halde yanıt
-- vermemiş olabilir.
--
-- chat_conversations.last_sender_role: 'visitor' | 'agent' (sistem
-- mesajları değiştirmez). chat_messages INSERT tetikleyicisiyle güncellenir.
--
-- SIRA: live_chat_stale_close_migration.sql'den SONRA.
-- Idempotent: birden fazla kez çalıştırılabilir.
-- ============================================================

ALTER TABLE public.chat_conversations
  ADD COLUMN IF NOT EXISTS last_sender_role TEXT;

CREATE OR REPLACE FUNCTION public.chat_track_last_sender()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.sender_role IN ('visitor', 'agent') THEN
    UPDATE public.chat_conversations
    SET last_sender_role = NEW.sender_role
    WHERE id = NEW.conversation_id;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_chat_track_last_sender ON public.chat_messages;
CREATE TRIGGER trg_chat_track_last_sender
  AFTER INSERT ON public.chat_messages
  FOR EACH ROW
  EXECUTE FUNCTION public.chat_track_last_sender();

-- Mevcut görüşmeleri doldur
UPDATE public.chat_conversations c
SET last_sender_role = m.sender_role
FROM (
  SELECT DISTINCT ON (conversation_id) conversation_id, sender_role
  FROM public.chat_messages
  WHERE sender_role IN ('visitor', 'agent')
  ORDER BY conversation_id, id DESC
) m
WHERE m.conversation_id = c.id
  AND c.last_sender_role IS DISTINCT FROM m.sender_role;

-- KONTROL
SELECT last_sender_role, count(*) FROM public.chat_conversations
WHERE status <> 'closed' GROUP BY 1;
