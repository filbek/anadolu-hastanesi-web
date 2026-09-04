-- ============================================================
-- Mükerrer kayıt teşhisi
--
-- "SQL çalıştı ama mükerrer duruyor" durumunda nedeni ayırt eder:
--   A) Migration nesneleri gerçekten oluştu mu?
--   B) Kimlik no'ya göre mükerrer kaldı mı? (kalmamalı)
--   C) Kullanıcının gördüğü mükerrer AD bazında mı? (kimlik no farklıysa
--      birleştirme çalışmaz — asıl şüpheli budur)
--
-- Salt okunur: hiçbir şeyi değiştirmez.
-- Migration çalıştırılmamış veritabanında da çalışır: kimlik no
-- normalleştirmesi public.normalized_national_id() yerine satır içi
-- regexp_replace ile yapılır.
-- ============================================================

-- ── A) Migration nesneleri ──────────────────────────────────
SELECT
  'A. kurulum' AS bolum,
  x.ad AS kontrol,
  CASE WHEN x.var THEN 'TAMAM' ELSE 'EKSIK' END AS durum,
  '' AS ayrinti
FROM (
  VALUES
    ('updated_at kolonu', EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema='public' AND table_name='job_applications'
        AND column_name='updated_at')),
    ('submission_count kolonu', EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema='public' AND table_name='job_applications'
        AND column_name='submission_count')),
    ('revisions tablosu', EXISTS (
      SELECT 1 FROM information_schema.tables
      WHERE table_schema='public' AND table_name='job_application_revisions')),
    ('mukerrer engelleme trigger', EXISTS (
      SELECT 1 FROM pg_trigger
      WHERE tgname='trg_merge_duplicate_job_application' AND NOT tgisinternal)),
    ('kimlik no unique index', EXISTS (
      SELECT 1 FROM pg_indexes
      WHERE schemaname='public' AND indexname='uq_job_applications_national_id'))
) AS x(ad, var)

UNION ALL

-- ── B) Kimlik no'ya göre kalan mükerrer (0 olmalı) ──────────
SELECT
  'B. kimlik nolu mukerrer',
  coalesce(nullif(regexp_replace(coalesce(national_id, ''), '\D', '', 'g'), ''), '(BOS KIMLIK NO)'),
  CASE WHEN count(*) > 1 THEN 'MUKERRER' ELSE 'TEKIL' END,
  count(*)::text || ' kayit: ' || string_agg(full_name || ' #' || id, ', ' ORDER BY id)
FROM public.job_applications
GROUP BY 1, 2
HAVING count(*) > 1

UNION ALL

-- ── C) Ada göre mükerrer — kimlik no farklıysa burada çıkar ──
--     Aynı isim + farklı kimlik no => birleştirme kapsamına girmemiştir.
SELECT
  'C. ad bazinda mukerrer',
  lower(btrim(regexp_replace(full_name, '\s+', ' ', 'g'))),
  CASE
    WHEN count(DISTINCT regexp_replace(coalesce(national_id, ''), '\D', '', 'g')) > 1
      THEN 'KIMLIK NO FARKLI'
    ELSE 'AYNI KIMLIK'
  END,
  count(*)::text || ' kayit | kimlik nolar: ' ||
  string_agg(DISTINCT coalesce(nullif(regexp_replace(coalesce(national_id, ''), '\D', '', 'g'), ''), '(bos)'), ' / ')
FROM public.job_applications
GROUP BY 1, 2
HAVING count(*) > 1

UNION ALL

-- ── D) Toplam ───────────────────────────────────────────────
-- NOT: submission_count ve job_application_revisions bu sorguda
-- BİLEREK kullanılmadı; migration çalışmamışken sorgunun tamamı
-- "column does not exist" ile düşerdi. A bölümü zaten kurulumu gösteriyor.
SELECT
  'D. birlestirme izi',
  'toplam basvuru',
  '-',
  count(*)::text
FROM public.job_applications

ORDER BY 1, 2;
