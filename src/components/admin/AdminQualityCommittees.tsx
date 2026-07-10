import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FaPlus, FaEdit, FaTrash, FaSearch, FaSave, FaEye, FaEyeSlash } from 'react-icons/fa';
import { supabase } from '../../lib/supabase';
import type { Hospital } from '../../lib/supabase';
import { COMMITTEE_ICONS, DEFAULT_COMMITTEE_ICON } from '../../lib/qualityCommittees';
import type { QualityCommittee } from '../../lib/qualityCommittees';

const emptyForm = {
  title: '',
  description: '',
  icon: DEFAULT_COMMITTEE_ICON,
  display_order: 1,
  is_active: true,
  hospital_id: '' as number | string,
};

const AdminQualityCommittees = () => {
  const { t } = useTranslation();
  const [committees, setCommittees] = useState<QualityCommittee[]>([]);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [hospitalFilter, setHospitalFilter] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingCommittee, setEditingCommittee] = useState<QualityCommittee | null>(null);
  const [formData, setFormData] = useState(emptyForm);

  useEffect(() => {
    fetchCommittees();
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

  const fetchCommittees = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('quality_committees')
        .select('*')
        .order('display_order', { ascending: true })
        .order('created_at', { ascending: true });

      if (error) throw error;
      setCommittees(data || []);
    } catch (error) {
      console.error('Error fetching quality committees:', error);
    } finally {
      setLoading(false);
    }
  };

  const hospitalName = (id?: number | string | null) =>
    hospitals.find((h) => String(h.id) === String(id))?.name || '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (!formData.hospital_id) {
        alert(t('admin.qualityCommittees.hospitalRequired', 'Lütfen bir şube seçin!'));
        return;
      }

      setSaving(true);
      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        icon: formData.icon,
        display_order: formData.display_order,
        is_active: formData.is_active,
        hospital_id: formData.hospital_id,
        updated_at: new Date().toISOString(),
      };

      if (editingCommittee) {
        const { error } = await supabase
          .from('quality_committees')
          .update(payload)
          .eq('id', editingCommittee.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('quality_committees')
          .insert([payload]);
        if (error) throw error;
      }

      setShowForm(false);
      setEditingCommittee(null);
      setFormData(emptyForm);
      await fetchCommittees();
      alert(editingCommittee
        ? t('admin.qualityCommittees.updated', 'Komite güncellendi!')
        : t('admin.qualityCommittees.added', 'Komite eklendi!'));
    } catch (error) {
      console.error('Error saving committee:', error);
      alert(t('admin.qualityCommittees.saveError', 'Komite kaydedilirken hata oluştu!'));
    } finally {
      setSaving(false);
    }
  };

  const deleteCommittee = async (id: number) => {
    if (!confirm(t('admin.qualityCommittees.confirmDelete', 'Bu komiteyi silmek istediğinizden emin misiniz?'))) return;

    try {
      const { error } = await supabase.from('quality_committees').delete().eq('id', id);
      if (error) throw error;
      setCommittees(committees.filter(c => c.id !== id));
      alert(t('admin.qualityCommittees.deleted', 'Komite silindi!'));
    } catch (error) {
      console.error('Error deleting committee:', error);
      alert(t('admin.qualityCommittees.deleteError', 'Komite silinirken hata oluştu!'));
    }
  };

  const toggleStatus = async (id: number, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('quality_committees')
        .update({ is_active: !currentStatus, updated_at: new Date().toISOString() })
        .eq('id', id);
      if (error) throw error;
      setCommittees(committees.map(c =>
        c.id === id ? { ...c, is_active: !currentStatus } : c
      ));
    } catch (error) {
      console.error('Error toggling status:', error);
      alert(t('admin.statusError', 'Durum güncellenirken hata oluştu!'));
    }
  };

  const editCommittee = (committee: QualityCommittee) => {
    setEditingCommittee(committee);
    setFormData({
      title: committee.title,
      description: committee.description,
      icon: committee.icon || DEFAULT_COMMITTEE_ICON,
      display_order: committee.display_order,
      is_active: committee.is_active,
      hospital_id: committee.hospital_id ?? '',
    });
    setShowForm(true);
  };

  const openNewForm = () => {
    setEditingCommittee(null);
    const scoped = hospitalFilter
      ? committees.filter((c) => String(c.hospital_id) === hospitalFilter)
      : committees;
    setFormData({
      ...emptyForm,
      hospital_id: hospitalFilter || hospitals[0]?.id || '',
      display_order: scoped.length > 0
        ? Math.max(...scoped.map(c => c.display_order || 0)) + 1
        : 1,
    });
    setShowForm(true);
  };

  const renderIcon = (iconKey: string, className = '') => {
    const Icon = COMMITTEE_ICONS[iconKey] || COMMITTEE_ICONS[DEFAULT_COMMITTEE_ICON];
    return <Icon className={className} />;
  };

  const filteredCommittees = committees.filter(c => {
    const matchesSearch =
      c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesHospital = !hospitalFilter || String(c.hospital_id) === hospitalFilter;
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
        <h1 className="text-2xl font-semibold text-primary">{t('admin.qualityCommittees.title', 'Kalite Komiteleri')}</h1>
        <button
          onClick={openNewForm}
          className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors flex items-center"
        >
          <FaPlus className="mr-2" />
          {t('admin.qualityCommittees.new', 'Yeni Komite')}
        </button>
      </div>

      {/* Search & Şube Filtresi */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder={t('admin.qualityCommittees.searchPlaceholder', 'Komite ara...')}
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
          <option value="">{t('admin.qualityCommittees.allBranches', 'Tüm Şubeler')}</option>
          {hospitals.map((h) => (
            <option key={h.id} value={h.id}>{h.name}</option>
          ))}
        </select>
      </div>

      {/* Committees Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCommittees.map((committee) => (
          <div key={committee.id} className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center text-xl">
                {renderIcon(committee.icon)}
              </div>
              <div className="flex space-x-2 items-center">
                <button
                  onClick={() => toggleStatus(committee.id, committee.is_active)}
                  className={`transition-colors ${committee.is_active ? 'text-green-600 hover:text-green-800' : 'text-gray-400 hover:text-gray-600'}`}
                  title={committee.is_active ? t('admin.deactivate', 'Pasif yap') : t('admin.activate', 'Aktif yap')}
                >
                  {committee.is_active ? <FaEye /> : <FaEyeSlash />}
                </button>
                <button
                  onClick={() => editCommittee(committee)}
                  className="text-blue-600 hover:text-blue-800 transition-colors"
                >
                  <FaEdit />
                </button>
                <button
                  onClick={() => deleteCommittee(committee.id)}
                  className="text-red-600 hover:text-red-800 transition-colors"
                >
                  <FaTrash />
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-primary">{committee.title}</h3>
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0 ml-2 ${committee.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                {committee.is_active ? t('admin.active', 'Aktif') : t('admin.inactive', 'Pasif')}
              </span>
            </div>

            <p className="text-gray-600 text-sm mb-4 line-clamp-3">{committee.description}</p>

            {hospitalName(committee.hospital_id) && (
              <div className="inline-block mb-2 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                {hospitalName(committee.hospital_id)}
              </div>
            )}

            <div className="text-xs text-gray-500">
              {t('admin.label.order', 'Sıra')}: {committee.display_order || 0}
            </div>
          </div>
        ))}
      </div>

      {filteredCommittees.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">🏛️</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">{t('admin.qualityCommittees.notFound', 'Komite bulunamadı')}</h3>
          <p className="text-gray-500 mb-4">
            {searchTerm
              ? t('admin.searchNoResults', 'Arama kriterlerinize uygun kayıt bulunamadı.')
              : t('admin.qualityCommittees.empty', 'Henüz hiç komite eklenmemiş.')}
          </p>
          <button
            onClick={openNewForm}
            className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors inline-flex items-center"
          >
            <FaPlus className="mr-2" />
            {t('admin.qualityCommittees.addFirst', 'İlk Komiteyi Ekle')}
          </button>
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4">
              {editingCommittee
                ? t('admin.qualityCommittees.edit', 'Komite Düzenle')
                : t('admin.qualityCommittees.new', 'Yeni Komite')}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('admin.qualityCommittees.hospital', 'Şube')}
                </label>
                <select
                  value={formData.hospital_id}
                  onChange={(e) => setFormData({ ...formData, hospital_id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                >
                  <option value="" disabled>{t('admin.qualityCommittees.selectHospital', 'Şube seçin')}</option>
                  {hospitals.map((h) => (
                    <option key={h.id} value={h.id}>{h.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('admin.qualityCommittees.name', 'Komite Adı')}
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
                  {t('admin.label.icon', 'İkon')}
                </label>
                <div className="grid grid-cols-7 sm:grid-cols-9 gap-2 border border-gray-200 rounded-lg p-3 max-h-40 overflow-y-auto">
                  {Object.keys(COMMITTEE_ICONS).map((key) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setFormData({ ...formData, icon: key })}
                      className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg transition-colors ${formData.icon === key
                        ? 'bg-primary text-white shadow'
                        : 'bg-gray-100 text-gray-600 hover:bg-primary/10 hover:text-primary'
                        }`}
                      title={key}
                    >
                      {renderIcon(key)}
                    </button>
                  ))}
                </div>
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
                    id="is_active"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="mr-2"
                  />
                  <label htmlFor="is_active" className="text-sm font-medium text-gray-700">
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
                  {editingCommittee ? t('admin.update', 'Güncelle') : t('admin.create', 'Oluştur')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminQualityCommittees;
