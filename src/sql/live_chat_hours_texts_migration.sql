-- ============================================================
-- Anadolu Hastaneleri Grubu - Canlı Destek: Çalışma Saatli Moda Geçiş
--
-- SIRA: live_chat_migration.sql'den sonra, istediğiniz zaman.
--       live_chat_247_migration.sql çalıştırılmadıysa bu dosya onun
--       yerine de geçer — is_24_7 sütununu kendisi ekler.
--
-- NE YAPAR
--   1) chat_settings.is_24_7 sütununu ekler (yoksa)
--   2) 7/24 modunu KAPATIR — çevrimiçi/çevrimdışı artık gün ve saate bakar
--   3) Widget metinlerini saatli moda uygun hâle getirir
--
-- NE YAPMAZ
--   Gün ve saatlere DOKUNMAZ. Mevcut değerler neyse öyle kalır; saatleri
--   siz belirleyeceksiniz:  Canlı Destek -> Ayarlar -> Çalışma Saatleri
--
--   > Bu dosyayı çalıştırdıktan HEMEN SONRA saatleri panelden ayarlayın.
--   > 7/24 kapandığı anda mevcut aralık (varsayılan Pzt-Cmt 08:00-20:00)
--   > yürürlüğe girer ve widget o aralığın dışında çevrimdışı görünür.
--
-- ÖNEMLİ: is_24_7 sütunu olmadığı sürece admin panelindeki
-- "Canlı Destek -> Ayarlar" sayfası KAYDEDEMEZ; arayüz bu alanı da
-- gönderdiği için istek sütun bulunamadı hatasıyla döner.
--
-- Idempotent: birden fazla kez çalıştırılabilir.
-- ============================================================

-- 1) Sütun (live_chat_247_migration.sql çalıştırılmadıysa burada eklenir)
ALTER TABLE public.chat_settings
  ADD COLUMN IF NOT EXISTS is_24_7 BOOLEAN NOT NULL DEFAULT false;

-- 2) Saatli moda geç + metinleri düzelt
UPDATE public.chat_settings
SET
  -- Çevrimiçi/çevrimdışı artık online_days + online_start/end'e bakar
  is_24_7 = false,

  -- Saat sınırı olsun olmasın doğru kalan, iddiasız bir ifade
  widget_subtitle = 'Genellikle birkaç dakika içinde yanıtlıyoruz',

  -- Mesai dışında gösterilir: ne zaman dönüleceğini söylemeli, ziyaretçiyi
  -- mesaj bırakmaya yönlendirmeli ve acil için bir kanal bırakmalı.
  -- (live_chat_247_migration.sql bunu "kesintisiz hizmetinizdeyiz" yapmıştı;
  --  çevrimdışıyken gösterilen metin olduğu için kendini yalanlıyordu.)
  offline_message = 'Şu anda çevrimiçi değiliz. Mesajınızı bırakın, mesai saatlerimizde size dönüş yapalım. Acil durumlar için 444 50 58 numaralı hattımız 7/24 hizmetinizdedir.',

  updated_at = now()
WHERE id = 1;

-- ============================================================
-- KONTROL
--
-- is_24_7 false olmalı. online_days: 1=Pazartesi ... 7=Pazar.
-- Aşağıdaki gün/saat değerleri ŞU AN YÜRÜRLÜKTE — panelden düzeltin.
-- ============================================================
SELECT is_24_7,
       online_days,
       online_start,
       online_end,
       whatsapp_fallback_number,
       widget_subtitle,
       offline_message
FROM public.chat_settings
WHERE id = 1;
