import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FaSave, FaArrowLeft, FaImage, FaStethoscope } from 'react-icons/fa';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import TranslationsPanel from './TranslationsPanel';
import type { Translations } from '../../lib/supabase';

interface Department {
  id?: number;
  name: string;
  slug: string;
  description: string;
  icon: string;
  image_url: string;
  color: string;
  is_active: boolean;
  display_order: number;
  translations?: Translations;
  created_at?: string;
  updated_at?: string;
}

interface DepartmentFormProps {
  department?: Department;
  onSave?: (department: Department) => void;
  onCancel?: () => void;
}

const DepartmentForm = ({ department, onSave, onCancel }: DepartmentFormProps = {}) => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [formData, setFormData] = useState<Department>({
    name: '',
    slug: '',
    description: '',
    icon: 'stethoscope',
    image_url: '',
    color: '#1e40af',
    is_active: true,
    display_order: 1,
    translations: {}
  });
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);

  const iconOptions = [
    { value: 'stethoscope', label: t('admin.departmentForm.iconStethoscope', 'Stetoskop') },
    { value: 'heart', label: t('admin.departmentForm.iconHeart', 'Kalp') },
    { value: 'brain', label: t('admin.departmentForm.iconBrain', 'Beyin') },
    { value: 'bone', label: t('admin.departmentForm.iconBone', 'Kemik') },
    { value: 'eye', label: t('admin.departmentForm.iconEye', 'Göz') },
    { value: 'tooth', label: t('admin.departmentForm.iconTooth', 'Diş') },
    { value: 'baby', label: t('admin.departmentForm.iconBaby', 'Bebek') },
    { value: 'lungs', label: t('admin.departmentForm.iconLungs', 'Akciğer') },
    { value: 'skin', label: t('admin.departmentForm.iconSkin', 'Cilt') },
    { value: 'ear', label: t('admin.departmentForm.iconEar', 'Kulak') },
    { value: 'kidney', label: t('admin.departmentForm.iconKidney', 'Böbrek') },
    { value: 'liver', label: t('admin.departmentForm.iconLiver', 'Karaciğer') }
  ];

  const colorOptions = [
    '#1e40af', '#3b82f6', '#06b6d4', '#10b981', '#84cc16',
    '#f59e0b', '#f97316', '#ef4444', '#ec4899', '#8b5cf6'
  ];

  useEffect(() => {
    if (department) {
      setFormData(department);
    } else if (id) {
      fetchDepartment(parseInt(id));
    }
  }, [department, id]);

  const fetchDepartment = async (departmentId: number) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.from('departments').select('*').eq('id', departmentId).single();
      if (error) throw error;
      if (data) setFormData(data as Department);
    } catch (error) {
      console.error('Error fetching department:', error);
      alert(t('admin.errorFetching', 'Bölüm bilgileri yüklenemedi!'));
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 60);
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setFormData(prev => ({
      ...prev,
      name,
      slug: prev.slug || generateSlug(name)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const departmentData = {
        ...formData,
        updated_at: new Date().toISOString(),
        created_at: formData.created_at || new Date().toISOString()
      };

      if (onSave) {
        onSave(departmentData);
      } else {
        if (id || formData.id) {
          const departmentId = id ? parseInt(id) : formData.id!;
          await supabase.from('departments').update(departmentData).eq('id', departmentId);
        } else {
          await supabase.from('departments').insert([departmentData]);
        }
        navigate('/admin/departments');
      }
    } catch (error) {
      console.error('Error saving department:', error);
      alert(t('admin.departmentForm.saveError', 'Bölüm kaydedilirken hata oluştu!'));
    } finally {
      setSaving(false);
    }
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
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <button
            onClick={() => onCancel ? onCancel() : navigate('/admin/departments')}
            className="mr-4 p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <FaArrowLeft />
          </button>
          <h1 className="text-2xl font-semibold text-primary">
            {department || id ? t('admin.departmentForm.editTitle', 'Bölüm Düzenle') : t('admin.departmentForm.newTitle', 'Yeni Bölüm')}
          </h1>
        </div>
        <button
          onClick={handleSubmit}
          disabled={saving}
          className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors flex items-center disabled:opacity-50"
        >
          <FaSave className="mr-2" />
          {saving ? t('admin.saving', 'Kaydediliyor...') : t('admin.save', 'Kaydet')}
        </button>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('admin.label.departmentName', 'Bölüm Adı')}
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={handleNameChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder={t('admin.label.departmentNamePlaceholder', 'Bölüm adı girin')}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('admin.label.slug', 'URL Slug')}
                </label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="bolum-adi"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('admin.label.description', 'Açıklama')}
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder={t('admin.label.departmentDescriptionPlaceholder', 'Bölüm açıklaması')}
                  required
                />
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Publishing Options */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-primary mb-4">{t('admin.label.publishing', 'Yayınlama')}</h3>

            <div className="space-y-4">
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('admin.label.displayOrder', 'Görüntüleme Sırası')}
                </label>
                <input
                  type="number"
                  value={formData.display_order}
                  onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  min="1"
                  required
                />
              </div>
            </div>
          </div>

          {/* Icon Selection */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-primary mb-4 flex items-center">
              <FaStethoscope className="mr-2" />
              {t('admin.label.icon', 'İkon')}
            </h3>

            <select
              value={formData.icon}
              onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              {iconOptions.map(icon => (
                <option key={icon.value} value={icon.value}>{icon.label}</option>
              ))}
            </select>
          </div>

          {/* Color Selection */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-primary mb-4">{t('admin.label.color', 'Renk')}</h3>

            <div className="grid grid-cols-5 gap-2">
              {colorOptions.map(color => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setFormData({ ...formData, color })}
                  className={`w-8 h-8 rounded-full border-2 ${formData.color === color ? 'border-gray-800' : 'border-transparent'
                    }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>

            <input
              type="color"
              value={formData.color}
              onChange={(e) => setFormData({ ...formData, color: e.target.value })}
              className="w-full mt-3 h-10 border border-gray-300 rounded-lg"
            />
          </div>

          {/* Image */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-primary mb-4 flex items-center">
              <FaImage className="mr-2" />
              {t('admin.label.image', 'Resim')}
            </h3>

            <input
              type="url"
              value={formData.image_url}
              onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="https://example.com/image.jpg"
            />
            {formData.image_url && (
              <img
                src={formData.image_url}
                alt="Preview"
                className="mt-3 w-full h-32 object-cover rounded-lg"
              />
            )}
          </div>
        </div>

        {/* Çeviriler — TR alanları doldurulduktan sonra otomatik üretilebilir */}
        <div className="lg:col-span-3">
          <TranslationsPanel
            source={formData}
            value={formData.translations || {}}
            onChange={(next) => setFormData({ ...formData, translations: next })}
            fields={[
              { key: 'name', label: t('admin.label.departmentName', 'Bölüm Adı'), type: 'text' },
              { key: 'description', label: t('admin.label.description', 'Açıklama'), type: 'textarea' },
            ]}
          />
        </div>
      </form>
    </div>
  );
};

export default DepartmentForm;
