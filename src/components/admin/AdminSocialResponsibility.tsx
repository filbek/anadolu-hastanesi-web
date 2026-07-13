import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FaPlus, FaEdit, FaTrash, FaSearch, FaSave, FaEye, FaEyeSlash, FaImage, FaCalendarAlt } from 'react-icons/fa';
import { supabase } from '../../lib/supabase';
import type { Hospital } from '../../lib/supabase';

type CsrActivity = {
  id: number;
  title: string;
  description: string;
  image?: string | null;
  event_date?: string | null;
  hospital_id?: number | null;
  is_active: boolean;
  display_order: number;
  created_at?: string;
  updated_at?: string;
};

const emptyForm = {
  title: '',
  description: '',
  image: '',
  event_date: '',
  hospital_id: '' as number | string,
  display_order: 1,
  is_active: true,
};

const AdminSocialResponsibility = () => {
  const { t } = useTranslation();
  const [activities, setActivities] = useState<CsrActivity[]>([]);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [hospitalFilter, setHospitalFilter] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingActivity, setEditingActivity] = useState<CsrActivity | null>(null);
  const [formData, setFormData] = useState(emptyForm);

  useEffect(() => {
    fetchActivities();
    fetchHospitals();
  }, []);

  const fetchHospitals = async () => {
    try {
      const { data, error } = await supabase
        .from('hospitals')
        .select('*')
        .order('display_order', { ascending: true });
      if (error) throw error;
      setHospitals(data || []);
    } catch (error) {
      console.error('Error fetching hospitals:', error);
    }
  };

  const fetchActivities = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('social_responsibility_activities')
        .select('*')
        .order('display_order', { ascending: true })
        .order('created_at', { ascending: true });
      if (error) throw error;
      setActivities(data || []);
    } catch (error) {
      console.error('Error fetching social responsibility activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const hospitalName = (id?: number | string | null) =>
    hospitals.find((h) => String(h.id) === String(id))?.name || '';

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImage(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).slice(2)}-${Date.now()}.${fileExt}`;
      const filePath = `csr-images/${fileName}`;
      const { error: uploadError } = await supabase.storage
        .from('article-images')
        .upload(filePath, file);
      if (uploadError) {
        alert(t('admin.csr.imageUploadError', 'Resim yüklenirken hata oluştu: ') + uploadError.message);
        return;
      }
      const { data } = supabase.storage.from('article-images').getPublicUrl(filePath);
      setFormData((prev) => ({ ...prev, image: data.publicUrl }));
    } catch (error: any) {
      alert(t('admin.csr.imageUploadError', 'Resim yüklenirken hata oluştu: ') + (error?.message || ''));
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setSaving(true);
      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        image: formData.image.trim() || null,
        event_date: formData.event_date || null,
        // Boş seçim = etkinlik tüm şubeler için geçerli
        hospital_id: formData.hospital_id ? Number(formData.hospital_id) : null,
        display_order: formData.display_order,
        is_active: formData.is_active,
        updated_at: new Date().toISOString(),
      };

      if (editingActivity) {
        const { error } = await supabase
          .from('social_responsibility_activities')
          .update(payload)
          .eq('id', editingActivity.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('social_responsibility_activities')
          .insert([payload]);
        if (error) throw error;
      }

      setShowForm(false);
      setEditingActivity(null);
      setFormData(emptyForm);
      await fetchActivities();
      alert(editingActivity
        ? t('admin.csr.updated', 'Etkinlik güncellendi!')
        : t('admin.csr.added', 'Etkinlik eklendi!'));
    } catch (error) {
      console.error('Error saving activity:', error);
      alert(t('admin.csr.saveError', 'Etkinlik kaydedilirken hata oluştu!'));
    } finally {
      setSaving(false);
    }
  };

  const deleteActivity = async (id: number) => {
    if (!confirm(t('admin.csr.confirmDelete', 'Bu etkinliği silmek istediğinizden emin misiniz?'))) return;

    try {
      const { error } = await supabase.from('social_responsibility_activities').delete().eq('id', id);
      if (error) throw error;
      setActivities(activities.filter((a) => a.id !== id));
      alert(t('admin.csr.deleted', 'Etkinlik silindi!'));
    } catch (error) {
      console.error('Error deleting activity:', error);
      alert(t('admin.csr.deleteError', 'Etkinlik silinirken hata oluştu!'));
    }
  };

  const toggleStatus = async (id: number, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('social_responsibility_activities')
        .update({ is_active: !currentStatus, updated_at: new Date().toISOString() })
        .eq('id', id);
      if (error) throw error;
      setActivities(activities.map((a) =>
        a.id === id ? { ...a, is_active: !currentStatus } : a
      ));
    } catch (error) {
      console.error('Error toggling status:', error);
      alert(t('admin.statusError', 'Durum güncellenirken hata oluştu!'));
    }
  };

  const editActivity = (activity: CsrActivity) => {
    setEditingActivity(activity);
    setFormData({
      title: activity.title,
      description: activity.description,
      image: activity.image || '',
      event_date: activity.event_date || '',
      hospital_id: activity.hospital_id ?? '',
      display_order: activity.display_order,
      is_active: activity.is_active,
    });
    setShowForm(true);
  };

  const openNewForm = () => {
    setEditingActivity(null);
    const scoped = hospitalFilter
      ? activities.filter((a) => String(a.hospital_id) === hospitalFilter)
      : activities;
    setFormData({
      ...emptyForm,
      hospital_id: hospitalFilter || '',
      display_order: scoped.length > 0
        ? Math.max(...scoped.map((a) => a.display_order || 0)) + 1
        : 1,
    });
    setShowForm(true);
  };

  const formatDate = (date?: string | null) => {
    if (!date) return '';
    try {
      return new Date(date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
    } catch {
      return date;
    }
  };

  const filteredActivities = activities.filter((a) => {
    const matchesSearch =
      a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesHospital = !hospitalFilter || String(a.hospital_id) === hospitalFilter;
    return matchesSearch && matchesHospital;
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
        <h1 className="text-2xl font-semibold text-primary">
          {t('admin.csr.title', 'Sosyal Sorumluluk Projeleri')}
        </h1>
        <button
          onClick={openNewForm}
          className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors flex items-center"
        >
          <FaPlus className="mr-2" />
          {t('admin.csr.new', 'Yeni Etkinlik')}
        </button>
      </div>

      <p className="text-sm text-gray-500 mb-6">
        {t('admin.csr.subtitle', 'Koruyucu sağlık ve sağlığın geliştirilmesine yönelik etkinlikler. Sitede "Sosyal Sorumluluk Projeleri" sayfasında yayınlanır.')}
      </p>

      {/* Search & Şube Filtresi */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder={t('admin.csr.searchPlaceholder', 'Etkinlik ara...')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>
        <select
          value={hospitalFilter}
          onChange={(e) => setHospitalFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary sm:w-64"
        >
          <option value="">{t('admin.csr.allBranches', 'Tüm Şubeler')}</option>
          {hospitals.map((h) => (
            <option key={h.id} value={h.id}>{h.name}</option>
          ))}
        </select>
      </div>

      {/* Activities Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredActivities.map((activity) => (
          <div key={activity.id} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow flex flex-col">
            {activity.image && (
              <img
                src={activity.image}
                alt={activity.title}
                className="w-full h-40 object-cover"
                loading="lazy"
              />
            )}
            <div className="p-6 flex flex-col flex-1">
              <div className="flex items-center justify-between mb-3">
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${activity.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                  {activity.is_active ? t('admin.active', 'Aktif') : t('admin.inactive', 'Pasif')}
                </span>
                <div className="flex space-x-2 items-center">
                  <button
                    onClick={() => toggleStatus(activity.id, activity.is_active)}
                    className={`transition-colors ${activity.is_active ? 'text-green-600 hover:text-green-800' : 'text-gray-400 hover:text-gray-600'}`}
                    title={activity.is_active ? t('admin.deactivate', 'Pasif yap') : t('admin.activate', 'Aktif yap')}
                  >
                    {activity.is_active ? <FaEye /> : <FaEyeSlash />}
                  </button>
                  <button
                    onClick={() => editActivity(activity)}
                    className="text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => deleteActivity(activity.id)}
                    className="text-red-600 hover:text-red-800 transition-colors"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>

              <h3 className="text-lg font-semibold text-primary mb-2">{activity.title}</h3>
              <p className="text-gray-600 text-sm mb-4 line-clamp-3 flex-1">{activity.description}</p>

              <div className="flex flex-wrap gap-2 mb-2">
                <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                  {hospitalName(activity.hospital_id) || t('admin.csr.allBranches', 'Tüm Şubeler')}
                </span>
                {activity.event_date && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700">
                    <FaCalendarAlt className="text-[10px]" />
                    {formatDate(activity.event_date)}
                  </span>
                )}
              </div>

              <div className="text-xs text-gray-500">
                {t('admin.label.order', 'Sıra')}: {activity.display_order || 0}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredActivities.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">🤝</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">{t('admin.csr.notFound', 'Etkinlik bulunamadı')}</h3>
          <p className="text-gray-500 mb-4">
            {searchTerm
              ? t('admin.searchNoResults', 'Arama kriterlerinize uygun kayıt bulunamadı.')
              : t('admin.csr.empty', 'Henüz hiç etkinlik eklenmemiş.')}
          </p>
          <button
            onClick={openNewForm}
            className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors inline-flex items-center"
          >
            <FaPlus className="mr-2" />
            {t('admin.csr.addFirst', 'İlk Etkinliği Ekle')}
          </button>
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4">
              {editingActivity
                ? t('admin.csr.edit', 'Etkinlik Düzenle')
                : t('admin.csr.new', 'Yeni Etkinlik')}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('admin.csr.hospital', 'Şube')}
                </label>
                <select
                  value={formData.hospital_id}
                  onChange={(e) => setFormData({ ...formData, hospital_id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">{t('admin.csr.allBranchesOption', 'Tüm Şubeler (genel etkinlik)')}</option>
                  {hospitals.map((h) => (
                    <option key={h.id} value={h.id}>{h.name}</option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  {t('admin.csr.hospitalHint', 'Şube seçilmezse etkinlik tüm şubelerin listesinde görünür.')}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('admin.csr.name', 'Etkinlik Başlığı')}
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
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('admin.csr.eventDate', 'Etkinlik Tarihi (isteğe bağlı)')}
                </label>
                <input
                  type="date"
                  value={formData.event_date}
                  onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              {/* Görsel */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('admin.csr.image', 'Etkinlik Görseli (isteğe bağlı)')}
                </label>
                <label
                  htmlFor="csr-image-upload"
                  className={`flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-primary transition-colors ${uploadingImage ? 'opacity-60 pointer-events-none' : ''}`}
                >
                  <FaImage className="text-xl text-gray-400 mb-1" />
                  <span className="text-sm text-gray-500">
                    {uploadingImage
                      ? t('admin.uploading', 'Yükleniyor...')
                      : t('admin.csr.selectImage', 'Bilgisayardan resim seç / sürükle')}
                  </span>
                  <input
                    id="csr-image-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploadingImage}
                    className="hidden"
                  />
                </label>
                <input
                  type="url"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary mt-2"
                  placeholder={t('admin.csr.imageUrlPlaceholder', 'veya resim URL\'si girin')}
                />
                {formData.image && (
                  <img
                    src={formData.image}
                    alt={t('admin.preview', 'Önizleme')}
                    className="mt-2 w-full h-32 object-cover rounded-lg"
                  />
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('admin.label.displayOrder', 'Görüntüleme Sırası')}
                  </label>
                  <input
                    type="number"
                    value={formData.display_order}
                    onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    min="0"
                    required
                  />
                </div>

                <div className="flex items-center pt-6">
                  <input
                    type="checkbox"
                    id="csr_is_active"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="mr-2"
                  />
                  <label htmlFor="csr_is_active" className="text-sm font-medium text-gray-700">
                    {t('admin.label.active', 'Aktif')}
                  </label>
                </div>
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
                  disabled={saving}
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark flex items-center disabled:opacity-60"
                >
                  <FaSave className="mr-2" />
                  {editingActivity ? t('admin.update', 'Güncelle') : t('admin.create', 'Oluştur')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSocialResponsibility;
