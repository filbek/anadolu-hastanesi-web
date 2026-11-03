# Form E-posta Bildirimleri — Kurulum

Web sitesindeki formlar (İkinci Görüş, İletişim, Hasta Geri Bildirim, Kariyer
İş Başvurusu, Sağlık Turizmi) admin panelinde belirlenen e-posta adreslerine
bildirim gönderir.

**Canlıdaki düzen:** Gönderim **Resend API** üzerinden yapılır; kurum posta
kutuları **Google Workspace (Gmail)** üzerindedir (MX: `smtp.google.com`).
Yaanimail'den Gmail'e geçiş gönderimi etkilemez, çünkü mailler Resend'den çıkar
ve yalnızca alıcı tarafı Gmail'dir.

Edge Function iki gönderim yolunu destekler: `SMTP_HOST` secret'ı tanımlıysa
**SMTP**, tanımlı değilse **Resend API** kullanılır. Canlıda `SMTP_HOST`
**tanımlı olmamalıdır**.

| Form | Alıcı | site_settings kolonu |
| --- | --- | --- |
| İkinci Görüş | Seçilen şubeye göre (aşağıda) | `second_opinion_hospital_emails`, yoksa `second_opinion_email` |
| İletişim ("Bize Yazın") | Seçilen şubenin hasta hakları adresi | `contact_hospital_emails`, yoksa `contact_form_email` |
| Hasta Geri Bildirim ("Sizi Dinliyoruz") | Seçilen şubenin hasta hakları adresi | `feedback_hospital_emails`, yoksa `feedback_form_email` |
| İş Başvurusu (Kariyer) | isbasvuru@anadoluhastaneleri.com | `career_form_email` |
| Sağlık Turizmi | bekir.filizdag@anadoluhastaneleri.com | `health_tourism_email` |

**Şube bazlı alıcılar** (İkinci Görüş, Bize Yazın ve Sizi Dinliyoruz formlarında
hastane seçimi zorunludur):

| Şube | İkinci Görüş | Bize Yazın / Sizi Dinliyoruz |
| --- | --- | --- |
| Silivri | elif.vardar@ | silivri.hastahaklari@ |
| Ereğli | tugba.uzuner@ | eregli.hastahaklari@ |
| Avcılar | asine.ozkilic@ | avcilar.hastahaklari@ |

Eşlemeler hastane id'si → e-posta biçiminde `site_settings` içinde JSONB olarak
tutulur ve Admin → Site Ayarları → Form Bildirim Ayarları'ndan değiştirilir.
Eşlemesi olmayan şube, formun genel adresine düşer. Kurulum:
`src/sql/form_hospital_routing_migration.sql`.

> ⚠️ Admin → WhatsApp Yönlendirme'de bir şube için kural tanımlanırsa o şubenin
> formu e-posta yerine WhatsApp'a yönlendirilir.

Aşağıdaki adımlar **tek seferlik** kurulum içindir; canlıda tamamlanmıştır.

---

## 1. Veritabanı migration'ını çalıştır

Supabase Dashboard → **SQL Editor** → `src/sql/email_notifications_migration.sql`
içeriğini yapıştırıp **Run**.

Bu şunları ekler:
- `site_settings` tablosuna `contact_form_email` ve `feedback_form_email` kolonları
- İletişim formu başvuruları için `contact_submissions` tablosu

Ardından `src/sql/career_email_isbasvuru_migration.sql` dosyasını da çalıştır —
iş başvurusu bildirim adresini `isbasvuru@anadoluhastaneleri.com` yapar.
(Admin panelinden bilerek başka bir adres girilmişse dokunmaz.)

## 2. Resend hesabı ve domain doğrulaması

1. https://resend.com hesabında **API Keys** → **Create API Key** → anahtarı
   kopyala (`re_...`).
2. **Domains** → `anadoluhastaneleri.com` eklenmiş ve **Verified** durumda olmalı.
   - ⚠️ Domain doğrulanmadan e-postalar yalnızca Resend hesabının sahibine,
     `onboarding@resend.dev` adresinden gönderilebilir.

### Gerekli DNS kayıtları (Cloudflare)

| Kayıt | Değer | Amaç |
| --- | --- | --- |
| `anadoluhastaneleri.com` MX | `smtp.google.com` | Gelen posta (Gmail) |
| `anadoluhastaneleri.com` TXT (SPF) | `v=spf1 include:_spf.google.com include:feedback.resend.com -all` | Gönderici yetkisi |
| `resend._domainkey` TXT | Resend panelindeki DKIM anahtarı | Resend imzası |
| `send` MX / TXT | Resend panelindeki `amazonses.com` kayıtları | Resend geri dönüş (bounce) |
| `_dmarc` TXT | `v=DMARC1; p=none; ...` | DMARC raporlama |

> Yaanimail artık kullanılmadığından SPF'teki `include:_cspf.yaanimail.com`
> kaldırılabilir. Google ve Resend kayıtlarına **dokunma**; biri silinirse ya
> gelen posta ya da form bildirimleri durur.

## 3. Secret'ları tanımla

Proje kökünde (Supabase CLI ile giriş yaptıktan sonra):

```bash
supabase secrets set RESEND_API_KEY=re_xxxxxxxxxxxxxxxxx
supabase secrets set RESEND_FROM="Anadolu Hastaneleri <bildirim@anadoluhastaneleri.com>"
```

> `RESEND_FROM` adresi, Resend'de **doğrulanmış domaine** ait olmalıdır.
> Tanımlanmazsa varsayılan `onboarding@resend.dev` kullanılır (yalnızca test için).

> ⚠️ Anahtarı bu dosyaya, `.env`e veya herhangi bir commit'e **yazma**; yalnızca
> `supabase secrets set` ile sakla.

`SMTP_HOST` tanımlı kalırsa Resend yerine SMTP denenir. Eski yaanimail ayarları
(`csmtp.yaanimail.com`) artık geçersiz olduğundan, tanımlıysa kaldır:

```bash
supabase secrets unset SMTP_HOST SMTP_PORT SMTP_USER SMTP_PASSWORD SMTP_FROM
```

`SUPABASE_URL` ve `SUPABASE_SERVICE_ROLE_KEY` Edge Function ortamında otomatik
gelir; ayrıca tanımlamana gerek yoktur.

## 4. Edge Function'ı dağıt (deploy)

```bash
supabase functions deploy send-form-email
```

> Fonksiyon `supabase/config.toml` içinde `verify_jwt = false` ile tanımlıdır;
> böylece siteyi ziyaret eden (giriş yapmamış) kullanıcılar formu gönderebilir.

## 5. Alıcı e-postalarını ayarla

Admin Panel → **Site Ayarları** → **Form Bildirim Ayarları** bölümünden her form
için alıcı adresini gir ve **Kaydet**. Alıcı adresi güvenlik için her zaman
sunucu tarafında bu ayarlardan okunur (frontend'den manipüle edilemez).

---

## Test

1. Sitedeki formlardan birini doldurup gönder.
2. Resend → **Emails** listesinde gönderimin **Delivered** olduğunu kontrol et.
3. Alıcı Gmail kutusunda maili ara — **Spam** klasörüne de bak. "Delivered",
   Gmail'in maili kabul ettiğini gösterir; gelen kutusuna düştüğünü garanti etmez.
4. Mail Resend'de hiç görünmüyorsa: Supabase Dashboard → **Edge Functions →
   send-form-email → Logs**.

## Nasıl çalışıyor?

```
Form gönderimi
  └─ Veritabanına kaydedilir (second_opinion_submissions / patient_feedback / contact_submissions /
     job_applications / health_tourism_submissions)
  └─ supabase.functions.invoke('send-form-email', { formType, data })
        └─ Edge Function site_settings'ten ilgili alıcıyı okur
           (önce seçilen şubenin adresi, yoksa formun genel adresi)
        └─ Resend API ile gönderir (SMTP_HOST tanımlıysa SMTP)
        └─ Alıcı posta kutusu Google Workspace (Gmail)
```

E-posta gönderimi başarısız olsa bile başvuru veritabanına kaydedildiği için
**veri kaybı olmaz**; başvuru admin panelindeki ilgili listede görünmeye devam eder.
