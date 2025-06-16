import { useState } from 'react';
import { Link, Outlet, Navigate } from 'react-router-dom';
import { useSupabase } from '../../contexts/SupabaseContext';
import { FaHospital, FaStethoscope, FaUserMd, FaNewspaper, FaUsers, FaSignOutAlt, FaTachometerAlt, FaBars, FaTimes } from 'react-icons/fa';

const AdminLayout = () => {
  const { user, signOut, userProfile } = useSupabase();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Check if user is authenticated and has admin or super_admin role in profile
  const isAdmin = user && userProfile && (userProfile.role === 'admin' || userProfile.role === 'super_admin');

  // Eğer gelecekte e-posta uzantısına dayalı bir kontrol yapılmak istenirse, aşağıdaki satır açılabilir.
  // const isAdmin = user && (userProfile?.role === 'admin' || userProfile?.role === 'super_admin' || user.email?.endsWith('@anadoluhastaneleri.com'));

  if (!isAdmin) {
    return <Navigate to="/" />;
  }

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex h-screen bg-neutral">
      {/* Sidebar */}
      <div
        className={`bg-primary text-white w-64 flex-shrink-0 transition-all duration-300 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } fixed lg:relative h-full z-50`}
      >
        <div className="p-4 flex items-center justify-between border-b border-primary-dark">
          <Link to="/admin" className="text-xl font-bold">
            Anadolu Admin
          </Link>
          <button
            className="lg:hidden text-white"
            onClick={toggleSidebar}
          >
            <FaTimes />
          </button>
        </div>
        <nav className="p-4">
          <ul className="space-y-2">
            <li>
              <Link
                to="/admin"
                className="flex items-center p-2 rounded-lg hover:bg-primary-dark transition-colors"
              >
                <FaTachometerAlt className="mr-3" />
                <span>Dashboard</span>
              </Link>
            </li>
            <li>
              <Link
                to="/admin/hospitals"
                className="flex items-center p-2 rounded-lg hover:bg-primary-dark transition-colors"
              >
                <FaHospital className="mr-3" />
                <span>Hastaneler</span>
              </Link>
            </li>
            <li>
              <Link
                to="/admin/departments"
                className="flex items-center p-2 rounded-lg hover:bg-primary-dark transition-colors"
              >
                <FaStethoscope className="mr-3" />
                <span>Bölümler</span>
              </Link>
            </li>
            <li>
              <Link
                to="/admin/doctors"
                className="flex items-center p-2 rounded-lg hover:bg-primary-dark transition-colors"
              >
                <FaUserMd className="mr-3" />
                <span>Doktorlar</span>
              </Link>
            </li>
            <li>
              <Link
                to="/admin/articles"
                className="flex items-center p-2 rounded-lg hover:bg-primary-dark transition-colors"
              >
                <FaNewspaper className="mr-3" />
                <span>Makaleler</span>
              </Link>
            </li>
            <li>
              <Link
                to="/admin/users"
                className="flex items-center p-2 rounded-lg hover:bg-primary-dark transition-colors"
              >
                <FaUsers className="mr-3" />
                <span>Kullanıcılar</span>
              </Link>
            </li>
            <li className="pt-4 mt-4 border-t border-primary-dark">
              <button
                onClick={() => signOut()}
                className="flex items-center p-2 rounded-lg hover:bg-primary-dark transition-colors w-full text-left"
              >
                <FaSignOutAlt className="mr-3" />
                <span>Çıkış Yap</span>
              </button>
            </li>
          </ul>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm">
          <div className="px-4 py-3 flex items-center justify-between">
            <button
              className="lg:hidden text-text"
              onClick={toggleSidebar}
            >
              <FaBars />
            </button>
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mr-2">
                {user?.user_metadata?.avatar_url ? (
                  <img
                    src={user.user_metadata.avatar_url}
                    alt="Avatar"
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <span className="text-primary font-medium">
                    {user?.email?.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <span className="text-text font-medium">
                {user?.user_metadata?.full_name || user?.email}
              </span>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-neutral p-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
