-- ============================================================
-- Sizi Dinliyoruz — Hasta / Çalışan bildirimlerini ayırma
--
-- "Sizi Dinliyoruz" formunda "Çalışan" seçilerek gönderilen bildirimler
-- hasta bildirimlerinden ayrı adrese gider:
--   feedback_employee_email           -> çalışan bildirimleri genel adresi
--   feedback_employee_hospital_emails -> şubeye göre adresler ({ "<hospital id>": "e-posta" })
-- Hasta bildirimleri eskisi gibi feedback_form_email / feedback_hospital_emails kullanır.
-- Çalışan adresi girilmemişse bildirim hasta bildirimleriyle aynı yere düşer.
--
-- Admin Panel > Site Ayarları > Form Bildirim Ayarları'ndan düzenlenir.
-- Idempotent. Supabase SQL Editor'a yapıştırıp Run.
-- Not: Sitenin yeni sürümü yayına alınmadan ÖNCE çalıştırılmalıdır.
-- ============================================================

ALTER TABLE public.site_settings
  ADD COLUMN IF NOT EXISTS feedback_employee_email           TEXT,
  ADD COLUMN IF NOT EXISTS feedback_employee_hospital_emails JSONB NOT NULL DEFAULT '{}'::jsonb;

NOTIFY pgrst, 'reload schema';

-- KONTROL: iki sütun listelenmeli
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'site_settings'
  AND column_name IN ('feedback_employee_email', 'feedback_employee_hospital_emails');
