-- =====================================================================
-- Tercüman / Danışman listesi
-- =====================================================================
-- Site : /tercumanlar — bankolardaki görseldeki QR kod bu sayfayı açar.
--        Sitede hiçbir yerden bağlantı verilmez, arama motorlarına kapalıdır.
-- Admin: /admin/interpreters
--
-- İdempotent: tekrar çalıştırılabilir. İlk liste yalnızca tablo boşsa eklenir.
-- =====================================================================

CREATE TABLE IF NOT EXISTS public.interpreters (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  -- Virgülle ayrılmış dil / bölge listesi; sayfada etiket olarak gösterilir
  languages TEXT NOT NULL DEFAULT '',
  phone TEXT NOT NULL DEFAULT '',
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.interpreters ENABLE ROW LEVEL SECURITY;

-- Ziyaretçi yalnızca aktif kayıtları okur
DROP POLICY IF EXISTS "Public read active" ON public.interpreters;
CREATE POLICY "Public read active" ON public.interpreters
  FOR SELECT USING (is_active = true OR public.is_admin());

-- Yalnızca admin yazar
DROP POLICY IF EXISTS "Admins write" ON public.interpreters;
CREATE POLICY "Admins write" ON public.interpreters
  FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

REVOKE INSERT, UPDATE, DELETE ON public.interpreters FROM anon;
GRANT SELECT ON public.interpreters TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.interpreters TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE public.interpreters_id_seq TO authenticated;

-- İlk liste (yalnızca tablo boşsa)
INSERT INTO public.interpreters (name, languages, phone, display_order)
SELECT v.name, v.languages, v.phone, v.display_order
FROM (VALUES
  ('Jennifer', 'Yeni Zelanda, Güney Afrika, İrlanda', '0537 303 69 19', 1),
  ('Bagül',    'Ermenistan, Tacikistan, Gürcistan',   '0531 685 65 21', 2),
  ('Adviye',   'Balkanlar',                           '0538 233 18 10', 3),
  ('Nour',     'Fransa, Fransızca',                   '0537 303 69 23', 4),
  ('Meral',    'Kosova, Arnavutluk',                  '0530 174 27 21', 5),
  ('Cengiz',   'Bulgaristan',                         '0537 303 69 26', 6),
  ('Nadya',    'Rusça, Türki Cumhuriyetler',          '0530 222 13 50', 7),
  ('Dilara',   'Macaristan',                          '0531 683 27 15', 8),
  ('Enedelya', 'İspanya',                             '0531 685 65 90', 9)
) AS v(name, languages, phone, display_order)
WHERE NOT EXISTS (SELECT 1 FROM public.interpreters);

NOTIFY pgrst, 'reload schema';
