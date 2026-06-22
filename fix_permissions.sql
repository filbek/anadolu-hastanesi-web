-- ============================================================
-- fix_permissions.sql
-- Tabloları silmeden sadece yetki ve RLS sorununu düzelt.
-- Önce bunu deneyin — veri kaybolmaz.
-- ============================================================

-- 1. RLS'yi kapat (veri görünmüyorsa en yaygın neden)
ALTER TABLE hospitals DISABLE ROW LEVEL SECURITY;
ALTER TABLE departments DISABLE ROW LEVEL SECURITY;

-- 2. Anon role'e okuma yetkisi ver
GRANT SELECT ON hospitals TO anon, authenticated;
GRANT SELECT ON departments TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON hospitals TO authenticated;
GRANT INSERT, UPDATE, DELETE ON departments TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- 3. Mevcut veriyi kontrol et
SELECT 'Hastaneler' as tablo, count(*) as sayi,
       count(*) FILTER (WHERE is_published = true) as yayinlanan
FROM hospitals
UNION ALL
SELECT 'Bölümler', count(*),
       count(*) FILTER (WHERE is_published = true)
FROM departments;

-- 4. Eğer veri yoksa is_published durumunu göster
SELECT id, name, is_published, display_on_homepage FROM hospitals;
