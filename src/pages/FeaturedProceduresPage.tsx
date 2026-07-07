import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import {
  FaXRay,
  FaBrain,
  FaWaveSquare,
  FaProcedures,
  FaStethoscope,
  FaVenus,
  FaBone,
  FaHeartbeat,
  FaCut,
  FaChild,
  FaRibbon,
  FaBaby,
  FaChevronRight,
  FaCheckCircle,
} from 'react-icons/fa';
import LastUpdated from '../components/ui/LastUpdated';

const groups = (t: any) => [
  {
    icon: <FaXRay />,
    title: t('featuredProcedures.g1Title', 'Girişimsel Radyoloji'),
    items: [
      t('featuredProcedures.g1Item1', 'Girişimsel radyoloji uygulamaları'),
    ],
  },
  {
    icon: <FaBrain />,
    title: t('featuredProcedures.g2Title', 'Beyin Cerrahisi'),
    items: [
      t('featuredProcedures.g2Item1', 'Full endoskopik (kapalı) fıtık ameliyatları'),
    ],
  },
  {
    icon: <FaWaveSquare />,
    title: t('featuredProcedures.g3Title', 'Üroloji'),
    items: [
      t('featuredProcedures.g3Item1', 'ESWT (sertleşme sorunu, penis eğriliği)'),
      t('featuredProcedures.g3Item2', 'Kök hücre ve eksozom tedavisi (sertleşme sorunu)'),
      t('featuredProcedures.g3Item3', 'HoLEP (prostat kazımadan lazer tedavisi)'),
    ],
  },
  {
    icon: <FaProcedures />,
    title: t('featuredProcedures.g4Title', 'Genel Cerrahi'),
    items: [
      t('featuredProcedures.g4Item1', 'Obezite ameliyatları'),
      t('featuredProcedures.g4Item2', 'Şeker (diyabet) ameliyatları'),
    ],
  },
  {
    icon: <FaStethoscope />,
    title: t('featuredProcedures.g5Title', 'Kulak Burun Boğaz (KBB)'),
    items: [
      t('featuredProcedures.g5Item1', 'Rinoplasti (Piezo tekniği)'),
    ],
  },
  {
    icon: <FaVenus />,
    title: t('featuredProcedures.g6Title', 'Kadın Doğum'),
    items: [
      t('featuredProcedures.g6Item1', 'Vajinoplasti'),
      t('featuredProcedures.g6Item2', 'Labiaplasti'),
      t('featuredProcedures.g6Item3', 'Genital PRP, eksozom ve dolgu uygulamaları'),
    ],
  },
  {
    icon: <FaBone />,
    title: t('featuredProcedures.g7Title', 'Ortopedi'),
    items: [
      t('featuredProcedures.g7Item1', 'Mikro el cerrahisi'),
      t('featuredProcedures.g7Item2', 'Sinderella ayağı'),
      t('featuredProcedures.g7Item3', 'Omuz, diz ve kalça protez cerrahisi'),
    ],
  },
  {
    icon: <FaHeartbeat />,
    title: t('featuredProcedures.g8Title', 'Kalp ve Damar Cerrahisi (KVC)'),
    items: [
      t('featuredProcedures.g8Item1', 'Yara bakımı'),
      t('featuredProcedures.g8Item2', 'Stent uygulamaları'),
      t('featuredProcedures.g8Item3', 'Sanal anjiyo uygulamaları'),
      t('featuredProcedures.g8Item4', 'Diyabetik ayak tedavisi'),
    ],
  },
  {
    icon: <FaCut />,
    title: t('featuredProcedures.g9Title', 'Plastik, Rekonstrüktif ve Estetik Cerrahi'),
    items: [
      t('featuredProcedures.g9Item1', 'Eksozom ve PRP destekli saç ekimi'),
    ],
  },
  {
    icon: <FaChild />,
    title: t('featuredProcedures.g10Title', 'Fizik Tedavi ve Rehabilitasyon (FTR)'),
    items: [
      t('featuredProcedures.g10Item1', 'Çocuk rehabilitasyonu'),
      t('featuredProcedures.g10Item2', 'İyontoforez (el-ayak terleme tedavisi)'),
      t('featuredProcedures.g10Item3', 'Hemipleji pediatrik rehabilitasyon'),
    ],
  },
  {
    icon: <FaRibbon />,
    title: t('featuredProcedures.g11Title', 'Medikal Onkoloji'),
    items: [
      t('featuredProcedures.g11Item1', 'Kanser tedavileri'),
    ],
  },
  {
    icon: <FaBaby />,
    title: t('featuredProcedures.g12Title', 'Çocuk Cerrahisi'),
    items: [
      t('featuredProcedures.g12Item1', 'İnmemiş testis'),
      t('featuredProcedures.g12Item2', 'Sünnet ve yenidoğan sünneti'),
      t('featuredProcedures.g12Item3', 'Asansör testis'),
      t('featuredProcedures.g12Item4', 'Doğum anomalileri'),
      t('featuredProcedures.g12Item5', 'Sindirim sistemi cerrahi hastalıkları'),
      t('featuredProcedures.g12Item6', 'Çocuklarda baş boyun cerrahisi'),
      t('featuredProcedures.g12Item7', 'Boşaltım sistemi ve üreme organlarına ait cerrahi hastalıklar'),
    ],
  },
];

const FeaturedProceduresPage = () => {
  const { t } = useTranslation();

  return (
    <>
      <Helmet>
        <title>{t('featuredProcedures.pageTitle', 'Özellikli İşlemler')} | Anadolu Hastaneleri Grubu</title>
        <meta
          name="description"
          content={t(
            'featuredProcedures.metaDescription',
            'Anadolu Hastaneleri Grubu bünyesinde uygulanan özellikli tıbbi işlemler ve ileri teknoloji tedavi yöntemleri.'
          )}
        />
      </Helmet>

      {/* ─── HERO ─── */}
      <section className="relative min-h-[420px] md:min-h-[480px] flex items-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1551190822-a9333d879b1f?ixlib=rb-4.0.3&auto=format&fit=crop&w=2400&q=80')",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0a1628]/95 via-[#0a1628]/80 to-[#0a1628]/50" />
        <div className="absolute left-0 top-0 h-full w-1 bg-accent" />

        <div className="container-custom relative z-10 py-20">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-3xl"
          >
            <div className="flex items-center gap-2 mb-6">
              <span className="block h-px w-10 bg-accent" />
              <span className="text-accent text-xs uppercase tracking-[0.25em] font-semibold">
                {t('featuredProcedures.heroTag', 'İleri Teknoloji Tedaviler')}
              </span>
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-white leading-tight mb-6">
              {t('featuredProcedures.heroTitle', 'Özellikli İşlemler')}
            </h1>
            <p className="text-white/70 text-lg md:text-xl leading-relaxed max-w-xl">
              {t(
                'featuredProcedures.heroDesc',
                'Bölümlerimizde uzman hekim kadromuz tarafından uygulanan ileri teknoloji ve özellikli tıbbi işlemlerle hastalarımıza kapsamlı çözümler sunuyoruz.'
              )}
            </p>
          </motion.div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 overflow-hidden">
          <svg viewBox="0 0 1440 60" preserveAspectRatio="none" className="w-full h-12 md:h-16 fill-gray-50">
            <polygon points="0,60 1440,0 1440,60" />
          </svg>
        </div>
      </section>

      {/* ─── GROUPS GRID ─── */}
      <section className="bg-gray-50 py-20 lg:py-28">
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {groups(t).map((group, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: (i % 6) * 0.06 }}
                className="group bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col"
              >
                <div className="h-2 bg-primary-200" />
                <div className="p-7 flex flex-col flex-1">
                  <div className="w-14 h-14 rounded-2xl bg-primary/8 text-primary flex items-center justify-center text-2xl mb-4 group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                    {group.icon}
                  </div>
                  <h3 className="text-lg font-bold text-secondary mb-4">{group.title}</h3>
                  <ul className="space-y-2.5 flex-1">
                    {group.items.map((item, j) => (
                      <li key={j} className="flex items-start gap-2.5 text-sm text-gray-500 leading-relaxed">
                        <FaCheckCircle className="text-primary/60 mt-0.5 flex-shrink-0 text-xs" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
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
              {t('featuredProcedures.ctaTitle', 'Size En Uygun Tedaviyi Keşfedin')}
            </h3>
          </motion.div>
          <div className="flex flex-wrap gap-3">
            <a
              href="/bolumlerimiz"
              className="flex-shrink-0 inline-flex items-center gap-2 px-8 py-4 bg-accent text-white font-bold rounded-xl hover:brightness-110 transition-all"
            >
              {t('featuredProcedures.ctaButton1', 'Tüm Bölümler')}
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
          <LastUpdated date="07.07.2026" />
        </div>
      </section>
    </>
  );
};

export default FeaturedProceduresPage;
