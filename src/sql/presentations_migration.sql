-- =====================================================================
-- Sunum PDF'leri (admin panelinden yüklenip link ile paylaşılır)
-- =====================================================================
-- 1) "presentations" tablosu: başlık + kısa ad (slug) + dosya yolu.
-- 2) "presentations" bucket'ı: yalnızca PDF, en fazla 50MB, public.
--    Paylaşılan link https://<site>/sunum/<slug> biçimindedir; vercel.json
--    bu yolu bucket'taki <slug>.pdf dosyasına yönlendirir.
--
-- Güvenlik:
--   - Bucket public olduğu için dosya, linki bilen herkes tarafından açılır.
--     Slug'a rastgele bir ek konduğu için linkler tahmin edilemez.
--   - storage.objects üzerinde herkese açık SELECT politikası YOK →
--     ziyaretçiler bucket içeriğini listeleyemez.
--   - Tabloyu yalnızca admin/super_admin okuyup yazabilir.
--
-- Script idempotent: tekrar tekrar güvenle çalıştırılabilir.
-- =====================================================================

-- 1) Tablo
CREATE TABLE IF NOT EXISTS public.presentations (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  file_path TEXT NOT NULL,
  file_size BIGINT,
  created_by UUID DEFAULT auth.uid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.presentations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admin select presentations" ON public.presentations;
CREATE POLICY "Admin select presentations"
  ON public.presentations FOR SELECT
  TO authenticated
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admin insert presentations" ON public.presentations;
CREATE POLICY "Admin insert presentations"
  ON public.presentations FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admin update presentations" ON public.presentations;
CREATE POLICY "Admin update presentations"
  ON public.presentations FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admin delete presentations" ON public.presentations;
CREATE POLICY "Admin delete presentations"
  ON public.presentations FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- 2) Bucket (yalnızca PDF, 50MB)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('presentations', 'presentations', true, 52428800, ARRAY['application/pdf'])
ON CONFLICT (id) DO UPDATE
  SET public = EXCLUDED.public,
      file_size_limit = EXCLUDED.file_size_limit,
      allowed_mime_types = EXCLUDED.allowed_mime_types;

-- 3) Storage politikaları — yalnızca admin yükler/değiştirir/siler.
--    (upsert ile dosya değiştirmek SELECT + UPDATE yetkisi de ister.)
DROP POLICY IF EXISTS "Admin Select presentations" ON storage.objects;
CREATE POLICY "Admin Select presentations"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'presentations' AND public.is_admin());

DROP POLICY IF EXISTS "Admin Insert presentations" ON storage.objects;
CREATE POLICY "Admin Insert presentations"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'presentations' AND public.is_admin());

DROP POLICY IF EXISTS "Admin Update presentations" ON storage.objects;
CREATE POLICY "Admin Update presentations"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'presentations' AND public.is_admin())
  WITH CHECK (bucket_id = 'presentations' AND public.is_admin());

DROP POLICY IF EXISTS "Admin Delete presentations" ON storage.objects;
CREATE POLICY "Admin Delete presentations"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'presentations' AND public.is_admin());
