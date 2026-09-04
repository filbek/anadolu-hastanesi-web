-- ============================================================
-- Anadolu Hastaneleri Grubu — Mükerrer iş başvurularının tekilleştirilmesi
--
-- SORUN: Aynı aday formu birden çok kez doldurduğunda her seferinde yeni
-- satır oluşuyordu; panelde aynı kişi 3 kez listeleniyor, İK hangisinin
-- güncel olduğunu ayırt edemiyordu.
--
-- ÇÖZÜM:
--   1) Kimlik anahtarı T.C. kimlik no (rakamlara indirgenmiş hâli).
--   2) Yeni gönderim, var olan kaydın ÜZERİNE yazılır; eski hâli
--      job_application_revisions'a arşivlenir (veri kaybı olmaz).
--   3) Güncellenen kayıt "okunmadı" işaretlenir, submission_count artar ve
--      updated_at damgalanır — İK güncellemeyi panelde görür.
--   4) Mevcut mükerrer kayıtlar birleştirilir.
--
-- Tekilleştirme TRIGGER ile yapılır, RPC ile değil: böylece istemcinin
-- eski sürümü canlıda kalsa bile mükerrer kayıt oluşamaz.
--
-- Idempotent: birden fazla kez çalıştırılabilir.
-- Bağımlılık: job_applications_migration.sql,
--             hr_role_job_applications_migration.sql,
--             job_application_notes_migration.sql
-- ============================================================


-- ============================================================
-- 1) YENİ ALANLAR
-- ============================================================

ALTER TABLE public.job_applications
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS submission_count INTEGER NOT NULL DEFAULT 1,
  -- Aday elindeki eski başvuru numarasıyla aradığında bulunabilsin
  ADD COLUMN IF NOT EXISTS previous_reference_codes TEXT[] DEFAULT '{}';


-- ============================================================
-- 2) SÜRÜM ARŞİVİ
--
-- Üzerine yazmak veri kaybı demek olmasın diye kaydın önceki hâli olduğu
-- gibi saklanır. Yalnızca trigger yazar; istemcinin yazma yetkisi yoktur.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.job_application_revisions (
  id BIGSERIAL PRIMARY KEY,
  application_id INTEGER NOT NULL
    REFERENCES public.job_applications(id) ON DELETE CASCADE,
  reference_code TEXT,
  submitted_at TIMESTAMPTZ,
  snapshot JSONB NOT NULL,
  archived_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_job_application_revisions_app
  ON public.job_application_revisions(application_id, submitted_at DESC);

ALTER TABLE public.job_application_revisions ENABLE ROW LEVEL SECURITY;

DO $do$
DECLARE pol RECORD;
BEGIN
  FOR pol IN
    SELECT policyname FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'job_application_revisions'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.job_application_revisions', pol.policyname);
  END LOOP;
END $do$;

-- Okuma İK + yöneticiler; yazma yalnızca trigger (SECURITY DEFINER)
CREATE POLICY "HR reads application revisions" ON public.job_application_revisions
  FOR SELECT TO authenticated USING (public.is_hr());

REVOKE ALL ON public.job_application_revisions FROM anon;
GRANT SELECT ON public.job_application_revisions TO authenticated;


-- ============================================================
-- 3) KİMLİK ANAHTARI
--
-- Aday "12345678901", "123 456 789 01" ya da "12345678901 " yazabiliyor;
-- karşılaştırma rakamlara indirgenmiş hâl üzerinden yapılır.
-- ============================================================

CREATE OR REPLACE FUNCTION public.normalized_national_id(value TEXT)
RETURNS TEXT
LANGUAGE sql
IMMUTABLE
AS $fn$
  SELECT regexp_replace(coalesce(value, ''), '\D', '', 'g');
$fn$;


-- ============================================================
-- 4) MEVCUT MÜKERRER KAYITLARI BİRLEŞTİR
--
-- En yeni kayıt esas alınır (aday en güncel bilgiyi son gönderimde verir).
-- Eskilerde DOLU olup yenisinde BOŞ kalan alanlar esas kayda taşınır —
-- örneğin ilk gönderimde CV varsa, sonrakinde yoksa CV kaybolmaz.
-- Notlar esas kayda bağlanır, eski kayıtlar arşivlenip silinir.
-- ============================================================

DO $do$
DECLARE
  grp RECORD;
  older RECORD;
  col TEXT;
  merged INTEGER := 0;
  removed INTEGER := 0;
  -- Birleştirmeye KAPALI alanlar: kimlik, İK'nın kendi verisi ve sayaçlar
  skip_cols CONSTANT TEXT[] := ARRAY[
    'id', 'reference_code', 'previous_reference_codes', 'national_id',
    'created_at', 'updated_at', 'submission_count',
    'status', 'is_read', 'admin_note', 'retention_until'
  ];
BEGIN
  FOR grp IN
    SELECT public.normalized_national_id(national_id) AS nid,
           -- En yeni kayıt esas alınır
           (array_agg(id ORDER BY created_at DESC, id DESC))[1] AS keeper_id,
           array_agg(id ORDER BY created_at DESC, id DESC) AS all_ids
    FROM public.job_applications
    WHERE public.normalized_national_id(national_id) <> ''
    GROUP BY 1
    HAVING count(*) > 1
  LOOP
    -- Yeniden eskiye doğru: esas kayıt eksiğini en yakın eski gönderimden alsın
    FOR older IN
      SELECT id, created_at, reference_code
      FROM public.job_applications
      WHERE id = ANY(grp.all_ids) AND id <> grp.keeper_id
      ORDER BY created_at DESC, id DESC
    LOOP
      -- 4a) Eski kaydın tamamını arşivle
      INSERT INTO public.job_application_revisions
        (application_id, reference_code, submitted_at, snapshot)
      SELECT grp.keeper_id, j.reference_code, j.created_at, to_jsonb(j)
      FROM public.job_applications j
      WHERE j.id = older.id;

      -- 4b) Esas kayıtta boş kalan alanları eskisinden doldur.
      --     Boş sayılanlar: NULL, boş metin, boş JSONB ve boş dizi.
      FOR col IN
        SELECT column_name FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'job_applications'
          AND NOT (column_name = ANY(skip_cols))
      LOOP
        EXECUTE format(
          'UPDATE public.job_applications k
              SET %1$I = o.%1$I
             FROM public.job_applications o
            WHERE k.id = $1 AND o.id = $2
              AND (k.%1$I IS NULL OR k.%1$I::text IN (''[]'', ''{}'', ''''))
              AND o.%1$I IS NOT NULL
              AND o.%1$I::text NOT IN (''[]'', ''{}'', '''')',
          col
        ) USING grp.keeper_id, older.id;
      END LOOP;

      -- 4c) Notlar esas kayda taşınır (silinen satırla birlikte gitmesin)
      UPDATE public.job_application_notes
      SET application_id = grp.keeper_id
      WHERE application_id = older.id;

      -- 4d) Eski başvuru numarası aranabilir kalsın
      UPDATE public.job_applications
      SET previous_reference_codes =
            array_remove(coalesce(previous_reference_codes, '{}') || older.reference_code, NULL)
      WHERE id = grp.keeper_id;

      DELETE FROM public.job_applications WHERE id = older.id;
      removed := removed + 1;
    END LOOP;

    -- 4e) Sayaç ve güncelleme damgası
    UPDATE public.job_applications
    SET submission_count = array_length(grp.all_ids, 1),
        updated_at = created_at
    WHERE id = grp.keeper_id;

    merged := merged + 1;
  END LOOP;

  RAISE NOTICE 'Birlestirme tamam: % kisi, % mukerrer kayit silindi.', merged, removed;

EXCEPTION
  -- Bir grupta beklenmedik hata çıkarsa TÜM betik geri alınmasın:
  -- şema ve trigger kurulu kalsın ki en azından YENİ mükerrer oluşmasın.
  -- Birleştirme sonradan tekrar çalıştırılabilir (idempotent).
  WHEN others THEN
    RAISE NOTICE 'BIRLESTIRME YAPILAMADI: % (%). Sema ve trigger kuruldu; birlestirmeyi tekrar calistirin.',
      SQLERRM, SQLSTATE;
END $do$;


-- ============================================================
-- 5) BUNDAN SONRA MÜKERRER OLUŞMASIN
--
-- BEFORE INSERT trigger'ı aynı T.C. kimlik nolu kayıt varsa INSERT'i iptal
-- eder (RETURN NULL) ve mevcut satırı günceller.
--
-- SECURITY DEFINER: ziyaretçinin (anon) UPDATE yetkisi YOKTUR ve olmamalıdır;
-- güncellemeyi tablo sahibi adına trigger yapar. Böylece bir saldırgan
-- doğrudan UPDATE ile başkasının başvurusunu değiştiremez; yalnızca kendi
-- gönderdiği formun alanları yazılır.
-- ============================================================

CREATE OR REPLACE FUNCTION public.merge_duplicate_job_application()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $fn$
DECLARE
  nid TEXT := public.normalized_national_id(NEW.national_id);
  existing public.job_applications%ROWTYPE;
BEGIN
  IF nid = '' THEN
    RETURN NEW;  -- kimlik no yoksa tekilleştirilemez, normal kayıt
  END IF;

  SELECT * INTO existing
  FROM public.job_applications
  WHERE public.normalized_national_id(national_id) = nid
  ORDER BY created_at DESC, id DESC
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN NEW;  -- kişinin ilk başvurusu
  END IF;

  -- Mevcut hâli arşivle
  INSERT INTO public.job_application_revisions
    (application_id, reference_code, submitted_at, snapshot)
  VALUES (existing.id, existing.reference_code, existing.created_at, to_jsonb(existing));

  UPDATE public.job_applications SET
    reference_code = NEW.reference_code,
    previous_reference_codes =
      array_remove(coalesce(previous_reference_codes, '{}') || existing.reference_code, NULL),

    position = NEW.position,
    position_group = NEW.position_group,
    hospital = NEW.hospital,

    full_name = NEW.full_name,
    national_id = NEW.national_id,
    gender = NEW.gender,
    birth_place_date = NEW.birth_place_date,
    marital_status = NEW.marital_status,
    nationality = NEW.nationality,
    address = NEW.address,
    mobile_phone = NEW.mobile_phone,
    home_phone = NEW.home_phone,
    alternative_phone = NEW.alternative_phone,
    email = NEW.email,
    blood_type = NEW.blood_type,
    drivers_license = NEW.drivers_license,
    military_status = NEW.military_status,
    military_deferral_date = NEW.military_deferral_date,
    smoker = NEW.smoker,
    relative_at_company = NEW.relative_at_company,
    relative_name = NEW.relative_name,
    interviewed_before = NEW.interviewed_before,
    previous_position = NEW.previous_position,
    spouse_occupation = NEW.spouse_occupation,
    health_issues = NEW.health_issues,
    preferred_cities = NEW.preferred_cities,

    -- Belgeler: yeni gönderimde yoksa eskisi korunur
    photo_url = coalesce(NEW.photo_url, existing.photo_url),
    cv_url = coalesce(NEW.cv_url, existing.cv_url),

    education = NEW.education,
    experience = NEW.experience,
    skills = NEW.skills,
    computer_skills = NEW.computer_skills,
    languages = NEW.languages,
    certificates = NEW.certificates,
    references_list = NEW.references_list,
    profession_notes = NEW.profession_notes,

    earliest_start_date = NEW.earliest_start_date,
    overtime = NEW.overtime,
    weekend_work = NEW.weekend_work,
    night_shift = NEW.night_shift,
    public_holiday = NEW.public_holiday,
    travel = NEW.travel,
    last_salary = NEW.last_salary,
    expected_salary = NEW.expected_salary,

    signature = NEW.signature,
    signature_date = NEW.signature_date,
    consent = NEW.consent,

    -- İK'nın kendi verisi KORUNUR: durum ve notlar silinmez.
    -- Yalnızca "okunmadı"ya çekilir ki güncelleme panelde göze çarpsın.
    is_read = false,
    submission_count = coalesce(existing.submission_count, 1) + 1,
    updated_at = now(),
    -- Saklama süresi son gönderimden itibaren yeniden başlar
    retention_until = (now() + INTERVAL '2 years')::date
  WHERE id = existing.id;

  RETURN NULL;  -- INSERT iptal: yeni satır oluşmaz
END $fn$;

DROP TRIGGER IF EXISTS trg_merge_duplicate_job_application ON public.job_applications;
CREATE TRIGGER trg_merge_duplicate_job_application
  BEFORE INSERT ON public.job_applications
  FOR EACH ROW EXECUTE FUNCTION public.merge_duplicate_job_application();


-- ============================================================
-- 6) SON EMNİYET KEMERİ
--
-- Trigger devre dışı kalsa bile veri yeniden mükerrerleşmesin.
-- Kısmi index: kimlik no boş olan eski kayıtlar kapsam dışıdır.
-- ============================================================

-- Kalan mükerrer varsa bu index oluşmaz ve hata verir. Hata betiğin
-- tamamını geri almasın diye yakalanır; tekilleştirmeyi zaten trigger
-- yapıyor, index yalnızca ikinci savunma hattı.
DO $do$
BEGIN
  CREATE UNIQUE INDEX IF NOT EXISTS uq_job_applications_national_id
    ON public.job_applications (public.normalized_national_id(national_id))
    WHERE public.normalized_national_id(national_id) <> '';
EXCEPTION
  WHEN unique_violation THEN
    RAISE NOTICE 'Kimlik no unique index olusturulamadi: hala mukerrer kayit var. Once teshis sorgusunu calistirin.';
  WHEN others THEN
    RAISE NOTICE 'Kimlik no unique index olusturulamadi: % (%)', SQLERRM, SQLSTATE;
END $do$;

NOTIFY pgrst, 'reload schema';


-- ============================================================
-- KONTROL
-- ============================================================

-- 1) Kalan mükerrer olmamalı: 0 satır dönmeli
SELECT public.normalized_national_id(national_id) AS kimlik, count(*) AS kayit
FROM public.job_applications
WHERE public.normalized_national_id(national_id) <> ''
GROUP BY 1 HAVING count(*) > 1;

-- 2) Birden çok kez başvuranlar
SELECT id, full_name, reference_code, submission_count,
       previous_reference_codes, updated_at
FROM public.job_applications
WHERE submission_count > 1
ORDER BY updated_at DESC NULLS LAST;

-- 3) Toplam durum
SELECT (SELECT count(*) FROM public.job_applications)          AS basvuru,
       (SELECT count(*) FROM public.job_application_revisions) AS arsivlenen_surum;
