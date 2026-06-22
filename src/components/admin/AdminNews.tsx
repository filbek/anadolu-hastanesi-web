import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FaPlus, FaEdit, FaTrash, FaSearch, FaTimes, FaSave, FaImage, FaUpload } from 'react-icons/fa';
import { getAllNewsItems, createNewsItem, updateNewsItem, deleteNewsItem, uploadNewsImage, NewsItem } from '../../services/newsService';

const AdminNews = () => {
  const { t } = useTranslation();
  const [items, setItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const emptyForm: Omit<NewsItem, 'id' | 'created_at'> = {
    title: '', slug: '', excerpt: '', content: '', image: '',
    category: 'Kurumsal', is_published: true,
    published_at: new Date().toISOString().split('T')[0] + 'T00:00:00Z',
  };
  const [formData, setFormData] = useState(emptyForm);

  const loadItems = async () => {
    setLoading(true);
    const data = await getAllNewsItems();
    setItems(data);
    setLoading(false);
  };

  useEffect(() => { loadItems(); }, []);

  const filtered = items.filter(i =>
    i.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (i.category || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const resetForm = () => {
    setFormData(emptyForm);
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (item: NewsItem) => {
    const { id, created_at, ...rest } = item;
    setFormData(rest);
    setEditingId(id);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm(t('admin.confirmDeleteNews', 'Bu haberi silmek istediğinizden emin misiniz?'))) return;
    const { error } = await deleteNewsItem(id);
    if (error) { alert(t('admin.deleteError', 'Silinirken hata oluştu!')); return; }
    await loadItems();
  };

  const generateSlug = (title: string) => {
    return title.toLowerCase()
      .replace(/[^a-z0-9ğüşıöç\s]/g, '')
      .replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's')
      .replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ç/g, 'c')
      .replace(/\s+/g, '-');
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    try {
      setUploading(true);
      const file = e.target.files[0];
      const { url, error } = await uploadNewsImage(file);
      if (error) throw error;
      if (url) setFormData(prev => ({ ...prev, image: url }));
    } catch (err: any) {
      alert(err.message || t('admin.imageUploadError', 'Resim yüklenirken hata oluştu!'));
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.title.trim() || !formData.slug.trim()) {
      alert(t('admin.titleAndSlugRequired', 'Başlık ve slug zorunludur!')); return;
    }
    setSaving(true);
    if (editingId) {
      const { error } = await updateNewsItem(editingId, formData);
      if (error) alert(t('admin.updateError', 'Güncellenirken hata oluştu!'));
    } else {
      const { error } = await createNewsItem(formData);
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
        <h1 className="text-2xl font-semibold text-primary">{t('admin.news.title', 'Haberler')}</h1>
        <button onClick={() => { resetForm(); setShowForm(true); }}
          className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors flex items-center">
          <FaPlus className="mr-2" /> {t('admin.news.new', 'Yeni Haber')}
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="relative">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder={t('admin.searchPlaceholder', 'Ara...')} value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
        </div>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">{editingId ? t('admin.news.edit', 'Haber Düzenle') : t('admin.news.new', 'Yeni Haber')}</h2>
            <button onClick={resetForm} className="text-gray-400 hover:text-gray-600"><FaTimes /></button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('admin.label.title', 'Başlık')}</label>
              <input type="text" value={formData.title}
                onChange={(e) => {
                  const title = e.target.value;
                  setFormData({ ...formData, title, slug: editingId ? formData.slug : generateSlug(title) });
                }}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('admin.label.slug', 'Slug')}</label>
              <input type="text" value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('admin.label.category', 'Kategori')}</label>
              <input type="text" value={formData.category || ''}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('admin.label.image', 'Görsel')}</label>
              <div className="flex gap-2">
                <input type="text" value={formData.image || ''} placeholder={t('admin.label.urlOrUpload', 'URL veya yükle')}
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
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('admin.label.publishDate', 'Yayın Tarihi')}</label>
              <input type="datetime-local" value={(formData.published_at || '').replace('Z', '')}
                onChange={(e) => setFormData({ ...formData, published_at: e.target.value + 'Z' })}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>
            <div className="flex items-end pb-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={formData.is_published}
                  onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
                  className="w-5 h-5 text-primary rounded" />
                <span className="text-sm text-gray-700">{t('admin.label.published', 'Yayında')}</span>
              </label>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('admin.label.excerpt', 'Özet')}</label>
              <textarea value={formData.excerpt || ''} rows={2}
                onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('admin.label.contentHtml', 'İçerik (HTML)')}</label>
              <textarea value={formData.content || ''} rows={4}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary font-mono text-sm" />
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((item) => (
          <div key={item.id} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
            <div className="h-40 bg-gray-100 relative">
              {item.image ? (
                <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400"><FaImage size={32} /></div>
              )}
              {!item.is_published && (
                <span className="absolute top-2 right-2 bg-gray-800 text-white text-xs px-2 py-1 rounded">{t('admin.draft', 'Taslak')}</span>
              )}
            </div>
            <div className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded">{item.category || t('admin.general', 'Genel')}</span>
                <span className="text-xs text-gray-400">{item.published_at ? new Date(item.published_at).toLocaleDateString('tr-TR') : ''}</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">{item.title}</h3>
              <p className="text-sm text-gray-500 mb-3 line-clamp-2">{item.excerpt}</p>
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
          <div className="text-gray-400 text-6xl mb-4">📰</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">{t('admin.news.notFound', 'Haber bulunamadı')}</h3>
          <p className="text-gray-500">
            {searchTerm ? t('admin.searchNoResults', 'Arama kriterlerinize uygun haber bulunamadı.') : t('admin.news.empty', 'Henüz hiç haber eklenmemiş.')}
          </p>
        </div>
      )}
    </div>
  );
};

export default AdminNews;
