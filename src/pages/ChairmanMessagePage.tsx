import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { FaQuoteLeft, FaChevronRight, FaHospital } from 'react-icons/fa';
import LastUpdated from '../components/ui/LastUpdated';
import chairmanImg from '../assests/Hayati_Arkaz-1.png';

const milestones = (t: any) => [
  { year: '1988', event: t('chairman.milestone1988', "Anadolu Hastaneleri Grubu'nun temeli atıldı.") },
  { year: '1991', event: t('chairman.milestone1991', 'Avcılar Anadolu Hastanesi kuruldu.') },
  { year: '1998', event: t('chairman.milestone1998', 'Silivri Millet Hastanesi açıldı.') },
  { year: '2003', event: t('chairman.milestone2003', 'Çorlu Millet Hastanesi hizmete girdi.') },
  { year: '2005', event: t('chairman.milestone2005', 'Çanakkale Anadolu Hastanesi kuruldu.') },
  { year: '2007', event: t('chairman.milestone2007', 'Karadeniz Ereğli Anadolu Hastanesi açıldı.') },
  { year: '2009', event: t('chairman.milestone2009', 'Silivri Anadolu Hastanesi hizmete başladı.') },
];

const ChairmanMessagePage = () => {
  const { t } = useTranslation();
  return (
    <>
      <Helmet>
        <title>{t('chairman.pageTitle', "Başkanın Mesajı")} | Anadolu Hastaneleri Grubu</title>
        <meta
          name="description"
          content={t('chairman.metaDescription', "Anadolu Hastaneleri Grubu Yönetim Kurulu Başkanı Dr. Hayati Arkaz'ın mesajı ve kuruluş hikayesi.")}
        />
      </Helmet>

      {/* ─── HERO ─── */}
      <section className="relative min-h-[480px] md:min-h-[540px] flex items-center overflow-hidden">
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
              {t('chairman.heroTitle1', 'Başkanın')}
              <br />
              <span className="text-accent">{t('chairman.heroTitle2', 'Mesajı')}</span>
            </h1>
            <p className="text-white/70 text-lg md:text-xl leading-relaxed max-w-xl">
              {t('chairman.heroSubtitle', 'Dr. Hayati ARKAZ — Yönetim Kurulu Başkanı')}
            </p>
          </motion.div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 overflow-hidden">
          <svg viewBox="0 0 1440 60" preserveAspectRatio="none" className="w-full h-12 md:h-16 fill-white">
            <polygon points="0,60 1440,0 1440,60" />
          </svg>
        </div>
      </section>

      {/* ─── MAIN CONTENT ─── */}
      <section className="bg-white py-20 lg:py-28">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 lg:gap-16 items-start">

            {/* Sidebar — Photo card */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="lg:col-span-2"
            >
              <div className="sticky top-8">
                {/* Photo */}
                <div className="relative rounded-2xl overflow-hidden shadow-2xl border-4 border-white ring-1 ring-gray-100 mb-6">
                  <img
                    src={chairmanImg}
                    alt="Dr. Hayati ARKAZ"
                    className="w-full object-cover object-top"
                    style={{ maxHeight: '480px', objectFit: 'cover' }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a1628]/70 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <p className="text-white font-black text-xl">{t('chairman.name', 'Dr. Hayati ARKAZ')}</p>
                    <p className="text-accent text-sm font-medium">{t('chairman.title', 'Yönetim Kurulu Başkanı')}</p>
                  </div>
                </div>

                {/* Bio Card */}
                <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                      <FaHospital />
                    </div>
                    <p className="font-bold text-secondary">{t('chairman.bio', 'Özgeçmiş')}</p>
                  </div>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex gap-2">
                      <span className="text-accent font-bold flex-shrink-0">✓</span>
                      {t('chairman.bio1', 'Sivas / Yıldızeli doğumlu (25.03.1957)')}
                    </li>
                    <li className="flex gap-2">
                      <span className="text-accent font-bold flex-shrink-0">✓</span>
                      {t('chairman.bio2', 'İstanbul Tıp Fakültesi mezunu')}
                    </li>
                    <li className="flex gap-2">
                      <span className="text-accent font-bold flex-shrink-0">✓</span>
                      {t('chairman.bio3', 'Anadolu Sağlık Grubu kurucusu')}
                    </li>
                    <li className="flex gap-2">
                      <span className="text-accent font-bold flex-shrink-0">✓</span>
                      {t('chairman.bio4', "1991'den bu yana aktif yönetim")}
                    </li>
                  </ul>
                </div>
              </div>
            </motion.div>

            {/* Message content */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="lg:col-span-3"
            >
              <div className="flex items-center gap-3 mb-5">
                <span className="block h-px w-[60px] bg-accent" />
                <span className="text-xs uppercase tracking-[0.25em] text-accent font-bold">{t('chairman.fromChairman', 'Başkandan')}</span>
              </div>
              <h2 className="text-3xl lg:text-4xl font-black text-secondary leading-tight mb-8">
                {t('chairman.messageTitle', 'Sağlık Hizmetinde')} <span className="text-primary">{t('chairman.messageHighlight', '35 Yıllık Yolculuk')}</span>
              </h2>

              {/* Quote */}
              <div className="relative bg-primary/[0.04] border-l-4 border-primary rounded-r-2xl p-6 mb-8">
                <FaQuoteLeft className="text-primary/20 text-4xl absolute top-4 right-6" />
                <p className="text-gray-600 italic text-lg leading-relaxed relative z-10">
                  "{t('chairman.quote', 'Sağlıklı yaşamak, sağlık hizmetlerinden eşit derecede faydalanmak herkesin en temel hakkıdır.')}"
                </p>
              </div>

              <div className="space-y-5 text-gray-600 text-base leading-relaxed">
                <p>
                  {t('chairman.p1a', 'Türkiye sağlık sektöründe,')} <strong className="text-secondary">{t('chairman.p1Strong', '1988 yılında')}</strong> {t('chairman.p1b', 'felsefemizle yola çıktık. "Sağlıklı yaşamak, sağlık hizmetlerinden eşit derecede faydalanmak herkesin en temel hakkıdır" ilkesiyle bu yolda emin adımlarla ilerliyoruz.')}
                </p>
                <p>
                  {t('chairman.p2a', 'Anadolu Hastaneleri Grubu olarak yönetim düşüncemizin temelini;')} <strong className="text-secondary">{t('chairman.p2Strong', "Tıbbi etik ilkelerden ödün vermeden, hasta haklarına saygı duyarak, ileri teknolojik cihazlarla donatılmış tesisler ile uluslararası kalite standartlarındaki hastanecilik anlayışımızı Türkiye'nin her iline ulaştırmak")}</strong> {t('chairman.p2b', 'oluşturuyor.')}
                </p>
                <p>
                  {t('chairman.p3a', 'Anadolu Hastaneler Grubu bünyesindeki tüm hastanelerimiz; uzman doktor kadroları, deneyimli sağlık personelleri ve ileri teknolojik tıbbi cihazlarla donatılan')} <strong className="text-secondary">{t('chairman.p3Strong', 'tam teşekküllü sağlık merkezleri')}</strong> {t('chairman.p3b', 'olarak hizmet vermektedir.')}
                </p>

                <div className="my-8 h-px bg-gray-100" />

                <p>
                  {t('chairman.p4a', 'Dr. Hayati ARKAZ Sivas / Yıldızeli 25.03.1957 doğumludur.')} <strong className="text-secondary">{t('chairman.p4Strong', "Anadolu Sağlık Grubu'nun kurucusudur.")}</strong> {t('chairman.p4b', "İstanbul Tıp Fakültesi'nden mezun olduktan sonra bir süre Devlet Hastanelerinde doktorluk yapıp daha sonra Temmuz 1991 yılında Avcılar Anadolu Hastanesi'ni kurmuştur.")}
                </p>
                <p>
                  {t('chairman.p5a', 'Halen Anadolu Hastaneleri\'nde')} <strong className="text-secondary">{t('chairman.p5Strong', 'Yönetim Kurulu Başkanlığı')}</strong> {t('chairman.p5b', 'görevini yürütmektedir.')}
                </p>
              </div>

              {/* CTA */}
              <div className="mt-10">
                <a
                  href="/iletisim"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-white font-bold rounded-xl hover:brightness-110 transition-all"
                >
                  {t('common.contactUs', 'Bizimle İletişime Geçin')}
                  <FaChevronRight className="text-sm" />
                </a>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── MILESTONES ─── */}
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
              <span className="text-xs uppercase tracking-[0.25em] text-accent font-bold">Kronoloji</span>
            </div>
            <h2 className="text-4xl lg:text-5xl font-black text-secondary leading-tight mb-4">
              Büyüme <span className="text-primary">Hikayemiz</span>
            </h2>
          </motion.div>

          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200 hidden md:block" />

            <div className="space-y-6">
              {milestones(t).map((m, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-start gap-6 md:pl-16 relative"
                >
                  {/* Dot */}
                  <div className="absolute left-0 top-0 w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold flex-shrink-0 hidden md:flex">
                    {i + 1}
                  </div>
                  <div className="flex-1 bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                    <span className="text-2xl font-black text-accent">{m.year}</span>
                    <p className="text-gray-600 mt-1">{m.event}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── BOTTOM CTA ─── */}
      <section className="bg-primary py-14">
        <div className="container-custom flex flex-col md:flex-row items-center justify-between gap-6">
          <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <p className="text-accent text-xs uppercase tracking-[0.2em] font-bold mb-2">{t('common.brand', 'Anadolu Hastaneleri Grubu')}</p>
            <h3 className="text-2xl md:text-3xl font-black text-white">{t('common.ctaTitle', '"Herşey Sağlığınız İçin..."')}</h3>
          </motion.div>
          <motion.a
            href="https://anadoluhastaneleri.kendineiyibak.app/"
            target="_blank"
            rel="noopener noreferrer"
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

      <section className="bg-white py-6 border-t border-gray-100">
        <div className="container-custom">
          <LastUpdated date="10.05.2024" />
        </div>
      </section>
    </>
  );
};

export default ChairmanMessagePage;
