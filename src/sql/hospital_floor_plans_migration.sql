-- ============================================================
-- Hastane İçi Rehber - Kat Planları (kat / birim listesi)
--
-- Her hastaneye, rehber sayfasında gösterilecek kat kartlarını tutan JSONB
-- sütun eklenir. Görsel yoktur; kart = kat başlığı + o kattaki birimler.
-- Yönetim: Admin > Hastaneler > (hastane) > "Kat Planları" bölümü.
--
-- Yapı: [{ "floor": "3", "title": "3. Kat", "description": "Birim 1 (satır sonu) Birim 2" }]
--   description: her satır bir birim. Dizi sırası ekranda görünen sıradır.
--
-- Idempotent: birden fazla kez çalıştırılabilir. Tohum veri yalnızca sütun
-- boşsa yazılır, panelden yapılan düzenlemeleri ezmez.
-- Çalıştırma: Supabase SQL Editor'a yapıştırıp Run.
-- ============================================================

ALTER TABLE public.hospitals
  ADD COLUMN IF NOT EXISTS floor_plans JSONB NOT NULL DEFAULT '[]'::jsonb;

-- Silivri (hospitals.id = 4): kat tabelalarındaki birimler
UPDATE public.hospitals
SET floor_plans = '[{"floor": "5", "title": "5. Kat", "description": "Koroner Yoğun Bakım\nKardiyoloji Servisi (5002-5013)\nHemşirelik Hizmetleri"}, {"floor": "4", "title": "4. Kat", "description": "Doğumhane\nBebek Odası\nBebek Ses İşitme Odası\nNST\nKadın Doğum ve Çocuk Servisi (4002-4013)\nKadın Doğum ve Çocuk Servisi (4017-4026)\nHemşirelik Hizmetleri"}, {"floor": "3", "title": "3. Kat", "description": "İç Hastalıkları Servisi (3002-3013)\nİç Hastalıkları Servisi (3017-3026)\nMedikal Onkoloji\nHemşirelik Hizmetleri"}, {"floor": "2", "title": "2. Kat", "description": "Cerrahi Servis (2002-2013)\nCerrahi Servis (2017-2026)\nİç Hastalıkları ve Gastroenteroloji\nKan Transfüzyon Odası\nHemşirelik Hizmetleri"}, {"floor": "1", "title": "1. Kat", "description": "Göz Sağlığı ve Hastalıkları\nÇocuk Sağlığı ve Hastalıkları\nKadın Hastalıkları ve Doğum\nİç Hastalıkları\nPlastik ve Rekonstrüktif Cerrahi"}, {"floor": "Zemin", "title": "Zemin Kat", "description": "Başhekim\nNöroloji\nİç Hastalıkları\nÜroloji\nOdyometri\nKardiyoloji\nKalp ve Damar Cerrahisi\nGöğüs Hastalıkları\nBeslenme ve Diyet\nEfor Odası\nPsikiyatri\nHasta Hakları Birimi\nGastroenteroloji - Endoskopi (2. Kat)\nKafeterya\nCildiye Polikliniği"}, {"floor": "-1", "title": "-1. Kat", "description": "Acil Servis\nRöntgen\nAmeliyathaneler\nSterilizasyon\nAnjio\nKVC Yoğun Bakım\nGenel Yoğun Bakım\nOrtopedi ve Travmatoloji\nYenidoğan Yoğun Bakım\nBiyokimya Laboratuvarı\nMikrobiyoloji Laboratuvarı\nKan Alma\nLaboratuvar\nHasta Hakları Birimi"}, {"floor": "-2", "title": "-2. Kat", "description": "Biyomedikal Birimi\nTeknik Servis\nManyetik Rezonans (MR)\nBilgisayarlı Tomografi (BT)\nMamografi\nKemik Dansitometri\nAlgoloji (Ağrı) Polikliniği\nSatın Alma\nİbadethaneler (Bay / Bayan)\nMorg"}]'::jsonb
WHERE id = 4
  AND (floor_plans IS NULL OR floor_plans = '[]'::jsonb);

NOTIFY pgrst, 'reload schema';

-- KONTROL: Silivri için 8 kat görünmeli
SELECT id, name, jsonb_array_length(floor_plans) AS kat_sayisi FROM public.hospitals ORDER BY id;
