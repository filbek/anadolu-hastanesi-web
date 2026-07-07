-- =====================================================================
-- Kalite Yönetim Birimi Organizasyon Şeması (PDF) alanı
-- =====================================================================
-- 1) site_settings tablosuna, admin panelinden yüklenen organizasyon
--    şeması PDF'inin public URL'ini saklayacak sütunu ekler.
-- 2) PDF yüklemeleri için "quality-documents" adında, MIME kısıtlaması
--    olmayan (PDF dahil tüm dosyaları kabul eden) public bir bucket oluşturur.
--    (Mevcut "doctor-images" bucket'ı yalnızca resim kabul ettiği için
--     PDF yüklemeleri 415 invalid_mime_type hatası veriyordu.)
--
-- NOT: PostgreSQL "CREATE POLICY IF NOT EXISTS" desteklemez. Bu yüzden
-- her policy öncesinde "DROP POLICY IF EXISTS" kullanıldı → script
-- tekrar tekrar güvenle çalıştırılabilir (idempotent).
-- =====================================================================

-- 1) Sütun (zaten eklendiyse atlanır)
ALTER TABLE public.site_settings
  ADD COLUMN IF NOT EXISTS organization_chart_pdf_url TEXT;

-- 2) Bucket (MIME kısıtlaması YOK → application/pdf kabul edilir)
INSERT INTO storage.buckets (id, name, public)
VALUES ('quality-documents', 'quality-documents', true)
ON CONFLICT (id) DO NOTHING;

-- 3) Storage politikaları (her çalıştırmada güvenle yeniden oluşturulur)

-- Herkes (ziyaretçiler) okuyabilsin
DROP POLICY IF EXISTS "Public Read quality-documents" ON storage.objects;
CREATE POLICY "Public Read quality-documents"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'quality-documents');

-- Authenticated (admin) yükleyebilsin
DROP POLICY IF EXISTS "Authenticated Insert quality-documents" ON storage.objects;
CREATE POLICY "Authenticated Insert quality-documents"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'quality-documents');

-- Authenticated (admin) silebilsin
DROP POLICY IF EXISTS "Authenticated Delete quality-documents" ON storage.objects;
CREATE POLICY "Authenticated Delete quality-documents"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'quality-documents');
