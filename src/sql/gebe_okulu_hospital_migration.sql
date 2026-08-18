-- ============================================================
-- Anadolu Hastaneleri Grubu - Gebe Okulu Paylaşımları / Şube
-- Gebe Okulu seminerlerinin şube (hastane) bazında yönetilmesi.
-- hospital_id NULL ise paylaşım tüm şubeler için geçerlidir ve
-- sitedeki her şube filtresinde görünür.
-- Idempotent. Supabase SQL Editor'a yapıştırıp Run.
-- ============================================================

ALTER TABLE public.gebe_okulu_seminars
  ADD COLUMN IF NOT EXISTS hospital_id BIGINT
  REFERENCES public.hospitals(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_gebe_okulu_seminars_hospital
  ON public.gebe_okulu_seminars(hospital_id);
