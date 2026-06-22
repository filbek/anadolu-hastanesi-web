import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import {
  FaBus,
  FaSubway,
  FaCar,
  FaParking,
  FaWheelchair,
  FaMapMarkerAlt,
  FaChevronRight,
  FaClock,
  FaInfoCircle,
} from 'react-icons/fa';
import LastUpdated from '../components/ui/LastUpdated';

const transportOptions = (t: any) => [
  {
    icon: <FaBus />,
    title: t('trans.busTitle', 'Otobüs ve Minibüs'),
    desc: t('trans.busDesc', 'Hastanelerimize ulaşan belediye otobüsü ve minibüs hatları hakkında detaylı bilgi.'),
  },
  {
    icon: <FaSubway />,
    title: t('trans.metroTitle', 'Metro ve Marmaray'),
    desc: t('trans.metroDesc', 'En yakın metro ve Marmaray duraklarından hastanelerimize ulaşım seçenekleri.'),
  },
  {
    icon: <FaCar />,
    title: t('trans.carTitle', 'Özel Araç'),
    desc: t('trans.carDesc', 'Navigasyon bilgileri ve ana yollardan hastanelerimize ulaşım rotaları.'),
  },
  {
    icon: <FaWheelchair />,
    title: t('trans.accessibleTitle', 'Engelli Ulaşım'),
    desc: t('trans.accessibleDesc', 'Engelli rampaları, asansörler ve özel nakil hizmetleri hakkında bilgi.'),
  },
];

const hospitals = (t: any) => [
  {
    name: t('trans.hosp1Name', 'Avcılar Anadolu Hastanesi'),
    address: 'Avcılar, İstanbul',
    bus: '76, 76BA, 147, 429, BN1',
    metro: 'M1A Yenikapı - Havalimanı (Avcılar Merkez durağı)',
    parking: t('trans.parkingFree', 'Ücretsiz'),
  },
  {
    name: t('trans.hosp2Name', 'Silivri Anadolu Hastanesi'),
    address: 'Silivri, İstanbul',
    bus: '139, 139A, 300, 303',
    metro: t('trans.metroNA', 'Yakın metro hattı bulunmamaktadır.'),
    parking: t('trans.parkingFree', 'Ücretsiz'),
  },

  {
    name: t('trans.hosp5Name', 'Karadeniz Ereğli Anadolu Hastanesi'),
    address: 'Karadeniz Ereğli, Zonguldak',
    bus: 'Ereğli Belediye Otobüsleri',
    metro: t('trans.metroNA', 'Yakın metro hattı bulunmamaktadır.'),
    parking: t('trans.parkingFree', 'Ücretsiz'),
  },
];

const parkingInfo = (t: any) => [
  {
    icon: <FaParking />,
    title: t('trans.park1Title', 'Ücretsiz Otopark'),
    desc: t('trans.park1Desc', 'Tüm hastanelerimizde hasta ve refakatçilerimiz için ücretsiz otopark hizmeti sunulmaktadır.'),
  },
  {
    icon: <FaWheelchair />,
    title: t('trans.park2Title', 'Engelli Park Alanları'),
    desc: t('trans.park2Desc', 'Her hastanemizin otoparkında engelli park alanları mevcuttur.'),
  },
  {
    icon: <FaCar />,
    title: t('trans.park3Title', 'Vale Hizmeti'),
    desc: t('trans.park3Desc', 'Bazı hastanelerimizde vale hizmeti bulunmaktadır. Detaylı bilgi için çağrı merkezini arayın.'),
  },
  {
    icon: <FaClock />,
    title: t('trans.park4Title', 'Otopark Saatleri'),
    desc: t('trans.park4Desc', 'Otoparklarımız 7 gün 24 saat hizmet vermektedir.'),
  },
];

const TransportationPage = () => {
  const { t } = useTranslation();

  return (
    <>
      <Helmet>
        <title>{t('trans.pageTitle', 'Ulaşım ve Otopark')} | Anadolu Hastaneleri Grubu</title>
        <meta
          name="description"
          content={t('trans.metaDescription', 'Hastanelerimize ulaşım seçenekleri, toplu taşıma hatları, otopark bilgileri ve engelli erişimi.')}
        />
      </Helmet>

      {/* ─── HERO ─── */}
      <section className="relative min-h-[420px] md:min-h-[500px] flex items-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?ixlib=rb-4.0.3&auto=format&fit=crop&w=2400&q=80')",
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
                {t('trans.heroTag', 'Ulaşım')}
              </span>
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-white leading-tight mb-6">
              {t('trans.heroTitle1', 'Nasıl')}
              <br />
              <span className="text-accent">{t('trans.heroTitle2', 'Giderim?')}</span>
            </h1>
            <p className="text-white/70 text-lg md:text-xl leading-relaxed max-w-xl">
              {t('trans.heroDesc', 'Hastanelerimize ulaşabileceğiniz toplu taşıma hatları, otopark bilgileri ve engelli erişim seçenekleri.')}
            </p>
          </motion.div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 overflow-hidden">
          <svg viewBox="0 0 1440 60" preserveAspectRatio="none" className="w-full h-12 md:h-16 fill-gray-50">
            <polygon points="0,60 1440,0 1440,60" />
          </svg>
        </div>
      </section>

      {/* ─── TRANSPORT OPTIONS ─── */}
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
                {t('trans.optionsTag', 'Ulaşım Seçenekleri')}
              </span>
            </div>
            <h2 className="text-4xl lg:text-5xl font-black text-secondary leading-tight mb-4">
              {t('trans.optionsTitle', 'Hastanelerimize')}{' '}
              <span className="text-primary">{t('trans.optionsHighlight', 'Ulaşım')}</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {transportOptions(t).map((opt, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm text-center hover:shadow-md transition-all duration-300"
              >
                <div className="w-16 h-16 rounded-2xl bg-primary/8 text-primary flex items-center justify-center text-2xl mx-auto mb-5">
                  {opt.icon}
                </div>
                <h3 className="text-lg font-bold text-secondary mb-2">{opt.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{opt.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── HOSPITAL DETAILS ─── */}
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
                {t('trans.detailsTag', 'Hastane Bazında Ulaşım')}
              </span>
            </div>
            <h2 className="text-4xl lg:text-5xl font-black text-secondary leading-tight mb-4">
              {t('trans.detailsTitle', 'Ulaşım')}{' '}
              <span className="text-primary">{t('trans.detailsHighlight', 'Bilgileri')}</span>
            </h2>
          </motion.div>

          <div className="space-y-4">
            {hospitals(t).map((h, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="bg-gray-50 rounded-2xl p-6 lg:p-8 border border-gray-100"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-secondary">{h.name}</h3>
                    <p className="text-gray-400 text-sm flex items-center gap-1 mt-1">
                      <FaMapMarkerAlt className="text-accent" /> {h.address}
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-2 text-sm font-bold text-green-700 bg-green-100 rounded-full px-4 py-1.5 self-start">
                    <FaParking /> {h.parking}
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                      <FaBus />
                    </div>
                    <div>
                      <p className="font-bold text-secondary">{t('trans.busLines', 'Otobüs Hatları')}</p>
                      <p className="text-gray-500">{h.bus}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                      <FaSubway />
                    </div>
                    <div>
                      <p className="font-bold text-secondary">{t('trans.metroLines', 'Metro / Tren')}</p>
                      <p className="text-gray-500">{h.metro}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── PARKING INFO ─── */}
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
                {t('trans.parkingTag', 'Otopark')}
              </span>
            </div>
            <h2 className="text-4xl lg:text-5xl font-black text-secondary leading-tight mb-4">
              {t('trans.parkingTitle', 'Otopark')}{' '}
              <span className="text-primary">{t('trans.parkingHighlight', 'Bilgileri')}</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {parkingInfo(t).map((p, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white rounded-2xl p-7 border border-gray-100 shadow-sm text-center hover:shadow-md transition-all duration-300"
              >
                <div className="w-14 h-14 rounded-xl bg-primary/8 text-primary flex items-center justify-center text-2xl mx-auto mb-5">
                  {p.icon}
                </div>
                <h3 className="text-lg font-bold text-secondary mb-2">{p.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{p.desc}</p>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-10 bg-white rounded-2xl p-6 border border-gray-100 flex items-start gap-4"
          >
            <div className="w-10 h-10 rounded-lg bg-accent/10 text-accent flex items-center justify-center flex-shrink-0">
              <FaInfoCircle />
            </div>
            <div>
              <p className="font-bold text-secondary text-sm mb-1">{t('trans.noteTitle', 'Bilgilendirme')}</p>
              <p className="text-gray-500 text-sm leading-relaxed">
                {t('trans.noteDesc', 'Otoparklarımızda araç sorumluluğu misafirimize aittir. Değerli eşyalarınızı araçta bırakmamanızı öneririz. Engelli park alanları sadece engelli plakalı araçlar için ayrılmıştır.')}
              </p>
            </div>
          </motion.div>
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
              {t('trans.ctaTitle', 'Daha Fazla Bilgi mi İstiyorsunuz?')}
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
          <LastUpdated date="10.05.2024" />
        </div>
      </section>
    </>
  );
};

export default TransportationPage;
