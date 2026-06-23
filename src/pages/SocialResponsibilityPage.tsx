import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import {
  FaHeart,
  FaLeaf,
  FaHandHoldingMedical,
  FaChevronRight,
  FaUsers,
  FaTree,
  FaGraduationCap,
  FaCalendarAlt,
} from 'react-icons/fa';
import LastUpdated from '../components/ui/LastUpdated';

const projects = (t: any) => [
  {
    icon: <FaHandHoldingMedical />,
    title: t('csr.proj1Title', 'Ücretsiz Sağlık Taramaları'),
    desc: t('csr.proj1Desc', 'Dezavantajlı bölgelerde yaşayan vatandaşlarımıza yönelik düzenli olarak ücretsiz sağlık taramaları, kan şekeri ölçümü ve tansiyon kontrolleri gerçekleştiriyoruz.'),
    stat: t('csr.proj1Stat', '5.000+ Kişi'),
  },
  {
    icon: <FaGraduationCap />,
    title: t('csr.proj2Title', 'Sağlık Okuryazarlığı Eğitimleri'),
    desc: t('csr.proj2Desc', 'Okullarda ve toplum merkezlerinde çocuklara ve yetişkinlere yönelik sağlık okuryazarlığı, ilk yardım ve beslenme eğitimleri veriyoruz.'),
    stat: t('csr.proj2Stat', '120+ Etkinlik'),
  },
  {
    icon: <FaUsers />,
    title: t('csr.proj3Title', 'Gebe Okulu ve Aile Eğitimi'),
    desc: t('csr.proj3Desc', 'Gebelik sürecinde anne adaylarına ve ailelere yönelik ücretsiz bilgilendirme seminerleri ve pratik atölyeler düzenliyoruz.'),
    stat: t('csr.proj3Stat', '2.000+ Aile'),
  },
  {
    icon: <FaHeart />,
    title: t('csr.proj4Title', 'Bağış ve Destek Kampanyaları'),
    desc: t('csr.proj4Desc', 'Ameliyat ve tedavi masraflarını karşılayamayan hastalarımız için sosyal destek projeleri ve bağış kampanyaları yürütüyoruz.'),
    stat: t('csr.proj4Stat', '300+ Hasta'),
  },
];

const sustainability = (t: any) => [
  {
    icon: <FaLeaf />,
    title: t('csr.env1Title', 'Atık Yönetimi'),
    desc: t('csr.env1Desc', 'Tıbbi ve evsel atıkların uluslararası standartlara uygun ayrıştırılması, sterilizasyonu ve geri dönüşümü sağlanmaktadır.'),
  },
  {
    icon: <FaTree />,
    title: t('csr.env2Title', 'Enerji Verimliliği'),
    desc: t('csr.env2Desc', 'LED aydınlatma, invertör klima sistemleri ve güneş enerjisi kullanımı ile karbon ayak izimizi azaltıyoruz.'),
  },
  {
    icon: <FaHeart />,
    title: t('csr.env3Title', 'Yeşil Hastane'),
    desc: t('csr.env3Desc', 'Hastane bahçelerimizde yerel bitki türleriyle yeşil alan oluşturma ve biyoçeşitliliği destekleme çalışmaları yürütüyoruz.'),
  },
];

const events = (t: any) => [
  {
    date: t('csr.event1Date', '15 Nisan 2026'),
    title: t('csr.event1Title', 'Dünya Sağlık Günü Ücretsiz Tarama'),
    location: t('csr.event1Loc', 'Çanakkale Anadolu Hastanesi'),
  },
  {
    date: t('csr.event2Date', '8 Mayıs 2026'),
    title: t('csr.event2Title', 'Anne ve Çocuk Sağlığı Farkındalık Günü'),
    location: t('csr.event2Loc', 'Silivri Anadolu Hastanesi'),
  },
  {
    date: t('csr.event3Date', '5 Haziran 2026'),
    title: t('csr.event3Title', 'Çevre Günü Ağaç Dikim Etkinliği'),
    location: t('csr.event3Loc', 'Karadeniz Ereğli Anadolu Hastanesi'),
  },
];

const SocialResponsibilityPage = () => {
  const { t } = useTranslation();

  return (
    <>
      <Helmet>
        <title>{t('csr.pageTitle', 'Sosyal Sorumluluk')} | Anadolu Hastaneleri Grubu</title>
        <meta
          name="description"
          content={t('csr.metaDescription', 'Topluma katkı projelerimiz, çevre ve sürdürülebilirlik çalışmalarımız ile sağlık hizmetlerini toplumun her kesimine ulaştırıyoruz.')}
        />
      </Helmet>

      {/* ─── HERO ─── */}
      <section className="relative min-h-[480px] md:min-h-[540px] flex items-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1559027615-cd4628902d4a?ixlib=rb-4.0.3&auto=format&fit=crop&w=2400&q=80')",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0a1628]/95 via-[#0a1628]/80 to-[#0a1628]/50" />
        <div className="absolute left-0 top-0 h-full w-1 bg-green-500" />

        <div className="container-custom relative z-10 py-24">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-3xl"
          >
            <div className="flex items-center gap-2 mb-6">
              <span className="block h-px w-10 bg-green-500" />
              <span className="text-green-500 text-xs uppercase tracking-[0.25em] font-semibold">
                {t('csr.heroTag', 'Toplumsal Değer')}
              </span>
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-white leading-tight mb-6">
              {t('csr.heroTitle1', 'Sosyal')}
              <br />
              <span className="text-green-500">{t('csr.heroTitle2', 'Sorumluluk')}</span>
            </h1>
            <p className="text-white/70 text-lg md:text-xl leading-relaxed max-w-xl">
              {t('csr.heroDesc', 'Sağlık hizmetlerini toplumun her kesimine ulaştırmak, çevreye duyarlı büyümek ve toplumsal fayda yaratmak için çalışıyoruz.')}
            </p>
          </motion.div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 overflow-hidden">
          <svg viewBox="0 0 1440 60" preserveAspectRatio="none" className="w-full h-12 md:h-16 fill-gray-50">
            <polygon points="0,60 1440,0 1440,60" />
          </svg>
        </div>
      </section>

      {/* ─── PROJECTS ─── */}
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
                {t('csr.projectsTag', 'Topluma Katkı')}
              </span>
            </div>
            <h2 className="text-4xl lg:text-5xl font-black text-secondary leading-tight mb-4">
              {t('csr.projectsTitle', 'Projelerimiz')}
            </h2>
            <p className="text-gray-500 text-lg">
              {t('csr.projectsDesc', 'Toplum sağlığını artırmaya yönelik sürdürdüğümüz sosyal sorumluluk projelerimiz.')}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {projects(t).map((proj, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-14 h-14 rounded-xl bg-primary/8 text-primary flex items-center justify-center text-2xl">
                    {proj.icon}
                  </div>
                  <span className="text-xs font-bold text-accent bg-accent/10 rounded-full px-3 py-1">
                    {proj.stat}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-secondary mb-2">{proj.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{proj.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── SUSTAINABILITY ─── */}
      <section className="bg-white py-20 lg:py-28">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-2xl mb-14"
          >
            <div className="flex items-center gap-3 mb-5">
              <span className="block h-px w-[60px] bg-green-500" />
              <span className="text-xs uppercase tracking-[0.25em] text-green-500 font-bold">
                {t('csr.sustainTag', 'Çevre ve Sürdürülebilirlik')}
              </span>
            </div>
            <h2 className="text-4xl lg:text-5xl font-black text-secondary leading-tight mb-4">
              {t('csr.sustainTitle', 'Yeşil')}{' '}
              <span className="text-green-600">{t('csr.sustainHighlight', 'Gelecek')}</span>
            </h2>
            <p className="text-gray-500 text-lg">
              {t('csr.sustainDesc', 'Çevresel sürdürülebilirlik ilkeleri doğrultusunda atık yönetiminden enerji verimliliğine kadar her alanda sorumlu davranıyoruz.')}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {sustainability(t).map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group bg-gray-50 rounded-2xl p-8 border border-gray-100 hover:border-green-200 hover:shadow-md transition-all duration-300"
              >
                <div className="w-14 h-14 rounded-xl bg-green-500/10 text-green-600 flex items-center justify-center text-2xl mb-5 group-hover:bg-green-500 group-hover:text-white transition-colors duration-300">
                  {item.icon}
                </div>
                <h3 className="text-lg font-bold text-secondary mb-2">{item.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── EVENTS ─── */}
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
                {t('csr.eventsTag', 'Yaklaşan Etkinlikler')}
              </span>
            </div>
            <h2 className="text-4xl lg:text-5xl font-black text-secondary leading-tight mb-4">
              {t('csr.eventsTitle', 'Etkinlik')}{' '}
              <span className="text-primary">{t('csr.eventsHighlight', 'Takvimi')}</span>
            </h2>
          </motion.div>

          <div className="space-y-4">
            {events(t).map((evt, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex flex-col sm:flex-row sm:items-center gap-4 bg-white rounded-2xl p-6 border border-gray-100 shadow-sm"
              >
                <div className="flex-shrink-0 inline-flex items-center gap-2 text-sm font-bold text-primary bg-primary/5 rounded-xl px-4 py-2">
                  <FaCalendarAlt className="text-xs" />
                  {evt.date}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-secondary">{evt.title}</h3>
                  <p className="text-gray-400 text-sm">{evt.location}</p>
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
              {t('csr.ctaTitle', 'Sosyal Sorumluluk Projelerimize Destek Olun')}
            </h3>
          </motion.div>
          <motion.a
            href="/iletisim"
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex-shrink-0 inline-flex items-center gap-2 px-8 py-4 bg-accent text-white font-bold rounded-xl hover:brightness-110 transition-all"
          >
            {t('common.contactUs', 'İletişime Geçin')}
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

export default SocialResponsibilityPage;
