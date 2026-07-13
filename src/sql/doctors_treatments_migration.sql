-- ============================================================
-- Anadolu Hastaneleri Grubu - Doktor "Uygulanan Tedaviler" kolonu
-- Admin panelindeki doktor formundan girilen tedavi listesi için.
-- Idempotent. Çalıştırma: Supabase SQL Editor'a yapıştırıp Run.
-- ============================================================

ALTER TABLE public.doctors ADD COLUMN IF NOT EXISTS treatments TEXT[] DEFAULT '{}'::text[];
