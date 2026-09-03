-- ============================================================
-- İş başvurularına yeni durum değerleri
--
-- Eklenenler:
--   kara_liste    -> Bir daha değerlendirilmeyecek aday
--   eski_calisan  -> Daha önce grupta çalışmış aday
--   red           -> Başvurusu reddedilen aday
--
-- 'red' ile mevcut 'olumsuz' arasındaki fark bilinçlidir:
--   olumsuz = değerlendirme sonucu uygun bulunmadı (havuzda kalır)
--   red     = başvuru resmen reddedildi (kapanmış kayıt)
-- İK ikisini ayrı raporladığı için tek değere indirgenmedi.
--
-- Çalıştırma: Supabase SQL Editor'de bir kez.
-- ============================================================

DO $do$
BEGIN
  -- CHECK kısıtı kurulumlar arasında farklı adlandırılmış olabilir;
  -- status kolonuna değen kısıt neyse o düşürülür.
  IF EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'public.job_applications'::regclass
      AND conname = 'job_applications_status_check'
  ) THEN
    ALTER TABLE public.job_applications
      DROP CONSTRAINT job_applications_status_check;
  END IF;

  ALTER TABLE public.job_applications
    ADD CONSTRAINT job_applications_status_check
    CHECK (status IN (
      'yeni', 'incelendi', 'gorusme', 'olumlu', 'olumsuz', 'arsiv',
      'kara_liste', 'eski_calisan', 'red'
    ));
EXCEPTION
  WHEN undefined_table THEN
    RAISE NOTICE 'public.job_applications bulunamadi, durum kisiti atlandi.';
END $do$;

COMMENT ON COLUMN public.job_applications.status IS
  'yeni | incelendi | gorusme | olumlu | olumsuz | red | eski_calisan | kara_liste | arsiv';

-- PostgREST şema cache'ini tazele
NOTIFY pgrst, 'reload schema';
