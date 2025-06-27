import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaHospital, FaStethoscope, FaUserMd, FaNewspaper, FaUsers, FaEye, FaCalendarCheck } from 'react-icons/fa';
import { supabaseNew as supabase } from '../../lib/supabase-new';

const Dashboard = () => {
  const [stats, setStats] = useState({
    hospitals: 0,
    departments: 0,
    doctors: 0,
    articles: 0,
    users: 0,
    appointments: 0,
    pageViews: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      
      try {
        // Fetch hospital count
        const { count: hospitalCount, error: hospitalError } = await supabase
          .from('hospitals')
          .select('*', { count: 'exact', head: true });
          
        // Fetch department count
        const { count: departmentCount, error: departmentError } = await supabase
          .from('departments')
          .select('*', { count: 'exact', head: true });
          
        // Fetch doctor count
        const { count: doctorCount, error: doctorError } = await supabase
          .from('doctors')
          .select('*', { count: 'exact', head: true });
          
        // Fetch article count
        const { count: articleCount, error: articleError } = await supabase
          .from('health_articles')
          .select('*', { count: 'exact', head: true });
          
        // Fetch user count
        const { count: userCount, error: userError } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true });
        
        setStats({
          hospitals: hospitalCount || 0,
          departments: departmentCount || 0,
          doctors: doctorCount || 0,
          articles: articleCount || 0,
          users: userCount || 0,
          appointments: 0, // Mock data
          pageViews: 0, // Mock data
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchStats();
  }, []);

  const statCards = [
    {
      title: 'Hastaneler',
      value: stats.hospitals,
      icon: <FaHospital className="text-2xl text-primary" />,
      link: '/admin/hospitals',
    },
    {
      title: 'Bölümler',
      value: stats.departments,
      icon: <FaStethoscope className="text-2xl text-primary" />,
      link: '/admin/departments',
    },
    {
      title: 'Doktorlar',
      value: stats.doctors,
      icon: <FaUserMd className="text-2xl text-primary" />,
      link: '/admin/doctors',
    },
    {
      title: 'Makaleler',
      value: stats.articles,
      icon: <FaNewspaper className="text-2xl text-primary" />,
      link: '/admin/articles',
    },
    {
      title: 'Kullanıcılar',
      value: stats.users,
      icon: <FaUsers className="text-2xl text-primary" />,
      link: '/admin/users',
    },

  ];

  return (
    <div>
      <h1 className="text-2xl font-semibold text-primary mb-6">Dashboard</h1>
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {statCards.map((stat, index) => (
              <Link
                key={index}
                to={stat.link}
                className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-text-light text-sm font-medium mb-1">{stat.title}</h2>
                    <p className="text-3xl font-bold text-primary">{stat.value}</p>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    {stat.icon}
                  </div>
                </div>
              </Link>
            ))}
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-primary mb-4">Son Aktiviteler</h2>
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center mr-3 flex-shrink-0">
                    <FaUserMd className="text-green-600 text-sm" />
                  </div>
                  <div>
                    <p className="text-text font-medium">Yeni doktor eklendi</p>
                    <p className="text-text-light text-sm">Doç. Dr. Ayşe Kaya, Nöroloji bölümüne eklendi.</p>
                    <p className="text-text-light text-xs mt-1">2 saat önce</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-3 flex-shrink-0">
                    <FaNewspaper className="text-blue-600 text-sm" />
                  </div>
                  <div>
                    <p className="text-text font-medium">Yeni makale yayınlandı</p>
                    <p className="text-text-light text-sm">Kalp Sağlığınızı Korumak İçin 10 Öneri</p>
                    <p className="text-text-light text-xs mt-1">5 saat önce</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center mr-3 flex-shrink-0">
                    <FaUsers className="text-purple-600 text-sm" />
                  </div>
                  <div>
                    <p className="text-text font-medium">Yeni kullanıcı kaydoldu</p>
                    <p className="text-text-light text-sm">Mehmet Yılmaz sisteme kaydoldu.</p>
                    <p className="text-text-light text-xs mt-1">1 gün önce</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-primary mb-4">Hızlı İşlemler</h2>
              <div className="grid grid-cols-2 gap-4">
                <Link
                  to="/admin/hospitals/new"
                  className="bg-primary/10 hover:bg-primary/20 transition-colors rounded-lg p-4 text-center"
                >
                  <FaHospital className="text-primary text-2xl mx-auto mb-2" />
                  <span className="text-text font-medium">Hastane Ekle</span>
                </Link>
                <Link
                  to="/admin/departments/new"
                  className="bg-primary/10 hover:bg-primary/20 transition-colors rounded-lg p-4 text-center"
                >
                  <FaStethoscope className="text-primary text-2xl mx-auto mb-2" />
                  <span className="text-text font-medium">Bölüm Ekle</span>
                </Link>
                <Link
                  to="/admin/doctors/new"
                  className="bg-primary/10 hover:bg-primary/20 transition-colors rounded-lg p-4 text-center"
                >
                  <FaUserMd className="text-primary text-2xl mx-auto mb-2" />
                  <span className="text-text font-medium">Doktor Ekle</span>
                </Link>
                <Link
                  to="/admin/articles/new"
                  className="bg-primary/10 hover:bg-primary/20 transition-colors rounded-lg p-4 text-center"
                >
                  <FaNewspaper className="text-primary text-2xl mx-auto mb-2" />
                  <span className="text-text font-medium">Makale Ekle</span>
                </Link>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
