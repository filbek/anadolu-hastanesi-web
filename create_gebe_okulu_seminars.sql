-- Drop table if exists to start fresh
DROP TABLE IF EXISTS gebe_okulu_seminars CASCADE;

-- Create gebe_okulu_seminars table
CREATE TABLE gebe_okulu_seminars (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  date VARCHAR(100) NOT NULL,
  image VARCHAR(500) NOT NULL,
  summary TEXT,
  topics TEXT[] DEFAULT '{}',
  link_url VARCHAR(500),
  order_index INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  translations JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Disable Row Level Security (RLS) to allow public read access
-- (This matches the architecture of the other tables in this database)
ALTER TABLE gebe_okulu_seminars DISABLE ROW LEVEL SECURITY;

-- Enable select access for anonymous users and CRUD for authenticated users
GRANT SELECT ON gebe_okulu_seminars TO anon, authenticated;
GRANT ALL ON gebe_okulu_seminars TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE gebe_okulu_seminars_id_seq TO authenticated;

-- Insert default seminars (including the two new ones)
INSERT INTO gebe_okulu_seminars (title, date, image, summary, topics, link_url, order_index) VALUES 
('Gebelikte Beslenme ve Sağlıklı Yaşam', '15 Mayıs 2025', 'https://images.unsplash.com/photo-1559757175-5700dde675bc?auto=format&fit=crop&w=800&q=80', 'Uzman diyetisyenlerimiz tarafından verilen seminerde, gebelik döneminde doğru beslenme alışkanlıkları, vitamin ve mineral takviyeleri ile anne adayının sağlıklı kilo alımı ele alındı.', ARRAY['Gebelikte kilo kontrolü', 'Folik asit ve demir desteği', 'Toksik gıdalardan kaçınma'], NULL, 1),
('Doğum Hazırlık ve Nefes Teknikleri', '22 Mayıs 2025', 'https://images.unsplash.com/photo-1584515933487-779824d29309?auto=format&fit=crop&w=800&q=80', 'Ebelik ekibimiz tarafından düzenlenen uygulamalı atölyede, doğum süreci, nefes teknikleri, gevşeme egzersizleri ve doğum pozisyonları detaylıca anlatıldı.', ARRAY['Lamaze nefes teknikleri', 'Doğum pozisyonları', 'Eş desteği ve iletişim'], NULL, 2),
('Yenidoğan Bakımı ve Emzirme Teknikleri', '29 Mayıs 2025', 'https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&w=800&q=80', 'Doğum sonrası dönemde bebek bakımı, emzirme teknikleri, gaz sancısı ve uyku düzeni konularında uzman kadromuzdan pratik bilgiler edindik.', ARRAY['Doğru emzirme pozisyonu', 'Bebek banyosu ve hijyen', 'Ağlama nedenleri ve sakinleştirme'], NULL, 3),
('Gebelikte Egzersiz ve Fiziksel Aktivite', '5 Haziran 2025', 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=800&q=80', 'Fizik tedavi uzmanlarımızın eşliğinde gebelikte güvenli egzersizler, sırt ağrısı önleme ve pelvik taban kasları egzersizleri uygulamalı olarak gösterildi.', ARRAY['Pelvik taban egzersizleri', 'Gebelik yoga hareketleri', 'Sırt ve bel ağrısı önleme'], NULL, 4),
('Silivri Anadolu Hastanesi Gebe Okulu Buluşması', '12 Haziran 2026', '/uploads/gebe-okulu-silivri.jpg', 'Anne adaylarına özel eğitim ve farkındalık buluşması. Uzman anlatımları, doğuma hazırlık egzersizleri ve bebek bakımı eğitimleri ile sağlıklı bir başlangıç yapıyoruz.', ARRAY['Uzman anlatımları', 'Doğuma hazırlık', 'Bilinçli başlangıç'], 'https://anadoluhastaneleri.kendineiyibak.app/', 5),
('Gebe Okulu Eğitimi ve Destekleyici Atölye', '19 Haziran 2026', '/uploads/gebe-okulu-egitimi.jpg', 'Anne adayları için bilgilendirici ve destekleyici buluşma. Doğru nefes teknikleri, yoga hareketleri ve uzman kadromuz eşliğinde gebelik ve doğum sürecine hazırlık.', ARRAY['Nefes teknikleri', 'Gebelik yogası', 'Destekleyici buluşma'], 'https://anadoluhastaneleri.kendineiyibak.app/', 6);
