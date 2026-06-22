import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';

const TestNewPage = () => {
  const { t } = useTranslation();
  console.log('🎯 TestNewPage component rendered!');

  return (
    <>
      <Helmet>
        <title>{t('testNew.pageTitle', 'Test Sayfası - Anadolu Hastaneleri')}</title>
      </Helmet>

      <div className="min-h-screen bg-gray-50 py-20 pt-32">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl font-bold text-primary mb-6">
              {t('testNew.heading', '🎉 Test Sayfası Çalışıyor!')}
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              {t('testNew.description', 'Bu sayfa başarıyla oluşturuldu ve görüntüleniyor.')}
            </p>
            
            <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-semibold text-primary mb-4">
                {t('testNew.newPages', 'Yeni Oluşturulan Sayfalar')}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-blue-800 mb-2">Kalite Belgeleri</h3>
                  <a 
                    href="/hakkimizda/kalite-belgeleri" 
                    className="text-blue-600 hover:underline"
                  >
                    /hakkimizda/kalite-belgeleri
                  </a>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-green-800 mb-2">Sağlık Videoları</h3>
                  <a 
                    href="/saglik-rehberi/videolar" 
                    className="text-green-600 hover:underline"
                  >
                    /saglik-rehberi/videolar
                  </a>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-purple-800 mb-2">Hasta Bilgilendirme</h3>
                  <a 
                    href="/saglik-rehberi/hasta-bilgilendirme" 
                    className="text-purple-600 hover:underline"
                  >
                    /saglik-rehberi/hasta-bilgilendirme
                  </a>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-semibold text-primary mb-4">
                {t('testNew.adminLinks', 'Admin Panel Linkleri')}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-red-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-red-800 mb-2">Admin Giriş</h3>
                  <a 
                    href="/admin/login" 
                    className="text-red-600 hover:underline"
                  >
                    /admin/login
                  </a>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-yellow-800 mb-2">Bağlantı Testi</h3>
                  <a 
                    href="/admin/test-connection" 
                    className="text-yellow-600 hover:underline"
                  >
                    /admin/test-connection
                  </a>
                </div>
              </div>
            </div>
            
            <div className="mt-8 text-sm text-gray-500">
              <p>{t('testNew.date', 'Tarih:')} {new Date().toLocaleString('tr-TR')}</p>
              <p>{t('testNew.server', 'Server: Vite Development Server')}</p>
              <p>{t('testNew.port', 'Port:')} 3001</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default TestNewPage;
