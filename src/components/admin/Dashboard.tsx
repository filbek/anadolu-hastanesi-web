import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaHospital, FaStethoscope, FaUserMd, FaNewspaper, FaUsers,
  FaPlus, FaChartLine, FaChevronRight
} from 'react-icons/fa';
import { supabase } from '../../lib/supabase';
import { AdminCard, StatCard, ActionButton } from './AdminUI';

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    hospitals: 0,
    departments: 0,
    doctors: 0,
    articles: 0,
    users: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('İstatistikler yüklenirken zaman aşımı oluştu.')), 15000)
        );

        const statsPromise = Promise.all([
          supabase.from('hospitals').select('*', { count: 'exact', head: true }),
          supabase.from('departments').select('*', { count: 'exact', head: true }),
          supabase.from('doctors').select('*', { count: 'exact', head: true }),
          supabase.from('health_articles').select('*', { count: 'exact', head: true }),
          supabase.from('profiles').select('*', { count: 'exact', head: true })
        ]);

        const [
          { count: hospitalCount },
          { count: departmentCount },
          { count: doctorCount },
          { count: articleCount },
          { count: userCount }
        ] = await Promise.race([statsPromise, timeoutPromise]) as any;

        setStats({
          hospitals: hospitalCount || 0,
          departments: departmentCount || 0,
          doctors: doctorCount || 0,
          articles: articleCount || 0,
          users: userCount || 0,
        });
      } catch (error) {
        console.error('Error fetching dashboard stats (timeout or missing table):', error);
        // We stay with 0 stats but loading is false, so dashboard renders
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 bg-white rounded-full"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Hoş Geldiniz</h1>
          <p className="text-slate-500 font-medium mt-1">Anadolu Hastaneleri Grubu bugün nasıl gidiyor?</p>
        </div>
        <div className="flex items-center space-x-3">
          <ActionButton
            icon={FaPlus}
            label="Yeni İçerik"
            onClick={() => navigate('/admin/pages')}
          />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        <StatCard title="Hastaneler" value={stats.hospitals} icon={FaHospital} trend="12%" trendUp color="bg-blue-500" />
        <StatCard title="Bölümler" value={stats.departments} icon={FaStethoscope} color="bg-teal-500" />
        <StatCard title="Uzmanlar" value={stats.doctors} icon={FaUserMd} trend="5%" trendUp color="bg-indigo-500" />
        <StatCard title="Makaleler" value={stats.articles} icon={FaNewspaper} color="bg-amber-500" />
        <StatCard title="Kullanıcılar" value={stats.users} icon={FaUsers} trend="2%" trendUp color="bg-emerald-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Activity Chart Area (Placeholder for visual excellence) */}
        <div className="lg:col-span-2 space-y-8">
          <AdminCard
            title="Sistem Performansı"
            subtitle="Son 30 günlük randevu ve sayfa görüntüleme istatistikleri"
            actions={
              <button className="text-primary font-bold text-sm bg-primary/5 px-3 py-1.5 rounded-lg hover:bg-primary/10 transition-colors">
                Raporu İndir
              </button>
            }
          >
            <div className="h-64 flex flex-col items-center justify-center bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
              <FaChartLine className="text-4xl text-slate-300 mb-3" />
              <p className="text-slate-400 font-medium text-sm">Grafik Verileri Hazırlanıyor...</p>
            </div>
          </AdminCard>

          <AdminCard title="Son Aktiviteler">
            <div className="space-y-6">
              {[
                { type: 'doctor', title: 'Yeni Doktor Katıldı', desc: 'Doç. Dr. Ayşe Kaya, Nöroloji', time: '2 saat önce', color: 'bg-blue-500' },
                { type: 'article', title: 'Makale Güncellendi', desc: 'Kalp Sağlığı Rehberi (Versiyon 2.1)', time: '5 saat önce', color: 'bg-amber-500' },
                { type: 'page', title: 'Statik Sayfa Değişikliği', desc: 'İletişim sayfası harita verileri güncellendi', time: 'Dün', color: 'bg-indigo-500' },
              ].map((activity, idx) => (
                <div key={idx} className="flex items-start group cursor-pointer">
                  <div className={`w-10 h-10 rounded-xl ${activity.color}/10 flex items-center justify-center mr-4 flex-shrink-0 group-hover:scale-110 transition-transform`}>
                    <div className={`w-2 h-2 rounded-full ${activity.color}`}></div>
                  </div>
                  <div className="flex-1 pb-6 border-b border-slate-50 group-last:border-0 group-last:pb-0">
                    <div className="flex justify-between items-start">
                      <h4 className="text-[15px] font-bold text-slate-800 group-hover:text-primary transition-colors">{activity.title}</h4>
                      <span className="text-xs font-bold text-slate-400 uppercase">{activity.time}</span>
                    </div>
                    <p className="text-sm text-slate-500 mt-1">{activity.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </AdminCard>
        </div>

        {/* Sidebar Actions */}
        <div className="space-y-8">
          <AdminCard title="Hızlı İşlemler">
            <div className="grid grid-cols-1 gap-3">
              {[
                { to: '/admin/hospitals', label: 'Hastane Ekle', icon: FaHospital, color: 'text-blue-600' },
                { to: '/admin/departments', label: 'Bölüm Ekle', icon: FaStethoscope, color: 'text-teal-600' },
                { to: '/admin/doctors', label: 'Doktor Ekle', icon: FaUserMd, color: 'text-indigo-600' },
                { to: '/admin/articles', label: 'Makale Ekle', icon: FaNewspaper, color: 'text-amber-600' },
              ].map((action, idx) => (
                <button
                  key={idx}
                  onClick={() => navigate(action.to)}
                  className="flex items-center justify-between p-4 rounded-xl border border-slate-100 bg-white hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-200 group"
                >
                  <div className="flex items-center">
                    <div className={`p-2.5 rounded-lg bg-slate-50 mr-3 group-hover:bg-primary/5 transition-colors`}>
                      <action.icon className={action.color} />
                    </div>
                    <span className="text-sm font-bold text-slate-700">{action.label}</span>
                  </div>
                  <FaChevronRight size={10} className="text-slate-300 group-hover:text-primary" />
                </button>
              ))}
            </div>
          </AdminCard>

          <div className="bg-primary rounded-3xl p-8 text-white relative overflow-hidden shadow-2xl shadow-primary/30">
            <div className="relative z-10">
              <h3 className="text-xl font-bold mb-2">Destek Hattı</h3>
              <p className="text-white/70 text-sm mb-6 leading-relaxed">Sistem ile ilgili bir sorun mu yaşıyorsunuz? Teknik ekibimiz yanınızda.</p>
              <button className="w-full bg-white text-primary font-bold py-3 rounded-xl hover:bg-slate-50 transition-colors shadow-lg">
                Talep Oluştur
              </button>
            </div>
            {/* Background pattern */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-black/10 rounded-full -ml-12 -mb-12 blur-2xl"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

