-- ============================================================
-- Anadolu Hastaneleri Grubu - Hastane ↔ Bölüm eşlemesi
-- Bölümlerimiz sayfasındaki şube sekmelerinde, o şubede sunulan
-- bölümlerin dinamik gösterimi için kullanılır.
--
-- Görünürlük mantığı (hibrit):
--   Bir şube sekmesinde gösterilen bölümler =
--     (o şubede aktif doktoru olan bölümler)  ∪  (department_ids)
--
-- department_ids: doktor kaydı olmasa da o şubede "her zaman göster"
--   denmek istenen bölümlerin id listesi (ör. Radyoloji, Laboratuvar,
--   Acil gibi genelde doktor kaydı girilmeyen tanı/hizmet birimleri).
--
-- Idempotent. Çalıştırma: Supabase SQL Editor'a yapıştırıp Run.
-- ============================================================

ALTER TABLE public.hospitals
  ADD COLUMN IF NOT EXISTS department_ids INTEGER[] DEFAULT '{}'::integer[];
