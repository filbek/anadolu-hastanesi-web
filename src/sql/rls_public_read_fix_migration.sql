-- ============================================================
-- Anadolu Hastaneleri Grubu - Herkese Açık Okumayı Daraltma
--
-- SIRA: rls_hardening_migration.sql'den SONRA çalıştırın.
--
-- NEDEN GEREKLİ (bir önceki migration'ın düzeltmesi)
-- rls_hardening_migration.sql, içerik tablolarındaki dağınık politikaları
-- temizlerken okuma politikasını `USING (true)` olarak yeniden yazdı.
-- Ancak eski politikaların bir kısmı FİLTRELİYDİ:
--   "Allow public read access to published blog posts"
--   "Allow public read access on approved testimonials"
--   "Allow public read access on active treatments"
-- Filtre kaybolduğu için TASLAK yazılar ve YAYINLANMAMIŞ kayıtlar
-- anonim API üzerinden okunabilir hâle geldi. Bu dosya filtreyi geri koyar.
--
-- Panel etkilenmez: admin authenticated olarak "Admins write" politikasıyla
-- (FOR ALL) her satırı görmeye devam eder.
--
-- Idempotent: birden fazla kez çalıştırılabilir.
-- ============================================================

/*
 * Her tablo için yayın durumunu tutan sütunu bulup okuma politikasını
 * ona göre kurar. Sütun adları tablodan tabloya değiştiği (ve bazı
 * tablolarda hiç olmadığı) için sabit liste yerine tespit ediliyor.
 *
 * COALESCE(...) kullanılıyor: sütunu NULL olan eski kayıtlar
 * yanlışlıkla gizlenmesin — amaç içerik saklamak değil, taslakları
 * kapatmak.
 */
DO $$
DECLARE
  t TEXT;
  gate TEXT;
  candidates TEXT[] := ARRAY['is_published', 'is_active', 'is_approved'];
  c TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'blog_posts',
    'testimonials',
    'treatments',
    'faqs',
    'management_team',
    'contracted_institutions',
    'quality_committees',
    'social_responsibility_activities'
  ]
  LOOP
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = t
    ) THEN
      CONTINUE;
    END IF;

    -- Bu tabloda hangi yayın sütunu var?
    gate := NULL;
    FOREACH c IN ARRAY candidates
    LOOP
      IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = t AND column_name = c
      ) THEN
        gate := c;
        EXIT;
      END IF;
    END LOOP;

    EXECUTE format('DROP POLICY IF EXISTS "Public read" ON public.%I', t);

    IF gate IS NULL THEN
      -- Yayın sütunu yok — tablo zaten tamamen herkese açık içerik
      EXECUTE format($f$
        CREATE POLICY "Public read" ON public.%I FOR SELECT USING (true)
      $f$, t);
      RAISE NOTICE '% : yayın sütunu yok, okuma açık bırakıldı', t;
    ELSE
      EXECUTE format($f$
        CREATE POLICY "Public read" ON public.%I
          FOR SELECT USING (COALESCE(%I, true))
      $f$, t, gate);
      RAISE NOTICE '% : okuma % sütunuyla filtrelendi', t, gate;
    END IF;
  END LOOP;
END $$;

-- ============================================================
-- KONTROL
--
-- Her satırda "qual" sütununda filtre görünmeli; `true` kalanlar
-- yayın sütunu olmayan tablolardır.
-- ============================================================

SELECT tablename, policyname, qual
FROM pg_policies
WHERE schemaname = 'public'
  AND policyname = 'Public read'
ORDER BY tablename;
