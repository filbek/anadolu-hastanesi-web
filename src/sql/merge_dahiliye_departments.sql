-- ============================================================
-- Anadolu Hastaneleri Grubu - Mükerrer Dahiliye bölümünü birleştir
--
-- İki kayıt vardı:
--   id 5  "Dahiliye (İç Hastalıkları)"  slug: dahiliye                 (KALIR - içerik dolu)
--   id 36 "İç Hastalıkları (Dahiliye)"  slug: ic-hastaliklari-dahiliye (SİLİNİR)
--
-- id 36'ya bağlı doktorlar, HBYS bölüm kodları ve hastane
-- "her zaman göster" listeleri id 5'e taşınır, sonra id 36 silinir.
-- hospital_department_hbys ON DELETE CASCADE olduğu için taşıma
-- silmeden ÖNCE yapılmalı.
--
-- Idempotent. Çalıştırma: Supabase SQL Editor'a yapıştırıp Run.
-- ============================================================

BEGIN;

-- 1) Doktorlar
UPDATE public.doctors SET department_id = 5 WHERE department_id = 36;

-- 2) HBYS bölüm kodları (id 5 için zaten kayıt varsa onu koru)
INSERT INTO public.hospital_department_hbys (hospital_id, department_id, hbys_department_id)
SELECT hospital_id, 5, hbys_department_id
FROM public.hospital_department_hbys
WHERE department_id = 36
ON CONFLICT (hospital_id, department_id) DO NOTHING;

DELETE FROM public.hospital_department_hbys WHERE department_id = 36;

-- 3) Yorumlar
UPDATE public.testimonials SET department_id = 5 WHERE department_id = 36;

-- 4) Hastane "her zaman göster" bölüm listeleri
UPDATE public.hospitals
SET department_ids = (
  SELECT COALESCE(array_agg(DISTINCT CASE WHEN d = 36 THEN 5 ELSE d END), '{}'::integer[])
  FROM unnest(department_ids) AS d
)
WHERE 36 = ANY(department_ids);

-- 5) Mükerrer kaydı sil
DELETE FROM public.departments WHERE id = 36;

COMMIT;
