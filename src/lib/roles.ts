// ============================================================
// Rol tanımları — yönetim paneli erişiminin TEK kaynağı.
//
// Daha önce aynı kural iki ayrı yerde elle yazılıydı: giriş sayfası
// yalnızca admin/super_admin'i kabul ederken AdminLayout 'hr' rolünü de
// içeri alıyordu. Sonuç: İK kullanıcısı giriş ekranını hiç geçemiyor,
// "Bu hesabın yönetim paneline erişim yetkisi yok" hatası alıyordu.
// Kural buraya taşındı ki iki taraf ayrışamasın.
//
// NOT: Buradaki kontroller KOZMETİKTİR. Asıl yetkilendirme kapısı
// veritabanındaki RLS politikalarıdır (bkz. is_admin() ve
// hr_role_job_applications_migration.sql). Rol bilgisi hiçbir zaman
// istemciden gelen veriye değil, profiles tablosuna dayanır.
// ============================================================

// Yalnızca tip; `import type` olmazsa bundler bunu çalışma zamanı
// bağlantısı sanıp "does not provide an export named" hatası verebilir.
import type { UserProfile } from './supabase';

export type AppRole = 'user' | 'editor' | 'hr' | 'admin' | 'super_admin';

/** Tüm yönetim modüllerine erişebilen roller */
export const ADMIN_ROLES: AppRole[] = ['admin', 'super_admin'];

/** Yönetim paneline (kendi izinli sayfalarıyla) girebilen roller */
export const PANEL_ROLES: AppRole[] = [...ADMIN_ROLES, 'hr'];

export const isAdminRole = (profile?: UserProfile | null): boolean =>
  !!profile?.role && ADMIN_ROLES.includes(profile.role as AppRole);

export const canAccessAdminPanel = (profile?: UserProfile | null): boolean =>
  !!profile?.role && PANEL_ROLES.includes(profile.role as AppRole);

/** İK rolü: panele girer ama yalnızca kendi modülünü görür */
export const isHrOnlyRole = (profile?: UserProfile | null): boolean =>
  profile?.role === 'hr';

/** İK rolünün girebildiği admin rotaları */
export const HR_ALLOWED_PATHS = ['/admin/job-applications'];
