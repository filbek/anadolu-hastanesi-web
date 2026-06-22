CREATE TABLE IF NOT EXISTS public.hospital_galleries (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    hospital_id uuid NOT NULL,
    image_url text NOT NULL,
    display_order integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now()
);

-- RLS policies
ALTER TABLE public.hospital_galleries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to hospital_galleries"
ON public.hospital_galleries
FOR SELECT
USING (true);

-- Allow authenticated users to manage hospital_galleries
CREATE POLICY "Allow authenticated full access to hospital_galleries"
ON public.hospital_galleries
FOR ALL
USING (auth.role() = 'authenticated');

-- ============================================================
-- YÖNETİM EKİBİ TABLOSU (Management Team)
-- ============================================================
-- Hastane yönetim sayfası için yönetim ekibi üyeleri tablosu

CREATE TABLE IF NOT EXISTS public.management_team (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  title TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('board', 'chief_physician', 'assistant_chief', 'health_care_manager', 'it_unit', 'general_manager_deputy', 'financial_affairs_manager', 'hospitality_services_manager', 'quality_management_manager', 'administrative')),
  department TEXT,
  doctor_id INTEGER REFERENCES doctors(id) ON DELETE SET NULL,
  image TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexler
CREATE INDEX IF NOT EXISTS idx_management_team_role ON public.management_team(role);
CREATE INDEX IF NOT EXISTS idx_management_team_is_active ON public.management_team(is_active);
CREATE INDEX IF NOT EXISTS idx_management_team_display_order ON public.management_team(display_order);
CREATE INDEX IF NOT EXISTS idx_management_team_doctor_id ON public.management_team(doctor_id);

-- RLS politikaları
ALTER TABLE public.management_team ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read" ON public.management_team
  FOR SELECT USING (is_active = true);

CREATE POLICY "Allow admin all" ON public.management_team
  FOR ALL USING (true)
  WITH CHECK (true);

-- ============================================================
-- İKİNCİ GÖRÜŞ FORM TABLOSU
-- ============================================================

CREATE TABLE IF NOT EXISTS public.second_opinion_submissions (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  hospital TEXT,
  message TEXT NOT NULL,
  file_url TEXT,
  consent BOOLEAN DEFAULT true,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_second_opinion_is_read ON public.second_opinion_submissions(is_read);
CREATE INDEX IF NOT EXISTS idx_second_opinion_created_at ON public.second_opinion_submissions(created_at DESC);

ALTER TABLE public.second_opinion_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow admin all on second_opinion" ON public.second_opinion_submissions
  FOR ALL USING (true)
  WITH CHECK (true);

-- site_settings tablosuna second_opinion_email kolonu ekle
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS second_opinion_email TEXT DEFAULT 'info@anadoluhastaneleri.com';
