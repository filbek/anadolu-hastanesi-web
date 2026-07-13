-- ============================================================
-- Anadolu Hastaneleri Grubu - Sosyal Sorumluluk Projeleri
-- Koruyucu sağlık ve sağlığın geliştirilmesine yönelik
-- etkinliklerin şube bazında yönetildiği tablo.
-- hospital_id NULL ise etkinlik tüm şubeler için geçerlidir.
-- Idempotent. Supabase SQL Editor'a yapıştırıp Run.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.social_responsibility_activities (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  image TEXT,
  event_date DATE,
  hospital_id BIGINT REFERENCES public.hospitals(id) ON DELETE CASCADE,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_csr_activities_active
  ON public.social_responsibility_activities(is_active);
CREATE INDEX IF NOT EXISTS idx_csr_activities_hospital
  ON public.social_responsibility_activities(hospital_id);
CREATE INDEX IF NOT EXISTS idx_csr_activities_order
  ON public.social_responsibility_activities(display_order);

ALTER TABLE public.social_responsibility_activities ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read" ON public.social_responsibility_activities;
CREATE POLICY "Allow public read" ON public.social_responsibility_activities
  FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Allow admin all" ON public.social_responsibility_activities;
CREATE POLICY "Allow admin all" ON public.social_responsibility_activities
  FOR ALL USING (true)
  WITH CHECK (true);
