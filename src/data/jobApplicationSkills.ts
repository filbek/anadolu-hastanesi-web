// ============================================================
// İş Başvuru Formu - Mesleki beceri tanımları
//
// Eski PHP formunda bu listeler script.js ve gonder.php içinde iki kez
// tekrarlanıyordu. Burada tek kaynakta tutulur; form, admin paneli ve
// e-posta şablonu aynı tanımları kullanır.
//
// Puanlama: 0 = hiç kullanmadım, 1 = çok az, 2 = iyi, 3 = çok iyi
// ============================================================

/** Adayın Adım 1'de seçtiği pozisyon grubu — Adım 4'te hangi blokların
 *  gösterileceğini belirler. */
export type PositionGroup =
  | 'hemsire'
  | 'laborant'
  | 'anestezi'
  | 'rontgen'
  | 'doktor'
  | 'idari'
  | 'diger';

export const POSITION_GROUPS: { value: PositionGroup; label: string }[] = [
  { value: 'hemsire', label: 'Hemşire / Sağlık Memuru / Ebe' },
  { value: 'laborant', label: 'Laborant / Laboratuvar Teknisyeni' },
  { value: 'anestezi', label: 'Anestezi Teknisyeni / Teknikeri' },
  { value: 'rontgen', label: 'Röntgen / Görüntüleme Teknisyeni' },
  { value: 'doktor', label: 'Doktor / Uzman Hekim' },
  { value: 'idari', label: 'İdari, Mali İşler ve Destek Birimleri' },
  { value: 'diger', label: 'Diğer' },
];

export interface SkillBlock {
  /** Form alan adlarının ön eki — ör. hemsireGenel_0, hemsireGenel_1 ... */
  key: string;
  /** E-postada ve admin panelinde görünen tam başlık */
  title: string;
  /** Blok içindeki alt başlık (birden fazla bloğu olan gruplarda) */
  section?: string;
  items: string[];
}

export const SKILL_BLOCKS: SkillBlock[] = [
  {
    key: 'hemsireGenel',
    title: 'Hemşireler - Genel',
    section: 'Genel',
    items: [
      'EKG', 'Defibrilatör', 'Monitörizasyon', 'Ambu', 'Nebulizatör', 'Aspiratör',
      'Air-Way', 'Laringoskop', 'Steteskop', 'Tansiyon Aleti',
      'İnsülin Kalemi Kullanımı', 'Damar Yoluna Girme (Yetişkin-Çocuk)',
      'Endoskopi Hazırlığı-Asistanı', 'Oksijen Tüpü ve Maskeleri',
      'Ventilatör Kullanımı (Yoğun Bakım)', 'CPR (Kardiyopulmoner Resüsitasyon)',
      'Yara Bakımı', 'Post-Op Yara Pansumanı', 'Decübitüs Yara Bakımı',
      'İM Enjeksiyon', 'İV Enjeksiyon', 'SC Enjeksiyon', 'İntra Dermal Enjeksiyon',
      'Lavman Uygulaması', 'İdrar Sondası Takma ve Bakımı', 'Nazogastrik Sonda Takma',
      'Orogastrik Sonda Takma', 'Merkezi Oksijen Sistemi Kullanımı',
      'İlaç Doz Hesaplamaları', 'Steril Set Açma Tekniği',
      'Anjiyocut Takılması ve Bakımı', 'Holter Cihazı', 'Elor Testi', 'EEG Çekimi',
      'Mide Yıkaması ve Örnek Alınması',
    ],
  },
  {
    key: 'hemsireKadinDogum',
    title: 'Hemşireler - Kadın Doğum',
    section: 'Kadın Doğum ve Doğumhane',
    items: [
      'Vacum', 'NST Çekimi (TOKO çekimi ve yorumu)', 'Koter Cihazı Kullanımı',
      'El Doppleri Kullanımı', 'Perine (Epizyotomi) Bakımı',
      'Post Partum Fundus Muayenesi', 'Fundus Masajı Uygulaması',
      'Tüşe ile Serviks Değerlendirmesi', 'Meme Bakımı', 'Kanama Takibi (Lochia)',
    ],
  },
  {
    key: 'hemsireCocuk',
    title: 'Hemşireler - Çocuk',
    section: 'Çocuk Bakımı',
    items: [
      'Bebek Isıtıcısı', 'Küvöz', 'Fototerapi', 'Çocuk CPR',
      'Çocuk Damar Yoluna Girme', 'Bebek Göbek ve Göz Bakımı',
      'Exchange Seti Hazırlama ve Asiste Etme',
    ],
  },
  {
    key: 'hemsireAmeliyat',
    title: 'Hemşireler - Ameliyathane',
    section: 'Ameliyathane',
    items: [
      'Laparoskopi ve Endoskopi Sistemi Hazırlanıp Kullanılması',
      'Ameliyathane Mikroskobu Hazırlanıp Kullanılması', 'Koter',
      'Otoklav (Buharlı Sterilizasyon)', 'MSU Kuru Sterilizasyon',
      'Soğuk Sterilizasyon', 'Flaş Otoklav', 'Poşetleme Cihazı',
      'Masa Hazırlama ve Enstrüman/Asiste Etme', 'Cerrahi El Yıkama',
      'Cerrahi Alet Bakımı',
    ],
  },
  {
    key: 'labItems',
    title: 'Laborantlar',
    section: 'Laboratuvar',
    items: [
      'Hemogram Cihazı', 'Otoanalizör', 'Mikroskop', 'Tam İdrar Tetkiki',
      'Mikrobiyolojik Tetkikler', 'Hormon Analizi',
    ],
  },
  {
    key: 'anesteziItems',
    title: 'Anestezi Teknisyeni',
    section: 'Anestezi',
    items: [
      'Monitör', 'Defibrilatör', 'Laringoskop', 'Aspiratör',
      'Anestezi Cihazı ve Vaporizatör', 'Entübasyon', 'Resüsitasyon',
    ],
  },
  {
    key: 'rontgenItems',
    title: 'Röntgen Teknisyeni',
    section: 'Röntgen ve Görüntüleme',
    items: [
      'Direkt Röntgen Çekimi', 'Taş Kırma Ünitesi', 'Skopi',
      'C Kolu Röntgen (Portabl)', 'Manuel (El Banyosu)', 'Otomatik Banyo Yapma',
      'Kontrastlı Röntgen Film Çekimi', 'Histerografi Çekimi', 'Mamografi Çekimi',
      'BT Çekimi', 'MR Çekimi', 'Periferik Anjiyo Çekimi',
    ],
  },
];

/** Hangi pozisyon grubunda hangi beceri blokları sorulur.
 *  Doktor / idari / diğer için mesleki cihaz bloğu sorulmaz — bu adaylar
 *  Adım 4'te yalnızca serbest metin alanını görür. */
export const GROUP_SKILL_KEYS: Record<PositionGroup, string[]> = {
  hemsire: ['hemsireGenel', 'hemsireKadinDogum', 'hemsireCocuk', 'hemsireAmeliyat'],
  laborant: ['labItems'],
  anestezi: ['anesteziItems'],
  rontgen: ['rontgenItems'],
  doktor: [],
  idari: [],
  diger: [],
};

/** Beceri puanlarının anlamı (Adım 4 açıklaması ve e-posta bilgisi) */
export const SKILL_LEVELS = [
  { value: '0', label: 'Hiç kullanmadım / uygulamadım' },
  { value: '1', label: 'Kullanmasını / uygulamasını çok az biliyorum' },
  { value: '2', label: 'Kullanmasını / uygulamasını iyi biliyorum' },
  { value: '3', label: 'Kullanmasını / uygulamasını çok iyi biliyorum' },
];

// ── Adım 5: herkese sorulan bloklar ──────────────────────────

export const COMPUTER_SKILLS = [
  'Microsoft Word',
  'Microsoft Excel',
  'Microsoft PowerPoint',
  'İnternet Kullanımı',
  'Hastane Bilgi Yönetim Sistemi (HBYS)',
  'Özel Programlar',
];

export const COMPUTER_LEVELS = [
  { value: '1', label: 'Başlangıç' },
  { value: '2', label: 'Orta' },
  { value: '3', label: 'İyi' },
  { value: '4', label: 'Çok İyi' },
];

export const LANGUAGES = ['İngilizce', 'Almanca', 'Fransızca', 'Arapça', 'Rusça'];

export const LANGUAGE_LEVELS = [
  { value: '1', label: 'Başlangıç' },
  { value: '2', label: 'Orta' },
  { value: '3', label: 'İyi' },
  { value: '4', label: 'Çok İyi' },
];

/** Eğitim kademeleri — Adım 2 */
export const EDUCATION_LEVELS = [
  { key: 'doktora', label: 'Doktora' },
  { key: 'yuksek', label: 'Yüksek Lisans' },
  { key: 'lisans', label: 'Lisans' },
  { key: 'onlisans', label: 'Ön Lisans' },
  { key: 'lise', label: 'Lise' },
];
