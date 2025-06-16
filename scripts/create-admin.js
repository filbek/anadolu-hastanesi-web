// Admin kullanıcısı oluşturma scripti
// Bu script'i Node.js ile çalıştırarak admin kullanıcısını oluşturabilirsiniz

import { createClient } from '@supabase/supabase-js';

// Supabase yapılandırması
const supabaseUrl = 'https://qhtuiicjbzyfjylsgyde.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFodHVpaWNqYnp5Zmp5bHNneWRlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MjkwMTMzNiwiZXhwIjoyMDU4NDc3MzM2fQ.FPU4YHb43MnNILq_-DxHvUekF5KX83uXI0xf9_Mm07c';

// Service role ile Supabase client oluştur
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createAdminUser() {
  try {
    console.log('Admin kullanıcısı oluşturuluyor...');

    // Admin kullanıcısını oluştur
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: 'admin@anadoluhastaneleri.com',
      password: 'Admin123!@#',
      email_confirm: true,
      user_metadata: {
        full_name: 'Site Yöneticisi'
      }
    });

    if (authError) {
      console.error('Auth kullanıcısı oluşturma hatası:', authError);
      return;
    }

    console.log('Auth kullanıcısı oluşturuldu:', authData.user.id);

    // Profil tablosuna admin kaydını ekle
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .insert([
        {
          id: authData.user.id,
          full_name: 'Site Yöneticisi',
          email: 'admin@anadoluhastaneleri.com',
          role: 'admin'
        }
      ]);

    if (profileError) {
      console.error('Profil oluşturma hatası:', profileError);
      return;
    }

    console.log('✅ Admin kullanıcısı başarıyla oluşturuldu!');
    console.log('📧 E-posta: admin@anadoluhastaneleri.com');
    console.log('🔑 Şifre: Admin123!@#');
    console.log('🌐 Giriş URL: http://localhost:5173/admin/login');

  } catch (error) {
    console.error('Genel hata:', error);
  }
}

// Script'i çalıştır
createAdminUser();
