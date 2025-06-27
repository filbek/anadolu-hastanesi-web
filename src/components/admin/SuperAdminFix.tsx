import { useState } from 'react';
import { supabaseNew as supabase } from '../../lib/supabase-new';

const SuperAdminFix = () => {
  const [isFixing, setIsFixing] = useState(false);
  const [message, setMessage] = useState('');

  const fixSuperAdmin = async () => {
    setIsFixing(true);
    setMessage('');

    try {
      // 1. Create/Update super admin user
      console.log('🔧 Creating super admin user...');
      
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: 'sagliktruizmi34@gmail.com',
        password: 'SuperAdmin2024!',
        options: {
          data: {
            full_name: 'Super Admin'
          }
        }
      });

      if (signUpError && !signUpError.message.includes('already registered')) {
        throw signUpError;
      }

      // 2. Get or create user ID
      let userId = signUpData?.user?.id;
      
      if (!userId) {
        // Try to get existing user
        const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
        if (listError) throw listError;
        
        const existingUser = users.find(u => u.email === 'sagliktruizmi34@gmail.com');
        if (existingUser) {
          userId = existingUser.id;
        }
      }

      if (!userId) {
        throw new Error('Could not get user ID');
      }

      // 3. Create/Update profile
      console.log('🔧 Creating/updating super admin profile...');
      
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: userId,
          email: 'sagliktruizmi34@gmail.com',
          full_name: 'Super Admin',
          role: 'super_admin'
        });

      if (profileError) {
        console.error('Profile error:', profileError);
        // Try insert instead
        const { error: insertError } = await supabase
          .from('profiles')
          .insert({
            id: userId,
            email: 'sagliktruizmi34@gmail.com',
            full_name: 'Super Admin',
            role: 'super_admin'
          });
        
        if (insertError && !insertError.message.includes('duplicate')) {
          throw insertError;
        }
      }

      // 4. Update user password (if possible)
      try {
        await supabase.auth.admin.updateUserById(userId, {
          password: 'SuperAdmin2024!',
          email_confirm: true
        });
      } catch (pwError) {
        console.log('Password update failed (expected in client):', pwError);
      }

      setMessage('✅ Super Admin hesabı düzeltildi!\n\nGiriş Bilgileri:\nE-posta: sagliktruizmi34@gmail.com\nŞifre: SuperAdmin2024!');
      
    } catch (error: any) {
      console.error('Super admin fix error:', error);
      setMessage(`❌ Hata: ${error.message}`);
    } finally {
      setIsFixing(false);
    }
  };

  const testSuperAdminLogin = async () => {
    setIsFixing(true);
    setMessage('');

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: 'sagliktruizmi34@gmail.com',
        password: 'SuperAdmin2024!'
      });

      if (error) {
        setMessage(`❌ Giriş başarısız: ${error.message}`);
      } else {
        setMessage(`✅ Giriş başarılı! User ID: ${data.user?.id}`);
        
        // Sign out immediately
        await supabase.auth.signOut();
      }
    } catch (error: any) {
      setMessage(`❌ Test hatası: ${error.message}`);
    } finally {
      setIsFixing(false);
    }
  };

  // Only show in development
  if (import.meta.env.PROD) {
    return null;
  }

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
      <h3 className="text-lg font-semibold text-yellow-800 mb-3">
        🔧 Super Admin Düzeltme Aracı
      </h3>
      
      <div className="space-y-3">
        <button
          onClick={fixSuperAdmin}
          disabled={isFixing}
          className="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700 disabled:opacity-50 mr-3"
        >
          {isFixing ? 'Düzeltiliyor...' : 'Super Admin Hesabını Düzelt'}
        </button>

        <button
          onClick={testSuperAdminLogin}
          disabled={isFixing}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {isFixing ? 'Test Ediliyor...' : 'Super Admin Girişini Test Et'}
        </button>
      </div>

      {message && (
        <div className="mt-4 p-3 bg-white rounded border">
          <pre className="text-sm whitespace-pre-wrap">{message}</pre>
        </div>
      )}

      <div className="mt-4 text-sm text-yellow-700">
        <p><strong>Mevcut Çalışan Admin:</strong></p>
        <p>E-posta: admin@anadoluhastaneleri.com</p>
        <p>Şifre: Admin123!@#</p>
      </div>
    </div>
  );
};

export default SuperAdminFix;
