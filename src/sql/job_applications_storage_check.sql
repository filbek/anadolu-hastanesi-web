-- ============================================================
-- İş başvurusu belgeleri (fotoğraf + CV) teşhis sorgusu
--
-- Tek sonuç kümesi döndürür; Supabase SQL Editor yalnızca son SELECT'in
-- çıktısını gösterdiği için tüm kontroller UNION ALL ile birleştirildi.
-- "durum" sütununda TAMAM olmayan satırın nedeni "aciklama"dadır.
--
-- Salt okunur: hiçbir şeyi değiştirmez.
-- ============================================================

WITH pol AS (
  -- INSERT politikalarında ifade with_check'te, SELECT'te qual'da durur;
  -- ikisi birleştirilip bucket adı aranır.
  SELECT cmd, coalesce(qual, '') || ' ' || coalesce(with_check, '') AS ifade
  FROM pg_policies
  WHERE schemaname = 'storage' AND tablename = 'objects'
),
b AS (
  SELECT public FROM storage.buckets WHERE id = 'job-applications'
),
sayim AS (
  SELECT
    (SELECT count(*) FROM storage.objects WHERE bucket_id = 'job-applications') AS dosya,
    (SELECT count(*) FROM public.job_applications) AS basvuru,
    (SELECT count(*) FROM public.job_applications
      WHERE photo_url IS NOT NULL OR cv_url IS NOT NULL) AS belgeli
)

SELECT '1. bucket' AS kontrol,
       CASE WHEN NOT EXISTS (SELECT 1 FROM b) THEN 'HATA'
            WHEN (SELECT public FROM b) THEN 'UYARI'
            ELSE 'TAMAM' END AS durum,
       CASE WHEN NOT EXISTS (SELECT 1 FROM b)
              THEN 'job-applications bucket''i YOK; job_applications_migration.sql calistirilmamis.'
            WHEN (SELECT public FROM b)
              THEN 'Bucket hala PUBLIC. hr_role migration''in storage bolumu yetki hatasiyla atlanmis. Dashboard > Storage > job-applications > Settings''ten Public kapatin.'
            ELSE 'Bucket mevcut ve gizli.' END AS aciklama

UNION ALL SELECT '2. yukleme izni (anon INSERT)',
       CASE WHEN EXISTS (SELECT 1 FROM pol WHERE cmd = 'INSERT' AND ifade ILIKE '%job-applications%')
            THEN 'TAMAM' ELSE 'HATA' END,
       CASE WHEN EXISTS (SELECT 1 FROM pol WHERE cmd = 'INSERT' AND ifade ILIKE '%job-applications%')
            THEN 'INSERT politikasi var; aday dosya yukleyebilir.'
            ELSE 'INSERT politikasi YOK. Adayin yuklemesi RLS''e takilir, hicbir dosya kaydedilemez.' END

UNION ALL SELECT '3. okuma izni (IK SELECT)',
       CASE WHEN EXISTS (SELECT 1 FROM pol WHERE cmd = 'SELECT' AND ifade ILIKE '%job-applications%')
            THEN 'TAMAM' ELSE 'HATA' END,
       CASE WHEN EXISTS (SELECT 1 FROM pol WHERE cmd = 'SELECT' AND ifade ILIKE '%job-applications%')
            THEN 'SELECT politikasi var; createSignedUrl calisir.'
            ELSE 'SELECT politikasi YOK. Panelde "Belge acilamadi" hatasi alinir.' END

UNION ALL SELECT '4. bucket icindeki dosya',
       CASE WHEN (SELECT dosya FROM sayim) > 0 THEN 'TAMAM' ELSE 'HATA' END,
       'Yuklu dosya sayisi: ' || (SELECT dosya FROM sayim)::text ||
       ' (0 ise ref hatasi dogrulanir: hicbir dosya hic yuklenmemis)'

UNION ALL SELECT '5. kayitlardaki belge yolu',
       CASE WHEN (SELECT belgeli FROM sayim) > 0 THEN 'TAMAM' ELSE 'HATA' END,
       'Toplam basvuru: ' || (SELECT basvuru FROM sayim)::text ||
       ' / belgesi olan: ' || (SELECT belgeli FROM sayim)::text

ORDER BY 1;
