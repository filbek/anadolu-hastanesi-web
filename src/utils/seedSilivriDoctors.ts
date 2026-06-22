import { supabase } from '../lib/supabase';

// Vite glob import for silivri doctor images
const imageModules = import.meta.glob('../assests/silivri/*', { eager: true, as: 'url' });

// Departments list
export const DEPARTMENTS_LIST = [
  { name: 'Acil Servis', slug: 'acil-servis', icon: 'bi-heart-pulse-fill', category: 'dahili' },
  { name: 'Ağız ve Diş Sağlığı', slug: 'agiz-ve-dis-sagligi', icon: 'bi-heart-fill', category: 'cerrahi' },
  { name: 'Algoloji (Ağrı)', slug: 'algoloji-agri', icon: 'bi-activity', category: 'dahili' },
  { name: 'Anestezi ve Reanimasyon', slug: 'anestezi-ve-reanimasyon', icon: 'bi-hospital', category: 'cerrahi' },
  { name: 'Beslenme ve Diyet', slug: 'beslenme-ve-diyet', icon: 'bi-heart', category: 'dahili' },
  { name: 'Beyin ve Sinir Cerrahisi', slug: 'beyin-ve-sinir-cerrahisi', icon: 'bi-hospital', category: 'cerrahi' },
  { name: 'Biyokimya', slug: 'biyokimya', icon: 'bi-eyedropper', category: 'teshis' },
  { name: 'Check Up', slug: 'check-up', icon: 'bi-clipboard-pulse', category: 'teshis' },
  { name: 'Çocuk Cerrahisi', slug: 'cocuk-cerrahisi', icon: 'bi-hospital', category: 'cerrahi' },
  { name: 'Çocuk Kardiyoloji', slug: 'cocuk-kardiyoloji', icon: 'bi-heart-pulse-fill', category: 'dahili' },
  { name: 'Çocuk Sağlığı ve Hastalıkları', slug: 'cocuk-sagligi-ve-hastaliklari', icon: 'bi-heart', category: 'dahili' },
  { name: 'Çocuk ve Ergen Ruh Sağlığı', slug: 'cocuk-ve-ergen-ruh-sagligi', icon: 'bi-emoji-smile', category: 'dahili' },
  { name: 'Dermatoloji', slug: 'dermatoloji', icon: 'bi-person', category: 'dahili' },
  { name: 'Diyabet Polikliniği', slug: 'diyabet-poliklinigi', icon: 'bi-droplet', category: 'dahili' },
  { name: 'El ve Mikro Cerrahisi', slug: 'el-ve-mikro-cerrahisi', icon: 'bi-hospital', category: 'cerrahi' },
  { name: 'Endokrinoloji ve Metabolizma', slug: 'endokrinoloji-ve-metabolizma', icon: 'bi-activity', category: 'dahili' },
  { name: 'Enfeksiyon Hastalıkları ve Mikrobiyoloji', slug: 'enfeksiyon-hastaliklari-ve-mikrobiyoloji', icon: 'bi-virus2', category: 'dahili' },
  { name: 'Fizik Tedavi ve Rehabilitasyon', slug: 'fizik-tedavi-ve-rehabilitasyon', icon: 'bi-person-arms-up', category: 'dahili' },
  { name: 'Gastroenteroloji', slug: 'gastroenteroloji', icon: 'bi-hospital', category: 'dahili' },
  { name: 'Genel Cerrahi', slug: 'genel-cerrahi', icon: 'bi-bandaid-fill', category: 'cerrahi' },
  { name: 'Girişimsel Radyoloji', slug: 'girisimsel-radyoloji', icon: 'bi-radioactive', category: 'teshis' },
  { name: 'Göğüs Hastalıkları', slug: 'gogus-hastaliklari', icon: 'bi-lungs', category: 'dahili' },
  { name: 'Göz Sağlığı ve Hastalıkları', slug: 'goz-sagligi-ve-hastaliklari', icon: 'bi-eye', category: 'cerrahi' },
  { name: 'İç Hastalıkları (Dahiliye)', slug: 'ic-hastaliklari-dahiliye', icon: 'bi-hospital', category: 'dahili' },
  { name: 'Kadın Hastalıkları ve Doğum', slug: 'kadin-hastaliklari-ve-dogum', icon: 'bi-heart', category: 'cerrahi' },
  { name: 'Kalp ve Damar Cerrahisi', slug: 'kalp-ve-damar-cerrahisi', icon: 'bi-heart-pulse-fill', category: 'cerrahi' },
  { name: 'Kardiyoloji', slug: 'kardiyoloji', icon: 'bi-heart-pulse-fill', category: 'dahili' },
  { name: 'Kulak Burun Boğaz', slug: 'kulak-burun-bogaz', icon: 'bi-ear', category: 'cerrahi' },
  { name: 'Medikal Estetik', slug: 'medikal-estetik', icon: 'bi-stars', category: 'cerrahi' },
  { name: 'Medikal Onkoloji', slug: 'medikal-onkoloji', icon: 'bi-hospital', category: 'dahili' },
  { name: 'Nefroloji', slug: 'nefroloji', icon: 'bi-hospital', category: 'dahili' },
  { name: 'Nöroloji', slug: 'noroloji', icon: 'bi-hospital', category: 'dahili' },
  { name: 'Ortodonti', slug: 'ortodonti', icon: 'bi-heart-fill', category: 'cerrahi' },
  { name: 'Ortopedi ve Travmatoloji', slug: 'ortopedi-ve-travmatoloji', icon: 'bi-bandaid', category: 'cerrahi' },
  { name: 'Patoloji', slug: 'patoloji', icon: 'bi-eyedropper', category: 'teshis' },
  { name: 'Plastik Rekonstrüktif ve Estetik Cerrahi', slug: 'plastik-rekonstruktif-ve-estetik-cerrahi', icon: 'bi-stars', category: 'cerrahi' },
  { name: 'Psikiyatri', slug: 'psikiyatri', icon: 'bi-brain', category: 'dahili' },
  { name: 'Psikoloji', slug: 'psikoloji', icon: 'bi-emoji-smile', category: 'dahili' },
  { name: 'Radyoloji', slug: 'radyoloji', icon: 'bi-radioactive', category: 'teshis' },
  { name: 'Üroloji', slug: 'uroloji', icon: 'bi-hospital', category: 'cerrahi' },
  { name: 'Yenidoğan Yoğun Bakım Ünitesi (Neonatoloji)', slug: 'yenidogan-yogun-bakim-unitesi', icon: 'bi-heart', category: 'dahili' },
  { name: 'Yoğun Bakım', slug: 'yogun-bakim', icon: 'bi-activity', category: 'dahili' },
];

// Hospitals with correct names
export const HOSPITALS_DATA = [
  {
    name: 'Özel Silivri Anadolu Hastanesi',
    slug: 'ozel-silivri-anadolu-hastanesi',
    description: 'Silivri ve çevresine modern tıp altyapısı ve uzman kadrosuyla kapsamlı sağlık hizmeti sunuyoruz.',
    address: 'Alibey Mah. Atatürk Bulvarı No:42, Silivri / İstanbul',
    phone: '0212 728 10 00',
    email: 'silivri@anadoluhastaneleri.com',
    working_hours: 'Pazartesi - Cumartesi: 08:00 - 20:00, Pazar: 09:00 - 18:00',
    emergency_hours: '7/24 Acil Servis hizmet vermektedir.',
    images: ['https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=1200&q=80'],
    display_on_homepage: true,
    is_active: true,
    display_order: 1,
    hero_title: 'Özel Silivri Anadolu Hastanesi',
    hero_subtitle: 'Modern Tıp, Güvenilir Hizmet',
    map_url: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3007.386654996314!2d28.22231557684703!3d41.08239781485642!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14b515f472bcc11d%3A0xbd91d09240f204c5!2sMimar%20Sinan%2C%20%C3%96zel%20Silivri%20Anadolu%20Hst.%2C%2034570%20Silivri%2F%C4%B0stanbul%2C%20T%C3%BCrkiye!5e0!3m2!1str!2sus!4v1777931672976!5m2!1str!2sus',
    is_published: true,
  },
  {
    name: 'Özel Avcılar Anadolu Hastanesi',
    slug: 'ozel-avcilar-anadolu-hastanesi',
    description: 'Avcılar ve çevre ilçelere yönelik geniş poliklinik kadrosu ve ileri tanı-tedavi altyapısıyla hizmet veriyoruz.',
    address: 'Mustafa Kemal Paşa Firuzköy Bulvarı, Kayabaşı Sk. No:1/3, 34775 Avcılar/İstanbul',
    phone: '0212 422 30 00',
    email: 'avcilar@anadoluhastaneleri.com',
    working_hours: 'Pazartesi - Cumartesi: 08:00 - 21:00, Pazar: 09:00 - 18:00',
    emergency_hours: '7/24 Acil Servis hizmet vermektedir.',
    images: ['https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=1200&q=80'],
    display_on_homepage: true,
    is_active: true,
    display_order: 2,
    hero_title: 'Özel Avcılar Anadolu Hastanesi',
    hero_subtitle: 'Uzman Kadro, İleri Teknoloji',
    map_url: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3010.8978427865204!2d28.703618176844707!3d41.00560911958805!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14caa0efa5046773%3A0xbec8de447c5d125b!2s%C3%96zel%20Avc%C4%B1lar%20Anadolu%20Hastanesi!5e0!3m2!1str!2sus!4v1777931645665!5m2!1str!2sus',
    is_published: true,
  },
  {
    name: 'Özel Ereğli Anadolu Hastanesi',
    slug: 'ozel-eregli-anadolu-hastanesi',
    description: "Zonguldak Ereğli'de bölge halkına kapsamlı sağlık hizmeti sunan, tam donanımlı hastanemiz.",
    address: 'Müftü Mah. Atatürk Cad. No:88, Ereğli / Zonguldak',
    phone: '0372 316 20 00',
    email: 'eregli@anadoluhastaneleri.com',
    working_hours: 'Pazartesi - Cumartesi: 08:00 - 20:00, Pazar: 09:00 - 17:00',
    emergency_hours: '7/24 Acil Servis hizmet vermektedir.',
    images: ['https://images.unsplash.com/photo-1551190822-a9333d879b1f?auto=format&fit=crop&w=1200&q=80'],
    display_on_homepage: true,
    is_active: true,
    display_order: 3,
    hero_title: 'Özel Ereğli Anadolu Hastanesi',
    hero_subtitle: 'Bölgenizde Kaliteli Sağlık',
    map_url: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2998.5307934101097!2d31.425652492333697!3d41.275551028969225!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x409c5b4ae9271d45%3A0xb1c933e05f6a15d6!2s%C3%96zel%20Ere%C4%9Fli%20Anadolu%20Hastanesi!5e0!3m2!1str!2sus!4v1777931601704!5m2!1str!2sus',
    is_published: true,
  },
];

// Silivri doctors parsed from filenames
export const SILIVRI_DOCTORS_DATA = [
  { filename: 'DR.Hüseyin Deniz AKSOKU - Anestezi ve Reanimasyon.jpg', name: 'Dr. Hüseyin Deniz Aksoku', title: 'Dr.', deptSlug: 'anestezi-ve-reanimasyon' },
  { filename: 'DR.Ülken SEZER - Acil Servis.jpg', name: 'Dr. Ülken Sezer', title: 'Dr.', deptSlug: 'acil-servis' },
  { filename: 'Doç. Dr. Fatih KUZU - ENDOKRİNOLOJİ VE METABOLİZMA - İÇ HASTALIKLARI (Dahiliye) .jpg', name: 'Doç. Dr. Fatih Kuzu', title: 'Doç. Dr.', deptSlug: 'endokrinoloji-ve-metabolizma' },
  { filename: 'Doç. Dr. Gülşah YILDIRIM - Girişimsel Radyoloji.jpg', name: 'Doç. Dr. Gülşah Yıldırım', title: 'Doç. Dr.', deptSlug: 'girisimsel-radyoloji' },
  { filename: 'Doç. Dr. Salih İNAL - nefroloji - İÇ HASTALIKLARI (Dahiliye)-.jpg', name: 'Doç. Dr. Salih İnal', title: 'Doç. Dr.', deptSlug: 'nefroloji' },
  { filename: 'Doç. Dr. Çağdaş PAMUK - Ortopedi ve travmatoloji.jpg', name: 'Doç. Dr. Çağdaş Pamuk', title: 'Doç. Dr.', deptSlug: 'ortopedi-ve-travmatoloji' },
  { filename: 'Doç. Dr. İbak GÖNEN-ENFEKSİYON HASTALIKLARI VE MİKROBİYOLOJİ.jpg', name: 'Doç. Dr. İbak Gönen', title: 'Doç. Dr.', deptSlug: 'enfeksiyon-hastaliklari-ve-mikrobiyoloji' },
  { filename: 'Doç.Dr. Murat SAYGI - çocuk kardiyolojisi.png', name: 'Doç. Dr. Murat Saygı', title: 'Doç. Dr.', deptSlug: 'cocuk-kardiyoloji' },
  { filename: 'Doç.Dr. İlteriş Ahmet ŞENTÜRK - algoloji (Ağrı).jpg', name: 'Doç. Dr. İlteriş Ahmet Şentürk', title: 'Doç. Dr.', deptSlug: 'algoloji-agri' },
  { filename: 'Dr. Ersin Kahraman - Anestezi ve reanimasyon.jpg', name: 'Dr. Ersin Kahraman', title: 'Dr.', deptSlug: 'anestezi-ve-reanimasyon' },
  { filename: 'Dr. Öğr. Üyesi Ali KARAÇINAR - kardiyoloji.jpg', name: 'Dr. Öğr. Üyesi Ali Karaçınar', title: 'Dr. Öğr. Üyesi', deptSlug: 'kardiyoloji' },
  { filename: 'Dr. Öğr. Üyesi Ali KOCAOĞLU - İç Hastalıkları (Dahiliye).jpg', name: 'Dr. Öğr. Üyesi Ali Kocaoğlu', title: 'Dr. Öğr. Üyesi', deptSlug: 'ic-hastaliklari-dahiliye' },
  { filename: 'Dr. Öğr. Üyesi Habibe DUMAN - İç Hastalıkları (Dahiliye).png', name: 'Dr. Öğr. Üyesi Habibe Duman', title: 'Dr. Öğr. Üyesi', deptSlug: 'ic-hastaliklari-dahiliye' },
  { filename: 'Dr. İbrahim Barış PARLAK - Ortodonti Ağız ve diş Sağlığı.png', name: 'Dr. İbrahim Barış Parlak', title: 'Dr.', deptSlug: 'agiz-ve-dis-sagligi' },
  { filename: 'Dr.Öğr..Üyesi HAlil NARLI-Nöroloji.jpg', name: 'Dr. Öğr. Üyesi Halil Narlı', title: 'Dr. Öğr. Üyesi', deptSlug: 'noroloji' },
  { filename: 'Dr.Öğr.Üyesi Emrah ÇİÇEK - Kulak Burun Boğaz.png', name: 'Dr. Öğr. Üyesi Emrah Çiçek', title: 'Dr. Öğr. Üyesi', deptSlug: 'kulak-burun-bogaz' },
  { filename: 'Dt. Mehmet BÜDÜŞ - Ağız ve diş Sağlığı.jpg', name: 'Dt. Mehmet Büdüş', title: 'Dt.', deptSlug: 'agiz-ve-dis-sagligi' },
  { filename: 'Dt. Yasemin HAS - Ağız ve Diş Sağlığı.jpg', name: 'Dt. Yasemin Has', title: 'Dt.', deptSlug: 'agiz-ve-dis-sagligi' },
  { filename: 'Dyt Benan KOÇ - Beslenme ve diyet.jpg', name: 'Dyt. Benan Koç', title: 'Dyt.', deptSlug: 'beslenme-ve-diyet' },
  { filename: 'Op. Dr. Doğan DURMAZER - Üroloji.png', name: 'Op. Dr. Doğan Durmazer', title: 'Op. Dr.', deptSlug: 'uroloji' },
  { filename: 'Op. Dr. Duygu YARDIM - Kadın Hastalıkları ve Doğum.jpg', name: 'Op. Dr. Duygu Yardım', title: 'Op. Dr.', deptSlug: 'kadin-hastaliklari-ve-dogum' },
  { filename: 'Op. Dr. Ekrem ÇANCILAR - Çocuk Cerrahisi.jpg', name: 'Op. Dr. Ekrem Çancılar', title: 'Op. Dr.', deptSlug: 'cocuk-cerrahisi' },
  { filename: 'Op. Dr. Ercan YALÇIN-Genel Cerrahi.jpg', name: 'Op. Dr. Ercan Yalçın', title: 'Op. Dr.', deptSlug: 'genel-cerrahi' },
  { filename: 'Op. Dr. Eyüp Baykara - Beyin ve Sinir Cerrahi.jpg', name: 'Op. Dr. Eyüp Baykara', title: 'Op. Dr.', deptSlug: 'beyin-ve-sinir-cerrahisi' },
  { filename: 'Op. Dr. Fümerel İNCE - Kadın Hastalıkları ve doğum.jpg', name: 'Op. Dr. Fümerel İnce', title: 'Op. Dr.', deptSlug: 'kadin-hastaliklari-ve-dogum' },
  { filename: 'Op. Dr. Nilay ÇİÇEK - Göz Sağlığı ve Hastalıkları.png', name: 'Op. Dr. Nilay Çiçek', title: 'Op. Dr.', deptSlug: 'goz-sagligi-ve-hastaliklari' },
  { filename: 'Op. Dr. Seçil SOYDAN - Genel Cerrahi.jpg', name: 'Op. Dr. Seçil Soydan', title: 'Op. Dr.', deptSlug: 'genel-cerrahi' },
  { filename: 'Op. Dr. Talha ATALAY - Genel Cerrahi.jpg', name: 'Op. Dr. Talha Atalay', title: 'Op. Dr.', deptSlug: 'genel-cerrahi' },
  { filename: 'Op. Dr. Özgür IRMAK - Göz sağlığı ve Hastalıkları.jpg', name: 'Op. Dr. Özgür Irmak', title: 'Op. Dr.', deptSlug: 'goz-sagligi-ve-hastaliklari' },
  { filename: 'Op. Dr. Ülker MORALAR-Ortopedi ve Travmatoloji.jpg', name: 'Op. Dr. Ülker Moralar', title: 'Op. Dr.', deptSlug: 'ortopedi-ve-travmatoloji' },
  { filename: 'Op. Dr. Ümit BEYATLI - Kadın Hastalıkları ve Doğum.png', name: 'Op. Dr. Ümit Beyatlı', title: 'Op. Dr.', deptSlug: 'kadin-hastaliklari-ve-dogum' },
  { filename: 'Op.Dr Akın GÖKÇEDAĞ - Beyin ve Sinir Cerrahi.png', name: 'Op. Dr. Akın Gökçedağ', title: 'Op. Dr.', deptSlug: 'beyin-ve-sinir-cerrahisi' },
  { filename: 'Op.Dr. Emre ÖZDENGİL - PLASTİK REKONSTRÜKTİF ve ESTETİK CERRAHİ.png', name: 'Op. Dr. Emre Özdengil', title: 'Op. Dr.', deptSlug: 'plastik-rekonstruktif-ve-estetik-cerrahi' },
  { filename: 'Op.Dr. Fatma Selmin MADRAN - Göz Sağlığı ve Hastalıkları.png', name: 'Op. Dr. Fatma Selmin Madran', title: 'Op. Dr.', deptSlug: 'goz-sagligi-ve-hastaliklari' },
  { filename: 'Op.Dr. Hafize ÇAMDERE - Kadın Hastalıkları ve Doğum.jpg', name: 'Op. Dr. Hafize Çamdere', title: 'Op. Dr.', deptSlug: 'kadin-hastaliklari-ve-dogum' },
  { filename: 'Op.Dr. Mehmet Özgür ÇETKİN - ortopedi ve travmatoloji.png', name: 'Op. Dr. Mehmet Özgür Çetkin', title: 'Op. Dr.', deptSlug: 'ortopedi-ve-travmatoloji' },
  { filename: 'Op.Dr. Oğuz GÜRGEN - Kadın Hastalıkları ve Doğum.png', name: 'Op. Dr. Oğuz Gürgen', title: 'Op. Dr.', deptSlug: 'kadin-hastaliklari-ve-dogum' },
  { filename: 'Prof. Dr. Kemal KORKMAZ - KALP VE DAMAR CERRAHİSİ.jpg', name: 'Prof. Dr. Kemal Korkmaz', title: 'Prof. Dr.', deptSlug: 'kalp-ve-damar-cerrahisi' },
  { filename: 'Prof. Dr. Niyazi GÜLER-kardiyoloji.png', name: 'Prof. Dr. Niyazi Güler', title: 'Prof. Dr.', deptSlug: 'kardiyoloji' },
  { filename: 'Prof. Dr. Suphi BULĞURCU - Kulak Burun Boğaz.png', name: 'Prof. Dr. Suphi Bulğurcu', title: 'Prof. Dr.', deptSlug: 'kulak-burun-bogaz' },
  { filename: 'Prof.Dr. Hakan KOYUNCU - Üroloji.jpg', name: 'Prof. Dr. Hakan Koyuncu', title: 'Prof. Dr.', deptSlug: 'uroloji' },
  { filename: 'Uzm. Dr. Ahmet Hakan DİKENER - Çocuk Sağlığı ve Hastalıkları.jpg', name: 'Uzm. Dr. Ahmet Hakan Dikener', title: 'Uzm. Dr.', deptSlug: 'cocuk-sagligi-ve-hastaliklari' },
  { filename: 'Uzm. Dr. Altay Tolga ŞENTÜRK - patoloji.jpg', name: 'Uzm. Dr. Altay Tolga Şentürk', title: 'Uzm. Dr.', deptSlug: 'patoloji' },
  { filename: 'Uzm. Dr. Belgin UYSAL ERDAL - Çocuk Sağlığı ve Hastalıkları.jpg', name: 'Uzm. Dr. Belgin Uysal Erdal', title: 'Uzm. Dr.', deptSlug: 'cocuk-sagligi-ve-hastaliklari' },
  { filename: 'Uzm. Dr. Bilgehan EFEOĞULLARI - radyoloji.png', name: 'Uzm. Dr. Bilgehan Efeoğulları', title: 'Uzm. Dr.', deptSlug: 'radyoloji' },
  { filename: 'Uzm. Dr. Dilek Özkök KIZILCA - Çocuk Sağlığı ve Hastalıkları.jpg', name: 'Uzm. Dr. Dilek Özkök Kızılca', title: 'Uzm. Dr.', deptSlug: 'cocuk-sagligi-ve-hastaliklari' },
  { filename: 'Uzm. Dr. Faik ÜÇÜNCÜ - Fizik Tedavi ve Rehabilitasyon.jpg', name: 'Uzm. Dr. Faik Üçüncü', title: 'Uzm. Dr.', deptSlug: 'fizik-tedavi-ve-rehabilitasyon' },
  { filename: 'Uzm. Dr. Hakan TAĞRİKULU - Anestezi ve Reanimasyon.jpg', name: 'Uzm. Dr. Hakan Tağrikulı', title: 'Uzm. Dr.', deptSlug: 'anestezi-ve-reanimasyon' },
  { filename: 'Uzm. Dr. Hatice OKUR - Psikiyatri.png', name: 'Uzm. Dr. Hatice Okur', title: 'Uzm. Dr.', deptSlug: 'psikiyatri' },
  { filename: 'Uzm. Dr. Murat GENÇAY - iç hastalıkları ( Dahiliye).jpeg', name: 'Uzm. Dr. Murat Gençay', title: 'Uzm. Dr.', deptSlug: 'ic-hastaliklari-dahiliye' },
  { filename: 'Uzm. Dr. Serap ÇAKIR - Göğüs hastalıkları.jpeg', name: 'Uzm. Dr. Serap Çakır', title: 'Uzm. Dr.', deptSlug: 'gogus-hastaliklari' },
  { filename: 'Uzm. Dr. Serkan GÖKÇAY - Medikal Onkoloji.jpg', name: 'Uzm. Dr. Serkan Gökçay', title: 'Uzm. Dr.', deptSlug: 'medikal-onkoloji' },
  { filename: 'Uzm. Dr. Veli YAMAN - Acil Servis.jpg', name: 'Uzm. Dr. Veli Yaman', title: 'Uzm. Dr.', deptSlug: 'acil-servis' },
  { filename: 'Uzm. Dr. Veysi ASOĞLU - İç Hastalıkları ( Dahiliye).jpg', name: 'Uzm. Dr. Veysi Asoğlu', title: 'Uzm. Dr.', deptSlug: 'ic-hastaliklari-dahiliye' },
  { filename: 'Uzm. Dr. İnci İnce - dermatoloji.jpg', name: 'Uzm. Dr. İnci İnce', title: 'Uzm. Dr.', deptSlug: 'dermatoloji' },
  { filename: 'Uzm. Dr. Şirin Erkaya İnel - nöroloji.jpg', name: 'Uzm. Dr. Şirin Erkaya İnel', title: 'Uzm. Dr.', deptSlug: 'noroloji' },
  { filename: 'Uzm. Dyt. Ahu ÖZVAR KUZU - Beslenme ve diyet.png', name: 'Uzm. Dyt. Ahu Özvar Kuzu', title: 'Uzm. Dyt.', deptSlug: 'beslenme-ve-diyet' },
  { filename: 'Uzm. Klinik Psikolog Yaren GÜLŞEN - Psikolog.jpg', name: 'Uzm. Klinik Psikolog Yaren Gülşen', title: 'Uzm. Psikolog', deptSlug: 'psikoloji' },
  { filename: 'Uzm.Dr. Ahmet TELİS - kardiyoloji.png', name: 'Uzm. Dr. Ahmet Telis', title: 'Uzm. Dr.', deptSlug: 'kardiyoloji' },
  { filename: 'Uzm.Dr. Nalan Yağmur FİZİK TEDAVİ VE REHABİLİTASYON.jpg', name: 'Uzm. Dr. Nalan Yağmur', title: 'Uzm. Dr.', deptSlug: 'fizik-tedavi-ve-rehabilitasyon' },
  { filename: 'Uzm.Dr. Sevil BAŞ - radyoloji.png', name: 'Uzm. Dr. Sevil Baş', title: 'Uzm. Dr.', deptSlug: 'radyoloji' },
  { filename: 'Uzm.Dr. Volkan HEPYANAR - Çocuk Sağlığı ve Hastalıkları.png', name: 'Uzm. Dr. Volkan Hepyanar', title: 'Uzm. Dr.', deptSlug: 'cocuk-sagligi-ve-hastaliklari' },
  { filename: 'Uzm.Dr. Zeynep GÜVENÇ - Radyoloji.png', name: 'Uzm. Dr. Zeynep Güvenç', title: 'Uzm. Dr.', deptSlug: 'radyoloji' },
];

export function nameToSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's')
    .replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ç/g, 'c')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export type SeedProgress = {
  step: string;
  status: 'pending' | 'running' | 'done' | 'error';
  detail?: string;
};

export async function seedHospitals(onProgress: (p: SeedProgress) => void): Promise<Record<string, number>> {
  onProgress({ step: 'Hastaneler', status: 'running', detail: 'Mevcut hastaneler kontrol ediliyor...' });
  const hospitalIdMap: Record<string, number> = {};

  for (const h of HOSPITALS_DATA) {
    const { data: existing } = await supabase.from('hospitals').select('id').eq('slug', h.slug).maybeSingle();
    if (existing) {
      await supabase.from('hospitals').update({ ...h }).eq('id', existing.id);
      hospitalIdMap[h.slug] = existing.id;
      onProgress({ step: 'Hastaneler', status: 'running', detail: `Güncellendi: ${h.name}` });
    } else {
      const { data: inserted, error } = await supabase.from('hospitals').insert([h]).select('id').single();
      if (error) {
        onProgress({ step: 'Hastaneler', status: 'error', detail: `Hata: ${h.name} - ${error.message}` });
        continue;
      }
      hospitalIdMap[h.slug] = inserted.id;
      onProgress({ step: 'Hastaneler', status: 'running', detail: `Eklendi: ${h.name}` });
    }
  }

  // Also delete old hospitals with wrong names (without Özel prefix)
  await supabase.from('hospitals').delete().eq('slug', 'silivri-anadolu-hastanesi');
  await supabase.from('hospitals').delete().eq('slug', 'avcilar-anadolu-hastanesi');
  await supabase.from('hospitals').delete().eq('slug', 'eregli-anadolu-hastanesi');

  onProgress({ step: 'Hastaneler', status: 'done', detail: `${HOSPITALS_DATA.length} hastane tamamlandı` });
  return hospitalIdMap;
}

export async function seedDepartments(onProgress: (p: SeedProgress) => void): Promise<Record<string, number>> {
  onProgress({ step: 'Bölümler', status: 'running', detail: 'Bölümler ekleniyor...' });
  const deptIdMap: Record<string, number> = {};
  let count = 0;

  for (const dept of DEPARTMENTS_LIST) {
    const fullDept = { ...dept, description: '', is_published: true, display_order: count + 1 };
    const { data: existing } = await supabase.from('departments').select('id').eq('slug', dept.slug).maybeSingle();
    if (existing) {
      deptIdMap[dept.slug] = existing.id;
    } else {
      const { data: inserted, error } = await supabase.from('departments').insert([fullDept]).select('id').single();
      if (error) {
        onProgress({ step: 'Bölümler', status: 'running', detail: `Hata: ${dept.name}` });
        continue;
      }
      deptIdMap[dept.slug] = inserted.id;
      count++;
    }
  }

  // Re-fetch all to make sure we have complete map
  const { data: all } = await supabase.from('departments').select('id, slug');
  (all || []).forEach((d: any) => { deptIdMap[d.slug] = d.id; });

  onProgress({ step: 'Bölümler', status: 'done', detail: `${count} yeni bölüm eklendi` });
  return deptIdMap;
}

export async function seedSilivriDoctors(
  hospitalIdMap: Record<string, number>,
  deptIdMap: Record<string, number>,
  onProgress: (p: SeedProgress) => void
): Promise<void> {
  const silivriId = hospitalIdMap['ozel-silivri-anadolu-hastanesi'];
  if (!silivriId) {
    onProgress({ step: 'Silivri Doktorları', status: 'error', detail: 'Silivri hastane ID bulunamadı' });
    return;
  }

  onProgress({ step: 'Silivri Doktorları', status: 'running', detail: 'Doktorlar yükleniyor...' });

  // Check if storage bucket exists, create if not
  await supabase.storage.createBucket('doctor-images', { public: true }).catch(() => {});

  let successCount = 0;
  let errorCount = 0;

  for (const doctor of SILIVRI_DOCTORS_DATA) {
    const slug = nameToSlug(doctor.name);

    const deptId = deptIdMap[doctor.deptSlug];
    if (!deptId) {
      onProgress({ step: 'Silivri Doktorları', status: 'running', detail: `Bölüm bulunamadı (${doctor.deptSlug}): ${doctor.name}` });
      errorCount++;
      continue;
    }

    // Find and upload image first
    const normalizedFilename = doctor.filename.toLowerCase().replace(/\s+/g, ' ').trim();
    const imageKey = Object.keys(imageModules).find(key => {
      const keyFilename = key.split('/').pop()?.toLowerCase().replace(/\s+/g, ' ').trim();
      return keyFilename === normalizedFilename;
    });
    let imageUrl = '';

    if (imageKey) {
      try {
        const localUrl = imageModules[imageKey] as string;
        const response = await fetch(localUrl);
        const blob = await response.blob();
        const ext = doctor.filename.split('.').pop() || 'jpg';
        const storagePath = `silivri/${slug}.${ext}`;

        const { error: uploadError } = await supabase.storage
          .from('doctor-images')
          .upload(storagePath, blob, { contentType: blob.type, upsert: true });

        if (!uploadError) {
          const { data: urlData } = supabase.storage.from('doctor-images').getPublicUrl(storagePath);
          imageUrl = urlData.publicUrl;
        }
      } catch (err) {
        console.error('Image upload failed for', doctor.name, ':', err);
      }
    } else {
      console.warn('Image not found for', doctor.name, '- filename:', doctor.filename);
    }

    // Check if doctor already exists
    const { data: existing } = await supabase.from('doctors').select('id, image').eq('slug', slug).maybeSingle();
    if (existing) {
      if (!existing.image && imageUrl) {
        await supabase.from('doctors').update({ image: imageUrl }).eq('id', existing.id);
        onProgress({ step: 'Silivri Doktorları', status: 'running', detail: `Resim güncellendi: ${doctor.name}` });
      } else {
        onProgress({ step: 'Silivri Doktorları', status: 'running', detail: `Mevcut, atlandı: ${doctor.name}` });
      }
      continue;
    }

    const { error } = await supabase.from('doctors').insert([{
      name: doctor.name,
      slug,
      title: doctor.title,
      department_id: deptId,
      hospital_id: silivriId,
      image: imageUrl,
      education: '',
      experience: '',
      is_active: true,
    }]);

    if (error) {
      onProgress({ step: 'Silivri Doktorları', status: 'running', detail: `Hata: ${doctor.name} - ${error.message}` });
      errorCount++;
    } else {
      onProgress({ step: 'Silivri Doktorları', status: 'running', detail: `Eklendi: ${doctor.name}` });
      successCount++;
    }
  }

  onProgress({
    step: 'Silivri Doktorları',
    status: errorCount > 0 && successCount === 0 ? 'error' : 'done',
    detail: `${successCount} doktor eklendi, ${errorCount} hata`,
  });
}
