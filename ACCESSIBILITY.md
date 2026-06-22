# Web Erişilebilirliği Uyum Dosyası

**Kapsam:** Anadolu Hastaneleri Grubu kurumsal web sitesi
**Dayanak:** Resmî Gazete 21.06.2025, sayı/karar 20250621-17 — Web Siteleri ve Mobil Uygulamaların Erişilebilirliği
**Standart:** WCAG 2.2 — **A Seviyesi** (4 prensip, 31 başarı kriteri; Bakanlık kontrol listesi 31 ilke / 122 soru)
**Son güncelleme:** 2026-06-22

> Bu dosya; iç denetim, düzeltme takibi ve komisyon raporlaması için yaşayan bir belgedir.
> Her yeni içerik yayınından önce ve düzenli aralıklarla güncellenmelidir.

---

## 1. Kapsam / Envanter (TODO Madde 1)

Aşağıdaki rotalar `src/App.tsx` üzerinden tespit edilmiştir. Durum kolonu denetim ilerledikçe doldurulacaktır
(✅ erişilebilir · ⚠️ sorunlu · 🔧 yeniden yapılmalı · ⬜ denetlenmedi).

| Bölüm | URL | Durum | Not |
|---|---|---|---|
| Ana sayfa | `/` | ⚠️ | Hero slider duraklatma eklendi; kontrast denetimi bekliyor |
| Hastanelerimiz | `/hastanelerimiz`, `/hastanelerimiz/:slug` | ⬜ | |
| Bölümlerimiz | `/bolumlerimiz`, `/bolumlerimiz/:slug` | ⬜ | Filtre/tab klavye denetimi gerekli |
| Doktorlar | `/doktorlar`, `/doktorlar/:slug` | ⚠️ | Detay sayfası breadcrumb/alt düzeltildi |
| Sağlık Rehberi | `/saglik-rehberi`, `/saglik-rehberi/:slug`, `/videolar`, `/hasta-bilgilendirme` | ⬜ | Videolara altyazı/transkript gerekli |
| Sağlık Turizmi | `/saglik-turizmi` | ⚠️ | Çok dilli; alt metinleri düzeltildi |
| İkinci Görüş | `/ikinci-gorus` | ⬜ | |
| İletişim | `/iletisim` | ✅ | Form etiket/zorunluluk/hata erişilebilirliği tamam |
| Profil / Randevu | `/profil` | ⬜ | Hasta portalı; auth formları kısmen iyileştirildi |
| Kurumsal sayfalar | `/hakkimizda`, `/yonetim`, `/misyon-vizyon-ve-degerlerimiz`, `/baskanin-mesaji` vb. | ⬜ | |
| Hasta hakları / KVKK | `/hasta-haklari`, `/sikayet-politikasi` | ⬜ | |
| Diğer | `/kariyer`, `/basinda-biz`, `/ulasim`, `/gebe-okulu`, `/acil-servis` … | ⬜ | |

**Medya envanteri:** PDF broşürler, afişler, kampanya görselleri ve videolar ayrıca listelenmelidir (Madde 3 & 8).

---

## 2. Resmî kontrol listesine göre denetim (TODO Madde 2)

- [ ] Bakanlığın "A Seviyesi Kontrol Listesi" (31 ilke / 122 soru) indirildi
- [ ] Her kritik sayfa listeye göre tek tek kontrol edildi
- [ ] Sonuçlar tabloya işlendi (Sayfa URL · sorun · WCAG kriteri · öncelik · sorumlu · durum)
- [ ] "Hayır" çıkan maddeler için düzeltme planı hazırlandı
- [ ] İlk iç denetim raporu oluşturuldu

---

## 3. Yapılan teknik düzeltmeler (kod tabanında tamamlananlar)

| WCAG | Kriter | Yapılan | Dosya |
|---|---|---|---|
| 2.4.1 | İçeriğe atla bağlantısı | "İçeriğe atla" skip-link + `<main id="main-content">` | `Layout.tsx`, `index.css` |
| 2.4.7 | Görünür odak | Tüm etkileşimli ögelere `:focus-visible` halkası | `index.css` |
| 2.3.3 | Hareket azaltma | `prefers-reduced-motion` desteği | `index.css` |
| 1.1.1 | Metin alternatifi | Dekoratif görseller `alt=""`+`aria-hidden`; İngilizce alt'lar Türkçeleştirildi | `AppointmentCTA`, `DoctorDetailPage`, `HealthTourismPage`, `AboutPage` |
| 4.1.2 | İsim/rol/değer | Mobil menü `aria-expanded`/`aria-controls`/`aria-label`; dil değiştirici klavye erişimi + `aria-label` | `Header.tsx` |
| 3.1.1/3.1.2 | Sayfa dili | Dil değişiminde `<html lang>` + `dir="rtl"` (Arapça) senkronizasyonu | `i18n.ts` |
| 1.3.1/3.3.2 | Etiket/talimat | İletişim formunda `label htmlFor`/`id` bağlama, zorunlu alan işaretleme, KVKK onayı | `ContactPage.tsx` |
| 3.3.1 | Hata bildirimi | Auth form hata kutularına `role="alert"` | `SignInForm.tsx`, `SignUpForm.tsx` |
| 2.2.2 | Duraklat/Durdur/Gizle | Hero slider'a duraklat/oynat kontrolü | `HeroBanner.tsx` |
| 1.3.1 | Anlamlı bağlantı | Sosyal medya ikonlarına `aria-label` | `ContactPage.tsx` |
| 2.1.2 / 2.4.3 | Klavye tuzağı yok / odak sırası | Yeniden kullanılabilir focus-trap (Tab döngüsü, Esc, odak iadesi) → AuthModal + mobil menü | `useFocusTrap.ts`, `AuthModal.tsx`, `Header.tsx` |
| 4.1.2 | İsim/rol/değer | AuthModal `role="dialog"`+`aria-modal`+erişilebilir kapatma butonu; tablar `role="tab"`/`aria-selected`; FloatingActions `aria-expanded` | `AuthModal.tsx`, `FloatingActions.tsx` |
| 1.4.3 (AA) | Metin kontrastı | Okunabilir gövde metinlerinde `neutral-400`/`slate-400` → `-500` (≈4.5:1) | home bileşenleri, `ContactPage`, `HealthTourismPage`, `DoctorsPage` |
| 1.3.1 / 2.4.6 | Başlık hiyerarşisi | `SectionTitle`'a `as="h1"` prop'u; liste sayfalarına tek H1 (DepartmentsPage, DoctorsPage, HospitalsPage, HealthGuidePage, ProfilePage sr-only) | `SectionTitle.tsx` + ilgili sayfalar |
| 1.3.1 / 3.3.2 | Filtre & arama etiketleri | Bölüm/doktor arama inputlarına `label`, select'lere `htmlFor`/`id`, filtre butonlarına `aria-pressed`, mobil filtre `aria-expanded`/`aria-controls` | `DepartmentsPage.tsx`, `DoctorsPage.tsx` |
| 4.1.3 | Durum mesajları | Bölüm/doktor sonuç sayısı için `role="status" aria-live="polite"` | `DepartmentsPage.tsx`, `DoctorsPage.tsx` |
| 2.4.4 | Anlamlı bağlantı metni | Kart "Detaylı Bilgi"/"Profil"/"Randevu" linklerine öğe adıyla `aria-label` | DepartmentsPage, DoctorsPage, HospitalsPage, DepartmentsSection, HospitalBranches |
| 2.5.8 (AA) | Dokunma hedef boyutu | Kapatma/menü butonları min 44×44px; ScrollToTop ↔ FloatingActions çakışması giderildi (sol alta taşındı) | `ScrollToTop.tsx`, `Header.tsx`, `AuthModal.tsx` |
| 1.4.10 / 1.4.4 | Reflow & metin büyütme | `overflow-x: clip` (sticky bozmadan yatay kaydırma engeli), medya `max-width:100%`, `overflow-wrap:break-word` | `index.css` |

> **Önemli not (kontrast):** WCAG kontrast minimumu (1.4.3) **AA** seviyesidir; genelgenin esas aldığı **A seviyesinde zorunlu değildir.** A seviyesindeki ilgili kriter **1.4.1 "Sadece renkle bilgi vermeme"**dir (form hataları metin+`*` ile, aktif menü renk+alt çizgi ile gösteriliyor). Kontrast iyileştirmeleri yine de okunabilirlik için yapıldı; tam AA kontrast taraması Lighthouse ile ayrıca yürütülmeli.

---

## 4. Açık kalan başlıklar (sonraki adımlar)

- [ ] **Madde 3:** Video içeriklerine altyazı + transkript; gömülü Reels/Instagram açıklamaları
- [ ] **Madde 4:** Online randevu/CAPTCHA varsa erişilebilir alternatif
- [~] **Madde 5:** Bölüm/doktor filtre & arama klavye/ARIA erişimi ve ana sayfalarda H1 tamam; kalan: kurumsal/iç sayfalarda başlık seviyesi atlama denetimi, breadcrumb yapılarının yaygınlaştırılması
- [~] **Madde 6:** Gövde metni kontrastları iyileştirildi; kalan: `text-white/60` gibi düşük opaklıkların ve tüm sayfaların Lighthouse ile AA taraması, metin %200 büyütme dayanıklılığı
- [~] **Madde 7:** Modal focus-trap (AuthModal + mobil menü) tamam; kalan: diğer admin modalları, semantik `section`/`article` denetimi, gereksiz ARIA temizliği, tab/filtre klavye denetimi
- [ ] **Madde 8:** PDF broşürlerin erişilebilir PDF/HTML'e dönüştürülmesi
- [ ] **Madde 9:** Çok dilli sayfalarda bayrak+dil adı; CTA etiketleri
- [~] **Madde 10:** Sabit buton çakışması, ana butonların 44px hedefi, `overflow-x: clip` ve metin büyütme güvenceleri tamam; kalan: gerçek cihazlarda ekran okuyucu/switch testi ve %200 zoom görsel denetimi

---

## 5. İç komisyon ve raporlama (TODO Madde 11)

**Web Erişilebilirlik İnceleme Ekibi** (önerilen roller):

| Rol | Sorumlu | İletişim |
|---|---|---|
| Dijital pazarlama | _doldurulacak_ | |
| Yazılım / web ajansı | _doldurulacak_ | |
| Kalite / kurumsal iletişim | _doldurulacak_ | |
| Hukuk / KVKK temsilcisi | _doldurulacak_ | |

- [ ] İlk denetim raporu — tarih: _____
- [ ] Düzeltme sonrası 2. kontrol raporu — tarih: _____
- [ ] Denetim belgeleri arşivlendi
- [ ] Yeni içerik yayın akışına erişilebilirlik kontrol adımı eklendi

---

## 6. Erişilebilirlik logosu süreci (TODO Madde 12)

- [ ] Uyum tamamlandı → Bakanlık başvuru/izleme süreci başlatıldı
- [ ] Değerlendirme/izleme duyuruları takip ediliyor
- [ ] Logo alındı → footer/kurumsal alanda kullanıldı (2 yıl geçerli)
- [ ] Logo geçerlilik & yenileme tarihi takvime işlendi — yenileme tarihi: _____

---

## Yerel test yöntemleri

- Klavye: `Tab` ile tüm site gezilebilmeli, odak her zaman görünür olmalı, ilk `Tab` "İçeriğe atla"yı göstermeli.
- Ekran okuyucu: NVDA (Windows) / VoiceOver (macOS) ile menü, form ve slider kontrolleri.
- Otomatik tarama: Lighthouse (Chrome DevTools → Accessibility) ve axe DevTools eklentisi.
- Kontrast: WebAIM Contrast Checker ile marka renkleri (`--color-*` değerleri `index.css`).
