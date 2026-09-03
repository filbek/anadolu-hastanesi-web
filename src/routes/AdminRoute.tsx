import { Navigate, Outlet } from 'react-router-dom';
import { useSupabase } from '../contexts/SupabaseContext';
import { canAccessAdminPanel } from '../lib/roles';

const Spinner = () => (
  <div className="min-h-screen flex items-center justify-center bg-neutral">
    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
  </div>
);

const AdminRoute = () => {
  const { user, userProfile, profileLoaded, loading } = useSupabase();

  if (loading) {
    return <Spinner />;
  }

  if (!user) {
    return <Navigate to="/admin/login" replace />;
  }

  /*
   * Oturum var ama profil sorgusu henüz bitmediyse BEKLE, login'e atma.
   * Aksi halde derin bir adrese (örn. /admin/users) yapılan sayfa
   * yenilemesinde kullanıcı login'e düşer, oradan da Dashboard'a
   * yönlendirilir ve gitmek istediği sayfa kaybolur.
   *
   * profileLoaded kullanılır, userProfile değil: profil satırı hiç yoksa
   * userProfile kalıcı olarak null kalır ve ekran sonsuza kadar dönerdi.
   */
  if (!profileLoaded) {
    return <Spinner />;
  }

  /*
   * Rol kuralı lib/roles.ts'ten okunur. Daha önce aynı kural burada,
   * AdminLoginPage'de ve AdminLayout'ta ayrı ayrı yazılıydı; buradaki
   * kopya 'hr' rolünü reddedip diğerleri kabul ettiği için İK kullanıcısı
   * login <-> panel arasında sonsuz yönlendirme döngüsüne giriyor ve
   * ekran beyaz kalıyordu.
   */
  if (!canAccessAdminPanel(userProfile)) {
    return <Navigate to="/admin/login" replace />;
  }

  return <Outlet />;
};

export default AdminRoute;
