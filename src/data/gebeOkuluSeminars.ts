import { GebeOkuluSeminar } from '../services/gebeOkuluService';

// Gebe Okulu sayfasının varsayılan seminer içeriği. Veritabanındaki
// gebe_okulu_seminars tablosu boşken sitede bu liste gösterilir; admin
// panelindeki "Varsayılan Seminerleri İçe Aktar" butonu da bu listeyi
// veritabanına yükler.
export const defaultSeminars: GebeOkuluSeminar[] = [
  {
    id: 1,
    title: 'Gebelikte Beslenme ve Sağlıklı Yaşam',
    date: '15 Mayıs 2025',
    image: 'https://images.unsplash.com/photo-1559757175-5700dde675bc?auto=format&fit=crop&w=800&q=80',
    summary: 'Uzman diyetisyenlerimiz tarafından verilen seminerde, gebelik döneminde doğru beslenme alışkanlıkları, vitamin ve mineral takviyeleri ile anne adayının sağlıklı kilo alımı ele alındı.',
    topics: ['Gebelikte kilo kontrolü', 'Folik asit ve demir desteği', 'Toksik gıdalardan kaçınma'],
    order_index: 1,
    is_active: true
  },
  {
    id: 2,
    title: 'Doğum Hazırlık ve Nefes Teknikleri',
    date: '22 Mayıs 2025',
    image: 'https://images.unsplash.com/photo-1584515933487-779824d29309?auto=format&fit=crop&w=800&q=80',
    summary: 'Ebelik ekibimiz tarafından düzenlenen uygulamalı atölyede, doğum süreci, nefes teknikleri, gevşeme egzersizleri ve doğum pozisyonları detaylıca anlatıldı.',
    topics: ['Lamaze nefes teknikleri', 'Doğum pozisyonları', 'Eş desteği ve iletişim'],
    order_index: 2,
    is_active: true
  },
  {
    id: 3,
    title: 'Yenidoğan Bakımı ve Emzirme Teknikleri',
    date: '29 Mayıs 2025',
    image: 'https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&w=800&q=80',
    summary: 'Doğum sonrası dönemde bebek bakımı, emzirme teknikleri, gaz sancısı ve uyku düzeni konularında uzman kadromuzdan pratik bilgiler edindik.',
    topics: ['Doğru emzirme pozisyonu', 'Bebek banyosu ve hijyen', 'Ağlama nedenleri ve sakinleştirme'],
    order_index: 3,
    is_active: true
  },
  {
    id: 4,
    title: 'Gebelikte Egzersiz ve Fiziksel Aktivite',
    date: '5 Haziran 2025',
    image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=800&q=80',
    summary: 'Fizik tedavi uzmanlarımızın eşliğinde gebelikte güvenli egzersizler, sırt ağrısı önleme ve pelvik taban kasları egzersizleri uygulamalı olarak gösterildi.',
    topics: ['Pelvik taban egzersizleri', 'Gebelik yoga hareketleri', 'Sırt ve bel ağrısı önleme'],
    order_index: 4,
    is_active: true
  },
  {
    id: 5,
    title: 'Silivri Anadolu Hastanesi Gebe Okulu Buluşması',
    date: '12 Haziran 2026',
    image: '/uploads/gebe-okulu-silivri.jpg',
    summary: 'Anne adaylarına özel eğitim ve farkındalık buluşması. Uzman anlatımları, doğuma hazırlık egzersizleri ve bebek bakımı eğitimleri ile sağlıklı bir başlangıç yapıyoruz.',
    topics: ['Uzman anlatımları', 'Doğuma hazırlık', 'Bilinçli başlangıç'],
    link_url: 'https://anadoluhastaneleri.kendineiyibak.app/',
    order_index: 5,
    is_active: true
  },
  {
    id: 6,
    title: 'Gebe Okulu Eğitimi ve Destekleyici Atölye',
    date: '19 Haziran 2026',
    image: '/uploads/gebe-okulu-egitimi.jpg',
    summary: 'Anne adayları için bilgilendirici ve destekleyici buluşma. Doğru nefes teknikleri, yoga hareketleri ve uzman kadromuz eşliğinde gebelik ve doğum sürecine hazırlık.',
    topics: ['Nefes teknikleri', 'Gebelik yogası', 'Destekleyici buluşma'],
    link_url: 'https://anadoluhastaneleri.kendineiyibak.app/',
    order_index: 6,
    is_active: true
  }
];
