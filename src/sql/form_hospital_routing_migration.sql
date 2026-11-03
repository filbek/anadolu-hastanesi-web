-- ============================================================
-- Anadolu Hastaneleri Grubu — Şube Bazlı Form Bildirimleri
--
-- 1) İkinci Görüş, İletişim ("Bize Yazın") ve Sizi Dinliyoruz formları
--    formda seçilen hastanenin sorumlusuna gider. Eşlemeler
--    hastane id'si => e-posta biçimindedir; eşlemesi olmayan başvurular
--    ilgili formun genel adresine (second_opinion_email vb.) düşer.
-- 2) İletişim formuna hastane seçimi eklendi -> contact_submissions.hospital
-- 3) Sağlık Turizmi sayfasındaki form (önceden hiçbir yere bağlı değildi)
--    health_tourism_submissions tablosuna kaydedilir ve
--    health_tourism_email adresine bildirilir.
--
-- Admin Panel > Site Ayarları > Form Bildirim Ayarları'ndan düzenlenir.
-- Idempotent: birden fazla kez çalıştırılabilir.
-- Çalıştırma: Supabase SQL Editor'a yapıştırıp Run.
-- Not: Sitenin yeni sürümü yayına alınmadan ÖNCE çalıştırılmalıdır.
-- ============================================================

-- 1) Şube bazlı alıcı eşlemeleri ---------------------------------
ALTER TABLE public.site_settings
  ADD COLUMN IF NOT EXISTS second_opinion_hospital_emails JSONB NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS contact_hospital_emails        JSONB NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS feedback_hospital_emails       JSONB NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS health_tourism_email           TEXT DEFAULT 'bekir.filizdag@anadoluhastaneleri.com';

UPDATE public.site_settings
SET health_tourism_email = 'bekir.filizdag@anadoluhastaneleri.com'
WHERE health_tourism_email IS NULL OR health_tourism_email = '';

-- Başlangıç eşlemeleri. Admin panelinden girilmiş bir adres varsa korunur
-- (sağdaki nesne soldakinin üzerine yazar).
UPDATE public.site_settings s
SET second_opinion_hospital_emails = seed.second_opinion || s.second_opinion_hospital_emails,
    contact_hospital_emails        = seed.patient_rights || s.contact_hospital_emails,
    feedback_hospital_emails       = seed.patient_rights || s.feedback_hospital_emails
FROM (
  SELECT
    COALESCE(jsonb_object_agg(h.id::text, v.second_opinion), '{}'::jsonb) AS second_opinion,
    COALESCE(jsonb_object_agg(h.id::text, v.patient_rights), '{}'::jsonb) AS patient_rights
  FROM public.hospitals h
  JOIN (VALUES
    ('ozel-silivri-anadolu-hastanesi', 'elif.vardar@anadoluhastaneleri.com',    'silivri.hastahaklari@anadoluhastaneleri.com'),
    ('ozel-eregli-anadolu-hastanesi',  'tugba.uzuner@anadoluhastaneleri.com',   'eregli.hastahaklari@anadoluhastaneleri.com'),
    ('ozel-avcilar-anadolu-hastanesi', 'asine.ozkilic@anadoluhastaneleri.com',  'avcilar.hastahaklari@anadoluhastaneleri.com')
  ) AS v(slug, second_opinion, patient_rights) ON v.slug = h.slug
) AS seed;

-- 2) İletişim formunda seçilen hastane ---------------------------
ALTER TABLE public.contact_submissions
  ADD COLUMN IF NOT EXISTS hospital TEXT;

-- 3) Sağlık Turizmi başvuruları ----------------------------------
CREATE TABLE IF NOT EXISTS public.health_tourism_submissions (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  country TEXT,
  treatment TEXT,
  message TEXT NOT NULL,
  consent BOOLEAN DEFAULT true,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_health_tourism_submissions_created_at
  ON public.health_tourism_submissions(created_at DESC);

-- Hasta verisi: ziyaretçi yalnızca gönderebilir, okuma/yönetim yalnızca admin
-- (rls_hardening_migration.sql'deki diğer başvuru tablolarıyla aynı kural)
ALTER TABLE public.health_tourism_submissions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can submit" ON public.health_tourism_submissions;
CREATE POLICY "Public can submit" ON public.health_tourism_submissions
  FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Admins manage submissions" ON public.health_tourism_submissions;
CREATE POLICY "Admins manage submissions" ON public.health_tourism_submissions
  FOR SELECT TO authenticated USING (public.is_admin());

DROP POLICY IF EXISTS "Admins update submissions" ON public.health_tourism_submissions;
CREATE POLICY "Admins update submissions" ON public.health_tourism_submissions
  FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins delete submissions" ON public.health_tourism_submissions;
CREATE POLICY "Admins delete submissions" ON public.health_tourism_submissions
  FOR DELETE TO authenticated USING (public.is_admin());

REVOKE SELECT, UPDATE, DELETE ON public.health_tourism_submissions FROM anon;
GRANT INSERT ON public.health_tourism_submissions TO anon;
GRANT USAGE, SELECT ON SEQUENCE public.health_tourism_submissions_id_seq TO anon, authenticated;

-- ============================================================
-- KONTROL
-- ============================================================
SELECT h.name,
       s.second_opinion_hospital_emails ->> h.id::text AS ikinci_gorus,
       s.contact_hospital_emails        ->> h.id::text AS bize_yazin,
       s.feedback_hospital_emails       ->> h.id::text AS sizi_dinliyoruz,
       s.health_tourism_email                          AS saglik_turizmi
FROM public.hospitals h
CROSS JOIN public.site_settings s
ORDER BY h.id;
