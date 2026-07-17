-- =====================================================================
-- Storage Bucket RLS Politikaları Düzeltmesi
-- =====================================================================
-- Sorun: Sosyal sorumluluk panelinde etkinlik kartlarına resim yüklerken
--   "new row violates row-level security policy" hatası alınıyordu.
--
-- Nedeni: "article-images" bucket'ı var ancak storage.objects üzerinde
--   authenticated kullanıcılar için INSERT politikası tanımlı değildi.
--   Admin (authenticated) yüklemeye çalışınca RLS tarafından reddedildi.
--   Aynı eksiklik "doctor-images" için de güvenlik altına alındı.
--
-- Bu script:
--   1) İlgili bucket'ların var olduğundan emin olur (public),
--   2) Her biri için okuma (herkese açık), yükleme/silme (authenticated)
--      politikalarını idempotent biçimde oluşturur.
--
-- NOT: PostgreSQL "CREATE POLICY IF NOT EXISTS" desteklemez. Bu yüzden
-- her policy öncesinde "DROP POLICY IF EXISTS" kullanıldı → script
-- tekrar tekrar güvenle çalıştırılabilir.
-- =====================================================================

-- -----------------------------------------------------------
-- 1) Bucket'ların var olduğundan emin ol (public)
-- -----------------------------------------------------------
INSERT INTO storage.buckets (id, name, public)
VALUES
  ('article-images', 'article-images', true),
  ('doctor-images', 'doctor-images', true)
ON CONFLICT (id) DO NOTHING;

-- -----------------------------------------------------------
-- 2) article-images politikaları
--    (makaleler, sosyal sorumluluk etkinlik görselleri, gebe okulu vb.)
-- -----------------------------------------------------------

-- Herkes (ziyaretçiler) okuyabilsin
DROP POLICY IF EXISTS "Public Read article-images" ON storage.objects;
CREATE POLICY "Public Read article-images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'article-images');

-- Authenticated (admin) yükleyebilsin
DROP POLICY IF EXISTS "Authenticated Insert article-images" ON storage.objects;
CREATE POLICY "Authenticated Insert article-images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'article-images');

-- Authenticated (admin) güncelleyebilsin (upsert/replaces)
DROP POLICY IF EXISTS "Authenticated Update article-images" ON storage.objects;
CREATE POLICY "Authenticated Update article-images"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'article-images')
  WITH CHECK (bucket_id = 'article-images');

-- Authenticated (admin) silebilsin
DROP POLICY IF EXISTS "Authenticated Delete article-images" ON storage.objects;
CREATE POLICY "Authenticated Delete article-images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'article-images');

-- -----------------------------------------------------------
-- 3) doctor-images politikaları
--    (doktor profil fotoğrafları, yönetim ekibi, makale görselleri vb.)
-- -----------------------------------------------------------

-- Herkes (ziyaretçiler) okuyabilsin
DROP POLICY IF EXISTS "Public Read doctor-images" ON storage.objects;
CREATE POLICY "Public Read doctor-images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'doctor-images');

-- Authenticated (admin) yükleyebilsin
DROP POLICY IF EXISTS "Authenticated Insert doctor-images" ON storage.objects;
CREATE POLICY "Authenticated Insert doctor-images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'doctor-images');

-- Authenticated (admin) güncelleyebilsin (upsert/replaces)
DROP POLICY IF EXISTS "Authenticated Update doctor-images" ON storage.objects;
CREATE POLICY "Authenticated Update doctor-images"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'doctor-images')
  WITH CHECK (bucket_id = 'doctor-images');

-- Authenticated (admin) silebilsin
DROP POLICY IF EXISTS "Authenticated Delete doctor-images" ON storage.objects;
CREATE POLICY "Authenticated Delete doctor-images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'doctor-images');
