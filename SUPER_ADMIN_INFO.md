# 👑 Super Admin Bilgileri

## 🔐 Giriş Bilgileri

### Super Admin Hesabı
- **📧 E-posta:** `sagliktruizmi34@gmail.com`
- **🔑 Önerilen Şifre:** `SuperAdmin2024!`
- **👑 Rol:** `super_admin`
- **🆔 User ID:** `1a537923-d86c-442a-b83c-252124135347`

### Admin Panel Erişimi
- **🌐 Login URL:** `http://localhost:3001/admin/login`
- **🌐 Dashboard URL:** `http://localhost:3001/admin`

## ✅ Doğrulama Durumu

### Supabase Bağlantısı
- ✅ **Proje:** cfwwcxqpyxktikizjjxx (ACTIVE_HEALTHY)
- ✅ **Database:** PostgreSQL 15.8.1.099
- ✅ **Tablolar:** 14 tablo oluşturulmuş
- ✅ **Auth Sistemi:** Çalışıyor

### Kullanıcı Durumu
- ✅ **Auth User:** Mevcut ve doğrulanmış
- ✅ **Profile:** Super admin olarak ayarlanmış
- ✅ **E-posta:** Doğrulanmış (2025-05-12)
- ✅ **Son Giriş:** 2025-05-13

## 🔧 Şifre Güncelleme

### Yöntem 1: Supabase Dashboard (Önerilen)
1. **Dashboard'a Git:** https://supabase.com/dashboard/project/cfwwcxqpyxktikizjjxx/auth/users
2. **Kullanıcıyı Bul:** `sagliktruizmi34@gmail.com`
3. **Şifre Güncelle:** `SuperAdmin2024!`

### Yöntem 2: SQL Editor
```sql
-- Supabase Dashboard > SQL Editor'da çalıştırın
UPDATE auth.users 
SET encrypted_password = crypt('SuperAdmin2024!', gen_salt('bf'))
WHERE email = 'sagliktruizmi34@gmail.com';
```

### Yöntem 3: Password Reset
1. Login sayfasında "Forgot Password" kullanın
2. E-posta ile reset linki alın
3. Yeni şifre belirleyin

## 👑 Super Admin Yetkileri

### Tam Erişim
- ✅ **Dashboard:** Sistem istatistikleri
- ✅ **Hastaneler:** CRUD işlemleri
- ✅ **Bölümler:** CRUD işlemleri
- ✅ **Doktorlar:** CRUD işlemleri
- ✅ **Makaleler:** CRUD işlemleri
- ✅ **Kullanıcılar:** CRUD işlemleri
- ✅ **Site Ayarları:** Tam kontrol
- ✅ **Admin Yönetimi:** Diğer adminleri yönetme

### Güvenlik Özellikleri
- ✅ **RLS Policies:** Row Level Security aktif
- ✅ **JWT Authentication:** Token tabanlı güvenlik
- ✅ **Role-based Access:** Rol tabanlı erişim kontrolü
- ✅ **Protected Routes:** Korumalı sayfa erişimi

## 🚀 Hızlı Test

### Giriş Testi
1. `http://localhost:3001/admin/login` sayfasına git
2. E-posta: `sagliktruizmi34@gmail.com`
3. Şifre: `SuperAdmin2024!` (güncellendikten sonra)
4. "Giriş Yap" butonuna tıkla
5. Dashboard'a yönlendirilmelisin

### Yetki Testi
- Dashboard'da tüm modüllerin görünür olması
- Sidebar'da tüm menü öğelerinin aktif olması
- "Super Admin" rolünün görüntülenmesi

## 🔍 Sorun Giderme

### Giriş Yapamıyorum
1. **E-posta doğru mu?** `sagliktruizmi34@gmail.com`
2. **Şifre güncel mi?** Supabase Dashboard'dan kontrol et
3. **E-posta doğrulandı mı?** Auth users tablosunda kontrol et
4. **Profil var mı?** Profiles tablosunda super_admin rolü var mı

### Admin Paneline Erişemiyorum
1. **Giriş başarılı mı?** Console'da hata var mı
2. **Rol doğru mu?** Profile'da super_admin rolü var mı
3. **Route koruması çalışıyor mu?** AdminRoute component'i kontrol et

### Database Bağlantı Sorunu
1. **Supabase URL doğru mu?** .env dosyasını kontrol et
2. **API Key geçerli mi?** Supabase Dashboard'dan kontrol et
3. **Proje aktif mi?** Proje durumunu kontrol et

## 📞 Destek

### Geliştirme Ortamı
- **Development Server:** `npm run dev`
- **Port:** 3001 (3000 kullanımdaysa)
- **Hot Reload:** Aktif

### Üretim Ortamı
- Güçlü şifre kullan
- 2FA aktif et
- Regular backup al
- Audit log'ları kontrol et

---

**Son Güncelleme:** 2025-06-10
**Durum:** ✅ Super Admin aktif ve hazır
