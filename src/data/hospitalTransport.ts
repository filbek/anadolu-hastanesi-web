// Hastane profil sayfasındaki "Adres ve İletişim" sekmesinde gösterilen
// ulaşım bilgileri. Anahtar: hastane slug'ı.

export type TransportSection = {
  title: string;
  items: string[];
};

// Veritabanındaki hospitals.transportation_info metnini bölümlere ayırır.
// Format: bölüm başlığı kendi satırında, maddeler "- " ile başlar,
// bölümler boş satırla ayrılır.
export function parseTransportInfo(text: string): TransportSection[] {
  return text
    .split(/\r?\n\s*\r?\n/)
    .map((block) => block.trim())
    .filter(Boolean)
    .map((block) => {
      const lines = block.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
      let title = '';
      const items: string[] = [];
      for (const line of lines) {
        if (/^[-•*]\s+/.test(line)) {
          items.push(line.replace(/^[-•*]\s+/, ''));
        } else if (!title && items.length === 0) {
          title = line;
        } else {
          items.push(line);
        }
      }
      return { title, items };
    })
    .filter((s) => s.title || s.items.length > 0);
}

export const hospitalTransportInfo: Record<string, TransportSection[]> = {
  'ozel-silivri-anadolu-hastanesi': [
    {
      title: 'Toplu Taşıma ile Ulaşım',
      items: [
        "Silivri'nin tüm köylerinden minibüsle hastaneye ulaşım sağlanabilmektedir.",
        'Silivri Anadolu Hastanesi yakınından geçen otobüs hatları: 300G - 300A - 300C - 300B',
      ],
    },
    {
      title: 'İstanbul Havalimanı Ulaşımı',
      items: [
        "İstanbul Havalimanı'ndan Havaİst ile Silivri'ye doğrudan ulaşabilirsiniz.",
      ],
    },
  ],
  'ozel-avcilar-anadolu-hastanesi': [
    {
      title: 'Hastane Yakınından Geçen Otobüs Hatları',
      items: ['HS2 - A43 - 144A - 142 - 142F - 142ES - 76D'],
    },
    {
      title: 'Toplu Taşıma ile Ulaşım',
      items: [
        'Metrobüs: Avcılar (Merkez) / Şükrübey durağı',
        'Metro: M1A/M1B, M2, M3, M4, M5 hatlarından Metrobüs’e aktarma ile ulaşım',
        'Otobüs/Minibüs: Avcılar, Beylikdüzü, Esenyurt, Küçükçekmece, Bakırköy yönlerinden sık hatlarla Avcılar merkeze ulaşım',
      ],
    },
    {
      title: 'Anadolu Yakasından Gelenler',
      items: [
        'Kadıköy–Söğütlüçeşme / Ünalan: Marmaray veya M4 ile Ünalan’a gelin, Metrobüs’e geçin; Avcılar (Şükrübey) durağında inin.',
        'Kartal–Pendik–Tuzla: M4 ile Ünalan, ardından Metrobüs → Avcılar (Merkez).',
        'Ümraniye–Çekmeköy: M5 ile Üsküdar/Altunizade, Metrobüs aktarması → Avcılar (Merkez).',
      ],
    },
    {
      title: 'Avrupa Yakasından Gelenler',
      items: [
        'Büyükçekmece–Beylikdüzü–Esenyurt–Küçükçekmece: En yakın Metrobüs istasyonundan Avcılar (Merkez) durağına gelin.',
        'Beşiktaş–Şişli–Taksim–Kağıthane: M2 ile Mecidiyeköy, Metrobüs aktarması → Avcılar (Merkez).',
        'Fatih–Eminönü–Zeytinburnu–Bakırköy: T1 Tramvay ile Cevizlibağ, Metrobüs aktarması → Avcılar (Merkez).',
      ],
    },
    {
      title: 'Havalimanlarından Ulaşım',
      items: [
        'İstanbul Havalimanı (IST): Havaist/otobüs ile Yenibosna veya Cevizlibağ’a gelin, Metrobüs ile Avcılar (Merkez).',
        'Sabiha Gökçen (SAW): M4 ile Ünalan, Metrobüs aktarması ile Avcılar (Merkez).',
      ],
    },
    {
      title: 'Otogarlardan Ulaşım',
      items: [
        '15 Temmuz Demokrasi Otogarı (Esenler): M1A/M1B ile Merter/Zeytinburnu/Yenikapı aktarma noktalarından Metrobüs’e geçin; Avcılar (Merkez).',
        'Alibeyköy Cep Otogarı: T5 Tramvay ile Eminönü yönüne gelip Cevizlibağ’da Metrobüs’e aktarma; Avcılar (Merkez).',
      ],
    },
    {
      title: 'Tren Garı / Marmaray Üzerinden Ulaşım',
      items: [
        'Halkalı (Marmaray): Halkalı’dan otobüs/minibüsle Avcılar merkeze geçiş veya Marmaray → Yenikapı bağlantısıyla Metrobüs’e aktarma.',
        'Sirkeci / Üsküdar (Marmaray): Marmaray ile Yenikapı (veya Anadolu yakasında Ayrılık Çeşmesi–Ünalan) üzerinden Metrobüs’e aktarma; Avcılar (Merkez).',
      ],
    },
    {
      title: 'Not',
      items: [
        'Avcılar (Merkez/Şükrübey) durağından hastaneye kısa yürüyüş veya minibüs/taksi ile ulaşım mümkündür.',
        'Özel araçla ulaşım için E-5/D100 üzerinden Avcılar merkeze kolay erişim sağlanır.',
      ],
    },
  ],
};
