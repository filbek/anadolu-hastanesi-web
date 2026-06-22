import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import SectionTitle from '../components/ui/SectionTitle'
import { FaSearch, FaCalendarAlt, FaEye, FaVideo, FaFilePdf } from 'react-icons/fa'
import { useHealthArticles } from '../hooks/useHealthArticles'
import { getArticleImageUrl } from '../services'

const HealthGuidePage = () => {
  const { t } = useTranslation();
  const { data: articles = [], isLoading } = useHealthArticles()
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [filteredArticles, setFilteredArticles] = useState(articles);

  useEffect(() => {
    setFilteredArticles(articles)
  }, [articles])

  const categories = [...new Set(articles.map((article: any) => article.category))];

  const handleSearch = () => {
    const filtered = articles.filter((article: any) => {
      const excerpt = article.excerpt || article.content?.substring(0, 120) || ''
      const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.category.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = selectedCategory === '' || article.category === selectedCategory;
      const matchesType = selectedType === '' || article.type === selectedType;
      
      return matchesSearch && matchesCategory && matchesType;
    });
    
    setFilteredArticles(filtered);
  };

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setSelectedType('');
    setFilteredArticles(articles);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <FaVideo className="text-accent" />;
      case 'pdf':
        return <FaFilePdf className="text-accent" />;
      default:
        return null;
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    // If already formatted like "15 Eylül 2023", return as-is
    if (dateStr.includes(' ')) return dateStr;
    try {
      return new Date(dateStr).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.08,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 16 },
    visible: {
      y: 0,
      transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
    },
  };

  return (
    <>
      <Helmet>
        <title>{t('healthGuide.pageTitle', 'Sağlık Rehberi')} | Anadolu Hastaneleri Grubu</title>
        <meta name="description" content={t('healthGuide.metaDescription', "Anadolu Hastaneleri Grubu'nun uzman doktorları tarafından hazırlanan sağlık makaleleri, videolar ve bilgilendirme formları.")} />
      </Helmet>

      <div className="pt-24 pb-12 bg-neutral">
        <div className="container-custom">
          <SectionTitle
            as="h1"
            title={t('healthGuide.title', 'Sağlık Rehberi')}
            subtitle={t('healthGuide.subtitle', 'Sağlıklı bir yaşam için uzmanlarımızın hazırladığı bilgilendirici içerikler.')}
          />

          <div className="bg-white rounded-xl shadow-card p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <label htmlFor="search" className="block text-sm font-medium text-text mb-1">{t('common.search', 'Arama')}</label>
                <div className="relative">
                  <input
                    type="text"
                    id="search"
                    placeholder={t('healthGuide.searchPlaceholder', 'Makale başlığı veya konu ara...')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="input-field pl-12"
                  />
                  <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-text-light" />
                </div>
              </div>
              
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-text mb-1">{t('common.category', 'Kategori')}</label>
                <select
                  id="category"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="input-field"
                >
                  <option value="">{t('healthGuide.allCategories', 'Tüm Kategoriler')}</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label htmlFor="type" className="block text-sm font-medium text-text mb-1">{t('healthGuide.contentType', 'İçerik Tipi')}</label>
                <select
                  id="type"
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="input-field"
                >
                  <option value="">{t('healthGuide.allContent', 'Tüm İçerikler')}</option>
                  <option value="article">{t('healthGuide.articles', 'Makaleler')}</option>
                  <option value="video">{t('healthGuide.videos', 'Videolar')}</option>
                  <option value="pdf">{t('healthGuide.forms', 'Bilgilendirme Formları')}</option>
                </select>
              </div>
            </div>
            
            <div className="flex justify-end mt-4 space-x-4">
              <button
                onClick={resetFilters}
                className="px-4 py-2 text-text-light hover:text-primary transition-colors"
              >
                {t('common.clearFilters', 'Filtreleri Temizle')}
              </button>
              <button
                onClick={handleSearch}
                className="btn btn-primary"
              >
                {t('common.searchButton', 'Ara')}
              </button>
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : (
            <>
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
              >
                {filteredArticles.map((article: any) => (
                  <motion.div
                    key={article.id}
                    variants={itemVariants}
                    className="card overflow-hidden group"
                  >
                    <div className="relative h-48 -mx-6 -mt-6 mb-6 overflow-hidden">
                      <img
                        src={getArticleImageUrl(article.image, article.category)}
                        alt={article.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        loading="lazy"
                      />
                      <div className="absolute top-4 left-4 bg-accent text-white text-xs font-medium px-3 py-1 rounded-full">
                        {article.category}
                      </div>
                      {article.type !== 'article' && (
                        <div className="absolute top-4 right-4 bg-white text-accent text-xs font-medium px-3 py-1 rounded-full flex items-center">
                          {getTypeIcon(article.type)}
                          <span className="ml-1">
                            {article.type === 'video' ? t('common.video', 'Video') : t('common.pdf', 'PDF')}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center justify-between text-xs text-text-light mb-3">
                      <div className="flex items-center">
                        <FaCalendarAlt className="mr-1" />
                        <span>{formatDate(article.date)}</span>
                      </div>
                      <div className="flex items-center">
                        <FaEye className="mr-1" />
                        <span>{article.views || 0} {t('common.views', 'görüntülenme')}</span>
                      </div>
                    </div>
                    <h3 className="text-lg font-semibold mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                      <Link to={`/saglik-rehberi/${article.slug}`}>{article.title}</Link>
                    </h3>
                    <p className="text-text-light text-sm mb-4 line-clamp-2">
                      {article.excerpt || article.content?.substring(0, 120) + '...'}
                    </p>
                    <Link
                      to={`/saglik-rehberi/${article.slug}`}
                      className="inline-block text-sm font-medium text-primary hover:text-primary-dark transition-colors"
                    >
                      {article.type === 'pdf' ? t('common.download', 'İndir') : t('common.readMore', 'Devamını Oku')}
                    </Link>
                  </motion.div>
                ))}
              </motion.div>

              {filteredArticles.length === 0 && (
                <div className="text-center py-12 bg-white rounded-xl shadow-card">
                  <i className="bi bi-search text-4xl text-text-light mb-4"></i>
                  <h3 className="text-xl font-semibold mb-2">{t('common.noResults', 'Sonuç Bulunamadı')}</h3>
                  <p className="text-text-light">{t('healthGuide.noResultsDesc', 'Arama kriterlerinize uygun içerik bulunamadı. Lütfen farklı bir arama terimi deneyin veya filtreleri temizleyin.')}</p>
                  <button
                    onClick={resetFilters}
                    className="mt-4 px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
                  >
                    {t('common.clearFilters', 'Filtreleri Temizle')}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default HealthGuidePage;
