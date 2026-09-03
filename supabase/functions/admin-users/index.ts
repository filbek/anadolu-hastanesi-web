// ============================================================
// Supabase Edge Function: admin-users
//
// Admin panelindeki "Kullanıcılar" bölümünün kullanıcı listeleme /
// oluşturma / güncelleme / silme işlemlerini sunucu tarafında yapar.
//
// NEDEN: supabase.auth.admin.* uçları yalnızca service_role anahtarıyla
// çalışır. Tarayıcıda anon anahtar bulunduğu için doğrudan çağrıldığında
// 403 "User not allowed" döner. Service_role anahtarı ise frontend'e
// konulamaz (tüm RLS'i bypass eder). Bu yüzden işlemler burada yapılır.
//
// GÜVENLİK: Her istekte çağıranın JWT'si doğrulanır ve public.profiles
// tablosundaki rolü 'admin' veya 'super_admin' olmak zorundadır. Rol
// istemciden gelen bilgiye göre değil, veritabanından okunur.
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

const ALLOWED_ROLES = ['user', 'editor', 'hr', 'admin', 'super_admin'] as const;
type Role = (typeof ALLOWED_ROLES)[number];

// Kullanıcı yönetimi yapabilecek roller
const MANAGER_ROLES = ['admin', 'super_admin'];

type Action = 'list' | 'create' | 'update' | 'delete';

interface Payload {
  action?: Action;
  id?: string;
  email?: string;
  password?: string;
  full_name?: string;
  role?: string;
  is_active?: boolean;
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });

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

    // --- 1) Çağıranın kimliği ---
    const authHeader = req.headers.get('Authorization') ?? '';
    const token = authHeader.replace(/^Bearer\s+/i, '').trim();
    if (!token) {
      return json({ error: 'Oturum bulunamadı' }, 401);
    }

    const { data: caller, error: callerError } = await admin.auth.getUser(token);
    if (callerError || !caller?.user) {
      return json({ error: 'Geçersiz oturum' }, 401);
    }

    // --- 2) Çağıranın rolü veritabanından ---
    const { data: callerProfile, error: profileError } = await admin
      .from('profiles')
      .select('role')
      .eq('id', caller.user.id)
      .maybeSingle();

    if (profileError) {
      console.error('admin-users profil okuma hatası:', profileError);
      return json({ error: 'Yetki doğrulanamadı' }, 500);
    }

    if (!callerProfile || !MANAGER_ROLES.includes(callerProfile.role)) {
      return json({ error: 'Bu işlem için yetkiniz yok' }, 403);
    }

    const payload = (await req.json().catch(() => ({}))) as Payload;
    const action = payload.action;

    // --- 3) İşlemler ---
    if (action === 'list') {
      const { data, error } = await admin.auth.admin.listUsers({
        page: 1,
        perPage: 1000,
      });
      if (error) return json({ error: error.message }, 400);

      const ids = data.users.map((u) => u.id);
      const { data: profiles } = await admin
        .from('profiles')
        .select('id, full_name, role, avatar_url')
        .in('id', ids.length ? ids : ['00000000-0000-0000-0000-000000000000']);

      const profileById = new Map(
        (profiles ?? []).map((p: any) => [p.id, p]),
      );

      const users = data.users.map((u: any) => {
        const p: any = profileById.get(u.id) ?? {};
        const bannedUntil = u.banned_until ? Date.parse(u.banned_until) : 0;
        return {
          id: u.id,
          email: u.email ?? '',
          full_name: p.full_name || u.user_metadata?.full_name || u.email || '',
          role: (p.role || u.user_metadata?.role || 'user') as Role,
          is_active: !(bannedUntil && bannedUntil > Date.now()),
          created_at: u.created_at,
          last_login: u.last_sign_in_at ?? '',
          avatar_url: p.avatar_url || u.user_metadata?.avatar_url || undefined,
        };
      });

      return json({ users });
    }

    if (action === 'create') {
      const { email, password, full_name } = payload;
      const role = (payload.role ?? 'user') as Role;
      const isActive = payload.is_active !== false;

      if (!email || !password) {
        return json({ error: 'E-posta ve şifre zorunlu' }, 400);
      }
      if (!ALLOWED_ROLES.includes(role)) {
        return json({ error: 'Geçersiz rol' }, 400);
      }

      const { data, error } = await admin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        ban_duration: isActive ? 'none' : '876000h',
        user_metadata: { full_name: full_name ?? '', role },
      });
      if (error) return json({ error: error.message }, 400);

      const newId = data.user!.id;

      // profiles kaydı trigger ile açılmış olabilir; upsert güvenli yol
      const { error: upsertError } = await admin.from('profiles').upsert(
        {
          id: newId,
          email,
          full_name: full_name ?? '',
          role,
        },
        { onConflict: 'id' },
      );
      if (upsertError) {
        console.error('admin-users profil yazma hatası:', upsertError);
        return json({ error: 'Kullanıcı açıldı ancak profil kaydedilemedi: ' + upsertError.message }, 500);
      }

      return json({
        user: {
          id: newId,
          email,
          full_name: full_name ?? '',
          role,
          is_active: isActive,
          created_at: data.user!.created_at,
          last_login: '',
        },
      });
    }

    if (action === 'update') {
      const { id, email, full_name } = payload;
      const role = payload.role as Role | undefined;

      if (!id) return json({ error: 'Kullanıcı kimliği eksik' }, 400);
      if (role && !ALLOWED_ROLES.includes(role)) {
        return json({ error: 'Geçersiz rol' }, 400);
      }

      // Yönetici kendi rolünü düşüremesin / kendini pasife alamasın
      const selfEdit = id === caller.user.id;
      if (selfEdit && role && !MANAGER_ROLES.includes(role)) {
        return json({ error: 'Kendi yönetici rolünüzü kaldıramazsınız' }, 400);
      }
      if (selfEdit && payload.is_active === false) {
        return json({ error: 'Kendi hesabınızı pasife alamazsınız' }, 400);
      }

      const attrs: Record<string, unknown> = {
        user_metadata: { full_name: full_name ?? '', role: role ?? 'user' },
      };
      if (email) attrs.email = email;
      if (payload.is_active !== undefined) {
        attrs.ban_duration = payload.is_active ? 'none' : '876000h';
      }

      const { error } = await admin.auth.admin.updateUserById(id, attrs);
      if (error) return json({ error: error.message }, 400);

      const profileUpdate: Record<string, unknown> = {};
      if (email) profileUpdate.email = email;
      if (full_name !== undefined) profileUpdate.full_name = full_name;
      if (role) profileUpdate.role = role;

      if (Object.keys(profileUpdate).length) {
        const { error: pErr } = await admin
          .from('profiles')
          .update(profileUpdate)
          .eq('id', id);
        if (pErr) {
          console.error('admin-users profil güncelleme hatası:', pErr);
          return json({ error: 'Profil güncellenemedi: ' + pErr.message }, 500);
        }
      }

      return json({ ok: true });
    }

    if (action === 'delete') {
      const { id } = payload;
      if (!id) return json({ error: 'Kullanıcı kimliği eksik' }, 400);
      if (id === caller.user.id) {
        return json({ error: 'Kendi hesabınızı silemezsiniz' }, 400);
      }

      const { error } = await admin.auth.admin.deleteUser(id);
      if (error) return json({ error: error.message }, 400);

      return json({ ok: true });
    }

    return json({ error: 'Bilinmeyen işlem' }, 400);
  } catch (err) {
    console.error('admin-users error:', err);
    return json({ error: String(err) }, 500);
  }
});
