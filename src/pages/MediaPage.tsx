import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import {
  FaNewspaper,
  FaChevronRight,
  FaExternalLinkAlt,
  FaCalendarAlt,
  FaTag,
} from 'react-icons/fa';
import LastUpdated from '../components/ui/LastUpdated';

const mediaItems = (t: any) => [
  {
    source: t('media.source1', 'Hürriyet Sağlık'),
    date: '12 Mart 2026',
    category: t('media.catHealth', 'Sağlık'),
    title: t('media.item1Title', 'Anadolu Hastaneleri, JCI Akreditasyonunu Yeniledi'),
    excerpt: t('media.item1Desc', 'Anadolu Hastaneleri Grubu, uluslararası sağlık kalite standartları olan JCI akreditasyonunu başarıyla yenileyerek hizmet kalitesini bir kez daha tescilledi.'),
    link: '#',
  },
  {
    source: t('media.source2', 'Milliyet'),
    date: '28 Şubat 2026',
    category: t('media.catCorporate', 'Kurumsal'),
    title: t('media.item2Title', 'Anadolu Hastaneleri Bölgede Hasta Memnuniyetinde Birinci'),
    excerpt: t('media.item2Desc', 'Sağlık Bakanlığı tarafından gerçekleştirilen hasta memnuniyeti anketlerinde Anadolu Hastaneleri Grubu, bölgesinde en yüksek puanı alan sağlık kuruluşu oldu.'),
    link: '#',
  },
  {
    source: t('media.source3', 'CNN Türk'),
    date: '15 Ocak 2026',
    category: t('media.catTech', 'Teknoloji'),
    title: t('media.item3Title', 'Robotik Cerrahi ile Ameliyatlar Daha Güvenli'),
    excerpt: t('media.item3Desc', 'Anadolu Hastaneleri Grubu bünyesinde kullanılan robotik cerrahi sistemleri, minimal invaziv ameliyatlarda yüksek hassasiyet sağlıyor.'),
    link: '#',
  },
  {
    source: t('media.source4', 'Sabah'),
    date: '3 Aralık 2025',
    category: t('media.catSocial', 'Sosyal Sorumluluk'),
    title: t('media.item4Title', 'Ücretsiz Sağlık Taraması Binlerce Kişiye Ulaştı'),
    excerpt: t('media.item4Desc', 'Anadolu Hastaneleri Grubu\'nun dezavantajlı bölgelerde düzenlediği ücretsiz sağlık taramaları 5.000\'den fazla vatandaşımıza hizmet verdi.'),
    link: '#',
  },
  {
    source: t('media.source5', 'Posta'),
    date: '20 Kasım 2025',
    category: t('media.catHealth', 'Sağlık'),
    title: t('media.item5Title', 'Sağlık Turizminde Türkiye\'nin Yıldızı'),
    excerpt: t('media.item5Desc', 'Anadolu Hastaneleri Grubu, sağlık turizmi kapsamında 50\'den fazla ülkeden hasta ağırlayarak Türkiye\'nin sağlık markası olmayı sürdürüyor.'),
    link: '#',
  },
  {
    source: t('media.source6', 'Anadolu Ajansı'),
    date: '5 Ekim 2025',
    category: t('media.catCorporate', 'Kurumsal'),
    title: t('media.item6Title', 'Yeni Hastane Yatırımı ile Kapasite Artırılacak'),
    excerpt: t('media.item6Desc', 'Anadolu Hastaneleri Grubu, 2027 yılında hizmete girmesi planlanan yeni hastane yatırımı ile yatak kapasitesini %30 artıracak.'),
    link: '#',
  },
];

const categoryColors: Record<string, string> = {
  'Sağlık': 'bg-green-100 text-green-700',
  'Kurumsal': 'bg-blue-100 text-blue-700',
  'Teknoloji': 'bg-orange-100 text-orange-700',
  'Sosyal Sorumluluk': 'bg-purple-100 text-purple-700',
};

const MediaPage = () => {
  const { t } = useTranslation();

  return (
    <>
      <Helmet>
        <title>{t('media.pageTitle', 'Basında Biz')} | Anadolu Hastaneleri Grubu</title>
        <meta
          name="description"
          content={t('media.metaDescription', 'Anadolu Hastaneleri Grubu hakkında basında çıkan haberler, röportajlar ve medya çıkışları.')}
        />
      </Helmet>

      {/* ─── HERO ─── */}
      <section className="relative min-h-[420px] md:min-h-[500px] flex items-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1504711434969-e33886168f5c?ixlib=rb-4.0.3&auto=format&fit=crop&w=2400&q=80')",
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
                {t('media.heroTag', 'Medya ve Basın')}
              </span>
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-white leading-tight mb-6">
              {t('media.heroTitle1', 'Basında')}
              <br />
              <span className="text-accent">{t('media.heroTitle2', 'Biz')}</span>
            </h1>
            <p className="text-white/70 text-lg md:text-xl leading-relaxed max-w-xl">
              {t('media.heroDesc', 'Anadolu Hastaneleri Grubu hakkında basında yer alan haberler, röportajlar ve medya içerikleri.')}
            </p>
          </motion.div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 overflow-hidden">
          <svg viewBox="0 0 1440 60" preserveAspectRatio="none" className="w-full h-12 md:h-16 fill-gray-50">
            <polygon points="0,60 1440,0 1440,60" />
          </svg>
        </div>
      </section>

      {/* ─── MEDIA GRID ─── */}
      <section className="bg-gray-50 py-20 lg:py-28">
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mediaItems(t).map((item, i) => (
              <motion.article
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group"
              >
                <div className="h-48 bg-gradient-to-br from-primary/80 to-primary/40 flex items-center justify-center">
                  <FaNewspaper className="text-white/20 text-6xl" />
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <span className={`text-xs font-bold px-3 py-1 rounded-full ${categoryColors[item.category] || 'bg-gray-100 text-gray-600'}`}>
                      <FaTag className="inline mr-1" />{item.category}
                    </span>
                    <span className="text-gray-400 text-xs flex items-center gap-1">
                      <FaCalendarAlt /> {item.date}
                    </span>
                  </div>
                  <p className="text-xs font-bold text-primary uppercase tracking-wider mb-2">{item.source}</p>
                  <h3 className="text-lg font-bold text-secondary mb-2 leading-snug group-hover:text-primary transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-gray-500 text-sm leading-relaxed mb-4 line-clamp-3">{item.excerpt}</p>
                  <a
                    href={item.link}
                    className="inline-flex items-center gap-2 text-primary font-bold text-sm hover:gap-3 transition-all"
                  >
                    {t('common.readMore', 'Devamını Oku')} <FaChevronRight />
                  </a>
                </div>
              </motion.article>
            ))}
          </div>

          {/* Press Contact */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-16 bg-white rounded-2xl p-8 lg:p-10 border border-gray-100 shadow-sm"
          >
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div>
                <h3 className="text-xl font-bold text-secondary mb-2">
                  {t('media.pressTitle', 'Basın İletişim')}
                </h3>
                <p className="text-gray-500 text-sm">
                  {t('media.pressDesc', 'Basın ve medya kuruluşları için iletişim bilgilerimiz. Röportaj talepleri ve basın bültenleri için bizimle iletişime geçebilirsiniz.')}
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <a
                  href="mailto:basin@anadoluhastaneleri.com"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white font-bold rounded-xl hover:brightness-110 transition-all text-sm"
                >
                  {t('media.emailButton', 'E-Posta Gönder')}
                </a>
                <a
                  href="/iletisim"
                  className="inline-flex items-center gap-2 px-6 py-3 border-2 border-primary text-primary font-bold rounded-xl hover:bg-primary hover:text-white transition-all text-sm"
                >
                  {t('common.contactUs', 'İletişime Geçin')}
                  <FaExternalLinkAlt className="text-xs" />
                </a>
              </div>
            </div>
          </motion.div>
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

export default MediaPage;
