# Pusula HBYS Entegrasyon Talebi

**Gönderen:** Anadolu Hastaneleri Grubu — Kurumsal Web Projesi
**Alıcı:** Pusula HBYS Yetkilisi
**Tarih:** [ ]
**Konu:** Kurumsal web sitesi için salt-okunur doktor / bölüm / şube veri erişimi

---

Sayın Yetkili,

Anadolu Hastaneleri Grubu kurumsal web sitesinde yer alan hekim ve bölüm bilgileri
şu anda elle güncellenmektedir. Bu bilgiler Pusula HBYS içinde İnsan Kaynakları
birimi tarafından zaten tutulduğundan, mükerrer veri girişini ortadan kaldırmak ve
web sitesindeki bilgilerin güncelliğini garanti altına almak istiyoruz.

Bu amaçla Pusula tarafından **salt-okunur** bir servis erişimi talep ediyoruz.
Aşağıda talebin kapsamı ve netleştirilmesini rica ettiğimiz teknik hususlar yer
almaktadır.

## 1. Talep edilen veri kümeleri

Yalnızca aşağıdaki üç veri kümesi için okuma yetkisi talep edilmektedir:

**a) Hekim listesi**
- Hekim kimlik numarası (sistemdeki benzersiz ID)
- Ad, soyad, unvan
- Bağlı olduğu şube
- Bağlı olduğu bölüm / branş
- Aktif / pasif durumu
- Varsa: poliklinik çalışma günleri ve saatleri

**b) Bölüm ve branş listesi**
- Bölüm/branş kimlik numarası
- Bölüm/branş adı
- Hangi şubelerde hizmet verdiği

**c) Şube listesi**
- Şube kimlik numarası
- Şube adı

## 2. Talep edilmeyen veriler

Hasta bilgisi, randevu kayıtları, kimlik numarası, iletişim bilgisi, mali veri
veya tıbbi kayıt **talep edilmemektedir**. Servis hesabının yetkisinin yalnızca
yukarıdaki üç veri kümesiyle sınırlandırılmasını, KVKK kapsamındaki "amaçla
sınırlılık" ilkesi gereği özellikle rica ediyoruz.

## 3. Netleştirilmesini rica ettiğimiz teknik hususlar

| # | Soru | Cevap |
|---|------|-------|
| 1 | Servis hastane ağı dışından (internet üzerinden) erişilebilir durumda mı? | |
| 2 | Erişilebiliyorsa servis adresi (base URL) nedir? | |
| 3 | Kimlik doğrulama nasıl yapılıyor? (API key / kullanıcı-parola / OAuth2) | |
| 4 | Kaynak IP kısıtı uygulanıyor mu? Uygulanıyorsa beyaz listeye adres eklenebiliyor mu? | |
| 5 | Test/deneme ortamı mevcut mu? | |
| 6 | Saatlik veya günlük istek adedi sınırı var mı? | |
| 7 | Servis dokümantasyonu (Swagger / OpenAPI / Postman koleksiyonu / PDF) paylaşılabilir mi? | |
| 8 | Kayıt değişikliklerinde dışarı bildirim (webhook) gönderme yeteneği var mı? | |
| 9 | Erişim için imzalanması gereken bir sözleşme / veri paylaşım protokolü var mı? | |

## 4. Çalışma modeli

Web sitesi Pusula'ya doğrudan bağlanmayacaktır. Araya konumlandırılacak sunucu
tarafı bir servis, günde bir kez (gerekirse daha sık) Pusula'dan veriyi okuyacak
ve web sitesinin kendi veritabanını güncelleyecektir. Böylece:

- Pusula'ya yalnızca kontrollü ve sınırlı sayıda istek gider,
- Pusula erişilemediğinde web sitesi kesintisiz çalışmaya devam eder,
- Pusula'ya ait erişim anahtarı hiçbir şekilde son kullanıcı tarayıcısına düşmez.

Erişim anahtarı sunucu tarafında şifreli ortam değişkeni olarak saklanacak,
kaynak kod deposuna yazılmayacaktır.

Madde 3'teki sorulara alacağımız yanıtlar doğrultusunda entegrasyonun teknik
tasarımını tamamlayıp tarafınızla paylaşacağız.

Gereğini bilgilerinize arz ederiz.

**[Ad Soyad]**
[Unvan] — Anadolu Hastaneleri Grubu
[E-posta] · [Telefon]
