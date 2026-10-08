-- ============================================================
-- Anadolu Hastaneleri Grubu - Çağrı Merkezi (call_center) rolü
--
-- Çağrı merkezi personeli yönetim paneline girer ama YALNIZCA canlı
-- desteği kullanır. Panel menüsü/rotalar istemcide filtrelenir
-- (src/lib/roles.ts); asıl kapı aşağıdaki veritabanı kurallarıdır.
--
-- Tasarım kararı: 'call_center' is_admin()'in İÇİNE katılmaz. Diğer tüm
-- tabloların (doktor, hastane, site ayarları...) politikaları is_admin()
-- üzerine kurulu; katılsaydı çağrı merkezi her şeye yazabilirdi.
-- Canlı destek erişimi zaten chat_agents tablosu üzerinden
-- (chat_can_serve) yürüyor; bu rol yalnızca ekibe otomatik eklenir.
--
-- SIRA: hr_role_job_applications_migration.sql ve TÜM live_chat_*
-- migration'larından (özellikle live_chat_agents_migration.sql) SONRA.
--
-- Idempotent: birden fazla kez çalıştırılabilir.
-- Çalıştırma: Supabase SQL Editor'a yapıştırıp Run.
-- ============================================================


-- ============================================================
-- 1) profiles.role'e 'call_center' değerini tanıt
-- ============================================================
DO $do$
DECLARE
  con_name TEXT;
BEGIN
  FOR con_name IN
    SELECT conname
    FROM pg_constraint
    WHERE conrelid = 'public.profiles'::regclass
      AND contype = 'c'
      AND pg_get_constraintdef(oid) ILIKE '%role%'
  LOOP
    EXECUTE format('ALTER TABLE public.profiles DROP CONSTRAINT %I', con_name);
  END LOOP;

  ALTER TABLE public.profiles
    ADD CONSTRAINT profiles_role_check
    CHECK (role IN ('user', 'editor', 'hr', 'call_center', 'admin', 'super_admin'));
EXCEPTION
  WHEN others THEN
    RAISE NOTICE 'Rol kisiti uygulanamadi (mevcut veride gecersiz rol olabilir): %', SQLERRM;
END $do$;


-- ============================================================
-- 2) Panele giriş: istemcideki PANEL_ROLES'un DB karşılığı
-- ============================================================
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
      AND p.role IN ('hr', 'call_center', 'admin', 'super_admin')
  );
$fn$;

GRANT EXECUTE ON FUNCTION public.has_panel_access() TO authenticated;


-- ============================================================
-- 3) chat_is_admin() → "canlı destek operatörü mü?"
--
-- İlk canlı destek migration'ından kalan RPC'ler (yazıyor göstergesi,
-- hazır yanıt sayacı, rapor) hâlâ chat_is_admin() ile korunuyor ve
-- yalnızca admin/super_admin'i kabul ediyordu. Ekipteki admin olmayan
-- operatör (çağrı merkezi) bu yüzden "yazıyor..." gönderemez, raporu
-- açamazdı. Artık ekipteki herkes geçer.
--
-- Bu fonksiyonu kullanan politikaların hepsi live_chat_agents_migration
-- tarafından chat_can_serve()/chat_is_supervisor() ile değiştirildi;
-- geriye yalnızca chat_settings güncellemesi kalıyordu, o da aşağıda
-- supervisor'a daraltılıyor.
-- ============================================================
CREATE OR REPLACE FUNCTION public.chat_is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.is_admin() OR public.chat_can_serve();
$$;

-- Ayarlar: herkes okur (widget için), yalnızca yönetici/supervisor yazar
DROP POLICY IF EXISTS "Admins update chat settings" ON public.chat_settings;
CREATE POLICY "Admins update chat settings" ON public.chat_settings
  FOR UPDATE TO authenticated
  USING (public.is_admin() OR public.chat_is_supervisor())
  WITH CHECK (public.is_admin() OR public.chat_is_supervisor());


-- ============================================================
-- 4) Çağrı merkezi kullanıcısını canlı destek ekibine otomatik al
--
-- Rol 'call_center' yapıldığında kullanıcı chat_agents'a 'agent' olarak
-- eklenir (ya da pasifse yeniden aktifleşir). Rolü başka bir panel
-- dışı role çekilirse ekipten pasife alınır; kayıt silinmez ki geçmiş
-- görüşmelerdeki atama bilgisi korunsun.
-- Ziyaretçiye görünen ad, görüşme tavanı vb. Canlı Destek → Ekip'ten
-- düzenlenir.
-- ============================================================
CREATE OR REPLACE FUNCTION public.sync_call_center_agent()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $fn$
BEGIN
  IF NEW.role = 'call_center' THEN
    INSERT INTO public.chat_agents (user_id, display_name, agent_role, is_active)
    VALUES (
      NEW.id,
      COALESCE(NULLIF(btrim(NEW.full_name), ''), split_part(NEW.email, '@', 1), 'Hasta Danışmanı'),
      'agent',
      true
    )
    ON CONFLICT (user_id) DO UPDATE SET is_active = true;
  ELSIF TG_OP = 'UPDATE'
        AND OLD.role = 'call_center'
        AND NEW.role NOT IN ('admin', 'super_admin') THEN
    UPDATE public.chat_agents SET is_active = false WHERE user_id = NEW.id;
  END IF;

  RETURN NEW;
END $fn$;

DROP TRIGGER IF EXISTS trg_sync_call_center_agent ON public.profiles;
CREATE TRIGGER trg_sync_call_center_agent
  AFTER INSERT OR UPDATE OF role ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.sync_call_center_agent();

-- Mevcut çağrı merkezi kullanıcıları (varsa) ekibe
INSERT INTO public.chat_agents (user_id, display_name, agent_role, is_active)
SELECT p.id,
       COALESCE(NULLIF(btrim(p.full_name), ''), split_part(p.email, '@', 1), 'Hasta Danışmanı'),
       'agent',
       true
FROM public.profiles p
WHERE p.role = 'call_center'
ON CONFLICT (user_id) DO UPDATE SET is_active = true;


-- PostgREST şema önbelleğini tazele
NOTIFY pgrst, 'reload schema';


-- ============================================================
-- KONTROL
-- ============================================================

-- Kısıt 'call_center' içermeli
SELECT conname, pg_get_constraintdef(oid)
FROM pg_constraint
WHERE conrelid = 'public.profiles'::regclass AND contype = 'c';

-- Çağrı merkezi kullanıcıları ve ekip kayıtları
SELECT p.email, p.role, a.display_name, a.agent_role, a.is_active
FROM public.profiles p
LEFT JOIN public.chat_agents a ON a.user_id = p.id
WHERE p.role = 'call_center';
