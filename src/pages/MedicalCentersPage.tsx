import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import {
  FaHeartbeat,
  FaBaby,
  FaBrain,
  FaBone,
  FaEye,
  FaTooth,
  FaChevronRight,
  FaUserMd,
  FaMicroscope,
  FaStethoscope,
} from 'react-icons/fa';
import LastUpdated from '../components/ui/LastUpdated';

const centers = (t: any) => [
  {
    icon: <FaHeartbeat />,
    title: t('centers.center1Title', 'Kalp ve Damar Cerrahisi Merkezi'),
    desc: t('centers.center1Desc', 'Koroner anjiyografi, by-pass cerrahisi, kapak ameliyatları, kalp pili takılması ve anjioplasti işlemlerinde uzman kadro ve modern ekipmanlar.'),
    stats: [
      t('centers.center1Stat1', '10.000+ Anjiyografi'),
      t('centers.center1Stat2', '2.000+ By-Pass'),
    ],
    color: 'from-red-500 to-rose-600',
  },
  {
    icon: <FaBaby />,
    title: t('centers.center2Title', 'Tüp Bebek ve Üreme Sağlığı Merkezi'),
    desc: t('centers.center2Desc', 'IVF, ICSI, embriyo dondurma ve taze embriyo transferi işlemlerinde yüksek başarı oranları ile çocuk sahibi olmak isteyen çiftlere umut oluyoruz.'),
    stats: [
      t('centers.center2Stat1', '3.000+ Uygulama'),
      t('centers.center2Stat2', 'Yüksek Başarı Oranı'),
    ],
    color: 'from-pink-500 to-fuchsia-600',
  },
  {
    icon: <FaBrain />,
    title: t('centers.center3Title', 'Beyin ve Sinir Cerrahisi Merkezi'),
    desc: t('centers.center3Desc', 'Beyin tümörleri, omurilik cerrahisi, nörovasküler müdahaleler ve Parkinson tedavisinde ileri teknoloji ve mikrocerrahi uzmanlığı.'),
    stats: [
      t('centers.center3Stat1', '500+ Ameliyat/Yıl'),
      t('centers.center3Stat3', 'Navigasyon Cerrahisi'),
    ],
    color: 'from-indigo-500 to-violet-600',
  },
  {
    icon: <FaBone />,
    title: t('centers.center4Title', 'Ortopedi ve Travmatoloji Merkezi'),
    desc: t('centers.center4Desc', 'Diz ve kalça protezi, omurga cerrahisi, artroskopi, spor yaralanmaları ve el cerrahisinde robotik destekli ameliyat imkanları.'),
    stats: [
      t('centers.center4Stat1', '1.000+ Protez/Yıl'),
      t('centers.center4Stat2', 'Robotik Cerrahi'),
    ],
    color: 'from-teal-500 to-emerald-600',
  },
  {
    icon: <FaEye />,
    title: t('centers.center5Title', 'Göz Sağlığı ve Cerrahisi Merkezi'),
    desc: t('centers.center5Desc', 'LASIK, SMILE, katarakt ameliyatı, retina tedavileri ve göz kapağı estetiğinde lazer teknolojisi ve uzman hekim kadrosu.'),
    stats: [
      t('centers.center5Stat1', '5.000+ Katarakt/Yıl'),
      t('centers.center5Stat2', 'Femtosaniye Lazer'),
    ],
    color: 'from-blue-500 to-cyan-600',
  },
  {
    icon: <FaTooth />,
    title: t('centers.center6Title', 'Ağız ve Diş Sağlığı Merkezi'),
    desc: t('centers.center6Desc', 'İmplant, zirkonyum kaplama, gülüş tasarımı, ortodonti ve çocuk diş hekimliğinde estetik ve fonksiyonel çözümler.'),
    stats: [
      t('centers.center6Stat1', 'Dijital Diş Hekimliği'),
      t('centers.center6Stat2', 'Sedasyon Desteği'),
    ],
    color: 'from-amber-500 to-orange-600',
  },
  {
    icon: <FaMicroscope />,
    title: t('centers.center7Title', 'Onkoloji Merkezi'),
    desc: t('centers.center7Desc', 'Medikal onkoloji, radyasyon onkolojisi ve cerrahi onkoloji birimleriyle kanser tedavisinde multidisipliner yaklaşım.'),
    stats: [
      t('centers.center7Stat1', 'TruesBeam STx'),
      t('centers.center7Stat2', 'PET-CT'),
    ],
    color: 'from-purple-500 to-violet-600',
  },
  {
    icon: <FaStethoscope />,
    title: t('centers.center8Title', 'Check-Up ve Erken Teşhis Merkezi'),
    desc: t('centers.center8Desc', 'Yaş ve cinsiyete özel check-up paketleri, erken teşhis protokolleri ve kapsamlı sağlık taramaları ile proaktif sağlık yönetimi.'),
    stats: [
      t('centers.center8Stat1', '50+ Paket'),
      t('centers.center8Stat2', 'Aynı Gün Sonuç'),
    ],
    color: 'from-green-500 to-emerald-600',
  },
];

const MedicalCentersPage = () => {
  const { t } = useTranslation();

  return (
    <>
      <Helmet>
        <title>{t('centers.pageTitle', 'Merkezlerimiz')} | Anadolu Hastaneleri Grubu</title>
        <meta
          name="description"
          content={t('centers.metaDescription', 'Kalp merkezi, tüp bebek merkezi, beyin cerrahisi, ortopedi ve diğer uzman merkezlerimiz hakkında detaylı bilgi.')}
        />
      </Helmet>

      {/* ─── HERO ─── */}
      <section className="relative min-h-[480px] md:min-h-[540px] flex items-center overflow-hidden">
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
                {t('centers.heroTag', 'Uzmanlık Merkezleri')}
              </span>
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-white leading-tight mb-6">
              {t('centers.heroTitle1', 'Merkezlerimiz')}
            </h1>
            <p className="text-white/70 text-lg md:text-xl leading-relaxed max-w-xl">
              {t('centers.heroDesc', 'Her biri alanında uzman kadrolar ve en son teknoloji ile donatılmış merkezlerimizde, hastalarımıza odaklanmış çözümler sunuyoruz.')}
            </p>
          </motion.div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 overflow-hidden">
          <svg viewBox="0 0 1440 60" preserveAspectRatio="none" className="w-full h-12 md:h-16 fill-gray-50">
            <polygon points="0,60 1440,0 1440,60" />
          </svg>
        </div>
      </section>

      {/* ─── CENTERS GRID ─── */}
      <section className="bg-gray-50 py-20 lg:py-28">
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {centers(t).map((center, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="group bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300"
              >
                {/* Color bar */}
                <div className={`h-2 bg-gradient-to-r ${center.color}`} />
                <div className="p-8">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-14 h-14 rounded-2xl bg-primary/8 text-primary flex items-center justify-center text-2xl group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                      {center.icon}
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-secondary mb-3">{center.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed mb-5">{center.desc}</p>
                  <div className="flex flex-wrap gap-2 mb-6">
                    {center.stats.map((stat, j) => (
                      <span
                        key={j}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-primary bg-primary/5 rounded-full px-3 py-1"
                      >
                        <FaUserMd className="text-[10px]" />
                        {stat}
                      </span>
                    ))}
                  </div>
                  <a
                    href="/bolumlerimiz"
                    className="inline-flex items-center gap-2 text-sm font-bold text-primary hover:gap-3 transition-all"
                  >
                    {t('centers.viewDoctors', 'İlgili Bölümleri Gör')}
                    <FaChevronRight className="text-xs" />
                  </a>
                </div>
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
              {t('centers.ctaTitle', 'Size En Uygun Merkezi Keşfedin')}
            </h3>
          </motion.div>
          <div className="flex flex-wrap gap-3">
            <a
              href="/bolumlerimiz"
              className="flex-shrink-0 inline-flex items-center gap-2 px-8 py-4 bg-accent text-white font-bold rounded-xl hover:brightness-110 transition-all"
            >
              {t('centers.ctaButton1', 'Tüm Bölümler')}
              <FaChevronRight className="text-sm" />
            </a>
            <a
              href="https://anadoluhastaneleri.kendineiyibak.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-shrink-0 inline-flex items-center gap-2 px-8 py-4 bg-white/10 backdrop-blur-xl text-white border border-white/20 rounded-xl font-bold hover:bg-white/20 transition-all"
            >
              {t('common.onlineAppointment', 'Online Randevu')}
            </a>
          </div>
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

export default MedicalCentersPage;
