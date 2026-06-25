import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { FaHospital, FaUserMd, FaHeartbeat, FaBaby, FaMicroscope, FaXRay, FaAmbulance, FaChevronRight } from 'react-icons/fa';
import { MdMedicalServices, MdBed } from 'react-icons/md';

const units = (t: any) => [
  { icon: <FaAmbulance />, title: t('aboutHospital.unitEmergency', 'Acil Servis') },
  { icon: <FaUserMd />, title: t('aboutHospital.unitPolyclinic', 'Poliklinik') },
  { icon: <MdMedicalServices />, title: t('aboutHospital.unitOR', 'Ameliyathane') },
  { icon: <FaHeartbeat />, title: t('aboutHospital.unitDelivery', 'Doğumhane') },
  { icon: <MdBed />, title: t('aboutHospital.unitInpatient', 'Yataklı Hasta Servisi') },
  { icon: <FaHospital />, title: t('aboutHospital.unitICU', 'Yoğun Bakım Ünitesi') },
  { icon: <FaBaby />, title: t('aboutHospital.unitNICU', 'Yenidoğan Yoğun Bakım Ünitesi') },
  { icon: <FaMicroscope />, title: t('aboutHospital.unitLab', 'Laboratuvar') },
  { icon: <FaXRay />, title: t('aboutHospital.unitRadiology', 'Radyoloji') },
];

const stats = (t: any) => [
  { value: '1991', label: t('aboutHospital.statFounded', 'Kuruluş Yılı') },
  { value: '30+', label: t('aboutHospital.statExperience', 'Yıllık Deneyim') },
  { value: '3', label: t('aboutHospital.statHospitals', 'Hastane') },
  { value: '24/7', label: t('aboutHospital.statService', 'Kesintisiz Hizmet') },
];

const AboutHospitalPage = () => {
  const { t } = useTranslation();
  return (
    <>
      <Helmet>
        <title>{t('aboutHospital.pageTitle', 'Hakkımızda')} | Anadolu Hastaneleri Grubu</title>
        <meta
          name="description"
          content={t('aboutHospital.metaDescription', 'Anadolu Hastanesi 1991 yılında faaliyete başlamış, bölge halkına kaliteli sağlık hizmeti sunan deneyimli bir sağlık kurumudur.')}
        />
      </Helmet>

      {/* ─── HERO ─── */}
      <section className="relative min-h-[480px] md:min-h-[560px] flex items-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1504439468489-c8920d796a29?ixlib=rb-4.0.3&auto=format&fit=crop&w=2400&q=80')",
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
                Kurumsal
              </span>
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-white leading-tight mb-6">
              {t('aboutHospital.heroTitle1', 'Hakkımızda')}
              <br />
              <span className="text-accent">{t('aboutHospital.heroTitle2', 'Anadolu Hastanesi')}</span>
            </h1>
            <p className="text-white/70 text-lg md:text-xl leading-relaxed max-w-xl">
              {t('aboutHospital.heroDesc', "1991'den bu yana bölge halkına kaliteli, güvenilir ve insan odaklı sağlık hizmetleri sunuyoruz.")}
            </p>
          </motion.div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 overflow-hidden">
          <svg viewBox="0 0 1440 60" preserveAspectRatio="none" className="w-full h-12 md:h-16 fill-gray-50">
            <polygon points="0,60 1440,0 1440,60" />
          </svg>
        </div>
      </section>

      {/* ─── STATS ─── */}
      <section className="bg-gray-50 py-12">
        <div className="container-custom">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats(t).map((s: any, i: number) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center p-6 bg-white rounded-2xl shadow-sm border border-gray-100"
              >
                <p className="text-4xl font-black text-primary mb-1">{s.value}</p>
                <p className="text-sm text-gray-500 font-medium">{s.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── ABOUT TEXT ─── */}
      <section className="bg-white py-20 lg:py-28">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
            >
              <div className="flex items-center gap-3 mb-5">
                <span className="block h-px w-[60px] bg-accent" />
                <span className="text-xs uppercase tracking-[0.25em] text-accent font-bold">{t('aboutHospital.historyTag', 'Tarihçemiz')}</span>
              </div>
              <h2 className="text-4xl lg:text-5xl font-black text-secondary leading-tight mb-8">
                {t('aboutHospital.historyTitle', "1991'den Bu Yana")}{' '}
                <span className="text-primary">{t('aboutHospital.historyHighlight', 'Güvenilir Sağlık')}</span>
              </h2>

              <div className="space-y-5 text-gray-600 text-lg leading-relaxed">
                <p>
                  {t('aboutHospital.p1a', 'Anadolu Hastanesi')} <strong className="text-secondary">{t('aboutHospital.p1Strong', '1991 yılı mart ayında')}</strong> {t('aboutHospital.p1b', 'faaliyete başlamıştır. Bölgenin sağlık ihtiyaçlarını karşılamayı ve bölge halkına kaliteli sağlık hizmeti sunmayı ilke edinen Anadolu Hastanesi deneyimli sağlık kadrosuyla bölgesinde tercih edilen bir marka olmayı hedeflemektedir.')}
                </p>
                <p>
                  {t('aboutHospital.p2a', 'Hasta ve hasta yakınları, hastanemize adım attığı ilk andan hastanemizden ayrılana kadar geçen sürede')} <strong className="text-secondary">{t('aboutHospital.p2Strong', 'güler yüzlü hizmet')}</strong> {t('aboutHospital.p2b', 'alarak ailelerinin sıcaklığını hissedecektir.')}
                </p>
              </div>

              <div className="mt-10">
                <a
                  href="/iletisim"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-white font-bold rounded-xl hover:brightness-110 transition-all"
                >
                  {t('common.contactUs', 'Bize Ulaşın')}
                  <FaChevronRight className="text-sm" />
                </a>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="relative"
            >
              <div
                className="rounded-2xl overflow-hidden shadow-2xl h-[420px] bg-cover bg-center"
                style={{
                  backgroundImage:
                    "url('/uploads/silivri-hastane-ici.jpg')",
                }}
              />
              <div className="absolute -bottom-6 -left-6 bg-accent text-white p-6 rounded-2xl shadow-xl">
                <p className="text-4xl font-black">30+</p>
                <p className="text-sm font-medium opacity-90">Yıllık Deneyim</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── SERVICES / UNITS ─── */}
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
              <span className="text-xs uppercase tracking-[0.25em] text-accent font-bold">Birimlerimiz</span>
            </div>
            <h2 className="text-4xl lg:text-5xl font-black text-secondary leading-tight mb-4">
              Kapsamlı <span className="text-primary">Sağlık Hizmetleri</span>
            </h2>
            <p className="text-gray-500 text-lg leading-relaxed">
              Acil Servis'ten Yoğun Bakım'a, Laboratuvar'dan Radyoloji'ye kadar tüm birimlerimizle hasta ve hasta yakınlarına bilgilendirici hizmet vermek için yola çıktık. Hastalıkların önlenmesi ve erken tanısı için eğitim çalışmalarıyla önemli bir görevi de üstlendik.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {units(t).map((unit: any, i: number) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07 }}
                className="bg-white rounded-2xl p-6 flex items-center gap-5 shadow-sm border border-gray-100 hover:border-primary/30 hover:shadow-md transition-all duration-300 group"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/8 text-primary flex items-center justify-center text-xl flex-shrink-0 group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                  {unit.icon}
                </div>
                <p className="font-semibold text-secondary">{unit.title}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── BOTTOM CTA ─── */}
      <section className="bg-primary py-14">
        <div className="container-custom flex flex-col md:flex-row items-center justify-between gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <p className="text-accent text-xs uppercase tracking-[0.2em] font-bold mb-2">
              Anadolu Hastaneleri Grubu
            </p>
            <h3 className="text-2xl md:text-3xl font-black text-white">
              "Herşey Sağlığınız İçin..."
            </h3>
          </motion.div>
          <motion.a
            href="/iletisim"
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex-shrink-0 inline-flex items-center gap-2 px-8 py-4 bg-accent text-white font-bold rounded-xl hover:brightness-110 transition-all"
          >
            {t('common.onlineAppointment', 'Online Randevu')}
            <FaChevronRight className="text-sm" />
          </motion.a>
        </div>
      </section>
    </>
  );
};

export default AboutHospitalPage;
