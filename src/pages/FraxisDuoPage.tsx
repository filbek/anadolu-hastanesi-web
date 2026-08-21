import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import {
  FaCheckCircle,
  FaChevronDown,
  FaClock,
  FaCalendarCheck,
  FaPhoneAlt,
  FaExclamationTriangle,
  FaArrowRight,
  FaInfoCircle,
} from 'react-icons/fa'
import { useDoctors } from '../hooks/useDoctors'

const APPOINTMENT_URL = 'https://anadoluhastaneleri.kendineiyibak.app/'
const PAGE_PATH = '/saglik-rehberi/fraxis-duo-lazer'

/**
 * Silivri Anadolu Hastanesi Kadın Hastalıkları ve Doğum kadrosu.
 * Doktorlar veritabanından çekiliyor; ağ/veri hatasında sayfanın bu bölümü
 * boş kalmasın diye 28.07.2026 tarihli aktif doktor listesi yedek olarak duruyor.
 */
const FALLBACK_DOCTORS = [
  { name: 'Op. Dr. Duygu Yardım' },
  { name: 'Op. Dr. Fümerel İnce' },
  { name: 'Op. Dr. Hafize Çamdere' },
  { name: 'Op. Dr. Oğuz Gürgen' },
  { name: 'Op. Dr. Ümit Beyatlı' },
]

/** İki teknolojinin teknik künyesi (üretici: ILOODA, Güney Kore). */
const TECHNOLOGIES = [
  {
    name: 'Fraksiyonel CO₂ Lazer',
    tag: '10.600 nm',
    desc:
      'Cilt ya da mukoza yüzeyine mikroskobik ısı sütunları hâlinde iletilir. Aradaki sağlam doku korunduğu için iyileşme hızlanır; alt tabakada yeni kolajen ve elastin üretimi tetiklenir.',
    specs: [
      '30 W’a kadar güç',
      '100–120 mikron ışın çapı',
      '20–5.000 mikrosaniye atım süresi',
      '1×1 mm – 20×20 mm tarama alanı, 6 farklı tarama deseni',
    ],
  },
  {
    name: 'Mikro İğne Fraksiyonel RF',
    tag: '2 MHz bipolar',
    desc:
      'Yalıtımlı mikro iğneler radyofrekans enerjisini doğrudan derinin alt katmanına taşır. Yüzey daha az etkilendiği için koyu ciltlerde de leke riski düşüktür; derin sıkılaşma sağlar.',
    specs: [
      '50 W’a kadar bipolar RF çıkışı',
      '0,25 mm iğne çapı',
      '0,5–3,5 mm arası, 0,1 mm adımlarla derinlik ayarı',
      '25 pin (10×10 mm) ve 64 pin (17,5×17,5 mm) başlık seçenekleri',
    ],
  },
]

/** Cihazın dört aplikatörü — hangi başlığın hangi işi yaptığı. */
const APPLICATORS = [
  {
    name: 'CO₂ Fraksiyonel Tarayıcı',
    use: 'Yüz ve vücutta yenileme: akne izi, kırışıklık, gözenek, cilt dokusu ve leke.',
  },
  {
    name: 'Mikro İğne RF Başlığı',
    use: 'Derin sıkılaştırma, çene–boyun hattı, atrofik izler, aşırı terleme.',
  },
  {
    name: 'SmartSurgi Cerrahi Başlık',
    use: '0,2–1,3 mm ayarlanabilir spot ile siğil, ben, lentigo ve keratoz gibi lezyonların çıkarılması.',
  },
  {
    name: 'GynoLaser Jinekolojik Başlık',
    use:
      '90° yansıtıcı ayna ve 360° dönüş ile vajen duvarına 8×8 mm’lik alanlar hâlinde dik açılı uygulama.',
  },
]

/**
 * Sayfanın vitrini: hangi işlemlerin yapıldığı.
 * `method` rozeti bilinçli — listede cerrahi, lazer ve enjeksiyon işlemleri
 * bir arada; hasta hangisinin ameliyat olduğunu ilk bakışta görmeli.
 */
const PROCEDURES = [
  {
    name: 'Genital Estetik',
    method: 'Kapsam',
    desc:
      'Dış genital bölgenin görünümünü, işlevini ve konforunu iyileştirmeye yönelik cerrahi ve cerrahi olmayan uygulamaların tümünü kapsayan başlık. Hangi yöntemin uygun olduğu şikâyete ve muayene bulgusuna göre belirlenir.',
  },
  {
    name: 'Genital Beyazlatma',
    method: 'Lazer / Medikal',
    desc:
      'Kasık, iç dudak ve çevresindeki koyulaşmanın açılmasına yönelik uygulama. Renk değişimi sürtünme, hormonal etkiler, epilasyon ve yaşla ilişkilidir; lazer ile depigmentasyon tedavileri birlikte planlanabilir.',
  },
  {
    name: 'Labioplasti',
    subtitle: 'İç Dudak Estetiği',
    method: 'Cerrahi',
    desc:
      'Büyümüş ya da asimetrik iç dudakların (labium minus) küçültülmesi ve şekillendirilmesi. Yalnız görünüm değil; oturmada, spor sırasında, dar giyside ve ilişkide oluşan sürtünme ve ağrı da başlıca gerekçedir. Lokal anestezi ile yapılabilir, dikişler kendiliğinden erir.',
  },
  {
    name: 'Vajinoplasti',
    subtitle: 'Vajinal Daraltma',
    method: 'Cerrahi',
    desc:
      'Doğum ve yaşla genişleyen vajen kanalının ve zayıflayan taban kaslarının cerrahi olarak onarılması. İleri derecede gevşeme ve sarkmada, lazerin yetersiz kaldığı noktada devreye giren kalıcı çözümdür.',
  },
  {
    name: 'Genital Dolgu, PRP ve Eksozom',
    method: 'Enjeksiyon',
    desc:
      'Hyaluronik asit dolgusu ile dış dudaklarda hacim kaybının giderilmesi; PRP (kişinin kendi kanından elde edilen trombositten zengin plazma) ve eksozom uygulamaları ile doku beslenmesinin, nemlenmesinin ve duyarlılığın desteklenmesi. Ameliyatsızdır, seans hâlinde uygulanır.',
  },
  {
    name: 'İdrar Kaçırma ve Vajinal Kuruluk Tedavileri',
    method: 'Lazer / Ameliyatsız',
    desc:
      'Hafif–orta stres tipi idrar kaçırma ile menopoza bağlı kuruluk, yanma ve ilişki ağrısında mukozanın kolajen yapısını uyaran ameliyatsız uygulamalar. Hormon tedavisi kullanamayan hastalarda öne çıkar.',
  },
  {
    name: 'Doğum Sonrası Yara İzlerinin İyileştirilmesi',
    method: 'Lazer',
    desc:
      'Epizyotomi (kesi) ve sezaryen izlerinde kabarıklığın, renk farkının ve gerginlik hissinin azaltılması. Fraksiyonel lazer, iz dokusunu yeniden düzenleyerek çevresindeki sağlam dokuya yaklaştırmayı hedefler.',
  },
  {
    name: 'Lazer ile Genital Gençleştirme',
    method: 'Lazer',
    desc:
      'Doğum sonrası ya da yaşla gelen laksite, kuruluk ve doku incelmesinde; vajen duvarında kolajen ve elastin yapımını uyaran seanslar. Anestezi ve dikiş gerektirmez, aynı gün günlük hayata dönülür.',
  },
]

/**
 * Sayfanın SEO omurgası: hasta kendi şikâyetini kendi cümlesiyle arıyor.
 * Şikâyet → cihazın oradaki rolü eşleşmesi bu yüzden ayrı bir bölüm.
 */
const PROBLEMS_GYN = [
  {
    complaint: 'Öksürünce, hapşırınca ya da spor yaparken idrar kaçırıyorum',
    label: 'Stres tipi idrar kaçırma',
    answer:
      'Üretrayı destekleyen vajen ön duvarındaki bağ dokusu zayıfladığında karın içi basınç arttığı anda kaçak olur. Kontrollü ısı, bu bölgede kolajen yapımını uyararak dokunun daha dirençli hâle gelmesini hedefler. Hafif ve orta şiddetli olgularda ameliyatsız bir seçenek olarak değerlendirilir; ileri derecede sarkma veya ağır inkontinansta cerrahi gerekebilir.',
  },
  {
    complaint: 'Menopozdan sonra kuruluk, yanma ve kaşıntı başladı',
    label: 'Vajinal atrofi / GSM',
    answer:
      'Östrojen azalınca mukoza incelir, kan akımı ve nem tutma kapasitesi düşer. Fraksiyonel CO₂ uygulaması mukozanın kalınlaşması ve nemlenmesine katkı sağlamayı amaçlar. Hormon tedavisi kullanamayan hastalarda (örneğin meme kanseri öyküsü) gündeme gelen bir alternatiftir.',
  },
  {
    complaint: 'İlişki sırasında ağrı ve yanma oluyor',
    label: 'Disparoni',
    answer:
      'Kuruluk ve mukoza incelmesine bağlı ağrıda, doku kalitesinin iyileştirilmesi şikâyeti azaltmaya yardımcı olabilir. Ağrının nedeni her zaman doku kaynaklı olmadığı için önce jinekolojik muayene ve gerekirse ek değerlendirme yapılır.',
  },
  {
    complaint: 'Doğumdan sonra gevşeklik hissediyorum',
    label: 'Vajinal laksite',
    answer:
      'Normal doğum sonrası vajen duvarındaki kolajen ağı esneyebilir. Uygulama, cerrahi gerektirmeden doku toparlanmasını desteklemeyi hedefler. Doğumdan sonra en az 6 ay beklenmesi ve emzirmenin tamamlanması genellikle önerilir.',
  },
  {
    complaint: 'Sık sık vajinal enfeksiyon geçiriyorum',
    label: 'Tekrarlayan enfeksiyonlar',
    answer:
      'Mukoza sağlığı ve pH dengesi bozulduğunda enfeksiyonlar tekrarlayabilir. Uygulama destekleyici olarak değerlendirilir; enfeksiyonun kendisi önce uygun tedaviyle giderilir. Aktif enfeksiyon varken lazer uygulanmaz.',
  },
]

const PROBLEMS_DERM = [
  {
    complaint: 'Akne izlerim yıllardır geçmiyor',
    label: 'Atrofik akne skarı',
    answer:
      'Buz kıracağı, yuvarlak ve köşeli (ice-pick, rolling, boxcar) izlerde CO₂ ve mikro iğne RF birlikte kullanılabilir. Amaç iz tabanını yükseltmek ve doku farkını azaltmaktır; genellikle birden fazla seans gerekir.',
  },
  {
    complaint: 'Ameliyat ya da yaralanma izim belirgin',
    label: 'Cerrahi ve travma izleri',
    answer:
      'Olgunlaşmış izlerde yüzey düzensizliğini ve renk farkını azaltmak için kullanılır. Keloid eğilimi olan kişilerde ayrı bir değerlendirme yapılır.',
  },
  {
    complaint: 'Gebelik veya kilo değişimi sonrası çatlaklarım var',
    label: 'Stria / çatlak',
    answer:
      'Beyazlamış çatlaklarda dermal kolajen yapımını uyararak dokuyu iyileştirmeyi hedefler. Kırmızı dönemdeki taze çatlaklarda yanıt genellikle daha iyidir.',
  },
  {
    complaint: 'İnce çizgiler, gözenek ve cilt gevşekliği',
    label: 'Yaşlanma bulguları',
    answer:
      'Göz çevresi ve ağız çevresi çizgileri, genişlemiş gözenekler ve çene hattındaki gevşemede iki teknoloji kombine edilebilir.',
  },
  {
    complaint: 'Leke, güneş hasarı ve cilt tonu düzensizliği',
    label: 'Pigmentasyon',
    answer:
      'Güneş lekeleri ve ton farklılıklarında kullanılır. Melazma seyri değişken olduğu için tedavi planı kişiye göre kurulur ve güneş koruması şarttır.',
  },
  {
    complaint: 'Siğil, ben, kabarık lezyonlar',
    label: 'Yüzeysel lezyonlar',
    answer:
      'SmartSurgi cerrahi başlığıyla, çevre dokuya minimum hasarla çıkarılabilir. Şüpheli lezyonlarda önce patolojik değerlendirme planlanır.',
  },
]

const BENEFITS = [
  {
    title: 'Ameliyatsız ve dikişsiz',
    desc: 'Genel anestezi ya da yatış gerekmez; jinekolojik uygulamalar poliklinik koşullarında yapılır.',
  },
  {
    title: 'Kısa işlem süresi',
    desc: 'Jinekolojik uygulama ortalama 15–20 dakika sürer. Cilt uygulamalarında süre alanın genişliğine göre değişir.',
  },
  {
    title: 'Hızlı günlük hayata dönüş',
    desc: 'Jinekolojik uygulamadan sonra aynı gün günlük aktiviteye dönülebilir; cinsel perhiz süresi hekiminizce belirtilir.',
  },
  {
    title: 'Tek platformda iki teknoloji',
    desc: 'CO₂ lazer ve mikro iğne RF ayrı ayrı ya da aynı seansta kombine kullanılabilir; ikinci bir cihaza gerek kalmaz.',
  },
  {
    title: 'Derinlik kontrolü',
    desc: 'İğne derinliği 0,1 mm hassasiyetle ayarlanır; enerji hedeflenen katmanda kalır.',
  },
  {
    title: 'Farklı cilt tiplerinde kullanım',
    desc: 'Doku empedansı otomatik ölçülerek enerji ayarlanır; koyu ciltlerde de uygun protokollerle uygulanabilir.',
  },
]

const NOT_SUITABLE = [
  'Gebelik ve emzirme dönemi',
  'Aktif genital enfeksiyon, aktif uçuk (herpes) veya ciltte açık yara',
  'Tedavi edilmemiş anormal smear sonucu veya tanısı konmamış vajinal kanama',
  'İleri derecede pelvik organ sarkması (bu durumda cerrahi değerlendirme gerekir)',
  'Kalp pili veya implante edilebilir kardiyak cihaz taşımak (radyofrekans uygulaması için)',
  'Son 6–12 ayda izotretinoin (akne ilacı) kullanımı',
  'Keloid / hipertrofik skar oluşturma eğilimi',
  'Kontrolsüz diyabet, kanama pıhtılaşma bozukluğu veya bağışıklığı baskılayan tedaviler',
]

const AFTERCARE = {
  before: [
    'Jinekolojik uygulama öncesi muayene, smear ve gerekiyorsa enfeksiyon taraması yapılır.',
    'Uygulama, adet döneminin dışında planlanır.',
    'Cilt uygulamalarından 2–4 hafta önce yoğun güneş maruziyeti ve bronzlaşmadan kaçınılır.',
    'Kullandığınız ilaçları, özellikle kan sulandırıcıları ve izotretinoini hekiminize bildirin.',
  ],
  after: [
    'Ciltte 2–5 gün sürebilen kızarıklık, hafif ödem ve kabuklanma beklenen bir yanıttır.',
    'Kabukları koparmayın; hekiminizin önerdiği nemlendirici ve yüksek faktörlü güneş koruyucuyu düzenli kullanın.',
    'Jinekolojik uygulamadan sonra genellikle 3–7 gün cinsel perhiz, havuz, deniz ve küvet banyosundan kaçınma önerilir.',
    'Birkaç gün sıcak ortam, sauna ve ağır egzersizden uzak durulur.',
    'Beklenmedik ağrı, ateş veya akıntı olursa hastanenizle iletişime geçin.',
  ],
}

const FAQ = [
  {
    q: 'Fraxis Duo uygulaması ağrılı mı?',
    a:
      'Jinekolojik uygulama genellikle ağrısızdır; hastaların çoğu hafif bir ısı ve titreşim hissi tarif eder, çoğunlukla anestezi gerekmez. Cilt uygulamalarında işlemden yaklaşık 30–45 dakika önce topikal anestezik krem uygulanır.',
  },
  {
    q: 'Kaç seans gerekir?',
    a:
      'Jinekolojik uygulamalarda genellikle 4–6 hafta arayla 2–3 seans planlanır. Akne izi ve çatlak gibi cilt sorunlarında seans sayısı izin derinliğine göre 3–5 seansa çıkabilir. Kesin plan muayene sonrası belirlenir.',
  },
  {
    q: 'Etkisi ne zaman görülür, ne kadar sürer?',
    a:
      'Kolajen yenilenmesi zaman aldığı için etki genellikle ilk seanstan sonra başlar ve 4–12 hafta içinde belirginleşir. Kalıcılık kişiden kişiye değişir; jinekolojik uygulamalarda literatürde çoğunlukla 1–2 yıl aralığı bildirilir ve yıllık idame seansı önerilebilir. Yaş, menopoz durumu ve doku yapısı sonucu etkiler.',
  },
  {
    q: 'İdrar kaçırma tedavisinde ameliyatın yerini tutar mı?',
    a:
      'Hayır. Hafif ve orta şiddetli stres tipi idrar kaçırmada ameliyatsız bir seçenek olarak değerlendirilir. İleri derecede kaçırma, belirgin sarkma veya sıkışma tipi inkontinansta cerrahi ya da farklı tedaviler gerekir. Ayrım, ürojinekolojik muayene ve gerekirse ürodinami ile yapılır.',
  },
  {
    q: 'İşten izin almam gerekir mi?',
    a:
      'Jinekolojik uygulamada genellikle gerekmez; aynı gün işinize dönebilirsiniz. Yüz bölgesine yapılan yoğun CO₂ uygulamalarında kızarıklık ve kabuklanma nedeniyle birkaç gün sosyal iyileşme süresi olabilir.',
  },
  {
    q: 'Hangi bölüm bu uygulamayı yapıyor?',
    a:
      'Jinekolojik uygulamalar Kadın Hastalıkları ve Doğum uzmanları tarafından yapılır. Cilt ve iz tedavileri dermatoloji ile plastik cerrahi kapsamındadır. Şikâyetinize göre doğru bölüme yönlendirilirsiniz.',
  },
]

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] as const } },
}

const FraxisDuoPage = () => {
  const { data: doctorsRaw = [], isLoading } = useDoctors()
  const [openFaq, setOpenFaq] = useState<number | null>(0)

  // Silivri + Kadın Hastalıkları ve Doğum. Hastane/bölüm adları yönetim
  // panelinden değişebildiği için tam eşitlik yerine anahtar kelime aranıyor.
  const obgynDoctors = useMemo(() => {
    return (doctorsRaw as any[])
      .filter((d) => {
        const hospital = (d.hospitals?.name || '').toLocaleLowerCase('tr')
        const department = (d.departments?.name || '').toLocaleLowerCase('tr')
        return hospital.includes('silivri') && department.includes('kadın')
      })
      .sort((a, b) => a.name.localeCompare(b.name, 'tr'))
  }, [doctorsRaw])

  const jsonLd = useMemo(
    () => [
      {
        '@context': 'https://schema.org',
        '@type': 'MedicalWebPage',
        name: 'Genital Estetik ve Lazer Uygulamaları: Hangi İşlemler Yapılıyor?',
        description:
          'Labioplasti, vajinoplasti, genital beyazlatma, genital dolgu ile PRP ve eksozom uygulamaları, idrar kaçırma ve vajinal kuruluk tedavileri, doğum sonrası yara izlerinin iyileştirilmesi ve lazerle genital gençleştirme işlemleri.',
        inLanguage: 'tr-TR',
        hasPart: PROCEDURES.map((p) => ({
          '@type': 'MedicalProcedure',
          name: p.subtitle ? `${p.name} (${p.subtitle})` : p.name,
          description: p.desc,
        })),
        about: [
          { '@type': 'MedicalCondition', name: 'Stres tipi idrar kaçırma' },
          { '@type': 'MedicalCondition', name: 'Vajinal atrofi (genitoüriner menopoz sendromu)' },
          { '@type': 'MedicalCondition', name: 'Atrofik akne skarı' },
        ],
        publisher: {
          '@type': 'MedicalOrganization',
          name: 'Anadolu Hastaneleri Grubu',
          telephone: '+90-444-50-58',
        },
      },
      {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: FAQ.map((item) => ({
          '@type': 'Question',
          name: item.q,
          acceptedAnswer: { '@type': 'Answer', text: item.a },
        })),
      },
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Ana Sayfa', item: '/' },
          { '@type': 'ListItem', position: 2, name: 'Sağlık Rehberi', item: '/saglik-rehberi' },
          { '@type': 'ListItem', position: 3, name: 'Fraxis Duo Lazer', item: PAGE_PATH },
        ],
      },
    ],
    []
  )

  return (
    <div className="bg-white">
      <Helmet>
        <title>Genital Estetik ve Lazer Uygulamaları: Hangi İşlemler Yapılıyor? | Anadolu Hastaneleri Grubu</title>
        <meta
          name="description"
          content="Labioplasti, vajinoplasti, genital beyazlatma, genital dolgu-PRP-eksozom, idrar kaçırma ve vajinal kuruluk tedavileri, doğum sonrası iz iyileştirme ve lazerle genital gençleştirme: yapılan işlemler, kazanımlar, seans sayısı ve dikkat edilmesi gerekenler."
        />
        <meta
          name="keywords"
          content="genital estetik, labioplasti, iç dudak estetiği, vajinoplasti, vajinal daraltma, genital beyazlatma, genital dolgu, genital PRP, eksozom, idrar kaçırma lazer tedavisi, vajinal kuruluk, lazerle genital gençleştirme, fraxis duo, fraksiyonel co2 lazer, Silivri kadın doğum"
        />
        <link rel="canonical" href={`https://www.anadoluhastaneleri.com.tr${PAGE_PATH}`} />
        <meta property="og:type" content="article" />
        <meta property="og:title" content="Fraxis Duo Lazer Nedir? Hangi İşlemlerde Kullanılır?" />
        <meta
          property="og:description"
          content="Fraksiyonel CO₂ lazer ve mikro iğne RF teknolojisinin birleşimi: idrar kaçırmadan akne izine hangi sorunlarda kullanıldığını uzmanlarımız anlatıyor."
        />
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>

      {/* Hero */}
      <section className="relative pt-32 pb-16 bg-gradient-to-br from-primary-600 via-primary-500 to-ocean-600 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-ocean-400/20 rounded-full blur-3xl -translate-y-1/3 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-coral-500/10 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4" />
        <div className="container-custom relative z-10">
          <nav aria-label="Breadcrumb" className="mb-6 text-sm text-white/60">
            <ol className="flex flex-wrap items-center gap-2">
              <li><Link to="/" className="hover:text-white transition-colors">Ana Sayfa</Link></li>
              <li aria-hidden="true">/</li>
              <li><Link to="/saglik-rehberi" className="hover:text-white transition-colors">Sağlık Rehberi</Link></li>
              <li aria-hidden="true">/</li>
              <li className="text-white/90" aria-current="page">Fraxis Duo Lazer</li>
            </ol>
          </nav>

          <motion.div initial="hidden" animate="visible" variants={fadeUp} className="max-w-3xl">
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 text-white rounded-full text-sm font-semibold mb-6 backdrop-blur-sm">
              Kadın Hastalıkları ve Doğum · Genital Estetik
            </span>
            <h1 className="text-3xl md:text-5xl font-black text-white mb-5 leading-tight">
              Genital Estetik ve Lazer Uygulamaları: Hangi İşlemler Yapılıyor?
            </h1>
            <p className="text-lg text-white/80 leading-relaxed mb-8">
              Labioplastiden vajinoplastiye, genital beyazlatmadan idrar kaçırma ve vajinal kuruluk tedavilerine kadar
              yaptığımız işlemleri aşağıda tek tek açıkladık. Bunların çoğu, dile getirilmekten çekinilen ama yaşam
              kalitesini doğrudan etkileyen şikâyetlere yanıt veriyor. Hangisinin ameliyat, hangisinin ameliyatsız
              olduğunu da belirttik — kararı muayeneden sonra birlikte veriyoruz.
            </p>
            <div className="flex flex-wrap gap-3">
              <a
                href={APPOINTMENT_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-coral-500 text-white font-bold rounded-xl hover:bg-coral-600 transition-colors"
              >
                <FaCalendarCheck /> Randevu Al
              </a>
              <a
                href="tel:4445058"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 text-white font-bold rounded-xl hover:bg-white/20 transition-colors backdrop-blur-sm"
              >
                <FaPhoneAlt /> 444 50 58
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Yapılan işlemler — sayfanın vitrini */}
      <section className="py-16 bg-neutral-50">
        <div className="container-custom">
          <div className="max-w-3xl mb-10">
            <h2 className="text-2xl md:text-3xl font-black text-primary-600 mb-4">Yapılan İşlemler</h2>
            <p className="text-neutral-600 leading-relaxed">
              Kadın Hastalıkları ve Doğum kliniğimizde uygulanan genital estetik ve fonksiyonel tedavi başlıkları
              aşağıdadır. Bir kısmı ameliyat, bir kısmı ameliyatsız lazer ya da enjeksiyon uygulamasıdır; her kartın
              üzerindeki etiket yöntemi gösterir.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {PROCEDURES.map((proc, i) => (
              <motion.article
                key={proc.name}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.15 }}
                variants={fadeUp}
                transition={{ delay: (i % 3) * 0.06 }}
                className="bg-white rounded-2xl p-6 border border-neutral-100 shadow-sm hover:shadow-md transition-shadow flex flex-col"
              >
                <span
                  className={`self-start px-3 py-1 rounded-full text-xs font-bold mb-4 ${
                    proc.method === 'Cerrahi'
                      ? 'bg-coral-50 text-coral-600'
                      : proc.method === 'Kapsam'
                      ? 'bg-neutral-100 text-neutral-500'
                      : 'bg-ocean-50 text-ocean-600'
                  }`}
                >
                  {proc.method}
                </span>
                <h3 className="text-lg font-bold text-primary-600 leading-snug">{proc.name}</h3>
                {proc.subtitle && (
                  <p className="text-sm text-neutral-400 mb-2">({proc.subtitle})</p>
                )}
                <p className={`text-sm text-neutral-600 leading-relaxed ${proc.subtitle ? '' : 'mt-2'}`}>
                  {proc.desc}
                </p>
              </motion.article>
            ))}
          </div>

          <p className="mt-8 text-sm text-neutral-500 max-w-3xl">
            Bu işlemlerin bir bölümünde kullandığımız <strong>Fraxis Duo</strong> lazer sisteminin teknik ayrıntılarını
            sayfanın alt kısmında bulabilirsiniz.
          </p>
        </div>
      </section>

      {/* Jinekolojik şikâyetler */}
      <section className="py-16">
        <div className="container-custom">
          <div className="max-w-3xl mb-10">
            <span className="inline-block px-3 py-1 bg-coral-50 text-coral-600 rounded-full text-xs font-bold mb-4">
              Kadın Hastalıkları ve Doğum
            </span>
            <h2 className="text-2xl md:text-3xl font-black text-primary-600 mb-4">
              Hangi Kadın Sağlığı Sorunlarında Gündeme Gelir?
            </h2>
            <p className="text-neutral-600 leading-relaxed">
              Aşağıdaki şikâyetler çoğu zaman dile getirilmekten çekinilen, ancak yaşam kalitesini doğrudan etkileyen
              sorunlardır. Hepsinin çözümü lazer değildir; doğru tedaviyi belirleyen şey muayenedir. Bu bölüm, hangi
              durumda bu yöntemin masaya yatırıldığını anlatır.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {PROBLEMS_GYN.map((item) => (
              <motion.article
                key={item.label}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.15 }}
                variants={fadeUp}
                className="bg-white rounded-2xl p-6 border border-neutral-100 shadow-sm"
              >
                <p className="text-base font-bold text-primary-600 mb-1">“{item.complaint}”</p>
                <p className="text-xs font-semibold text-ocean-600 uppercase tracking-wide mb-3">{item.label}</p>
                <p className="text-sm text-neutral-600 leading-relaxed">{item.answer}</p>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      {/* Dermatolojik şikâyetler */}
      <section className="py-16 bg-neutral-50">
        <div className="container-custom">
          <div className="max-w-3xl mb-10">
            <span className="inline-block px-3 py-1 bg-ocean-50 text-ocean-600 rounded-full text-xs font-bold mb-4">
              Dermatoloji ve Estetik
            </span>
            <h2 className="text-2xl md:text-3xl font-black text-primary-600 mb-4">Cilt Tarafında Hangi İşlemler Yapılır?</h2>
            <p className="text-neutral-600 leading-relaxed">
              Cihazın ilk çıkış alanı cilt yenilemedir. Aynı kolajen uyarma mantığı, yüzde ve vücutta iz ve yaşlanma
              bulgularının tedavisinde kullanılır.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {PROBLEMS_DERM.map((item) => (
              <motion.article
                key={item.label}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.15 }}
                variants={fadeUp}
                className="bg-white rounded-2xl p-6 border border-neutral-100"
              >
                <p className="text-base font-bold text-primary-600 mb-1">“{item.complaint}”</p>
                <p className="text-xs font-semibold text-coral-500 uppercase tracking-wide mb-3">{item.label}</p>
                <p className="text-sm text-neutral-600 leading-relaxed">{item.answer}</p>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      {/* Kazanımlar */}
      <section className="py-16">
        <div className="container-custom">
          <div className="max-w-3xl mb-10">
            <h2 className="text-2xl md:text-3xl font-black text-primary-600 mb-4">Bu Yöntemin Sağladığı Kazanımlar</h2>
            <p className="text-neutral-600 leading-relaxed">
              Aşağıdaki başlıklar yöntemin genel özellikleridir; kişisel sonuç yaş, doku yapısı ve şikâyetin şiddetine
              göre değişir.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {BENEFITS.map((b, i) => (
              <motion.div
                key={b.title}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
                variants={fadeUp}
                transition={{ delay: i * 0.05 }}
                className="bg-gradient-to-br from-neutral-50 to-white rounded-2xl p-6 border border-neutral-100"
              >
                <FaCheckCircle className="text-ocean-500 text-xl mb-3" aria-hidden="true" />
                <h3 className="text-base font-bold text-primary-600 mb-2">{b.title}</h3>
                <p className="text-sm text-neutral-500 leading-relaxed">{b.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Seans planı */}
      <section className="py-16 bg-primary-600">
        <div className="container-custom">
          <div className="max-w-3xl">
            <h2 className="text-2xl md:text-3xl font-black text-white mb-4">Uygulama Nasıl Planlanır?</h2>
            <p className="text-white/70 leading-relaxed mb-8">
              Kolajen yenilenmesi haftalar süren bir süreç olduğu için tedavi tek seansta tamamlanmaz ve sonuç anında
              görülmez. Tipik plan şöyledir:
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              { icon: <FaClock />, title: 'Seans süresi', value: 'Jinekolojik uygulamada 15–20 dakika' },
              { icon: <FaCalendarCheck />, title: 'Seans sayısı', value: 'Genellikle 4–6 hafta arayla 2–3 seans' },
              { icon: <FaInfoCircle />, title: 'Sonucun belirginleşmesi', value: 'İlk seanstan sonra başlar, 4–12 haftada oturur' },
            ].map((item) => (
              <div key={item.title} className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                <div className="text-ocean-300 text-2xl mb-3" aria-hidden="true">{item.icon}</div>
                <h3 className="text-base text-white font-bold mb-1">{item.title}</h3>
                <p className="text-white/70 text-sm leading-relaxed">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Kimlere uygun değil */}
      <section className="py-16">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <FaExclamationTriangle className="text-coral-500 text-xl" aria-hidden="true" />
                <h2 className="text-2xl font-black text-primary-600">Kimlere Uygulanmaz?</h2>
              </div>
              <p className="text-neutral-600 leading-relaxed mb-5">
                Aşağıdaki durumlarda uygulama ertelenir ya da hiç yapılmaz. Listede kendinizi görüyorsanız bu, tedavi
                alamayacağınız anlamına gelmez — alternatif yöntemler için hekiminize danışın.
              </p>
              <ul className="space-y-3">
                {NOT_SUITABLE.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm text-neutral-600">
                    <span className="w-1.5 h-1.5 rounded-full bg-coral-500 mt-2 shrink-0" aria-hidden="true" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-6">
              <div className="bg-neutral-50 rounded-2xl p-6 border border-neutral-100">
                <h3 className="text-lg font-bold text-primary-600 mb-3">İşlem Öncesi</h3>
                <ul className="space-y-2">
                  {AFTERCARE.before.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm text-neutral-600">
                      <FaCheckCircle className="text-ocean-500 mt-1 shrink-0" aria-hidden="true" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-neutral-50 rounded-2xl p-6 border border-neutral-100">
                <h3 className="text-lg font-bold text-primary-600 mb-3">İşlem Sonrası</h3>
                <ul className="space-y-2">
                  {AFTERCARE.after.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm text-neutral-600">
                      <FaCheckCircle className="text-ocean-500 mt-1 shrink-0" aria-hidden="true" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SSS */}
      <section className="py-16 bg-neutral-50">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-black text-primary-600 mb-8 text-center">Sık Sorulan Sorular</h2>
            <div className="space-y-3">
              {FAQ.map((item, i) => {
                const isOpen = openFaq === i
                return (
                  <div key={item.q} className="bg-white rounded-2xl border border-neutral-100 overflow-hidden">
                    <h3 className="text-base">
                      <button
                        type="button"
                        onClick={() => setOpenFaq(isOpen ? null : i)}
                        aria-expanded={isOpen}
                        aria-controls={`faq-panel-${i}`}
                        className="w-full flex items-center justify-between gap-4 text-left px-6 py-5 font-bold text-primary-600 hover:bg-neutral-50 transition-colors"
                      >
                        <span>{item.q}</span>
                        <FaChevronDown
                          className={`shrink-0 text-ocean-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                          aria-hidden="true"
                        />
                      </button>
                    </h3>
                    {isOpen && (
                      <div id={`faq-panel-${i}`} className="px-6 pb-5 text-sm text-neutral-600 leading-relaxed">
                        {item.a}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Cihaz tanıtımı — teknik ayrıntı, içeriğin sonunda */}
      <section className="py-16">
        <div className="container-custom">
          <div className="max-w-3xl mb-10">
            <span className="inline-block px-3 py-1 bg-neutral-100 text-neutral-500 rounded-full text-xs font-bold mb-4">
              Teknoloji
            </span>
            <h2 className="text-2xl md:text-3xl font-black text-primary-600 mb-4">
              Kullandığımız Sistem: Fraxis Duo Nedir?
            </h2>
            <p className="text-neutral-600 leading-relaxed mb-4">
              Yukarıdaki lazer uygulamalarında kullandığımız Fraxis Duo, Güney Kore merkezli ILOODA tarafından üretilen
              ve iki ayrı teknolojiyi tek gövdede toplayan bir enerji tabanlı tedavi sistemidir:{' '}
              <strong>fraksiyonel CO₂ lazer</strong> ve <strong>mikro iğne fraksiyonel radyofrekans</strong>. İki başlık
              ayrı ayrı kullanılabildiği gibi aynı seansta kombine de edilebilir.
            </p>
            <p className="text-neutral-600 leading-relaxed">
              “Fraksiyonel” sözcüğü işin özünü anlatır: enerji, tüm yüzeye tek parça hâlinde değil, aralarında sağlam
              doku bırakan mikroskobik sütunlar hâlinde verilir. Dokunulmadan bırakılan bu alanlar iyileşmeyi hızlandıran
              bir rezerv görevi görür; böylece onarım süreci klasik tam yüzey lazerlere göre çok daha kısa sürer.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            {TECHNOLOGIES.map((tech) => (
              <motion.div
                key={tech.name}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
                variants={fadeUp}
                className="bg-neutral-50 rounded-2xl p-7 border border-neutral-100"
              >
                <div className="flex items-start justify-between gap-4 mb-3">
                  <h3 className="text-xl font-bold text-primary-600">{tech.name}</h3>
                  <span className="shrink-0 px-3 py-1 bg-ocean-50 text-ocean-600 rounded-full text-xs font-bold">
                    {tech.tag}
                  </span>
                </div>
                <p className="text-neutral-600 leading-relaxed mb-5">{tech.desc}</p>
                <ul className="space-y-2">
                  {tech.specs.map((spec) => (
                    <li key={spec} className="flex items-start gap-2 text-sm text-neutral-500">
                      <FaCheckCircle className="text-ocean-500 mt-1 shrink-0" aria-hidden="true" />
                      <span>{spec}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>

          <div className="max-w-3xl mb-8">
            <h3 className="text-xl font-bold text-primary-600 mb-3">Dört Başlık, Dört Farklı İş</h3>
            <p className="text-neutral-600 leading-relaxed">
              Cihazın hangi işlemi yaptığı, takılan başlığa göre değişir. Jinekolojik uygulamaları mümkün kılan parça,
              lazer ışınını vajen duvarına dik açıyla yönlendiren <strong>GynoLaser</strong> başlığıdır.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {APPLICATORS.map((app, i) => (
              <motion.div
                key={app.name}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
                variants={fadeUp}
                transition={{ delay: i * 0.06 }}
                className="bg-white rounded-2xl p-6 border border-neutral-100"
              >
                <div className="w-9 h-9 rounded-lg bg-primary-600 text-white flex items-center justify-center font-bold text-sm mb-4">
                  {i + 1}
                </div>
                <h4 className="text-base font-bold text-primary-600 mb-2">{app.name}</h4>
                <p className="text-sm text-neutral-500 leading-relaxed">{app.use}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Silivri Kadın Hastalıkları ve Doğum kadrosu */}
      <section className="py-16 bg-neutral-50">
        <div className="container-custom">
          <div className="max-w-3xl mb-10">
            <h2 className="text-2xl md:text-3xl font-black text-primary-600 mb-4">
              Silivri Anadolu Hastanesi Kadın Hastalıkları ve Doğum Uzmanlarımız
            </h2>
            <p className="text-neutral-600 leading-relaxed">
              Yukarıdaki şikâyetlerden biri sizde de varsa, önce muayene. Hangi yöntemin size uygun olduğuna —
              lazer, egzersiz, ilaç ya da cerrahi — ancak değerlendirme sonrası karar verilir.
            </p>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-neutral-50 rounded-2xl p-6 animate-pulse">
                  <div className="w-20 h-20 rounded-full bg-neutral-200 mb-4" />
                  <div className="h-4 bg-neutral-200 rounded w-2/3 mb-2" />
                  <div className="h-3 bg-neutral-200 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : obgynDoctors.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {obgynDoctors.map((doctor: any, i: number) => (
                <motion.div
                  key={doctor.id}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.15 }}
                  variants={fadeUp}
                  transition={{ delay: i * 0.05 }}
                  className="bg-white rounded-2xl p-6 border border-neutral-100 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <Link to={`/doktorlar/${doctor.slug}`} className="shrink-0">
                      <img
                        src={doctor.image}
                        alt={doctor.name}
                        className="w-20 h-20 rounded-full object-cover object-top border border-neutral-100"
                        loading="lazy"
                      />
                    </Link>
                    <div className="min-w-0">
                      <Link
                        to={`/doktorlar/${doctor.slug}`}
                        className="block font-bold text-primary-600 hover:text-ocean-600 transition-colors"
                      >
                        {doctor.name}
                      </Link>
                      <p className="text-sm text-neutral-500">Kadın Hastalıkları ve Doğum</p>
                      <p className="text-xs text-neutral-400">Silivri Anadolu Hastanesi</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Link
                      to={`/doktorlar/${doctor.slug}`}
                      className="flex-1 text-center text-sm font-semibold px-4 py-2 rounded-xl border border-neutral-200 text-primary-600 hover:bg-neutral-50 transition-colors"
                    >
                      Profili Gör
                    </Link>
                    <a
                      href={APPOINTMENT_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 inline-flex items-center justify-center gap-2 text-sm font-semibold px-4 py-2 rounded-xl bg-coral-500 text-white hover:bg-coral-600 transition-colors"
                    >
                      <FaCalendarCheck aria-hidden="true" /> Randevu
                    </a>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            /* Veri çekilemediğinde bölüm boş kalmasın */
            <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {FALLBACK_DOCTORS.map((doctor) => (
                <li key={doctor.name} className="bg-neutral-50 rounded-2xl p-5 border border-neutral-100">
                  <p className="font-bold text-primary-600">{doctor.name}</p>
                  <p className="text-sm text-neutral-500">Kadın Hastalıkları ve Doğum</p>
                  <p className="text-xs text-neutral-400">Silivri Anadolu Hastanesi</p>
                </li>
              ))}
            </ul>
          )}

          <div className="mt-8">
            <Link
              to="/doktorlar?hastane=Silivri%20Anadolu%20Hastanesi"
              className="inline-flex items-center gap-2 font-semibold text-ocean-600 hover:text-ocean-700 transition-colors"
            >
              Silivri Anadolu Hastanesi’ndeki tüm doktorları görün <FaArrowRight className="text-xs" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA + yasal not */}
      <section className="pb-20">
        <div className="container-custom">
          <div className="bg-gradient-to-br from-ocean-600 to-primary-600 rounded-3xl p-8 md:p-12 text-center">
            <h2 className="text-2xl md:text-3xl font-black text-white mb-3">Şikâyetinizi Konuşalım</h2>
            <p className="text-white/75 max-w-2xl mx-auto mb-7 leading-relaxed">
              Uygulamanın size uygun olup olmadığı, kaç seans gerekeceği ve alternatif tedaviler muayene sonrası
              netleşir. Randevunuzu çevrimiçi oluşturabilir ya da çağrı merkezimizi arayabilirsiniz.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <a
                href={APPOINTMENT_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white text-primary-600 font-bold rounded-xl hover:bg-neutral-100 transition-colors"
              >
                <FaCalendarCheck aria-hidden="true" /> Online Randevu
              </a>
              <a
                href="tel:4445058"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 text-white font-bold rounded-xl hover:bg-white/20 transition-colors backdrop-blur-sm"
              >
                <FaPhoneAlt aria-hidden="true" /> 444 50 58
              </a>
            </div>
          </div>

          <p className="mt-8 text-xs text-neutral-400 leading-relaxed max-w-3xl mx-auto text-center">
            Bu içerik yalnızca genel bilgilendirme amacıyla hazırlanmıştır; tanı ve tedavi yerine geçmez, tedavi
            sonucuna ilişkin taahhüt içermez. Tedavi yanıtı kişiden kişiye değişir. Sağlık durumunuzla ilgili kararları
            mutlaka hekiminizle birlikte alınız.
          </p>
        </div>
      </section>
    </div>
  )
}

export default FraxisDuoPage
