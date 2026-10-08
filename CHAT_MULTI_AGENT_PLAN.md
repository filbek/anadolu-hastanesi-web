# Çoklu Operatör (Multi-Agent) Planı — Canlı Destek

Birden fazla kişinin aynı anda görüşme yanıtlaması için gereken değişikliklerin
planı. Henüz **uygulanmadı** — bu bir tasarım dokümanıdır.

Mevcut sistem: `CHAT_SETUP.md`

---

## 1. Bugün nerede duruyoruz

| Konu | Bugünkü durum |
|---|---|
| Yetki | `chat_is_admin()` — `profiles.role` `admin` veya `super_admin` ise **her şeye** erişim |
| Görüşme sahipliği | `assigned_to` alanı var ama yalnızca ilk yanıtta otomatik doluyor, hiçbir yerde kullanılmıyor |
| Gelen kutusu | Bütün operatörler bütün görüşmeleri görüyor, filtre yok |
| Çevrimiçi durumu | Yok — widget yalnızca **çalışma saatlerine** bakıyor, gerçekten biri başında mı bilmiyor |
| Çakışma | İki operatör aynı görüşmeye aynı anda yazabilir, ikisi de diğerinden habersiz |
| Devretme | Yok |
| Rapor | Operatör başına yalnızca "kaç mesaj yazdı" |

### Asıl problem yetki modelinde

Bugün panele girebilen herkes (`admin`) **hasta sohbet transkriptlerini
okuyabiliyor**. İçerik editörü ile hasta danışmanı aynı yetkide. Bir hastane
için bu yanlış: doktor/haber içeriği düzenleyen kişinin hasta mesajlarını
görmesi gerekmiyor.

Ayrıca kod tabanında rol adlandırması zaten tutarsız — `AdminUsers.tsx`
`admin | editor | user` kullanıyor, `AdminRoute.tsx` ve `chat_is_admin()`
`admin | super_admin` bekliyor. Çoklu operatöre geçerken bu düzeltilmeli,
yoksa üstüne bir katman daha binecek.

---

## 2. Temel karar: ayrı bir `chat_agents` tablosu

`profiles.role`'e `chat_agent` diye bir değer daha eklemek cazip ama yanlış:
rol tek değerli, oysa biri hem içerik editörü hem hasta danışmanı olabilir.
Ayrıca operatöre özel alanlar (eş zamanlı görüşme tavanı, çevrimiçi durumu,
görünen ad) `profiles`'a ait değil.

```sql
CREATE TABLE public.chat_agents (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,          -- ziyaretçiye görünen ad
  avatar_url TEXT,
  -- 'agent'      : kendi + havuzdaki görüşmeleri görür
  -- 'supervisor' : hepsini görür, devredebilir, rapor alır
  agent_role TEXT NOT NULL DEFAULT 'agent'
    CHECK (agent_role IN ('agent', 'supervisor')),
  -- Aynı anda en fazla kaç aktif görüşme atanabilir
  max_concurrent INTEGER NOT NULL DEFAULT 5,
  -- 'online' | 'away' | 'offline'
  status TEXT NOT NULL DEFAULT 'offline',
  last_seen_at TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

Yetki fonksiyonları ikiye ayrılır:

```sql
chat_can_serve()      -- chat_agents'ta aktif kayıt VEYA super_admin
chat_is_supervisor()  -- agent_role = 'supervisor' VEYA super_admin
```

`chat_is_admin()` **kaldırılmaz**, `chat_can_serve()`'e delege eder — böylece
ayarlar/etiket/hazır yanıt sayfalarının RLS'i kırılmaz.

### Geriye dönük uyum

`chat_agents` boşsa `chat_can_serve()` bugünkü davranışa düşer (tüm adminler
operatördür). Böylece migration çalıştığı an hiçbir şey bozulmaz; ekip tabloyu
doldurdukça sistem kademeli olarak sıkılaşır.

---

## 3. Faz 1 — Operatör kimliği ve yetki

**Veritabanı**
- `chat_agents` tablosu + RLS (supervisor yazar, herkes kendi satırını okur)
- `chat_can_serve()` / `chat_is_supervisor()`
- `chat_conversations` ve `chat_messages` RLS'i güncellenir:
  - supervisor → hepsi
  - agent → `assigned_to = auth.uid()` **VEYA** `assigned_to IS NULL` (havuz)
- `chat_post_agent_message` içindeki yetki kontrolü `chat_can_serve()`'e geçer,
  ayrıca **atanmamış ya da kendine atanmış** görüşmeye yazabilir kuralı eklenir

**Arayüz**
- Yeni sayfa: **Admin → Canlı Destek Ekibi** (`AdminChatAgents.tsx`)
  - Kullanıcı seç → operatör yap, görünen ad, tavan, rol
- `AdminLayout` menüsünde canlı destek girişleri yalnızca `chat_can_serve()`
  olanlara gösterilir

**Kritik ayrıntı:** operatörün ziyaretçiye görünen adı artık
`profiles.full_name` değil `chat_agents.display_name` olur. "Dr. Ayşe Yılmaz"
yerine "Hasta Danışmanı Ayşe" yazdırmak isteyeceklerdir.

---

## 4. Faz 2 — Çevrimiçi durumu (presence)

Supabase Realtime presence yerine **heartbeat** kullanılır; sebebi bugünkü
mimariyle aynı: ziyaretçi tarafı Realtime'a bağlı değil ve widget'ın operatör
durumunu okuyabilmesi gerekiyor.

- Panel açıkken 30 saniyede bir `chat_agent_heartbeat()` çağrılır
- `last_seen_at` 90 saniyeden eskiyse operatör **offline** sayılır
- Operatör elle "Müsait / Meşgul / Çevrimdışı" seçebilir
- Sekme gizlendiğinde (`visibilitychange`) otomatik `away`

### Widget üzerindeki etkisi — KARAR VERİLDİ

Presence **yalnızca operatör panosunda** kullanılacak; **widget'a
yansıtılmayacak.**

Gerekçe: çağrı merkezi 7/24 çalışıyor ve hastane için "çevrimdışı" görünmek
kabul edilemez (`chat_settings.is_24_7`). Presence'i widget'ın yeşil noktasına
bağlarsak, gece vardiyasında biri paneli kapatmayı unuttuğunda ya da heartbeat
bir aksaklıkla dursa widget "çevrimdışı" der — hasta da aramaktan vazgeçer.
Bu, teknik bir arızanın doğrudan hasta erişimine dönüşmesi demektir.

Dolayısıyla presence şunlar için kullanılacak:
- otomatik atamada kimin müsait olduğunu bilmek,
- supervisor'ın vardiyayı görmesi,
- havuzda bekleyen görüşme varken kimse çevrimiçi değilse **yöneticiye** uyarı.

Widget her koşulda yeşil kalır.

---

## 5. Faz 3 — Atama ve havuz

### Otomatik atama

Yeni görüşme açıldığında `chat_conversations` üzerinde `AFTER INSERT` trigger:

```
uygun = chat_agents WHERE is_active
                      AND status = 'online'
                      AND last_seen_at > now() - 90 sn
                      AND aktif_görüşme_sayısı < max_concurrent
sırala: aktif_görüşme_sayısı ASC, last_seen_at DESC   -- en az yüklü
uygun boşsa: assigned_to NULL kalır (havuz)
```

**En az yüklü (least-loaded)**, round-robin'den iyi: round-robin uzun süren
görüşmeleri saymaz, biri 5 zor vakayla boğuşurken ona 6.'yı yollar.

Trigger içinde çalışması dış servis gerektirmemesi açısından doğru; tek
sınırı tarayıcının gerçekten açık olduğunu bilememesi — heartbeat tazeliği
bunu telafi eder.

### Havuz

Kimseye atanmayan görüşmeler "Havuz" sekmesinde birikir. Herhangi bir operatör
**"Bana ata"** ile alabilir. Yarış koşulunu önlemek için koşullu güncelleme:

```sql
UPDATE chat_conversations
SET assigned_to = auth.uid(), assigned_name = ...
WHERE id = $1 AND assigned_to IS NULL   -- <-- kilit burada
RETURNING id;
```

Boş dönerse "Bu görüşmeyi başka bir operatör aldı" uyarısı gösterilir.

### Gelen kutusu sekmeleri

`Bana Atananlar` · `Havuz` · `Tümü` (supervisor) — mevcut durum filtrelerinin
yanına eklenir. Varsayılan **Bana Atananlar**.

Sidebar rozeti de değişir: bugün tüm okunmamışları sayıyor, çoklu operatörde
**kendi atananları + havuz** sayması gerekir, yoksa herkes herkesin rozetini
görür ve rozet anlamını yitirir.

---

## 6. Faz 4 — Çakışma önleme ve devretme

### Aynı görüşmeye iki operatör

`chat_typing` tablosu zaten var; `agent_id` sütunu eklenip "şu an bu görüşmeyi
**Ayşe** yanıtlıyor" uyarısı gösterilir. Ayrıca görüşmeyi açan operatör için
hafif bir "görüntüleniyor" kaydı (`chat_conversation_viewers`) tutulabilir.

Sert kilit koymamayı öneririm — supervisor'ın devralabilmesi gerekir; uyarı
yeterli.

### Devretme

- "Devret" düğmesi → müsait operatör listesi + isteğe bağlı not
- Transkripte sistem mesajı düşer: *"Görüşme Ayşe'den Mehmet'e devredildi."*
- Ziyaretçiye de görünür (sistem baloncuğu olarak zaten destekleniyor)

### Denetim izi

```sql
CREATE TABLE public.chat_conversation_events (
  id BIGSERIAL PRIMARY KEY,
  conversation_id UUID REFERENCES chat_conversations(id) ON DELETE CASCADE,
  event TEXT,            -- assigned | transferred | closed | reopened | claimed
  actor_id UUID,
  actor_name TEXT,
  target_id UUID,        -- devirde hedef operatör
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

KVKK açısından da değerli: bir transkripte kimin, ne zaman dokunduğu kayıtlı olur.

---

## 7. Faz 5 — Raporlama

`chat_stats` içindeki `agents` bloğu genişletilir; ayrıca operatör bazlı yeni
bir RPC (`chat_agent_stats`) eklenir:

- Üstlenilen görüşme sayısı
- Ortalama **ilk yanıt** süresi (bugün yalnızca genel ortalama var)
- Ortalama memnuniyet puanı (görüşmeyi kapatan operatöre göre)
- Çevrimiçi kalma süresi (heartbeat kayıtlarından)
- Devredilen / devralınan görüşme sayısı

Supervisor ekibin tamamını, agent yalnızca kendi rakamlarını görür.

---

## 8. Riskler ve dikkat edilecekler

**Realtime yükü — en somut risk.** Bugün her değişiklikte `loadConversations()`
tüm listeyi baştan çekiyor. Tek operatörle sorun değil; 6-8 operatörde her
mesaj 8 kez tam liste sorgusu demek. Faz 3'ten önce aboneliğin artımlı
güncellemeye (payload'daki satırı state'te değiştirmek) çevrilmesi gerekir.
Bunu bir ön koşul olarak planlıyorum, sonradan yamamak zor.

**Heartbeat gürültüsü.** 30 saniyede bir yazma, 8 operatörde saatte ~960 UPDATE.
Sorun değil, ama `chat_agents` Realtime yayınına **eklenmemeli** — yoksa her
heartbeat herkese olay yollar. (`chat_typing`'de aldığımız kararın aynısı.)

**RLS'i daraltmak mevcut veriyi gizleyebilir.** Agent'lar yalnızca kendi +
havuz görüşmelerini görmeye başlayınca, geçmiş görüşmelerin `assigned_to`
alanı boş olanlar havuza düşer, dolu olanlar o kişide kalır. Migration'da
geçmişi ne yapacağımıza karar vermeliyiz — önerim: 30 günden eski kapalı
görüşmeleri yalnızca supervisor görsün.

**Otomatik atama sessizce başarısız olabilir.** Kimse müsait değilken görüşme
havuzda kalır; havuz sekmesi izlenmezse görüşme kaybolur. Havuzdaki görüşme
5 dakikayı geçerse tüm operatörlere sesli uyarı vermeyi öneriyorum.

---

## 9. Sıralama ve efor

| Faz | İçerik | Bağımlılık | Tahmini efor |
|---|---|---|---|
| **0** | Realtime aboneliğini artımlı güncellemeye çevir | — | Küçük |
| **1** | `chat_agents`, yetki fonksiyonları, ekip sayfası | 0 | Orta |
| **2** | Heartbeat, durum seçici, widget'ta 3. durum | 1 | Küçük–Orta |
| **3** | Otomatik atama, havuz, gelen kutusu sekmeleri, rozet | 1, 2 | Orta–Büyük |
| **4** | Çakışma uyarısı, devretme, denetim izi | 3 | Orta |
| **5** | Operatör raporları | 3 | Küçük |

Faz 0-1-2 birlikte anlamlı bir teslimat oluşturur: ekip tanımlanır, kim müsait
görülür, ama atama hâlâ elle yapılır. Faz 3 asıl kazancı getirir.

## 10. Dokunulacak dosyalar

| Dosya | Değişiklik |
|---|---|
| `src/sql/live_chat_agents_migration.sql` | **yeni** — tablolar, RLS, atama trigger'ı, RPC'ler |
| `src/services/chatService.ts` | operatör CRUD, heartbeat, atama, devretme, artımlı realtime |
| `src/components/admin/AdminChatAgents.tsx` | **yeni** — ekip yönetimi |
| `src/components/admin/AdminLiveChat.tsx` | sekmeler, "Bana ata", devret, çakışma uyarısı |
| `src/components/admin/AdminLayout.tsx` | durum seçici, rozet mantığı, menü görünürlüğü |
| `src/components/admin/AdminChatStats.tsx` | operatör raporu bölümü |
| `src/components/chat/ChatWidget.tsx` | üçüncü çevrimiçi durumu |
| `src/App.tsx` | yeni rota |
