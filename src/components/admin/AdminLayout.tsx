import { useState } from 'react';
import { Link, Outlet, Navigate, useLocation } from 'react-router-dom';
import { useSupabase } from '../../contexts/SupabaseContext';
import {
  FaHospital, FaStethoscope, FaUserMd, FaNewspaper, FaUsers,
  FaSignOutAlt, FaTachometerAlt, FaBars, FaTimes, FaCog,
  FaImages, FaFileAlt, FaPhone, FaInfoCircle, FaGlobe,
  FaDatabase, FaVideo, FaAward, FaFilePdf, FaChevronRight
} from 'react-icons/fa';

const AdminLayout = () => {
  const { user, signOut, userProfile } = useSupabase();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const location = useLocation();

  const isAdmin = user && userProfile && (userProfile.role === 'admin' || userProfile.role === 'super_admin');

  if (!isAdmin) {
    return <Navigate to="/" />;
  }

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const navGroups = [
    {
      label: 'SAYFA YÖNETİMİ',
      items: [
        { path: '/admin/home-settings', icon: FaTachometerAlt, label: 'Ana Sayfa' },
        { path: '/admin/hospitals', icon: FaHospital, label: 'Hastaneler' },
        { path: '/admin/departments', icon: FaStethoscope, label: 'Bölümler' },
        { path: '/admin/doctors', icon: FaUserMd, label: 'Doktorlar' },
        { path: '/admin/articles', icon: FaNewspaper, label: 'Sağlık Rehberi' },
        { path: '/admin/health-tourism', icon: FaGlobe, label: 'Sağlık Turizmi' },
        { path: '/admin/contact-info', icon: FaPhone, label: 'İletişim' },
      ]
    },
    {
      label: 'İÇERİK & MEDYA',
      items: [
        { path: '/admin/pages', icon: FaFileAlt, label: 'Tüm Sayfalar' },
        { path: '/admin/media', icon: FaImages, label: 'Medya Galerisi' },
        { path: '/admin/video-content', icon: FaVideo, label: 'Video İçerikler' },
      ]
    },
    {
      label: 'HASTA HİZMETLERİ',
      items: [
        { path: '/admin/patient-info', icon: FaFilePdf, label: 'Hasta Bilgilendirme' },
        { path: '/admin/quality-certificates', icon: FaAward, label: 'Kalite Sertifikaları' },
      ]
    },
    {
      label: 'SİSTEM',
      items: [
        { path: '/admin/users', icon: FaUsers, label: 'Kullanıcılar' },
        { path: '/admin/seo', icon: FaGlobe, label: 'SEO Ayarları' },
        { path: '/admin/settings', icon: FaCog, label: 'Site Ayarları' },
        { path: '/admin/test-connection', icon: FaDatabase, label: 'Bağlantı Testi' },
      ]
    }
  ];

  return (
    <div className="flex h-screen bg-admin-bg overflow-hidden font-sans">
      {/* Sidebar */}
      <aside
        className={`bg-admin-sidebar text-slate-300 w-72 flex-shrink-0 transition-all duration-300 ease-in-out border-r border-white/5 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:-ml-72'
          } fixed lg:relative h-full z-50 shadow-2xl`}
      >
        <div className="flex flex-col h-full">
          {/* Logo Section */}
          <div className="p-6 flex items-center justify-between">
            <Link to="/admin" className="flex items-center space-x-3 group">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/30 group-hover:scale-105 transition-transform duration-200">
                <span className="text-white font-bold text-xl">A</span>
              </div>
              <div className="flex flex-col">
                <span className="text-white font-bold tracking-tight text-lg leading-none">ANADOLU</span>
                <span className="text-primary text-xs font-semibold tracking-widest mt-0.5">ADMIN</span>
              </div>
            </Link>
            <button className="lg:hidden text-slate-400 hover:text-white" onClick={toggleSidebar}>
              <FaTimes size={20} />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto px-4 py-2 custom-scrollbar">
            {navGroups.map((group, gIdx) => (
              <div key={gIdx} className="mb-8">
                <h3 className="px-4 text-[11px] font-bold text-slate-500 uppercase tracking-[2px] mb-3">
                  {group.label}
                </h3>
                <ul className="space-y-1">
                  {group.items.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                      <li key={item.path}>
                        <Link
                          to={item.path}
                          className={`flex items-center justify-between px-4 py-2.5 rounded-xl transition-all duration-200 group ${isActive
                            ? 'bg-primary text-white shadow-lg shadow-primary/20'
                            : 'hover:bg-white/5 hover:text-white'
                            }`}
                        >
                          <div className="flex items-center">
                            <item.icon className={`mr-3.5 transition-colors ${isActive ? 'text-white' : 'group-hover:text-primary'}`} />
                            <span className="text-[14px] font-medium">{item.label}</span>
                          </div>
                          {isActive && <FaChevronRight size={10} className="text-white/50" />}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </nav>

          {/* User Section Bottom */}
          <div className="p-4 bg-black/20 mt-auto">
            <button
              onClick={() => signOut()}
              className="flex items-center w-full px-4 py-3 rounded-xl hover:bg-red-500/10 hover:text-red-500 transition-all duration-200 text-slate-400"
            >
              <FaSignOutAlt className="mr-3" />
              <span className="text-sm font-medium">Güvenli Çıkış</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200/60 sticky top-0 z-40">
          <div className="h-full px-8 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                className="lg:hidden p-2 rounded-lg hover:bg-slate-100 transition-colors"
                onClick={toggleSidebar}
              >
                <FaBars className="text-slate-600" />
              </button>
              <div className="hidden md:flex items-center text-slate-400 text-sm">
                <span>Yönetim Paneli</span>
                <FaChevronRight size={10} className="mx-3 opacity-50" />
                <span className="text-slate-900 font-medium capitalize">
                  {location.pathname === '/admin' ? 'Dashboard' : location.pathname.split('/').pop()?.replace('-', ' ')}
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-6">
              <div className="hidden sm:flex flex-col items-end mr-4">
                <span className="text-slate-900 font-bold text-sm leading-none mb-1">
                  {user?.user_metadata?.full_name || user?.email?.split('@')[0]}
                </span>
                <span className="text-primary text-[11px] font-bold uppercase tracking-wider">
                  {userProfile?.role === 'super_admin' ? 'SÜPER ADMİN' : 'DİREKTÖR'}
                </span>
              </div>

              <div className="relative group">
                <div className="w-11 h-11 rounded-2xl bg-slate-100 overflow-hidden border-2 border-white shadow-sm group-hover:shadow-md transition-all duration-200">
                  {user?.user_metadata?.avatar_url ? (
                    <img
                      src={user.user_metadata.avatar_url}
                      alt="Avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary font-bold">
                      {user?.email?.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                {/* Status Dot */}
                <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full"></div>
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Content Container */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto px-8 py-8 custom-scrollbar">
          <div className="max-w-7xl mx-auto animate-fade-in">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;

