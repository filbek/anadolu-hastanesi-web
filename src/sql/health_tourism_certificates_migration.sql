-- ============================================================
-- Sağlık Turizmi Yetki Belgeleri
--
-- /saglik-turizmi sayfasında gösterilen yetki belgeleri artık koda gömülü
-- değil; site_settings üzerindeki JSONB sütunda tutulur.
-- Yönetim: Admin > Sağlık Turizmi > "Sağlık Turizmi Yetki Belgeleri".
--
-- Yapı: [{ "id": "silivri", "title": "Silivri Anadolu Hastanesi",
--          "subtitle": "Uluslararası Sağlık Turizmi Yetki Belgesi",
--          "image_url": "/uploads/saglik-turizmi-yetki-belgesi.png" }]
--   Dizi sırası ekranda görünen sıradır.
--
-- Görseller "quality-documents" bucket'ına (health-tourism/ klasörü)
-- yüklenir; bucket organization_chart_pdf_migration.sql ile oluşturulmuştur.
--
-- Idempotent: birden fazla kez çalıştırılabilir. Tohum veri yalnızca sütun
-- boşsa yazılır, panelden yapılan düzenlemeleri ezmez.
-- Çalıştırma: Supabase SQL Editor'a yapıştırıp Run.
-- ============================================================

ALTER TABLE public.site_settings
  ADD COLUMN IF NOT EXISTS health_tourism_certificates JSONB NOT NULL DEFAULT '[]'::jsonb;

-- Mevcut Silivri belgesini başlangıç verisi olarak aktar
UPDATE public.site_settings
SET health_tourism_certificates = '[{"id": "silivri", "title": "Silivri Anadolu Hastanesi", "subtitle": "Uluslararası Sağlık Turizmi Yetki Belgesi", "image_url": "/uploads/saglik-turizmi-yetki-belgesi.png"}]'::jsonb
WHERE health_tourism_certificates IS NULL OR health_tourism_certificates = '[]'::jsonb;

NOTIFY pgrst, 'reload schema';

-- KONTROL: 1 belge (Silivri) görünmeli
SELECT id, jsonb_array_length(health_tourism_certificates) AS belge_sayisi FROM public.site_settings;
