import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import {
  FaMapSigns,
  FaInfoCircle,
  FaRestroom,
  FaCoffee,
  FaPrayingHands,
  FaPhone,
  FaUserNurse,
  FaQuestionCircle,
  FaArrowUp,
} from 'react-icons/fa';
import LastUpdated from '../components/ui/LastUpdated';

const guideItems = (t: any) => [
  {
    icon: <FaInfoCircle />,
    title: t('guide.item1Title', 'Danışma ve Rehberlik'),
    desc: t('guide.item1Desc', 'Giriş katında bulunan danışma masalarımızdan hastane içi yönlendirme, randevu ve genel bilgi alabilirsiniz. Görevli personelimiz size rehberlik edecektir.'),
  },
  {
    icon: <FaMapSigns />,
    title: t('guide.item2Title', 'Yönlendirme Levhaları'),
    desc: t('guide.item2Desc', 'Tüm hastanelerimizde her katta yönlendirme levhaları ve dijital ekranlar bulunmaktadır. Branş ve birimlere kolayca ulaşabilirsiniz.'),
  },
  {
    icon: <FaArrowUp />,
    title: t('guide.item3Title', 'Asansör ve Erişim'),
    desc: t('guide.item3Desc', 'Tüm hastanelerimizde hasta ve personel asansörleri mevcuttur. Engelli bireyler için geniş asansörler ve rampalar bulunmaktadır.'),
  },
  {
    icon: <FaRestroom />,
    title: t('guide.item4Title', 'Hasta Odaları ve Servisler'),
    desc: t('guide.item4Desc', 'Her servis katında hemşire istasyonu, hasta odaları, ziyaretçi bekleme alanları ve engelli tuvaletleri bulunmaktadır.'),
  },
  {
    icon: <FaCoffee />,
    title: t('guide.item5Title', 'Kafeterya ve Kantin'),
    desc: t('guide.item5Desc', 'Hastane giriş katında veya zemin katında kafeterya alanlarımız bulunmaktadır. Ayrıca çeşitli noktalarda otomat makineleri mevcuttur.'),
  },
  {
    icon: <FaPrayingHands />,
    title: t('guide.item6Title', 'Mescit ve İbadet Alanları'),
    desc: t('guide.item6Desc', 'Hastanelerimizde mescit ve namaz kılma alanları bulunmaktadır. Konum bilgisi için danışmadan yardım alabilirsiniz.'),
  },
];

const floorPlans = (t: any) => [
  {
    floor: t('guide.floor0', 'Zemin Kat'),
    areas: [
      t('guide.area0_1', 'Acil Servis'),
      t('guide.area0_2', 'Poliklinik Kayıt ve Danışma'),
      t('guide.area0_3', 'Kafeterya'),
      t('guide.area0_4', 'Eczane'),
      t('guide.area0_5', 'Mescit'),
      t('guide.area0_6', 'Otopark Girişi'),
    ],
  },
  {
    floor: t('guide.floor1', '1. Kat'),
    areas: [
      t('guide.area1_1', 'Dahiliye Poliklinikleri'),
      t('guide.area1_2', 'Kardiyoloji'),
      t('guide.area1_3', 'Göğüs Hastalıkları'),
      t('guide.area1_4', 'Dermatoloji'),
      t('guide.area1_5', 'Fizik Tedavi'),
    ],
  },
  {
    floor: t('guide.floor2', '2. Kat'),
    areas: [
      t('guide.area2_1', 'Cerrahi Poliklinikleri'),
      t('guide.area2_2', 'Kadın Doğum'),
      t('guide.area2_3', 'Üroloji'),
      t('guide.area2_4', 'Göz Hastalıkları'),
      t('guide.area2_5', 'Kulak Burun Boğaz'),
    ],
  },
  {
    floor: t('guide.floor3', '3. Kat'),
    areas: [
      t('guide.area3_1', 'Pediatri (Çocuk Sağlığı)'),
      t('guide.area3_2', 'Ağız ve Diş Sağlığı'),
      t('guide.area3_3', 'Psikiyatri'),
      t('guide.area3_4', 'Beslenme ve Diyet'),
    ],
  },
  {
    floor: t('guide.floor4', '4. Kat ve Üzeri'),
    areas: [
      t('guide.area4_1', 'Yatan Hasta Servisleri'),
      t('guide.area4_2', 'Yoğun Bakım Ünitesi'),
      t('guide.area4_3', 'Ameliyathane Katı'),
      t('guide.area4_4', 'Yenidoğan Ünitesi'),
    ],
  },
];

const helpPoints = (t: any) => [
  {
    icon: <FaUserNurse />,
    title: t('guide.help1Title', 'Hemşire İstasyonu'),
    desc: t('guide.help1Desc', 'Her servis katında hastalarınızla ilgili tüm sorularınızı yanıtlayacak hemşire ekibi bulunmaktadır.'),
  },
  {
    icon: <FaQuestionCircle />,
    title: t('guide.help2Title', 'Hasta İlişkileri'),
    desc: t('guide.help2Desc', 'Hizmet kalitesi, şikayet ve önerileriniz için Hasta İlişkileri Birimi\'ne başvurabilirsiniz.'),
  },
  {
    icon: <FaPhone />,
    title: t('guide.help3Title', 'Çağrı Merkezi'),
    desc: t('guide.help3Desc', '7/24 hizmet veren çağrı merkezimizden yönlendirme ve bilgi alabilirsiniz: 444 50 58'),
  },
];

const HospitalGuidePage = () => {
  const { t } = useTranslation();

  return (
    <>
      <Helmet>
        <title>{t('guide.pageTitle', 'Hastane İçi Rehber')} | Anadolu Hastaneleri Grubu</title>
        <meta
          name="description"
          content={t('guide.metaDescription', 'Hastane içi yönlendirme bilgileri, kat planları, danışma birimleri ve hasta rehberliği hizmetleri.')}
        />
      </Helmet>

      {/* ─── HERO ─── */}
      <section className="relative min-h-[420px] md:min-h-[500px] flex items-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?ixlib=rb-4.0.3&auto=format&fit=crop&w=2400&q=80')",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0a1628]/95 via-[#0a1628]/80 to-[#0a1628]/50" />
        <div className="absolute left-0 top-0 h-full w-1 bg-accent" />

        <div className="container-custom relative z-10 py-24">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-3xl"
          >
            <div className="flex items-center gap-2 mb-6">
              <span className="block h-px w-10 bg-accent" />
              <span className="text-accent text-xs uppercase tracking-[0.25em] font-semibold">
                {t('guide.heroTag', 'Yol Gösterici')}
              </span>
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-white leading-tight mb-6">
              {t('guide.heroTitle1', 'Hastane')}
              <br />
              <span className="text-accent">{t('guide.heroTitle2', 'İçi Rehber')}</span>
            </h1>
            <p className="text-white/70 text-lg md:text-xl leading-relaxed max-w-xl">
              {t('guide.heroDesc', 'Hastanemizde kaybolmayın. Kat planları, yönlendirme bilgileri ve danışma noktaları burada.')}
            </p>
          </motion.div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 overflow-hidden">
          <svg viewBox="0 0 1440 60" preserveAspectRatio="none" className="w-full h-12 md:h-16 fill-gray-50">
            <polygon points="0,60 1440,0 1440,60" />
          </svg>
        </div>
      </section>

      {/* ─── GUIDE ITEMS ─── */}
      <section className="bg-gray-50 py-20 lg:py-28">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-2xl mb-14"
          >
            <div className="flex items-center gap-3 mb-5">
              <span className="block h-px w-[60px] bg-accent" />
              <span className="text-xs uppercase tracking-[0.25em] text-accent font-bold">
                {t('guide.infoTag', 'Genel Bilgiler')}
              </span>
            </div>
            <h2 className="text-4xl lg:text-5xl font-black text-secondary leading-tight mb-4">
              {t('guide.infoTitle', 'Hastane')}{' '}
              <span className="text-primary">{t('guide.infoHighlight', 'Rehberliği')}</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {guideItems(t).map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="bg-white rounded-2xl p-7 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/8 text-primary flex items-center justify-center text-xl mb-5">
                  {item.icon}
                </div>
                <h3 className="text-lg font-bold text-secondary mb-2">{item.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FLOOR PLANS ─── */}
      <section className="bg-white py-20 lg:py-28">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-2xl mb-14"
          >
            <div className="flex items-center gap-3 mb-5">
              <span className="block h-px w-[60px] bg-accent" />
              <span className="text-xs uppercase tracking-[0.25em] text-accent font-bold">
                {t('guide.floorTag', 'Kat Planları')}
              </span>
            </div>
            <h2 className="text-4xl lg:text-5xl font-black text-secondary leading-tight mb-4">
              {t('guide.floorTitle', 'Bölüm')}{' '}
              <span className="text-primary">{t('guide.floorHighlight', 'Konumları')}</span>
            </h2>
            <p className="text-gray-500 text-lg">
              {t('guide.floorDesc', 'Hastanelerimizin genel kat planı yapısı. Her hastanenin mimari yapısına göre küçük farklılıklar olabilir.')}
            </p>
          </motion.div>

          <div className="space-y-4">
            {floorPlans(t).map((fp, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="bg-gray-50 rounded-2xl p-6 lg:p-8 border border-gray-100"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-primary text-white flex items-center justify-center font-bold text-sm">
                    {i}
                  </div>
                  <h3 className="text-xl font-bold text-secondary">{fp.floor}</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {fp.areas.map((area, j) => (
                    <span
                      key={j}
                      className="inline-flex items-center gap-1.5 text-sm bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-gray-600"
                    >
                      <FaMapSigns className="text-accent text-xs" />
                      {area}
                    </span>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-8 bg-primary/[0.04] border-l-4 border-primary rounded-r-2xl p-6"
          >
            <p className="text-gray-600 text-sm leading-relaxed">
              <strong className="text-secondary">{t('guide.floorNoteTitle', 'Not:')}</strong>{' '}
              {t('guide.floorNoteDesc', 'Kat planları hastane bazında değişiklik gösterebilir. Detaylı bilgi için danışma masalarımızdan veya 444 50 58 numaralı çağrı merkezimizden yardım alabilirsiniz.')}
            </p>
          </motion.div>
        </div>
      </section>

      {/* ─── HELP POINTS ─── */}
      <section className="bg-gray-50 py-20 lg:py-28">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-2xl mb-14"
          >
            <div className="flex items-center gap-3 mb-5">
              <span className="block h-px w-[60px] bg-accent" />
              <span className="text-xs uppercase tracking-[0.25em] text-accent font-bold">
                {t('guide.helpTag', 'Yardım Noktaları')}
              </span>
            </div>
            <h2 className="text-4xl lg:text-5xl font-black text-secondary leading-tight mb-4">
              {t('guide.helpTitle', 'Size')}{' '}
              <span className="text-primary">{t('guide.helpHighlight', 'Yardımcı Oluyoruz')}</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {helpPoints(t).map((hp, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm text-center hover:shadow-md transition-all duration-300"
              >
                <div className="w-16 h-16 rounded-2xl bg-primary/8 text-primary flex items-center justify-center text-2xl mx-auto mb-5">
                  {hp.icon}
                </div>
                <h3 className="text-lg font-bold text-secondary mb-2">{hp.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{hp.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="bg-primary py-14">
        <div className="container-custom flex flex-col md:flex-row items-center justify-between gap-6">
          <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <p className="text-accent text-xs uppercase tracking-[0.2em] font-bold mb-2">
              {t('common.brand', 'Anadolu Hastaneleri Grubu')}
            </p>
            <h3 className="text-2xl md:text-3xl font-black text-white">
              {t('guide.ctaTitle', 'Sorularınız mı Var?')}
            </h3>
          </motion.div>
          <motion.a
            href="tel:4445058"
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex-shrink-0 inline-flex items-center gap-2 px-8 py-4 bg-accent text-white font-bold rounded-xl hover:brightness-110 transition-all"
          >
            <FaPhone className="text-sm" />
            444 50 58
          </motion.a>
        </div>
      </section>

      {/* ─── LAST UPDATED ─── */}
      <section className="bg-white py-6 border-t border-gray-100">
        <div className="container-custom">
          <LastUpdated date="22.06.2026" />
        </div>
      </section>
    </>
  );
};

export default HospitalGuidePage;
