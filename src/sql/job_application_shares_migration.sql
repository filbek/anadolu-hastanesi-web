-- ============================================================
-- İş başvurusu paylaşım bağlantıları
--
-- İK, bir başvuruyu panel hesabı olmayan birine (örn. bölüm sorumlusu)
-- süreli bir bağlantıyla gösterebilsin diye.
--
-- GÜVENLİK TASARIMI
--
-- 1) Token'ın KENDİSİ saklanmaz, yalnızca SHA-256 özeti tutulur.
--    Düz token saklansaydı veritabanını okuyabilen herkes tüm aktif
--    bağlantıları ele geçirirdi. Özet tutulunca veritabanı sızsa bile
--    eldeki veriyle hiçbir bağlantı açılamaz.
--
-- 2) Bu tabloya ve job_applications'a anon erişimi YOKTUR. Paylaşım
--    sayfası veriyi doğrudan okumaz; share-job-application edge
--    function'ı service_role ile okur ve YALNIZCA kapsama giren
--    alanları döner. Aksi halde RLS'i gevşetmek gerekirdi.
--
-- 3) Kapsam ('ozet') kimlik ve sağlık verisini hiç göndermez —
--    gizlemek değil, yanıta hiç koymamak. Bkz. edge function.
--
-- Çalıştırma: Supabase SQL Editor'de bir kez.
-- Bağımlılık: public.is_hr(), public.is_admin()
-- ============================================================

CREATE TABLE IF NOT EXISTS public.job_application_shares (
  id BIGSERIAL PRIMARY KEY,
  application_id BIGINT NOT NULL
    REFERENCES public.job_applications(id) ON DELETE CASCADE,

  -- Düz token ASLA yazılmaz; yalnızca sha256(token) hex olarak
  token_hash TEXT NOT NULL UNIQUE,

  scope TEXT NOT NULL DEFAULT 'ozet' CHECK (scope IN ('ozet', 'tam')),
  include_cv BOOLEAN NOT NULL DEFAULT false,

  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_by_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL,
  revoked_at TIMESTAMPTZ,

  view_count INTEGER NOT NULL DEFAULT 0,
  first_viewed_at TIMESTAMPTZ,
  last_viewed_at TIMESTAMPTZ,

  -- İK'nın kendi notu: kime, neden gönderildi
  note TEXT
);

CREATE INDEX IF NOT EXISTS idx_job_application_shares_app
  ON public.job_application_shares(application_id, created_at DESC);

-- resolve akışı her istekte bu indeksi kullanır
CREATE INDEX IF NOT EXISTS idx_job_application_shares_token
  ON public.job_application_shares(token_hash);


-- ------------------------------------------------------------
-- Erişim kaydı — KVKK md.12 kapsamında "kim, ne zaman gördü".
-- IP açık saklanmaz; özeti tutulur (aynı ziyaretçi tekrar mı geldi
-- sorusu cevaplanabilsin ama adres kişiye bağlanamasın).
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.job_application_share_views (
  id BIGSERIAL PRIMARY KEY,
  share_id BIGINT NOT NULL
    REFERENCES public.job_application_shares(id) ON DELETE CASCADE,
  viewed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ip_hash TEXT,
  user_agent TEXT
);

CREATE INDEX IF NOT EXISTS idx_job_application_share_views_share
  ON public.job_application_share_views(share_id, viewed_at DESC);


-- ------------------------------------------------------------
-- RLS
--
-- Yazma işlemlerinin tamamı edge function üzerinden service_role ile
-- yapılır (RLS'i bypass eder). Buradaki politikalar yalnızca panelin
-- kendi listeleme ihtiyacı için açıktır; anon'a hiçbir şey verilmez.
-- ------------------------------------------------------------
ALTER TABLE public.job_application_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_application_share_views ENABLE ROW LEVEL SECURITY;

DO $do$
DECLARE
  pol RECORD;
BEGIN
  FOR pol IN
    SELECT policyname, tablename FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename IN ('job_application_shares', 'job_application_share_views')
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', pol.policyname, pol.tablename);
  END LOOP;
END $do$;

CREATE POLICY "HR reads shares" ON public.job_application_shares
  FOR SELECT TO authenticated USING (public.is_hr());

CREATE POLICY "HR reads share views" ON public.job_application_share_views
  FOR SELECT TO authenticated USING (public.is_hr());

REVOKE ALL ON public.job_application_shares FROM anon;
REVOKE ALL ON public.job_application_share_views FROM anon;
GRANT SELECT ON public.job_application_shares TO authenticated;
GRANT SELECT ON public.job_application_share_views TO authenticated;


-- ------------------------------------------------------------
-- Süresi dolmuş bağlantıların temizliği.
--
-- Kayıtlar hemen silinmez: "bu başvuru geçen ay kiminle paylaşılmıştı"
-- sorusunun cevabı bir süre durmalı. 90 gün sonra temizlenir.
-- pg_cron kuruluysa günlük çalıştırılabilir; değilse elle çağrılır.
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.purge_expired_job_application_shares()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $fn$
DECLARE
  removed INTEGER;
BEGIN
  DELETE FROM public.job_application_shares
  WHERE expires_at < now() - INTERVAL '90 days';
  GET DIAGNOSTICS removed = ROW_COUNT;
  RETURN removed;
END $fn$;

COMMENT ON TABLE public.job_application_shares IS
  'İş başvurusu paylaşım bağlantıları. token_hash = sha256(token); düz token saklanmaz.';

NOTIFY pgrst, 'reload schema';
