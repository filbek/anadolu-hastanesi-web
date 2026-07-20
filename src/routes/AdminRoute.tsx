// c:\Users\asus\Documents\VOID-IDE\anadolu_hastaneleri_grubu_website_6ke0ub\src\routes\AdminRoute.tsx
import { Navigate, Outlet } from 'react-router-dom';
import { useSupabase } from '../contexts/SupabaseContext'; // Supabase context'ini import edin

const AdminRoute = () => {
  const { user, userProfile, loading } = useSupabase();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Kullanıcı yoksa veya profil yüklenmemişse veya admin değilse login'e yönlendir
  if (!user || !userProfile || (userProfile.role !== 'admin' && userProfile.role !== 'super_admin')) {
    return <Navigate to="/admin/login" replace />;
  }

  return <Outlet />;
};

export default AdminRoute;
