-- ============================================================
-- Anadolu Hastaneleri Grubu - İş Başvuru Formu
--
-- Eski PHP formunun (basvuru/) yerini alan Supabase şeması.
-- PHP tarafında başvurular sunucudaki basvurular.json dosyasında
-- düz metin olarak tutuluyordu; burada RLS korumalı bir tabloya alınır.
--
-- Idempotent: birden fazla kez çalıştırılabilir.
-- Çalıştırma: Supabase SQL Editor'a yapıştırıp Run.
-- ============================================================

-- 1) Başvuru tablosu
--    Sabit alanlar kolon olarak, değişken uzunluktaki bölümler
--    (eğitim, deneyim, beceri puanları, sertifika, referans) JSONB olarak
--    saklanır. Böylece forma alan eklendiğinde şema değişikliği gerekmez.
CREATE TABLE IF NOT EXISTS public.job_applications (
  id SERIAL PRIMARY KEY,
  reference_code TEXT UNIQUE NOT NULL,

  -- Pozisyon
  position TEXT NOT NULL,
  position_group TEXT NOT NULL,
  hospital TEXT,

  -- Kişisel bilgiler
  full_name TEXT NOT NULL,
  national_id TEXT NOT NULL,
  gender TEXT,
  birth_place_date TEXT,
  marital_status TEXT,
  nationality TEXT,
  address TEXT,
  mobile_phone TEXT NOT NULL,
  home_phone TEXT,
  alternative_phone TEXT,
  email TEXT NOT NULL,
  blood_type TEXT,
  drivers_license TEXT,
  military_status TEXT,
  military_deferral_date DATE,
  smoker TEXT,
  relative_at_company TEXT,
  relative_name TEXT,
  interviewed_before TEXT,
  previous_position TEXT,
  spouse_occupation TEXT,
  health_issues TEXT,
  preferred_cities TEXT[],
  photo_url TEXT,
  cv_url TEXT,

  -- Değişken bölümler
  education JSONB DEFAULT '[]'::jsonb,
  experience JSONB DEFAULT '[]'::jsonb,
  skills JSONB DEFAULT '{}'::jsonb,
  computer_skills JSONB DEFAULT '{}'::jsonb,
  languages JSONB DEFAULT '{}'::jsonb,
  certificates JSONB DEFAULT '[]'::jsonb,
  references_list JSONB DEFAULT '[]'::jsonb,
  profession_notes TEXT,

  -- İş yükümlülükleri ve ücret
  earliest_start_date DATE,
  overtime TEXT,
  weekend_work TEXT,
  night_shift TEXT,
  public_holiday TEXT,
  travel TEXT,
  last_salary TEXT,
  expected_salary TEXT,

  -- Beyan ve onay
  signature TEXT,
  signature_date DATE,
  consent BOOLEAN DEFAULT false,

  -- İK takibi
  status TEXT DEFAULT 'yeni',
  admin_note TEXT,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- status için geçerli değerler
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'job_applications_status_check'
  ) THEN
    ALTER TABLE public.job_applications
      ADD CONSTRAINT job_applications_status_check
      CHECK (status IN ('yeni', 'incelendi', 'gorusme', 'olumlu', 'olumsuz', 'arsiv'));
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_job_applications_created_at
  ON public.job_applications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_job_applications_status
  ON public.job_applications(status);
CREATE INDEX IF NOT EXISTS idx_job_applications_is_read
  ON public.job_applications(is_read);
CREATE INDEX IF NOT EXISTS idx_job_applications_position_group
  ON public.job_applications(position_group);

-- 2) RLS
--    Başvurular TC kimlik no, adres ve maaş gibi hassas veri içerdiği için
--    okuma/güncelleme/silme yalnızca oturum açmış (admin) kullanıcılara açıktır.
--    Ziyaretçi (anon) yalnızca yeni kayıt ekleyebilir.
ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow insert job applications" ON public.job_applications;
CREATE POLICY "Allow insert job applications" ON public.job_applications
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow read job applications" ON public.job_applications;
CREATE POLICY "Allow read job applications" ON public.job_applications
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Allow update job applications" ON public.job_applications;
CREATE POLICY "Allow update job applications" ON public.job_applications
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow delete job applications" ON public.job_applications;
CREATE POLICY "Allow delete job applications" ON public.job_applications
  FOR DELETE TO authenticated USING (true);

-- 3) Başvuru bildiriminin gideceği e-posta adresi (admin panelinden değiştirilebilir)
ALTER TABLE public.site_settings
  ADD COLUMN IF NOT EXISTS career_form_email TEXT DEFAULT 'isbasvuru@anadoluhastaneleri.com';

-- Mevcut satırda kolon boşsa doldur
UPDATE public.site_settings
SET career_form_email = 'isbasvuru@anadoluhastaneleri.com'
WHERE career_form_email IS NULL OR career_form_email = '';

-- 4) Aday belgeleri için storage bucket (fotoğraf, CV)
--    Bucket public: e-posta bildirimindeki bağlantının İK tarafından
--    ek giriş yapmadan açılabilmesi için. Dosya adları rastgeledir.
INSERT INTO storage.buckets (id, name, public)
VALUES ('job-applications', 'job-applications', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Allow upload job application files" ON storage.objects;
CREATE POLICY "Allow upload job application files" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'job-applications');

DROP POLICY IF EXISTS "Allow read job application files" ON storage.objects;
CREATE POLICY "Allow read job application files" ON storage.objects
  FOR SELECT USING (bucket_id = 'job-applications');

-- PostgREST şema önbelleğini tazele
NOTIFY pgrst, 'reload schema';

-- ============================================================
-- KONTROL
-- ============================================================
SELECT 'job_applications' AS tablo, count(*) AS kayit FROM public.job_applications;

SELECT column_name
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'site_settings'
  AND column_name = 'career_form_email';
