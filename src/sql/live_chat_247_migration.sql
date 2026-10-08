-- ============================================================
-- ⚠️ BU DOSYA ARTIK KULLANILMIYOR — ÇALIŞTIRMAYIN
--
-- Widget'ı kesintisiz çevrimiçi tutmak için yazılmıştı. Sonradan
-- çalışma saatli moda dönüldüğü için geçerliliğini yitirdi:
-- çalıştırırsanız is_24_7'yi tekrar true yapar, tüm günleri açar ve
-- panelden girdiğiniz saat ayarlarını devre dışı bırakır.
--
-- Yerine kullanın: src/sql/live_chat_hours_texts_migration.sql
-- (is_24_7 sütununu o da ekler, ayrıca saatli moda geçirir)
--
-- Tarihsel kayıt için duruyor.
-- ============================================================
--
-- Anadolu Hastaneleri Grubu - Canlı Destek: 7/24 Çalışma
--
-- Önceki üç canlı destek migration'ından SONRA çalıştırılmalıdır.
--
-- Hastane çağrı merkezi 24 saat çalıştığı için widget'ın "çevrimdışı"
-- görünmesi kabul edilemez. Çalışma saati mantığı kaldırılmıyor —
-- ileride bir şube için gerekebilir — ama üzerine, açık olduğunda
-- saatleri tamamen devre dışı bırakan bir anahtar konuyor.
--
-- Neden ayrı bir alan? Saatleri 00:00-00:00 yapmak da işe yarardı ama
-- bu örtük bir hile olurdu: paneli açan biri saatleri "düzeltmek"
-- isteyip farkında olmadan hastaneyi çevrimdışı gösterebilirdi.
-- Açık bir bayrak, niyeti kodda ve arayüzde görünür kılar.
--
-- Idempotent: birden fazla kez çalıştırılabilir.
-- ============================================================

ALTER TABLE public.chat_settings
  ADD COLUMN IF NOT EXISTS is_24_7 BOOLEAN NOT NULL DEFAULT true;

-- Mevcut kaydı 7/24'e al ve günleri de tamamla; bayrak sonradan
-- kapatılırsa makul bir varsayılana düşsün.
UPDATE public.chat_settings
SET is_24_7 = true,
    online_days = '{1,2,3,4,5,6,7}',
    -- Çevrimdışı metni artık gösterilmiyor ama boş kalmasın
    offline_message = 'Çağrı merkezimiz 7 gün 24 saat hizmetinizdedir. Mesajınızı yazın, hemen yanıtlayalım.',
    widget_subtitle = '7/24 hizmetinizdeyiz',
    updated_at = now()
WHERE id = 1;

-- ============================================================
-- KONTROL
-- ============================================================
SELECT is_24_7, widget_subtitle, online_days, online_start, online_end
FROM public.chat_settings WHERE id = 1;
