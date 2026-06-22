import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FaPlus, FaEdit, FaTrash, FaSearch, FaSave, FaPlay, FaVideo } from 'react-icons/fa';

interface VideoContent {
  id: number;
  title: string;
  description: string;
  video_url: string;
  thumbnail_url: string;
  category: string;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

const AdminVideoContent = () => {
  const { t } = useTranslation();
  const [videos, setVideos] = useState<VideoContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingVideo, setEditingVideo] = useState<VideoContent | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    video_url: '',
    thumbnail_url: '',
    category: 'genel',
    is_active: true,
    display_order: 1
  });

  const categories = [
    { value: 'genel', label: t('admin.videoContent.categoryGeneral', 'Genel') },
    { value: 'hastane', label: t('admin.videoContent.categoryHospital', 'Hastane Tanıtımı') },
    { value: 'doktor', label: t('admin.videoContent.categoryDoctor', 'Doktor Tanıtımı') },
    { value: 'bolum', label: t('admin.videoContent.categoryDepartment', 'Bölüm Tanıtımı') },
    { value: 'hasta', label: t('admin.videoContent.categoryPatient', 'Hasta Hikayeleri') },
    { value: 'saglik', label: t('admin.videoContent.categoryHealth', 'Sağlık Rehberi') }
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
          title: 'Anadolu Hastaneleri Tanıtım Filmi',
          description: 'Hastanemizin tanıtım filmi, modern tesislerimiz ve hizmetlerimiz hakkında bilgi',
          video_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
          thumbnail_url: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=400',
          category: 'hastane',
          is_active: true,
          display_order: 1,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 2,
          title: 'Kalp Sağlığı ve Korunma Yolları',
          description: 'Uzman doktorumuz kalp sağlığı hakkında önemli bilgiler paylaşıyor',
          video_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
          thumbnail_url: 'https://images.unsplash.com/photo-1628348070889-cb656235b4eb?w=400',
          category: 'saglik',
          is_active: true,
          display_order: 2,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 3,
          title: 'Doktor Tanıtım: Prof. Dr. Ahmet Yılmaz',
          description: 'Kardiyoloji uzmanı Prof. Dr. Ahmet Yılmaz kendini ve çalışmalarını tanıtıyor',
          video_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
          thumbnail_url: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400',
          category: 'doktor',
          is_active: true,
          display_order: 3,
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
        category: 'genel',
        is_active: true,
        display_order: 1
      });

      alert(editingVideo ? t('admin.videoUpdated', 'Video güncellendi!') : t('admin.videoAdded', 'Video eklendi!'));
    } catch (error) {
      console.error('Error saving video:', error);
      alert(t('admin.videoSaveError', 'Video kaydedilirken hata oluştu!'));
    }
  };

  const deleteVideo = async (id: number) => {
    if (!confirm(t('admin.confirmDeleteVideo', 'Bu videoyu silmek istediğinizden emin misiniz?'))) return;

    try {
      setVideos(videos.filter(video => video.id !== id));
      alert(t('admin.videoDeleted', 'Video silindi!'));
    } catch (error) {
      console.error('Error deleting video:', error);
      alert(t('admin.videoDeleteError', 'Video silinirken hata oluştu!'));
    }
  };

  const editVideo = (video: VideoContent) => {
    setEditingVideo(video);
    setFormData({
      title: video.title,
      description: video.description,
      video_url: video.video_url,
      thumbnail_url: video.thumbnail_url,
      category: video.category,
      is_active: video.is_active,
      display_order: video.display_order
    });
    setShowForm(true);
  };

  const getVideoEmbedUrl = (url: string) => {
    // Convert various video URL formats to embed format
    if (url.includes('youtube.com/watch?v=')) {
      const videoId = url.split('v=')[1];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    if (url.includes('youtu.be/')) {
      const videoId = url.split('youtu.be/')[1];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    return url;
  };

  const filteredVideos = videos.filter(video =>
    video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    video.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
        <h1 className="text-2xl font-semibold text-primary">{t('admin.videoContent.title', 'Video İçerikleri')}</h1>
        <button
          onClick={() => {
            setShowForm(true);
            setEditingVideo(null);
            setFormData({
              title: '',
              description: '',
              video_url: '',
              thumbnail_url: '',
              category: 'genel',
              is_active: true,
              display_order: videos.length + 1
            });
          }}
          className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors flex items-center"
        >
          <FaPlus className="mr-2" />
          {t('admin.videoContent.new', 'Yeni Video')}
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="relative">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder={t('admin.videoContent.searchPlaceholder', 'Video ara...')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>
      </div>

      {/* Videos Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredVideos.map((video) => (
          <div key={video.id} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
            <div className="relative h-48 bg-gray-900">
              {video.thumbnail_url ? (
                <img
                  src={video.thumbnail_url}
                  alt={video.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <FaVideo className="text-4xl text-gray-400" />
                </div>
              )}
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
                <FaPlay className="text-white text-3xl" />
              </div>
              <div className="absolute top-2 right-2">
                <span className={`px-2 py-1 text-xs rounded-full ${video.is_active
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                  }`}>
                  {video.is_active ? t('admin.active', 'Aktif') : t('admin.passive', 'Pasif')}
                </span>
              </div>
            </div>

            <div className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-primary/10 text-primary">
                  {categories.find(c => c.value === video.category)?.label}
                </span>
                <span className="text-sm text-gray-500">#{video.display_order}</span>
              </div>

              <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{video.title}</h3>
              <p className="text-gray-600 text-sm mb-4 line-clamp-2">{video.description}</p>

              <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                <button
                  onClick={() => window.open(getVideoEmbedUrl(video.video_url), '_blank')}
                  className="text-primary hover:text-primary-dark text-sm flex items-center"
                >
                  <FaPlay className="mr-1" />
                  {t('admin.watch', 'İzle')}
                </button>
                <div className="flex space-x-2">
                  <button
                    onClick={() => editVideo(video)}
                    className="text-blue-600 hover:text-blue-800 transition-colors"
                    title={t('admin.edit', 'Düzenle')}
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => deleteVideo(video.id)}
                    className="text-red-600 hover:text-red-800 transition-colors"
                    title={t('admin.delete', 'Sil')}
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredVideos.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">🎥</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">{t('admin.videoContent.notFound', 'Video bulunamadı')}</h3>
          <p className="text-gray-500 mb-4">
            {searchTerm
              ? t('admin.searchNoResults', 'Arama kriterlerinize uygun video bulunamadı.')
              : t('admin.videoContent.empty', 'Henüz hiç video eklenmemiş.')}
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors inline-flex items-center"
          >
            <FaPlus className="mr-2" />
            {t('admin.videoContent.addFirst', 'İlk Videoyu Ekle')}
          </button>
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4">
              {editingVideo ? t('admin.videoContent.edit', 'Video Düzenle') : t('admin.videoContent.new', 'Yeni Video')}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('admin.label.videoTitle', 'Video Başlığı')}
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('admin.label.description', 'Açıklama')}
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('admin.label.videoUrl', 'Video URL')}
                </label>
                <input
                  type="url"
                  value={formData.video_url}
                  onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
                <p className="text-sm text-gray-500 mt-1">
                  {t('admin.label.videoUrlHint', 'YouTube veya doğrudan video linki')}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('admin.label.thumbnailUrl', 'Küçük Resim URL')}
                </label>
                <input
                  type="url"
                  value={formData.thumbnail_url}
                  onChange={(e) => setFormData({ ...formData, thumbnail_url: e.target.value })}
                  placeholder="https://example.com/thumbnail.jpg"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('admin.label.category', 'Kategori')}
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    {categories.map(category => (
                      <option key={category.value} value={category.value}>{category.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('admin.label.displayOrder', 'Görüntüleme Sırası')}
                  </label>
                  <input
                    type="number"
                    value={formData.display_order}
                    onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    min="1"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="mr-2"
                />
                <label htmlFor="is_active" className="text-sm font-medium text-gray-700">
                  {t('admin.label.active', 'Aktif')}
                </label>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  {t('admin.cancel', 'İptal')}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark flex items-center"
                >
                  <FaSave className="mr-2" />
                  {editingVideo ? t('admin.update', 'Güncelle') : t('admin.create', 'Oluştur')}
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
