-- ============================================================
-- Anadolu Hastaneleri Grubu - Anlaşmalı Kurumlar
-- Şube (hastane) bazlı, kategori bazlı anlaşmalı kurum listesi.
-- Admin panelinden yönetilir; sık güncellenir.
--
-- Her satır bir hastanenin bir kategorisidir; kurum adları `items`
-- dizisinde tutulur.
--
-- Idempotent. Çalıştırma: Supabase SQL Editor'a yapıştırıp Run.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.contracted_institutions (
  id SERIAL PRIMARY KEY,
  hospital_id INTEGER NOT NULL REFERENCES public.hospitals(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  items TEXT[] NOT NULL DEFAULT '{}'::text[],
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_contracted_institutions_hospital
  ON public.contracted_institutions(hospital_id);
CREATE INDEX IF NOT EXISTS idx_contracted_institutions_active
  ON public.contracted_institutions(is_active);
CREATE INDEX IF NOT EXISTS idx_contracted_institutions_order
  ON public.contracted_institutions(display_order);

-- RLS: herkes yayında olanları okuyabilir, admin her şeyi yönetir
ALTER TABLE public.contracted_institutions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read" ON public.contracted_institutions;
CREATE POLICY "Allow public read" ON public.contracted_institutions
  FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Allow admin all" ON public.contracted_institutions;
CREATE POLICY "Allow admin all" ON public.contracted_institutions
  FOR ALL USING (true)
  WITH CHECK (true);
