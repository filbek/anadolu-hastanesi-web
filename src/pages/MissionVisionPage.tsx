import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { FaUserMd, FaHeart, FaStar, FaGlobe, FaChevronRight, FaHandshake, FaUsers, FaBalanceScale, FaFilePdf } from 'react-icons/fa';
import LastUpdated from '../components/ui/LastUpdated';

const values = (t: any) => [
  {
    number: '01',
    icon: <FaHandshake />,
    title: t('mission.values1Title', 'İnsana Değer ve Güvenilirlik'),
    desc: t('mission.values1Desc', 'İnsana değer veririz, güvenilir olmak vazgeçilmezimizdir.'),
  },
  {
    number: '02',
    icon: <FaStar />,
    title: t('mission.values2Title', 'Hizmette Fark Yaratmak'),
    desc: t('mission.values2Desc', 'Sunduğumuz her türlü hizmetle fark yaratırız.'),
  },
  {
    number: '03',
    icon: <FaUserMd />,
    title: t('mission.values3Title', 'Bilimsellik ve Sürekli Gelişim'),
    desc: t('mission.values3Desc', 'Bilimsel yaklaşımlara ve sürekli gelişime inanırız.'),
  },
  {
    number: '04',
    icon: <FaUsers />,
    title: t('mission.values4Title', 'Çevik ve Başarılı Takım'),
    desc: t('mission.values4Desc', 'Çevik, hedef odaklı ve başarı azmi yüksek bir takımız.'),
  },
  {
    number: '05',
    icon: <FaBalanceScale />,
    title: t('mission.values5Title', 'Etik ve İş Ahlakı'),
    desc: t('mission.values5Desc', 'Etik ilkelerimiz ve iş ahlakımızla örnek gösteriliriz.'),
  },
];

const MissionVisionPage = () => {
  const { t } = useTranslation();
  return (
    <>
      <Helmet>
        <title>{t('mission.pageTitle', 'Misyon - Vizyon - Değerlerimiz')} | Anadolu Hastaneleri Grubu</title>
        <meta
          name="description"
          content={t('mission.metaDescription', 'Anadolu Hastaneleri Grubu kurumsal misyon, vizyon ve temel değerleri.')}
        />
      </Helmet>

      {/* ─── HERO ─── */}
      <section className="relative min-h-[480px] md:min-h-[560px] flex items-center overflow-hidden">
        {/* Background */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1551076805-e18690c5e530?ixlib=rb-4.0.3&auto=format&fit=crop&w=2400&q=80')",
          }}
        />
        {/* Darkening gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#0a1628]/95 via-[#0a1628]/80 to-[#0a1628]/50" />

        {/* Decorative vertical accent line */}
        <div className="absolute left-0 top-0 h-full w-1 bg-accent" />

        <div className="container-custom relative z-10 py-24">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-3xl"
          >
            {/* Breadcrumb-style tag */}
            <div className="flex items-center gap-2 mb-6">
              <span className="block h-px w-10 bg-accent" />
              <span className="text-accent text-xs uppercase tracking-[0.25em] font-semibold">
                Kurumsal Kimlik
              </span>
            </div>

            <h1 className="text-4xl md:text-6xl font-black text-white leading-tight mb-6">
              Misyon, Vizyon
              <br />
              <span className="text-accent">&amp; Değerlerimiz</span>
            </h1>

            <p className="text-white/70 text-lg md:text-xl leading-relaxed max-w-xl">
              Anadolu Hastaneleri Grubu olarak sağlık hizmetinde öncü, güvenilir ve insan
              odaklı bir yaklaşımla topluma değer katmak için çalışıyoruz.
            </p>
          </motion.div>
        </div>

        {/* Bottom diagonal cut */}
        <div className="absolute bottom-0 left-0 right-0 overflow-hidden">
          <svg viewBox="0 0 1440 60" preserveAspectRatio="none" className="w-full h-12 md:h-16 fill-gray-50">
            <polygon points="0,60 1440,0 1440,60" />
          </svg>
        </div>
      </section>

      {/* ─── MİSYON / VİZYON ─── */}
      <section className="bg-gray-50 py-20 lg:py-28">
        <div className="container-custom">
          {/* Section label */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex items-center gap-3 mb-16"
          >
            <span className="block h-px flex-1 bg-gray-200 max-w-[60px]" />
            <span className="text-xs uppercase tracking-[0.25em] text-primary font-bold">
              {t('mission.framework', 'Kurumsal Çerçevemiz')}
            </span>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 rounded-2xl overflow-hidden shadow-2xl">
            {/* VİZYON */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="relative bg-primary p-12 xl:p-16 flex flex-col justify-between overflow-hidden"
            >
              {/* Large faint number */}
              <span className="absolute -top-4 -right-4 text-[160px] font-black text-white/5 leading-none select-none">
                V
              </span>

              <div className="relative z-10">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-white/15 text-white text-2xl mb-8">
                  <FaGlobe />
                </div>
                <p className="text-xs uppercase tracking-[0.2em] text-accent font-bold mb-3">
                  {t('mission.visionTag', 'Vizyonumuz')}
                </p>
                <h2 className="text-3xl xl:text-4xl font-black text-white leading-snug mb-8">
                  {t('mission.visionTitle', 'Dünyada Referans Gösterilen Organizasyon')}
                </h2>
                <p className="text-white/80 text-lg leading-relaxed">
                  {t('mission.visionDesc', 'Çalışanlarımız ile birlikte sürekli gelişerek, evrensel standartlardaki sağlık hizmeti anlayışımız ve yarattığımız bilimsel katkılarımız ile dünyada referans gösterilen bir organizasyon olmayı hedefleriz.')}
                </p>
              </div>

              {/* Accent bottom line */}
              <div className="relative z-10 mt-12 pt-8 border-t border-white/10">
                <div className="flex items-center gap-2 text-white/50 text-sm">
                  <FaChevronRight className="text-accent text-xs" />
                  <span>{t('common.brand', 'Anadolu Hastaneleri Grubu')}</span>
                </div>
              </div>
            </motion.div>

            {/* MİSYON */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.15 }}
              className="relative bg-white p-12 xl:p-16 flex flex-col justify-between overflow-hidden border-t-4 border-t-accent"
            >
              {/* Large faint letter */}
              <span className="absolute -top-4 -right-4 text-[160px] font-black text-gray-100 leading-none select-none">
                M
              </span>

              <div className="relative z-10">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-accent/10 text-accent text-2xl mb-8">
                  <FaHeart />
                </div>
                <p className="text-xs uppercase tracking-[0.2em] text-primary font-bold mb-3">
                  {t('mission.missionTag', 'Misyonumuz')}
                </p>
                <h2 className="text-3xl xl:text-4xl font-black text-secondary leading-snug mb-8">
                  {t('mission.missionTitle', 'Sağlıklı Bir Hayat İçin')}
                </h2>
                <p className="text-gray-600 text-lg leading-relaxed">
                  {t('mission.missionDesc', 'Tüm insanların sağlıklı bir hayat sürmesi için çalışırız.')}
                </p>
              </div>

              {/* Bottom line */}
              <div className="relative z-10 mt-12 pt-8 border-t border-gray-100">
                <div className="flex items-center gap-2 text-gray-400 text-sm">
                  <FaChevronRight className="text-accent text-xs" />
                  <span>Anadolu Hastaneleri Grubu</span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* PDF Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-12 flex justify-center"
          >
            <a
              href="/uploads/vizyon-misyon-degerler.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 px-6 py-3.5 bg-white border border-slate-200 hover:border-primary text-secondary hover:text-primary font-bold rounded-xl shadow-sm hover:shadow-md transition-all duration-300 group"
            >
              <FaFilePdf className="text-red-500 text-xl group-hover:scale-110 transition-transform" />
              <span>{t('mission.viewPdf', 'Vizyon, Misyon ve Değerler Belgesi (PDF)')}</span>
            </a>
          </motion.div>
        </div>
      </section>

      {/* ─── TEMEL DEĞERLER ─── */}
      <section className="bg-white py-20 lg:py-28">
        <div className="container-custom">
          {/* Heading */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-2xl mb-16"
          >
            <div className="flex items-center gap-3 mb-5">
              <span className="block h-px flex-1 bg-gray-200 max-w-[60px]" />
              <span className="text-xs uppercase tracking-[0.25em] text-primary font-bold">
                {t('mission.valuesTag', 'Temel Değerlerimiz')}
              </span>
            </div>
            <h2 className="text-4xl lg:text-5xl font-black text-secondary leading-tight mb-4">
              {t('mission.valuesTitle', 'Hizmetimizi Şekillendiren')}{' '}
              <span className="text-primary">{t('mission.valuesHighlight', 'İlkeler')}</span>
            </h2>
            <p className="text-gray-500 text-lg">
              {t('mission.valuesDesc', 'Kurumsal süreçlerimizin her aşamasında rehber edindiğimiz temel değerlerimiz.')}
            </p>
          </motion.div>

          {/* Values — two-column list layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-px bg-gray-100 rounded-2xl overflow-hidden shadow-sm border border-gray-100">
            {values(t).map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.07 }}
                className="bg-white p-8 xl:p-10 flex items-start gap-6 group hover:bg-primary/[0.03] transition-colors duration-300"
              >
                {/* Number + Icon col */}
                <div className="flex-shrink-0 flex flex-col items-center gap-3 pt-1">
                  <span className="text-[11px] font-bold tracking-[0.15em] text-gray-400 tabular-nums">
                    {item.number}
                  </span>
                  <div className="w-12 h-12 rounded-lg bg-primary/8 text-primary flex items-center justify-center text-xl group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                    {item.icon}
                  </div>
                </div>

                {/* Text col */}
                <div>
                  <h3 className="text-lg font-bold text-secondary mb-2 leading-snug">
                    {item.title}
                  </h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── BOTTOM CTA STRIP ─── */}
      <section className="bg-primary py-14">
        <div className="container-custom flex flex-col md:flex-row items-center justify-between gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <p className="text-accent text-xs uppercase tracking-[0.2em] font-bold mb-2">
              {t('common.brand', 'Anadolu Hastaneleri Grubu')}
            </p>
            <h3 className="text-2xl md:text-3xl font-black text-white">
              {t('common.ctaTitle', '"Herşey Sağlığınız İçin..."')}
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

      <section className="bg-white py-6 border-t border-gray-100">
        <div className="container-custom">
          <LastUpdated date="22.06.2026" />
        </div>
      </section>
    </>
  );
};

export default MissionVisionPage;
