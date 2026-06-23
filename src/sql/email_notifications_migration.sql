-- ============================================================
-- Anadolu Hastaneleri Grubu - Form E-posta Bildirimleri
-- Form başvurularının admin panelinde belirlenen e-posta
-- adreslerine gönderilmesi için gereken şema değişiklikleri.
-- Idempotent: birden fazla kez çalıştırılabilir.
-- Çalıştırma: Supabase SQL Editor'a yapıştırıp Run.
-- ============================================================

-- 1) site_settings: her form için ayrı alıcı e-posta adresi
ALTER TABLE public.site_settings
  ADD COLUMN IF NOT EXISTS second_opinion_email TEXT DEFAULT 'info@anadoluhastaneleri.com';

ALTER TABLE public.site_settings
  ADD COLUMN IF NOT EXISTS contact_form_email TEXT DEFAULT 'info@anadoluhastaneleri.com';

ALTER TABLE public.site_settings
  ADD COLUMN IF NOT EXISTS feedback_form_email TEXT DEFAULT 'hastahaklari@anadoluhastaneleri.com';

-- 2) İletişim formu başvuruları için tablo (şu an hiçbir yere kaydedilmiyordu)
CREATE TABLE IF NOT EXISTS public.contact_submissions (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  subject TEXT,
  message TEXT NOT NULL,
  consent BOOLEAN DEFAULT true,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_contact_submissions_is_read ON public.contact_submissions(is_read);
CREATE INDEX IF NOT EXISTS idx_contact_submissions_created_at ON public.contact_submissions(created_at DESC);

ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;

-- Ziyaretçilerin (anon) form gönderebilmesi + adminin görebilmesi
DROP POLICY IF EXISTS "Allow insert contact submissions" ON public.contact_submissions;
CREATE POLICY "Allow insert contact submissions" ON public.contact_submissions
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow read contact submissions" ON public.contact_submissions;
CREATE POLICY "Allow read contact submissions" ON public.contact_submissions
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow update contact submissions" ON public.contact_submissions;
CREATE POLICY "Allow update contact submissions" ON public.contact_submissions
  FOR UPDATE USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow delete contact submissions" ON public.contact_submissions;
CREATE POLICY "Allow delete contact submissions" ON public.contact_submissions
  FOR DELETE USING (true);

-- ============================================================
-- KONTROL
-- ============================================================
SELECT column_name
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'site_settings'
  AND column_name IN ('second_opinion_email', 'contact_form_email', 'feedback_form_email');
