-- ============================================================
-- Anadolu Hastaneleri Grubu - Doktor formu ek kolonları
-- DoctorForm'un topladığı ancak doctors tablosunda karşılığı
-- olmayan alanlar için kolonlar ekler. Idempotent.
-- Çalıştırma: Supabase SQL Editor'a yapıştırıp Run.
--
-- NOT: Formdaki şu alanlar mevcut kolonlara EŞLENİR (yeni kolon gerekmez):
--   bio        -> about
--   image_url  -> image
--   specialty  -> specialties (text[] dizinin ilk elemanı)
--   education  -> education (satır satır metin)
-- ============================================================

ALTER TABLE public.doctors ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE public.doctors ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE public.doctors ADD COLUMN IF NOT EXISTS languages TEXT[] DEFAULT '{}'::text[];
ALTER TABLE public.doctors ADD COLUMN IF NOT EXISTS rating NUMERIC(2,1) DEFAULT 5;
ALTER TABLE public.doctors ADD COLUMN IF NOT EXISTS review_count INTEGER DEFAULT 0;
ALTER TABLE public.doctors ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();
