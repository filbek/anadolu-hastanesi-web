-- ============================================================
-- Anadolu Hastaneleri Grubu - WhatsApp Form Yönlendirme
--
-- Form başvurularının (ikinci görüş, iletişim, hasta geri bildirim)
-- şube bazında hangi WhatsApp numarasına yönlendirileceğini tutar.
-- Gönderim wa.me linki ile ziyaretçinin kendi WhatsApp'ı üzerinden
-- yapılır — API/token gerekmez.
--
-- SIRA: live_chat_migration.sql'den SONRA çalıştırın — yazma
-- politikaları orada tanımlanan chat_is_admin() fonksiyonunu kullanır.
--
-- Idempotent: birden fazla kez çalıştırılabilir.
-- Çalıştırma: Supabase SQL Editor'a yapıştırıp Run.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.notification_routes (
  id SERIAL PRIMARY KEY,
  -- 'second_opinion' | 'contact' | 'feedback'
  form_type TEXT NOT NULL,
  -- NULL = tüm şubeler için geçerli varsayılan kural
  hospital_name TEXT,
  -- Uluslararası formatta, yalnızca rakam: 905321234567
  whatsapp_number TEXT NOT NULL,
  -- Admin panelinde görünen açıklama: "Silivri Çağrı Merkezi"
  label TEXT,
  -- Aynı form+şube için birden fazla kural varsa en yüksek öncelikli kullanılır
  priority INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notification_routes_lookup
  ON public.notification_routes(form_type, is_active);

-- Aynı form + şube + numara kombinasyonu tekrar eklenmesin.
-- hospital_name NULL olabildiği için COALESCE ile normalize edilir.
CREATE UNIQUE INDEX IF NOT EXISTS idx_notification_routes_unique
  ON public.notification_routes(form_type, COALESCE(hospital_name, ''), whatsapp_number);

ALTER TABLE public.notification_routes ENABLE ROW LEVEL SECURITY;

-- Ziyaretçinin (anon) wa.me linkini kurabilmesi için OKUMA açık olmalı.
-- Numaralar zaten linkte göründüğü için gizli veri değildir.
DROP POLICY IF EXISTS "Allow read notification routes" ON public.notification_routes;
CREATE POLICY "Allow read notification routes" ON public.notification_routes
  FOR SELECT USING (true);

-- ------------------------------------------------------------
-- YAZMA YETKİSİ YALNIZCA ADMİNE AİT
--
-- Bu politikalar önce rol kısıtı olmadan (USING (true)) yazılmıştı.
-- Rol belirtilmeyen politika PUBLIC'e uygulanır ve buna `anon` da
-- dahildir; anon anahtarı ise istemci paketinin içinde herkese açıktır.
-- Yani herhangi biri whatsapp_number alanını kendi numarasıyla
-- değiştirebilir ve "WhatsApp'tan Gönder" diyen her hastanın adı,
-- telefonu, e-postası ve tıbbi sorusu saldırgana giderdi.
-- Okuma açık kalabilir, yazma kapalı olmak zorunda.
--
-- chat_is_admin() live_chat_migration.sql içinde tanımlıdır; bu dosya
-- ondan SONRA çalıştırılmalıdır.
-- ------------------------------------------------------------
DROP POLICY IF EXISTS "Allow insert notification routes" ON public.notification_routes;
DROP POLICY IF EXISTS "Allow update notification routes" ON public.notification_routes;
DROP POLICY IF EXISTS "Allow delete notification routes" ON public.notification_routes;

DROP POLICY IF EXISTS "Admins manage notification routes" ON public.notification_routes;
CREATE POLICY "Admins manage notification routes" ON public.notification_routes
  FOR ALL TO authenticated
  USING (public.chat_is_admin())
  WITH CHECK (public.chat_is_admin());

-- anon yalnızca okuyabilsin
REVOKE INSERT, UPDATE, DELETE ON public.notification_routes FROM anon;
GRANT SELECT ON public.notification_routes TO anon;

-- ============================================================
-- ÖRNEK KAYITLAR (isteğe bağlı — numaraları kendinizle değiştirin)
-- hospital_name, hospitals tablosundaki "name" değeriyle birebir aynı olmalı.
-- ============================================================
-- INSERT INTO public.notification_routes (form_type, hospital_name, whatsapp_number, label, priority)
-- VALUES
--   ('second_opinion', NULL, '905321234567', 'Genel Merkez (varsayılan)', 0),
--   ('second_opinion', 'Anadolu Hastanesi Silivri', '905321234568', 'Silivri Çağrı Merkezi', 10)
-- ON CONFLICT DO NOTHING;

-- ============================================================
-- KONTROL
-- ============================================================
SELECT form_type, hospital_name, whatsapp_number, label, priority, is_active
FROM public.notification_routes
ORDER BY form_type, priority DESC;
