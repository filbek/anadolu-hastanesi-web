import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FaSave, FaArrowLeft, FaImage, FaGraduationCap, FaStar } from 'react-icons/fa';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

interface Doctor {
  id?: number;
  slug?: string;
  name: string;
  title: string;
  specialty: string;
  department_id: number;
  hospital_id: number;
  bio: string;
  education: string[];
  experience: string;
  languages: string[];
  image_url: string;
  email: string;
  phone: string;
  rating: number;
  review_count: number;
  is_active: boolean;
  display_order: number;
  created_at?: string;
  updated_at?: string;
}

interface DoctorFormProps {
  doctor?: Doctor;
  departments?: Array<{ id: number; name: string }>;
  hospitals?: Array<{ id: number; name: string }>;
  onSave?: (doctor: Doctor) => void;
  onCancel?: () => void;
}

const DoctorForm = ({ doctor, departments: propDepartments = [], hospitals: propHospitals = [], onSave, onCancel }: DoctorFormProps = {}) => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [departments, setDepartments] = useState(propDepartments);
  const [hospitals, setHospitals] = useState(propHospitals);
  
  const [formData, setFormData] = useState<Doctor>({
    name: '',
    title: '',
    specialty: '',
    department_id: 0,
    hospital_id: 0,
    bio: '',
    education: [],
    experience: '',
    languages: [],
    image_url: '',
    email: '',
    phone: '',
    rating: 5,
    review_count: 0,
    is_active: true,
    display_order: 1
  });
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [educationInput, setEducationInput] = useState('');
  const [languageInput, setLanguageInput] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImage(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).slice(2)}-${Date.now()}.${fileExt}`;
      const filePath = `doctor-images/${fileName}`;
      const { error: uploadError } = await supabase.storage
        .from('doctor-images')
        .upload(filePath, file);
      if (uploadError) {
        alert('Resim yüklenirken hata oluştu: ' + uploadError.message);
        return;
      }
      const { data } = supabase.storage.from('doctor-images').getPublicUrl(filePath);
      setFormData((prev) => ({ ...prev, image_url: data.publicUrl }));
    } catch (error: any) {
      alert('Resim yüklenirken hata oluştu: ' + (error?.message || ''));
    } finally {
      setUploadingImage(false);
    }
  };

  useEffect(() => {
    if (doctor) {
      setFormData(doctor);
    } else if (id) {
      fetchDoctor(parseInt(id));
    }
  }, [doctor, id]);

  useEffect(() => {
    if (propDepartments.length === 0) {
      fetchDepartments();
    }
    if (propHospitals.length === 0) {
      fetchHospitals();
    }
  }, [propDepartments, propHospitals]);

  const fetchDoctor = async (doctorId: number) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.from('doctors').select('*').eq('id', doctorId).single();
      if (error) throw error;
      if (data) {
        // DB kolonlarını form modeline eşle (bkz. handleSubmit'teki ters eşleme)
        setFormData({
          id: data.id,
          slug: data.slug || '',
          name: data.name || '',
          title: data.title || '',
          specialty: Array.isArray(data.specialties) ? (data.specialties[0] || '') : (data.specialties || ''),
          department_id: data.department_id || 0,
          hospital_id: data.hospital_id || 0,
          bio: data.about || '',
          education:
            Array.isArray(data.education)
              ? data.education
              : (typeof data.education === 'string' && data.education.trim()
                  ? data.education.split('\n').filter(Boolean)
                  : []),
          experience: data.experience || '',
          languages: Array.isArray(data.languages) ? data.languages : [],
          image_url: data.image || '',
          email: data.email || '',
          phone: data.phone || '',
          rating: data.rating ?? 5,
          review_count: data.review_count ?? 0,
          is_active: data.is_active ?? true,
          display_order: data.display_order ?? 1,
          created_at: data.created_at,
        });
      }
    } catch (error) {
      console.error('Error fetching doctor:', error);
      alert(t('admin.errorFetching', 'Doktor bilgileri yüklenemedi!'));
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    const { data } = await supabase.from('departments').select('id, name');
    if (data) setDepartments(data);
  };

  const fetchHospitals = async () => {
    const { data } = await supabase.from('hospitals').select('id, name');
    if (data) setHospitals(data);
  };

  const addEducation = () => {
    if (educationInput.trim() && !formData.education.includes(educationInput.trim())) {
      setFormData(prev => ({
        ...prev,
        education: [...prev.education, educationInput.trim()]
      }));
      setEducationInput('');
    }
  };

  const removeEducation = (eduToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      education: prev.education.filter(edu => edu !== eduToRemove)
    }));
  };

  const addLanguage = () => {
    if (languageInput.trim() && !formData.languages.includes(languageInput.trim())) {
      setFormData(prev => ({
        ...prev,
        languages: [...prev.languages, languageInput.trim()]
      }));
      setLanguageInput('');
    }
  };

  const removeLanguage = (langToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      languages: prev.languages.filter(lang => lang !== langToRemove)
    }));
  };

  // Türkçe karakterleri de dikkate alan slug üretici
  const slugify = (s: string) =>
    s
      .toLowerCase()
      .replace(/ı/g, 'i').replace(/ğ/g, 'g').replace(/ü/g, 'u')
      .replace(/ş/g, 's').replace(/ö/g, 'o').replace(/ç/g, 'c')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      // Form modelini gerçek doctors tablosu kolonlarına eşle (bkz. fetchDoctor)
      const doctorData: Record<string, any> = {
        name: formData.name,
        slug: formData.slug || slugify(formData.name) || `doktor-${Date.now()}`,
        title: formData.title,
        specialties: formData.specialty ? [formData.specialty] : [],
        department_id: formData.department_id || null,
        hospital_id: formData.hospital_id || null,
        about: formData.bio,
        education: (formData.education || []).join('\n'),
        experience: formData.experience,
        languages: formData.languages || [],
        image: formData.image_url,
        email: formData.email || null,
        phone: formData.phone || null,
        rating: formData.rating,
        review_count: formData.review_count,
        is_active: formData.is_active,
        display_order: formData.display_order,
        updated_at: new Date().toISOString(),
      };

      if (onSave) {
        onSave({ ...formData, ...doctorData });
        return;
      }

      let error;
      if (id || formData.id) {
        const doctorId = id ? parseInt(id) : formData.id!;
        ({ error } = await supabase.from('doctors').update(doctorData).eq('id', doctorId));
      } else {
        doctorData.created_at = formData.created_at || new Date().toISOString();
        ({ error } = await supabase.from('doctors').insert([doctorData]));
      }

      if (error) throw error;
      navigate('/admin/doctors');
    } catch (error: any) {
      console.error('Error saving doctor:', error);
      alert(
        (t('admin.doctorForm.saveError', 'Doktor kaydedilirken hata oluştu!') as string) +
          (error?.message ? `\n\n${error.message}` : ''),
      );
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
            onClick={() => onCancel ? onCancel() : navigate('/admin/doctors')}
            className="mr-4 p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <FaArrowLeft />
          </button>
          <h1 className="text-2xl font-semibold text-primary">
            {doctor || id ? t('admin.doctorForm.editTitle', 'Doktor Düzenle') : t('admin.doctorForm.newTitle', 'Yeni Doktor')}
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
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('admin.label.doctorName', 'Doktor Adı')}
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('admin.label.title', 'Ünvan')}
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Prof. Dr."
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('admin.label.specialty', 'Uzmanlık Alanı')}
                </label>
                <input
                  type="text"
                  value={formData.specialty}
                  onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('admin.label.department', 'Bölüm')}
                  </label>
                  <select
                    value={formData.department_id}
                    onChange={(e) => setFormData({ ...formData, department_id: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                  >
                    <option value={0}>{t('admin.label.selectDepartment', 'Bölüm Seçin')}</option>
                    {departments.map(dept => (
                      <option key={dept.id} value={dept.id}>{dept.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('admin.label.hospital', 'Hastane')}
                  </label>
                  <select
                    value={formData.hospital_id}
                    onChange={(e) => setFormData({ ...formData, hospital_id: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                  >
                    <option value={0}>{t('admin.label.selectHospital', 'Hastane Seçin')}</option>
                    {hospitals.map(hospital => (
                      <option key={hospital.id} value={hospital.id}>{hospital.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('admin.label.bio', 'Özgeçmiş')}
                </label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  rows={5}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('admin.label.experience', 'Deneyim')}
                </label>
                <input
                  type="text"
                  value={formData.experience}
                  onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder={t('admin.label.experiencePlaceholder', '20+ yıl')}
                />
              </div>

              {/* Education */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <FaGraduationCap className="mr-2" />
                  {t('admin.label.education', 'Eğitim')}
                </label>
                <div className="flex items-center space-x-2 mb-3">
                  <input
                    type="text"
                    value={educationInput}
                    onChange={(e) => setEducationInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addEducation())}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder={t('admin.label.educationPlaceholder', 'Eğitim ekle...')}
                  />
                  <button
                    type="button"
                    onClick={addEducation}
                    className="px-3 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark"
                  >
                    {t('admin.add', 'Ekle')}
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.education.map((edu, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2 py-1 bg-primary/10 text-primary text-sm rounded-full"
                    >
                      {edu}
                      <button
                        type="button"
                        onClick={() => removeEducation(edu)}
                        className="ml-1 text-primary hover:text-primary-dark"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Languages */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('admin.label.languages', 'Diller')}
                </label>
                <div className="flex items-center space-x-2 mb-3">
                  <input
                    type="text"
                    value={languageInput}
                    onChange={(e) => setLanguageInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addLanguage())}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder={t('admin.label.languagePlaceholder', 'Dil ekle...')}
                  />
                  <button
                    type="button"
                    onClick={addLanguage}
                    className="px-3 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark"
                  >
                    {t('admin.add', 'Ekle')}
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.languages.map((lang, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2 py-1 bg-green-100 text-green-800 text-sm rounded-full"
                    >
                      {lang}
                      <button
                        type="button"
                        onClick={() => removeLanguage(lang)}
                        className="ml-1 text-green-800 hover:text-green-900"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
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

          {/* Contact Info */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-primary mb-4">{t('admin.label.contactInfo', 'İletişim')}</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
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
                  {t('admin.label.phone', 'Telefon')}
                </label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Rating */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-primary mb-4 flex items-center">
              <FaStar className="mr-2" />
              {t('admin.label.rating', 'Puan')}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('admin.label.rating', 'Puan (1-5)')}
                </label>
                <input
                  type="number"
                  min="1"
                  max="5"
                  step="0.1"
                  value={formData.rating}
                  onChange={(e) => setFormData({ ...formData, rating: parseFloat(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('admin.label.reviewCount', 'Değerlendirme Sayısı')}
                </label>
                <input
                  type="number"
                  value={formData.review_count}
                  onChange={(e) => setFormData({ ...formData, review_count: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  min="0"
                />
              </div>
            </div>
          </div>

          {/* Image */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-primary mb-4 flex items-center">
              <FaImage className="mr-2" />
              {t('admin.label.profileImage', 'Profil Resmi')}
            </h3>

            {/* PC'den yükleme */}
            <label
              htmlFor="doctor-image-upload"
              className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-primary transition-colors ${uploadingImage ? 'opacity-60 pointer-events-none' : ''}`}
            >
              <FaImage className="text-2xl text-gray-400 mb-2" />
              <span className="text-sm text-gray-500">
                {uploadingImage ? 'Yükleniyor...' : 'Bilgisayardan resim seç / sürükle'}
              </span>
              <input
                id="doctor-image-upload"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={uploadingImage}
                className="hidden"
              />
            </label>

            {/* veya URL ile */}
            <div className="mt-3">
              <label className="block text-xs font-medium text-gray-500 mb-1">veya resim URL'si girin</label>
              <input
                type="url"
                value={formData.image_url}
                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="https://example.com/doctor.jpg"
              />
            </div>

            {formData.image_url && (
              <img
                src={formData.image_url}
                alt="Önizleme"
                className="mt-3 w-full h-32 object-cover rounded-lg"
              />
            )}
          </div>
        </div>
      </form>
    </div>
  );
};

export default DoctorForm;
