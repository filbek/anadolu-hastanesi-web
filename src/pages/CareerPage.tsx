import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import {
  FaExternalLinkAlt,
  FaChevronRight,
  FaUsers,
  FaUserGraduate,
  FaHandsHelping,
  FaHeartbeat,
  FaBriefcase,
  FaStethoscope,
  FaLaptopMedical,
  FaUserNurse,
  FaChartLine,
} from 'react-icons/fa';
import LastUpdated from '../components/ui/LastUpdated';

const benefits = (t: any) => [
  {
    icon: <FaHeartbeat />,
    title: t('career.ben1Title', 'Sağlık Sigortası'),
    desc: t('career.ben1Desc', 'Çalışanlarımız ve birinci derece yakınları için kapsamlı özel sağlık sigortası.'),
  },
  {
    icon: <FaUserGraduate />,
    title: t('career.ben2Title', 'Eğitim ve Gelişim'),
    desc: t('career.ben2Desc', 'Mesleki gelişim programları, kongre ve sempozyum destekleri, e-öğrenme platformu.'),
  },
  {
    icon: <FaChartLine />,
    title: t('career.ben3Title', 'Kariyer Yolu'),
    desc: t('career.ben3Desc', 'Net kariyer basamakları, performans değerlendirme sistemi ve terfi imkanları.'),
  },
  {
    icon: <FaHandsHelping />,
    title: t('career.ben4Title', 'Yemek ve Servis'),
    desc: t('career.ben4Desc', 'Ücretsiz öğle yemeği ve belirli hatlar üzerinde servis imkanı.'),
  },
];

const departments = (t: any) => [
  { icon: <FaStethoscope />, title: t('career.dept1', 'Doktor / Uzman Hekim') },
  { icon: <FaUserNurse />, title: t('career.dept2', 'Hemşire ve Sağlık Personeli') },
  { icon: <FaLaptopMedical />, title: t('career.dept3', 'Tıbbi Teknisyen / Tekniker') },
  { icon: <FaBriefcase />, title: t('career.dept4', 'İdari ve Mali İşler') },
  { icon: <FaUsers />, title: t('career.dept5', 'İnsan Kaynakları') },
  { icon: <FaChartLine />, title: t('career.dept6', 'Kalite ve Hasta Güvenliği') },
];

const processSteps = (t: any) => [
  {
    number: '01',
    title: t('career.step1Title', 'Başvuru'),
    desc: t('career.step1Desc', 'Yenibiris.com üzerinden veya kariyer portalımızdan ilgili pozisyona başvurunuzu yapın.'),
  },
  {
    number: '02',
    title: t('career.step2Title', 'Ön Değerlendirme'),
    desc: t('career.step2Desc', 'İK ekibimiz başvuruları inceleyerek uygun adayları ön değerlendirmeye alır.'),
  },
  {
    number: '03',
    title: t('career.step3Title', 'Mülakat'),
    desc: t('career.step3Desc', 'Uygun adaylarla İK ve ilgili birim yöneticileri mülakatları gerçekleştirir.'),
  },
  {
    number: '04',
    title: t('career.step4Title', 'Teklif ve İşe Başlama'),
    desc: t('career.step4Desc', 'Olumlu değerlendirme sonrası iş teklifi yapılır ve oryantasyon süreci başlar.'),
  },
];

const CareerPage = () => {
  const { t } = useTranslation();

  return (
    <>
      <Helmet>
        <title>{t('career.pageTitle', 'İnsan Kaynakları ve Kariyer')} | Anadolu Hastaneleri Grubu</title>
        <meta
          name="description"
          content={t('career.metaDescription', 'Anadolu Hastaneleri Grubu kariyer fırsatları, işe alım süreçleri ve çalışan hakları. Yetenekli profesyonelleri aramıza bekliyoruz.')}
        />
      </Helmet>

      {/* ─── HERO ─── */}
      <section className="relative min-h-[480px] md:min-h-[540px] flex items-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1576091160550-2173dba999ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=2400&q=80')",
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
                {t('career.heroTag', 'İnsan Kaynakları')}
              </span>
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-white leading-tight mb-6">
              {t('career.heroTitle1', 'Kariyer')}
              <br />
              <span className="text-accent">{t('career.heroTitle2', 'Fırsatları')}</span>
            </h1>
            <p className="text-white/70 text-lg md:text-xl leading-relaxed max-w-xl mb-8">
              {t('career.heroDesc', 'Sağlık sektöründe fark yaratmak isteyen, insan odaklı ve yenilikçi profesyonelleri aramıza bekliyoruz.')}
            </p>
            <a
              href="https://www.yenibiris.com/firma/anadolu-hastaneleri/is-ilanlari/259590"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 px-8 py-4 bg-accent text-white font-bold rounded-xl hover:brightness-110 transition-all"
            >
              <FaExternalLinkAlt />
              {t('career.applyButton', 'Açık Pozisyonları Gör')}
            </a>
          </motion.div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 overflow-hidden">
          <svg viewBox="0 0 1440 60" preserveAspectRatio="none" className="w-full h-12 md:h-16 fill-gray-50">
            <polygon points="0,60 1440,0 1440,60" />
          </svg>
        </div>
      </section>

      {/* ─── OPEN POSITIONS LINK ─── */}
      <section className="bg-gray-50 py-20 lg:py-28">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto text-center mb-16"
          >
            <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center text-2xl mx-auto mb-6">
              <FaBriefcase />
            </div>
            <h2 className="text-3xl lg:text-4xl font-black text-secondary mb-4">
              {t('career.openTitle', 'Açık Pozisyonlarımız')}
            </h2>
            <p className="text-gray-500 text-lg leading-relaxed mb-8">
              {t('career.openDesc', 'Tüm iş ilanlarımızı Yenibiris.com üzerinden yayınlıyoruz. Size uygun pozisyonu bulmak için hemen inceleyin.')}
            </p>
            <a
              href="https://www.yenibiris.com/firma/anadolu-hastaneleri/is-ilanlari/259590"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 px-8 py-4 bg-primary text-white font-bold rounded-xl hover:brightness-110 transition-all"
            >
              <FaExternalLinkAlt />
              {t('career.openButton', 'Yenibiris.com\'da Görüntüle')}
            </a>
          </motion.div>

          {/* Departments */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {departments(t).map((dept, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="flex items-center gap-4 bg-white rounded-xl p-5 border border-gray-100 shadow-sm hover:shadow-md hover:border-primary/20 transition-all duration-300"
              >
                <div className="w-10 h-10 rounded-lg bg-primary/8 text-primary flex items-center justify-center text-lg flex-shrink-0">
                  {dept.icon}
                </div>
                <span className="font-bold text-secondary text-sm">{dept.title}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── PROCESS ─── */}
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
                {t('career.processTag', 'İşe Alım Süreci')}
              </span>
            </div>
            <h2 className="text-4xl lg:text-5xl font-black text-secondary leading-tight mb-4">
              {t('career.processTitle', 'Süreç')}{' '}
              <span className="text-primary">{t('career.processHighlight', 'Nasıl İşler?')}</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {processSteps(t).map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="relative bg-gray-50 rounded-2xl p-8 border border-gray-100"
              >
                <span className="absolute top-4 right-4 text-5xl font-black text-gray-100 leading-none select-none">
                  {step.number}
                </span>
                <div className="relative z-10">
                  <span className="inline-block px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded-full mb-4">
                    {step.number}
                  </span>
                  <h3 className="text-xl font-black text-secondary mb-3">{step.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── BENEFITS ─── */}
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
                {t('career.benefitsTag', 'Çalışan Hakları ve Faydalar')}
              </span>
            </div>
            <h2 className="text-4xl lg:text-5xl font-black text-secondary leading-tight mb-4">
              {t('career.benefitsTitle', 'Neden')}{' '}
              <span className="text-primary">{t('career.benefitsHighlight', 'Anadolu?')}</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {benefits(t).map((ben, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex items-start gap-5 bg-white rounded-2xl p-8 border border-gray-100 shadow-sm"
              >
                <div className="w-14 h-14 rounded-xl bg-primary/8 text-primary flex items-center justify-center text-2xl flex-shrink-0">
                  {ben.icon}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-secondary mb-2">{ben.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{ben.desc}</p>
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
              {t('career.ctaTitle', 'Ailemize Katılmak İster misiniz?')}
            </h3>
          </motion.div>
          <motion.a
            href="https://www.yenibiris.com/firma/anadolu-hastaneleri/is-ilanlari/259590"
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex-shrink-0 inline-flex items-center gap-2 px-8 py-4 bg-accent text-white font-bold rounded-xl hover:brightness-110 transition-all"
          >
            <FaExternalLinkAlt className="text-sm" />
            {t('career.ctaButton', 'Başvuru Yap')}
            <FaChevronRight className="text-sm" />
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

export default CareerPage;
