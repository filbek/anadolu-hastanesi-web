import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import {
  FaPhone,
  FaAmbulance,
  FaClock,
  FaHeartbeat,
  FaStethoscope,
  FaProcedures,
  FaChevronRight,
  FaExclamationTriangle,
  FaUserMd,
  FaShieldAlt,
} from 'react-icons/fa';
import LastUpdated from '../components/ui/LastUpdated';

const triageLevels = (t: any) => [
  {
    color: 'bg-red-500',
    level: t('emergency.triage1Level', 'Seviye 1'),
    title: t('emergency.triage1Title', 'Hayati Tehlike'),
    desc: t('emergency.triage1Desc', 'Solunum/yetersizliği, kalbi durma, şok, ağır travma. Anında müdahale edilir.'),
    wait: t('emergency.triage1Wait', 'Bekleme: Yok'),
  },
  {
    color: 'bg-orange-500',
    level: t('emergency.triage2Level', 'Seviye 2'),
    title: t('emergency.triage2Title', 'Acil'),
    desc: t('emergency.triage2Desc', 'Göğüs ağrısı, ciddi kanama, kırık, yüksek ateşli nöbet. 10 dk içinde değerlendirilir.'),
    wait: t('emergency.triage2Wait', 'Bekleme: ~10 dk'),
  },
  {
    color: 'bg-yellow-500',
    level: t('emergency.triage3Level', 'Seviye 3'),
    title: t('emergency.triage3Title', 'Acil Değil, Öncelikli'),
    desc: t('emergency.triage3Desc', 'Orta şiddette karın ağrısı, yanık, baş dönmesi. 30 dk içinde değerlendirilir.'),
    wait: t('emergency.triage3Wait', 'Bekleme: ~30 dk'),
  },
  {
    color: 'bg-green-500',
    level: t('emergency.triage4Level', 'Seviye 4'),
    title: t('emergency.triage4Title', 'Acil Değil'),
    desc: t('emergency.triage4Desc', 'Hafif yara, burkulma, ateş, öksürük. 60 dk içinde değerlendirilir.'),
    wait: t('emergency.triage4Wait', 'Bekleme: ~60 dk'),
  },
  {
    color: 'bg-blue-500',
    level: t('emergency.triage5Level', 'Seviye 5'),
    title: t('emergency.triage5Title', 'Acil Değil, Rutin'),
    desc: t('emergency.triage5Desc', 'Soğuk algınlığı, hafif alerji, kronik rahatsızlık takibi. En kısa sürede.'),
    wait: t('emergency.triage5Wait', 'Bekleme: Değişken'),
  },
];

const services = (t: any) => [
  {
    icon: <FaAmbulance />,
    title: t('emergency.svcAmbulanceTitle', 'Ambulans Hizmeti'),
    desc: t('emergency.svcAmbulanceDesc', 'Tam donanımlı ambulans filomuzla hastaneye nakil ve olay yeri müdahalesi.'),
  },
  {
    icon: <FaHeartbeat />,
    title: t('emergency.svcCardioTitle', 'Kardiyak Müdahale'),
    desc: t('emergency.svcCardioDesc', 'Kalp krizi, ritim bozuklukları ve solunum yetmezliğine anında müdahale.'),
  },
  {
    icon: <FaProcedures />,
    title: t('emergency.svcTraumaTitle', 'Travma Müdahalesi'),
    desc: t('emergency.svcTraumaDesc', 'Trafik kazası, düşme ve iş kazalarına yönelik multidisipliner travma ekibi.'),
  },
  {
    icon: <FaStethoscope />,
    title: t('emergency.svcPediatricTitle', 'Çocuk Acil'),
    desc: t('emergency.svcPediatricDesc', 'Pediatrik acil uzmanlarımızla çocuk hastalara özel yaklaşım ve ekipman.'),
  },
  {
    icon: <FaUserMd />,
    title: t('emergency.svcSurgeryTitle', 'Acil Cerrahi'),
    desc: t('emergency.svcSurgeryDesc', 'Apandisit, akut batın, kanama gibi durumlarda 7/24 cerrahi ekibi.'),
  },
  {
    icon: <FaShieldAlt />,
    title: t('emergency.svcPoisonTitle', 'Zehirlenme Merkezi'),
    desc: t('emergency.svcPoisonDesc', 'İlaç, gıda ve kimyasal zehirlenmelerine yönelik detoks ve tedavi hizmeti.'),
  },
];

const EmergencyServicesPage = () => {
  const { t } = useTranslation();

  return (
    <>
      <Helmet>
        <title>{t('emergency.pageTitle', 'Acil Servis')} | Anadolu Hastaneleri Grubu</title>
        <meta
          name="description"
          content={t('emergency.metaDescription', '7/24 kesintisiz acil sağlık hizmeti. Uzman hekim kadromuz ve modern ekipmanlarımızla hayati durumlara anında müdahale.')}
        />
      </Helmet>

      {/* ─── HERO ─── */}
      <section className="relative min-h-[480px] md:min-h-[540px] flex items-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=1920&q=80')",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0a1628]/95 via-[#0a1628]/80 to-[#0a1628]/50" />
        <div className="absolute left-0 top-0 h-full w-1 bg-red-500" />

        <div className="container-custom relative z-10 py-24">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-3xl"
          >
            <div className="flex items-center gap-2 mb-6">
              <span className="block h-px w-10 bg-red-500" />
              <span className="text-red-500 text-xs uppercase tracking-[0.25em] font-semibold">
                {t('emergency.heroTag', '7/24 Kesintisiz Hizmet')}
              </span>
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-white leading-tight mb-6">
              {t('emergency.heroTitle1', 'Acil')}
              <br />
              <span className="text-red-500">{t('emergency.heroTitle2', 'Servisimiz')}</span>
            </h1>
            <p className="text-white/70 text-lg md:text-xl leading-relaxed max-w-xl">
              {t('emergency.heroDesc', 'Hayati durumlarda her saniye önemlidir. Uzman kadromuz ve modern ekipmanlarımızla 7 gün 24 saat yanınızdayız.')}
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <a
                href="tel:4445058"
                className="inline-flex items-center gap-3 px-6 py-3 bg-red-500 text-white font-bold rounded-xl hover:brightness-110 transition-all"
              >
                <FaPhone />
                444 50 58
              </a>
              <a
                href="tel:112"
                className="inline-flex items-center gap-3 px-6 py-3 bg-white/10 backdrop-blur-xl text-white border border-white/20 rounded-xl font-bold hover:bg-white/20 transition-all"
              >
                <FaAmbulance />
                112
              </a>
            </div>
          </motion.div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 overflow-hidden">
          <svg viewBox="0 0 1440 60" preserveAspectRatio="none" className="w-full h-12 md:h-16 fill-gray-50">
            <polygon points="0,60 1440,0 1440,60" />
          </svg>
        </div>
      </section>

      {/* ─── TRIAGE ─── */}
      <section className="bg-gray-50 py-20 lg:py-28">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-2xl mb-14"
          >
            <div className="flex items-center gap-3 mb-5">
              <span className="block h-px w-[60px] bg-red-500" />
              <span className="text-xs uppercase tracking-[0.25em] text-red-500 font-bold">
                {t('emergency.triageTag', 'Triyaj Sistemi')}
              </span>
            </div>
            <h2 className="text-4xl lg:text-5xl font-black text-secondary leading-tight mb-4">
              {t('emergency.triageTitle', 'Öncelik')}{' '}
              <span className="text-primary">{t('emergency.triageHighlight', 'Sıralaması')}</span>
            </h2>
            <p className="text-gray-500 text-lg">
              {t('emergency.triageDesc', 'Acil servisimizde hastalar, şikayet şiddetine göre 5 seviyeli triyaj sistemiyle değerlendirilir. Bu sayede hayati tehlike olan hastalara öncelik verilir.')}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {triageLevels(t).map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="bg-white rounded-2xl p-7 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-4 h-4 rounded-full ${item.color}`} />
                  <span className="text-sm font-bold text-gray-400">{item.level}</span>
                </div>
                <h3 className="text-xl font-black text-secondary mb-2">{item.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed mb-4">{item.desc}</p>
                <div className="inline-flex items-center gap-2 text-xs font-bold text-primary bg-primary/5 rounded-full px-3 py-1">
                  <FaClock className="text-[10px]" />
                  {item.wait}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── SERVICES ─── */}
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
                {t('emergency.servicesTag', 'Hizmetlerimiz')}
              </span>
            </div>
            <h2 className="text-4xl lg:text-5xl font-black text-secondary leading-tight mb-4">
              {t('emergency.servicesTitle', 'Acil Servis')}{' '}
              <span className="text-primary">{t('emergency.servicesHighlight', 'Birimlerimiz')}</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services(t).map((svc, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="group bg-gray-50 rounded-2xl p-8 border border-gray-100 hover:border-primary/20 hover:shadow-md transition-all duration-300"
              >
                <div className="w-14 h-14 rounded-xl bg-primary/8 text-primary flex items-center justify-center text-2xl mb-5 group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                  {svc.icon}
                </div>
                <h3 className="text-lg font-bold text-secondary mb-2">{svc.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{svc.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── IMPORTANT INFO ─── */}
      <section className="bg-primary py-20">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <div className="flex items-center gap-2 mb-6">
                <span className="block h-px w-10 bg-red-500" />
                <span className="text-red-500 text-xs uppercase tracking-[0.25em] font-semibold">
                  {t('emergency.infoTag', 'Önemli Bilgiler')}
                </span>
              </div>
              <h2 className="text-3xl lg:text-4xl font-black text-white leading-tight mb-6">
                {t('emergency.infoTitle', 'Acil Servise Gelirken Dikkat Edilmesi Gerekenler')}
              </h2>
              <ul className="space-y-4">
                {[
                  t('emergency.info1', 'Mevcut ilaçlarınızın listesini yanınızda bulundurun.'),
                  t('emergency.info2', 'Daha önceki tetkik ve raporlarınızı getirin.'),
                  t('emergency.info3', 'Hasta kimlik kartı, SGK / özel sigorta bilgilerini hazır bulundurun.'),
                  t('emergency.info4', 'Yanınızda bir refakatçi bulundurmanız önerilir.'),
                ].map((text, i) => (
                  <li key={i} className="flex items-start gap-3 text-white/80">
                    <FaChevronRight className="text-accent mt-1 flex-shrink-0 text-xs" />
                    {text}
                  </li>
                ))}
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-8 lg:p-10"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-red-500/20 text-red-400 flex items-center justify-center text-xl">
                  <FaExclamationTriangle />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">{t('emergency.warningTitle', 'Hayati Durumlar')}</h3>
                  <p className="text-white/50 text-sm">{t('emergency.warningSubtitle', 'Hemen 112 veya 444 50 58\'i arayın')}</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  t('emergency.warning1', 'Göğüs ağrısı ve nefes darlığı'),
                  t('emergency.warning2', 'Bilinç kaybı / bayılma'),
                  t('emergency.warning3', 'Şiddetli kanama'),
                  t('emergency.warning4', 'Şok belirtileri'),
                  t('emergency.warning5', 'Ağır travma / kafa yaralanması'),
                  t('emergency.warning6', 'Zehirlenme şüphesi'),
                ].map((w, i) => (
                  <div key={i} className="flex items-center gap-2 text-white/70 text-sm">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />
                    {w}
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="bg-gray-50 py-14">
        <div className="container-custom flex flex-col md:flex-row items-center justify-between gap-6">
          <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <p className="text-accent text-xs uppercase tracking-[0.2em] font-bold mb-2">
              {t('common.brand', 'Anadolu Hastaneleri Grubu')}
            </p>
            <h3 className="text-2xl md:text-3xl font-black text-secondary">
              {t('emergency.ctaTitle', '"Herşey Sağlığınız İçin..."')}
            </h3>
          </motion.div>
          <div className="flex flex-wrap gap-3">
            <a
              href="tel:4445058"
              className="flex-shrink-0 inline-flex items-center gap-2 px-8 py-4 bg-red-500 text-white font-bold rounded-xl hover:brightness-110 transition-all"
            >
              <FaPhone className="text-sm" />
              444 50 58
            </a>
            <a
              href="/iletisim"
              className="flex-shrink-0 inline-flex items-center gap-2 px-8 py-4 bg-primary text-white font-bold rounded-xl hover:brightness-110 transition-all"
            >
              {t('common.contactUs', 'İletişime Geçin')}
              <FaChevronRight className="text-sm" />
            </a>
          </div>
        </div>
      </section>

      {/* ─── LAST UPDATED ─── */}
      <section className="bg-white py-6 border-t border-gray-100">
        <div className="container-custom">
          <LastUpdated date="16.05.2024" />
        </div>
      </section>
    </>
  );
};

export default EmergencyServicesPage;
