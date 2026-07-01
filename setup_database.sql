-- ============================================================
-- Anadolu Hastaneleri Grubu - Database Setup
-- Supabase SQL Editor'da bu dosyayı çalıştırın.
-- ============================================================

-- ============================================================
-- 1. TABLOLAR
-- Bağımlı tablolar dahil sırayla düşür ve yeniden oluştur
-- ============================================================

-- Önce bağımlı tabloları düşür (doctors hospitals'a FK referans veriyor olabilir)
DROP TABLE IF EXISTS doctors CASCADE;
DROP TABLE IF EXISTS hospitals CASCADE;
DROP TABLE IF EXISTS departments CASCADE;

CREATE TABLE hospitals (
  id              SERIAL PRIMARY KEY,
  name            TEXT NOT NULL,
  slug            TEXT NOT NULL UNIQUE,
  description     TEXT,
  address         TEXT,
  phone           TEXT,
  email           TEXT,
  working_hours   TEXT,
  emergency_hours TEXT,
  images          JSONB DEFAULT '[]'::jsonb,
  display_on_homepage BOOLEAN DEFAULT true,
  is_active       BOOLEAN DEFAULT true,
  image_url       TEXT,
  display_order   INTEGER DEFAULT 0,
  meta_title      TEXT,
  meta_description TEXT,
  hero_title      TEXT,
  hero_subtitle   TEXT,
  map_url         TEXT,
  is_published    BOOLEAN DEFAULT true,
  created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE departments (
  id               SERIAL PRIMARY KEY,
  name             TEXT NOT NULL,
  slug             TEXT NOT NULL UNIQUE,
  icon             TEXT DEFAULT 'bi-hospital',
  description      TEXT,
  category         TEXT DEFAULT 'dahili',
  long_description TEXT,
  meta_title       TEXT,
  meta_description TEXT,
  hero_title       TEXT,
  hero_subtitle    TEXT,
  is_published     BOOLEAN DEFAULT true,
  display_order    INTEGER DEFAULT 0,
  images           JSONB DEFAULT '[]'::jsonb,
  treatments       JSONB DEFAULT '[]'::jsonb,
  equipment        JSONB DEFAULT '[]'::jsonb,
  created_at       TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 2. HASTANE SEED VERISI (3 HASTANE)
-- ============================================================

INSERT INTO hospitals (
  name, slug, description, address, phone, email,
  working_hours, emergency_hours, images,
  display_on_homepage, is_active, display_order,
  meta_title, meta_description,
  hero_title, hero_subtitle,
  is_published
) VALUES
(
  'Silivri Anadolu Hastanesi',
  'silivri-anadolu-hastanesi',
  'Silivri ve çevresine modern tıp altyapısı ve uzman kadrosuyla kapsamlı sağlık hizmeti sunuyoruz.',
  'Mimar Sinan Mahallesi, Mimar Sinan Caddesi No:72, 34570 Silivri',
  '0212 728 10 00',
  'silivri@anadoluhastaneleri.com',
  'Pazartesi - Cumartesi: 08:00 - 20:00, Pazar: 09:00 - 18:00',
  '7/24 Acil Servis hizmet vermektedir.',
  '["https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=1200&q=80","https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1200&q=80"]',
  true, true, 1,
  'Silivri Anadolu Hastanesi | Anadolu Hastaneleri Grubu',
  'Silivri Anadolu Hastanesi, modern teknoloji ve uzman kadrosuyla Silivri bölgesinde kaliteli sağlık hizmeti sunmaktadır.',
  'Silivri Anadolu Hastanesi',
  'Modern Tıp, Güvenilir Hizmet',
  true
),
(
  'Avcılar Anadolu Hastanesi',
  'avcilar-anadolu-hastanesi',
  'Avcılar ve çevre ilçelere yönelik geniş poliklinik kadrosu ve ileri tanı-tedavi altyapısıyla hizmet veriyoruz.',
  'Denizköşkler Mah. E-5 Yan Yol No:15, Avcılar / İstanbul',
  '0212 422 30 00',
  'avcilar@anadoluhastaneleri.com',
  'Pazartesi - Cumartesi: 08:00 - 21:00, Pazar: 09:00 - 18:00',
  '7/24 Acil Servis hizmet vermektedir.',
  '["https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=1200&q=80","https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=1200&q=80"]',
  true, true, 2,
  'Avcılar Anadolu Hastanesi | Anadolu Hastaneleri Grubu',
  'Avcılar Anadolu Hastanesi, alanında uzman doktorları ve modern ekipmanlarıyla Avcılar bölgesinde sağlığınız için çalışmaktadır.',
  'Avcılar Anadolu Hastanesi',
  'Uzman Kadro, İleri Teknoloji',
  true
),
(
  'Ereğli Anadolu Hastanesi',
  'eregli-anadolu-hastanesi',
  'Zonguldak Ereğli''de bölge halkına kapsamlı sağlık hizmeti sunan, tam donanımlı hastanemiz.',
  'Müftü Mah. Atatürk Cad. No:88, Ereğli / Zonguldak',
  '0372 316 20 00',
  'eregli@anadoluhastaneleri.com',
  'Pazartesi - Cumartesi: 08:00 - 20:00, Pazar: 09:00 - 17:00',
  '7/24 Acil Servis hizmet vermektedir.',
  '["https://images.unsplash.com/photo-1551190822-a9333d879b1f?auto=format&fit=crop&w=1200&q=80","https://images.unsplash.com/photo-1538108149393-fbbd81895907?auto=format&fit=crop&w=1200&q=80"]',
  true, true, 3,
  'Ereğli Anadolu Hastanesi | Anadolu Hastaneleri Grubu',
  'Ereğli Anadolu Hastanesi, Zonguldak Ereğli bölgesinde modern tıbbi hizmetler sunmaktadır.',
  'Ereğli Anadolu Hastanesi',
  'Bölgenizde Güvenilir Sağlık',
  true
);

-- ============================================================
-- 3. BÖLÜM SEED VERISI (15 BÖLÜM)
-- ============================================================

INSERT INTO departments (
  name, slug, icon, description, category,
  long_description, meta_title, meta_description,
  hero_title, hero_subtitle,
  is_published, display_order
) VALUES
(
  'Kardiyoloji',
  'kardiyoloji',
  'bi-heart-pulse-fill',
  'Kalp ve damar hastalıklarının tanı, tedavi ve takibinde uzman ekibimizle yanınızdayız.',
  'dahili',
  'Kardiyoloji bölümümüz; koroner arter hastalıkları, kalp yetmezliği, hipertansiyon, aritmiler ve kapak hastalıklarının tanı ve tedavisinde ileri teknoloji kullanmaktadır. EKG, ekokardiografi, Holter monitörizasyon, kardiyak stres testleri ve girişimsel kardiyoloji hizmetleri sunulmaktadır.',
  'Kardiyoloji | Anadolu Hastaneleri Grubu',
  'Anadolu Hastaneleri Grubu Kardiyoloji bölümü; kalp hastalıklarında uzman tanı ve tedavi hizmetleri sunmaktadır.',
  'Kardiyoloji Bölümü', 'Kalp Sağlığınız Bizim Önceliğimiz',
  true, 1
),
(
  'Nöroloji',
  'noroloji',
  'bi-brain',
  'Sinir sistemi hastalıklarının tanı ve tedavisinde deneyimli nöroloji uzmanlarımız hizmetinizde.',
  'dahili',
  'Nöroloji bölümümüz; baş ağrısı, migren, epilepsi, inme, Parkinson, Alzheimer, multipl skleroz ve periferik sinir hastalıklarının tanı ve tedavisinde uzmanlaşmıştır. EEG, EMG, BOS analizi ve ileri görüntüleme hizmetleri mevcuttur.',
  'Nöroloji | Anadolu Hastaneleri Grubu',
  'Anadolu Hastaneleri Grubu Nöroloji bölümünde sinir sistemi hastalıklarınız için uzman tanı ve tedavi.',
  'Nöroloji Bölümü', 'Sinir Sistemi Sağlığınız İçin Uzman Ekip',
  true, 2
),
(
  'Ortopedi ve Travmatoloji',
  'ortopedi-ve-travmatoloji',
  'bi-person-standing',
  'Kemik, eklem ve kas hastalıklarının cerrahi ve cerrahi dışı tedavisinde uzman kadromuzla hizmetinizdeyiz.',
  'cerrahi',
  'Ortopedi ve Travmatoloji bölümümüz; kırıklar, eklem sorunları, omurga hastalıkları, spor yaralanmaları ve dejeneratif eklem hastalıklarının tedavisinde faaliyet göstermektedir. Artroskopik cerrahi, diz-kalça protezi ve spor cerrahisi alanlarında uzmanlaşmıştır.',
  'Ortopedi ve Travmatoloji | Anadolu Hastaneleri Grubu',
  'Kemik ve eklem sorunlarınız için Anadolu Hastaneleri Grubu Ortopedi bölümünden destek alın.',
  'Ortopedi ve Travmatoloji', 'Hareket Özgürlüğünüzü Geri Kazanın',
  true, 3
),
(
  'Genel Cerrahi',
  'genel-cerrahi',
  'bi-scissors',
  'Abdominal ve genel cerrahi operasyonlarda laparoskopik ve açık cerrahi yöntemleriyle hizmet veriyoruz.',
  'cerrahi',
  'Genel Cerrahi bölümümüz; safra kesesi, apandisit, fıtık, tiroid, kolon-rektum ve meme cerrahilerinde laparoskopik ve açık cerrahi uygulamaktadır. Günübirlik cerrahi ve obezite cerrahisi hizmetleri de sunulmaktadır.',
  'Genel Cerrahi | Anadolu Hastaneleri Grubu',
  'Anadolu Hastaneleri Grubu Genel Cerrahi bölümü, modern cerrahi yöntemlerle güvenli operasyonlar gerçekleştirmektedir.',
  'Genel Cerrahi Bölümü', 'Modern Cerrahi, Hızlı İyileşme',
  true, 4
),
(
  'Dahiliye (İç Hastalıkları)',
  'dahiliye',
  'bi-activity',
  'İç hastalıklarının tanı ve tedavisinde bütüncül yaklaşımımızla yanınızdayız.',
  'dahili',
  'Dahiliye bölümümüz; diyabet, hipertansiyon, tiroid hastalıkları, anemi, böbrek ve karaciğer hastalıkları ile genel sağlık kontrollerinde uzman hizmet sunmaktadır. Koruyucu hekimlik ve kronik hastalık yönetimi de bölümümüzün öncelikleri arasındadır.',
  'Dahiliye | Anadolu Hastaneleri Grubu',
  'İç hastalıklarınız için Anadolu Hastaneleri Grubu Dahiliye bölümünden uzman yardım alın.',
  'Dahiliye Bölümü', 'Genel Sağlığınız İçin Kapsamlı Hizmet',
  true, 5
),
(
  'Pediatri (Çocuk Sağlığı)',
  'pediatri',
  'bi-people-fill',
  'Çocuklarınızın sağlıklı büyümesi için pediatri uzmanlarımız her zaman yanınızda.',
  'dahili',
  'Pediatri bölümümüz; yenidoğan bakımından ergenliğe kadar her yaş grubunda çocuk sağlığı ve hastalıkları konusunda uzman hizmet sunmaktadır. Aşılama, gelişim takibi, çocuk beslenme danışmanlığı ve pediyatrik acil hizmetleri verilmektedir.',
  'Pediatri | Anadolu Hastaneleri Grubu',
  'Çocuğunuzun sağlığı için Anadolu Hastaneleri Grubu Pediatri bölümü yanınızdadır.',
  'Pediatri Bölümü', 'Minik Kalpler Bizim Önceliğimiz',
  true, 6
),
(
  'Kadın Hastalıkları ve Doğum',
  'kadin-hastaliklari-ve-dogum',
  'bi-gender-female',
  'Kadın sağlığı ve doğum alanında deneyimli uzman ekibimizle güvenli ve konforlu hizmet sunuyoruz.',
  'cerrahi',
  'Kadın Hastalıkları ve Doğum bölümümüz; gebelik takibi, normal ve sezaryen doğum, jinekolojik hastalıklar, infertilite ve menopoz yönetimi konularında kapsamlı hizmet sunmaktadır. Laparoskopik jinekolojik cerrahi de uygulanmaktadır.',
  'Kadın Hastalıkları ve Doğum | Anadolu Hastaneleri Grubu',
  'Kadın sağlığı ve doğum hizmetleri için Anadolu Hastaneleri Grubu yanınızdadır.',
  'Kadın Hastalıkları ve Doğum', 'Sağlıklı Yarınlar İçin Güvenli Ellerdeyiz',
  true, 7
),
(
  'Göz Hastalıkları',
  'goz-hastaliklari',
  'bi-eye-fill',
  'Görme bozukluklarından retina hastalıklarına kadar göz sağlığınız için modern tanı ve tedavi yöntemleri.',
  'cerrahi',
  'Göz Hastalıkları bölümümüz; katarakt, glokom, şaşılık, retina hastalıkları, kornea sorunları ve refraktif cerrahi (Lasik) alanlarında uzman hizmet sunmaktadır. Fundus kamerası, OCT ve görme alanı analizi gibi ileri tanı yöntemleri kullanılmaktadır.',
  'Göz Hastalıkları | Anadolu Hastaneleri Grubu',
  'Göz sağlığınız için Anadolu Hastaneleri Grubu Göz Hastalıkları bölümünden destek alın.',
  'Göz Hastalıkları Bölümü', 'Görme Sağlığınızı Koruyoruz',
  true, 8
),
(
  'Kulak Burun Boğaz (KBB)',
  'kulak-burun-bogaz',
  'bi-ear-fill',
  'KBB hastalıklarının tanı ve cerrahi tedavisinde uzman kadromuzla hizmetinizdeyiz.',
  'cerrahi',
  'Kulak Burun Boğaz bölümümüz; işitme kaybı, kulak çınlaması, sinüzit, bademcik ve geniz eti hastalıkları, boyun kitleleri ve uyku apnesi tedavisinde uzmanlaşmıştır. Endoskopik sinüs cerrahisi ve timpanoplasti operasyonları gerçekleştirilmektedir.',
  'Kulak Burun Boğaz | Anadolu Hastaneleri Grubu',
  'KBB sorunlarınız için Anadolu Hastaneleri Grubu uzman ekibinden yardım alın.',
  'Kulak Burun Boğaz Bölümü', 'İşitme ve Nefes Almanın Uzmanları',
  true, 9
),
(
  'Üroloji',
  'uroloji',
  'bi-droplet-fill',
  'İdrar yolları ve üreme organı hastalıklarının tanı ve tedavisinde deneyimli uzman ekibimiz.',
  'cerrahi',
  'Üroloji bölümümüz; böbrek taşı, prostat hastalıkları, mesane sorunları, erkek üreme sistemi hastalıkları ve çocuk ürolojisi alanlarında hizmet vermektedir. Laparoskopik ve endoskopik ürolojik cerrahi uygulanmaktadır.',
  'Üroloji | Anadolu Hastaneleri Grubu',
  'Üroloji hastalıklarınız için Anadolu Hastaneleri Grubu Üroloji bölümünü tercih edin.',
  'Üroloji Bölümü', 'Ürolojik Sağlığınız İçin Uzman Yaklaşım',
  true, 10
),
(
  'Dermatoloji',
  'dermatoloji',
  'bi-person-check-fill',
  'Cilt, saç ve tırnak hastalıklarının tanı ve tedavisinde estetik dermatoloji hizmetleriyle yanınızdayız.',
  'dahili',
  'Dermatoloji bölümümüz; egzama, sedef hastalığı, akne, cilt kanserleri, saç dökülmesi ve tırnak hastalıklarının yanı sıra botoks, dolgu ve lazer tedavileri gibi estetik dermatoloji hizmetleri sunmaktadır.',
  'Dermatoloji | Anadolu Hastaneleri Grubu',
  'Cilt sağlığınız için Anadolu Hastaneleri Grubu Dermatoloji bölümünden destek alın.',
  'Dermatoloji Bölümü', 'Sağlıklı ve Güzel Bir Cilt İçin',
  true, 11
),
(
  'Radyoloji',
  'radyoloji',
  'bi-radioactive',
  'Röntgen, ultrason, MR ve BT görüntüleme hizmetleriyle doğru tanı için yüksek teknoloji.',
  'teshis',
  'Radyoloji bölümümüz; dijital röntgen, ultrasonografi, bilgisayarlı tomografi (BT), manyetik rezonans görüntüleme (MR) ve mamografi hizmetleri sunmaktadır. Deneyimli radyoloji uzmanlarımız ayrıntılı raporlama ile diğer bölümlere destek olmaktadır.',
  'Radyoloji | Anadolu Hastaneleri Grubu',
  'İleri görüntüleme hizmetleri için Anadolu Hastaneleri Grubu Radyoloji bölümünü tercih edin.',
  'Radyoloji Bölümü', 'Doğru Tanı İçin İleri Görüntüleme',
  true, 12
),
(
  'Laboratuvar',
  'laboratuvar',
  'bi-flask-fill',
  'Kan, idrar ve doku analizlerinde ISO standartlarında güvenilir sonuçlar sunuyoruz.',
  'teshis',
  'Laboratuvar bölümümüz; biyokimya, hematoloji, mikrobiyoloji, patoloji ve hormon testleri dahil kapsamlı laboratuvar hizmetleri sunmaktadır. Modern otomasyon sistemleri ve kalite kontrol süreçleriyle güvenilir sonuçlar sağlanmaktadır.',
  'Laboratuvar | Anadolu Hastaneleri Grubu',
  'Güvenilir laboratuvar testleri için Anadolu Hastaneleri Grubu Laboratuvar bölümünü tercih edin.',
  'Laboratuvar Bölümü', 'Güvenilir Sonuçlar, Doğru Tanı',
  true, 13
),
(
  'Fizik Tedavi ve Rehabilitasyon',
  'fizik-tedavi-ve-rehabilitasyon',
  'bi-person-walking',
  'Hareket kısıtlılığı ve ağrı sorunlarında kanıta dayalı fizik tedavi yöntemleriyle iyileşmenizi destekliyoruz.',
  'dahili',
  'Fizik Tedavi ve Rehabilitasyon bölümümüz; felç rehabilitasyonu, ortopedik rehabilitasyon, spor yaralanmaları tedavisi, kronik ağrı yönetimi ve omurga rehabilitasyonu konularında hizmet vermektedir. Elektroterapi, ultrason terapi ve manuel terapi uygulanmaktadır.',
  'Fizik Tedavi ve Rehabilitasyon | Anadolu Hastaneleri Grubu',
  'Hareket kısıtlılığı ve ağrı sorunlarınız için Anadolu Hastaneleri Grubu Fizik Tedavi bölümünden destek alın.',
  'Fizik Tedavi ve Rehabilitasyon', 'Hareket Edin, Yaşayın',
  true, 14
),
(
  'Psikiyatri',
  'psikiyatri',
  'bi-emoji-smile-fill',
  'Ruh sağlığı ve psikiyatrik bozuklukların tanı ve tedavisinde gizlilik ilkesiyle hizmet veriyoruz.',
  'dahili',
  'Psikiyatri bölümümüz; depresyon, anksiyete, bipolar bozukluk, obsesif kompulsif bozukluk (OKB), şizofreni ve madde bağımlılığı tedavisinde uzman hizmet sunmaktadır. Bireysel terapi, ilaç yönetimi ve grup terapisi uygulanmaktadır.',
  'Psikiyatri | Anadolu Hastaneleri Grubu',
  'Ruh sağlığınız için Anadolu Hastaneleri Grubu Psikiyatri bölümünden destek alın.',
  'Psikiyatri Bölümü', 'Ruh Sağlığınız İçin Güvenli Alan',
  true, 15
);

-- ============================================================
-- 4. YETKİLENDİRME (GRANT)
-- SQL Editor'dan oluşturulan tablolarda anon role erişimi
-- manuel olarak verilmesi gerekir.
-- ============================================================

-- Herkese okuma yetkisi (public site için zorunlu)
GRANT SELECT ON hospitals TO anon, authenticated;
GRANT SELECT ON departments TO anon, authenticated;

-- Admin paneli için yazma yetkisi
GRANT INSERT, UPDATE, DELETE ON hospitals TO authenticated;
GRANT INSERT, UPDATE, DELETE ON departments TO authenticated;

-- ID sequence'leri için yetki (INSERT için gerekli)
GRANT USAGE, SELECT ON SEQUENCE hospitals_id_seq TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE departments_id_seq TO authenticated;

-- ============================================================
-- 5. ROW LEVEL SECURITY (RLS)
-- RLS kapalı bırakıyoruz — yetkilendirme GRANT ile yapıldı.
-- İleride açmak isterseniz aşağıdaki bloğu aktif edin.
-- ============================================================

ALTER TABLE hospitals DISABLE ROW LEVEL SECURITY;
ALTER TABLE departments DISABLE ROW LEVEL SECURITY;

/*
-- RLS açmak isterseniz:
ALTER TABLE hospitals ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Herkes okuyabilir" ON hospitals FOR SELECT USING (true);
CREATE POLICY "Herkes okuyabilir" ON departments FOR SELECT USING (true);
CREATE POLICY "Admin yazabilir" ON hospitals FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin yazabilir" ON departments FOR ALL USING (auth.role() = 'authenticated');
*/

-- ============================================================
-- 6. KONTROL SORGULARI
-- ============================================================
SELECT 'Hastaneler' as tablo, count(*) as kayit_sayisi FROM hospitals
UNION ALL
SELECT 'Bölümler', count(*) FROM departments;

-- Anon rolü erişim testi (bu sorgu 3 satır dönmeli):
SELECT id, name, is_published FROM hospitals ORDER BY display_order;
