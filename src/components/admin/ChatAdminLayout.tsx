import { NavLink, Navigate, Outlet, useLocation, useOutletContext } from 'react-router-dom';
import {
  FaComments, FaChartBar, FaHeadset, FaBolt, FaTag, FaCog,
} from 'react-icons/fa';
import { useSupabase } from '../../contexts/SupabaseContext';
import { isCallCenterOnlyRole } from '../../lib/roles';

/**
 * Canlı desteğin tüm alt sayfalarını tek bir panel sekmesinde toplar.
 *
 * Daha önce bunlar sol menüde altı ayrı satırdı ve menüyü şişiriyordu.
 * Artık sol menüde tek "Canlı Destek" girişi var; alt bölümler buradaki
 * sekme çubuğundan geziliyor.
 */

interface AdminOutletContext {
  unreadChats: number;
}

const TABS = [
  { to: '', label: 'Görüşmeler', icon: FaComments, end: true, badge: true },
  { to: 'stats', label: 'Rapor', icon: FaChartBar },
  { to: 'agents', label: 'Ekip', icon: FaHeadset },
  { to: 'canned', label: 'Hazır Yanıtlar', icon: FaBolt },
  { to: 'tags', label: 'Etiketler', icon: FaTag },
  { to: 'settings', label: 'Ayarlar', icon: FaCog },
];

/*
 * Çağrı merkezi operatörü yalnızca görüşmeleri ve raporu görür; ekip,
 * hazır yanıt, etiket ve ayar düzenleme supervisor/yönetici işidir.
 * Hazır yanıtları yine yanıt kutusunda "/" ile kullanabilir.
 * Filtre KOZMETİKTİR — asıl kapı RLS'tir (call_center_role_migration.sql).
 */
const CALL_CENTER_TABS = ['', 'stats'];

const ChatAdminLayout = () => {
  // Rozet sayısı AdminLayout'ta zaten hesaplanıyor; burada ikinci bir
  // Realtime aboneliği açmamak için Outlet context'i üzerinden alınıyor.
  const { unreadChats } = (useOutletContext<AdminOutletContext>() ?? {
    unreadChats: 0,
  });
  const { userProfile } = useSupabase();
  const location = useLocation();

  const isCallCenter = isCallCenterOnlyRole(userProfile);
  const tabs = isCallCenter ? TABS.filter((t) => CALL_CENTER_TABS.includes(t.to)) : TABS;

  // /admin/live-chat/<alt> → alt sekme; izinsiz sekmeye elle gidilirse görüşmelere dön
  const subPath = location.pathname.replace(/^\/admin\/live-chat\/?/, '').split('/')[0];
  if (isCallCenter && !CALL_CENTER_TABS.includes(subPath)) {
    return <Navigate to="/admin/live-chat" replace />;
  }

  return (
    <div>
      <nav
        className="mb-6 flex gap-1 overflow-x-auto border-b border-slate-200"
        aria-label="Canlı destek bölümleri"
      >
        {tabs.map((tab) => (
          <NavLink
            key={tab.to || 'index'}
            to={tab.to}
            end={tab.end}
            className={({ isActive }) =>
              `flex flex-shrink-0 items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
                isActive
                  ? 'border-primary text-primary'
                  : 'border-transparent text-slate-500 hover:border-slate-200 hover:text-slate-800'
              }`
            }
          >
            <tab.icon size={13} aria-hidden="true" />
            {tab.label}
            {tab.badge && unreadChats > 0 && (
              <span className="rounded-full bg-coral px-1.5 text-[10px] font-bold text-white">
                {unreadChats > 9 ? '9+' : unreadChats}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      <Outlet />
    </div>
  );
};

export default ChatAdminLayout;
