-- Hastane profillerindeki "Adres ve İletişim" sekmesinde gösterilen ulaşım
-- bilgileri için sütun ekler ve mevcut içerikleri yükler.
-- Supabase Dashboard > SQL Editor'de çalıştırın:
-- https://supabase.com/dashboard/project/cfwwcxqpyxktikizjjxx/sql/new
--
-- İçerik formatı (admin panelindeki "Ulaşım Bilgileri" alanı da aynı formatı kullanır):
--   Bölüm başlığı kendi satırına yazılır, maddeler "- " ile başlar,
--   bölümler boş satırla ayrılır.

ALTER TABLE hospitals ADD COLUMN IF NOT EXISTS transportation_info text;

UPDATE hospitals SET transportation_info = 'Toplu Taşıma ile Ulaşım
- Silivri''nin tüm köylerinden minibüsle hastaneye ulaşım sağlanabilmektedir.
- Silivri Anadolu Hastanesi yakınından geçen otobüs hatları: 300G - 300A - 300C - 300B

İstanbul Havalimanı Ulaşımı
- İstanbul Havalimanı''ndan Havaİst ile Silivri''ye doğrudan ulaşabilirsiniz.'
WHERE slug = 'ozel-silivri-anadolu-hastanesi';

UPDATE hospitals SET transportation_info = 'Hastane Yakınından Geçen Otobüs Hatları
- HS2 - A43 - 144A - 142 - 142F - 142ES - 76D

Toplu Taşıma ile Ulaşım
- Metrobüs: Avcılar (Merkez) / Şükrübey durağı
- Metro: M1A/M1B, M2, M3, M4, M5 hatlarından Metrobüs''e aktarma ile ulaşım
- Otobüs/Minibüs: Avcılar, Beylikdüzü, Esenyurt, Küçükçekmece, Bakırköy yönlerinden sık hatlarla Avcılar merkeze ulaşım

Anadolu Yakasından Gelenler
- Kadıköy–Söğütlüçeşme / Ünalan: Marmaray veya M4 ile Ünalan''a gelin, Metrobüs''e geçin; Avcılar (Şükrübey) durağında inin.
- Kartal–Pendik–Tuzla: M4 ile Ünalan, ardından Metrobüs → Avcılar (Merkez).
- Ümraniye–Çekmeköy: M5 ile Üsküdar/Altunizade, Metrobüs aktarması → Avcılar (Merkez).

Avrupa Yakasından Gelenler
- Büyükçekmece–Beylikdüzü–Esenyurt–Küçükçekmece: En yakın Metrobüs istasyonundan Avcılar (Merkez) durağına gelin.
- Beşiktaş–Şişli–Taksim–Kağıthane: M2 ile Mecidiyeköy, Metrobüs aktarması → Avcılar (Merkez).
- Fatih–Eminönü–Zeytinburnu–Bakırköy: T1 Tramvay ile Cevizlibağ, Metrobüs aktarması → Avcılar (Merkez).

Havalimanlarından Ulaşım
- İstanbul Havalimanı (IST): Havaist/otobüs ile Yenibosna veya Cevizlibağ''a gelin, Metrobüs ile Avcılar (Merkez).
- Sabiha Gökçen (SAW): M4 ile Ünalan, Metrobüs aktarması ile Avcılar (Merkez).

Otogarlardan Ulaşım
- 15 Temmuz Demokrasi Otogarı (Esenler): M1A/M1B ile Merter/Zeytinburnu/Yenikapı aktarma noktalarından Metrobüs''e geçin; Avcılar (Merkez).
- Alibeyköy Cep Otogarı: T5 Tramvay ile Eminönü yönüne gelip Cevizlibağ''da Metrobüs''e aktarma; Avcılar (Merkez).

Tren Garı / Marmaray Üzerinden Ulaşım
- Halkalı (Marmaray): Halkalı''dan otobüs/minibüsle Avcılar merkeze geçiş veya Marmaray → Yenikapı bağlantısıyla Metrobüs''e aktarma.
- Sirkeci / Üsküdar (Marmaray): Marmaray ile Yenikapı (veya Anadolu yakasında Ayrılık Çeşmesi–Ünalan) üzerinden Metrobüs''e aktarma; Avcılar (Merkez).

Not
- Avcılar (Merkez/Şükrübey) durağından hastaneye kısa yürüyüş veya minibüs/taksi ile ulaşım mümkündür.
- Özel araçla ulaşım için E-5/D100 üzerinden Avcılar merkeze kolay erişim sağlanır.'
WHERE slug = 'ozel-avcilar-anadolu-hastanesi';
