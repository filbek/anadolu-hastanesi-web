-- ============================================================
-- Anadolu Hastaneleri Grubu - Geri bildirim: herkese açık gönderim
-- Görüş/öneri formunu giriş yapmamış ziyaretçiler (anon rolü) de
-- gönderebilmeli. Mevcut kurulumda INSERT yalnızca 'authenticated'
-- rolüne verildiğinden anonim gönderim RLS (42501) hatası veriyordu.
--
-- Not: Okuma (SELECT) yalnızca admin/authenticated'da kalır; ziyaretçi
-- yalnızca EKLEYEBİLİR, mevcut kayıtları göremez.
--
-- Idempotent. Çalıştırma: Supabase SQL Editor'a yapıştırıp Run.
-- ============================================================

ALTER TABLE public.patient_feedback ENABLE ROW LEVEL SECURITY;

-- Tablo düzeyinde INSERT ayrıcalığı (anon rolü)
GRANT INSERT ON public.patient_feedback TO anon;
GRANT USAGE, SELECT ON SEQUENCE public.patient_feedback_id_seq TO anon;

-- RLS: anon ve authenticated INSERT edebilir
DROP POLICY IF EXISTS "Allow public insert feedback" ON public.patient_feedback;
CREATE POLICY "Allow public insert feedback" ON public.patient_feedback
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);
