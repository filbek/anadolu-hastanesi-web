// ============================================================
// Supabase Edge Function: share-job-application
//
// İş başvurularının süreli bağlantıyla paylaşılması.
//
// NEDEN SUNUCUDA: Paylaşım sayfası job_applications'ı doğrudan okusaydı
// tabloyu anon'a açmak gerekirdi — yani tüm başvurular herkese açılırdı.
// Bunun yerine kayıt burada service_role ile okunur ve YALNIZCA kapsama
// giren alanlar döndürülür. Kapsam dışı alanlar yanıta hiç konmaz;
// tarayıcıya ulaşıp CSS ile gizlenmez.
//
// Token: 32 bayt rastgele, base64url. Veritabanında yalnızca SHA-256
// özeti tutulur (bkz. job_application_shares_migration.sql).
//
// verify_jwt KAPALI deploy edilmelidir; 'resolve' işlemi kimlik
// doğrulaması olmadan çağrılır, diğer işlemler JWT'yi kendisi doğrular:
//   supabase functions deploy share-job-application --no-verify-jwt
//
// SUPABASE_URL ve SUPABASE_SERVICE_ROLE_KEY edge runtime'da otomatik gelir.
// ============================================================

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });

/**
 * Değerlendirme için gereken alanlar.
 *
 * Bilinçli olarak DIŞARIDA bırakılanlar: TC kimlik, adres, telefon,
 * e-posta, kan grubu, sağlık durumu, doğum yeri/tarihi, medeni hal,
 * askerlik, sigara, ücret bilgileri, fotoğraf.
 *
 * Bölüm sorumlusu "bu adayı görüşmeye çağıralım mı" sorusuna cevap
 * verirken bunlara ihtiyaç duymaz; özel nitelikli veriyi kimliği
 * doğrulanmamış bir bağlantıya koymak KVKK'daki amaçla sınırlılık
 * ilkesine aykırı olurdu.
 */
const SUMMARY_FIELDS = [
  'reference_code', 'created_at', 'full_name', 'position', 'position_group',
  'hospital', 'preferred_cities', 'education', 'experience', 'skills',
  'computer_skills', 'languages', 'certificates', 'references_list',
  'profession_notes', 'earliest_start_date', 'drivers_license',
  'overtime', 'weekend_work', 'night_shift', 'public_holiday', 'travel',
] as const;

/** Tam kayıt: özetin üstüne kimlik, iletişim ve sağlık alanları */
const FULL_EXTRA_FIELDS = [
  'national_id', 'gender', 'birth_place_date', 'marital_status', 'nationality',
  'address', 'mobile_phone', 'home_phone', 'alternative_phone', 'email',
  'blood_type', 'military_status', 'smoker', 'health_issues',
  'last_salary', 'expected_salary', 'photo_url',
] as const;

const BUCKET = 'job-applications';
const DOC_URL_TTL = 60 * 60; // paylaşılan belge bağlantısı 1 saat

/** Kaç saatlik bağlantı üretilebilir — istemciden gelen değer buna kısılır */
const ALLOWED_HOURS = [1, 24, 168];

const sha256Hex = async (value: string) => {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
};

const randomToken = () => {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
};

/** Kayıttan bucket içi yolu çıkarır (eski kayıtlar tam URL tutabiliyor) */
const toStoragePath = (value: string): string => {
  if (!/^https?:\/\//i.test(value)) return value;
  const marker = `/${BUCKET}/`;
  const idx = value.indexOf(marker);
  return idx === -1 ? value : decodeURIComponent(value.slice(idx + marker.length));
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!supabaseUrl || !serviceKey) {
      return json({ error: 'Sunucu yapılandırması eksik' }, 500);
    }

    const admin = createClient(supabaseUrl, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const payload = (await req.json().catch(() => ({}))) as Record<string, any>;
    const action = payload.action as string | undefined;

    // ============================================================
    // resolve — KİMLİK DOĞRULAMASI YOK, bağlantıyı açan herkes çağırır
    // ============================================================
    if (action === 'resolve') {
      const token = String(payload.token ?? '');
      if (!token) return json({ error: 'Bağlantı geçersiz' }, 400);

      const { data: share, error } = await admin
        .from('job_application_shares')
        .select('*')
        .eq('token_hash', await sha256Hex(token))
        .maybeSingle();

      // Geçersiz / süresi dolmuş / iptal edilmiş durumların hepsine AYNI
      // yanıt verilir; "bu token vardı ama süresi doldu" demek bile
      // saldırgana bilgi sızdırır.
      const invalid = () => json({ error: 'expired' }, 404);

      if (error || !share) return invalid();
      if (share.revoked_at) return invalid();
      if (new Date(share.expires_at).getTime() < Date.now()) return invalid();

      const fields = share.scope === 'tam'
        ? [...SUMMARY_FIELDS, ...FULL_EXTRA_FIELDS]
        : [...SUMMARY_FIELDS];

      const { data: app, error: appError } = await admin
        .from('job_applications')
        .select(fields.join(','))
        .eq('id', share.application_id)
        .maybeSingle();

      if (appError || !app) return invalid();

      // CV yalnızca paylaşım sırasında açıkça işaretlendiyse
      let cvUrl: string | null = null;
      if (share.include_cv) {
        const { data: row } = await admin
          .from('job_applications')
          .select('cv_url')
          .eq('id', share.application_id)
          .maybeSingle();
        if (row?.cv_url) {
          const { data: signed } = await admin.storage
            .from(BUCKET)
            .createSignedUrl(toStoragePath(row.cv_url), DOC_URL_TTL);
          cvUrl = signed?.signedUrl ?? null;
        }
      }

      // Erişim kaydı. Başarısız olsa da sayfa açılmalı — log yazamamak
      // bölüm sorumlusunun işini durdurmaz.
      const ip =
        req.headers.get('CF-Connecting-IP') ??
        req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
        '';
      admin
        .from('job_application_share_views')
        .insert({
          share_id: share.id,
          ip_hash: ip ? await sha256Hex(ip) : null,
          user_agent: req.headers.get('user-agent')?.slice(0, 300) ?? null,
        })
        .then(({ error: e }) => e && console.error('Görüntüleme kaydı yazılamadı:', e));

      await admin
        .from('job_application_shares')
        .update({
          view_count: (share.view_count ?? 0) + 1,
          first_viewed_at: share.first_viewed_at ?? new Date().toISOString(),
          last_viewed_at: new Date().toISOString(),
        })
        .eq('id', share.id);

      return json({
        application: app,
        cv_url: cvUrl,
        scope: share.scope,
        shared_by: share.created_by_name,
        shared_at: share.created_at,
        expires_at: share.expires_at,
      });
    }

    // ============================================================
    // Buradan sonrası İK / yönetici yetkisi ister
    // ============================================================
    const token = (req.headers.get('Authorization') ?? '').replace(/^Bearer\s+/i, '').trim();
    if (!token) return json({ error: 'Oturum bulunamadı' }, 401);

    const { data: caller, error: callerError } = await admin.auth.getUser(token);
    if (callerError || !caller?.user) return json({ error: 'Geçersiz oturum' }, 401);

    const { data: profile } = await admin
      .from('profiles')
      .select('role, full_name, email')
      .eq('id', caller.user.id)
      .maybeSingle();

    if (!profile || !['admin', 'super_admin', 'hr'].includes(profile.role)) {
      return json({ error: 'Bu işlem için yetkiniz yok' }, 403);
    }

    if (action === 'create') {
      const applicationId = Number(payload.application_id);
      const scope = payload.scope === 'tam' ? 'tam' : 'ozet';
      const includeCv = payload.include_cv === true;
      const hours = ALLOWED_HOURS.includes(Number(payload.hours))
        ? Number(payload.hours)
        : 24;

      if (!applicationId) return json({ error: 'Başvuru kimliği eksik' }, 400);

      const plain = randomToken();
      const expiresAt = new Date(Date.now() + hours * 3600 * 1000).toISOString();

      const { data, error } = await admin
        .from('job_application_shares')
        .insert({
          application_id: applicationId,
          token_hash: await sha256Hex(plain),
          scope,
          include_cv: includeCv,
          created_by: caller.user.id,
          created_by_name: profile.full_name || profile.email || 'Bilinmeyen kullanıcı',
          expires_at: expiresAt,
          note: typeof payload.note === 'string' ? payload.note.slice(0, 500) : null,
        })
        .select()
        .single();

      if (error) return json({ error: error.message }, 400);

      // Düz token YALNIZCA burada, yalnızca bu yanıtta döner.
      // Bir daha hiçbir yerden okunamaz; kaybedilirse yeni bağlantı üretilir.
      return json({ share: data, token: plain, expires_at: expiresAt });
    }

    if (action === 'list') {
      const applicationId = Number(payload.application_id);
      if (!applicationId) return json({ error: 'Başvuru kimliği eksik' }, 400);

      const { data, error } = await admin
        .from('job_application_shares')
        .select('*')
        .eq('application_id', applicationId)
        .order('created_at', { ascending: false });

      if (error) return json({ error: error.message }, 400);
      return json({ shares: data ?? [] });
    }

    if (action === 'revoke') {
      const id = Number(payload.id);
      if (!id) return json({ error: 'Bağlantı kimliği eksik' }, 400);

      const { error } = await admin
        .from('job_application_shares')
        .update({ revoked_at: new Date().toISOString() })
        .eq('id', id);

      if (error) return json({ error: error.message }, 400);
      return json({ ok: true });
    }

    return json({ error: 'Bilinmeyen işlem' }, 400);
  } catch (err) {
    console.error('share-job-application error:', err);
    return json({ error: String(err) }, 500);
  }
});
