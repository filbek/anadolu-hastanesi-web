import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FaPlus, FaEdit, FaTrash, FaSearch, FaTimes, FaSave, FaImage, FaUpload } from 'react-icons/fa';
import { getAllHeroSlides, createHeroSlide, updateHeroSlide, deleteHeroSlide, uploadHeroSlideImage, HeroSlide } from '../../services/heroSlideService';

const AdminHeroSlides = () => {
  const { t } = useTranslation();
  const [items, setItems] = useState<HeroSlide[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const emptyForm: Omit<HeroSlide, 'id' | 'created_at'> = {
    title: '', subtitle: '', image: '', button_text: t('admin.heroSlides.defaultButton', 'Detaylı Bilgi'),
    button_link: '#', theme_color: 'primary', order_index: 0, is_active: true,
  };
  const [formData, setFormData] = useState(emptyForm);

  const loadItems = async () => {
    setLoading(true);
    const data = await getAllHeroSlides();
    setItems(data);
    setLoading(false);
  };

  useEffect(() => { loadItems(); }, []);

  const filtered = items.filter(i =>
    i.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (i.subtitle || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const resetForm = () => {
    setFormData(emptyForm);
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (item: HeroSlide) => {
    const { id, created_at, ...rest } = item;
    setFormData(rest);
    setEditingId(id);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm(t('admin.confirmDeleteSlide', 'Bu slaytı silmek istediğinizden emin misiniz?'))) return;
    const { error } = await deleteHeroSlide(id);
    if (error) { alert(t('admin.deleteError', 'Silinirken hata oluştu!')); return; }
    await loadItems();
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    try {
      setUploading(true);
      const file = e.target.files[0];
      const { url, error } = await uploadHeroSlideImage(file);
      if (error) throw error;
      if (url) setFormData(prev => ({ ...prev, image: url }));
    } catch (err: any) {
      alert(err.message || t('admin.imageUploadError', 'Resim yüklenirken hata oluştu!'));
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.title.trim() || !formData.image.trim()) {
      alert(t('admin.titleAndImageRequired', 'Başlık ve görsel URL zorunludur!')); return;
    }
    setSaving(true);
    if (editingId) {
      const { error } = await updateHeroSlide(editingId, formData);
      if (error) alert(t('admin.updateError', 'Güncellenirken hata oluştu!'));
    } else {
      const { error } = await createHeroSlide(formData);
      if (error) alert(t('admin.createError', 'Eklenirken hata oluştu!'));
    }
    setSaving(false);
    resetForm();
    await loadItems();
  };

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
        <h1 className="text-2xl font-semibold text-primary">{t('admin.heroSlides.title', 'Hero Slider')}</h1>
        <button onClick={() => { resetForm(); setShowForm(true); }}
          className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors flex items-center">
          <FaPlus className="mr-2" /> {t('admin.heroSlides.new', 'Yeni Slayt')}
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="relative">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder={t('admin.searchPlaceholder', 'Ara...')} value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
        </div>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">{editingId ? t('admin.heroSlides.edit', 'Slayt Düzenle') : t('admin.heroSlides.new', 'Yeni Slayt')}</h2>
            <button onClick={resetForm} className="text-gray-400 hover:text-gray-600"><FaTimes /></button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('admin.label.title', 'Başlık')}</label>
              <input type="text" value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('admin.label.subtitle', 'Alt Başlık')}</label>
              <input type="text" value={formData.subtitle || ''}
                onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('admin.label.image', 'Görsel')}</label>
              <div className="flex gap-2">
                <input type="text" value={formData.image} placeholder={t('admin.label.urlOrUpload', 'URL veya yükle')}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
                <label className="cursor-pointer px-3 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors flex items-center">
                  {uploading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-primary"></div>
                  ) : (
                    <FaUpload className="text-gray-600" />
                  )}
                  <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={uploading} />
                </label>
              </div>
              {formData.image && (
                <img src={formData.image} alt="Preview" className="mt-2 h-20 rounded-lg object-cover" />
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('admin.label.buttonText', 'Buton Metni')}</label>
              <input type="text" value={formData.button_text || ''}
                onChange={(e) => setFormData({ ...formData, button_text: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('admin.label.buttonLink', 'Buton Link')}</label>
              <input type="text" value={formData.button_link || ''}
                onChange={(e) => setFormData({ ...formData, button_link: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('admin.label.order', 'Sıra')}</label>
                <input type="number" value={formData.order_index}
                  onChange={(e) => setFormData({ ...formData, order_index: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>
              <div className="flex items-end pb-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="w-5 h-5 text-primary rounded" />
                  <span className="text-sm text-gray-700">{t('admin.label.active', 'Aktif')}</span>
                </label>
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-4">
            <button onClick={resetForm} className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50">{t('admin.cancel', 'İptal')}</button>
            <button onClick={handleSubmit} disabled={saving}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark flex items-center disabled:opacity-50">
              {saving && <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-white mr-2"></div>}
              <FaSave className="mr-2" /> {editingId ? t('admin.update', 'Güncelle') : t('admin.save', 'Kaydet')}
            </button>
          </div>
        </div>
      )}

      {/* List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((item) => (
          <div key={item.id} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
            <div className="h-40 bg-gray-100 relative">
              {item.image ? (
                <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400"><FaImage size={32} /></div>
              )}
              {!item.is_active && (
                <span className="absolute top-2 right-2 bg-gray-800 text-white text-xs px-2 py-1 rounded">{t('admin.passive', 'Pasif')}</span>
              )}
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-gray-900 mb-1">{item.title}</h3>
              <p className="text-sm text-gray-500 mb-3 line-clamp-2">{item.subtitle}</p>
              <div className="flex justify-end gap-2">
                <button onClick={() => handleEdit(item)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"><FaEdit /></button>
                <button onClick={() => handleDelete(item.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg"><FaTrash /></button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">🖼️</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">{t('admin.heroSlides.notFound', 'Slayt bulunamadı')}</h3>
          <p className="text-gray-500 mb-4">
            {searchTerm ? t('admin.searchNoResults', 'Arama kriterlerinize uygun slayt bulunamadı.') : t('admin.heroSlides.empty', 'Henüz hiç slayt eklenmemiş.')}
          </p>
        </div>
      )}
    </div>
  );
};

export default AdminHeroSlides;
