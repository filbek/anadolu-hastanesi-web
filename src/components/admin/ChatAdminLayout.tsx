import { NavLink, Navigate, Outlet, useLocation, useOutletContext } from 'react-router-dom';
import {
  FaComments, FaChartBar, FaHeadset, FaBolt, FaTag, FaCog,
} from 'react-icons/fa';
import { useEffect, useState } from 'react';
import { useSupabase } from '../../contexts/SupabaseContext';
import { isCallCenterOnlyRole } from '../../lib/roles';
import { fetchIsChatSupervisor } from '../../services/chatService';

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

/** Canlı destek alt sayfalarına geçen bağlam */
export interface ChatOutletContext {
  /** Çağrı merkezi süpervizörü (yönetici değil) — ekip yetkileri sınırlı */
  isCallCenterSupervisor: boolean;
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
 * Çağrı merkezi operatörü yalnızca görüşmeleri ve KENDİ raporunu görür;
 * ekip, hazır yanıt, etiket ve ayar düzenleme süpervizör/yönetici işidir.
 * Hazır yanıtları yine yanıt kutusunda "/" ile kullanabilir.
 * Ekip rolü 'supervisor' olan çağrı merkezi kullanıcısı tüm sekmeleri görür.
 * Filtre KOZMETİKTİR — asıl kapı RLS'tir (call_center_supervisor_migration.sql).
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

  // null = henüz bilinmiyor. Yalnızca çağrı merkezi için sorulur; yönetici
  // zaten tüm sekmeleri görür.
  const [isSupervisor, setIsSupervisor] = useState<boolean | null>(null);
  useEffect(() => {
    if (!isCallCenter) return;
    let cancelled = false;
    fetchIsChatSupervisor()
      .then((v) => !cancelled && setIsSupervisor(v))
      .catch(() => !cancelled && setIsSupervisor(false));
    return () => {
      cancelled = true;
    };
  }, [isCallCenter, userProfile?.id]);

  const restricted = isCallCenter && isSupervisor !== true;
  const tabs = restricted ? TABS.filter((t) => CALL_CENTER_TABS.includes(t.to)) : TABS;

  // /admin/live-chat/<alt> → alt sekme; izinsiz sekmeye elle gidilirse görüşmelere dön.
  // Süpervizörlük henüz sorgulanıyorsa bekle ki doğrudan /agents açan
  // süpervizör görüşmelere atılmasın.
  const subPath = location.pathname.replace(/^\/admin\/live-chat\/?/, '').split('/')[0];
  const onRestrictedTab = !CALL_CENTER_TABS.includes(subPath);
  if (isCallCenter && onRestrictedTab && isSupervisor === null) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-primary" />
      </div>
    );
  }
  if (restricted && onRestrictedTab) {
    return <Navigate to="/admin/live-chat" replace />;
  }

  const outletContext: ChatOutletContext = {
    isCallCenterSupervisor: isCallCenter && isSupervisor === true,
  };

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

      <Outlet context={outletContext} />
    </div>
  );
};

export default ChatAdminLayout;
