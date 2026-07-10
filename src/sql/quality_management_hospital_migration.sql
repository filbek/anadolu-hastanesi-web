-- ============================================================
-- Kalite Yönetimi sayfasını şubeye göre seçilebilir hale getirir
-- (Silivri / Ereğli / Avcılar Anadolu Hastaneleri)
-- ============================================================
-- 1) quality_committees ve management_team tablolarına hospital_id ekler.
--    Mevcut kayıtlar Silivri Anadolu Hastanesi'ne bağlanır (veri kaybı olmaz).
-- 2) Organizasyon şeması PDF'ini artık tek site_settings satırı yerine
--    hastane başına bir satır tutan quality_org_charts tablosunda saklar.
--    Mevcut site_settings.organization_chart_pdf_url değeri Silivri'ye taşınır.
--
-- Idempotent. Supabase SQL Editor'a yapıştırıp Run.
-- ============================================================

-- 0) quality_committees tablosu henüz yoksa oluştur (quality_committees_migration.sql
--    hiç çalıştırılmamışsa bu migration'ın tek başına çalışabilmesi için)
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

ALTER TABLE public.quality_committees ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read" ON public.quality_committees;
CREATE POLICY "Allow public read" ON public.quality_committees
  FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Allow admin all" ON public.quality_committees;
CREATE POLICY "Allow admin all" ON public.quality_committees
  FOR ALL USING (true)
  WITH CHECK (true);

-- Tablo boşsa mevcut sayfadaki komitelerle tohumla
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

-- 1) quality_committees.hospital_id
ALTER TABLE public.quality_committees
  ADD COLUMN IF NOT EXISTS hospital_id BIGINT REFERENCES public.hospitals(id) ON DELETE CASCADE;

UPDATE public.quality_committees
SET hospital_id = (SELECT id FROM public.hospitals WHERE name ILIKE '%Silivri%' ORDER BY id LIMIT 1)
WHERE hospital_id IS NULL;

CREATE INDEX IF NOT EXISTS idx_quality_committees_hospital
  ON public.quality_committees(hospital_id);

-- 2) management_team.hospital_id (yalnızca "Kalite Yönetim Müdürü" rolü için kullanılır;
--    diğer roller için NULL kalabilir, genel yönetim ekibi sayfasını etkilemez)
ALTER TABLE public.management_team
  ADD COLUMN IF NOT EXISTS hospital_id BIGINT REFERENCES public.hospitals(id) ON DELETE CASCADE;

UPDATE public.management_team
SET hospital_id = (SELECT id FROM public.hospitals WHERE name ILIKE '%Silivri%' ORDER BY id LIMIT 1)
WHERE hospital_id IS NULL AND role = 'quality_management_manager';

CREATE INDEX IF NOT EXISTS idx_management_team_hospital
  ON public.management_team(hospital_id);

-- 3) quality_org_charts (hastane başına organizasyon şeması PDF'i)
CREATE TABLE IF NOT EXISTS public.quality_org_charts (
  id SERIAL PRIMARY KEY,
  hospital_id BIGINT NOT NULL UNIQUE REFERENCES public.hospitals(id) ON DELETE CASCADE,
  pdf_url TEXT,
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.quality_org_charts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read" ON public.quality_org_charts;
CREATE POLICY "Allow public read" ON public.quality_org_charts
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow admin all" ON public.quality_org_charts;
CREATE POLICY "Allow admin all" ON public.quality_org_charts
  FOR ALL USING (true)
  WITH CHECK (true);

-- Mevcut tekil site_settings PDF'ini Silivri'ye taşı (bir kereye mahsus; site_settings
-- tablosu veya organization_chart_pdf_url sütunu yoksa bu adım sessizce atlanır)
DO $$
BEGIN
  IF to_regclass('public.site_settings') IS NOT NULL
     AND EXISTS (
       SELECT 1 FROM information_schema.columns
       WHERE table_schema = 'public' AND table_name = 'site_settings'
         AND column_name = 'organization_chart_pdf_url'
     )
  THEN
    INSERT INTO public.quality_org_charts (hospital_id, pdf_url)
    SELECT
      (SELECT id FROM public.hospitals WHERE name ILIKE '%Silivri%' ORDER BY id LIMIT 1),
      s.organization_chart_pdf_url
    FROM public.site_settings s
    WHERE s.organization_chart_pdf_url IS NOT NULL
      AND (SELECT id FROM public.hospitals WHERE name ILIKE '%Silivri%' ORDER BY id LIMIT 1) IS NOT NULL
    ON CONFLICT (hospital_id) DO NOTHING;
  END IF;
END $$;
