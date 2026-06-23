# Form E-posta Bildirimleri — Kurulum

Web sitesindeki üç form (İkinci Görüş, İletişim, Hasta Geri Bildirim) artık
admin panelinde belirlenen e-posta adreslerine **Resend** üzerinden e-posta gönderir.

Bu özelliğin canlıda çalışması için aşağıdaki **tek seferlik** kurulum adımları
tamamlanmalıdır.

---

## 1. Veritabanı migration'ını çalıştır

Supabase Dashboard → **SQL Editor** → `src/sql/email_notifications_migration.sql`
içeriğini yapıştırıp **Run**.

Bu şunları ekler:
- `site_settings` tablosuna `contact_form_email` ve `feedback_form_email` kolonları
- İletişim formu başvuruları için `contact_submissions` tablosu

## 2. Resend hesabı + API anahtarı

1. https://resend.com adresinden ücretsiz hesap aç.
2. **API Keys** → **Create API Key** → anahtarı kopyala (`re_...`).
3. **Domains** → hastanenin alan adını ekle (örn. `anadoluhastaneleri.com`) ve
   gösterilen DNS kayıtlarını (SPF/DKIM) ekleyerek **doğrula**.
   - ⚠️ Domain doğrulanana kadar e-postalar yalnızca Resend hesabının sahibine,
     `onboarding@resend.dev` adresinden gönderilebilir. Gerçek alıcılara mail
     gitmesi için domain doğrulaması zorunludur.

## 3. Supabase secret'larını tanımla

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
        └─ Resend API ile e-postayı gönderir
```

E-posta gönderimi başarısız olsa bile başvuru veritabanına kaydedildiği için
**veri kaybı olmaz**; başvuru admin panelindeki ilgili listede görünmeye devam eder.
