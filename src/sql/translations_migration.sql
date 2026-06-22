-- ============================================================
-- Anadolu Hastaneleri Grubu - Çoklu Dil Çeviri Sistemi
-- Tüm içerik tablolarına `translations JSONB` sütunu ekler.
-- Format: {"en": {"name": "...", "description": "..."}, "ar": {...}}
-- Idempotent: birden fazla kez çalıştırılabilir.
-- Çalıştırma: Supabase SQL Editor'a yapıştırıp Run.
-- ============================================================

-- Yardımcı: bir tabloya translations sütununu ekleyen DO bloğu
-- (information_schema kontrolü ile - tablo yoksa sessizce atlar)
DO $$
DECLARE
  t TEXT;
  tables TEXT[] := ARRAY[
    'hospitals',
    'departments',
    'doctors',
    'health_articles',
    'pages',
    'hero_slides',
    'testimonials',
    'news_items',
    'site_stats',
    'accreditations',
    'about_content',
    'contact_info',
    'seo_settings'
  ];
BEGIN
  FOREACH t IN ARRAY tables
  LOOP
    IF EXISTS (
      SELECT 1 FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = t
    ) THEN
      EXECUTE format(
        'ALTER TABLE public.%I ADD COLUMN IF NOT EXISTS translations JSONB DEFAULT ''{}''::jsonb',
        t
      );
      RAISE NOTICE '✓ % tablosuna translations sütunu eklendi (varsa atlandı)', t;
    ELSE
      RAISE NOTICE '⚠ % tablosu bulunamadı, atlandı', t;
    END IF;
  END LOOP;
END $$;

-- ============================================================
-- KONTROL: hangi tablolarda translations var?
-- ============================================================
SELECT
  t.tname AS table_name,
  CASE WHEN c.column_name IS NOT NULL THEN '✓ var' ELSE '✗ yok / tablo eksik' END AS has_translations
FROM (
  VALUES
    ('hospitals'), ('departments'), ('doctors'), ('health_articles'),
    ('pages'), ('hero_slides'), ('testimonials'), ('news_items'),
    ('site_stats'), ('accreditations'), ('about_content'),
    ('contact_info'), ('seo_settings')
) AS t(tname)
LEFT JOIN information_schema.columns c
  ON c.table_schema = 'public'
  AND c.table_name = t.tname
  AND c.column_name = 'translations'
ORDER BY t.tname;
