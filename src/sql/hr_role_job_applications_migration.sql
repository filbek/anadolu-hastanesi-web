-- ============================================================
-- Anadolu Hastaneleri Grubu - İK (HR) rolü ve iş başvurusu sertleştirmesi
--
-- Üç işi birden yapar:
--   1) job_applications tablosundaki "her oturum açan okuyabilir" açığını kapatır
--   2) profiles.role'e 'hr' değerini tanıtan is_hr() / has_panel_access() yardımcıları
--   3) job-applications storage bucket'ını gizliye çevirir (CV + vesikalık)
-- Ayrıca KVKK için saklama süresi alanı ve görüntüleme logu ekler.
--
-- Idempotent: birden fazla kez çalıştırılabilir.
-- Çalıştırma: Supabase SQL Editor'a yapıştırıp Run.
--
-- ÖNEMLİ: job_applications_migration.sql ve rls_hardening_migration.sql
-- (drop_all_policies yardımcısı için) bu dosyadan ÖNCE çalıştırılmış olmalıdır.
-- ============================================================


-- ============================================================
-- 1) ROL YARDIMCILARI
--
-- Tasarım kararı: 'hr' rolü is_admin()'in İÇİNE katılmaz. Katılsaydı İK
-- kullanıcısı doktor, hastane, site ayarları dahil her tabloya yazma hakkı
-- kazanırdı; çünkü diğer tüm politikalar is_admin() üzerinden yazılmış.
-- is_hr() yalnızca job_applications ve ilgili storage nesnelerinde kullanılır.
-- ============================================================

-- is_admin() normalde rls_hardening_migration.sql'den gelir. O dosya bu
-- veritabanında çalıştırılmamışsa aşağıdaki politikalar patlar; yoksa
-- aynı tanımla oluştur. VARSA DOKUNULMAZ (mevcut tanım korunur).
DO $do$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public' AND p.proname = 'is_admin'
  ) THEN
    EXECUTE $fn$
      CREATE FUNCTION public.is_admin()
      RETURNS BOOLEAN
      LANGUAGE sql
      STABLE
      SECURITY DEFINER
      SET search_path = public
      AS $body$
        SELECT EXISTS (
          SELECT 1 FROM public.profiles p
          WHERE p.id = auth.uid()
            AND p.role IN ('admin', 'super_admin')
        );
      $body$;
    $fn$;
    EXECUTE 'GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated';
    RAISE NOTICE 'is_admin() bulunamadi, olusturuldu.';
  END IF;
END $do$;

-- İK modülüne erişebilenler: İK personeli + yöneticiler
CREATE OR REPLACE FUNCTION public.is_hr()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $fn$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid()
      AND p.role IN ('hr', 'admin', 'super_admin')
  );
$fn$;

-- Admin paneline hiç girebilen roller. İstemcideki route guard'ın DB karşılığı;
-- ileride başka modül rolleri eklenirse tek yerden genişletilir.
CREATE OR REPLACE FUNCTION public.has_panel_access()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $fn$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid()
      AND p.role IN ('hr', 'admin', 'super_admin')
  );
$fn$;

GRANT EXECUTE ON FUNCTION public.is_hr() TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_panel_access() TO authenticated;

-- profiles.role üzerinde CHECK kısıtı varsa 'hr' değerine izin ver.
-- (Kurulumlar arasında kısıt adı farklı olabileceği için savunmacı yazıldı.)
DO $do$
DECLARE
  con_name TEXT;
BEGIN
  SELECT conname INTO con_name
  FROM pg_constraint
  WHERE conrelid = 'public.profiles'::regclass
    AND contype = 'c'
    AND pg_get_constraintdef(oid) ILIKE '%role%';

  IF con_name IS NOT NULL THEN
    EXECUTE format('ALTER TABLE public.profiles DROP CONSTRAINT %I', con_name);
  END IF;

  ALTER TABLE public.profiles
    ADD CONSTRAINT profiles_role_check
    CHECK (role IN ('user', 'editor', 'hr', 'admin', 'super_admin'));
EXCEPTION
  WHEN undefined_table THEN
    RAISE NOTICE 'public.profiles bulunamadi, rol kisiti atlandi.';
  WHEN others THEN
    RAISE NOTICE 'Rol kisiti uygulanamadi (mevcut veride gecersiz rol olabilir): %', SQLERRM;
END $do$;


-- ============================================================
-- 2) job_applications RLS SERTLEŞTİRMESİ
--
-- ÖNCEKİ DURUM (açık): "Allow read job applications" politikası
--   FOR SELECT TO authenticated USING (true)
-- idi. Yani siteye üye olmuş, rolü 'user' olan herhangi biri tüm başvuruların
-- TC kimlik no, adres, ücret beklentisi ve sağlık bilgisi alanlarını okuyabiliyordu.
-- rls_hardening_migration.sql'deki sertleştirme listesine bu tablo girmemişti.
-- ============================================================

ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;

-- Birikmiş eski politikaları topluca temizle
-- (politikalar OR'lanır; en gevşek olan kazanır).
-- rls_hardening_migration.sql'deki drop_all_policies() yardımcısına BAĞIMLI
-- OLMAMAK için döngü burada yazıldı; bu dosya tek başına çalışabilsin.
DO $do$
DECLARE
  pol RECORD;
BEGIN
  FOR pol IN
    SELECT policyname FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'job_applications'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.job_applications', pol.policyname);
  END LOOP;
END $do$;

-- Ziyaretçi yalnızca yeni başvuru gönderebilir
CREATE POLICY "Public can submit job application" ON public.job_applications
  FOR INSERT TO anon, authenticated WITH CHECK (true);

-- Okuma ve durum/not güncellemesi: İK + yöneticiler
CREATE POLICY "HR reads job applications" ON public.job_applications
  FOR SELECT TO authenticated USING (public.is_hr());

CREATE POLICY "HR updates job applications" ON public.job_applications
  FOR UPDATE TO authenticated USING (public.is_hr()) WITH CHECK (public.is_hr());

-- Kalıcı silme yalnızca yönetici (İK için 'arsiv' durumu var)
CREATE POLICY "Admins delete job applications" ON public.job_applications
  FOR DELETE TO authenticated USING (public.is_admin());

-- Tablo düzeyi yetkiler de aynı hizaya gelsin (RLS'in altındaki ikinci katman)
REVOKE ALL ON public.job_applications FROM anon;
GRANT INSERT ON public.job_applications TO anon;
GRANT USAGE, SELECT ON SEQUENCE public.job_applications_id_seq TO anon;


-- ============================================================
-- 3) STORAGE: CV VE FOTOĞRAFLARI GİZLİYE ÇEVİR
--
-- ÖNCEKİ DURUM (açık): bucket public:true ve SELECT politikası
--   USING (bucket_id = 'job-applications')
-- idi; adayların özgeçmişi ve vesikalık fotoğrafı, URL'i bilen herkese açıktı.
-- Artık panelde imzalı URL (createSignedUrl) ile açılır.
-- ============================================================

-- storage şeması bazı projelerde SQL Editor rolüne ait değildir; oradaki bir
-- yetki hatası tüm transaction'ı geri almasın diye bölüm izole edildi.
-- Hata alınırsa NOTICE basılır ve bu bölüm Dashboard > Storage üzerinden
-- elle yapılır (aşağıdaki KONTROL sorgusu durumu gösterir).
DO $do$
BEGIN
  UPDATE storage.buckets SET public = false WHERE id = 'job-applications';

  DROP POLICY IF EXISTS "Allow upload job application files" ON storage.objects;
  DROP POLICY IF EXISTS "Allow read job application files" ON storage.objects;
  DROP POLICY IF EXISTS "Anyone can upload job application files" ON storage.objects;
  DROP POLICY IF EXISTS "HR reads job application files" ON storage.objects;
  DROP POLICY IF EXISTS "Admins delete job application files" ON storage.objects;

  -- Aday başvuru sırasında dosya yükleyebilsin (yalnızca INSERT)
  CREATE POLICY "Anyone can upload job application files" ON storage.objects
    FOR INSERT TO anon, authenticated
    WITH CHECK (bucket_id = 'job-applications');

  -- Okuma yalnızca İK + yöneticiler; imzalı URL üretimi bu politikaya tabidir
  CREATE POLICY "HR reads job application files" ON storage.objects
    FOR SELECT TO authenticated
    USING (bucket_id = 'job-applications' AND public.is_hr());

  CREATE POLICY "Admins delete job application files" ON storage.objects
    FOR DELETE TO authenticated
    USING (bucket_id = 'job-applications' AND public.is_admin());
EXCEPTION
  WHEN insufficient_privilege THEN
    RAISE NOTICE 'storage bolumu atlandi (yetki yok): %. Dashboard > Storage uzerinden elle yapin.', SQLERRM;
  WHEN others THEN
    RAISE NOTICE 'storage bolumu uygulanamadi: %', SQLERRM;
END $do$;


-- ============================================================
-- 4) KVKK: SAKLAMA SÜRESİ
--
-- Başvurular özel nitelikli veri içerir, süresiz saklanamaz.
-- Varsayılan 2 yıl. Süresi dolanları silmek için purge fonksiyonu aşağıda;
-- pg_cron kuruluysa zamanlanabilir, değilse panelden/elle çalıştırılır.
-- ============================================================

ALTER TABLE public.job_applications
  ADD COLUMN IF NOT EXISTS retention_until DATE;

-- Mevcut kayıtlara başvuru tarihinden 2 yıl sonrası
UPDATE public.job_applications
SET retention_until = (created_at + INTERVAL '2 years')::date
WHERE retention_until IS NULL;

-- Yeni kayıtlar için otomatik doldur
CREATE OR REPLACE FUNCTION public.set_job_application_retention()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $fn$
BEGIN
  IF NEW.retention_until IS NULL THEN
    NEW.retention_until := (COALESCE(NEW.created_at, now()) + INTERVAL '2 years')::date;
  END IF;
  RETURN NEW;
END $fn$;

DROP TRIGGER IF EXISTS trg_job_application_retention ON public.job_applications;
CREATE TRIGGER trg_job_application_retention
  BEFORE INSERT ON public.job_applications
  FOR EACH ROW EXECUTE FUNCTION public.set_job_application_retention();

-- Süresi dolan başvuruları siler; sildiği kayıt sayısını döndürür.
-- Yalnızca yöneticiler çağırabilir.
CREATE OR REPLACE FUNCTION public.purge_expired_job_applications()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $fn$
DECLARE
  removed INTEGER;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Yetkisiz islem';
  END IF;

  WITH deleted AS (
    DELETE FROM public.job_applications
    WHERE retention_until IS NOT NULL AND retention_until < CURRENT_DATE
    RETURNING 1
  )
  SELECT count(*) INTO removed FROM deleted;

  RETURN removed;
END $fn$;

GRANT EXECUTE ON FUNCTION public.purge_expired_job_applications() TO authenticated;


-- ============================================================
-- 5) KVKK: BAŞVURU GÖRÜNTÜLEME LOGU
--
-- Bir başvurunun detayını kimin ne zaman açtığı audit_logs'a yazılır.
-- İstemci audit_logs'a doğrudan INSERT edebiliyor ama user_id'yi kendisi
-- gönderiyor; burada auth.uid() sunucu tarafında damgalanır.
-- ============================================================

CREATE OR REPLACE FUNCTION public.log_job_application_view(p_id INTEGER)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $fn$
DECLARE
  ref TEXT;
BEGIN
  IF NOT public.is_hr() THEN
    RAISE EXCEPTION 'Yetkisiz islem';
  END IF;

  SELECT reference_code INTO ref FROM public.job_applications WHERE id = p_id;

  INSERT INTO public.audit_logs (user_id, action, entity_type, entity_id, details)
  VALUES (
    auth.uid(),
    'view',
    'job_application',
    p_id,
    jsonb_build_object('reference_code', ref)
  );
END $fn$;

GRANT EXECUTE ON FUNCTION public.log_job_application_view(INTEGER) TO authenticated;


-- PostgREST şema önbelleğini tazele
NOTIFY pgrst, 'reload schema';


-- ============================================================
-- KONTROL
-- ============================================================

-- Fonksiyonlar oluştu mu? Dördü de listelenmeli.
SELECT p.proname AS fonksiyon
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public'
  AND p.proname IN ('is_admin', 'is_hr', 'has_panel_access',
                    'log_job_application_view', 'purge_expired_job_applications')
ORDER BY 1;

-- retention_until kolonu oluştu mu? Bir satır dönmeli.
SELECT column_name
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'job_applications'
  AND column_name = 'retention_until';

-- Bucket artık gizli olmalı (public = false).
-- true dönerse storage bölümü yetki hatası nedeniyle atlanmıştır;
-- Dashboard > Storage > job-applications > Settings'ten "Public" kapatın.
SELECT id, public FROM storage.buckets WHERE id = 'job-applications';

-- job_applications politikaları: SELECT/UPDATE is_hr(), DELETE is_admin()
SELECT policyname, cmd, qual
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'job_applications'
ORDER BY cmd;

-- Rol dağılımı
SELECT role, count(*) FROM public.profiles GROUP BY role ORDER BY role;
