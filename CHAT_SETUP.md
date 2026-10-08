# Canlı Destek (Live Chat) Kurulumu

JivoChat benzeri, üçüncü parti servis kullanmadan kendi Supabase altyapımızda
çalışan canlı destek sistemi. Aylık abonelik yok, veriler kendi veritabanımızda.

## 1. Veritabanı kurulumu (tek seferlik)

Supabase Dashboard → **SQL Editor** → `src/sql/live_chat_migration.sql`
dosyasının tamamını yapıştırıp **Run**.

Migration idempotenttir; tekrar çalıştırmak güvenlidir. Sonunda çıkan tabloda
`chat_settings` için 1 kayıt görmelisiniz.

Oluşturduğu nesneler:

| Nesne | Amaç |
|---|---|
| `chat_conversations` | Görüşmeler (ziyaretçi bilgisi, durum, atanan operatör) |
| `chat_messages` | Mesajlar |
| `chat_settings` | Tek satırlık widget yapılandırması |
| `chat_*` RPC fonksiyonları | Ziyaretçinin token'lı erişim kapısı |

Ardından şu iki dosyayı **bu sırayla** çalıştırın:

1. `src/sql/live_chat_tags_stats_migration.sql` — otomatik etiketleme + istatistik
2. `src/sql/live_chat_features_migration.sql` — hazır yanıtlar, yazıyor göstergesi,
   memnuniyet anketi, dosya eki
3. `src/sql/live_chat_hours_texts_migration.sql` — çalışma saatli mod + `is_24_7`
   sütunu
4. `src/sql/rls_hardening_migration.sql` — güvenlik sıkılaştırma (canlı destek
   dışındaki tabloları da kapsar, bkz. dosya başındaki açıklama)
5. `src/sql/rls_public_read_fix_migration.sql` — 4'ün düzeltmesi: taslak /
   yayınlanmamış içeriğin herkese açılmasını engeller
6. `src/sql/live_chat_agents_migration.sql` — çoklu operatör
7. `src/sql/whatsapp_routing_migration.sql` — form → WhatsApp yönlendirme

Sıra önemlidir; her biri bir öncekinin oluşturduğu nesnelere dayanır.

> **`live_chat_247_migration.sql` ÇALIŞTIRMAYIN.** O dosya widget'ı kesintisiz
> çevrimiçi yapmak için yazılmıştı; sonradan çalışma saatli moda dönüldüğü için
> geçerliliğini yitirdi. Çalıştırırsanız 7/24 modunu geri açar ve saat
> ayarlarınızı devre dışı bırakır. Yerine yukarıdaki 3 numaralı dosyayı
> kullanın — `is_24_7` sütununu o da ekler.

## 2. Realtime'ı açın

Supabase Dashboard → **Database → Replication → `supabase_realtime`**
bölümünde `chat_messages` ve `chat_conversations` tablolarının ekli olduğunu
doğrulayın. Migration bunu otomatik yapar; yapamadıysa buradan elle ekleyin.

## 3. Panel içindeki yeri

Canlı desteğin tüm bölümleri sol menüde **tek bir “Canlı Destek” girişinde**
toplanmıştır. Alt bölümler sayfanın üstündeki sekme çubuğundan gezilir:

`Görüşmeler` · `Rapor` · `Ekip` · `Hazır Yanıtlar` · `Etiketler` · `Ayarlar`

Eski tekil adresler (`/admin/chat-settings` vb.) yeni sekmelere yönlendirilir,
kayıtlı bağlantılar kırılmaz.

> Not: Sitede daha önce kurulu olan **JivoChat kaldırıldı** (`index.html`).
> Eski widget kimliği geri almak isterseniz diye yorum satırında duruyor.

## 4. Widget'ı yapılandırın

Admin paneli → **Canlı Destek** → **Ayarlar** sekmesi

- **Canlı destek açık** işaretli değilse widget sitede hiç görünmez.
  (Migration sonrası varsayılan: **açık**.)
### Çalışma saatleri

**7 gün 24 saat açık** kutusu iki modu belirler:

- **İşaretliyse** — gün/saat ayarları tamamen devre dışı, widget hiçbir zaman
  "çevrimdışı" göstermez.
- **İşaretli değilse** — gün/saat alanları görünür olur ve devreye girer.
  Çevrimiçi günleri seçip başlangıç/bitiş saatini girersiniz. Gece yarısını
  aşan aralık da desteklenir (ör. 20:00–02:00).

Saatler her zaman **Europe/Istanbul**'a göre değerlendirilir; ziyaretçinin
cihaz saati veya saat dilimi dikkate alınmaz.

> **Mesai dışında da mesaj alınır.** Saat kontrolü yalnızca görünümü değiştirir;
> ziyaretçi formu doldurup mesaj bırakabilir ve mesaj veritabanına kaydedilir.
> Operatör panosunda normal bir görüşme olarak görünür.

**Çevrimdışı WhatsApp numarası** girerseniz mesai dışında widget'ta
"WhatsApp'tan yazın" butonu da çıkar. Hastane için bunu doldurmanızı öneririz —
mesai dışında ziyaretçiye ikinci bir kanal kalır.

> Saatli moda geçerken **alt başlık** ve **çevrimdışı mesajı** metinlerini de
> gözden geçirin. `live_chat_247_migration.sql` bunları "7/24" ifadesiyle
> doldurmuştu; saat sınırı varken çelişirler.
> `src/sql/live_chat_hours_texts_migration.sql` bunları nötr hâle getirir.

**Bilinen sınır:** tek bir saat aralığı seçili günlerin hepsine uygulanır.
Hafta içi 08:00–20:00, cumartesi 09:00–14:00 gibi güne göre değişen bir
program şu anda ifade edilemez.

## 5. Görüşmeleri yanıtlama

Admin paneli → **Canlı Destek** → **Görüşmeler** sekmesi

Yanıt bekleyen görüşme sayısı sol menüde kırmızı rozet olarak görünür ve
Realtime ile anlık güncellenir — operatör panelin herhangi bir sayfasındayken
yeni sohbeti fark eder.

Durumlar: **Bekliyor** (henüz yanıtlanmadı) → **Görüşmede** (ilk operatör
yanıtıyla otomatik) → **Kapalı**.

## 6. Otomatik etiketleme

**Admin → Canlı Destek → Etiketler** sekmesi

Ziyaretçi mesaj yazdığında, kuralların anahtar kelimelerinden biri metinde
geçiyorsa görüşme o etiketi otomatik alır. Bir görüşme birden fazla etiket
alabilir. Eşleşme büyük/küçük harf ve Türkçe karakter farkı gözetmez —
`görüş` yazmanız *Görüş / GÖRÜŞ / gorus* hepsini yakalar.

- Yalnızca **ziyaretçi** mesajları değerlendirilir; operatörün yazdıkları
  etiket tetiklemez.
- Operatör panodan etiketi elle ekleyip kaldırabilir; otomatik kural bunu
  ezmez, yalnızca yeni etiket ekler.
- Sayfadaki **“Kuralları Deneyin”** kutusuna örnek bir mesaj yazıp hangi
  etiketleri alacağını canlıda görebilirsiniz.

Kurulumla gelen etiketler: Randevu, İkinci Görüş, Checkup, Obezite,
Fiyat & Ödeme, Sağlık Turizmi, Acil, Şikâyet, Anlaşmalı Kurum,
Tetkik & Sonuç, Gebe Okulu, Doktor Sorgu.

**Renkler hakkında:** bir palette en fazla ~8 renk gerçekten ayırt edilebilir.
Bu yüzden 6 renk konu kimliğini taşır, 2 renk dikkat durumlarına (Acil,
Şikâyet) ayrıldı, kalan etiketler bilinçli olarak nötr gri kullanır — onlarda
kimliği rozetin **yazısı** taşır. Renk değiştirecekseniz Acil ile Şikâyet'i
birbirine yaklaştırmayın.

## 7. Raporlar

**Admin → Canlı Destek → Rapor** sekmesi (7 / 30 / 90 gün)

- Görüşme sayısı, yanıtlanmamış görüşmeler, ortalama ve medyan ilk yanıt
  süresi, yanıtlanma oranı
- Günlük seyir (tablo görünümü de var), saatlere göre yoğunluk
- Konu dağılımı (etiketlere göre), operatör aktivitesi

Saat bazlı her şey **Europe/Istanbul**'a göre hesaplanır. "Saatlere göre
yoğunluk" grafiği çalışma saatlerini doğru ayarlamak için en pratik veridir.

## 8. Operatör ekibi (çoklu agent)

**Admin → Canlı Destek → Ekip** sekmesi

Kullanıcı seçip operatör yaparsınız. Üç alan önemli:

- **Ziyaretçiye görünen ad** — sohbette bu görünür. Gerçek ad soyad yazmak
  zorunda değilsiniz ("Hasta Danışmanı Ayşe" yeterli).
- **Rol** — *Operatör* kendine atanan + havuzdaki görüşmeleri görür.
  *Süpervizör* hepsini görür, devredebilir, tüm raporu alır.
- **Eş zamanlı görüşme tavanı** — bu sayıya ulaşınca otomatik atama başkasına gider.

> **Önemli:** Liste boşken tüm yöneticiler canlı desteğe erişir (geriye dönük
> uyum). **İlk operatörü eklediğiniz anda erişim bu listeyle sınırlanır** —
> listede olmayan bir yönetici artık hasta sohbetlerini göremez. Migration
> mevcut adminleri süpervizör olarak otomatik ekler, kimse erişimini kaybetmez.

### Atama nasıl çalışır

Yeni görüşme, o an müsait ve **en az yüklü** operatöre otomatik atanır.
En az yüklü seçimi round-robin'den iyidir: round-robin uzun süren görüşmeleri
saymaz, biri 5 zor vakayla boğuşurken ona 6.'yı yollar.

Müsait kimse yoksa görüşme **havuzda** bekler. Canlı Destek ekranındaki üç
sekme: `Bana Atananlar` · `Havuz` · `Tümü`. Havuzdaki bir görüşmeyi
**"Bana Ata"** ile üstlenirsiniz; iki operatör aynı anda basarsa yalnızca biri
kazanır, diğerine "başka bir operatör aldı" denir.

**Devretme** için başlıktaki ok simgesi: müsait danışmanlar yükleriyle
listelenir, seçtiğinizde transkripte sistem notu düşer ve ziyaretçi de görür.

### Müsaitlik durumu

Panelin sağ üstündeki açılır menü: **Müsait / Meşgul / Çevrimdışı**. Panel
açıkken 30 saniyede bir sinyal gider; 90 saniyeden eski sinyal çevrimdışı
sayılır. Sekme arka plana geçince otomatik "Meşgul" olur.

> Bu durum **widget'a yansımaz**. Çağrı merkezi 7/24 çalışıyor; heartbeat bir
> aksaklıkla dursa widget "çevrimdışı" derdi ve teknik bir arıza doğrudan
> hasta erişimine dönüşürdü. Ziyaretçi her koşulda yeşil nokta görür.

## 9. Operatör bildirimleri

Panelin sağ üstünde iki düğme var:

- **Hoparlör** — yeni mesaj geldiğinde kısa bir uyarı sesi çalar (varsayılan açık).
  Tarayıcılar sayfa ile etkileşime girilmeden ses çalmaya izin vermez; panelde
  bir yere tıkladıktan sonra çalışır.
- **Zil** — masaüstü bildirimi. İlk açışta tarayıcı izin ister. Bildirim yalnızca
  sekme **arka plandayken** gösterilir; operatör ekrana bakıyorsa rahatsız etmez.

Tercih tarayıcıda saklanır, her operatör kendi ayarını yapar. Ayrıca okunmamış
sayısı sekme başlığına da yazılır: `(3) Anadolu Hastaneleri Grubu`.

## 10. Hazır yanıtlar

**Admin → Canlı Destek → Hazır Yanıtlar** sekmesi

Operatör yanıt kutusuna `/` yazınca liste açılır; kısayolun ilk harflerini
yazıp **↑↓** ile seçer, **Enter** veya **Tab** ile metni kutuya basar. Metin
gönderilmeden önce düzenlenebilir.

Kurulumla 8 yanıt gelir (`/selam`, `/bekle`, `/randevu`, `/bolum`, `/sgk`,
`/fiyat`, `/ikinci`, `/kapanis`). Hangi metnin ne kadar kullanıldığı sayılır ve
raporda görünür.

## 11. Dosya eki (varsayılan KAPALI)

Açmadan önce Supabase'de bucket oluşturun:

**Storage → New bucket** → ad: `chat-attachments` → **Public bucket: açık** →
Create. İsterseniz *File size limit* 5 MB, *Allowed MIME types* olarak
`image/jpeg, image/png, image/webp, application/pdf` girin.

Sonra **Admin → Canlı Destek → Ayarlar → Dosya eki gönderilebilsin** kutusunu
işaretleyin.

> **Gizlilik notu — bilerek karar verin.** Bucket herkese açıktır. Dosya adları
> tahmin edilemez rastgele UUID'ye çevrilir ve adres yalnızca görüşme
> transkriptinde görünür; ancak adresi ele geçiren biri dosyayı açabilir.
> Sistemin geri kalanı token ile korunuyorken dosyalar bu korumanın dışındadır.
> Hasta raporu gibi belgeler için kabul edilebilir olup olmadığına karar verin —
> kapalı bırakırsanız ataç düğmesi hiç görünmez.
>
> Gerçekten gizli tutulması gerekiyorsa doğru çözüm, imzalı URL üreten bir Edge
> Function'dır; bu kurulumda yok.

## 12. Memnuniyet anketi

Görüşme kapandığında ziyaretçiye otomatik olarak 1–5 yıldız ve isteğe bağlı
yorum kutusu gösterilir. Bir görüşme yalnızca **bir kez** puanlanabilir.

Puan operatör panosunda görüşme başlığında rozet olarak, yorum ise transkriptin
sonunda görünür. Ortalama, dağılım ve son yorumlar rapor sayfasındadır.

## 13. Transkript dışa aktarma

Görüşme başlığındaki iki düğme:

- **CSV** — Excel'de açılır (UTF-8 BOM'lu, noktalı virgül ayraçlı). Görüşme
  künyesi + tüm mesajlar.
- **Yazdır** — yazdırma penceresi açar; tarayıcının “PDF olarak kaydet”
  seçeneğiyle PDF üretirsiniz. Ek kütüphane kurulmadı.

KVKK kapsamında bir veri talebi geldiğinde bu iki çıktı yeterlidir.

---

## Güvenlik modeli — neden böyle kurgulandı

Sohbet içeriği hasta verisi barındırır (isim, telefon, şikâyet). Bu yüzden
`anon` rolüne `chat_conversations` ve `chat_messages` tabloları üzerinde
**hiçbir doğrudan yetki verilmemiştir.**

Ziyaretçi yalnızca `SECURITY DEFINER` RPC'ler üzerinden, görüşme başlarken
üretilen `access_token` ile **kendi** görüşmesine erişebilir. Token tarayıcıda
`localStorage`'da (`ahg_chat_session`) tutulur. Token'ı bilmeyen biri — anon
anahtarı elinde olsa bile — başka bir görüşmeyi okuyamaz.

**Bunun bedeli:** anon rolünün `SELECT` hakkı olmadığı için Supabase Realtime
ziyaretçi tarafında çalışmaz. Widget bunun yerine açıkken 3 saniyede bir,
kapalıyken 20 saniyede bir yeni mesaj sorar (`chat_fetch_messages`, yalnızca
son görülen id'den sonrasını döner). Operatör tarafı giriş yapmış admin olduğu
için Realtime ile anlık çalışır.

Ek koruma: mesaj başına 4000 karakter, görüşme başına 500 mesaj sınırı
veritabanı seviyesinde uygulanır.

## "Yazıyor..." nasıl çalışıyor

Presence kanalı yerine `chat_typing` tablosu kullanılır ve bu tablo **bilerek
Realtime yayınına eklenmemiştir**. Her tuş vuruşu `chat_conversations`'ı
güncelleseydi operatör panosu saniyede birkaç kez tüm listeyi yeniden çekerdi.

Bunun yerine: yazma sinyali en fazla 4 saniyede bir gönderilir, sunucu sinyali
8 saniye geçerli sayar. Ziyaretçi bilgiyi zaten çalışan `chat_poll` turunda
alır; operatör yalnızca **seçili** görüşme için 3 saniyede bir sorar.

## Bilinen sınırlar

- Ziyaretçi tarafı yalnızca Türkçedir; site `i18n` yapısına henüz bağlanmadı.
- Dosya ekleri herkese açık bucket'tadır (bkz. yukarıdaki gizlilik notu).
- Şube bazında operatör yönlendirmesi yoktur; tüm görüşmeler tek havuzda toplanır.
- Mesai bitiminde açık kalan görüşme otomatik olarak e-posta/WhatsApp'a devredilmez.
