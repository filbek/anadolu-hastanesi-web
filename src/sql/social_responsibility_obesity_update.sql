-- ============================================================
-- Sosyal Sorumluluk - "Obeziteyi Tanıyalım" paylaşımı mevzuat düzenlemesi
--
-- 1) Paylaşım metninden tanıtım içerikli kısımlar çıkarıldı:
--    randevu/telefon çağrısı, e-randevu linki, slogan ve Instagram linki.
--    Ele alınan konular listelendi; görsel rızası notu eklendi.
-- 2) Faaliyet raporu (PDF) bağlandı.
--
-- report_url sütunu social_responsibility_report_migration.sql ile de eklenir;
-- burada da IF NOT EXISTS ile eklenir ki sıra fark etmesin.
-- Idempotent. Supabase SQL Editor'a yapıştırıp Run.
-- ============================================================

ALTER TABLE public.social_responsibility_activities
  ADD COLUMN IF NOT EXISTS report_url TEXT;

NOTIFY pgrst, 'reload schema';

UPDATE public.social_responsibility_activities
SET description = E'Obezite hakkında doğru bilinen yanlışlara birlikte ışık tutuyoruz.\n\nSilivri Anadolu Hastanesi olarak, Obezite Sosyal Sorumluluk Projemiz kapsamında toplumda obezite konusunda farkındalık oluşturmayı ve doğru bilgilere ulaşılmasını desteklemeyi amaçlıyoruz.\n\nBeslenme ve Diyet Uzmanımız Dyt. Benan Koç ile gerçekleştirdiğimiz bilgilendirme çalışmasında şu konuları ele aldık:\n• Obezite nedir?\n• Obezitenin sağlık üzerindeki etkileri\n• Sağlıklı ve dengeli beslenme\n• Beslenmede doğru bilinen yanlışlar\n• Sürdürülebilir kilo yönetimi\n\nSağlıklı yaşam, doğru bilgiyle başlar.\n\nGörseller, katılımcıların açık rızası alınarak yayımlanmıştır.',
    report_url = '/uploads/sosyal-sorumluluk/obeziteyi-taniyalim-faaliyet-raporu-2026.pdf',
    updated_at = now()
WHERE title = 'Obeziteyi Tanıyalım';

-- KONTROL: 1 satır, report_url dolu olmalı
SELECT id, title, report_url, left(description, 60) AS description_start
FROM public.social_responsibility_activities
WHERE title = 'Obeziteyi Tanıyalım';
