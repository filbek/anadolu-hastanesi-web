-- ============================================================
-- Anadolu Hastaneleri Grubu — İş Başvurusu Bildirim Adresi
-- Kariyer sayfasındaki iş başvuru formunun bildirimleri artık
-- isbasvuru@anadoluhastaneleri.com adresine gider.
-- Idempotent: birden fazla kez çalıştırılabilir.
-- Çalıştırma: Supabase SQL Editor'a yapıştırıp Run.
-- ============================================================

-- Kolon yoksa oluştur (job_applications_migration.sql çalıştırılmadıysa)
ALTER TABLE public.site_settings
  ADD COLUMN IF NOT EXISTS career_form_email TEXT DEFAULT 'isbasvuru@anadoluhastaneleri.com';

-- Mevcut satır(lar)daki eski/boş adresi güncelle.
-- Admin panelinden bilinçli olarak başka bir adres girilmişse dokunulmaz.
UPDATE public.site_settings
SET career_form_email = 'isbasvuru@anadoluhastaneleri.com'
WHERE career_form_email IS NULL
   OR career_form_email = ''
   OR career_form_email = 'bekir.filizdag@gmail.com'
   OR career_form_email = 'info@anadoluhastaneleri.com';

-- ============================================================
-- KONTROL
-- ============================================================
SELECT id, career_form_email FROM public.site_settings;
