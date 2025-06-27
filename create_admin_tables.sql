-- Create pages table
CREATE TABLE IF NOT EXISTS pages (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  content TEXT,
  meta_title VARCHAR(255),
  meta_description TEXT,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create contact_info table
CREATE TABLE IF NOT EXISTS contact_info (
  id SERIAL PRIMARY KEY,
  main_phone VARCHAR(50),
  emergency_phone VARCHAR(50),
  email VARCHAR(255),
  address TEXT,
  working_hours TEXT,
  emergency_hours TEXT,
  whatsapp VARCHAR(50),
  facebook VARCHAR(255),
  twitter VARCHAR(255),
  instagram VARCHAR(255),
  linkedin VARCHAR(255),
  google_maps_embed TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create about_content table
CREATE TABLE IF NOT EXISTS about_content (
  id SERIAL PRIMARY KEY,
  mission TEXT,
  vision TEXT,
  values TEXT,
  history TEXT,
  achievements TEXT,
  team_info TEXT,
  facilities TEXT,
  certifications TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create seo_settings table
CREATE TABLE IF NOT EXISTS seo_settings (
  id SERIAL PRIMARY KEY,
  site_title VARCHAR(255),
  site_description TEXT,
  site_keywords TEXT,
  og_title VARCHAR(255),
  og_description TEXT,
  og_image VARCHAR(500),
  twitter_title VARCHAR(255),
  twitter_description TEXT,
  twitter_image VARCHAR(500),
  google_analytics_id VARCHAR(50),
  google_search_console VARCHAR(255),
  robots_txt TEXT,
  sitemap_url VARCHAR(500),
  canonical_url VARCHAR(500),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default pages
INSERT INTO pages (title, slug, content, meta_title, meta_description, is_published) VALUES 
('Ana Sayfa', 'ana-sayfa', '<h1>Anadolu Hastaneleri Grubu</h1><p>Sağlığınız için en iyi hizmet, en son teknoloji ve uzman kadro.</p>', 'Anadolu Hastaneleri Grubu - Ana Sayfa', 'Modern tıbbi teknolojiler ve uzman kadrosuyla hizmet veren öncü sağlık kuruluşu.', true),
('Hakkımızda', 'hakkimizda', '<h1>Hakkımızda</h1><p>1995 yılından bu yana sağlık sektöründe öncü konumundayız.</p>', 'Hakkımızda - Anadolu Hastaneleri', 'Anadolu Hastaneleri Grubu hakkında detaylı bilgi.', true),
('İletişim', 'iletisim', '<h1>İletişim</h1><p>Bizimle iletişime geçin, size yardımcı olmaktan mutluluk duyarız.</p>', 'İletişim - Anadolu Hastaneleri', 'Anadolu Hastaneleri ile iletişim bilgileri.', true)
ON CONFLICT (slug) DO NOTHING;

-- Insert default contact info
INSERT INTO contact_info (main_phone, emergency_phone, email, address, working_hours, emergency_hours, whatsapp) VALUES 
('+90 212 123 45 67', '+90 212 123 45 68', 'info@anadoluhastaneleri.com', 'Merkez Mah. Sağlık Cad. No:123\nŞişli/İstanbul', 'Pazartesi - Cuma: 08:00 - 18:00\nCumartesi: 09:00 - 17:00\nPazar: 10:00 - 16:00', '7/24 Acil Servis', '+90 212 123 45 69')
ON CONFLICT (id) DO NOTHING;

-- Insert default about content
INSERT INTO about_content (mission, vision, values, history, achievements, team_info, facilities, certifications) VALUES 
('Hastalarımıza en kaliteli sağlık hizmetini sunmak, modern tıbbi teknolojiler ve uzman kadromuzla toplum sağlığına katkıda bulunmak.', '2030 yılına kadar Türkiye''nin önde gelen sağlık kuruluşlarından biri olmak ve uluslararası standartlarda hizmet vermek.', 'İnsan odaklılık\nKalite ve güvenlik\nSürekli gelişim\nEtik değerler\nTakım çalışması\nHasta memnuniyeti', '1995 yılında kurulan Anadolu Hastaneleri Grubu, 25 yılı aşkın deneyimi ile sağlık sektöründe öncü konumundadır.', '• 500.000+ başarılı tedavi\n• 50+ uzman doktor\n• 24/7 acil servis\n• JCI akreditasyonu\n• ISO 9001 kalite belgesi\n• Hasta memnuniyet oranı %98', 'Deneyimli doktorlarımız, hemşirelerimiz ve sağlık personelimizle oluşan güçlü ekibimiz, hastalarımıza en iyi hizmeti sunmak için 7/24 çalışmaktadır.', '• 200 yatak kapasitesi\n• 8 ameliyathane\n• Yoğun bakım üniteleri\n• Modern görüntüleme cihazları\n• Laboratuvar hizmetleri\n• Fizik tedavi merkezi', '• JCI (Joint Commission International) Akreditasyonu\n• ISO 9001:2015 Kalite Yönetim Sistemi\n• ISO 27001 Bilgi Güvenliği Yönetim Sistemi\n• Sağlık Bakanlığı Yetki Belgesi')
ON CONFLICT (id) DO NOTHING;

-- Insert default SEO settings
INSERT INTO seo_settings (site_title, site_description, site_keywords, og_title, og_description, canonical_url, robots_txt, sitemap_url) VALUES 
('Anadolu Hastaneleri Grubu - Sağlığınız Bizim Önceliğimiz', 'Modern tıbbi teknolojiler ve uzman kadrosuyla hizmet veren öncü sağlık kuruluşu. Randevu almak için hemen iletişime geçin.', 'hastane, sağlık, doktor, randevu, tıbbi, Anadolu, sağlık hizmetleri, kardiyoloji, nöroloji, ortopedi', 'Anadolu Hastaneleri Grubu - Sağlığınız Bizim Önceliğimiz', 'Modern tıbbi teknolojiler ve uzman kadrosuyla hizmet veren öncü sağlık kuruluşu.', 'https://anadoluhastaneleri.com', 'User-agent: *\nAllow: /\nSitemap: https://anadoluhastaneleri.com/sitemap.xml', 'https://anadoluhastaneleri.com/sitemap.xml')
ON CONFLICT (id) DO NOTHING;
