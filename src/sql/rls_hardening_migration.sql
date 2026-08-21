-- ============================================================
-- Anadolu Hastaneleri Grubu - RLS Sıkılaştırma
--
-- SORUN: Birçok tabloda politikalar rol kısıtı olmadan `USING (true)`
-- şeklinde yazılmış. Rol belirtilmeyen politika PUBLIC'e uygulanır ve
-- buna `anon` dahildir; anon anahtarı da istemci paketinin içinde
-- herkese açıktır. Sonuç:
--   * anon TÜM iletişim formlarını ve ikinci görüş başvurularını
--     okuyabiliyor ve silebiliyordu (hasta verisi, KVKK),
--   * anon site içeriğini değiştirip silebiliyordu.
--
-- ÇÖZÜM: Okuma nerede gerekiyorsa açık kalır (site anonim çalışıyor),
-- YAZMA her yerde admine kilitlenir. Hasta verisi taşıyan tablolarda
-- okuma da admine kilitlenir.
--
-- KAPSAM DIŞI — bilerek dokunulmadı:
--   * admin_users / admin_roles: mevcut politikalarının içeriği
--     görülmeden değiştirilirse panel erişimi kaybedilebilir.
--   * products/orders/customers/order_items/categories/bookings:
--     şablondan kalma, kullanılmıyor görünüyor. Yazma kapatıldı ama
--     tablolar SİLİNMEDİ — silme kararı size ait.
--
-- Idempotent: birden fazla kez çalıştırılabilir.
-- GERİ ALMA: Bu dosya yalnızca politika değiştirir, veri silmez.
-- ============================================================

-- ============================================================
-- 0) ORTAK YETKİ FONKSİYONU
--
-- profiles tablosunun kendi RLS'ine takılmamak için SECURITY DEFINER.
-- Karar: şimdilik yalnızca admin/super_admin yazabilir; 'editor' rolüne
-- içerik yazma yetkisi VERİLMEDİ (talep üzerine).
-- ============================================================

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid()
      AND p.role IN ('admin', 'super_admin')
  );
$$;

GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

-- Canlı destek tarafındaki eşdeğeri buna delege etsin ki tek kaynak olsun
CREATE OR REPLACE FUNCTION public.chat_is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.is_admin();
$$;

-- ============================================================
-- Yardımcı: bir tablodaki TÜM politikaları temizler.
-- blog_posts'ta 8 ayrı politika birikmiş; politikalar OR'landığı için
-- en gevşek olan kazanıyor. Tek tek DROP yerine topluca siliyoruz.
-- ============================================================

CREATE OR REPLACE FUNCTION public.drop_all_policies(p_table TEXT)
RETURNS VOID
LANGUAGE plpgsql
AS $$
DECLARE
  pol RECORD;
BEGIN
  FOR pol IN
    SELECT policyname FROM pg_policies
    WHERE schemaname = 'public' AND tablename = p_table
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', pol.policyname, p_table);
  END LOOP;
END;
$$;

-- ============================================================
-- 1) HASTA VERİSİ — okuma da yazma da yalnızca admin
--
-- Tek istisna: ziyaretçinin formu gönderebilmesi için INSERT açık.
-- Gönderdiğini geri okuyamaz; zaten okumasına gerek yok.
-- ============================================================

DO $$
DECLARE
  t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY['contact_submissions', 'second_opinion_submissions', 'patient_feedback']
  LOOP
    -- Tablo yoksa atla (kurulumlar arasında farklılık olabilir)
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = t
    ) THEN
      CONTINUE;
    END IF;

    PERFORM public.drop_all_policies(t);
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);

    -- Ziyaretçi form gönderebilsin
    EXECUTE format($f$
      CREATE POLICY "Public can submit" ON public.%I
        FOR INSERT TO anon, authenticated WITH CHECK (true)
    $f$, t);

    -- Okuma/güncelleme/silme yalnızca admin
    EXECUTE format($f$
      CREATE POLICY "Admins manage submissions" ON public.%I
        FOR SELECT TO authenticated USING (public.is_admin())
    $f$, t);
    EXECUTE format($f$
      CREATE POLICY "Admins update submissions" ON public.%I
        FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin())
    $f$, t);
    EXECUTE format($f$
      CREATE POLICY "Admins delete submissions" ON public.%I
        FOR DELETE TO authenticated USING (public.is_admin())
    $f$, t);

    EXECUTE format('REVOKE SELECT, UPDATE, DELETE ON public.%I FROM anon', t);
    EXECUTE format('GRANT INSERT ON public.%I TO anon', t);
  END LOOP;
END $$;

-- ============================================================
-- 2) İÇERİK TABLOLARI — herkes okur, yalnızca admin yazar
--
-- Site anonim ziyaretçiye içerik gösterdiği için SELECT açık kalmalı.
-- ============================================================

DO $$
DECLARE
  t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'blog_posts',
    'management_team',
    'contracted_institutions',
    'quality_committees',
    'quality_org_charts',
    'social_responsibility_activities',
    'testimonials',
    'treatments',
    'faqs',
    'homepage_content'
  ]
  LOOP
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = t
    ) THEN
      CONTINUE;
    END IF;

    PERFORM public.drop_all_policies(t);
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);

    EXECUTE format($f$
      CREATE POLICY "Public read" ON public.%I
        FOR SELECT USING (true)
    $f$, t);

    EXECUTE format($f$
      CREATE POLICY "Admins write" ON public.%I
        FOR ALL TO authenticated
        USING (public.is_admin()) WITH CHECK (public.is_admin())
    $f$, t);

    EXECUTE format('REVOKE INSERT, UPDATE, DELETE ON public.%I FROM anon', t);
    EXECUTE format('GRANT SELECT ON public.%I TO anon', t);
  END LOOP;
END $$;

-- ============================================================
-- 3) KULLANILMAYAN ŞABLON TABLOLARI — yazma kapatılır
--
-- Bunlar bir e-ticaret şablonundan kalmış görünüyor; hastane sitesinde
-- karşılıkları yok. Silmiyoruz (veri kaybı riski + sizin kararınız),
-- ama anon'un yazmasını engelliyoruz.
-- ============================================================

DO $$
DECLARE
  t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY['products', 'orders', 'order_items', 'customers', 'categories', 'bookings']
  LOOP
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = t
    ) THEN
      CONTINUE;
    END IF;

    PERFORM public.drop_all_policies(t);
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);

    EXECUTE format($f$
      CREATE POLICY "Admins only" ON public.%I
        FOR ALL TO authenticated
        USING (public.is_admin()) WITH CHECK (public.is_admin())
    $f$, t);

    EXECUTE format('REVOKE ALL ON public.%I FROM anon', t);
  END LOOP;
END $$;

-- ============================================================
-- KONTROL
--
-- Bu sorgu BOŞ dönmelidir. Dönen her satır, anon'un hâlâ kısıtsız
-- yazabildiği bir tablodur.
-- ============================================================

SELECT tablename, policyname, cmd
FROM pg_policies
WHERE schemaname = 'public'
  AND cmd <> 'SELECT'
  AND (roles::text[] && ARRAY['public', 'anon'])
  AND (qual IS NULL OR qual = 'true')
  AND (with_check IS NULL OR with_check = 'true')
  AND tablename NOT IN ('contact_submissions', 'second_opinion_submissions', 'patient_feedback')
ORDER BY tablename, cmd;
