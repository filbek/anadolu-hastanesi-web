-- Yönetim Ekibi tablosu
CREATE TABLE IF NOT EXISTS management_team (
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
CREATE INDEX IF NOT EXISTS idx_management_team_role ON management_team(role);
CREATE INDEX IF NOT EXISTS idx_management_team_is_active ON management_team(is_active);
CREATE INDEX IF NOT EXISTS idx_management_team_display_order ON management_team(display_order);
CREATE INDEX IF NOT EXISTS idx_management_team_doctor_id ON management_team(doctor_id);

-- RLS politikaları (eğer RLS aktifse admin kullanıcılarına izin ver)
ALTER TABLE management_team ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read" ON management_team
  FOR SELECT USING (is_active = true);

CREATE POLICY "Allow admin all" ON management_team
  FOR ALL USING (true)
  WITH CHECK (true);
