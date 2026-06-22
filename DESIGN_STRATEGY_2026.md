# ANADOLU HASTANELERİ GRUBU — 2026 UI/UX TRANSFORMASYON STRATEJİSİ
## CEO Vizyonu: "Sağlık Sektöründe Dijital Mükemmellik"

---

## EXECUTIVE SUMMARY

Anadolu Hastaneleri Grubu olarak, Türkiye'nin en prestijli sağlık markalarıyla (Acıbadem, Memorial, Medical Park, Florence Nightingale) ve dünya liderleriyle (Cleveland Clinic, Mayo Clinic) rekabet edecek bir dijital deneyim inşa edeceğiz. Mevcut sitemiz iyi bir temele sahip ancak **2026 trendlerine uygun, kullanıcıyı etkileyen, dönüşüm odaklı** bir evrimleştirmeye ihtiyaç duyuyor.

**Tek Cümlelik Vizyon:**  
*"Türkiye'nin en akıllı, en hızlı ve en empatik hastane dijital deneyimini yaratmak."*

---

## 1. MEVCUT DURUM ANALİZİ (SWOT)

### ✅ GÜÇLÜ YÖNLERİMİZ
| Öğe | Mevcut Durum |
|-----|-------------|
| **Teknoloji Altyapısı** | React 18 + Vite + TypeScript + Tailwind — modern, hızlı stack |
| **Animasyon Altyapısı** | Framer Motion entegre — scroll reveal, hover efektleri mevcut |
| **Renk Sistemi** | Tanımlı design token'ları (primary, teal, gold, neutral) |
| **Admin Paneli** | Tam kapsamlı CMS (hastane, doktor, bölüm, içerik yönetimi) |
| **Responsive** | Mobil uyumlu temel yapı mevcut |

### ⚠️ ZAYIF YÖNLERİMİZ
| Öğe | Mevcut Durum | Etki |
|-----|-------------|------|
| **Hero Section** | Klasik overlay + gradient — 2020'lardan kalma | İlk izlenim zayıf |
| **Kart Aşırı Kullanımı** | Bölümler, doktorlar, hastaneler hepsi kart | Modern değil, generic |
| **Tipografi** | Playfair Display + Inter + Montserrat — 3 font fazla | Yük performansı düşük |
| **Renk Atmosferi** | Koyu lacivert ağırlıklı — soğuk, klinik his | Empati eksikliği |
| **Beyaz Alan** | Section'lar arası dar, içerik yoğun | Nefes almak zor |
| **CTA Stratejisi** | "Online Randevu" harici zayıf dönüşüm yolu | Potansiyel kaybı |
| **Hasta Hikayeleri** | Sadece statik yorumlar — video yok | Sosyal kanıt zayıf |
| **Font Boyutları** | 16px baz, bazı yerlerde 11px label'lar | Erişilebilirlik düşük |

### 🚀 FIRSATLAR
- Türkiye'deki hastane siteleri hâlâ "mavi-yeşil kart cehennemi"nde — farklılaşma alanı geniş
- Sağlık turizmi pazarı büyüyor — uluslararası hasta deneyimi kritik
- AI ve kişiselleştirme henüz yaygın değil — erken benimseyen avantajı

### ⛔ TEHDİTLER
- Acıbadem ve Florence Nightingale global hasta deneyiminde çok ileride
- Anadolu Sağlık Merkezi (anadolusaglik.org) zaten ödüllü UX'e sahip
- Kullanıcılar artık Amazon/Netflix kalitesinde deneyim bekliyor

---

## 2. RAKİP ANALİZİ ÖZETİ

### Türkiye Pazarının En İyileri

| Marka | Güçlü Yönü | Bizden Farkı |
|-------|-----------|-------------|
| **Acıbadem** | Global sağlık turizmi, çok dilli UX | Uluslararası ofis ağı, "World Class Healthcare" mesajlaması |
| **Memorial** | JCI kalite vurgusu, online sonuç sistemi | Hasta güvenliği odaklı içerik mimarisi |
| **Medical Park** | Halka ulaşım, kırmızı CTA gücü | "Herkes için sağlık" felsefesiyle erişilebilirlik |
| **Florence** | Sağlık turizmi dönüşüm hunisi | Fiyat karşılaştırma, ziyaret planlama CTA'ları |
| **Medicana** | Kurumsal kimlik tutarlılığı | Yeşil + mavi kombinasyonu, doğal iyileşme hissi |
| **Anadolu SM** | Ödüllü UX (Altın Örümcek) | Johns Hopkins işbirliği, hasta odaklı navigasyon |

### Dünya Liderlerinin Sırrı

| Özellik | Cleveland Clinic | Mayo Clinic |
|---------|-----------------|-------------|
| **Hero** | Tam genişlikte hasta-bakıcı görseli, duygusal bağ | "Transforming your care" — sade, beyaz, bol boşluk |
| **CTA'lar** | 3 mega-karo: Find Doctor / Directions / Schedule | 2 net buton: Innovation / Appointment |
| **Tipografi** | Clean, modern, unembellished | Arial/Helvetica — sadelik zirvesi |
| **Beyaz Alan** | Çok bol, her section nefes alıyor | Sakin, profesyonel, asla kalabalık değil |
| **İçerik** | Modüler sağlık kütüphanesi (SEO canavarı) | Alfabetik filtreleme, detaylı doktor biyografileri |

### 🎯 ÇIKARIM:
> **Türkiye'deki hiçbir hastane sitesi, dünya liderleri seviyesinde "sadelik + beyaz alan + duygusal bağ" üçgenini başaramamış.**  
> **Bu, bizim farklılaşma alanımız.**

---

## 3. YENİ TASARIM STRATEJİSİ: "CALM AUTHORITY"

### Vizyon: Sakin Otorite
Türk hastane sitelerinin çoğu ya "soğuk ve klinik" ya da "kalabalık ve bilgiç". Biz **sıcak profesyonellik** çizgisini tutturacağız. Hasta ziyaretçiye şunu hissedecek:

> *"Bu hastane beni anlıyor. Burası hem en modern hem de en insani yer."*

### 3.1 Yeni Renk Stratejisi

Mevcut: `#122848` koyu lacivert + `#0D7A8E` teal + `#AA8020` gold

**YENİ PALET:**

| Rol | Yeni Renk | Hex | Psikolojisi |
|-----|----------|-----|-------------|
| **Primary** | Yumuşak Gece Laciverti | `#0F1F3A` | Güven, derinlik, otorite (biraz koyulaştırıldı) |
| **Secondary** | Sakin Okyanus | `#0A6B7D` | Huzur, sağlık, sükunet (teal biraz doygunlaştırıldı) |
| **Accent** | Sıcak Amber | `#D4953A` | İyimserlik, enerji, premium his (gold ısıtıldı) |
| **Surface** | Buz Beyazı | `#F7F9FB` | Temizlik, nefes, modernlik (eski `#F5F5F8` yerine) |
| **Text** | Gece Yarısı | `#1A1D23` | Keskin okunabilirlik, sıcak siyah |
| **Success** | Yumuşak Yeşil | `#2D8A5E` | İyileşme, doğa, umut |
| **CTA Primary** | Canlı Mercan | `#E85D4E` | Aciliyet, eylem, dönüşüm (yeni!) |

**Neden Mercan (Coral) CTA?**  
Tüm rakipler mavi-yeşil-kırmızı CTA kullanıyor. Mercan:
- Dikkat çekici ama kırmızı kadar agresif değil
- Sağlık sektöründe yenilikçi (Parsley Health, Maven Clinic kullanıyor)
- Mavi-yeşil paletle mükemmel kontrast

### 3.2 Yeni Tipografi Sistemi

Mevcut: Playfair Display + Inter + Montserrat (3 font, 6+ weight)

**YENİ SİSTEM — "DUAL FONT POWER":**

| Rol | Font | Weight | Kullanım |
|-----|------|--------|----------|
| **Display** | **Plus Jakarta Sans** | 700-800 | Hero başlıkları, section titles |
| **Body** | **Inter** | 400-500-600 | Tüm gövde metni, UI elemanları |

**Neden Plus Jakarta Sans?**
- 2024-2025'in en trend UI font'larından (Linear, Vercel, Notion kullanıyor)
- Geometrik ama sıcak, modern ama dostane
- Türkçe karakterler mükemmel destekleniyor
- tek bir font ailesiyle hem heading hem body yapılabilir (isteğe bağlı)

**Neden sadece 2 font?**
- Daha hızlı yükleme (daha az font file)
- Daha tutarlı kimlik
- Daha az karar yorgunluğu (tasarımcı ve geliştirici için)

**Yeni Tipografi Ölçeği:**

| Token | Boyut | Line Height | Kullanım |
|-------|-------|-------------|----------|
| `text-hero` | 64px / 48px mob | 1.05 | Ana hero başlığı |
| `text-h1` | 48px / 36px mob | 1.1 | Page başlıkları |
| `text-h2` | 36px / 28px mob | 1.15 | Section başlıkları |
| `text-h3` | 28px / 22px mob | 1.2 | Kart başlıkları |
| `text-h4` | 22px / 18px mob | 1.3 | Alt başlıklar |
| `text-body-lg` | 18px | 1.65 | Önemli paragraflar |
| `text-body` | 16px | 1.6 | Standart metin |
| `text-sm` | 14px | 1.5 | İkincil metin |
| `text-xs` | 12px | 1.4 | Etiketler, caption |

**Kural:** Asla 16px altına düşmeyen body metni. Erişilebilirlik zirvesi.

---

## 4. SAYFA YAPISI YENİLENMESİ

### 4.1 Hero Section — "The First Breath"

Mevcut: Koyu overlay + gradient + 4'lü kart grid

**YENİ KONSEPT:**
- **Full-bleed video background** (hastane koridorunda yürüyen doktor, ameliyathanenin kapısı açılıyor, bebek ilk nefesini alıyor — 10 saniyelik loop)
- **Video yerine yüksek kaliteli slow-motion fotoğraf** da olabilir (fallback)
- **Text overlay:** Sol alt köşede, sadece 2 satır:
  - *"Sağlığınız, en değerli emanetiniz."* (hero)
  - *"25 yıldır, her nefeste yanınızdayız."* (sub)
- **Tek CTA:** Sağ alt köşede, büyük mercan buton: *"Hemen Randevu Al"*
- **Header:** Saydam, scroll ile glassmorphism'e dönüşür
- **NO cards in hero. NO stats strip. NO quick action grid.**  
  (Frontend Skill: *"No hero cards, stat strips, logo clouds by default"*)

### 4.2 Hızlı Eylem Bandı — "The Ribbon"

Hero'nun hemen altında, tam genişlikte, **glassmorphism** bir band:

| İkon | Metin | Link |
|------|-------|------|
| 🔍 | Doktor Ara | /doktorlar |
| 📅 | Online Randevu | external |
| 📍 | En Yakın Şube | /hastanelerimiz |
| 📞 | 7/24 Acil | tel: |

**Tasarım:** Beyaz zemin, hafif blur, 4 eşit sütun, hover'da icon bounce + text slide.

### 4.3 Rakamlarla Anadolu — "The Proof"

Mevcut: 6'lı grid, koyu lacivert zemin, icon + sayı

**YENİ KONSEPT:**
- **Parallax background:** Hafifçe hareket eden soyut molekül/dna deseni (SVG, düşük opasite)
- **Horizontal scroll reveal:** Sayılar soldan sağa sırayla belirir
- **Büyük tipografi:** Sayılar 72px, etiketler 14px uppercase tracking-wide
- **Zemin:** Çok hafif `#F0F4F8` — koyu lacivert yerine aydınlık

### 4.4 Hastane Şubeleri — "The Places"

Mevcut: 3-4'lü kart grid, her kartta fotoğraf + adres + telefon

**YENİ KONSEPT:**
- **Asimetrik grid:** Bir büyük featured kart (sol, 2x2) + 2 küçük kart (sağ, üst-alt)
- **Kart içi:** Fotoğraf tam üstte, hover'da fotoğraf zoom + gradient overlay koyulaşır
- **Bilgi:** Sadece isim + semt — adres ve telefon detay sayfada
- **NO card border. NO box shadow by default.**  
  (Frontend Skill: *"Cardless layouts. Use sections, columns, dividers"*)

### 4.5 Bölümlerimiz — "The Expertise"

Mevcut: 4'lü grid, yuvarlak icon + isim + açıklama

**YENİ KONSEPT:**
- **Horizontal scrolling category pills:** Kardiyoloji | Nöroloji | Ortopedi | ... (tıklanabilir, filter)
- **Asimetrik kartlar:** Sol büyük görsel + sağ liste şeklinde
- **Icon'lar:** Lucide React (modern, tutarlı, ince stroke)
- **Hover:** Kartın arka planı hafif `#F7F9FB'ye döner, border-left accent rengi olur

### 4.6 Doktorlar — "The Healers"

Mevcut: Swiper slider, beyaz kartlar, fotoğraf + isim + ünvan

**YENİ KONSEPT:**
- **Masonry-style grid:** Farklı boyutlarda doktor portreleri (bazıları büyük, bazıları küçük)
- **Fotoğraf treatment:** Siyah-beyaz varsayılan, hover'da renkli
- **Bilgi overlay:** Fotoğrafın alt kısmında gradient + isim + ünvan + hastane
- **CTA:** "Profili Gör" ve "Randevu Al" hover'da belirir

### 4.7 Hasta Yorumları — "The Voices"

Mevcut: Swiper, yıldız rating, metin

**YENİ KONSEPT:**
- **Full-width quote carousel:** Büyük tırnak işaretleri, tek bir yorum ekranda
- **Video testimonial placeholder:** Thumbnail + play button, tıklayınca lightbox
- **NO yıldız rating.** Yerine: hasta ismi, tedavi türü, tarih

### 4.8 Sağlık Turizmi — "The World"

Mevcut: İki kolonlu grid, checklist + görsel

**YENİ KONSEPT:**
- **Dünya haritası animasyonu:** Türkiye'den ışınlar çıkıyor, 30+ ülkeye
- **Floating stats:** Yan yana 4 sayı — "30+ Ülke | 5000+ Uluslararası Hasta | JCI | ISO"
- **Dil seçici:** İngilizce / Arapça / Rusça bayrakları, tıklayınca o dilden karşılama

### 4.9 Randevu CTA — "The Moment"

Mevcut: İki kolonlu, sol metin + sağ form-kart

**YENİ KONSEPT:**
- **Full-bleed background image:** Hasta-doktor tokalaşma (gerçek fotoğraf)
- **Centered text overlay:** Büyük başlık, tek buton
- **Form:** Doktor ve tarih seçimi yapılabilen mini form (asla kart içinde değil, doğrudan zeminde)
- **NO card container. NO boxed layout.**

### 4.10 Footer — "The Foundation"

Mevcut: 5 kolonlu grid, koyu zemin

**YENİ KONSEPT:**
- **Mega footer:** 2 satır
  - Satır 1: Logo + kısa manifesto + sosyal ikonlar
  - Satır 2: 4 kolon link listesi (Hızlı Erişim, Kurumsal, Hasta Hizmetleri, İletişim)
  - Satır 3: Copyright + legal links + "Designed with care" mesajı
- **Zemin:** `#0F1F3A` (primary) yerine `#0A1628` (biraz daha koyu, daha premium)

---

## 5. MİKRO-ETKİLEŞİM & ANİMASYON STRATEJİSİ

### 5.1 Giriş Animasyonları
- **Hero text:** Staggered fade-up (her satır 0.15s gecikme)
- **Hero CTA:** Scale 0.9 → 1.0 + fade, 0.8s delay
- **Ribbon band:** Slide-up from bottom, 1s delay

### 5.2 Scroll Animasyonları
- **Section reveals:** Her section `y: 40 → 0`, `opacity: 0 → 1`, viewport'a girdiğinde
- **Counter animation:** Stats sayıları 0'dan hedefe, 2s süre, ease-out
- **Parallax images:** Hero background ve section görselleri yavaş scroll

### 5.3 Hover Etkileşimleri
- **Buttons:** `translateY(-2px)` + shadow büyüme, 200ms
- **Cards:** NO translateY. Yerine: border-left accent renk, içerik hafif shift
- **Links:** Underline left-to-right animation
- **Images:** Scale 1.03, 400ms ease

### 5.4 Loading States
- **Skeleton:** Wave animation (shimmer yerine)
- **Page transition:** Fade-out/fade-in, 200ms

---

## 6. TEKNOLOJİ & PERFORMANS STRATEJİSİ

### 6.1 Font Optimizasyonu
- **Plus Jakarta Sans + Inter** sadece gerekli weight'ler (400, 500, 600, 700)
- **Font display: swap** — FOIT (Flash of Invisible Text) engelleme
- **Preconnect** Google Fonts CDN'e

### 6.2 Görseller
- **WebP formatı** zorunlu
- **Lazy loading** native (loading="lazy")
- **Responsive images** srcset ile
- **Placeholder:** Blur-up LQIP (Low Quality Image Placeholder)

### 6.3 Core Web Vitals Hedefleri

| Metrik | Hedef | Mevcut Tahmini |
|--------|-------|---------------|
| LCP (Largest Contentful Paint) | < 2.5s | ~3.5s |
| FID (First Input Delay) | < 100ms | ~50ms ✅ |
| CLS (Cumulative Layout Shift) | < 0.1 | ~0.15 |
| FCP (First Contentful Paint) | < 1.8s | ~2.2s |
| TTFB (Time to First Byte) | < 600ms | ~800ms |

### 6.4 Erişilebilirlik (WCAG 2.1 AA)
- Tüm interaktif elemanlar minimum 44x44px dokunma alanı
- Renk kontrastı minimum 4.5:1 (body), 3:1 (büyük metin)
- Focus ring'ler visible ve styled
- ARIA label'lar tüm ikon butonlarda
- Keyboard navigasyonu tam destek

---

## 7. UYGULAMA PLANI (4 FAZ)

### FAZ 1: TEMEL — "Foundation" (Hafta 1-2)
- [ ] Tailwind config yenilenmesi (yeni renkler, fontlar, spacing)
- [ ] Global CSS refactor (index.css)
- [ ] Google Fonts entegrasyonu (Plus Jakarta Sans + Inter)
- [ ] index.html meta tag'leri ve favicon güncellemesi
- [ ] Layout bileşenleri (Header, Footer) yeniden tasarım
- [ ] Yeni UI kit başlangıcı (Button, Badge, Input, Card-v2)

### FAZ 2: HERO & HOME — "First Impression" (Hafta 2-3)
- [ ] HeroBanner tamamen yeniden yazım
- [ ] Quick Action Ribbon bileşeni
- [ ] StatsSection yenilenmesi
- [ ] HospitalBranches yeni grid yapısı
- [ ] DepartmentsSection asimetrik tasarım
- [ ] HomePage yeni section sıralaması ve yapılandırması

### FAZ 3: DETAY & İÇERİK — "Depth" (Hafta 3-4)
- [ ] DoctorsSlider → DoctorsGrid (masonry)
- [ ] TestimonialsSection → VoicesSection
- [ ] HealthTourismSection harita + stats konsepti
- [ ] AppointmentCTA full-bleed konsepti
- [ ] AccreditationBand minimalist badge'ler
- [ ] SectionTitle yeni animasyonlu versiyon

### FAZ 4: SAYFALAR & POLISH — "Perfection" (Hafta 4-5)
- [ ] Tüm alt sayfaların header/footer uyumu
- [ ] Mobil menü yenilenmesi
- [ ] Loading states ve skeleton'lar
- [ ] Page transition animasyonları
- [ ] Erişilebilirlik audit (axe-core)
- [ ] Lighthouse score optimizasyonu (hedef: 90+)
- [ ] Cross-browser test

---

## 8. BAŞARI METRİKLERİ

### Hemen Ölçülebilir
| Metrik | Hedef | Ölçüm Aracı |
|--------|-------|-------------|
| Lighthouse Performance | > 90 | Chrome DevTools |
| Lighthouse Accessibility | > 95 | Chrome DevTools |
| Lighthouse Best Practices | > 95 | Chrome DevTools |
| Font Yükleme Süresi | < 500ms | WebPageTest |
| LCP | < 2.5s | Core Web Vitals |

### Kısa Vadeli (1-3 ay)
| Metrik | Hedef | Ölçüm |
|--------|-------|-------|
| Bounce Rate | < %40 | Google Analytics |
| Time on Page | > 2.5 dk | Google Analytics |
| Mobile Session Rate | > %65 | Google Analytics |
| Randevu Butonu Tıklama | +%30 | Event tracking |

### Uzun Vadeli (3-6 ay)
| Metrik | Hedef |
|--------|-------|
| Online Randevu Dönüşümü | +%25 |
| Sağlık Turizmi Lead'leri | +%40 |
| Doktor Profili Görüntüleme | +%50 |
| SEO Organic Traffic | +%30 |

---

## 9. RİSKLER & ÇÖZÜMLER

| Risk | Olasılık | Çözüm |
|------|---------|-------|
| Font değişikliği brand algısını bozar | Orta | Eski ve yeni font'u A/B test et, kullanıcı geri bildirimi al |
| Renk değişikliği tanınabilirliği azaltır | Düşük | Primary lacivert korunuyor, sadece tonlar ve accent değişiyor |
| Performans animasyonlarla düşer | Orta | `will-change`, `transform` kullan, heavy JS animasyonlardan kaçın |
| Mobil uyumluluk bozulur | Düşük | Her faz sonunda mobil test zorunlu |
| İçerik yönetimi admin paneli etkilenir | Düşük | Admin panel ayrı layout, public site değişikliklerinden bağımsız |

---

## 10. SONUÇ

Bu strateji, Anadolu Hastaneleri Grubu'nu Türkiye'nin dijital sağlık deneyiminde **mutlak lider** konumuna taşıyacak. Temel prensiplerimiz:

1. **Sadelik zirvedir** — Her elemanın varlık sebebini sorgula
2. **Empati her şeydir** — Hasta değil, insan olarak düşün
3. **Hız güvendir** — Yavaş site, güvensiz hastane demektir
4. **Dönüşüm odaktır** — Her piksel bir randevuya hizmet etmeli
5. **Mobil gerçektir** — 70% kullanıcı oradan gelecek

> *"Tasarım, nasıl göründüğü ve nasıl hissettirdiği değildir. Tasarım, nasıl çalıştığıdır."*  
> — Steve Jobs

Bizim tasarımımız, hastalarımızın hayatını kolaylaştıracak şekilde çalışacak.

---

**Hazırlayan:** AI Design Team  
**Tarih:** Nisan 2026  
**Versiyon:** 1.0  
**Durum:** Onay Bekliyor

---
