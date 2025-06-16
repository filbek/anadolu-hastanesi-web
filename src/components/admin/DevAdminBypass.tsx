import { useState } from 'react';
import { useSupabase } from '../../contexts/SupabaseContext';
import { FaKey, FaUserShield } from 'react-icons/fa';

// ⚠️ SADECE GELİŞTİRME ORTAMI İÇİN!
// ÜRETİMDE ASLA KULLANMAYIN!

const DevAdminBypass = () => {
  const { signUp } = useSupabase();
  const [isCreating, setIsCreating] = useState(false);
  const [message, setMessage] = useState('');

  const createDevAdmin = async () => {
    setIsCreating(true);
    setMessage('');

    try {
      const { error } = await signUp({
        email: 'admin@anadoluhastaneleri.com',
        password: 'Admin123!@#',
        full_name: 'Site Yöneticisi'
      });

      if (error) {
        setMessage(`Hata: ${error.message}`);
      } else {
        setMessage('✅ Admin kullanıcısı oluşturuldu! Şimdi giriş yapabilirsiniz.');
      }
    } catch (err) {
      setMessage('❌ Beklenmeyen bir hata oluştu.');
    } finally {
      setIsCreating(false);
    }
  };

  // Sadece development ortamında göster
  if (import.meta.env.PROD) {
    return null;
  }

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
      <div className="flex items-center mb-4">
        <FaUserShield className="text-yellow-600 text-xl mr-2" />
        <h3 className="text-lg font-semibold text-yellow-800">
          Geliştirme Ortamı - Admin Oluştur
        </h3>
      </div>
      
      <p className="text-yellow-700 mb-4 text-sm">
        ⚠️ Bu özellik sadece geliştirme ortamında görünür. 
        Üretim ortamında admin kullanıcısını Supabase Dashboard'dan oluşturun.
      </p>

      {message && (
        <div className={`p-3 rounded mb-4 text-sm ${
          message.includes('✅') 
            ? 'bg-green-100 text-green-700 border border-green-200' 
            : 'bg-red-100 text-red-700 border border-red-200'
        }`}>
          {message}
        </div>
      )}

      <button
        onClick={createDevAdmin}
        disabled={isCreating}
        className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
      >
        <FaKey className="mr-2" />
        {isCreating ? 'Oluşturuluyor...' : 'Admin Kullanıcısı Oluştur'}
      </button>

      <div className="mt-4 text-sm text-yellow-700">
        <strong>Oluşturulacak Admin Bilgileri:</strong>
        <ul className="list-disc list-inside mt-2">
          <li>E-posta: admin@anadoluhastaneleri.com</li>
          <li>Şifre: Admin123!@#</li>
          <li>Rol: admin</li>
        </ul>
      </div>
    </div>
  );
};

export default DevAdminBypass;
