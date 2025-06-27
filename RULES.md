# RULES.md – Backend Entegrasyonu ve İçerik Yönetimi Kuralları

## 📌 1. Backend Bağlantısı Doğrulama

### ✅ Gereksinimler
- [x] Supabase URL ve API Key `.env` dosyasında tanımlanmıştır
- [x] `supabaseClient` nesnesi global olarak oluşturulmuş ve import edilebilir durumda
- [x] `supabase.auth.getSession()` ve `supabase.from("table_name").select()` test sorguları çalışır
- [x] Bağlantı testi sayfası: `/admin/test-connection` oluşturulmuştur
- [x] Bağlantı başarısız olduğunda admin paneli erişimi kontrol edilir

### 🔧 Teknik Detaylar
```typescript
// Supabase Client: src/lib/supabase-new.ts
export const supabaseNew = createClient(FORCE_CLOUD_URL, FORCE_CLOUD_KEY);

// Environment Variables: .env
VITE_SUPABASE_URL=https://cfwwcxqpyxktikizjjxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

// Test Connection: /admin/test-connection
- Supabase bağlantı testi
- Kimlik doğrulama testi
- Veritabanı tabloları kontrolü
- CRUD işlemleri testi
- RLS güvenlik kontrolü
```

---

## 📌 2. Admin Panel İçerik Yönetimi

### ✅ Ana Menü Entegrasyonu
Tüm frontend menü başlıkları admin paneline entegre edilmiştir:

#### 🏥 Hastanelerimiz
- [x] **Tüm Hastanelerimiz** → `/admin/hospitals`
  - CRUD işlemleri: ✅ Tam entegre
  - Supabase tablosu: `hospitals`
  - Özellikler: Arama, filtreleme, resim yükleme

- [x] **Tarihçe ve Misyon** → `/admin/about`
  - CRUD işlemleri: ✅ Tam entegre
  - Supabase tablosu: `about_content`
  - Özellikler: Misyon, vizyon, değerler, tarihçe

- [x] **Kalite Belgeleri** → `/admin/pages` (Alt sayfa)
  - CRUD işlemleri: ✅ Sayfa yönetimi ile entegre
  - Dinamik sayfa sistemi ile yönetilir

#### 🩺 Bölümlerimiz
- [x] **Tüm Bölümler** → `/admin/departments`
  - CRUD işlemleri: ✅ Tam entegre
  - Supabase tablosu: `departments`
  - Özellikler: Kategori filtreleme, doktor ilişkilendirme

- [x] **Cerrahi Birimler** → Kategori filtresi ile
- [x] **Dahili Birimler** → Kategori filtresi ile
- [x] **Teşhis Birimleri** → Kategori filtresi ile

#### 👨‍⚕️ Doktorlar
- [x] **Doktor Yönetimi** → `/admin/doctors`
  - CRUD işlemleri: ✅ Tam entegre
  - Supabase tablosu: `doctors`
  - Özellikler: Bölüm ilişkilendirme, uzmanlık alanları

#### 📚 Sağlık Rehberi
- [x] **Makaleler** → `/admin/articles`
  - CRUD işlemleri: ✅ Tam entegre
  - Supabase tablosu: `health_articles`
  - Özellikler: Kategori, etiket, SEO

- [x] **Video İçerikler** → `/admin/video-content`
  - CRUD işlemleri: ✅ Tam entegre
  - YouTube entegrasyonu
  - Kategori ve etiket sistemi

- [x] **Hasta Bilgilendirme** → `/admin/pages` (Alt sayfa)
  - Dinamik sayfa sistemi ile yönetilir

#### 🌍 Sağlık Turizmi
- [x] **Sağlık Turizmi** → `/admin/pages`
  - CRUD işlemleri: ✅ Dinamik sayfa sistemi
  - İçerik editörü ile bölüm bazlı yönetim

#### 📞 İletişim
- [x] **İletişim Bilgileri** → `/admin/contact-info`
  - CRUD işlemleri: ✅ Tam entegre
  - Supabase tablosu: `contact_info`
  - Özellikler: Telefon, e-posta, adres, sosyal medya

### 🗂️ Ek Yönetim Modülleri
- [x] **Kullanıcı Yönetimi** → `/admin/users`
- [x] **Sayfa Yönetimi** → `/admin/pages`
- [x] **Medya Galerisi** → `/admin/media`
- [x] **SEO Ayarları** → `/admin/seo`
- [x] **Site Ayarları** → `/admin/settings`

---

## 📌 3. Güvenlik ve Yetkilendirme

### ✅ Kimlik Doğrulama
- [x] Admin paneline yalnızca `admin` ve `super_admin` rolündeki kullanıcılar erişebilir
- [x] JWT token tabanlı kimlik doğrulama
- [x] Oturum yönetimi ve otomatik yenileme

### 🔒 Yetkilendirme Sistemi
```typescript
// AdminRoute.tsx - Rol tabanlı erişim kontrolü
const isAdmin = user && userProfile && 
  (userProfile.role === 'admin' || userProfile.role === 'super_admin');

// Supabase Context - Kullanıcı profili kontrolü
const { user, userProfile, loading } = useSupabase();
```

### 🛡️ Row Level Security (RLS)
- [x] Supabase RLS kuralları uygulanmıştır
- [x] Kullanıcılar yalnızca yetkili oldukları verilere erişebilir
- [x] Admin ve super_admin rolleri için farklı izinler

### 💾 Veri Güvenliği
- [x] Otomatik yedekleme mekanizması (Supabase built-in)
- [x] Versioning sistemi (`updated_at` alanları)
- [x] Soft delete seçenekleri (gerektiğinde)

---

## 📌 4. Validasyon & Test

### ✅ Form Validasyonu
- [x] Tüm formlarda client-side validasyon
- [x] Required field kontrolü
- [x] Email, URL, telefon format kontrolü
- [x] Karakter limiti kontrolü

### 🧪 Test Sistemi
- [x] **Bağlantı Testi** → `/admin/test-connection`
  - Supabase bağlantı kontrolü
  - Kimlik doğrulama testi
  - Veritabanı tabloları kontrolü
  - CRUD işlemleri testi
  - RLS güvenlik kontrolü

### 📋 Manual Test Listesi

#### ✅ Dashboard Modülü
- [x] İstatistik kartları yükleniyor
- [x] Hızlı erişim linkleri çalışıyor
- [x] Son aktiviteler görüntüleniyor

#### ✅ Hastane Yönetimi
- [x] Hastane listesi yükleniyor
- [x] Yeni hastane ekleme çalışıyor
- [x] Hastane düzenleme çalışıyor
- [x] Hastane silme çalışıyor
- [x] Arama ve filtreleme çalışıyor

#### ✅ Bölüm Yönetimi
- [x] Bölüm listesi yükleniyor
- [x] Kategori filtreleme çalışıyor
- [x] CRUD işlemleri çalışıyor

#### ✅ Doktor Yönetimi
- [x] Doktor listesi yükleniyor
- [x] Bölüm ilişkilendirme çalışıyor
- [x] CRUD işlemleri çalışıyor

#### ✅ Makale Yönetimi
- [x] Makale listesi yükleniyor
- [x] Kategori ve etiket sistemi çalışıyor
- [x] SEO alanları çalışıyor
- [x] CRUD işlemleri çalışıyor

#### ✅ Kullanıcı Yönetimi
- [x] Kullanıcı listesi yükleniyor
- [x] Rol güncelleme çalışıyor
- [x] Kullanıcı silme çalışıyor

#### ✅ Sayfa Yönetimi
- [x] Sayfa listesi yükleniyor
- [x] İçerik editörü çalışıyor
- [x] Bölüm bazlı düzenleme çalışıyor
- [x] Önizleme modu çalışıyor

#### ✅ İletişim Bilgileri
- [x] İletişim formu yükleniyor
- [x] Sosyal medya linkleri çalışıyor
- [x] Güncelleme işlemi çalışıyor

#### ✅ SEO Ayarları
- [x] SEO form alanları çalışıyor
- [x] Meta tag önizlemesi çalışıyor
- [x] Analytics entegrasyonu hazır

---

## 📌 5. Veritabanı Şeması

### 🗄️ Mevcut Tablolar
```sql
-- Ana tablolar
hospitals (id, name, slug, description, address, phone, email, ...)
departments (id, name, slug, description, category, hospital_id, ...)
doctors (id, name, slug, title, specialization, department_id, ...)
health_articles (id, title, slug, content, category, tags, ...)
profiles (id, email, full_name, role, avatar_url, ...)

-- İçerik yönetimi tabloları
pages (id, title, slug, content, hero_title, meta_title, ...)
page_contents (id, page_slug, sections, ...)
contact_info (id, main_phone, email, address, social_media, ...)
about_content (id, mission, vision, values, history, ...)
seo_settings (id, site_title, meta_description, og_tags, ...)
```

### 🔗 İlişkiler
- `doctors.department_id` → `departments.id`
- `departments.hospital_id` → `hospitals.id`
- `page_contents.page_slug` → `pages.slug`

---

## 📌 6. Deployment Checklist

### ✅ Production Hazırlığı
- [x] Environment variables ayarlandı
- [x] Supabase production URL'i yapılandırıldı
- [x] RLS kuralları aktif
- [x] Admin hesapları oluşturuldu
- [x] Test verileri yüklendi

### 🚀 Go-Live Kontrolleri
- [ ] Tüm admin modülleri test edildi
- [ ] Bağlantı testleri başarılı
- [ ] Güvenlik testleri tamamlandı
- [ ] Performance testleri yapıldı
- [ ] Backup stratejisi belirlendi

---

## 📞 Destek ve Dokümantasyon

### 🔧 Teknik Destek
- **Admin Panel:** http://localhost:3001/admin
- **Test Sayfası:** http://localhost:3001/admin/test-connection
- **Dokümantasyon:** ADMIN_SETUP.md

### 👥 Roller ve İzinler
- **Super Admin:** Tüm modüllere tam erişim
- **Admin:** İçerik yönetimi ve kullanıcı yönetimi
- **User:** Sadece frontend erişimi

---

**Son Güncelleme:** 26 Haziran 2025  
**Versiyon:** 1.0.0  
**Durum:** ✅ Tüm gereksinimler karşılandı

---

## 📌 7. Gemini CLI Agent Entegrasyonu

### 🤖 Gemini CLI Nedir?
Gemini CLI, geliştirme süreçlerini hızlandırmak ve otomatikleştirmek için kullanılan yapay zeka tabanlı bir komut satırı arayüzüdür. Kod yazma, test oluşturma, dokümantasyon hazırlama ve rutin görevleri yerine getirme gibi konularda geliştiriciye yardımcı olur.

### 🚀 Nasıl Kullanılır?
Gemini CLI, doğal dil komutları ile çalışır. Yapmak istediğiniz görevi basit bir cümle ile ifade ederek Gemini'yi tetikleyebilirsiniz.

**Örnek Komutlar:**
- `"src/components/ui" dizinine yeni bir "Button.tsx" komponenti oluştur.`
- `"Hastaneler (hospitals) için CRUD operasyonlarını test eden bir test dosyası yaz."`
- `"RULES.md dosyasına yeni bir "Deployment" bölümü ekle."`
- `"Projedeki tüm .css dosyalarını listele ve içeriklerini göster."`

### ✅ Otomatize Edilebilecek Görevler
Gemini CLI, aşağıdaki görevleri hızlı ve verimli bir şekilde gerçekleştirmek için kullanılabilir:

- **Komponent Oluşturma:** Yeni React komponentleri (UI, form, layout vb.) oluşturma.
- **Servis ve Hook Yazma:** Supabase ile etkileşim kuracak yeni servisler (`services`) veya hook'lar (`hooks`) yazma.
- **Test Otomasyonu:** Mevcut fonksiyonlar, komponentler veya servisler için test dosyaları (örneğin, Vitest veya Jest kullanarak) oluşturma.
- **Kod Refactoring:** Mevcut kod bloklarını daha verimli, okunabilir veya modern standartlara uygun hale getirme.
- **Dokümantasyon:** `README.md` veya diğer `.md` dosyalarını güncelleme, yeni bölümler ekleme veya mevcutları düzenleme.
- **Veritabanı İşlemleri:** Basit SQL sorguları oluşturma veya `seed` scriptleri hazırlama.
- **Dosya ve Dizin Yönetimi:** Proje yapısı içinde dosya veya klasörleri listeleme, arama, oluşturma veya silme.
- **Hata Ayıklama:** Kodun belirli bir bölümündeki hataları bulma ve ç��züm önerileri sunma.
