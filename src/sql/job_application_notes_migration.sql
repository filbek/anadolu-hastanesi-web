-- ============================================================
-- İş başvurusu notları — kronolojik not akışı
--
-- ÖNCEKİ DURUM: job_applications.admin_note tek bir TEXT alanıydı.
-- Panelde birden fazla kişi çalıştığı için (yönetici + İK) iki kişi aynı
-- başvuruya not girdiğinde biri diğerinin notunu sessizce siliyordu.
-- Ayrıca notu kimin, ne zaman yazdığı kayıt altında değildi.
--
-- Artık her not ayrı bir satır: kim yazdı, ne zaman yazdı belli;
-- kimse kimsenin notunun üzerine yazamaz.
--
-- Çalıştırma: Supabase SQL Editor'de bir kez.
-- Bağımlılık: public.is_hr() ve public.is_admin()
--             (bkz. hr_role_job_applications_migration.sql)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.job_application_notes (
  id BIGSERIAL PRIMARY KEY,
  application_id BIGINT NOT NULL
    REFERENCES public.job_applications(id) ON DELETE CASCADE,

  -- Yazar auth.users'tan silinse bile not ve yazar adı kaybolmasın
  author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  author_name TEXT,

  note TEXT NOT NULL CHECK (length(btrim(note)) > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ
);

-- Liste ekranı her başvurunun en son notunu okur
CREATE INDEX IF NOT EXISTS idx_job_application_notes_app
  ON public.job_application_notes(application_id, created_at DESC);


-- ------------------------------------------------------------
-- Yazar damgası SUNUCUDA basılır.
-- İstemciden gelen author_id / author_name yok sayılır; aksi halde
-- bir kullanıcı başkasının adına not yazabilirdi.
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.stamp_job_application_note()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $fn$
BEGIN
  IF TG_OP = 'INSERT' THEN
    NEW.author_id := auth.uid();
    NEW.author_name := COALESCE(
      (SELECT NULLIF(btrim(p.full_name), '') FROM public.profiles p WHERE p.id = auth.uid()),
      (SELECT p.email FROM public.profiles p WHERE p.id = auth.uid()),
      'Bilinmeyen kullanıcı'
    );
    NEW.created_at := now();
    NEW.updated_at := NULL;
  ELSE
    -- Güncellemede yazar ve oluşturulma zamanı değiştirilemez
    NEW.author_id := OLD.author_id;
    NEW.author_name := OLD.author_name;
    NEW.created_at := OLD.created_at;
    NEW.updated_at := now();
  END IF;
  RETURN NEW;
END $fn$;

DROP TRIGGER IF EXISTS trg_stamp_job_application_note ON public.job_application_notes;
CREATE TRIGGER trg_stamp_job_application_note
  BEFORE INSERT OR UPDATE ON public.job_application_notes
  FOR EACH ROW EXECUTE FUNCTION public.stamp_job_application_note();


-- ------------------------------------------------------------
-- RLS — job_applications ile aynı hizada: okuma/yazma İK + yöneticiler
-- ------------------------------------------------------------
ALTER TABLE public.job_application_notes ENABLE ROW LEVEL SECURITY;

DO $do$
DECLARE
  pol RECORD;
BEGIN
  FOR pol IN
    SELECT policyname FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'job_application_notes'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.job_application_notes', pol.policyname);
  END LOOP;
END $do$;

CREATE POLICY "HR reads application notes" ON public.job_application_notes
  FOR SELECT TO authenticated USING (public.is_hr());

CREATE POLICY "HR writes application notes" ON public.job_application_notes
  FOR INSERT TO authenticated WITH CHECK (public.is_hr());

-- Kendi notunu düzeltebilir; başkasınınkine dokunamaz
CREATE POLICY "Authors edit own notes" ON public.job_application_notes
  FOR UPDATE TO authenticated
  USING (public.is_hr() AND author_id = auth.uid())
  WITH CHECK (public.is_hr() AND author_id = auth.uid());

-- Silme: kendi notu ya da yönetici
CREATE POLICY "Authors or admins delete notes" ON public.job_application_notes
  FOR DELETE TO authenticated
  USING (public.is_hr() AND (author_id = auth.uid() OR public.is_admin()));

REVOKE ALL ON public.job_application_notes FROM anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.job_application_notes TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE public.job_application_notes_id_seq TO authenticated;


-- ------------------------------------------------------------
-- Mevcut admin_note içerikleri akışa taşınır.
--
-- Eski notun yazarı bilinmiyor (tek alanda tutuluyordu), bu yüzden
-- author_id NULL bırakılır ve adı açıkça "aktarıldı" diye işaretlenir —
-- rastgele birine atfetmek yanlış olurdu.
--
-- Tetikleyici INSERT'te author'ı ezdiği için aktarım doğrudan yapılamaz;
-- tetikleyici bu işlem boyunca devre dışı bırakılır.
--
-- admin_note kolonu SİLİNMEZ: veri kaybı riski alınmaz, yalnızca
-- panel artık oraya yazmaz.
-- ------------------------------------------------------------
DO $do$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'job_applications'
      AND column_name = 'admin_note'
  ) THEN
    ALTER TABLE public.job_application_notes DISABLE TRIGGER trg_stamp_job_application_note;

    INSERT INTO public.job_application_notes (application_id, author_id, author_name, note, created_at)
    SELECT a.id, NULL, 'Eski not (aktarıldı)', btrim(a.admin_note), COALESCE(a.created_at, now())
    FROM public.job_applications a
    WHERE a.admin_note IS NOT NULL
      AND btrim(a.admin_note) <> ''
      -- Migration ikinci kez çalıştırılırsa not tekrarlanmasın
      AND NOT EXISTS (
        SELECT 1 FROM public.job_application_notes n
        WHERE n.application_id = a.id AND n.author_name = 'Eski not (aktarıldı)'
      );

    ALTER TABLE public.job_application_notes ENABLE TRIGGER trg_stamp_job_application_note;
  END IF;
END $do$;

COMMENT ON TABLE public.job_application_notes IS
  'İş başvurularına İK/yönetici notları. job_applications.admin_note''un yerini alır (o kolon geriye dönük veri için duruyor).';

NOTIFY pgrst, 'reload schema';
