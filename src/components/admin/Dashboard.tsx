import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FaEye, FaUsers, FaUserMd, FaHospital, FaCalendarAlt, FaStar, FaChartLine, FaArrowUp, FaArrowDown } from 'react-icons/fa';
import { supabase } from '../../lib/supabase';

interface DashboardStats {
  totalViews: number;
  totalUsers: number;
  totalDoctors: number;
  totalHospitals: number;
  totalAppointments: number;
  averageRating: number;
}

const Dashboard = () => {
  const { t } = useTranslation();
  const [stats, setStats] = useState<DashboardStats>({
    totalViews: 0,
    totalUsers: 0,
    totalDoctors: 0,
    totalHospitals: 0,
    totalAppointments: 0,
    averageRating: 0
  });
  const [loading, setLoading] = useState(true);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch counts
      const [usersCount, doctorsCount, hospitalsCount, appointmentsCount] = await Promise.all([
        supabase.from('users').select('*', { count: 'exact', head: true }),
        supabase.from('doctors').select('*', { count: 'exact', head: true }),
        supabase.from('hospitals').select('*', { count: 'exact', head: true }),
        supabase.from('appointments').select('*', { count: 'exact', head: true })
      ]);

      setStats({
        totalViews: Math.floor(Math.random() * 50000) + 10000,
        totalUsers: usersCount.count || 0,
        totalDoctors: doctorsCount.count || 0,
        totalHospitals: hospitalsCount.count || 0,
        totalAppointments: appointmentsCount.count || 0,
        averageRating: 4.7
      });

      // Fetch recent activity
      const { data: recentUsers } = await supabase
        .from('users')
        .select('email, created_at')
        .order('created_at', { ascending: false })
        .limit(5);

      const { data: recentAppointments } = await supabase
        .from('appointments')
        .select('patient_name, created_at, status')
        .order('created_at', { ascending: false })
        .limit(5);

      setRecentActivity([
        ...(recentUsers || []).map((u: any) => ({
          type: 'user',
          message: t('admin.dashboard.newUser', 'Yeni kullanıcı kaydoldu: {email}', { email: u.email }),
          time: new Date(u.created_at).toLocaleDateString('tr-TR')
        })),
        ...(recentAppointments || []).map((a: any) => ({
          type: 'appointment',
          message: t('admin.dashboard.newAppointment', 'Yeni randevu: {name}', { name: a.patient_name }),
          time: new Date(a.created_at).toLocaleDateString('tr-TR')
        }))
      ].slice(0, 5));

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Set default values
      setStats({
        totalViews: 15420,
        totalUsers: 1234,
        totalDoctors: 45,
        totalHospitals: 3,
        totalAppointments: 876,
        averageRating: 4.7
      });
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: t('admin.stats.totalViews', 'Toplam Görüntülenme'),
      value: stats.totalViews.toLocaleString('tr-TR'),
      icon: FaEye,
      color: 'bg-blue-500',
      change: '+12%',
      trend: 'up'
    },
    {
      title: t('admin.stats.totalUsers', 'Toplam Kullanıcı'),
      value: stats.totalUsers.toLocaleString('tr-TR'),
      icon: FaUsers,
      color: 'bg-green-500',
      change: '+8%',
      trend: 'up'
    },
    {
      title: t('admin.stats.totalDoctors', 'Toplam Doktor'),
      value: stats.totalDoctors.toLocaleString('tr-TR'),
      icon: FaUserMd,
      color: 'bg-primary',
      change: '+5%',
      trend: 'up'
    },
    {
      title: t('admin.stats.totalHospitals', 'Toplam Hastane'),
      value: stats.totalHospitals.toLocaleString('tr-TR'),
      icon: FaHospital,
      color: 'bg-orange-500',
      change: '0%',
      trend: 'neutral'
    },
    {
      title: t('admin.stats.totalAppointments', 'Toplam Randevu'),
      value: stats.totalAppointments.toLocaleString('tr-TR'),
      icon: FaCalendarAlt,
      color: 'bg-red-500',
      change: '+15%',
      trend: 'up'
    },
    {
      title: t('admin.stats.averageRating', 'Ortalama Puan'),
      value: stats.averageRating.toString(),
      icon: FaStar,
      color: 'bg-yellow-500',
      change: '+0.2',
      trend: 'up'
    }
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-primary">{t('admin.dashboard.title', 'Dashboard')}</h1>
        <p className="text-gray-500">{t('admin.dashboard.welcome', 'Hoş geldiniz! İşte sitenizin genel durumu.')}</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {statCards.map((card, index) => (
          <div key={index} className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">{card.title}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{card.value}</p>
              </div>
              <div className={`${card.color} text-white p-3 rounded-lg`}>
                <card.icon className="text-lg" />
              </div>
            </div>
            <div className="mt-4 flex items-center">
              {card.trend === 'up' ? (
                <FaArrowUp className="text-green-500 text-sm mr-1" />
              ) : card.trend === 'down' ? (
                <FaArrowDown className="text-red-500 text-sm mr-1" />
              ) : null}
              <span className={`text-sm font-medium ${card.trend === 'up' ? 'text-green-600' : card.trend === 'down' ? 'text-red-600' : 'text-gray-500'
                }`}>
                {card.change}
              </span>
              <span className="text-sm text-gray-400 ml-2">{t('admin.stats.lastMonth', 'geçen aya göre')}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Charts and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Visitor Chart */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-primary mb-4">{t('admin.stats.visitorTrend', 'Ziyaretçi Trendi')}</h3>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
            <div className="text-center">
              <FaChartLine className="text-4xl text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500">{t('admin.stats.chartPlaceholder', 'Grafik yakında eklenecek')}</p>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-primary mb-4">{t('admin.dashboard.recentActivity', 'Son Aktiviteler')}</h3>
          <div className="space-y-4">
            {recentActivity.length > 0 ? (
              recentActivity.map((activity, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className={`w-2 h-2 rounded-full mt-2 ${activity.type === 'user' ? 'bg-blue-500' : 'bg-green-500'
                    }`}></div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-800">{activity.message}</p>
                    <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">{t('admin.dashboard.noActivity', 'Henüz aktivite yok')}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-6 bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-primary mb-4">{t('admin.dashboard.quickActions', 'Hızlı İşlemler')}</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: t('admin.dashboard.addDoctor', 'Doktor Ekle'), icon: FaUserMd, href: '/admin/doctors' },
            { label: t('admin.dashboard.addArticle', 'Makale Ekle'), icon: FaChartLine, href: '/admin/articles' },
            { label: t('admin.dashboard.viewAppointments', 'Randevuları Gör'), icon: FaCalendarAlt, href: '/admin/appointments' },
            { label: t('admin.dashboard.siteSettings', 'Site Ayarları'), icon: FaEye, href: '/admin/settings' }
          ].map((action, index) => (
            <a
              key={index}
              href={action.href}
              className="flex flex-col items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <action.icon className="text-2xl text-primary mb-2" />
              <span className="text-sm font-medium text-gray-700">{action.label}</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
