import DynamicPageRenderer from '../components/common/DynamicPageRenderer'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import SectionTitle from '../components/ui/SectionTitle'
import { FaPlay, FaSearch, FaFilter, FaClock, FaEye } from 'react-icons/fa'

interface VideoItem {
  id: number;
  title: string;
  description: string;
  thumbnail: string;
  duration: string;
  views: number;
  category: string;
  videoUrl: string;
  publishDate: string;
}

// Original health videos page as fallback
const OriginalHealthVideosPage = () => {
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [filteredVideos, setFilteredVideos] = useState<VideoItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);

  const categories = [
    { value: 'all', label: 'Tüm Videolar' },
    { value: 'beslenme', label: 'Beslenme' },
    { value: 'egzersiz', label: 'Egzersiz' },
    { value: 'hastalık', label: 'Hastalık Bilgileri' },
    { value: 'tedavi', label: 'Tedavi Yöntemleri' },
    { value: 'önleme', label: 'Hastalık Önleme' }
  ];

  useEffect(() => {
    // Simulate loading videos
    const sampleVideos: VideoItem[] = [
      {
        id: 1,
        title: 'Kalp Sağlığı İçin Beslenme Önerileri',
        description: 'Kalp sağlığınızı korumak için doğru beslenme alışkanlıkları ve öneriler',
        thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
        duration: '5:30',
        views: 1250,
        category: 'beslenme',
        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        publishDate: '2024-01-15'
      },
      {
        id: 2,
        title: 'Doğru Nefes Alma Teknikleri',
        description: 'Stres azaltmak ve sağlığınızı iyileştirmek için nefes alma egzersizleri',
        thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
        duration: '8:15',
        views: 890,
        category: 'egzersiz',
        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        publishDate: '2024-01-10'
      },
      {
        id: 3,
        title: 'Diyabet Yönetimi ve Yaşam Tarzı',
        description: 'Diyabet hastalarının günlük yaşamda dikkat etmesi gerekenler',
        thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
        duration: '12:45',
        views: 2100,
        category: 'hastalık',
        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        publishDate: '2024-01-05'
      },
      {
        id: 4,
        title: 'Evde Yapılabilecek Egzersizler',
        description: 'Sağlıklı kalmak için evde kolayca yapabileceğiniz egzersizler',
        thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
        duration: '15:20',
        views: 1680,
        category: 'egzersiz',
        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        publishDate: '2024-01-01'
      },
      {
        id: 5,
        title: 'Kanser Önleme Yöntemleri',
        description: 'Kanserden korunmak için alınabilecek önlemler ve yaşam tarzı değişiklikleri',
        thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
        duration: '10:30',
        views: 3200,
        category: 'önleme',
        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        publishDate: '2023-12-28'
      },
      {
        id: 6,
        title: 'Sağlıklı Beslenme Piramidi',
        description: 'Dengeli beslenme için beslenme piramidini doğru kullanma rehberi',
        thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
        duration: '7:45',
        views: 1450,
        category: 'beslenme',
        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        publishDate: '2023-12-25'
      }
    ];

    setTimeout(() => {
      setVideos(sampleVideos);
      setFilteredVideos(sampleVideos);
      setLoading(false);
    }, 1000);
  }, []);

  useEffect(() => {
    let filtered = videos;

    if (searchTerm) {
      filtered = filtered.filter(video =>
        video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        video.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(video => video.category === selectedCategory);
    }

    setFilteredVideos(filtered);
  }, [videos, searchTerm, selectedCategory]);

  const formatViews = (views: number) => {
    if (views >= 1000) {
      return `${(views / 1000).toFixed(1)}K`;
    }
    return views.toString();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-12">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary to-primary-dark text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <motion.h1 
            className="text-4xl md:text-6xl font-bold mb-6"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            Sağlık Videoları
          </motion.h1>
          <motion.p 
            className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Uzman doktorlarımızdan sağlık konularında faydalı video içerikler
          </motion.p>
        </div>
      </section>

      {/* Filters */}
      <section className="py-8 bg-white border-b">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Video ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <FaFilter className="text-gray-500" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                {categories.map(category => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Videos Grid */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredVideos.map((video, index) => (
              <motion.div
                key={video.id}
                className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                onClick={() => window.open(video.videoUrl, '_blank')}
              >
                <div className="relative">
                  <img 
                    src={video.thumbnail} 
                    alt={video.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <FaPlay className="text-white text-4xl" />
                  </div>
                  <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded flex items-center">
                    <FaClock className="mr-1" />
                    {video.duration}
                  </div>
                  <div className="absolute top-2 left-2 bg-primary text-white text-xs px-2 py-1 rounded">
                    {categories.find(c => c.value === video.category)?.label}
                  </div>
                </div>
                
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                    {video.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {video.description}
                  </p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center">
                      <FaEye className="mr-1" />
                      {formatViews(video.views)} görüntüleme
                    </div>
                    <span>{new Date(video.publishDate).toLocaleDateString('tr-TR')}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {filteredVideos.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">🎥</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Video bulunamadı</h3>
              <p className="text-gray-500">
                Arama kriterlerinize uygun video bulunamadı. Lütfen farklı anahtar kelimeler deneyin.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Daha Fazla Sağlık İçeriği
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Sağlık rehberimizde daha fazla faydalı makale ve içerik bulabilirsiniz
          </p>
          <a
            href="/saglik-rehberi"
            className="inline-block bg-white text-primary px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors"
          >
            Sağlık Rehberine Git
          </a>
        </div>
      </section>
    </div>
  );
};

const HealthVideosPage = () => {
  return (
    <DynamicPageRenderer 
      slug="saglik-rehberi-videolar" 
      fallbackComponent={OriginalHealthVideosPage}
    />
  );
};

export default HealthVideosPage;
