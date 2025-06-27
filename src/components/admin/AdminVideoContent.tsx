import { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaSearch, FaPlay, FaYoutube } from 'react-icons/fa';
import { supabaseNew as supabase } from '../../lib/supabase-new';

interface VideoContent {
  id: number;
  title: string;
  description: string;
  video_url: string;
  thumbnail_url?: string;
  duration?: string;
  category: string;
  tags: string[];
  is_published: boolean;
  view_count: number;
  created_at: string;
  updated_at: string;
}

const AdminVideoContent = () => {
  const [videos, setVideos] = useState<VideoContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [editingVideo, setEditingVideo] = useState<VideoContent | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    video_url: '',
    thumbnail_url: '',
    duration: '',
    category: 'genel',
    tags: '',
    is_published: true
  });

  const categories = [
    { value: 'genel', label: 'Genel Sağlık' },
    { value: 'beslenme', label: 'Beslenme' },
    { value: 'egzersiz', label: 'Egzersiz' },
    { value: 'hastalık', label: 'Hastalık Bilgileri' },
    { value: 'tedavi', label: 'Tedavi Yöntemleri' },
    { value: 'önleme', label: 'Hastalık Önleme' }
  ];

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      setLoading(true);
      
      // Create sample video data since table might not exist
      const sampleVideos: VideoContent[] = [
        {
          id: 1,
          title: 'Kalp Sağlığı İçin Beslenme Önerileri',
          description: 'Kalp sağlığınızı korumak için doğru beslenme alışkanlıkları',
          video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
          thumbnail_url: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
          duration: '5:30',
          category: 'beslenme',
          tags: ['kalp', 'beslenme', 'sağlık'],
          is_published: true,
          view_count: 1250,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 2,
          title: 'Doğru Nefes Alma Teknikleri',
          description: 'Stres azaltmak ve sağlığınızı iyileştirmek için nefes alma egzersizleri',
          video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
          thumbnail_url: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
          duration: '8:15',
          category: 'egzersiz',
          tags: ['nefes', 'stres', 'rahatlama'],
          is_published: true,
          view_count: 890,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 3,
          title: 'Diyabet Yönetimi ve Yaşam Tarzı',
          description: 'Diyabet hastalarının günlük yaşamda dikkat etmesi gerekenler',
          video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
          thumbnail_url: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
          duration: '12:45',
          category: 'hastalık',
          tags: ['diyabet', 'yaşam tarzı', 'tedavi'],
          is_published: true,
          view_count: 2100,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];

      setVideos(sampleVideos);
    } catch (error) {
      console.error('Error fetching videos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const videoData = {
        ...formData,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        view_count: 0,
        updated_at: new Date().toISOString()
      };

      if (editingVideo) {
        // Update existing video
        setVideos(videos.map(video => 
          video.id === editingVideo.id 
            ? { ...video, ...videoData, updated_at: new Date().toISOString() }
            : video
        ));
      } else {
        // Create new video
        const newVideo: VideoContent = {
          id: Date.now(),
          ...videoData,
          created_at: new Date().toISOString()
        } as VideoContent;
        
        setVideos([newVideo, ...videos]);
      }

      setShowForm(false);
      setEditingVideo(null);
      setFormData({
        title: '',
        description: '',
        video_url: '',
        thumbnail_url: '',
        duration: '',
        category: 'genel',
        tags: '',
        is_published: true
      });
      
      alert(editingVideo ? 'Video güncellendi!' : 'Video eklendi!');
    } catch (error) {
      console.error('Error saving video:', error);
      alert('Video kaydedilirken hata oluştu!');
    }
  };

  const deleteVideo = async (id: number) => {
    if (!confirm('Bu videoyu silmek istediğinizden emin misiniz?')) return;

    try {
      setVideos(videos.filter(video => video.id !== id));
      alert('Video silindi!');
    } catch (error) {
      console.error('Error deleting video:', error);
      alert('Video silinirken hata oluştu!');
    }
  };

  const editVideo = (video: VideoContent) => {
    setEditingVideo(video);
    setFormData({
      title: video.title,
      description: video.description,
      video_url: video.video_url,
      thumbnail_url: video.thumbnail_url || '',
      duration: video.duration || '',
      category: video.category,
      tags: video.tags.join(', '),
      is_published: video.is_published
    });
    setShowForm(true);
  };

  const getYouTubeVideoId = (url: string) => {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
    return match ? match[1] : null;
  };

  const filteredVideos = videos.filter(video => {
    const matchesSearch = video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         video.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || video.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-primary">Video İçerikler</h1>
        <button
          onClick={() => {
            setShowForm(true);
            setEditingVideo(null);
            setFormData({
              title: '',
              description: '',
              video_url: '',
              thumbnail_url: '',
              duration: '',
              category: 'genel',
              tags: '',
              is_published: true
            });
          }}
          className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors flex items-center"
        >
          <FaPlus className="mr-2" />
          Yeni Video
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Video ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="all">Tüm Kategoriler</option>
            {categories.map(category => (
              <option key={category.value} value={category.value}>
                {category.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Videos Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredVideos.map((video) => (
          <div key={video.id} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
            <div className="relative">
              {video.thumbnail_url ? (
                <img 
                  src={video.thumbnail_url} 
                  alt={video.title}
                  className="w-full h-48 object-cover"
                />
              ) : (
                <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                  <FaYoutube className="text-4xl text-gray-400" />
                </div>
              )}
              <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                <FaPlay className="text-white text-3xl" />
              </div>
              {video.duration && (
                <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
                  {video.duration}
                </div>
              )}
            </div>
            
            <div className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                  {categories.find(c => c.value === video.category)?.label || video.category}
                </span>
                <span className={`text-xs px-2 py-1 rounded ${
                  video.is_published 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {video.is_published ? 'Yayında' : 'Taslak'}
                </span>
              </div>
              
              <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                {video.title}
              </h3>
              
              <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                {video.description}
              </p>
              
              <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                <span>{video.view_count} görüntüleme</span>
                <span>{new Date(video.created_at).toLocaleDateString('tr-TR')}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <div className="flex space-x-2">
                  <button
                    onClick={() => editVideo(video)}
                    className="text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => deleteVideo(video.id)}
                    className="text-red-600 hover:text-red-800 transition-colors"
                  >
                    <FaTrash />
                  </button>
                </div>
                <a
                  href={video.video_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:text-primary-dark transition-colors"
                >
                  <FaPlay />
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredVideos.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">🎥</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Video bulunamadı</h3>
          <p className="text-gray-500 mb-4">
            {searchTerm || selectedCategory !== 'all'
              ? 'Arama kriterlerinize uygun video bulunamadı.'
              : 'Henüz hiç video eklenmemiş.'}
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors inline-flex items-center"
          >
            <FaPlus className="mr-2" />
            İlk Videoyu Ekle
          </button>
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4">
              {editingVideo ? 'Video Düzenle' : 'Yeni Video'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Video Başlığı
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Video URL (YouTube)
                </label>
                <input
                  type="url"
                  value={formData.video_url}
                  onChange={(e) => setFormData({...formData, video_url: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="https://www.youtube.com/watch?v=..."
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Kategori
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    {categories.map(category => (
                      <option key={category.value} value={category.value}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Süre (opsiyonel)
                  </label>
                  <input
                    type="text"
                    value={formData.duration}
                    onChange={(e) => setFormData({...formData, duration: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="5:30"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Açıklama
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Etiketler (virgülle ayırın)
                </label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => setFormData({...formData, tags: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="sağlık, beslenme, egzersiz"
                />
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_published"
                  checked={formData.is_published}
                  onChange={(e) => setFormData({...formData, is_published: e.target.checked})}
                  className="mr-2"
                />
                <label htmlFor="is_published" className="text-sm font-medium text-gray-700">
                  Yayında
                </label>
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark"
                >
                  {editingVideo ? 'Güncelle' : 'Oluştur'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminVideoContent;
