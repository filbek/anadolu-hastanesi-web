-- ============================================================
-- Anadolu Hastaneleri Grubu - HBYS randevu ID eşlemesi
--
-- Amaç: Sitedeki "Online Randevu" butonlarının kendineiyibak.app
-- randevu sisteminde doğrudan ilgili şube/bölüm/doktorun takvimini
-- açması. Hedef link formatı:
--
--   https://anadoluhastaneleri.kendineiyibak.app/?type=clinic
--     &facilityId=<hastane GUID>
--     &departmentId=<HBYS bölüm kodu>
--     &physicianId=<HBYS doktor kodu>
--
-- ÖNEMLİ: Bölüm ve doktor kodları HBYS'de ŞUBE BAZINDA değişir.
--   - Doktor kaydı zaten şube bazlıdır (doctors.hospital_id),
--     bu yüzden physicianId doğrudan doctors tablosunda tutulur.
--   - Bölümler ise şubeler arası ortak kayıttır; bu yüzden bölüm
--     kodu ayrı bir eşleme tablosunda (hospital_id, department_id)
--     ikilisiyle tutulur.
--
-- ID'ler metin (TEXT) olarak tutulur: facilityId bir GUID, bölüm/
-- doktor kodları sayısal görünse de HBYS tarafında baştaki sıfır
-- veya alfanumerik kod ihtimaline karşı string saklanır.
--
-- Idempotent. Çalıştırma: Supabase SQL Editor'a yapıştırıp Run.
-- ============================================================

-- 1) Hastane: randevu sistemindeki tesis (facility) GUID'i
ALTER TABLE public.hospitals
  ADD COLUMN IF NOT EXISTS hbys_facility_id TEXT;

COMMENT ON COLUMN public.hospitals.hbys_facility_id IS
  'kendineiyibak.app randevu linkindeki facilityId (GUID). Boşsa o şube için derin link kurulmaz.';

-- 2) Doktor: randevu sistemindeki physicianId
ALTER TABLE public.doctors
  ADD COLUMN IF NOT EXISTS hbys_physician_id TEXT;

COMMENT ON COLUMN public.doctors.hbys_physician_id IS
  'kendineiyibak.app randevu linkindeki physicianId. Doktor kaydı şube bazlı olduğu için doğrudan burada tutulur.';

-- 3) Bölüm kodu: şube + bölüm ikilisine bağlı
CREATE TABLE IF NOT EXISTS public.hospital_department_hbys (
  hospital_id INTEGER NOT NULL REFERENCES public.hospitals(id) ON DELETE CASCADE,
  department_id INTEGER NOT NULL REFERENCES public.departments(id) ON DELETE CASCADE,
  hbys_department_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (hospital_id, department_id)
);

COMMENT ON TABLE public.hospital_department_hbys IS
  'Bölümlerin HBYS/randevu sistemindeki departmentId karşılıkları. Kod şubeden şubeye değiştiği için eşleme (hastane, bölüm) ikilisi üzerinden tutulur.';

CREATE INDEX IF NOT EXISTS idx_hospital_department_hbys_department
  ON public.hospital_department_hbys(department_id);

-- RLS: link kurmak için herkes okuyabilmeli, yazma admin tarafında
ALTER TABLE public.hospital_department_hbys ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read" ON public.hospital_department_hbys;
CREATE POLICY "Allow public read" ON public.hospital_department_hbys
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow admin all" ON public.hospital_department_hbys;
CREATE POLICY "Allow admin all" ON public.hospital_department_hbys
  FOR ALL USING (true)
  WITH CHECK (true);

-- PostgREST şema cache'ini tazele; aksi halde yeni kolon/tablo için
-- "Could not find the column ... in the schema cache" hatası alınır.
NOTIFY pgrst, 'reload schema';
