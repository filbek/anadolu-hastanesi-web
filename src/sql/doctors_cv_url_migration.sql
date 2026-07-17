-- =====================================================================
-- Doktor Özgeçmiş (CV) PDF alanı
-- =====================================================================
-- 1) doctors tablosuna, admin panelinden yüklenen doktor özgeçmiş
--    PDF'inin public URL'ini saklayacak sütunu ekler.
-- 2) PDF yüklemeleri için "quality-documents" bucket'ını yeniden kullanır
--    (bu bucket zaten organization_chart_pdf_migration.sql ile MIME
--    kısıtlaması olmadan, public olarak oluşturuldu ve politikaları
--    tanımlandı → application/pdf kabul eder). Yol: doctor-cv/{dosya}.
--
-- NOT: Burada bucket tekrar oluşturulmuyor; "quality-documents" yoksa
-- önce organization_chart_pdf_migration.sql çalıştırılmalıdır.
-- =====================================================================

-- 1) Sütun (zaten eklendiyse atlanır)
ALTER TABLE public.doctors
  ADD COLUMN IF NOT EXISTS cv_url TEXT;
