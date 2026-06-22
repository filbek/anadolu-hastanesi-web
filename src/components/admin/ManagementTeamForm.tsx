import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { FaSave, FaArrowLeft, FaImage, FaUserMd, FaSearch, FaTimes } from 'react-icons/fa';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import type { ManagementTeamMember, Doctor } from '../../lib/supabase';

interface ManagementTeamFormProps {
  member?: ManagementTeamMember;
  onSave?: (member: ManagementTeamMember) => void;
  onCancel?: () => void;
}

const roleOptions = [
  { value: 'board', label: 'Üst Yönetim' },
  { value: 'chief_physician', label: 'Başhekim' },
  { value: 'assistant_chief', label: 'Başhekim Yardımcısı' },
  { value: 'health_care_manager', label: 'Sağlık Bakım Hizm. Müdürü' },
  { value: 'it_unit', label: 'IT Birimi' },
  { value: 'general_manager_deputy', label: 'Genel Müdür Yd.' },
  { value: 'financial_affairs_manager', label: 'Mali İşler Müdürü' },
  { value: 'hospitality_services_manager', label: 'Otelcilik Hizmetleri Müdürü' },
  { value: 'quality_management_manager', label: 'Kalite Yönetim Müdürü' },
  { value: 'administrative', label: 'İdari Yönetim' },
];

const ManagementTeamForm = ({ member, onSave, onCancel }: ManagementTeamFormProps = {}) => {
  useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const doctorDropdownRef = useRef<HTMLDivElement>(null);

  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [formData, setFormData] = useState<Partial<ManagementTeamMember>>({
    name: '',
    title: '',
    role: 'administrative',
    department: '',
    doctor_id: null,
    image: '',
    display_order: 0,
    is_active: true,
  });
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [selectedDoctorImage, setSelectedDoctorImage] = useState<string | null>(null);
  const [doctorSearch, setDoctorSearch] = useState('');
  const [isDoctorOpen, setIsDoctorOpen] = useState(false);

  useEffect(() => {
    if (member) {
      setFormData(member);
      if (member.doctor_id) {
        fetchDoctorImage(member.doctor_id);
      }
    } else if (id) {
      fetchMember(parseInt(id));
    }
    fetchDoctors();
  }, [member, id]);

  useEffect(() => {
    if (formData.doctor_id) {
      fetchDoctorImage(formData.doctor_id);
    } else {
      setSelectedDoctorImage(null);
    }
  }, [formData.doctor_id]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (doctorDropdownRef.current && !doctorDropdownRef.current.contains(event.target as Node)) {
        setIsDoctorOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchMember = async (memberId: number) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('management_team')
        .select('*')
        .eq('id', memberId)
        .single();
      if (error) throw error;
      if (data) setFormData(data);
    } catch (error) {
      console.error('Error fetching member:', error);
      alert('Kayıt bilgileri yüklenemedi!');
    } finally {
      setLoading(false);
    }
  };

  const fetchDoctors = async () => {
    try {
      const { data, error } = await supabase
        .from('doctors')
        .select('*')
        .eq('is_active', true)
        .order('name');
      if (error) throw error;
      setDoctors((data || []) as Doctor[]);
    } catch (error) {
      console.error('Error fetching doctors:', error);
    }
  };

  const fetchDoctorImage = async (doctorId: number) => {
    const doc = doctors.find(d => d.id === doctorId);
    if (doc?.image) {
      setSelectedDoctorImage(doc.image);
      return;
    }
    try {
      const { data, error } = await supabase
        .from('doctors')
        .select('image')
        .eq('id', doctorId)
        .single();
      if (!error && data?.image) {
        setSelectedDoctorImage(data.image);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      setFormData(prev => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
    } else if (name === 'display_order') {
      setFormData(prev => ({ ...prev, [name]: parseInt(value) || 0 }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const filteredDoctors = doctors.filter(doc =>
    doc.name.toLowerCase().includes(doctorSearch.toLowerCase()) ||
    doc.title.toLowerCase().includes(doctorSearch.toLowerCase())
  );

  const selectedDoctor = doctors.find(d => d.id === formData.doctor_id);

  const handleSelectDoctor = (doctorId: number | null) => {
    setFormData(prev => ({ ...prev, doctor_id: doctorId }));
    setIsDoctorOpen(false);
    setDoctorSearch('');
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}-${Date.now()}.${fileExt}`;
      const filePath = `management-team/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('doctor-images')
        .upload(filePath, file);

      if (uploadError) {
        alert('Resim yüklenirken hata oluştu: ' + uploadError.message);
        return;
      }

      const { data } = supabase.storage.from('doctor-images').getPublicUrl(filePath);
      setFormData(prev => ({ ...prev, image: data.publicUrl }));
    } catch (error: any) {
      alert('Resim yüklenirken hata oluştu: ' + error?.message);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim() || !formData.title?.trim()) {
      alert('İsim ve unvan zorunludur!');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...formData,
        doctor_id: formData.doctor_id || null,
      };

      if (onSave) {
        onSave(payload as ManagementTeamMember);
      } else if (id || formData.id) {
        const { error } = await supabase
          .from('management_team')
          .update(payload)
          .eq('id', id || formData.id);
        if (error) throw error;
        alert('Kayıt güncellendi!');
        navigate('/admin/management-team');
      } else {
        const { error } = await supabase
          .from('management_team')
          .insert([payload]);
        if (error) throw error;
        alert('Kayıt oluşturuldu!');
        navigate('/admin/management-team');
      }
    } catch (error: any) {
      console.error('Error saving member:', error);
      alert('Kaydedilirken hata oluştu: ' + (error?.message || ''));
    } finally {
      setSaving(false);
    }
  };

  const previewImage = selectedDoctorImage || formData.image || null;

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
          {id ? 'Yönetim Ekibi Üyesi Düzenle' : 'Yeni Yönetim Ekibi Üyesi'}
        </h1>
        <button
          onClick={() => onCancel ? onCancel() : navigate('/admin/management-team')}
          className="flex items-center text-gray-600 hover:text-primary transition-colors"
        >
          <FaArrowLeft className="mr-2" />
          Geri Dön
        </button>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Fields */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-medium text-primary mb-4">Temel Bilgiler</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">İsim Soyisim *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name || ''}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Unvan *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title || ''}
                  onChange={handleChange}
                  placeholder="örn: Başhekim, Başkan Vekili, Müdür"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Rol *</label>
                  <select
                    name="role"
                    value={formData.role || 'administrative'}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                  >
                    {roleOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bölüm / Uzmanlık</label>
                  <input
                    type="text"
                    name="department"
                    value={formData.department || ''}
                    onChange={handleChange}
                    placeholder="örn: Nöroloji, Kardiyoloji"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
              </div>

              <div ref={doctorDropdownRef}>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bağlı Doktor (Opsiyonel)</label>
                <div className="relative">
                  <FaUserMd className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 z-10" />
                  {!selectedDoctor ? (
                    <>
                      <input
                        type="text"
                        placeholder="Doktor ara... (resim otomatik çekilir)"
                        value={doctorSearch}
                        onChange={(e) => {
                          setDoctorSearch(e.target.value);
                          setIsDoctorOpen(true);
                        }}
                        onFocus={() => setIsDoctorOpen(true)}
                        className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                      <FaSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    </>
                  ) : (
                    <div className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg bg-gray-50 flex items-center justify-between">
                      <span className="text-gray-800">{selectedDoctor.name} — {selectedDoctor.title}</span>
                      <button
                        type="button"
                        onClick={() => handleSelectDoctor(null)}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                        title="Seçimi kaldır"
                      >
                        <FaTimes />
                      </button>
                    </div>
                  )}

                  {isDoctorOpen && !selectedDoctor && (
                    <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      {filteredDoctors.length === 0 ? (
                        <div className="px-4 py-3 text-sm text-gray-500">Sonuç bulunamadı</div>
                      ) : (
                        filteredDoctors.map((doc) => (
                          <button
                            key={doc.id}
                            type="button"
                            onClick={() => handleSelectDoctor(doc.id)}
                            className="w-full text-left px-4 py-2.5 hover:bg-gray-50 focus:bg-gray-50 focus:outline-none transition-colors border-b border-gray-50 last:border-0"
                          >
                            <div className="font-medium text-gray-800">{doc.name}</div>
                            <div className="text-xs text-gray-500">{doc.title}</div>
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Eğer bu yönetim üyesi aynı zamanda bir doktorsa, arama yaparak hızlıca bulup resmini otomatik çekebilirsiniz.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Image */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-medium text-primary mb-4">Resim</h3>
            <div className="space-y-4">
              <div className="w-full aspect-square rounded-xl bg-gray-50 border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden">
                {previewImage ? (
                  <img src={previewImage} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <FaImage className="text-gray-300 text-4xl" />
                )}
              </div>

              {formData.doctor_id ? (
                <p className="text-sm text-blue-600 bg-blue-50 px-3 py-2 rounded-lg">
                  Doktor seçildiği için resim otomatik olarak doktorun resminden çekiliyor.
                </p>
              ) : (
                <>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingImage}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center disabled:opacity-50"
                  >
                    <FaImage className="mr-2" />
                    {uploadingImage ? 'Yükleniyor...' : 'Resim Yükle'}
                  </button>
                  <div className="relative">
                    <span className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-gray-200"></span>
                    </span>
                    <span className="relative flex justify-center text-xs">
                      <span className="px-2 bg-white text-gray-500">veya</span>
                    </span>
                  </div>
                  <input
                    type="url"
                    name="image"
                    value={formData.image || ''}
                    onChange={handleChange}
                    placeholder="Resim URL'si"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                  />
                </>
              )}
            </div>
          </div>

          {/* Publishing */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-medium text-primary mb-4">Yayınlama</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sıra Numarası</label>
                <input
                  type="number"
                  name="display_order"
                  value={formData.display_order || 0}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="is_active"
                  checked={!!formData.is_active}
                  onChange={handleChange}
                  className="w-5 h-5 text-primary border-gray-300 rounded focus:ring-primary"
                />
                <span className="text-sm font-medium text-gray-700">Aktif</span>
              </label>
            </div>
          </div>

          {/* Save */}
          <button
            type="submit"
            disabled={saving}
            className="w-full bg-primary text-white px-4 py-3 rounded-lg hover:bg-primary-dark transition-colors flex items-center justify-center font-medium disabled:opacity-50"
          >
            <FaSave className="mr-2" />
            {saving ? 'Kaydediliyor...' : 'Kaydet'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ManagementTeamForm;
