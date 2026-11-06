-- ============================================================
-- Sosyal Sorumluluk Projeleri - Faaliyet Raporu (PDF)
--
-- 1) Etkinliklere Sağlık Bakanlığı'na sunulan faaliyet raporunun
--    (PDF) bağlantısı için report_url sütunu. Sitede etkinlik kartında
--    "Faaliyet Raporu (PDF)" butonu olarak gösterilir.
--    Yönetim: Admin > Sosyal Sorumluluk > (etkinlik) > "Faaliyet Raporu".
-- 2) Silivri Belediyesi Sünnet Şöleni (2021-2026) etkinlik kaydı.
--    Görseller ve rapor sitenin /uploads/sosyal-sorumluluk/ klasöründedir.
--
-- Idempotent. Supabase SQL Editor'a yapıştırıp Run.
-- ============================================================

ALTER TABLE public.social_responsibility_activities
  ADD COLUMN IF NOT EXISTS report_url TEXT;

NOTIFY pgrst, 'reload schema';

INSERT INTO public.social_responsibility_activities
  (title, description, image, gallery_images, report_url, event_date, hospital_id, is_active, display_order)
SELECT
  'Silivri Belediyesi Sünnet Şöleni',
  E'Silivri Anadolu Hastanesi olarak, T.C. Silivri Belediyesi ile birlikte her yıl düzenlenen Sünnet Şöleni''ne 2021 yılından bu yana sağlık desteği veriyoruz.\n\nSosyal sorumluluk projemiz kapsamında; çocuklarımızın işlem öncesi sağlık kontrolleri ve sünnet işlemleri hastanemiz sağlık ekibi tarafından gerçekleştirildi, şölen boyunca da sağlık ekibimiz hazır bulundu.\n\n2026 yılında 35 çocuğumuz bu programdan yararlandı. Proje kapsamında bugüne kadar toplam 285 çocuğumuza ulaştık:\n• 2021: 52 çocuk\n• 2022: 75 çocuk\n• 2023: 55 çocuk\n• 2024: 42 çocuk\n• 2025: 26 çocuk\n• 2026: 35 çocuk\n\n25 Ağustos 2026 tarihinde düzenlenen şölende, katkılarından dolayı Başhekimimiz Dr. Öğr. Üyesi Halil Narlı''ya Silivri Belediyesi tarafından teşekkür plaketi takdim edildi.\n\nİş birliği için T.C. Silivri Belediyesi''ne teşekkür eder, çocuklarımıza sağlıklı ve mutlu bir ömür dileriz.\n\nGörseller, velilerin açık rızası alınarak yayımlanmıştır.',
  '/uploads/sosyal-sorumluluk/silivri-sunnet-soleni-2026-1.jpg',
  ARRAY[
    '/uploads/sosyal-sorumluluk/silivri-sunnet-soleni-2026-2.jpg',
    '/uploads/sosyal-sorumluluk/silivri-sunnet-soleni-2026-3.jpg',
    '/uploads/sosyal-sorumluluk/silivri-sunnet-soleni-2026-4.jpg',
    '/uploads/sosyal-sorumluluk/silivri-sunnet-soleni-2026-5.jpg'
  ],
  '/uploads/sosyal-sorumluluk/silivri-sunnet-soleni-faaliyet-raporu-2026.pdf',
  DATE '2026-08-25',
  (SELECT id FROM public.hospitals WHERE slug = 'ozel-silivri-anadolu-hastanesi'),
  true,
  (SELECT COALESCE(MAX(display_order), 0) + 1 FROM public.social_responsibility_activities)
WHERE NOT EXISTS (
  SELECT 1 FROM public.social_responsibility_activities
  WHERE title = 'Silivri Belediyesi Sünnet Şöleni' AND event_date = DATE '2026-08-25'
);

-- KONTROL: kayıt listelenmeli
SELECT id, title, event_date, hospital_id, report_url
FROM public.social_responsibility_activities
WHERE title = 'Silivri Belediyesi Sünnet Şöleni';
