-- ============================================================
-- Sosyal Sorumluluk Projeleri - Ek Görseller (galeri)
--
-- Etkinliklere banner görseli (image) dışında, yazının altında
-- gösterilen ek görseller eklenebilmesi için URL dizisi sütunu.
-- Dizi sırası ekranda görünen sıradır.
-- Görseller article-images bucket'ında csr-images/ altına yüklenir.
-- Yönetim: Admin > Sosyal Sorumluluk > (etkinlik) > "Ek Görseller".
--
-- Idempotent. Supabase SQL Editor'a yapıştırıp Run.
-- ============================================================

ALTER TABLE public.social_responsibility_activities
  ADD COLUMN IF NOT EXISTS gallery_images TEXT[] NOT NULL DEFAULT '{}';

NOTIFY pgrst, 'reload schema';

-- KONTROL: gallery_images sütunu listelenmeli
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'social_responsibility_activities'
  AND column_name = 'gallery_images';
