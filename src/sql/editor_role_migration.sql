-- ============================================================
-- Editör rolü — site içeriği yazma yetkisi
--
-- SORUN: 'editor' rolü Kullanıcılar sayfasından atanabiliyordu ama
-- hiçbir yetkisi yoktu. Panel girişi reddediyordu, içerik tablolarının
-- yazma politikaları da yalnızca is_admin() (admin/super_admin) idi.
--
-- ÇÖZÜM: is_editor() fonksiyonu ve içerik tablolarına EK bir
-- "Editors write" politikası. Postgres'te izin veren politikalar
-- OR'lanır; mevcut admin politikalarına DOKUNULMAZ, yalnızca editöre
-- ek kapı açılır. Tablo listesi src/lib/roles.ts içindeki
-- EDITOR_ALLOWED_PATHS modülleriyle eşleşir.
--
-- KAPSAM DIŞI (editöre bilerek kapalı): hasta verisi (iletişim, ikinci
-- görüş, geri bildirim), iş başvuruları, canlı destek, kullanıcılar /
-- profiles, site_settings (e-posta alıcıları vb.), SEO, WhatsApp
-- yönlendirme, kalite modülleri.
--
-- Storage: içerik bucket'larının yükleme politikaları zaten tüm
-- authenticated kullanıcılara açık; ek işlem gerekmez.
--
-- Idempotent. GERİ ALMA: "Editors write" politikalarını düşürmek yeterli.
-- ============================================================

CREATE OR REPLACE FUNCTION public.is_editor()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid()
      AND p.role IN ('editor', 'admin', 'super_admin')
  );
$$;

GRANT EXECUTE ON FUNCTION public.is_editor() TO authenticated;

DO $$
DECLARE
  t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'page_sections',            -- Ana Sayfa
    'pages',                    -- Tüm Sayfalar
    'hero_slides',              -- Hero Slider
    'hospitals',                -- Hastaneler
    'hospital_galleries',
    'departments',              -- Bölümler
    'hospital_department_hbys',
    'doctors',                  -- Doktorlar
    'health_articles',          -- Sağlık Rehberi
    'testimonials',             -- Hasta Yorumları
    'news_items',               -- Haberler
    'contact_info',             -- İletişim
    'management_team',          -- Yönetim Ekibi
    'gebe_okulu_seminars',      -- Gebe Okulu
    'social_responsibility_activities'
  ]
  LOOP
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = t
    ) THEN
      RAISE NOTICE 'Tablo yok, atlandı: %', t;
      CONTINUE;
    END IF;

    EXECUTE format('DROP POLICY IF EXISTS "Editors write" ON public.%I', t);
    EXECUTE format($f$
      CREATE POLICY "Editors write" ON public.%I
        FOR ALL TO authenticated
        USING (public.is_editor()) WITH CHECK (public.is_editor())
    $f$, t);
  END LOOP;
END $$;

-- Sağlık Turizmi belgeleri RPC ile kaydediliyor; kapıyı editöre de aç.
-- Fonksiyon yalnızca health_tourism_certificates sütununu günceller.
CREATE OR REPLACE FUNCTION public.save_health_tourism_certificates(p_certificates JSONB)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result JSONB;
BEGIN
  IF NOT public.is_editor() THEN
    RAISE EXCEPTION 'Bu işlem için editör veya yönetici yetkisi gerekiyor.' USING ERRCODE = '42501';
  END IF;

  IF p_certificates IS NULL OR jsonb_typeof(p_certificates) <> 'array' THEN
    RAISE EXCEPTION 'Belge listesi geçersiz.' USING ERRCODE = '22023';
  END IF;

  UPDATE public.site_settings
  SET health_tourism_certificates = p_certificates,
      updated_at = now()
  WHERE id = (SELECT id FROM public.site_settings ORDER BY id LIMIT 1)
  RETURNING health_tourism_certificates INTO v_result;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'site_settings kaydı bulunamadı.' USING ERRCODE = 'P0002';
  END IF;

  RETURN v_result;
END;
$$;

REVOKE ALL ON FUNCTION public.save_health_tourism_certificates(JSONB) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.save_health_tourism_certificates(JSONB) TO authenticated;

NOTIFY pgrst, 'reload schema';
