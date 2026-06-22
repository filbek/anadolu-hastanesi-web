import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FaPlus, FaEdit, FaTrash, FaSearch, FaTimes, FaSave, FaImage, FaExternalLinkAlt } from 'react-icons/fa';
import { getAllAccreditations, createAccreditation, updateAccreditation, deleteAccreditation, Accreditation } from '../../services/accreditationService';

const AdminAccreditations = () => {
  const { t } = useTranslation();
  const [items, setItems] = useState<Accreditation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  const emptyForm: Omit<Accreditation, 'id' | 'created_at'> = {
    name: '', logo_url: '', link: '', order_index: 0, is_active: true,
  };
  const [formData, setFormData] = useState(emptyForm);

  const loadItems = async () => {
    setLoading(true);
    const data = await getAllAccreditations();
    setItems(data);
    setLoading(false);
  };

  useEffect(() => { loadItems(); }, []);

  const filtered = items.filter(i =>
    i.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const resetForm = () => {
    setFormData(emptyForm);
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (item: Accreditation) => {
    const { id, created_at, ...rest } = item;
    setFormData(rest);
    setEditingId(id);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm(t('admin.confirmDeleteAccreditation', 'Bu akreditasyonu silmek istediğinizden emin misiniz?'))) return;
    const { error } = await deleteAccreditation(id);
    if (error) { alert(t('admin.deleteError', 'Silinirken hata oluştu!')); return; }
    await loadItems();
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      alert(t('admin.nameRequired', 'İsim zorunludur!')); return;
    }
    setSaving(true);
    if (editingId) {
      const { error } = await updateAccreditation(editingId, formData);
      if (error) alert(t('admin.updateError', 'Güncellenirken hata oluştu!'));
    } else {
      const { error } = await createAccreditation(formData);
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
        <h1 className="text-2xl font-semibold text-primary">{t('admin.accreditations.title', 'Akreditasyonlar')}</h1>
        <button onClick={() => { resetForm(); setShowForm(true); }}
          className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors flex items-center">
          <FaPlus className="mr-2" /> {t('admin.accreditations.new', 'Yeni Akreditasyon')}
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
            <h2 className="text-lg font-semibold">{editingId ? t('admin.accreditations.edit', 'Akreditasyon Düzenle') : t('admin.accreditations.new', 'Yeni Akreditasyon')}</h2>
            <button onClick={resetForm} className="text-gray-400 hover:text-gray-600"><FaTimes /></button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('admin.label.name', 'İsim')}</label>
              <input type="text" value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('admin.label.logoUrl', 'Logo URL')}</label>
              <input type="text" value={formData.logo_url || ''}
                onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('admin.label.link', 'Link')}</label>
              <input type="text" value={formData.link || ''}
                onChange={(e) => setFormData({ ...formData, link: e.target.value })}
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {filtered.map((item) => (
          <div key={item.id} className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4 mb-4">
              {item.logo_url ? (
                <img src={item.logo_url} alt={item.name} className="w-16 h-16 object-contain" />
              ) : (
                <div className="w-16 h-16 rounded-xl bg-ocean-100 flex items-center justify-center text-ocean-500"><FaImage /></div>
              )}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900">{item.name}</h3>
                {item.link && (
                  <a href={item.link} target="_blank" rel="noopener noreferrer" className="text-xs text-primary flex items-center gap-1 hover:underline">
                    <FaExternalLinkAlt size={10} /> {t('admin.accreditations.visitSite', 'Siteyi Ziyaret Et')}
                  </a>
                )}
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button onClick={() => handleEdit(item)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"><FaEdit /></button>
              <button onClick={() => handleDelete(item.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg"><FaTrash /></button>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">🏆</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">{t('admin.accreditations.notFound', 'Akreditasyon bulunamadı')}</h3>
          <p className="text-gray-500">
            {searchTerm ? t('admin.searchNoResults', 'Arama kriterlerinize uygun akreditasyon bulunamadı.') : t('admin.accreditations.empty', 'Henüz hiç akreditasyon eklenmemiş.')}
          </p>
        </div>
      )}
    </div>
  );
};

export default AdminAccreditations;
