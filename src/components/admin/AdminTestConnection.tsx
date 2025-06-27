import { useState, useEffect } from 'react';
import { FaCheckCircle, FaTimesCircle, FaSpinner, FaDatabase, FaUser, FaTable } from 'react-icons/fa';
import { supabaseNew as supabase } from '../../lib/supabase-new';

interface TestResult {
  name: string;
  status: 'pending' | 'success' | 'error';
  message: string;
  details?: any;
}

const AdminTestConnection = () => {
  const [tests, setTests] = useState<TestResult[]>([
    { name: 'Supabase Bağlantısı', status: 'pending', message: 'Test bekleniyor...' },
    { name: 'Kimlik Doğrulama', status: 'pending', message: 'Test bekleniyor...' },
    { name: 'Veritabanı Tabloları', status: 'pending', message: 'Test bekleniyor...' },
    { name: 'CRUD İşlemleri', status: 'pending', message: 'Test bekleniyor...' },
    { name: 'RLS Güvenlik', status: 'pending', message: 'Test bekleniyor...' }
  ]);
  const [isRunning, setIsRunning] = useState(false);
  const [overallStatus, setOverallStatus] = useState<'pending' | 'success' | 'error'>('pending');

  const updateTest = (index: number, updates: Partial<TestResult>) => {
    setTests(prev => prev.map((test, i) => i === index ? { ...test, ...updates } : test));
  };

  const runTests = async () => {
    setIsRunning(true);
    setOverallStatus('pending');

    // Test 1: Supabase Bağlantısı
    try {
      updateTest(0, { status: 'pending', message: 'Bağlantı test ediliyor...' });
      
      const { data, error } = await supabase.from('profiles').select('count').limit(1);
      
      if (error) throw error;
      
      updateTest(0, { 
        status: 'success', 
        message: 'Supabase bağlantısı başarılı',
        details: { url: supabase.supabaseUrl }
      });
    } catch (error: any) {
      updateTest(0, { 
        status: 'error', 
        message: `Bağlantı hatası: ${error.message}`,
        details: error
      });
    }

    // Test 2: Kimlik Doğrulama
    try {
      updateTest(1, { status: 'pending', message: 'Kimlik doğrulama test ediliyor...' });
      
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) throw error;
      
      if (session) {
        updateTest(1, { 
          status: 'success', 
          message: 'Kullanıcı oturumu aktif',
          details: { user: session.user.email }
        });
      } else {
        updateTest(1, { 
          status: 'error', 
          message: 'Kullanıcı oturumu bulunamadı'
        });
      }
    } catch (error: any) {
      updateTest(1, { 
        status: 'error', 
        message: `Kimlik doğrulama hatası: ${error.message}`,
        details: error
      });
    }

    // Test 3: Veritabanı Tabloları
    try {
      updateTest(2, { status: 'pending', message: 'Tablolar kontrol ediliyor...' });
      
      const tables = ['hospitals', 'departments', 'doctors', 'health_articles', 'profiles'];
      const tableResults = [];
      
      for (const table of tables) {
        try {
          const { error } = await supabase.from(table).select('*').limit(1);
          if (error) throw error;
          tableResults.push({ table, status: 'success' });
        } catch (error: any) {
          tableResults.push({ table, status: 'error', error: error.message });
        }
      }
      
      const successCount = tableResults.filter(r => r.status === 'success').length;
      
      updateTest(2, { 
        status: successCount === tables.length ? 'success' : 'error',
        message: `${successCount}/${tables.length} tablo erişilebilir`,
        details: tableResults
      });
    } catch (error: any) {
      updateTest(2, { 
        status: 'error', 
        message: `Tablo kontrolü hatası: ${error.message}`,
        details: error
      });
    }

    // Test 4: CRUD İşlemleri
    try {
      updateTest(3, { status: 'pending', message: 'CRUD işlemleri test ediliyor...' });
      
      // Test insert
      const testData = {
        name: 'Test Hospital',
        slug: 'test-hospital-' + Date.now(),
        description: 'Test description',
        address: 'Test address',
        phone: '0212 123 45 67',
        email: 'test@test.com',
        working_hours: '24/7',
        services: ['Test service'],
        image_url: 'https://example.com/test.jpg'
      };
      
      const { data: insertData, error: insertError } = await supabase
        .from('hospitals')
        .insert([testData])
        .select()
        .single();
      
      if (insertError) throw insertError;
      
      // Test update
      const { error: updateError } = await supabase
        .from('hospitals')
        .update({ description: 'Updated test description' })
        .eq('id', insertData.id);
      
      if (updateError) throw updateError;
      
      // Test delete
      const { error: deleteError } = await supabase
        .from('hospitals')
        .delete()
        .eq('id', insertData.id);
      
      if (deleteError) throw deleteError;
      
      updateTest(3, { 
        status: 'success', 
        message: 'CRUD işlemleri başarılı (Create, Read, Update, Delete)',
        details: { testId: insertData.id }
      });
    } catch (error: any) {
      updateTest(3, { 
        status: 'error', 
        message: `CRUD test hatası: ${error.message}`,
        details: error
      });
    }

    // Test 5: RLS Güvenlik
    try {
      updateTest(4, { status: 'pending', message: 'RLS güvenlik kontrol ediliyor...' });
      
      // Test RLS policies
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        // Test profile access
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        
        if (profileError) throw profileError;
        
        updateTest(4, { 
          status: 'success', 
          message: 'RLS güvenlik aktif ve çalışıyor',
          details: { userRole: profileData?.role }
        });
      } else {
        updateTest(4, { 
          status: 'error', 
          message: 'RLS test için oturum gerekli'
        });
      }
    } catch (error: any) {
      updateTest(4, { 
        status: 'error', 
        message: `RLS test hatası: ${error.message}`,
        details: error
      });
    }

    // Overall status
    setTests(currentTests => {
      const hasError = currentTests.some(test => test.status === 'error');
      const allComplete = currentTests.every(test => test.status !== 'pending');
      
      if (allComplete) {
        setOverallStatus(hasError ? 'error' : 'success');
      }
      
      return currentTests;
    });

    setIsRunning(false);
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return <FaCheckCircle className="text-green-500" />;
      case 'error':
        return <FaTimesCircle className="text-red-500" />;
      case 'pending':
        return <FaSpinner className="text-blue-500 animate-spin" />;
    }
  };

  const getOverallStatusColor = () => {
    switch (overallStatus) {
      case 'success':
        return 'bg-green-100 border-green-500 text-green-700';
      case 'error':
        return 'bg-red-100 border-red-500 text-red-700';
      case 'pending':
        return 'bg-blue-100 border-blue-500 text-blue-700';
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-primary">Bağlantı Testi</h1>
        <button
          onClick={runTests}
          disabled={isRunning}
          className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors flex items-center disabled:opacity-50"
        >
          {isRunning ? (
            <>
              <FaSpinner className="mr-2 animate-spin" />
              Test Ediliyor...
            </>
          ) : (
            <>
              <FaDatabase className="mr-2" />
              Testleri Çalıştır
            </>
          )}
        </button>
      </div>

      {/* Overall Status */}
      <div className={`border-l-4 p-4 mb-6 rounded ${getOverallStatusColor()}`}>
        <div className="flex items-center">
          {getStatusIcon(overallStatus)}
          <span className="ml-2 font-medium">
            {overallStatus === 'success' && 'Tüm testler başarılı!'}
            {overallStatus === 'error' && 'Bazı testler başarısız!'}
            {overallStatus === 'pending' && 'Testler bekleniyor...'}
          </span>
        </div>
      </div>

      {/* Test Results */}
      <div className="space-y-4">
        {tests.map((test, index) => (
          <div key={index} className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                {getStatusIcon(test.status)}
                <span className="ml-3">{test.name}</span>
              </h3>
            </div>
            
            <p className="text-gray-600 mb-3">{test.message}</p>
            
            {test.details && (
              <details className="mt-3">
                <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
                  Detayları Göster
                </summary>
                <pre className="mt-2 p-3 bg-gray-50 rounded text-xs overflow-auto">
                  {JSON.stringify(test.details, null, 2)}
                </pre>
              </details>
            )}
          </div>
        ))}
      </div>

      {/* Environment Info */}
      <div className="mt-8 bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Ortam Bilgileri</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <strong>Supabase URL:</strong>
            <br />
            <code className="text-xs bg-white p-1 rounded">{supabase.supabaseUrl}</code>
          </div>
          <div>
            <strong>API Key (İlk 20 karakter):</strong>
            <br />
            <code className="text-xs bg-white p-1 rounded">
              {import.meta.env.VITE_SUPABASE_ANON_KEY?.substring(0, 20)}...
            </code>
          </div>
          <div>
            <strong>Ortam:</strong>
            <br />
            <code className="text-xs bg-white p-1 rounded">
              {import.meta.env.MODE}
            </code>
          </div>
          <div>
            <strong>Zaman:</strong>
            <br />
            <code className="text-xs bg-white p-1 rounded">
              {new Date().toLocaleString('tr-TR')}
            </code>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminTestConnection;
