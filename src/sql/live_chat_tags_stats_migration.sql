-- ============================================================
-- Anadolu Hastaneleri Grubu - Canlı Destek: Etiketleme + İstatistik
--
-- Bu dosya live_chat_migration.sql'den SONRA çalıştırılmalıdır.
--
-- 1) Ziyaretçi mesajları içeriğe göre otomatik etiketlenir
--    (Checkup, Obezite, İkinci Görüş, Randevu, Şikâyet ...).
--    Etiket kuralları admin panelinden yönetilir, kod değişikliği gerekmez.
-- 2) Operatör panosu için toplu istatistik RPC'si.
--
-- Idempotent: birden fazla kez çalıştırılabilir.
-- ============================================================

-- ============================================================
-- 1) TÜRKÇE METİN NORMALLEŞTİRME
--
-- "İkinci Görüş", "ikinci gorus", "IKINCI GÖRÜŞ" hepsi eşleşmeli.
-- Postgres'in lower()'ı Türkçe İ/I çiftinde güvenilir olmadığı için
-- önce aksanlar ASCII'ye çevrilir, sonra küçük harfe inilir.
-- ============================================================

CREATE OR REPLACE FUNCTION public.chat_normalize(p_text TEXT)
RETURNS TEXT
LANGUAGE sql
IMMUTABLE
PARALLEL SAFE
AS $$
  SELECT lower(translate(
    COALESCE(p_text, ''),
    'ÇĞİIÖŞÜÂÎÛçğıöşüâîû',
    'CGIIOSUAIUcgiosuaiu'
  ));
$$;

-- ============================================================
-- 2) ETİKET KURALLARI
-- ============================================================

CREATE TABLE IF NOT EXISTS public.chat_tags (
  id SERIAL PRIMARY KEY,
  -- Panelde ve görüşme kartında görünen ad. Etiket kimliği budur.
  name TEXT NOT NULL UNIQUE,
  -- Rozet rengi (tailwind değil, ham hex — panelde seçilir)
  color TEXT NOT NULL DEFAULT '#0A6B7D',
  -- Bu kelimelerden herhangi biri mesajda geçerse etiket atanır.
  -- Normalleştirme otomatik yapılır; "Görüş" yazmanız yeterli.
  keywords TEXT[] NOT NULL DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Görüşmeye atanmış etiketler. Otomatik atananlar + operatörün elle
-- ekledikleri aynı dizide tutulur.
ALTER TABLE public.chat_conversations
  ADD COLUMN IF NOT EXISTS tags TEXT[] NOT NULL DEFAULT '{}';

CREATE INDEX IF NOT EXISTS idx_chat_conversations_tags
  ON public.chat_conversations USING GIN (tags);

ALTER TABLE public.chat_tags ENABLE ROW LEVEL SECURITY;

-- Etiketler ziyaretçiye hiç gösterilmez; yalnızca admin erişir.
DROP POLICY IF EXISTS "Admins manage chat tags" ON public.chat_tags;
CREATE POLICY "Admins manage chat tags" ON public.chat_tags
  FOR ALL TO authenticated
  USING (public.chat_is_admin())
  WITH CHECK (public.chat_is_admin());

REVOKE ALL ON public.chat_tags FROM anon;

-- ============================================================
-- 3) BAŞLANGIÇ ETİKETLERİ
--
-- Hastane grubunun gerçek hizmet başlıklarına göre seçildi.
-- Panelden serbestçe düzenlenebilir/silinebilir.
--
-- RENK SEÇİMİ HAKKINDA
-- Renkler rastgele değil; ayırt edilebilirlik doğrulayıcısından geçirildi.
-- Bir palette en fazla ~8 renk gerçekten birbirinden ayrılabilir, fazlası
-- renk körlüğünde (ve çoğu zaman normal görüşte de) birbirine karışır.
-- Bu yüzden:
--   * 6 renk konu kimliğini taşır (Randevu, İkinci Görüş, Checkup,
--     Obezite, Fiyat, Sağlık Turizmi),
--   * 2 renk "dikkat" durumuna ayrıldı (Acil = kırmızı, Şikâyet = turuncu),
--   * kalan 4 etiket bilinçli olarak nötr gri kullanır — bunlarda kimliği
--     rozetin YAZISI taşır, rengi değil.
-- İlk denemede Acil (#B91C1C) ile Şikâyet (#E30613) tam renk görüşte bile
-- ayırt edilemiyordu (ΔE 8.4); en kritik iki etiket olduğu için ayrıldılar.
-- Renk değiştirecekseniz bu dengeyi bozmamaya dikkat edin.
-- ============================================================

INSERT INTO public.chat_tags (name, color, keywords, display_order) VALUES
  ('Randevu',           '#1F5FBF', ARRAY['randevu','muayene ayarla','gun alabilir','saat alabilir','randevu almak'], 10),
  ('İkinci Görüş',      '#0F97AE', ARRAY['ikinci gorus','second opinion','baska doktor gorusu','film yorumu','rapor degerlendir'], 20),
  ('Checkup',           '#2D8A5E', ARRAY['checkup','check up','check-up','genel tarama','kontrol paketi','tarama paketi'], 30),
  ('Obezite',           '#A5711A', ARRAY['obezite','tup mide','mide ameliyati','bariatrik','kilo verme','sleeve','gastrik','zayiflama'], 40),
  ('Fiyat & Ödeme',     '#7C3AED', ARRAY['fiyat','ucret','ne kadar','tutar','taksit','odeme','indirim','kac para'], 50),
  ('Sağlık Turizmi',    '#DB2777', ARRAY['saglik turizmi','international','yurtdisi','foreign patient','translator','tercuman'], 60),
  -- Dikkat gerektiren iki durum — kasıtlı olarak birbirinden uzak iki ton
  ('Acil',              '#DC2626', ARRAY['acil','ambulans','112','acil servis','hemen'], 70),
  ('Şikâyet',           '#EA580C', ARRAY['sikayet','memnun degil','kotu muamele','ilgilenmedi','rezalet','sikayetim var','magdur'], 80),
  -- Kimliği yazısıyla taşıyan ikincil konular (nötr)
  ('Anlaşmalı Kurum',   '#64748B', ARRAY['sgk','anlasmali','ozel sigorta','sigortam','tamamlayici','provizyon'], 90),
  ('Tetkik & Sonuç',    '#64748B', ARRAY['sonuc','tahlil','kan tahlili','mr','tomografi','rontgen','ultrason','biyopsi','e-sonuc'], 100),
  ('Gebe Okulu',        '#64748B', ARRAY['gebe','hamile','dogum','gebelik','lohusa','gebe okulu'], 110),
  ('Doktor Sorgu',      '#64748B', ARRAY['hangi doktor','doktor var mi','uzman var mi','hekim','profesor','doc dr'], 120)
ON CONFLICT (name) DO NOTHING;

-- ============================================================
-- 4) OTOMATİK ETİKETLEME TETİKLEYİCİSİ
--
-- Yalnızca ziyaretçi mesajlarında çalışır — operatörün yazdığı metin
-- görüşmenin konusunu belirlemez.
-- ============================================================

CREATE OR REPLACE FUNCTION public.chat_autotag()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  norm TEXT;
  matched TEXT[];
BEGIN
  IF NEW.sender_role <> 'visitor' THEN
    RETURN NEW;
  END IF;

  norm := public.chat_normalize(NEW.content);

  SELECT array_agg(DISTINCT t.name)
  INTO matched
  FROM public.chat_tags t
  WHERE t.is_active
    AND EXISTS (
      SELECT 1
      FROM unnest(t.keywords) AS kw
      WHERE btrim(public.chat_normalize(kw)) <> ''
        AND position(public.chat_normalize(kw) IN norm) > 0
    );

  IF matched IS NULL THEN
    RETURN NEW;
  END IF;

  -- Var olan etiketlerle birleştir; operatörün elle eklediklerini silme
  UPDATE public.chat_conversations c
  SET tags = ARRAY(
    SELECT DISTINCT x
    FROM unnest(COALESCE(c.tags, '{}'::TEXT[]) || matched) AS x
    ORDER BY x
  )
  WHERE c.id = NEW.conversation_id;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_chat_autotag ON public.chat_messages;
CREATE TRIGGER trg_chat_autotag
  AFTER INSERT ON public.chat_messages
  FOR EACH ROW
  EXECUTE FUNCTION public.chat_autotag();

-- ============================================================
-- 5) GEÇMİŞ GÖRÜŞMELERİ ETİKETLE
--
-- Trigger yalnızca yeni mesajlarda çalıştığı için, migration'dan önceki
-- görüşmeler bir kez toplu olarak etiketlenir.
-- ============================================================

WITH conv_text AS (
  -- Görüşmedeki tüm ziyaretçi mesajlarını tek metne indir
  SELECT conversation_id,
         public.chat_normalize(string_agg(content, ' ')) AS norm
  FROM public.chat_messages
  WHERE sender_role = 'visitor'
  GROUP BY conversation_id
),
conv_tags AS (
  SELECT ct.conversation_id, ARRAY(
    SELECT DISTINCT t.name
    FROM public.chat_tags t
    WHERE t.is_active
      AND EXISTS (
        SELECT 1 FROM unnest(t.keywords) AS kw
        WHERE btrim(public.chat_normalize(kw)) <> ''
          AND position(public.chat_normalize(kw) IN ct.norm) > 0
      )
    ORDER BY t.name
  ) AS tags
  FROM conv_text ct
)
UPDATE public.chat_conversations c
SET tags = conv_tags.tags
FROM conv_tags
WHERE c.id = conv_tags.conversation_id
  AND c.tags = '{}';

-- ============================================================
-- 6) İSTATİSTİK RPC'Sİ
--
-- Panoyu tek çağrıda beslemek için hepsi tek JSONB olarak döner.
-- Yalnızca admin çağırabilir.
-- ============================================================

CREATE OR REPLACE FUNCTION public.chat_stats(p_days INTEGER DEFAULT 30)
RETURNS JSONB
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  since TIMESTAMPTZ;
  result JSONB;
BEGIN
  IF NOT public.chat_is_admin() THEN
    RAISE EXCEPTION 'Yetkisiz.' USING ERRCODE = '42501';
  END IF;

  -- 1-365 gün arasına sıkıştır
  since := now() - (LEAST(GREATEST(COALESCE(p_days, 30), 1), 365) || ' days')::INTERVAL;

  WITH conv AS (
    SELECT * FROM public.chat_conversations WHERE created_at >= since
  ),
  -- Operatörün ilk yanıtına kadar geçen süre (saniye)
  first_response AS (
    SELECT
      c.id,
      EXTRACT(EPOCH FROM (MIN(m.created_at) - c.created_at)) AS seconds
    FROM conv c
    JOIN public.chat_messages m
      ON m.conversation_id = c.id AND m.sender_role = 'agent'
    GROUP BY c.id, c.created_at
  ),
  msg AS (
    SELECT m.* FROM public.chat_messages m
    JOIN conv c ON c.id = m.conversation_id
  )
  SELECT jsonb_build_object(
    'period_days', LEAST(GREATEST(COALESCE(p_days, 30), 1), 365),

    'totals', jsonb_build_object(
      'conversations', (SELECT count(*) FROM conv),
      'open',          (SELECT count(*) FROM conv WHERE status = 'open'),
      'active',        (SELECT count(*) FROM conv WHERE status = 'active'),
      'closed',        (SELECT count(*) FROM conv WHERE status = 'closed'),
      'messages',      (SELECT count(*) FROM msg WHERE sender_role <> 'system'),
      -- Operatörün hiç yanıtlamadığı, kapanmamış görüşmeler
      'unanswered',    (SELECT count(*) FROM conv c
                        WHERE c.status <> 'closed'
                          AND NOT EXISTS (
                            SELECT 1 FROM public.chat_messages m
                            WHERE m.conversation_id = c.id AND m.sender_role = 'agent'
                          )),
      'with_phone',    (SELECT count(*) FROM conv WHERE visitor_phone IS NOT NULL)
    ),

    'response', jsonb_build_object(
      'answered',           (SELECT count(*) FROM first_response),
      'avg_first_seconds',  (SELECT COALESCE(round(avg(seconds)), 0) FROM first_response),
      'median_first_seconds',(SELECT COALESCE(round(
                                percentile_cont(0.5) WITHIN GROUP (ORDER BY seconds)
                              ), 0) FROM first_response),
      'avg_messages_per_conversation', (
        SELECT COALESCE(round(count(*)::NUMERIC / NULLIF((SELECT count(*) FROM conv), 0), 1), 0)
        FROM msg WHERE sender_role <> 'system'
      )
    ),

    -- Günlük görüşme adedi (grafik için, eskiden yeniye)
    'daily', COALESCE((
      SELECT jsonb_agg(jsonb_build_object('date', d, 'count', n) ORDER BY d)
      FROM (
        SELECT (created_at AT TIME ZONE 'Europe/Istanbul')::DATE AS d, count(*) AS n
        FROM conv GROUP BY 1
      ) x
    ), '[]'::JSONB),

    -- Saat dağılımı: hangi saatlerde yoğunuz (0-23, Istanbul)
    'hourly', COALESCE((
      SELECT jsonb_agg(jsonb_build_object('hour', h, 'count', n) ORDER BY h)
      FROM (
        SELECT EXTRACT(HOUR FROM created_at AT TIME ZONE 'Europe/Istanbul')::INT AS h,
               count(*) AS n
        FROM conv GROUP BY 1
      ) x
    ), '[]'::JSONB),

    -- Etiket dağılımı: hangi konular geliyor
    'tags', COALESCE((
      SELECT jsonb_agg(jsonb_build_object('tag', tag, 'count', n) ORDER BY n DESC)
      FROM (
        SELECT unnest(tags) AS tag, count(*) AS n
        FROM conv GROUP BY 1
      ) x
    ), '[]'::JSONB),

    -- Operatör performansı
    'agents', COALESCE((
      SELECT jsonb_agg(jsonb_build_object('name', name, 'messages', n) ORDER BY n DESC)
      FROM (
        SELECT COALESCE(sender_name, 'Bilinmiyor') AS name, count(*) AS n
        FROM msg WHERE sender_role = 'agent' GROUP BY 1
      ) x
    ), '[]'::JSONB)
  ) INTO result;

  RETURN result;
END;
$$;

GRANT EXECUTE ON FUNCTION public.chat_stats(INTEGER) TO authenticated;

-- ============================================================
-- KONTROL
-- ============================================================
SELECT name, color, array_length(keywords, 1) AS kelime_sayisi, is_active
FROM public.chat_tags
ORDER BY display_order;
