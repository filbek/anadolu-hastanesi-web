import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { FaCalendarAlt, FaChevronRight, FaTag } from 'react-icons/fa';
import LastUpdated from '../components/ui/LastUpdated';
import { useNewsItems } from '../hooks/useNewsItems';

const categoryColors: Record<string, string> = {
  Kurumsal: 'bg-blue-100 text-blue-700',
  Sağlık: 'bg-green-100 text-green-700',
  Etkinlik: 'bg-purple-100 text-purple-700',
  Teknoloji: 'bg-orange-100 text-orange-700',
  Eğitim: 'bg-teal-100 text-teal-700',
};

const turkishMonths = [
  'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
  'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık',
];

function formatTurkishDate(dateStr: string | undefined): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  const day = date.getDate();
  const month = turkishMonths[date.getMonth()];
  const year = date.getFullYear();
  return `${day} ${month} ${year}`;
}

interface NewsItemData {
  id: number;
  category: string;
  date: string;
  title: string;
  excerpt: string;
  image: string;
  slug: string;
}

const fallbackNews: NewsItemData[] = [
  {
    id: 1,
    category: 'Kurumsal',
    date: '15 Nisan 2026',
    title: 'Anadolu Hastaneleri Grubu Kalite Belgesini Yeniledi',
    excerpt:
      'Anadolu Hastaneleri Grubu, Sağlıkta Kalite Standartları (SKS) denetiminde tam puan alarak Sağlık Bakanlığı kalite belgesini yeniledi. Tüm ünitelerimizde üst düzey hizmet kalitesi tescillendi.',
    image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    slug: '#',
  },
  {
    id: 2,
    category: 'Sağlık',
    date: '8 Nisan 2026',
    title: 'Yeni Yoğun Bakım Ünitemiz Hizmete Girdi',
    excerpt:
      'Modern tıbbi cihazlarla donatılmış genişletilmiş yoğun bakım ünitemiz, uzman kadrosu ve ileri teknolojisiyle hastalarımıza daha kapsamlı bir bakım sunmaya başladı.',
    image: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    slug: '#',
  },
  {
    id: 3,
    category: 'Etkinlik',
    date: '1 Nisan 2026',
    title: 'Dünya Sağlık Günü\'nde Ücretsiz Sağlık Taraması',
    excerpt:
      'Dünya Sağlık Günü kapsamında gerçekleştirilen ücretsiz sağlık taramalarımızda 500\'ü aşkın vatandaşımıza kan şekeri, tansiyon ve genel sağlık muayenesi yapıldı.',
    image: 'https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    slug: '#',
  },
  {
    id: 4,
    category: 'Teknoloji',
    date: '22 Mart 2026',
    title: 'Dijital Hasta Takip Sistemimiz Güncellendi',
    excerpt:
      'Yeni nesil dijital hasta takip sistemimiz sayesinde hasta kayıtları, laboratuvar sonuçları ve randevu takibi artık daha hızlı ve güvenli şekilde yönetilmektedir.',
    image: 'https://images.unsplash.com/photo-1551076805-e18690c5e530?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    slug: '#',
  },
  {
    id: 5,
    category: 'Eğitim',
    date: '10 Mart 2026',
    title: 'Sağlık Personeli Eğitim Programları Genişledi',
    excerpt:
      'Çalışanlarımızın mesleki gelişimine yönelik eğitim programlarımız kapsamında bu yıl 200\'den fazla sağlık personeli ileri hasta bakım, acil müdahale ve kalite yönetimi alanlarında sertifika aldı.',
    image: 'https://images.unsplash.com/photo-1584982751601-97dcc096659c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    slug: '#',
  },
  {
    id: 6,
    category: 'Kurumsal',
    date: '28 Şubat 2026',
    title: 'Hasta Memnuniyetinde Bölge Birincisiyiz',
    excerpt:
      'Sağlık Bakanlığı tarafından gerçekleştirilen hasta memnuniyeti anket sonuçlarına göre Anadolu Hastaneleri Grubu, bölgesinde en yüksek memnuniyet puanını alan sağlık kuruluşu oldu.',
    image: 'https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    slug: '#',
  },
];

function mapDbNews(dbItems: any[]): NewsItemData[] {
  if (!dbItems || dbItems.length === 0) return [];
  return dbItems.map((item) => ({
    id: item.id,
    category: item.category || 'Genel',
    date: formatTurkishDate(item.published_at || item.created_at),
    title: item.title || '',
    excerpt: item.excerpt || '',
    image: item.image || '',
    slug: item.slug || '#',
  }));
}

const NewsPage = () => {
  const { t } = useTranslation();
  const { data: dbItems, isLoading } = useNewsItems();
  const newsItems = mapDbNews(dbItems || []).length > 0
    ? mapDbNews(dbItems || [])
    : fallbackNews;

  const featured = newsItems[0];
  const rest = newsItems.slice(1);

  return (
    <>
      <Helmet>
        <title>{t('news.pageTitle', 'Bizden Haberler')} | Anadolu Hastaneleri Grubu</title>
        <meta
          name="description"
          content={t('news.metaDescription', "Anadolu Hastaneleri Grubu'ndan güncel haberler, duyurular ve etkinlikler.")}
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
              <span className="text-accent text-xs uppercase tracking-[0.25em] font-semibold">Basın & İletişim</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-white leading-tight mb-6">
              {t('news.titleLine1', 'Bizden')}
              <br />
              <span className="text-accent">{t('news.titleLine2', 'Haberler')}</span>
            </h1>
            <p className="text-white/70 text-lg md:text-xl leading-relaxed max-w-xl">
              {t('news.subtitle', "Anadolu Hastaneleri Grubu'ndaki gelişmeler, yenilikler ve etkinlikler hakkında güncel bilgilere ulaşın.")}
            </p>
          </motion.div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 overflow-hidden">
          <svg viewBox="0 0 1440 60" preserveAspectRatio="none" className="w-full h-12 md:h-16 fill-gray-50">
            <polygon points="0,60 1440,0 1440,60" />
          </svg>
        </div>
      </section>

      {/* ─── NEWS GRID ─── */}
      <section className="bg-gray-50 py-20 lg:py-28">
        <div className="container-custom">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : (
            <>
              {/* Featured (first item) */}
              {featured && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="grid grid-cols-1 lg:grid-cols-2 gap-0 rounded-2xl overflow-hidden shadow-xl mb-12"
                >
                  <div
                    className="h-64 lg:h-auto bg-cover bg-center"
                    style={{ backgroundImage: `url('${featured.image}')` }}
                  />
                  <div className="bg-white p-10 lg:p-12 flex flex-col justify-center">
                    <div className="flex items-center gap-3 mb-4">
                      <span className={`text-xs font-bold px-3 py-1 rounded-full ${categoryColors[featured.category] || 'bg-gray-100 text-gray-600'}`}>
                        <FaTag className="inline mr-1" />{featured.category}
                      </span>
                      <span className="text-gray-400 text-xs flex items-center gap-1">
                        <FaCalendarAlt /> {featured.date}
                      </span>
                    </div>
                    <h2 className="text-2xl lg:text-3xl font-black text-secondary mb-4 leading-snug">
                      {featured.title}
                    </h2>
                    <p className="text-gray-500 leading-relaxed mb-6">{featured.excerpt}</p>
                    <a
                      href={`/haberler/${featured.slug}`}
                      className="inline-flex items-center gap-2 text-primary font-bold text-sm hover:gap-3 transition-all"
                    >
                      {t('common.readMore', 'Devamını Oku')} <FaChevronRight />
                    </a>
                  </div>
                </motion.div>
              )}

              {/* Rest of news */}
              {rest.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {rest.map((news, i) => (
                    <motion.article
                      key={news.id}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.08 }}
                      className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group"
                    >
                      <div
                        className="h-48 bg-cover bg-center"
                        style={{ backgroundImage: `url('${news.image}')` }}
                      />
                      <div className="p-6">
                        <div className="flex items-center gap-3 mb-3">
                          <span className={`text-xs font-bold px-3 py-1 rounded-full ${categoryColors[news.category] || 'bg-gray-100 text-gray-600'}`}>
                            {news.category}
                          </span>
                          <span className="text-gray-400 text-xs flex items-center gap-1">
                            <FaCalendarAlt /> {news.date}
                          </span>
                        </div>
                        <h3 className="text-lg font-bold text-secondary mb-2 leading-snug group-hover:text-primary transition-colors">
                          {news.title}
                        </h3>
                        <p className="text-gray-500 text-sm leading-relaxed mb-4 line-clamp-3">{news.excerpt}</p>
                        <a
                          href={`/haberler/${news.slug}`}
                          className="inline-flex items-center gap-2 text-primary font-bold text-sm hover:gap-3 transition-all"
                        >
                          Devamını Oku <FaChevronRight />
                        </a>
                      </div>
                    </motion.article>
                  ))}
                </div>
              )}

              {/* No news */}
              {newsItems.length === 0 && (
                <div className="text-center py-16">
                  <p className="text-gray-500 text-lg">{t('news.empty', 'Henüz haber bulunmamaktadır.')}</p>
                </div>
              )}
            </>
          )}

          {/* Load more button */}
          <div className="flex justify-center mt-12">
            <button className="inline-flex items-center gap-2 px-8 py-4 border-2 border-primary text-primary font-bold rounded-xl hover:bg-primary hover:text-white transition-all duration-300">
              {t('news.loadMore', 'Daha Fazla Haber')}
              <FaChevronRight />
            </button>
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
          <LastUpdated date="13.05.2024" />
        </div>
      </section>
    </>
  );
};

export default NewsPage;
