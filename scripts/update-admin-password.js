// Super Admin şifre güncelleme scripti
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

async function updateSuperAdminPassword() {
  try {
    console.log('Super Admin şifresi güncelleniyor...');

    const userEmail = 'sagliktruizmi34@gmail.com';
    const newPassword = 'SuperAdmin2024!';

    // Kullanıcı ID'sini doğrudan kullan (önceden bilinen)
    const userId = '1a537923-d86c-442a-b83c-252124135347';
    console.log('Kullanıcı ID:', userId);

    // Admin API ile şifreyi güncelle
    const { data: updateData, error: updateError } = await supabase.auth.admin.updateUserById(
      userId,
      {
        password: newPassword,
        email_confirm: true
      }
    );

    if (updateError) {
      console.error('Şifre güncelleme hatası:', updateError);
      return;
    }

    console.log('✅ Super Admin şifresi başarıyla güncellendi!');
    console.log('📧 E-posta:', userEmail);
    console.log('🔑 Yeni Şifre:', newPassword);
    console.log('👑 Rol: super_admin');
    console.log('🌐 Giriş URL: http://localhost:3001/admin/login');

  } catch (error) {
    console.error('Genel hata:', error);
  }
}

// Script'i çalıştır
updateSuperAdminPassword();
