import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from 'react-query';
import { FaSave, FaArrowLeft, FaImage, FaMapMarkerAlt, FaPhone, FaEnvelope, FaUpload, FaTrash, FaEye, FaGripVertical, FaStethoscope } from 'react-icons/fa';
import { useParams, useNavigate } from 'react-router-dom';
import TranslationsPanel from './TranslationsPanel';
import { supabase } from '../../lib/supabase';
import { createHospital, updateHospital, uploadHospitalImage } from '../../services/hospitalService';
import { CACHE_KEYS } from '../../services';
import { useDepartments } from '../../hooks/useDepartments';
import { useDoctors } from '../../hooks/useDoctors';
import type { Hospital } from '../../lib/supabase';

type HospitalFormData = Omit<Hospital, 'id' | 'created_at'> & {
  id?: number | string;
  created_at?: string;
};

interface HospitalFormProps {
  hospital?: Hospital;
  onSave?: (hospital: Hospital) => void;
  onCancel?: () => void;
}

const HospitalForm = ({ hospital, onSave, onCancel }: HospitalFormProps = {}) => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<HospitalFormData>({
    name: '',
    slug: '',
    description: '',
    address: '',
    phone: '',
    email: '',
    website: '',
    image_url: '',
    logo_url: '',
    latitude: '',
    longitude: '',
    working_hours: '',
    emergency_phone: '',
    emergency_hours: '',
    transportation_info: '',
    is_active: true,
    display_order: 1,
    images: [],
    department_ids: [],
    translations: {}
  });
  const { data: allDepartments = [] } = useDepartments();
  const { data: allDoctors = [] } = useDoctors();
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploadingMainImage, setUploadingMainImage] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const mainImageRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (hospital) {
      setFormData(prev => normalizeHospitalData({ ...prev, ...hospital }));
    } else if (id) {
      fetchHospital(id);
    }
  }, [hospital, id]);

  const normalizeHospitalData = (data: any): HospitalFormData => ({
    ...data,
    images: data.images || [],
    emergency_hours: data.emergency_hours || '',
    emergency_phone: data.emergency_phone || '',
    logo_url: data.logo_url || '',
    image_url: data.image_url || '',
    website: data.website || '',
    latitude: data.latitude || '',
    longitude: data.longitude || '',
    working_hours: data.working_hours || '',
    transportation_info: data.transportation_info || '',
    meta_title: data.meta_title || '',
    meta_description: data.meta_description || '',
    hero_title: data.hero_title || '',
    hero_subtitle: data.hero_subtitle || '',
    map_url: data.map_url || '',
    department_ids: Array.isArray(data.department_ids) ? data.department_ids.map((n: any) => Number(n)) : [],
    translations: data.translations || {},
  });

  const fetchHospital = async (hospitalId: string | number) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.from('hospitals').select('*').eq('id', hospitalId).single();
      if (error) throw error;
      if (data) setFormData(normalizeHospitalData(data));
    } catch (error) {
      console.error('Error fetching hospital:', error);
      alert(t('admin.errorFetching', 'Hastane bilgileri yüklenemedi!'));
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

  // Bu şubede zaten aktif doktoru olan bölüm id'leri — bunlar sekmede
  // otomatik gösterilir, ayrıca işaretlemeye gerek yoktur.
  const currentHospitalId = id ?? formData.id;
  const autoShownDeptIds = new Set<number>(
    (allDoctors as any[])
      .filter((d) => currentHospitalId != null && String(d.hospital_id) === String(currentHospitalId) && d.department_id != null)
      .map((d) => Number(d.department_id))
  );

  const toggleDepartment = (deptId: number) => {
    setFormData(prev => {
      const current = prev.department_ids || [];
      const exists = current.includes(deptId);
      return {
        ...prev,
        department_ids: exists ? current.filter(id => id !== deptId) : [...current, deptId],
      };
    });
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setFormData(prev => ({
      ...prev,
      name,
      slug: prev.slug || generateSlug(name)
    }));
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
    // WhatsApp tarzı: önce 1600px / kalite 0.85
    let compressed = await resizeImage(file, 1600, 1600, 0.85);

    // Hâlâ büyükse 1200px / kalite 0.75
    if (compressed.size > targetKB * 1024) {
      compressed = await resizeImage(file, 1200, 1200, 0.75);
    }

    // Hâlâ büyükse 800px / kalite 0.65
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
      const { url, error } = await uploadHospitalImage(compressedFile);
      if (error || !url) throw error;
      setFormData(prev => ({ ...prev, image_url: url }));
    } catch (err) {
      console.error('Main image upload error:', err);
      alert(t('admin.hospitalForm.imageUploadError', 'Resim yüklenirken hata oluştu!'));
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
        const { url, error } = await uploadHospitalImage(compressedFile);
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

  const removeMainImage = () => {
    setFormData(prev => ({ ...prev, image_url: '' }));
  };

  const removeGalleryImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: (prev.images || []).filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const hospitalData: HospitalFormData = {
        ...formData,
        created_at: formData.created_at || new Date().toISOString()
      };

      if (onSave) {
        onSave(hospitalData as Hospital);
      } else {
        if (id || formData.id) {
          const hospitalId = id ? parseInt(id) : formData.id!;
          const { error } = await updateHospital(hospitalId, hospitalData as Partial<Hospital>);
          if (error) throw error;
        } else {
          const { error } = await createHospital(hospitalData as Omit<Hospital, 'id' | 'created_at'>);
          if (error) throw error;
        }
        queryClient.invalidateQueries([CACHE_KEYS.HOSPITALS]);
        navigate('/admin/hospitals');
      }
    } catch (error) {
      console.error('Error saving hospital:', error);
      alert(t('admin.hospitalForm.saveError', 'Hastane kaydedilirken hata oluştu!'));
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
            onClick={() => onCancel ? onCancel() : navigate('/admin/hospitals')}
            className="mr-4 p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <FaArrowLeft />
          </button>
          <h1 className="text-2xl font-semibold text-primary">
            {hospital || id ? t('admin.hospitalForm.editTitle', 'Hastane Düzenle') : t('admin.hospitalForm.newTitle', 'Yeni Hastane')}
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
                  {t('admin.label.hospitalName', 'Hastane Adı')}
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={handleNameChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder={t('admin.label.hospitalNamePlaceholder', 'Hastane adı girin')}
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
                  placeholder="hastane-adi"
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
                  rows={5}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder={t('admin.label.hospitalDescriptionPlaceholder', 'Hastane açıklaması')}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <FaMapMarkerAlt className="mr-2" />
                  {t('admin.label.address', 'Adres')}
                </label>
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('admin.label.transportationInfo', 'Ulaşım Bilgileri')}
                </label>
                <textarea
                  value={formData.transportation_info}
                  onChange={(e) => setFormData({ ...formData, transportation_info: e.target.value })}
                  rows={8}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder={'Toplu Taşıma ile Ulaşım\n- Metrobüs: Avcılar (Merkez) durağı\n- Otobüs hatları: HS2 - A43\n\nHavalimanlarından Ulaşım\n- İstanbul Havalimanı (IST): ...'}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {t('admin.label.transportationInfoHint', 'Bölüm başlığını kendi satırına yazın, maddeleri "- " ile başlatın, bölümleri boş satırla ayırın.')}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('admin.label.latitude', 'Enlem')}
                  </label>
                  <input
                    type="text"
                    value={formData.latitude}
                    onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="41.0082"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('admin.label.longitude', 'Boylam')}
                  </label>
                  <input
                    type="text"
                    value={formData.longitude}
                    onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="28.9784"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Bölüm Görünürlüğü — Şube Sekmesi */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-primary mb-1 flex items-center">
              <FaStethoscope className="mr-2" />
              {t('admin.hospitalForm.deptVisibilityTitle', 'Bölüm Görünürlüğü (Şube Sekmesi)')}
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              {t(
                'admin.hospitalForm.deptVisibilityHint',
                'Bölümlerimiz sayfasında bu şube sekmesinde gösterilecek bölümler. Doktoru olan bölümler otomatik listelenir; burada işaretledikleriniz (Radyoloji, Laboratuvar, Acil gibi doktor kaydı olmayan birimler) doktor olmasa da her zaman gösterilir.'
              )}
            </p>

            {allDepartments.length === 0 ? (
              <p className="text-sm text-gray-400 italic">
                {t('admin.hospitalForm.noDepartments', 'Bölüm bulunamadı.')}
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-96 overflow-y-auto pr-1">
                {allDepartments.map((dept: any) => {
                  const isAuto = autoShownDeptIds.has(Number(dept.id));
                  const isChecked = isAuto || (formData.department_ids || []).includes(Number(dept.id));
                  return (
                    <label
                      key={dept.id}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-colors ${
                        isAuto
                          ? 'bg-gray-50 border-gray-200 cursor-not-allowed'
                          : 'border-gray-200 hover:bg-primary/5 cursor-pointer'
                      }`}
                      title={isAuto ? t('admin.hospitalForm.autoShownTooltip', 'Bu bölümde şubeye ait doktor olduğu için otomatik gösterilir.') : ''}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        disabled={isAuto}
                        onChange={() => toggleDepartment(Number(dept.id))}
                        className="shrink-0"
                      />
                      <span className="flex-1 text-gray-700">{dept.name}</span>
                      {isAuto && (
                        <span className="shrink-0 text-[10px] font-semibold text-primary bg-primary/10 px-1.5 py-0.5 rounded-full">
                          {t('admin.hospitalForm.autoBadge', 'Doktordan otomatik')}
                        </span>
                      )}
                    </label>
                  );
                })}
              </div>
            )}
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

          {/* Contact Info */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-primary mb-4">{t('admin.label.contactInfo', 'İletişim')}</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <FaPhone className="mr-2" />
                  {t('admin.label.phone', 'Telefon')}
                </label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <FaPhone className="mr-2" />
                  {t('admin.label.emergencyPhone', 'Acil Telefon')}
                </label>
                <input
                  type="text"
                  value={formData.emergency_phone}
                  onChange={(e) => setFormData({ ...formData, emergency_phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('admin.label.emergencyHours', 'Acil Servis Saatleri')}
                </label>
                <input
                  type="text"
                  value={formData.emergency_hours}
                  onChange={(e) => setFormData({ ...formData, emergency_hours: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder={t('admin.label.emergencyHoursPlaceholder', '7/24 Acil Servis')}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <FaEnvelope className="mr-2" />
                  {t('admin.label.email', 'E-posta')}
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('admin.label.website', 'Web Sitesi')}
                </label>
                <input
                  type="url"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="https://example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('admin.label.workingHours', 'Çalışma Saatleri')}
                </label>
                <input
                  type="text"
                  value={formData.working_hours}
                  onChange={(e) => setFormData({ ...formData, working_hours: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder={t('admin.label.workingHoursPlaceholder', 'Pzt-Cmt: 08:00-18:00')}
                />
              </div>
            </div>
          </div>

          {/* Images */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-primary mb-4 flex items-center">
              <FaImage className="mr-2" />
              {t('admin.label.images', 'Görseller')}
            </h3>

            <div className="space-y-6">
              {/* Öne Çıkan Resim */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('admin.label.mainImage', 'Öne Çıkan Resim')}
                </label>

                {formData.image_url && (
                  <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg mb-3">
                    <img
                      src={formData.image_url}
                      alt="Preview"
                      className="h-20 w-auto object-contain rounded-lg"
                    />
                    <div className="flex-1">
                      <p className="text-sm text-gray-600">{t('admin.settings.currentLogo', 'Mevcut Resim')}</p>
                      <div className="flex space-x-2 mt-2">
                        <button
                          type="button"
                          onClick={() => window.open(formData.image_url, '_blank')}
                          className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
                        >
                          <FaEye className="mr-1" />
                          {t('admin.view', 'Görüntüle')}
                        </button>
                        <button
                          type="button"
                          onClick={removeMainImage}
                          className="text-red-600 hover:text-red-800 text-sm flex items-center"
                        >
                          <FaTrash className="mr-1" />
                          {t('admin.remove', 'Kaldır')}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex items-center space-x-4">
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

                <div className="mt-3">
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    {'Veya Resim URL\'si Girin'}
                  </label>
                  <input
                    type="url"
                    value={formData.image_url}
                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="https://example.com/hospital.jpg"
                  />
                </div>
              </div>

              {/* Galeri */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('admin.label.gallery', 'Hastane Galerisi')}
                </label>

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
                        {/* Drag handle indicator */}
                        <div className="absolute top-1 left-1 bg-black/40 text-white p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                          <FaGripVertical className="text-xs" />
                        </div>
                        {/* Order badge */}
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

              {/* Logo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('admin.label.logo', 'Logo')}
                </label>
                <input
                  type="url"
                  value={formData.logo_url}
                  onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="https://example.com/logo.png"
                />
                {formData.logo_url && (
                  <img
                    src={formData.logo_url}
                    alt="Logo Preview"
                    className="mt-3 w-full h-16 object-contain rounded-lg"
                  />
                )}
              </div>
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
              { key: 'name', label: t('admin.label.hospitalName', 'Hastane Adı'), type: 'text' },
              { key: 'description', label: t('admin.label.description', 'Açıklama'), type: 'textarea' },
              { key: 'address', label: t('admin.label.address', 'Adres'), type: 'textarea' },
              { key: 'working_hours', label: t('admin.label.workingHours', 'Çalışma Saatleri'), type: 'text' },
            ]}
          />
        </div>
      </form>
    </div>
  );
};

export default HospitalForm;
