-- ============================================================
-- Anadolu Hastaneleri Grubu - CMS Migration SQL
-- Tam kapsamlı CMS yeniden yapılandırması için gerekli tüm SQL
-- Çalıştırma sırası: Bu dosyayı Supabase SQL Editor'da çalıştırın
-- ============================================================

-- ============================================================
-- 1. MEVCUT TABLOLARA EKLEMELER
-- ============================================================

-- doctors tablosuna eksik alanlar
ALTER TABLE doctors ADD COLUMN IF NOT EXISTS about TEXT;
ALTER TABLE doctors ADD COLUMN IF NOT EXISTS specialties TEXT[] DEFAULT '{}';
ALTER TABLE doctors ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT true;
ALTER TABLE doctors ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE doctors ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0;
ALTER TABLE doctors ADD COLUMN IF NOT EXISTS meta_title TEXT;
ALTER TABLE doctors ADD COLUMN IF NOT EXISTS meta_description TEXT;

-- health_articles tablosuna eksik alanlar
ALTER TABLE health_articles ADD COLUMN IF NOT EXISTS author_name TEXT;
ALTER TABLE health_articles ADD COLUMN IF NOT EXISTS author_title TEXT;
ALTER TABLE health_articles ADD COLUMN IF NOT EXISTS author_image TEXT;
ALTER TABLE health_articles ADD COLUMN IF NOT EXISTS related_article_ids INTEGER[] DEFAULT '{}';
ALTER TABLE health_articles ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT true;
ALTER TABLE health_articles ADD COLUMN IF NOT EXISTS excerpt TEXT;
ALTER TABLE health_articles ADD COLUMN IF NOT EXISTS read_time TEXT DEFAULT '5 dk';

-- ============================================================
-- 1.5 ESKİ KOLON İSİMLERİNİ DÜZELTME (image_url -> image)
-- ============================================================

DO $$
BEGIN
    -- hero_slides: image_url -> image
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'hero_slides' AND column_name = 'image_url') THEN
        ALTER TABLE hero_slides DROP COLUMN IF EXISTS image;
        ALTER TABLE hero_slides RENAME COLUMN image_url TO image;
    END IF;

    -- hero_slides: cta_text / cta_link -> button_text / button_link
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'hero_slides' AND column_name = 'cta_text') THEN
        ALTER TABLE hero_slides DROP COLUMN IF EXISTS button_text;
        ALTER TABLE hero_slides RENAME COLUMN cta_text TO button_text;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'hero_slides' AND column_name = 'cta_link') THEN
        ALTER TABLE hero_slides DROP COLUMN IF EXISTS button_link;
        ALTER TABLE hero_slides RENAME COLUMN cta_link TO button_link;
    END IF;

    -- testimonials: image_url -> image
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'testimonials' AND column_name = 'image_url') THEN
        ALTER TABLE testimonials DROP COLUMN IF EXISTS image;
        ALTER TABLE testimonials RENAME COLUMN image_url TO image;
    END IF;

    -- testimonials: quote -> comment
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'testimonials' AND column_name = 'quote') THEN
        ALTER TABLE testimonials DROP COLUMN IF EXISTS comment;
        ALTER TABLE testimonials RENAME COLUMN quote TO comment;
    END IF;

    -- news_items: image_url -> image
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'news_items' AND column_name = 'image_url') THEN
        ALTER TABLE news_items DROP COLUMN IF EXISTS image;
        ALTER TABLE news_items RENAME COLUMN image_url TO image;
    END IF;
END $$;

-- ============================================================
-- 2. YENİ TABLOLAR
-- ============================================================

-- Audit Log (Admin aktiviteleri için)
CREATE TABLE IF NOT EXISTS audit_logs (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id INTEGER,
  details JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Hero Slides (Ana sayfa slider)
CREATE TABLE IF NOT EXISTS hero_slides (
  id SERIAL PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE hero_slides ADD COLUMN IF NOT EXISTS title TEXT NOT NULL DEFAULT '';
ALTER TABLE hero_slides ADD COLUMN IF NOT EXISTS subtitle TEXT;
ALTER TABLE hero_slides ADD COLUMN IF NOT EXISTS image TEXT NOT NULL DEFAULT '';
ALTER TABLE hero_slides ADD COLUMN IF NOT EXISTS button_text TEXT;
ALTER TABLE hero_slides ADD COLUMN IF NOT EXISTS button_link TEXT;
ALTER TABLE hero_slides ADD COLUMN IF NOT EXISTS theme_color TEXT DEFAULT 'primary';
ALTER TABLE hero_slides ADD COLUMN IF NOT EXISTS order_index INTEGER DEFAULT 0;
ALTER TABLE hero_slides ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Testimonials (Hasta yorumları)
CREATE TABLE IF NOT EXISTS testimonials (
  id SERIAL PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE testimonials ADD COLUMN IF NOT EXISTS name TEXT NOT NULL DEFAULT '';
ALTER TABLE testimonials ADD COLUMN IF NOT EXISTS title TEXT;
ALTER TABLE testimonials ADD COLUMN IF NOT EXISTS comment TEXT NOT NULL DEFAULT '';
ALTER TABLE testimonials ADD COLUMN IF NOT EXISTS rating INTEGER DEFAULT 5;
ALTER TABLE testimonials ADD COLUMN IF NOT EXISTS image TEXT;
ALTER TABLE testimonials ADD COLUMN IF NOT EXISTS hospital_id INTEGER REFERENCES hospitals(id);
ALTER TABLE testimonials ADD COLUMN IF NOT EXISTS department_id INTEGER REFERENCES departments(id);
ALTER TABLE testimonials ADD COLUMN IF NOT EXISTS order_index INTEGER DEFAULT 0;
ALTER TABLE testimonials ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- News Items (Haberler)
CREATE TABLE IF NOT EXISTS news_items (
  id SERIAL PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE news_items ADD COLUMN IF NOT EXISTS title TEXT NOT NULL DEFAULT '';
ALTER TABLE news_items ADD COLUMN IF NOT EXISTS slug TEXT NOT NULL DEFAULT '';
ALTER TABLE news_items ADD COLUMN IF NOT EXISTS excerpt TEXT;
ALTER TABLE news_items ADD COLUMN IF NOT EXISTS content TEXT;
ALTER TABLE news_items ADD COLUMN IF NOT EXISTS image TEXT;
ALTER TABLE news_items ADD COLUMN IF NOT EXISTS category TEXT;
ALTER TABLE news_items ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT true;
ALTER TABLE news_items ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'news_items_slug_unique'
    ) THEN
        ALTER TABLE news_items ADD CONSTRAINT news_items_slug_unique UNIQUE (slug);
    END IF;
END $$;

-- Site Stats (İstatistik sayıları)
CREATE TABLE IF NOT EXISTS site_stats (
  id SERIAL PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE site_stats ADD COLUMN IF NOT EXISTS label TEXT NOT NULL DEFAULT '';
ALTER TABLE site_stats ADD COLUMN IF NOT EXISTS value TEXT NOT NULL DEFAULT '';
ALTER TABLE site_stats ADD COLUMN IF NOT EXISTS suffix TEXT;
ALTER TABLE site_stats ADD COLUMN IF NOT EXISTS icon TEXT;
ALTER TABLE site_stats ADD COLUMN IF NOT EXISTS order_index INTEGER DEFAULT 0;
ALTER TABLE site_stats ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Accreditations (Akreditasyonlar)
CREATE TABLE IF NOT EXISTS accreditations (
  id SERIAL PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE accreditations ADD COLUMN IF NOT EXISTS name TEXT NOT NULL DEFAULT '';
ALTER TABLE accreditations ADD COLUMN IF NOT EXISTS logo_url TEXT;
ALTER TABLE accreditations ADD COLUMN IF NOT EXISTS link TEXT;
ALTER TABLE accreditations ADD COLUMN IF NOT EXISTS order_index INTEGER DEFAULT 0;
ALTER TABLE accreditations ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Patient Feedback (Hasta geri bildirimleri)
CREATE TABLE IF NOT EXISTS patient_feedback (
  id SERIAL PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE patient_feedback ADD COLUMN IF NOT EXISTS name TEXT NOT NULL DEFAULT '';
ALTER TABLE patient_feedback ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE patient_feedback ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE patient_feedback ADD COLUMN IF NOT EXISTS subject TEXT;
ALTER TABLE patient_feedback ADD COLUMN IF NOT EXISTS message TEXT NOT NULL DEFAULT '';
ALTER TABLE patient_feedback ADD COLUMN IF NOT EXISTS hospital_id INTEGER REFERENCES hospitals(id);
ALTER TABLE patient_feedback ADD COLUMN IF NOT EXISTS is_read BOOLEAN DEFAULT false;
ALTER TABLE patient_feedback ADD COLUMN IF NOT EXISTS is_responded BOOLEAN DEFAULT false;
ALTER TABLE patient_feedback ADD COLUMN IF NOT EXISTS admin_notes TEXT;

-- ============================================================
-- 3. STORAGE BUCKET'LAR
-- ============================================================

INSERT INTO storage.buckets (id, name, public)
VALUES
  ('hero-images', 'hero-images', true),
  ('testimonial-images', 'testimonial-images', true),
  ('news-images', 'news-images', true)
ON CONFLICT DO NOTHING;

-- Public read policies
CREATE POLICY IF NOT EXISTS "Public Read hero-images"
  ON storage.objects FOR SELECT USING (bucket_id = 'hero-images');
CREATE POLICY IF NOT EXISTS "Public Read testimonial-images"
  ON storage.objects FOR SELECT USING (bucket_id = 'testimonial-images');
CREATE POLICY IF NOT EXISTS "Public Read news-images"
  ON storage.objects FOR SELECT USING (bucket_id = 'news-images');

-- Authenticated upload policies
CREATE POLICY IF NOT EXISTS "Authenticated Insert hero-images"
  ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'hero-images');
CREATE POLICY IF NOT EXISTS "Authenticated Insert testimonial-images"
  ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'testimonial-images');
CREATE POLICY IF NOT EXISTS "Authenticated Insert news-images"
  ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'news-images');

-- Authenticated delete policies
CREATE POLICY IF NOT EXISTS "Authenticated Delete hero-images"
  ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'hero-images');
CREATE POLICY IF NOT EXISTS "Authenticated Delete testimonial-images"
  ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'testimonial-images');
CREATE POLICY IF NOT EXISTS "Authenticated Delete news-images"
  ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'news-images');

-- ============================================================
-- 4. YETKILENDIRMELER
-- ============================================================

GRANT SELECT ON hero_slides TO anon, authenticated;
GRANT SELECT ON testimonials TO anon, authenticated;
GRANT SELECT ON news_items TO anon, authenticated;
GRANT SELECT ON site_stats TO anon, authenticated;
GRANT SELECT ON accreditations TO anon, authenticated;

GRANT INSERT, UPDATE, DELETE ON hero_slides TO authenticated;
GRANT INSERT, UPDATE, DELETE ON testimonials TO authenticated;
GRANT INSERT, UPDATE, DELETE ON news_items TO authenticated;
GRANT INSERT, UPDATE, DELETE ON site_stats TO authenticated;
GRANT INSERT, UPDATE, DELETE ON accreditations TO authenticated;
GRANT INSERT, UPDATE, DELETE ON patient_feedback TO authenticated;
GRANT INSERT, UPDATE, DELETE ON audit_logs TO authenticated;

GRANT USAGE, SELECT ON SEQUENCE hero_slides_id_seq TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE testimonials_id_seq TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE news_items_id_seq TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE site_stats_id_seq TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE accreditations_id_seq TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE patient_feedback_id_seq TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE audit_logs_id_seq TO authenticated;

-- ============================================================
-- 4. SEED VERILERI - Hero Slides
-- ============================================================

INSERT INTO hero_slides (title, subtitle, image, button_text, button_link, theme_color, order_index, is_active)
VALUES
('Geleceğin Sağlığı, Bugün', 'Çeyrek asırlık tecrübemiz, dünya standartlarındaki teknolojimiz ve 150''yi aşkın uzman kadromuzla sağlığınızın geleceğini şekillendiriyoruz.', 'https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=85', 'Online Randevu Al', 'https://anadoluhastaneleri.kendineiyibak.app/', 'primary', 0, true),
('Sınırsız Güven, Mükemmellik', 'Joint Commission International akreditasyonu ile uluslararası standartlarda, hasta güvenliği ve kalite yönetiminde zirvedeyiz.', 'https://images.unsplash.com/photo-1516549655169-df83a0774514?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=85', 'Kalite Standartlarımız', '/hakkimizda', 'ocean', 1, true),
('Her An Yanınızdayız', 'Gelişmiş acil müdahale ünitelerimiz ve deneyimli kadromuzla gecenin her saati, yaşam kurtarmaya hazırız.', 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=85', 'Acil Servis', '/iletisim', 'coral', 2, true)
ON CONFLICT DO NOTHING;

-- ============================================================
-- 5. SEED VERILERI - Site Stats
-- ============================================================

INSERT INTO site_stats (label, value, suffix, icon, order_index, is_active)
VALUES
('Uzman Doktor', '150', '+', 'bi-heart-pulse', 0, true),
('Yatak Kapasitesi', '500', '+', 'bi-hospital', 1, true),
('Poliklinik', '40', '+', 'bi-people', 2, true),
('Yıllık Deneyim', '25', '', 'bi-calendar-check', 3, true)
ON CONFLICT DO NOTHING;

-- ============================================================
-- 6. SEED VERILERI - Accreditations
-- ============================================================

INSERT INTO accreditations (name, logo_url, link, order_index, is_active)
VALUES
('JCI Akreditasyonu', 'https://placehold.co/120x60?text=JCI', 'https://www.jointcommissioninternational.org/', 0, true),
('ISO 9001:2015', 'https://placehold.co/120x60?text=ISO', 'https://www.iso.org/', 1, true),
('Türkiye Sağlık Turizmi', 'https://placehold.co/120x60?text=TST', 'https://www.tursab.org.tr/', 2, true),
('TSE', 'https://placehold.co/120x60?text=TSE', 'https://www.tse.org.tr/', 3, true)
ON CONFLICT DO NOTHING;

-- ============================================================
-- 7. SEED VERILERI - Testimonials
-- ============================================================

INSERT INTO testimonials (name, title, comment, rating, image, order_index, is_active)
VALUES
('Ayşe K.', 'Hasta Yakını', 'Annemin ameliyat sürecinde gösterdikleri ilgi ve alaka için çok teşekkür ederiz. Doktorlarımız gerçekten alanında uzman.', 5, 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=100&q=80', 0, true),
('Mehmet T.', 'Hasta', 'Kardiyoloji bölümündeki muayenem çok profesyonel geçti. Modern cihazlar ve güler yüzlü personel.', 5, 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=100&q=80', 1, true),
('Fatma S.', 'Hasta', 'Doğum sürecimde bana ve aileme gösterilen yakın ilgi için minnettarım. Her şey çok güzeldi.', 5, 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=100&q=80', 2, true)
ON CONFLICT DO NOTHING;

-- ============================================================
-- 8. MOCK MAKALE VERISI - Health Articles
-- ============================================================

INSERT INTO health_articles (
  title, slug, category, image, date, views, author_name, author_title, author_image,
  content, tags, type, is_published, excerpt, read_time
) VALUES
(
  'Kalp Sağlığınızı Korumak İçin 10 Öneri',
  'kalp-sagliginizi-korumak-icin-10-oneri',
  'Kardiyoloji',
  'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
  '2023-09-15',
  1245,
  'Prof. Dr. Ahmet Yılmaz',
  'Kardiyoloji Uzmanı',
  'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
  '<p>Kalp sağlığı, genel sağlığımızın en önemli bileşenlerinden biridir. Kalp ve damar hastalıkları, dünya genelinde en yaygın ölüm nedenlerinden biri olmaya devam etmektedir. Ancak, doğru yaşam tarzı seçimleri ve alışkanlıklar ile kalp sağlığınızı korumak mümkündür.</p><h2>1. Dengeli Beslenin</h2><p>Kalp sağlığı için Akdeniz tipi beslenme önerilmektedir. Bu beslenme şekli, zeytinyağı, balık, sebze, meyve, tam tahıllar ve kuruyemişler gibi kalp dostu besinleri içerir.</p><h2>2. Düzenli Egzersiz Yapın</h2><p>Haftada en az 150 dakika orta yoğunlukta aerobik egzersiz yapmak kalp sağlığınızı destekler.</p><h2>3. Sigarayı Bırakın</h2><p>Sigara içmek, kalp hastalığı riskini önemli ölçüde artırır.</p><h2>4. Alkolü Sınırlayın</h2><p>Aşırı alkol tüketimi, kalp sağlığınızı olumsuz etkileyebilir.</p><h2>5. Sağlıklı Kilonuzu Koruyun</h2><p>Fazla kilo ve obezite, kalp hastalığı riskini artırır.</p><h2>6. Stresi Yönetin</h2><p>Kronik stres, kalp sağlığınızı olumsuz etkileyebilir.</p><h2>7. Kan Basıncınızı Kontrol Edin</h2><p>Yüksek tansiyon, kalp hastalığı için önemli bir risk faktörüdür.</p><h2>8. Kolesterol Seviyelerinizi Takip Edin</h2><p>Yüksek LDL kolesterol ve düşük HDL kolesterol, kalp hastalığı riskini artırır.</p><h2>9. Diyabet Riskinizi Azaltın</h2><p>Diyabet, kalp hastalığı riskini artırır.</p><h2>10. Düzenli Sağlık Kontrolleri Yaptırın</h2><p>Düzenli sağlık kontrolleri, kalp hastalığı risk faktörlerini erken tespit etmeye yardımcı olur.</p><p>Kalp sağlığınızı korumak için bu önerileri günlük yaşamınıza dahil etmek, kalp hastalığı riskinizi azaltacaktır.</p>',
  ARRAY['Kalp Sağlığı', 'Beslenme', 'Egzersiz', 'Sağlıklı Yaşam'],
  'article',
  true,
  'Kalp sağlığınızı korumak için uzmanlarımızdan 10 altın öneri. Dengeli beslenme, egzersiz ve düzenli kontrollerle kalbinizi koruyun.',
  '8 dk'
)
ON CONFLICT DO NOTHING;

-- İlgili makaleler (diğer 3 makale)
INSERT INTO health_articles (
  title, slug, category, image, date, views,
  content, tags, type, is_published, excerpt, read_time
) VALUES
(
  'Hipertansiyon Nedir ve Nasıl Kontrol Edilir?',
  'hipertansiyon-nedir-ve-nasil-kontrol-edilir',
  'Kardiyoloji',
  'https://images.unsplash.com/photo-1576091160550-2173dba999ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  '2023-08-28',
  890,
  '<p>Hipertansiyon, kan basıncının normal değerlerin üzerinde olması durumudur. Türkiye''de yetişkinlerin yaklaşık üçte biri hipertansiyon hastasıdır.</p>',
  ARRAY['Hipertansiyon', 'Tansiyon', 'Kardiyoloji'],
  'article',
  true,
  'Yüksek tansiyonun nedenleri, belirtileri ve kontrol yöntemleri hakkında bilmeniz gerekenler.',
  '6 dk'
),
(
  'Sağlıklı Beslenme Rehberi',
  'saglikli-beslenme-rehberi',
  'Beslenme',
  'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  '2023-08-15',
  2100,
  '<p>Sağlıklı beslenme, vücudumuzun ihtiyaç duyduğu tüm besin ögelerini doğru miktarlarda almayı içerir.</p>',
  ARRAY['Beslenme', 'Diyet', 'Sağlıklı Yaşam'],
  'article',
  true,
  'Günlük beslenme düzeninizi nasıl oluşturmalısınız? Uzman diyetisyenlerimizden kapsamlı rehber.',
  '7 dk'
),
(
  'Stres Yönetimi Teknikleri',
  'stres-yonetimi-teknikleri',
  'Psikoloji',
  'https://images.unsplash.com/photo-1506126613408-eca07ce68773?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  '2023-08-10',
  1560,
  '<p>Modern yaşamın getirdiği stresle başa çıkmak için etkili teknikler ve uzman önerileri.</p>',
  ARRAY['Stres', 'Psikoloji', 'Ruh Sağlığı'],
  'article',
  true,
  'Günlük hayatın stresiyle başa çıkmak için kanıta dayalı yöntemler ve pratik ipuçları.',
  '5 dk'
)
ON CONFLICT DO NOTHING;

-- ============================================================
-- 9. KONTROL SORGULARI
-- ============================================================

SELECT 'hero_slides' as tablo, count(*) as kayit FROM hero_slides
UNION ALL SELECT 'testimonials', count(*) FROM testimonials
UNION ALL SELECT 'site_stats', count(*) FROM site_stats
UNION ALL SELECT 'accreditations', count(*) FROM accreditations
UNION ALL SELECT 'health_articles', count(*) FROM health_articles
UNION ALL SELECT 'news_items', count(*) FROM news_items
UNION ALL SELECT 'patient_feedback', count(*) FROM patient_feedback;
