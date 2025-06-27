import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Navigate } from 'react-router-dom';
import { useSupabase } from '../contexts/SupabaseContext';
import UserProfileForm from '../components/profile/UserProfileForm';
import UserAppointments from '../components/profile/UserAppointments';

const ProfilePage = () => {
  const { user, signOut, loading } = useSupabase();
  const [activeTab, setActiveTab] = useState('profile');

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" />;
  }

  return (
    <>
      <Helmet>
        <title>Profilim | Anadolu Hastaneleri Grubu</title>
        <meta name="description" content="Anadolu Hastaneleri Grubu kullanıcı profil sayfası. Profil bilgilerinizi güncelleyin ve randevularınızı görüntüleyin." />
      </Helmet>

      <div className="pt-24 pb-12">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="card p-6 mb-6">
                <div className="flex flex-col items-center">
                  <div className="w-24 h-24 rounded-full overflow-hidden mb-4 bg-neutral">
                    {user.user_metadata?.avatar_url ? (
                      <img
                        src={user.user_metadata.avatar_url}
                        alt="Avatar"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary">
                        <i className="bi bi-person-fill text-4xl"></i>
                      </div>
                    )}
                  </div>
                  <h2 className="text-xl font-semibold text-primary mb-1">
                    {user.user_metadata?.full_name || 'Kullanıcı'}
                  </h2>
                  <p className="text-text-light text-sm mb-4">{user.email}</p>
                  <button
                    onClick={() => signOut()}
                    className="btn btn-outline w-full"
                  >
                    Çıkış Yap
                  </button>
                </div>
              </div>

              <div className="card overflow-hidden">
                <button
                  className={`w-full py-3 px-6 text-left font-medium transition-colors ${
                    activeTab === 'profile'
                      ? 'bg-primary text-white'
                      : 'hover:bg-neutral'
                  }`}
                  onClick={() => setActiveTab('profile')}
                >
                  <i className="bi bi-person mr-2"></i> Profil Bilgilerim
                </button>
                <button
                  className={`w-full py-3 px-6 text-left font-medium transition-colors ${
                    activeTab === 'appointments'
                      ? 'bg-primary text-white'
                      : 'hover:bg-neutral'
                  }`}
                  onClick={() => setActiveTab('appointments')}
                >
                  <i className="bi bi-calendar-check mr-2"></i> Randevularım
                </button>
                <a
                  href="https://anadoluhastaneleri.kendineiyibak.app/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 px-6 text-left font-medium transition-colors hover:bg-neutral flex items-center"
                >
                  <i className="bi bi-calendar-plus mr-2"></i> Randevu Al
                  <i className="bi bi-box-arrow-up-right ml-auto text-xs"></i>
                </a>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              {activeTab === 'profile' && <UserProfileForm />}
              {activeTab === 'appointments' && <UserAppointments />}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProfilePage;
