-- ============================================================
-- Anadolu Hastaneleri Grubu - Doktor Çalışma Saatleri Kolonu
-- Doktorlara özel çalışma saatleri tanımlamak için (ör. Özkan SEVER Cumartesi 12:00'ye kadar)
-- Çalıştırma: Supabase SQL Editor'a yapıştırıp Run butonuna basın.
-- ============================================================

ALTER TABLE public.doctors ADD COLUMN IF NOT EXISTS working_hours TEXT;
