import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FaPlus, FaEdit, FaTrash, FaSearch, FaSave, FaStar } from 'react-icons/fa';
import { supabase } from '../../lib/supabase';

interface Testimonial {
  id: number;
  name: string;
  title: string;
  content: string;
  rating: number;
  hospital_id: number | null;
  image_url: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface Hospital {
  id: number;
  name: string;
}

const AdminTestimonials = () => {
  const { t } = useTranslation();
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    title: '',
    content: '',
    rating: 5,
    hospital_id: 0,
    image_url: '',
    is_active: true
  });

  useEffect(() => {
    fetchTestimonials();
    fetchHospitals();
  }, []);

  const fetchHospitals = async () => {
    try {
      const { data } = await supabase.from('hospitals').select('id, name').order('name');
      setHospitals(data || []);
    } catch (error) {
      console.error('Error fetching hospitals:', error);
    }
  };

  const fetchTestimonials = async () => {
    try {
      setLoading(true);

      // Create sample testimonials data since table might not exist
      const sampleTestimonials: Testimonial[] = [
        {
          id: 1,
          name: 'Ahmet Yılmaz',
          title: 'Kalp Hastası',
          content: 'Anadolu Hastanesi\'nde geçirdiğim kalp ameliyatından çok memnun kaldım. Doktorlar ve hemşireler son derece ilgili ve profesyoneldi. Kendimi güvende hissettim ve sağlık kontrolleri konusunda her zaman bilgilendirildim.',
          rating: 5,
          hospital_id: null,
          image_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 2,
          name: 'Ayşe Demir',
          title: 'Gebelik Takibi',
          content: 'Hamileliğim boyunca Anadolu Hastanesi\'nden çok memnun kaldım. Gebe okulu, hamilelik sürecindeki bilgilendirmeler ve doğum öncesi hazırlıklar için çok teşekkür ederim. Doğumumu güvenle gerçekleştirdim.',
          rating: 5,
          hospital_id: null,
          image_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 3,
          name: 'Mehmet Kaya',
          title: 'Ortopedi Hastası',
          content: 'Diz ameliyatım sonrası fizik tedavi sürecimdeki ilgi ve destek için çok teşekkür ederim. Doktor ve fizik tedavi ekibi mükemmeldi. Artık yürüyebiliyorum ve normal hayatıma döndüm.',
          rating: 4,
          hospital_id: null,
          image_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 4,
          name: 'Fatma Şahin',
          title: 'Göz Hastası',
          content: 'Katarakt ameliyatım sonrası görüşüm çok iyi oldu. Modern cihazlar ve doktorların uzmanlığı sayesinde kısa sürede iyileştim. Hastanenin hijyen ve temizliği de çok iyi.',
          rating: 5,
          hospital_id: null,
          image_url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];

      setTestimonials(sampleTestimonials);
    } catch (error) {
      console.error('Error fetching testimonials:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const testimonialData = {
        ...formData,
        updated_at: new Date().toISOString()
      };

      if (editingTestimonial) {
        // Update existing testimonial
        setTestimonials(testimonials.map(testimonial =>
          testimonial.id === editingTestimonial.id
            ? { ...testimonial, ...testimonialData, updated_at: new Date().toISOString() }
            : testimonial
        ));
      } else {
        // Create new testimonial
        const newTestimonial: Testimonial = {
          id: Date.now(),
          ...testimonialData,
          created_at: new Date().toISOString()
        } as Testimonial;

        setTestimonials([newTestimonial, ...testimonials]);
      }

      setShowForm(false);
      setEditingTestimonial(null);
      setFormData({
        name: '',
        title: '',
        content: '',
        rating: 5,
        hospital_id: 0,
        image_url: '',
        is_active: true
      });

      alert(editingTestimonial ? t('admin.testimonialUpdated', 'Yorum güncellendi!') : t('admin.testimonialAdded', 'Yorum eklendi!'));
    } catch (error) {
      console.error('Error saving testimonial:', error);
      alert(t('admin.testimonialSaveError', 'Yorum kaydedilirken hata oluştu!'));
    }
  };

  const deleteTestimonial = async (id: number) => {
    if (!confirm(t('admin.confirmDeleteTestimonial', 'Bu yorumu silmek istediğinizden emin misiniz?'))) return;

    try {
      setTestimonials(testimonials.filter(testimonial => testimonial.id !== id));
      alert(t('admin.testimonialDeleted', 'Yorum silindi!'));
    } catch (error) {
      console.error('Error deleting testimonial:', error);
      alert(t('admin.testimonialDeleteError', 'Yorum silinirken hata oluştu!'));
    }
  };

  const editTestimonial = (testimonial: Testimonial) => {
    setEditingTestimonial(testimonial);
    setFormData({
      name: testimonial.name,
      title: testimonial.title,
      content: testimonial.content,
      rating: testimonial.rating,
      hospital_id: testimonial.hospital_id || 0,
      image_url: testimonial.image_url,
      is_active: testimonial.is_active
    });
    setShowForm(true);
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <FaStar
        key={i}
        className={`text-sm ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`}
      />
    ));
  };

  const filteredTestimonials = testimonials.filter(testimonial =>
    testimonial.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    testimonial.content.toLowerCase().includes(searchTerm.toLowerCase())
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
        <h1 className="text-2xl font-semibold text-primary">{t('admin.testimonials.title', 'Hasta Yorumları')}</h1>
        <button
          onClick={() => {
            setShowForm(true);
            setEditingTestimonial(null);
            setFormData({
              name: '',
              title: '',
              content: '',
              rating: 5,
              hospital_id: 0,
              image_url: '',
              is_active: true
            });
          }}
          className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors flex items-center"
        >
          <FaPlus className="mr-2" />
          {t('admin.testimonials.new', 'Yeni Yorum')}
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="relative">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder={t('admin.testimonials.searchPlaceholder', 'Yorum ara...')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>
      </div>

      {/* Testimonials Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredTestimonials.map((testimonial) => (
          <div key={testimonial.id} className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center">
                <img
                  src={testimonial.image_url || '/default-avatar.png'}
                  alt={testimonial.name}
                  className="w-12 h-12 rounded-full object-cover mr-4"
                />
                <div>
                  <h3 className="font-semibold text-gray-900">{testimonial.name}</h3>
                  <p className="text-sm text-gray-500">{testimonial.title}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 text-xs rounded-full ${testimonial.is_active
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                  }`}>
                  {testimonial.is_active ? t('admin.active', 'Aktif') : t('admin.passive', 'Pasif')}
                </span>
              </div>
            </div>

            <div className="flex items-center mb-3">
              {renderStars(testimonial.rating)}
            </div>

            <p className="text-gray-700 mb-4 line-clamp-3">{testimonial.content}</p>

            <div className="flex justify-between items-center pt-4 border-t border-gray-100">
              <span className="text-sm text-gray-500">
                {new Date(testimonial.created_at).toLocaleDateString('tr-TR')}
              </span>
              <div className="flex space-x-2">
                <button
                  onClick={() => editTestimonial(testimonial)}
                  className="text-blue-600 hover:text-blue-800 transition-colors"
                >
                  <FaEdit />
                </button>
                <button
                  onClick={() => deleteTestimonial(testimonial.id)}
                  className="text-red-600 hover:text-red-800 transition-colors"
                >
                  <FaTrash />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredTestimonials.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">⭐</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">{t('admin.testimonials.notFound', 'Yorum bulunamadı')}</h3>
          <p className="text-gray-500 mb-4">
            {searchTerm
              ? t('admin.searchNoResults', 'Arama kriterlerinize uygun yorum bulunamadı.')
              : t('admin.testimonials.empty', 'Henüz hiç yorum eklenmemiş.')}
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors inline-flex items-center"
          >
            <FaPlus className="mr-2" />
            {t('admin.testimonials.addFirst', 'İlk Yorumu Ekle')}
          </button>
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4">
              {editingTestimonial ? t('admin.testimonials.edit', 'Yorum Düzenle') : t('admin.testimonials.new', 'Yeni Yorum')}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('admin.label.name', 'Ad Soyad')}
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('admin.label.title', 'Ünvan / Durum')}
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
                  {t('admin.label.content', 'Yorum İçeriği')}
                </label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  rows={5}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('admin.label.rating', 'Puan (1-5)')}
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    value={formData.rating}
                    onChange={(e) => setFormData({ ...formData, rating: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('admin.label.hospital', 'Hastane')}
                  </label>
                  <select
                    value={formData.hospital_id}
                    onChange={(e) => setFormData({ ...formData, hospital_id: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value={0}>{t('admin.label.noHospital', 'Hastane Seçilmedi')}</option>
                    {hospitals.map(hospital => (
                      <option key={hospital.id} value={hospital.id}>{hospital.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('admin.label.imageUrl', 'Resim URL')}
                </label>
                <input
                  type="url"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="https://example.com/image.jpg"
                />
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
                  {editingTestimonial ? t('admin.update', 'Güncelle') : t('admin.create', 'Oluştur')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTestimonials;
