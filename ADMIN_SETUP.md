# 🔐 Admin Panel Kurulum Rehberi

## Admin Giriş Bilgileri

### Giriş Sayfası
- **URL:** `http://localhost:5173/admin/login`
- **E-posta:** `bekir.filizdag@anadoluhastaneleri.com`
- **Şifre:** `Admin123!@#`

### Admin Dashboard
- **URL:** `http://localhost:5173/admin`

## Admin Kullanıcısı Oluşturma

### Yöntem 1: Supabase Dashboard (Önerilen)

1. **Supabase Dashboard'a Giriş**
   - URL: https://supabase.com/dashboard/project/cfwwcxqpyxktikizjjxx
   - Supabase hesabınızla giriş yapın

2. **Kullanıcı Oluşturma**
   - Sol menüden "Authentication" > "Users" seçin
   - "Add user" butonuna tıklayın
   - Bilgileri girin:
     ```
     Email: bekir.filizdag@anadoluhastaneleri.com
     Password: Admin123!@#
     Auto Confirm User: ✅ (işaretleyin)
     ```

3. **Profil Oluşturma**
   - Sol menüden "SQL Editor" seçin
   - Şu SQL'i çalıştırın:
   ```sql
   INSERT INTO profiles (id, full_name, email, role, created_at, updated_at) 
   VALUES (
     (SELECT id FROM auth.users WHERE email = 'bekir.filizdag@anadoluhastaneleri.com'),
     'Site Yöneticisi',
     'bekir.filizdag@anadoluhastaneleri.com',
     'admin',
     NOW(),
     NOW()
   );
   ```

### Yöntem 2: Geliştirme Ortamında

1. **Geçici Admin Bypass (Sadece Geliştirme)**
   - `src/routes/AdminRoute.tsx` dosyasında geçici olarak admin kontrolünü bypass edebilirsiniz
   - **ÜRETİMDE ASLA KULLANMAYIN!**

2. **Normal Kullanıcı Olarak Kayıt**
   - Normal kayıt formunu kullanarak kayıt olun
   - Supabase Dashboard'dan kullanıcının role'ünü 'admin' olarak değiştirin

## Admin Panel Özellikleri

### Dashboard
- Sistem istatistikleri
- Hızlı erişim menüleri
- Genel bakış

### Yönetim Modülleri
- **Hastaneler:** Hastane ekleme, düzenleme, silme
- **Bölümler:** Tıbbi bölüm yönetimi
- **Doktorlar:** Doktor profilleri yönetimi
- **Makaleler:** Sağlık makaleleri yönetimi
- **Kullanıcılar:** Kullanıcı yönetimi
- **Ayarlar:** Site ayarları

### Güvenlik
- Role-based access control (RBAC)
- Supabase Row Level Security (RLS)
- JWT token authentication

## Sorun Giderme

### Admin Girişi Yapamıyorum
1. E-posta (`bekir.filizdag@anadoluhastaneleri.com`) ve şifrenin doğru olduğundan emin olun
2. Kullanıcının `profiles` tablosunda `role = 'admin'` olduğunu kontrol edin
3. Supabase Dashboard'dan kullanıcının "Email Confirmed" olduğunu kontrol edin

### Admin Paneline Erişemiyorum
1. Giriş yaptıktan sonra `/admin` URL'ine gidin
2. Browser console'da hata mesajları kontrol edin
3. Network tab'da API çağrılarını kontrol edin

### Profil Oluşturulamıyor
1. Auth kullanıcısının başarıyla oluşturulduğunu kontrol edin (`bekir.filizdag@anadoluhastaneleri.com` için).
2. Foreign key constraint hatası alıyorsanız, auth.users tablosunda kullanıcının var olduğundan emin olun

## Güvenlik Notları

⚠️ **ÖNEMLİ GÜVENLİK UYARILARI:**

1. **Üretim Ortamında:**
   - Güçlü şifre kullanın
   - Admin e-posta adresini değiştirin
   - 2FA (Two-Factor Authentication) aktif edin

2. **Geliştirme Ortamında:**
   - Service role key'i asla client-side kodda kullanmayın
   - .env dosyasını git'e commit etmeyin
   - Test verilerini üretim ortamında kullanmayın

3. **Database Güvenliği:**
   - RLS politikalarını kontrol edin
   - Admin tabloları için uygun izinler ayarlayın
   - Audit log'ları aktif edin

## İletişim

Herhangi bir sorun yaşarsanız:
- Supabase Dashboard logs'ları kontrol edin
- Browser developer tools'u kullanın
- Database query'lerini SQL Editor'da test edin
