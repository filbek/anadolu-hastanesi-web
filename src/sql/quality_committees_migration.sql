-- ============================================================
-- Anadolu Hastaneleri Grubu - Kalite Yönetimi Komiteleri
-- Kalite Yönetimi sayfasındaki "Komiteler" bölümünün içeriği.
-- Admin panelinden (/admin/quality-committees) yönetilir.
--
-- Idempotent. Çalıştırma: Supabase SQL Editor'a yapıştırıp Run.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.quality_committees (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  icon TEXT NOT NULL DEFAULT 'FaClipboardCheck',
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_quality_committees_active
  ON public.quality_committees(is_active);
CREATE INDEX IF NOT EXISTS idx_quality_committees_order
  ON public.quality_committees(display_order);

-- RLS: herkes aktif olanları okuyabilir, admin her şeyi yönetir
ALTER TABLE public.quality_committees ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read" ON public.quality_committees;
CREATE POLICY "Allow public read" ON public.quality_committees
  FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Allow admin all" ON public.quality_committees;
CREATE POLICY "Allow admin all" ON public.quality_committees
  FOR ALL USING (true)
  WITH CHECK (true);

-- Mevcut sayfadaki komitelerle tohumla (tablo boşsa)
INSERT INTO public.quality_committees (title, description, icon, display_order)
SELECT * FROM (VALUES
  ('Çalışan Güvenliği', 'Çalışanlarımızın sağlıklı ve güvenli bir ortamda çalışması için risk değerlendirmeleri yapan ve önlemler alan komitedir.', 'FaUserShield', 1),
  ('Hasta Güvenliği', 'Hasta kimlik doğrulaması, ilaç güvenliği ve düşmelerin önlenmesi gibi temel hasta güvenliği süreçlerini koordine eden yapıdır.', 'FaHandHoldingHeart', 2),
  ('Eğitim', 'Personelimizin mesleki gelişimini ve hizmet içi eğitim faaliyetlerini planlayan, kalite standartları farkındalığını artırıcı çalışmalar yapan komitedir.', 'FaGraduationCap', 3),
  ('Tesis Yönetimi', 'Hastane altyapısının güvenliğini, acil durum sistemlerini ve teknik donanımın kesintisiz çalışmasını denetleyen komitedir.', 'FaBuilding', 4),
  ('Enfeksiyonların Önlenmesi ve Kontrolü', 'Hastane genelinde enfeksiyon risklerini izleyen, hijyen protokollerini belirleyen ve denetimlerini yürüten komitedir.', 'FaClipboardCheck', 5),
  ('Radyasyon Güvenliği', 'Radyoloji ve nükleer tıp gibi alanlarda hastaların ve çalışanların radyasyondan korunmasını denetleyen kuruldur.', 'FaRadiation', 6),
  ('Nütrisyon Ekibi', 'Yatan hastaların beslenme durumlarını değerlendiren, enteral ve parenteral beslenme planlarını oluşturan ekiptir.', 'FaAppleAlt', 7),
  ('Organ Nakli Komitesi', 'Organ ve doku nakli süreçlerini, donör ve alıcı koordinasyonunu etik ve yasal kurallara uygun olarak denetleyen komitedir.', 'FaHeartbeat', 8),
  ('Transfüzyon Komitesi', 'Kan ve kan ürünlerinin güvenli kullanımı, transfüzyon reaksiyonlarının takibi ve kan bankası süreçlerini denetleyen komitedir.', 'FaTint', 9),
  ('İlaç Güvenliği Ekibi', 'İlaç hatalarının önlenmesi, yüksek riskli ilaçların takibi ve güvenli ilaç kullanım protokollerinin denetimini yapan ekiptir.', 'FaPills', 10),
  ('Çalışan Görüşleri Değerlendirme Ekibi', 'Çalışan memnuniyeti anketleri ve geri bildirimleri doğrultusunda çalışma koşullarını iyileştirici faaliyetleri yürüten ekiptir.', 'FaComments', 11),
  ('Hasta Hakları ve Hasta Memnuniyeti Değerlendirme Komitesi', 'Hasta hakları ihlallerini inceleyen, hasta memnuniyeti geri bildirimlerini analiz eden ve iyileştirici faaliyetler planlayan komitedir.', 'FaUserCheck', 12),
  ('FTR Ünitesi Değerlendirme Ekibi', 'Fizik Tedavi ve Rehabilitasyon ünitesinin hizmet kalitesini, hasta güvenliğini ve cihazların uygunluğunu denetleyen ekiptir.', 'FaRunning', 13),
  ('Bina Turu Ekibi', 'Hastane genelinde düzenli fiziksel denetimler yaparak tesis güvenliğini, temizliğini ve çevre düzenini izleyen ekiptir.', 'FaWalking', 14),
  ('Afet ve Acil Durum Ekibi', 'Hastane Afet ve Acil Durum Planını (HAP) hazırlayan, acil durum tatbikatlarını organize eden ve kriz anlarında koordinasyonu sağlayan ekiptir.', 'FaExclamationTriangle', 15)
) AS seed(title, description, icon, display_order)
WHERE NOT EXISTS (SELECT 1 FROM public.quality_committees);
