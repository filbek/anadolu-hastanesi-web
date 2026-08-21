-- ============================================================
-- Yönetim Kadrosu — Hastane (şube) bazında ayrıştırma
-- ------------------------------------------------------------
-- "Yönetim Kadromuz" sayfasında Silivri ve Avcılar yönetimleri
-- bir arada görünüyordu. Artık her üye bağlı olduğu hastanenin
-- sekmesinde listeleniyor; hospital_id NULL olan üyeler ise
-- "Grup Yönetimi" (genel merkez) sekmesinde gösteriliyor.
--
-- Bu migration mevcut kayıtları doğru hastaneye bağlar.
-- Hastane atamaları daha sonra Admin > Yönetim Ekibi ekranından
-- her üye için değiştirilebilir.
-- ============================================================

-- hospital_id kolonu quality_management_hospital_migration.sql ile
-- eklenmişti; burada yoksa güvenli biçimde ekliyoruz.
ALTER TABLE public.management_team
  ADD COLUMN IF NOT EXISTS hospital_id BIGINT REFERENCES public.hospitals(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_management_team_hospital
  ON public.management_team(hospital_id);

-- ── Yardımcı: hastane id'leri ────────────────────────────────
-- Silivri  -> Özel Silivri Anadolu Hastanesi
-- Avcılar  -> Özel Avcılar Anadolu Hastanesi

-- 1) Bağlı doktor kaydı olan üyeler doktorun hastanesine bağlanır.
UPDATE public.management_team mt
SET hospital_id = d.hospital_id
FROM public.doctors d
WHERE mt.doctor_id = d.id
  AND d.hospital_id IS NOT NULL
  AND mt.hospital_id IS DISTINCT FROM d.hospital_id;

-- 2) Doktor kaydına bağlı olmayan tıbbi/idari üyeler isimden eşlenir.
--    (Avcılar başhekimlik kadrosu)
UPDATE public.management_team
SET hospital_id = (SELECT id FROM public.hospitals WHERE name ILIKE '%Avcılar%' ORDER BY id LIMIT 1)
WHERE hospital_id IS NULL
  AND (
    name ILIKE '%Hasan Akbulut%'
    OR name ILIKE '%Mehmet Köroğlu%'
    OR name ILIKE '%Fahriye Aylin Güzey%'
  );

-- 3) Kalan tıbbi ve idari kadro Silivri hastanesine bağlanır.
--    'board' (Üst Yönetim / Başkan Vekili) rolü grup geneli olduğu için
--    bilinçli olarak hariç tutulur; NULL kalır ve "Grup Yönetimi"
--    sekmesinde görünür.
UPDATE public.management_team
SET hospital_id = (SELECT id FROM public.hospitals WHERE name ILIKE '%Silivri%' ORDER BY id LIMIT 1)
WHERE hospital_id IS NULL
  AND role <> 'board';

-- PostgREST şema cache'ini tazele
NOTIFY pgrst, 'reload schema';
