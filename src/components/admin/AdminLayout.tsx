import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, Outlet, Navigate, useLocation } from 'react-router-dom';
import { useSupabase } from '../../contexts/SupabaseContext';
import {
  canAccessAdminPanel, canUseLiveChat, restrictedPathsFor, landingPathFor,
  ROLE_LABELS, AppRole,
} from '../../lib/roles';
import {
  fetchConversations, subscribeToChatChanges, hasUnreadForAgent,
  agentHeartbeat, AgentStatus, AGENT_STATUS_LABELS,
} from '../../services/chatService';
import {
  playChatAlert, notifyNewChat, requestNotificationPermission,
  loadNotificationPrefs, saveNotificationPrefs,
  NotificationPrefs, DEFAULT_PREFS,
} from '../../utils/chatNotifications';
import {
  FaHospital, FaStethoscope, FaUserMd, FaNewspaper, FaUsers,
  FaSignOutAlt, FaTachometerAlt, FaBars, FaTimes, FaCog,
  FaImages, FaFileAlt, FaPhone, FaGlobe, FaEnvelope,
  FaDatabase, FaVideo, FaAward, FaFilePdf, FaChevronRight,
  FaSlideshare, FaComments, FaChartBar, FaCertificate, FaClipboardList, FaHistory, FaUserTie,
  FaBaby, FaHandshake, FaSitemap, FaHandHoldingHeart, FaWhatsapp, FaHeadset,
  FaBell, FaVolumeUp, FaVolumeMute, FaBriefcase
} from 'react-icons/fa';

/** Sidebar'da rozet gösterilen menü öğesi */
const LIVE_CHAT_PATH = '/admin/live-chat';

const AdminLayout = () => {
  const { user, signOut, userProfile } = useSupabase();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [unreadChats, setUnreadChats] = useState(0);
  const [prefs, setPrefs] = useState<NotificationPrefs>(DEFAULT_PREFS);
  const [agentStatus, setAgentStatus] = useState<AgentStatus>('online');
  // -1 = henüz ilk sayım yapılmadı; ilk yüklemede uyarı çalmasın
  const prevUnreadRef = useRef(-1);
  const location = useLocation();

  useEffect(() => {
    setPrefs(loadNotificationPrefs());
  }, []);

  const togglePref = useCallback(async (key: keyof NotificationPrefs) => {
    // Masaüstü bildirimi izni yalnızca kullanıcı tıklamasından istenebilir
    if (key === 'desktop' && !prefs.desktop) {
      const granted = await requestNotificationPermission();
      if (!granted) {
        alert(
          'Masaüstü bildirimi için tarayıcı izni gerekiyor. ' +
            'Adres çubuğundaki kilit simgesinden bildirimlere izin verebilirsiniz.',
        );
        return;
      }
    }
    const next = { ...prefs, [key]: !prefs[key] };
    setPrefs(next);
    saveNotificationPrefs(next);
    if (key === 'sound' && next.sound) playChatAlert();
  }, [prefs]);

  // Canlı destek rozeti, uyarı sesi ve çevrimiçi sinyali: yöneticiler + çağrı merkezi
  const isChatOperator = !!user && canUseLiveChat(userProfile);

  /*
   * Kısıtlı roller: İK (hr) yalnızca İnsan Kaynakları modülünü,
   * çağrı merkezi (call_center) yalnızca Canlı Destek'i görür.
   *
   * Buradaki filtre KOZMETİKTİR — asıl kapı veritabanındaki RLS'tir
   * (bkz. hr_role_job_applications_migration.sql). Diğer tabloların
   * politikaları is_admin() üzerine kurulu olduğu için 'hr' rolü adresi
   * elle yazsa bile veri okuyup yazamaz. Menü ve yönlendirme yalnızca
   * kullanıcıyı boş ekranlarla uğraştırmamak için.
   */
  const allowedPaths = user ? restrictedPathsFor(userProfile) : null;
  const canAccessPanel = !!user && canAccessAdminPanel(userProfile);

  const pathAllowed =
    !allowedPaths || allowedPaths.some((p) => location.pathname.startsWith(p));

  // Yanıt bekleyen canlı destek görüşmeleri — Realtime ile anlık güncellenir.
  // Operatör hangi sayfada olursa olsun yeni sohbeti fark etsin diye burada.
  useEffect(() => {
    if (!isChatOperator) return;

    const refresh = () => {
      fetchConversations('all')
        .then((list) => {
          // Rozet: kendine atanmış yanıtsızlar + havuzda bekleyenler.
          // Herkesin okunmamışını saymak rozeti anlamsızlaştırırdı —
          // operatör başkasının işi için uyarılmamalı.
          const count = list.filter(
            (c) =>
              (c.assigned_to === user?.id && hasUnreadForAgent(c)) ||
              (c.assigned_to === null && c.status !== 'closed'),
          ).length;

          // Yalnızca sayı ARTTIĞINDA uyar; her tazelemede değil.
          // İlk yükleme (-1) sessiz geçsin ki sayfa açılışında ses çalmasın.
          if (prevUnreadRef.current >= 0 && count > prevUnreadRef.current) {
            if (prefs.sound) playChatAlert();
            if (prefs.desktop) notifyNewChat(count);
          }
          prevUnreadRef.current = count;
          setUnreadChats(count);
        })
        .catch((err) => console.error('Okunmamış sohbet sayısı alınamadı:', err));
    };

    refresh();
    return subscribeToChatChanges(refresh);
  }, [isChatOperator, prefs.sound, prefs.desktop, user?.id]);

  /*
   * Operatör çevrimiçi sinyali. Otomatik atamanın kime görüşme
   * yollayacağını bu belirler — 90 saniyeden eski sinyal çevrimdışı sayılır.
   *
   * Presence WIDGET'A YANSITILMAZ: çağrı merkezi 7/24 çalışıyor, heartbeat
   * bir aksaklıkla dursa widget "çevrimdışı" derdi ve teknik bir arıza
   * doğrudan hasta erişimine dönüşürdü.
   */
  useEffect(() => {
    if (!isChatOperator) return;

    const beat = () => {
      // Sekme arka plandayken "meşgul" say — otomatik atama boşa gitmesin
      const effective: AgentStatus =
        agentStatus === 'online' && document.visibilityState !== 'visible'
          ? 'away'
          : agentStatus;
      agentHeartbeat(effective);
    };

    beat();
    const interval = setInterval(beat, 30000);
    document.addEventListener('visibilitychange', beat);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', beat);
    };
  }, [isChatOperator, agentStatus]);

  // Okunmamış sayısı sekme başlığına da yazılsın
  useEffect(() => {
    const base = document.title.replace(/^\(\d+\)\s*/, '');
    document.title = unreadChats > 0 ? `(${unreadChats}) ${base}` : base;
  }, [unreadChats, location.pathname]);

  if (!canAccessPanel) {
    return <Navigate to="/" />;
  }

  // Kısıtlı rollerde panelin giriş noktası Dashboard değil, kendi modülüdür
  if (!pathAllowed) {
    return <Navigate to={landingPathFor(userProfile)} replace />;
  }

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const navGroups = [
    {
      label: 'SAYFA YÖNETİMİ',
      items: [
        { path: '/admin/home-settings', icon: FaTachometerAlt, label: 'Ana Sayfa' },
        { path: '/admin/hero-slides', icon: FaSlideshare, label: 'Hero Slider' },
        { path: '/admin/hospitals', icon: FaHospital, label: 'Hastaneler' },
        { path: '/admin/departments', icon: FaStethoscope, label: 'Bölümler' },
        { path: '/admin/doctors', icon: FaUserMd, label: 'Doktorlar' },
        { path: '/admin/articles', icon: FaNewspaper, label: 'Sağlık Rehberi' },
        { path: '/admin/testimonials', icon: FaComments, label: 'Hasta Yorumları' },
        { path: '/admin/news', icon: FaNewspaper, label: 'Haberler' },
        { path: '/admin/health-tourism', icon: FaGlobe, label: 'Sağlık Turizmi' },
        { path: '/admin/contact-info', icon: FaPhone, label: 'İletişim' },
        { path: '/admin/management-team', icon: FaUserTie, label: 'Yönetim Ekibi' },
        { path: '/admin/gebe-okulu', icon: FaBaby, label: 'Gebe Okulu' },
        { path: '/admin/social-responsibility', icon: FaHandHoldingHeart, label: 'Sosyal Sorumluluk' },
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
        // Canlı desteğin tüm alt bölümleri (rapor, ekip, hazır yanıtlar,
        // etiketler, ayarlar) bu sayfanın içindeki sekme çubuğunda.
        { path: LIVE_CHAT_PATH, icon: FaHeadset, label: 'Canlı Destek' },
        { path: '/admin/patient-info', icon: FaFilePdf, label: 'Hasta Bilgilendirme' },
        { path: '/admin/contracted-institutions', icon: FaHandshake, label: 'Anlaşmalı Kurumlar' },
        { path: '/admin/patient-feedback', icon: FaClipboardList, label: 'Geri Bildirimler' },
        { path: '/admin/second-opinion', icon: FaEnvelope, label: 'İkinci Görüş Başvuruları' },
        { path: '/admin/quality-certificates', icon: FaAward, label: 'Kalite Sertifikaları' },
        { path: '/admin/quality-committees', icon: FaClipboardList, label: 'Kalite Komiteleri' },
      { path: '/admin/organization-chart', icon: FaSitemap, label: 'Organizasyon Şeması' },
      ]
    },
    {
      // İK'nın gördüğü tek grup. İleride ilan yönetimi / pozisyon tanımları
      // eklenirse buraya girer.
      label: 'İNSAN KAYNAKLARI',
      items: [
        { path: '/admin/job-applications', icon: FaBriefcase, label: 'İş Başvuruları' },
      ]
    },
    {
      label: 'SİSTEM',
      items: [
        { path: '/admin/users', icon: FaUsers, label: 'Kullanıcılar' },
        { path: '/admin/site-stats', icon: FaChartBar, label: 'İstatistikler' },
        { path: '/admin/accreditations', icon: FaCertificate, label: 'Akreditasyonlar' },
        { path: '/admin/translations', icon: FaGlobe, label: 'Otomatik Çeviri' },
        { path: '/admin/seo', icon: FaGlobe, label: 'SEO Ayarları' },
        { path: '/admin/settings', icon: FaCog, label: 'Site Ayarları' },
        { path: '/admin/whatsapp-routing', icon: FaWhatsapp, label: 'WhatsApp Yönlendirme' },
        { path: '/admin/audit-logs', icon: FaHistory, label: 'Aktivite Logları' },
        { path: '/admin/test-connection', icon: FaDatabase, label: 'Bağlantı Testi' },
      ]
    }
  ];

  // Kısıtlı rollere yalnızca izinli rotalar gösterilir; boş kalan grup başlığı düşer
  const visibleGroups = allowedPaths
    ? navGroups
        .map((g) => ({ ...g, items: g.items.filter((i) => allowedPaths.includes(i.path)) }))
        .filter((g) => g.items.length > 0)
    : navGroups;

  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden font-sans">
      {/* Sidebar */}
      <aside
        className={`bg-[#0F1F3A] text-slate-300 w-72 flex-shrink-0 transition-all duration-300 ease-in-out border-r border-white/5 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:-ml-72'
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
                <span className="text-ocean-400 text-xs font-semibold tracking-widest mt-0.5">ADMIN</span>
              </div>
            </Link>
            <button className="lg:hidden text-slate-400 hover:text-white" onClick={toggleSidebar}>
              <FaTimes size={20} />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto px-4 py-2 custom-scrollbar">
            {visibleGroups.map((group, gIdx) => (
              <div key={gIdx} className="mb-8">
                <h3 className="px-4 text-[11px] font-bold text-slate-400 uppercase tracking-[2px] mb-3">
                  {group.label}
                </h3>
                <ul className="space-y-1">
                  {group.items.map((item) => {
                    // Alt rotalarda da vurgulu kalsın:
                    // /admin/live-chat/stats -> "Canlı Destek" aktif
                    const isActive =
                      location.pathname === item.path ||
                      location.pathname.startsWith(`${item.path}/`);
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
                          {item.path === LIVE_CHAT_PATH && unreadChats > 0 ? (
                            <span
                              className="ml-2 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-coral px-1.5 text-[11px] font-bold text-white"
                              aria-label={`${unreadChats} yanıtlanmamış görüşme`}
                            >
                              {unreadChats > 9 ? '9+' : unreadChats}
                            </span>
                          ) : (
                            isActive && <FaChevronRight size={10} className="text-white/50" />
                          )}
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
              {/* Operatör müsaitlik durumu — otomatik atamayı besler */}
              <div className="flex items-center gap-2">
                <label htmlFor="agent-status" className="sr-only">
                  Müsaitlik durumu
                </label>
                <span
                  className={`h-2.5 w-2.5 rounded-full ${
                    agentStatus === 'online'
                      ? 'bg-green-500'
                      : agentStatus === 'away'
                      ? 'bg-amber-400'
                      : 'bg-slate-300'
                  }`}
                  aria-hidden="true"
                />
                <select
                  id="agent-status"
                  value={agentStatus}
                  onChange={(e) => setAgentStatus(e.target.value as AgentStatus)}
                  title="Canlı destek müsaitlik durumunuz"
                  className="rounded-lg border border-slate-200 bg-white py-1.5 pl-2 pr-7 text-xs font-medium text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  {(['online', 'away', 'offline'] as AgentStatus[]).map((s) => (
                    <option key={s} value={s}>
                      {AGENT_STATUS_LABELS[s]}
                    </option>
                  ))}
                </select>
              </div>

              {/* Canlı destek bildirim tercihleri — operatörün başka
                  sekmedeyken yeni sohbeti kaçırmaması için */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => togglePref('sound')}
                  aria-pressed={prefs.sound}
                  title={prefs.sound ? 'Uyarı sesi açık' : 'Uyarı sesi kapalı'}
                  aria-label={prefs.sound ? 'Uyarı sesini kapat' : 'Uyarı sesini aç'}
                  className={`rounded-lg p-2.5 transition-colors ${
                    prefs.sound
                      ? 'bg-primary/10 text-primary'
                      : 'text-slate-400 hover:bg-slate-100'
                  }`}
                >
                  {prefs.sound ? <FaVolumeUp size={14} /> : <FaVolumeMute size={14} />}
                </button>
                <button
                  onClick={() => togglePref('desktop')}
                  aria-pressed={prefs.desktop}
                  title={
                    prefs.desktop
                      ? 'Masaüstü bildirimi açık'
                      : 'Masaüstü bildirimi kapalı'
                  }
                  aria-label={
                    prefs.desktop
                      ? 'Masaüstü bildirimini kapat'
                      : 'Masaüstü bildirimini aç'
                  }
                  className={`relative rounded-lg p-2.5 transition-colors ${
                    prefs.desktop
                      ? 'bg-primary/10 text-primary'
                      : 'text-slate-400 hover:bg-slate-100'
                  }`}
                >
                  <FaBell size={14} />
                  {unreadChats > 0 && (
                    <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-coral" />
                  )}
                </button>
              </div>

              <div className="hidden sm:flex flex-col items-end mr-4">
                <span className="text-slate-900 font-bold text-sm leading-none mb-1">
                  {user?.user_metadata?.full_name || user?.email?.split('@')[0]}
                </span>
                <span className="text-primary text-[11px] font-bold uppercase tracking-wider">
                  {ROLE_LABELS[userProfile?.role as AppRole] ?? 'Kullanıcı'}
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
            {/* Okunmamış sayısı ChatAdminLayout'un sekme rozetinde de
                kullanılıyor; ikinci bir Realtime aboneliği açmamak için
                context ile aktarılıyor. */}
            <Outlet context={{ unreadChats }} />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;

