-- gebe_okulu_seminars tablosunda RLS açık ancak yazma politikası tanımlı değil;
-- bu yüzden admin panelindeki ekleme/güncelleme/silme işlemleri
-- "new row violates row-level security policy" hatası veriyor.
--
-- Supabase Dashboard > SQL Editor'de çalıştırın:
-- https://supabase.com/dashboard/project/cfwwcxqpyxktikizjjxx/sql/new
--
-- Çalıştırdıktan sonra admin panelindeki Gebe Okulu sayfasını yenileyip
-- "Sitedeki Varsayılan Seminerleri İçe Aktar" butonuna tekrar tıklayın.

ALTER TABLE gebe_okulu_seminars ENABLE ROW LEVEL SECURITY;

-- Olası eski politikaları temizle
DROP POLICY IF EXISTS "Public read access" ON gebe_okulu_seminars;
DROP POLICY IF EXISTS "Enable read access for all users" ON gebe_okulu_seminars;
DROP POLICY IF EXISTS "Authenticated write access" ON gebe_okulu_seminars;

-- Herkes okuyabilsin (site ziyaretçileri dahil)
CREATE POLICY "Public read access" ON gebe_okulu_seminars
  FOR SELECT USING (true);

-- Giriş yapmış kullanıcılar (admin paneli) ekleme/güncelleme/silme yapabilsin
CREATE POLICY "Authenticated write access" ON gebe_okulu_seminars
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

GRANT SELECT ON gebe_okulu_seminars TO anon, authenticated;
GRANT ALL ON gebe_okulu_seminars TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE gebe_okulu_seminars_id_seq TO authenticated;
