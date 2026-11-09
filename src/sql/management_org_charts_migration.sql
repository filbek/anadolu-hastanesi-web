-- =====================================================================
-- Yönetim Kadromuz sayfası — Organizasyon Şeması (PDF)
-- =====================================================================
-- Admin: /admin/management-organization-chart
-- Site : /yonetim (ManagementPage) — aktif sekmenin altında gösterilir.
--
-- scope_key:
--   'group'        → Grup Yönetimi sekmesi (hastaneye bağlı olmayan)
--   '<hospital_id>' → ilgili hastanenin sekmesi
--
-- PDF'ler mevcut "quality-documents" bucket'ında
-- management-organization-chart/ klasörüne yüklenir (bucket ve storage
-- politikaları organization_chart_pdf_migration.sql ile zaten kurulu).
--
-- İdempotent: tekrar tekrar güvenle çalıştırılabilir.
-- =====================================================================

CREATE TABLE IF NOT EXISTS public.management_org_charts (
  id SERIAL PRIMARY KEY,
  scope_key TEXT NOT NULL UNIQUE,
  pdf_url TEXT,
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.management_org_charts ENABLE ROW LEVEL SECURITY;

-- Herkes okur (ziyaretçiler şemayı görür)
DROP POLICY IF EXISTS "Public read" ON public.management_org_charts;
CREATE POLICY "Public read" ON public.management_org_charts
  FOR SELECT USING (true);

-- Yalnızca admin yazar (rls_hardening_migration.sql'deki is_admin())
DROP POLICY IF EXISTS "Admins write" ON public.management_org_charts;
CREATE POLICY "Admins write" ON public.management_org_charts
  FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

REVOKE INSERT, UPDATE, DELETE ON public.management_org_charts FROM anon;
GRANT SELECT ON public.management_org_charts TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.management_org_charts TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE public.management_org_charts_id_seq TO authenticated;

-- PostgREST şema önbelleğini tazele
NOTIFY pgrst, 'reload schema';
