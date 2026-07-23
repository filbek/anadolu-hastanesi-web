import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { FaSave, FaArrowLeft, FaImage, FaStethoscope, FaUpload, FaTrash, FaEye, FaGripVertical } from 'react-icons/fa';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { uploadDepartmentImage } from '../../services/departmentService';
import TranslationsPanel from './TranslationsPanel';
import type { Translations } from '../../lib/supabase';

interface Department {
  id?: number;
  name: string;
  slug: string;
  description: string;
  icon: string;
  image_url: string;
  images?: string[];
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
    images: [],
    color: '#1e40af',
    is_active: true,
    display_order: 1,
    translations: {}
  });
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploadingMainImage, setUploadingMainImage] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const mainImageRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);

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
      setFormData({ ...department, images: department.images || [] });
    } else if (id) {
      fetchDepartment(parseInt(id));
    }
  }, [department, id]);

  const fetchDepartment = async (departmentId: number) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.from('departments').select('*').eq('id', departmentId).single();
      if (error) throw error;
      if (data) setFormData({ ...(data as Department), images: (data as Department).images || [] });
    } catch (error) {
      console.error('Error fetching department:', error);
      alert(t('admin.errorFetching', 'Bölüm bilgileri yüklenemedi!'));
    } finally {
      setLoading(false);
    }
  };

  const resizeImage = async (
    file: File,
    maxWidth = 1600,
    maxHeight = 1600,
    quality = 0.85
  ): Promise<File> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(file);

      img.onload = () => {
        URL.revokeObjectURL(url);
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const resizedFile = new File(
                [blob],
                file.name.replace(/\.[^.]+$/, '.jpg'),
                { type: 'image/jpeg', lastModified: Date.now() }
              );
              resolve(resizedFile);
            } else {
              reject(new Error('Canvas toBlob failed'));
            }
          },
          'image/jpeg',
          quality
        );
      };

      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('Image load failed'));
      };

      img.src = url;
    });
  };

  const compressImage = async (file: File, targetKB = 400): Promise<File> => {
    let compressed = await resizeImage(file, 1600, 1600, 0.85);

    if (compressed.size > targetKB * 1024) {
      compressed = await resizeImage(file, 1200, 1200, 0.75);
    }

    if (compressed.size > targetKB * 1024) {
      compressed = await resizeImage(file, 800, 800, 0.65);
    }

    return compressed;
  };

  const handleMainImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert(t('admin.settings.invalidImage', 'Lütfen geçerli bir resim dosyası seçin!'));
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      alert(t('admin.settings.logoSizeError', 'Dosya boyutu 2MB\'dan küçük olmalıdır!'));
      return;
    }

    try {
      setUploadingMainImage(true);
      const compressedFile = await compressImage(file);
      const { url, error } = await uploadDepartmentImage(compressedFile);
      if (error || !url) throw error;
      setFormData(prev => ({ ...prev, image_url: url }));
    } catch (err) {
      console.error('Main image upload error:', err);
      alert(t('admin.departmentForm.imageUploadError', 'Resim yüklenirken hata oluştu!'));
    } finally {
      setUploadingMainImage(false);
      if (mainImageRef.current) mainImageRef.current.value = '';
    }
  };

  const handleGalleryUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    const invalid = files.filter(f => !f.type.startsWith('image/'));
    if (invalid.length > 0) {
      alert(t('admin.settings.invalidImage', 'Lütfen geçerli resim dosyaları seçin!'));
      return;
    }

    const oversized = files.filter(f => f.size > 2 * 1024 * 1024);
    if (oversized.length > 0) {
      alert(t('admin.settings.logoSizeError', 'Dosya boyutu 2MB\'dan küçük olmalıdır!'));
      return;
    }

    setUploadingGallery(true);
    const newImages: string[] = [];

    for (const file of files) {
      try {
        const compressedFile = await compressImage(file);
        const { url, error } = await uploadDepartmentImage(compressedFile);
        if (error || !url) throw error;
        newImages.push(url);
      } catch (err) {
        console.error('Gallery upload error:', err);
      }
    }

    setFormData(prev => ({ ...prev, images: [...(prev.images || []), ...newImages] }));
    setUploadingGallery(false);
    if (galleryRef.current) galleryRef.current.value = '';
  };

  const removeGalleryImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: (prev.images || []).filter((_, i) => i !== index)
    }));
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

            <div className="flex items-center space-x-4 mb-3">
              <input
                ref={mainImageRef}
                type="file"
                accept="image/*"
                onChange={handleMainImageUpload}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => mainImageRef.current?.click()}
                disabled={uploadingMainImage}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {uploadingMainImage ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    {t('admin.uploading', 'Yükleniyor...')}
                  </>
                ) : (
                  <>
                    <FaUpload className="mr-2" />
                    {'Resim Yükle'}
                  </>
                )}
              </button>
              <span className="text-sm text-gray-500">PNG, JPG (Max: 2MB)</span>
            </div>

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

          {/* Gallery */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-primary mb-4 flex items-center">
              <FaImage className="mr-2" />
              {t('admin.label.gallery', 'Bölüm Galerisi')}
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              {t('admin.departmentForm.galleryHint', 'Bölüm sayfasındaki "Hakkında" ve "Tedavi Süreci" sekmelerinde gösterilen görseller. Sıralamayı sürükleyerek değiştirebilirsiniz.')}
            </p>

            {formData.images && formData.images.length > 0 && (
              <div className="grid grid-cols-3 gap-3 mb-3">
                {formData.images.map((img, index) => (
                  <div
                    key={index}
                    draggable
                    onDragStart={() => setDraggedIndex(index)}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setDragOverIndex(index);
                    }}
                    onDragLeave={() => setDragOverIndex(null)}
                    onDrop={(e) => {
                      e.preventDefault();
                      if (draggedIndex === null || draggedIndex === index) return;
                      const images = [...(formData.images || [])];
                      const [moved] = images.splice(draggedIndex, 1);
                      images.splice(index, 0, moved);
                      setFormData(prev => ({ ...prev, images }));
                      setDraggedIndex(null);
                      setDragOverIndex(null);
                    }}
                    onDragEnd={() => {
                      setDraggedIndex(null);
                      setDragOverIndex(null);
                    }}
                    className={`
                      relative group rounded-lg overflow-hidden border-2 transition-all
                      ${draggedIndex === index ? 'opacity-50 scale-95 border-dashed border-blue-400' : 'border-transparent'}
                      ${dragOverIndex === index && draggedIndex !== index ? 'border-blue-500 scale-105 shadow-lg' : ''}
                      cursor-grab active:cursor-grabbing
                    `}
                  >
                    <img
                      src={img}
                      alt={`Gallery ${index + 1}`}
                      className="w-full h-24 object-cover"
                    />
                    <div className="absolute top-1 left-1 bg-black/40 text-white p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                      <FaGripVertical className="text-xs" />
                    </div>
                    <div className="absolute top-1 right-1 bg-black/60 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                      {index + 1}
                    </div>
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
                      <button
                        type="button"
                        onClick={() => window.open(img, '_blank')}
                        className="text-white hover:text-blue-300"
                      >
                        <FaEye />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeGalleryImage(index)}
                        className="text-white hover:text-red-300"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-center space-x-4">
              <input
                ref={galleryRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleGalleryUpload}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => galleryRef.current?.click()}
                disabled={uploadingGallery}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {uploadingGallery ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    {t('admin.uploading', 'Yükleniyor...')}
                  </>
                ) : (
                  <>
                    <FaUpload className="mr-2" />
                    {'Galeri Yükle'}
                  </>
                )}
              </button>
              <span className="text-sm text-gray-500">Çoklu seçim (Max: 2MB/her resim)</span>
            </div>
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
