import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FaCheck, FaTimes, FaRedo, FaDatabase, FaWifi } from 'react-icons/fa';
import { supabase } from '../../lib/supabase';

interface TestResult {
  name: string;
  status: 'success' | 'error' | 'pending';
  message: string;
  details?: string;
  responseTime?: number;
}

const AdminTestConnection = () => {
  const { t } = useTranslation();
  const [results, setResults] = useState<TestResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [overallStatus, setOverallStatus] = useState<'success' | 'error' | 'pending'>('pending');

  const runTests = async () => {
    setLoading(true);
    setResults([]);
    setOverallStatus('pending');

    const tests: TestResult[] = [];

    // Test 1: Basic Supabase Connection
    try {
      const startTime = Date.now();
      const { error } = await supabase.from('hospitals').select('id', { count: 'exact', head: true });
      const responseTime = Date.now() - startTime;

      if (error) {
        tests.push({
          name: t('admin.connection.dbConnection', 'Veritabanı Bağlantısı'),
          status: 'error',
          message: t('admin.connection.dbConnectionFailed', 'Veritabanına bağlanılamadı'),
          details: error.message,
          responseTime
        });
      } else {
        tests.push({
          name: t('admin.connection.dbConnection', 'Veritabanı Bağlantısı'),
          status: 'success',
          message: t('admin.connection.dbConnectionSuccess', 'Veritabanına başarıyla bağlanıldı'),
          responseTime
        });
      }
    } catch (error: any) {
      tests.push({
        name: t('admin.connection.dbConnection', 'Veritabanı Bağlantısı'),
        status: 'error',
        message: t('admin.connection.dbConnectionError', 'Beklenmeyen bir hata oluştu'),
        details: error.message
      });
    }

    // Test 2: Authentication Service
    try {
      const startTime = Date.now();
      const { error } = await supabase.auth.getSession();
      const responseTime = Date.now() - startTime;

      if (error) {
        tests.push({
          name: t('admin.connection.authService', 'Kimlik Doğrulama Servisi'),
          status: 'error',
          message: t('admin.connection.authServiceFailed', 'Kimlik doğrulama servisi çalışmıyor'),
          details: error.message,
          responseTime
        });
      } else {
        tests.push({
          name: t('admin.connection.authService', 'Kimlik Doğrulama Servisi'),
          status: 'success',
          message: t('admin.connection.authServiceSuccess', 'Kimlik doğrulama servisi aktif'),
          responseTime
        });
      }
    } catch (error: any) {
      tests.push({
        name: t('admin.connection.authService', 'Kimlik Doğrulama Servisi'),
        status: 'error',
        message: t('admin.connection.authServiceError', 'Beklenmeyen bir hata oluştu'),
        details: error.message
      });
    }

    // Test 3: API Response Time
    try {
      const startTime = Date.now();
      await supabase.from('departments').select('id', { count: 'exact', head: true });
      const responseTime = Date.now() - startTime;

      tests.push({
        name: t('admin.connection.apiResponseTime', 'API Yanıt Süresi'),
        status: responseTime < 1000 ? 'success' : 'error',
        message: responseTime < 1000
          ? t('admin.connection.apiResponseGood', 'API yanıt süresi iyi')
          : t('admin.connection.apiResponseSlow', 'API yanıt süresi yavaş'),
        details: t('admin.connection.apiResponseDetails', 'Yanıt süresi: {time}ms', { time: responseTime }),
        responseTime
      });
    } catch (error: any) {
      tests.push({
        name: t('admin.connection.apiResponseTime', 'API Yanıt Süresi'),
        status: 'error',
        message: t('admin.connection.apiResponseError', 'API testi başarısız'),
        details: error.message
      });
    }

    // Test 4: Storage Access
    try {
      const startTime = Date.now();
      const { error } = await supabase.storage.getBucket('public');
      const responseTime = Date.now() - startTime;

      if (error) {
        tests.push({
          name: t('admin.connection.storageAccess', 'Depolama Erişimi'),
          status: 'error',
          message: t('admin.connection.storageAccessFailed', 'Depolama alanına erişilemiyor'),
          details: error.message,
          responseTime
        });
      } else {
        tests.push({
          name: t('admin.connection.storageAccess', 'Depolama Erişimi'),
          status: 'success',
          message: t('admin.connection.storageAccessSuccess', 'Depolama alanına erişim başarılı'),
          responseTime
        });
      }
    } catch (error: any) {
      tests.push({
        name: t('admin.connection.storageAccess', 'Depolama Erişimi'),
        status: 'error',
        message: t('admin.connection.storageAccessError', 'Depolama testi başarısız'),
        details: error.message
      });
    }

    // Test 5: Edge Functions (if available)
    try {
      const startTime = Date.now();
      const { error } = await supabase.functions.invoke('test-function', {
        body: { test: true }
      });
      const responseTime = Date.now() - startTime;

      if (error) {
        tests.push({
          name: t('admin.connection.edgeFunctions', 'Edge Fonksiyonları'),
          status: 'error',
          message: t('admin.connection.edgeFunctionsFailed', 'Edge fonksiyonları çalışmıyor veya mevcut değil'),
          details: error.message,
          responseTime
        });
      } else {
        tests.push({
          name: t('admin.connection.edgeFunctions', 'Edge Fonksiyonları'),
          status: 'success',
          message: t('admin.connection.edgeFunctionsSuccess', 'Edge fonksiyonları aktif'),
          responseTime
        });
      }
    } catch (error: any) {
      tests.push({
        name: t('admin.connection.edgeFunctions', 'Edge Fonksiyonları'),
        status: 'error',
        message: t('admin.connection.edgeFunctionsNotAvailable', 'Edge fonksiyonları mevcut değil'),
        details: error.message
      });
    }

    setResults(tests);
    setOverallStatus(tests.every(test => test.status === 'success') ? 'success' : 'error');
    setLoading(false);
  };

  useEffect(() => {
    runTests();
  }, []);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-primary">{t('admin.connection.title', 'Bağlantı Testi')}</h1>
        <button
          onClick={runTests}
          disabled={loading}
          className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors flex items-center disabled:opacity-50"
        >
          <FaRedo className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
          {loading ? t('admin.connection.testing', 'Test ediliyor...') : t('admin.connection.retest', 'Tekrar Test Et')}
        </button>
      </div>

      {/* Overall Status */}
      <div className={`rounded-lg p-6 mb-6 ${overallStatus === 'success'
          ? 'bg-green-50 border border-green-200'
          : overallStatus === 'error'
            ? 'bg-red-50 border border-red-200'
            : 'bg-yellow-50 border border-yellow-200'
        }`}>
        <div className="flex items-center">
          {overallStatus === 'success' ? (
            <FaCheck className="text-green-600 text-2xl mr-3" />
          ) : overallStatus === 'error' ? (
            <FaTimes className="text-red-600 text-2xl mr-3" />
          ) : (
            <FaWifi className="text-yellow-600 text-2xl mr-3 animate-pulse" />
          )}
          <div>
            <h2 className="text-lg font-semibold">
              {overallStatus === 'success'
                ? t('admin.connection.allSystemsOperational', 'Tüm Sistemler Çalışıyor')
                : overallStatus === 'error'
                  ? t('admin.connection.someIssues', 'Bazı Sorunlar Var')
                  : t('admin.connection.testingInProgress', 'Test Devam Ediyor')
              }
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {overallStatus === 'success'
                ? t('admin.connection.allTestsPassed', 'Tüm bağlantı testleri başarıyla tamamlandı')
                : overallStatus === 'error'
                  ? t('admin.connection.someTestsFailed', 'Bazı testler başarısız oldu, lütfen detayları kontrol edin')
                  : t('admin.connection.waitingForTests', 'Bağlantı testleri devam ediyor...')
              }
            </p>
          </div>
        </div>
      </div>

      {/* Test Results */}
      <div className="space-y-4">
        {results.map((result, index) => (
          <div key={index} className={`bg-white rounded-lg shadow-sm p-6 border-l-4 ${result.status === 'success'
              ? 'border-green-500'
              : result.status === 'error'
                ? 'border-red-500'
                : 'border-yellow-500'
            }`}>
            <div className="flex items-start justify-between">
              <div className="flex items-center">
                {result.status === 'success' ? (
                  <FaCheck className="text-green-600 mr-3 mt-1" />
                ) : result.status === 'error' ? (
                  <FaTimes className="text-red-600 mr-3 mt-1" />
                ) : (
                  <FaRedo className="text-yellow-600 mr-3 mt-1 animate-spin" />
                )}
                <div>
                  <h3 className="font-semibold text-gray-900">{result.name}</h3>
                  <p className="text-sm text-gray-600 mt-1">{result.message}</p>
                  {result.details && (
                    <p className="text-sm text-gray-500 mt-1 font-mono">{result.details}</p>
                  )}
                </div>
              </div>
              {result.responseTime !== undefined && (
                <div className="text-right">
                  <span className={`text-sm font-medium ${result.responseTime < 500
                      ? 'text-green-600'
                      : result.responseTime < 1000
                        ? 'text-yellow-600'
                        : 'text-red-600'
                    }`}>
                    {result.responseTime}ms
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Troubleshooting Guide */}
      {overallStatus === 'error' && (
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-800 mb-3">
            <FaDatabase className="inline mr-2" />
            {t('admin.connection.troubleshooting', 'Sorun Giderme')}
          </h3>
          <ul className="space-y-2 text-sm text-blue-700">
            <li>{t('admin.connection.troubleshoot1', '• Supabase projesinin çalışır durumda olduğundan emin olun')}</li>
            <li>{t('admin.connection.troubleshoot2', '• İnternet bağlantınızı kontrol edin')}</li>
            <li>{t('admin.connection.troubleshoot3', '• Tarayıcı konsolundaki hata mesajlarını inceleyin')}</li>
            <li>{t('admin.connection.troubleshoot4', '• Supabase Dashboard\'dan servis durumunu kontrol edin')}</li>
            <li>{t('admin.connection.troubleshoot5', '• Gerekirse sayfayı yenileyin ve tekrar deneyin')}</li>
          </ul>
        </div>
      )}

      {results.length === 0 && !loading && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">🧪</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">{t('admin.connection.noResults', 'Henüz test yapılmadı')}</h3>
          <p className="text-gray-500 mb-4">{t('admin.connection.startTesting', 'Bağlantı testini başlatmak için aşağıdaki butona tıklayın')}</p>
          <button
            onClick={runTests}
            className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary-dark transition-colors inline-flex items-center"
          >
            <FaRedo className="mr-2" />
            {t('admin.connection.startTest', 'Testi Başlat')}
          </button>
        </div>
      )}
    </div>
  );
};

export default AdminTestConnection;
