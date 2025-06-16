import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import SectionTitle from '../components/ui/SectionTitle'
import { FaSearch, FaCalendarAlt, FaEye, FaVideo, FaFilePdf } from 'react-icons/fa'

// Mock data for health articles
const articles = [
  {
    id: 1,
    title: 'Kalp Sağlığınızı Korumak İçin 10 Öneri',
    slug: 'kalp-sagliginizi-korumak-icin-10-oneri',
    category: 'Kardiyoloji',
    image: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
    date: '15 Eylül 2023',
    views: 1245,
    excerpt: 'Kalp sağlığınızı korumak için beslenme, egzersiz ve yaşam tarzı önerileri.',
    type: 'article',
  },
  {
    id: 2,
    title: 'Çocuklarda Bağışıklık Sistemini Güçlendirme Yolları',
    slug: 'cocuklarda-bagisiklik-sistemini-guclendirme-yollari',
    category: 'Çocuk Sağlığı',
    image: 'https://images.unsplash.com/photo-1516627145497-ae6968895b74?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
    date: '10 Eylül 2023',
    views: 987,
    excerpt: 'Çocuğunuzun bağışıklık sistemini güçlendirmek için beslenme ve yaşam tarzı önerileri.',
    type: 'article',
  },
  {
    id: 3,
    title: 'Sağlıklı Kemikler İçin Beslenme Önerileri',
    slug: 'saglikli-kemikler-icin-beslenme-onerileri',
    category: 'Ortopedi',
    image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
    date: '5 Eylül 2023',
    views: 756,
    excerpt: 'Kemik sağlığınızı korumak için beslenme ve yaşam tarzı önerileri.',
    type: 'article',
  },
  {
    id: 4,
    title: 'Hipertansiyon Nedir ve Nasıl Kontrol Edilir?',
    slug: 'hipertansiyon-nedir-ve-nasil-kontrol-edilir',
    category: 'Kardiyoloji',
    image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
    date: '28 Ağustos 2023',
    views: 1023,
    excerpt: 'Hipertansiyon hakkında bilmeniz gerekenler ve kontrol altında tutmak için öneriler.',
    type: 'article',
  },
  {
    id: 5,
    title: 'Doğru Diş Fırçalama Teknikleri',
    slug: 'dogru-dis-fircalama-teknikleri',
    category: 'Diş Sağlığı',
    image: 'https://images.unsplash.com/photo-1588528402605-1f9d0eb7a6d6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
    date: '20 Ağustos 2023',
    views: 845,
    excerpt: 'Diş sağlığınızı korumak için doğru diş fırçalama teknikleri ve öneriler.',
    type: 'video',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
  },
  {
    id: 6,
    title: 'Sağlıklı Beslenme Rehberi',
    slug: 'saglikli-beslenme-rehberi',
    category: 'Beslenme',
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
    date: '15 Ağustos 2023',
    views: 1567,
    excerpt: 'Sağlıklı beslenme için temel ilkeler ve öneriler.',
    type: 'article',
  },
  {
    id: 7,
    title: 'Stres Yönetimi Teknikleri',
    slug: 'stres-yonetimi-teknikleri',
    category: 'Psikoloji',
    image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
    date: '10 Ağustos 2023',
    views: 1234,
    excerpt: 'Günlük hayatta stresi yönetmek için pratik teknikler ve öneriler.',
    type: 'video',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
  },
  {
    id: 8,
    title: 'Diyabet Hasta Bilgilendirme Formu',
    slug: 'diyabet-hasta-bilgilendirme-formu',
    category: 'Endokrinoloji',
    image: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
    date: '5 Ağustos 2023',
    views: 678,
    excerpt: 'Diyabet hastaları için önemli bilgiler ve öneriler içeren bilgilendirme formu.',
    type: 'pdf',
    pdfUrl: '#',
  },
  {
    id: 9,
    title: 'Hamilelikte Beslenme',
    slug: 'hamilelikte-beslenme',
    category: 'Kadın Hastalıkları',
    image: 'https://images.unsplash.com/photo-1531983412531-1f49a365ffed?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
    date: '1 Ağustos 2023',
    views: 1432,
    excerpt: 'Hamilelik döneminde sağlıklı beslenme için öneriler ve dikkat edilmesi gerekenler.',
    type: 'article',
  },
];

// Get unique categories for filters
const categories = [...new Set(articles.map(article => article.category))];

const HealthGuidePage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [filteredArticles, setFilteredArticles] = useState(articles);

  const handleSearch = () => {
    const filtered = articles.filter((article) => {
      const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  return (
    <>
      <Helmet>
        <title>Sağlık Rehberi | Anadolu Hastaneleri Grubu</title>
        <meta name="description" content="Anadolu Hastaneleri Grubu'nun uzman doktorları tarafından hazırlanan sağlık makaleleri, videolar ve bilgilendirme formları." />
      </Helmet>

      <div className="pt-24 pb-12 bg-neutral">
        <div className="container-custom">
          <SectionTitle
            title="Sağlık Rehberi"
            subtitle="Sağlıklı bir yaşam için uzmanlarımızın hazırladığı bilgilendirici içerikler."
          />

          <div className="bg-white rounded-xl shadow-card p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <label htmlFor="search" className="block text-sm font-medium text-text mb-1">Arama</label>
                <div className="relative">
                  <input
                    type="text"
                    id="search"
                    placeholder="Makale başlığı veya konu ara..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="input-field pl-12"
                  />
                  <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-text-light" />
                </div>
              </div>
              
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-text mb-1">Kategori</label>
                <select
                  id="category"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="input-field"
                >
                  <option value="">Tüm Kategoriler</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label htmlFor="type" className="block text-sm font-medium text-text mb-1">İçerik Tipi</label>
                <select
                  id="type"
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="input-field"
                >
                  <option value="">Tüm İçerikler</option>
                  <option value="article">Makaleler</option>
                  <option value="video">Videolar</option>
                  <option value="pdf">Bilgilendirme Formları</option>
                </select>
              </div>
            </div>
            
            <div className="flex justify-end mt-4 space-x-4">
              <button
                onClick={resetFilters}
                className="px-4 py-2 text-text-light hover:text-primary transition-colors"
              >
                Filtreleri Temizle
              </button>
              <button
                onClick={handleSearch}
                className="btn btn-primary"
              >
                Ara
              </button>
            </div>
          </div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {filteredArticles.map((article) => (
              <motion.div
                key={article.id}
                variants={itemVariants}
                className="card overflow-hidden group"
              >
                <div className="relative h-48 -mx-6 -mt-6 mb-6 overflow-hidden">
                  <img
                    src={article.image}
                    alt={article.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    loading="lazy"
                    crossOrigin="anonymous"
                  />
                  <div className="absolute top-4 left-4 bg-accent text-white text-xs font-medium px-3 py-1 rounded-full">
                    {article.category}
                  </div>
                  {article.type !== 'article' && (
                    <div className="absolute top-4 right-4 bg-white text-accent text-xs font-medium px-3 py-1 rounded-full flex items-center">
                      {getTypeIcon(article.type)}
                      <span className="ml-1">
                        {article.type === 'video' ? 'Video' : 'PDF'}
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-between text-xs text-text-light mb-3">
                  <div className="flex items-center">
                    <FaCalendarAlt className="mr-1" />
                    <span>{article.date}</span>
                  </div>
                  <div className="flex items-center">
                    <FaEye className="mr-1" />
                    <span>{article.views} görüntülenme</span>
                  </div>
                </div>
                <h3 className="text-lg font-semibold mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                  <Link to={`/saglik-rehberi/${article.slug}`}>{article.title}</Link>
                </h3>
                <p className="text-text-light text-sm mb-4 line-clamp-2">{article.excerpt}</p>
                <Link
                  to={`/saglik-rehberi/${article.slug}`}
                  className="inline-block text-sm font-medium text-primary hover:text-primary-dark transition-colors"
                >
                  {article.type === 'pdf' ? 'İndir' : 'Devamını Oku'}
                </Link>
              </motion.div>
            ))}
          </motion.div>

          {filteredArticles.length === 0 && (
            <div className="text-center py-12 bg-white rounded-xl shadow-card">
              <i className="bi bi-search text-4xl text-text-light mb-4"></i>
              <h3 className="text-xl font-semibold mb-2">Sonuç Bulunamadı</h3>
              <p className="text-text-light">Arama kriterlerinize uygun içerik bulunamadı. Lütfen farklı bir arama terimi deneyin veya filtreleri temizleyin.</p>
              <button
                onClick={resetFilters}
                className="mt-4 px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
              >
                Filtreleri Temizle
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default HealthGuidePage;
