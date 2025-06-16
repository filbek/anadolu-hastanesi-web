// c:\Users\asus\Documents\VOID-IDE\anadolu_hastaneleri_grubu_website_6ke0ub\src\routes\AdminRoute.tsx
import { Navigate, Outlet } from 'react-router-dom';
import { useSupabase } from '../contexts/SupabaseContext'; // Supabase context'ini import edin

const AdminRoute = () => {
  const { session, userProfile, loading } = useSupabase(); // userProfile ve loading eklendi

  if (loading) {
    return <div>Yükleniyor...</div>; // veya bir LoadingSpinner componenti
  }

  // Oturum yoksa veya kullanıcı profili yüklenmemişse veya kullanıcı admin/super_admin değilse admin login sayfasına yönlendir
  if (!session || !userProfile || (userProfile.role !== 'admin' && userProfile.role !== 'super_admin')) {
    return <Navigate to="/admin/login" replace />;
  }

  // Kullanıcı admin ise alt route'ları render edin
  return <Outlet />;
};

export default AdminRoute;
