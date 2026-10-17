-- ============================================================
-- Anadolu Hastaneleri Grubu - Çağrı merkezi operatör kapsamı
--
-- 1) Operatör (chat_agents.agent_role = 'agent') YALNIZCA kendine atanmış
--    görüşmeleri görür. Havuz (atanmamış) görüşmeler artık yalnızca
--    süpervizör/yöneticiye görünür; süpervizör onları devreder.
--    Kapalı kendi görüşmeleri son 30 gün görünmeye devam eder.
-- 2) Hazır yanıtları ve etiket kurallarını her aktif ekip üyesi
--    (chat_can_serve) yönetebilir — eskiden yalnızca süpervizör/yönetici.
--
-- Ekip, ayarlar ve görüşme silme süpervizör/yöneticide kalır.
--
-- SIRA: call_center_supervisor_migration.sql'den SONRA.
-- Idempotent: birden fazla kez çalıştırılabilir.
-- ============================================================


-- 1) GÖRÜŞME GÖRÜNÜRLÜĞÜ
--
-- supervisor -> hepsi
-- agent      -> yalnızca kendine atanan (kapalıysa son 30 gün)
CREATE OR REPLACE FUNCTION public.chat_can_view_conversation(
  p_assigned_to UUID,
  p_created_at TIMESTAMPTZ,
  p_status TEXT
)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
AS $$
  SELECT
    public.chat_is_supervisor()
    OR (
      public.chat_can_serve()
      AND p_assigned_to = auth.uid()
      AND (p_status <> 'closed' OR p_created_at > now() - INTERVAL '30 days')
    );
$$;

GRANT EXECUTE ON FUNCTION public.chat_can_view_conversation(UUID, TIMESTAMPTZ, TEXT)
  TO authenticated;


-- 2) HAZIR YANIT VE ETİKET YÖNETİMİ: tüm aktif ekip üyeleri
DROP POLICY IF EXISTS "Supervisors manage canned" ON public.chat_canned_responses;
CREATE POLICY "Supervisors manage canned" ON public.chat_canned_responses
  FOR ALL TO authenticated
  USING (public.is_admin() OR public.chat_can_serve())
  WITH CHECK (public.is_admin() OR public.chat_can_serve());

DROP POLICY IF EXISTS "Supervisors manage tags" ON public.chat_tags;
CREATE POLICY "Supervisors manage tags" ON public.chat_tags
  FOR ALL TO authenticated
  USING (public.is_admin() OR public.chat_can_serve())
  WITH CHECK (public.is_admin() OR public.chat_can_serve());
