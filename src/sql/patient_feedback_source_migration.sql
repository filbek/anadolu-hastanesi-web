-- ============================================================
-- Anadolu Hastaneleri Grubu - Geri Bildirim kaynağı
-- Görüş/öneri formu artık hem hastalar hem çalışan personel tarafından
-- doldurulabiliyor. Bu kolon geri bildirimin kaynağını ayırt eder.
--
--   source = 'hasta'    -> hasta/ziyaretçi
--   source = 'personel' -> çalışan personel (anonim olabilir)
--
-- Idempotent. Çalıştırma: Supabase SQL Editor'a yapıştırıp Run.
-- ============================================================

ALTER TABLE public.patient_feedback
  ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'hasta';
