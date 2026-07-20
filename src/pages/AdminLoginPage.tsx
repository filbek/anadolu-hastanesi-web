import { useState, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useSupabase } from '../contexts/SupabaseContext';
import { FaEye, FaEyeSlash, FaLock, FaUser } from 'react-icons/fa';


const AdminLoginPage = () => {
  const { t } = useTranslation();
  const { signIn, user, userProfile, loading } = useSupabase();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Listen for user changes and redirect if admin
  useEffect(() => {
    if (!loading && user && userProfile) {
      if (userProfile.role === 'admin' || userProfile.role === 'super_admin') {
        navigate('/admin');
      } else {
        setError(t('login.errorNotAuthorized', 'Bu hesabın yönetim paneline erişim yetkisi yok.'));
      }
    }
  }, [user, userProfile, loading, navigate, t]);

  // If user is already logged in and is admin, redirect to admin dashboard
  if (!loading && user && userProfile && (userProfile.role === 'admin' || userProfile.role === 'super_admin')) {
    return <Navigate to="/admin" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const { error } = await signIn(formData);

      if (error) {
        setError(t('login.errorInvalid', 'Giriş bilgileri hatalı. Lütfen tekrar deneyin.'));
      }
      // Başarılı girişte yönlendirme, profil rolü veritabanından
      // yüklendikten sonra yukarıdaki useEffect ile yapılır
    } catch (err) {
      setError(t('login.errorGeneric', 'Bir hata oluştu. Lütfen tekrar deneyin.'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10">
      <div className="max-w-md w-full mx-4">
        {/* Development Tools */}


        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaLock className="text-primary text-2xl" />
            </div>
            <h1 className="text-2xl font-bold text-text mb-2">{t('login.adminTitle', 'Admin Girişi')}</h1>
            <p className="text-text-light">{t('login.adminSubtitle', 'Anadolu Hastaneleri Grubu Yönetim Paneli')}</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-text mb-2">
                {t('login.emailLabel', 'E-posta Adresi')}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaUser className="h-5 w-5 text-text-light" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder={t('login.emailPlaceholder', 'ornek@eposta.com')}
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-text mb-2">
                {t('login.passwordLabel', 'Şifre')}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaLock className="h-5 w-5 text-text-light" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder={t('login.passwordPlaceholder', '••••••••')}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <FaEyeSlash className="h-5 w-5 text-text-light hover:text-text" />
                  ) : (
                    <FaEye className="h-5 w-5 text-text-light hover:text-text" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary hover:bg-primary-dark text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  {t('login.loggingIn', 'Giriş yapılıyor...')}
                </div>
              ) : (
                t('login.submitButton', 'Giriş Yap')
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-sm text-text-light">
              {t('footer.copyright', '© 2024 Anadolu Hastaneleri Grubu')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage;
