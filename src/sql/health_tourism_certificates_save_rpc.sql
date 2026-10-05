-- ============================================================
-- Sağlık Turizmi Yetki Belgeleri — kaydetme fonksiyonu
--
-- SORUN: Panelden site_settings'e doğrudan UPDATE, tablonun RLS
-- politikası engellediğinde hata vermeden "0 satır" döndürüyordu;
-- belge kaydedilmiş gibi görünüp kayboluyordu.
--
-- ÇÖZÜM: Yetkiyi (public.is_admin()) kendisi kontrol eden ve yalnızca
-- health_tourism_certificates sütununu güncelleyen SECURITY DEFINER
-- fonksiyon. Yetki yoksa veya satır bulunamazsa açık hata döndürür.
--
-- Önkoşul: health_tourism_certificates_migration.sql ve
-- rls_hardening_migration.sql (is_admin fonksiyonu) çalıştırılmış olmalı.
-- Idempotent: birden fazla kez çalıştırılabilir.
-- Çalıştırma: Supabase SQL Editor'a yapıştırıp Run.
-- ============================================================

CREATE OR REPLACE FUNCTION public.save_health_tourism_certificates(p_certificates JSONB)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result JSONB;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Bu işlem için yönetici yetkisi gerekiyor.' USING ERRCODE = '42501';
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
