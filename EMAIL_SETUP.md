# Form E-posta Bildirimleri — Kurulum

Web sitesindeki formlar (İkinci Görüş, İletişim, Hasta Geri Bildirim, Kariyer
İş Başvurusu) admin panelinde belirlenen e-posta adreslerine bildirim gönderir.

İki gönderim yolu desteklenir; Edge Function `SMTP_HOST` secret'ı tanımlıysa
**kurumsal SMTP**, tanımlı değilse **Resend API** kullanır.

| Form | Varsayılan alıcı | site_settings kolonu |
| --- | --- | --- |
| İkinci Görüş | info@anadoluhastaneleri.com | `second_opinion_email` |
| İletişim | info@anadoluhastaneleri.com | `contact_form_email` |
| Hasta Geri Bildirim | hastahaklari@anadoluhastaneleri.com | `feedback_form_email` |
| **İş Başvurusu (Kariyer)** | **isbasvuru@anadoluhastaneleri.com** | `career_form_email` |

Bu özelliğin canlıda çalışması için aşağıdaki **tek seferlik** kurulum adımları
tamamlanmalıdır.

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

## 2A. Seçenek A — Kurumsal SMTP (önerilen: DNS doğrulaması gerektirmez)

Gönderim, hastanenin kendi posta kutusu üzerinden yapılır. Adres zaten kurumun
kendi domaininde olduğu için SPF/DKIM doğrulama süreci gerekmez.

```bash
supabase secrets set SMTP_HOST=csmtp.yaanimail.com
supabase secrets set SMTP_PORT=587                 # 587 = STARTTLS, 465 = doğrudan TLS
supabase secrets set SMTP_USER=isbasvuru@anadoluhastaneleri.com
supabase secrets set SMTP_PASSWORD='<posta kutusu şifresi>'
supabase secrets set SMTP_FROM="Anadolu Hastaneleri <isbasvuru@anadoluhastaneleri.com>"
```

> ⚠️ Şifreyi bu dosyaya, `.env`e veya herhangi bir commit'e **yazma**; yalnızca
> `supabase secrets set` ile sakla. Secret'lar Supabase tarafında şifreli tutulur.

Posta kutusunu bir mail istemcisinden (Outlook, Thunderbird, telefon) okumak için:

| Ayar | Sunucu | Port | Güvenlik |
| --- | --- | --- | --- |
| Gelen (IMAP) | cimap.yaanimail.com | 993 | SSL/TLS |
| Giden (SMTP) | csmtp.yaanimail.com | 587 | STARTTLS |

IMAP yalnızca posta **okumak** içindir; site bildirimleri için gereken tek şey
yukarıdaki SMTP ayarlarıdır.

## 2B. Seçenek B — Resend hesabı + API anahtarı

`SMTP_HOST` tanımlı **değilse** bu yol kullanılır.

1. https://resend.com adresinden ücretsiz hesap aç.
2. **API Keys** → **Create API Key** → anahtarı kopyala (`re_...`).
3. **Domains** → hastanenin alan adını ekle (örn. `anadoluhastaneleri.com`) ve
   gösterilen DNS kayıtlarını (SPF/DKIM) ekleyerek **doğrula**.
   - ⚠️ Domain doğrulanana kadar e-postalar yalnızca Resend hesabının sahibine,
     `onboarding@resend.dev` adresinden gönderilebilir. Gerçek alıcılara mail
     gitmesi için domain doğrulaması zorunludur.

## 3. Resend secret'larını tanımla (yalnızca Seçenek B)

Proje kökünde (Supabase CLI ile giriş yaptıktan sonra):

```bash
# Proje dizininde
supabase secrets set RESEND_API_KEY=re_xxxxxxxxxxxxxxxxx
supabase secrets set RESEND_FROM="Anadolu Hastaneleri <bildirim@anadoluhastaneleri.com>"
```

> `RESEND_FROM` adresi, Resend'de **doğruladığın domaine** ait olmalıdır.
> Tanımlanmazsa varsayılan `onboarding@resend.dev` kullanılır (yalnızca test için).

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
2. Belirlenen alıcı e-posta kutusunu kontrol et.
3. Sorun olursa: Supabase Dashboard → **Edge Functions → send-form-email → Logs**.

## Nasıl çalışıyor?

```
Form gönderimi
  └─ Veritabanına kaydedilir (second_opinion_submissions / patient_feedback / contact_submissions)
  └─ supabase.functions.invoke('send-form-email', { formType, data })
        └─ Edge Function site_settings'ten ilgili alıcıyı okur
        └─ SMTP_HOST varsa kurumsal SMTP, yoksa Resend API ile gönderir
```

E-posta gönderimi başarısız olsa bile başvuru veritabanına kaydedildiği için
**veri kaybı olmaz**; başvuru admin panelindeki ilgili listede görünmeye devam eder.
