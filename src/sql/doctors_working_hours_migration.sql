-- ============================================================
-- Anadolu Hastaneleri Grubu - Doktor Çalışma Saatleri Kolonu
-- Doktorlara özel çalışma saatleri tanımlamak için (ör. Özkan SEVER Cumartesi 12:00'ye kadar)
-- Çalıştırma: Supabase SQL Editor'a yapıştırıp Run butonuna basın.
-- ============================================================

ALTER TABLE public.doctors ADD COLUMN IF NOT EXISTS working_hours TEXT;

COMMENT ON COLUMN public.doctors.working_hours IS
  'Doktora özel çalışma saatleri (serbest metin). Boşsa şubenin genel saatleri gösterilir.';

-- PostgREST şema cache'ini tazele; aksi halde kaydetmede
-- "Could not find the 'working_hours' column of 'doctors' in the schema cache" hatası alınır.
NOTIFY pgrst, 'reload schema';
