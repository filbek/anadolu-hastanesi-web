import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { FaPlus, FaEdit, FaTrash, FaSearch, FaUser, FaEye, FaEyeSlash, FaSort, FaGripVertical, FaSave, FaTimes } from 'react-icons/fa';
import { supabase } from '../../lib/supabase';
import type { Doctor, Department, Hospital } from '../../lib/supabase';

interface DoctorWithRelations extends Doctor {
  department?: Department;
  hospital?: Hospital;
}

const AdminDoctors = () => {
  const { t } = useTranslation();
  const [doctors, setDoctors] = useState<DoctorWithRelations[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [selectedHospital, setSelectedHospital] = useState('all');

  // Sürükle-bırak sıralama modu (şube bazlı)
  const [orderMode, setOrderMode] = useState(false);
  const [orderList, setOrderList] = useState<DoctorWithRelations[]>([]);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [savingOrder, setSavingOrder] = useState(false);

  // display_order'a göre sıralama (0/boş = en sona, ünvan değil isim ile)
  const byDisplayOrder = (a: DoctorWithRelations, b: DoctorWithRelations) => {
    const ao = a.display_order && a.display_order > 0 ? a.display_order : Number.MAX_SAFE_INTEGER;
    const bo = b.display_order && b.display_order > 0 ? b.display_order : Number.MAX_SAFE_INTEGER;
    if (ao !== bo) return ao - bo;
    return a.name.localeCompare(b.name, 'tr');
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch doctors with relations
      const { data: doctorsData, error: doctorsError } = await supabase
        .from('doctors')
        .select(`
          *,
          department:department_id(id, name),
          hospital:hospital_id(id, name)
        `)
        .order('created_at', { ascending: false });

      if (doctorsError) throw doctorsError;

      // Fetch departments
      const { data: departmentsData, error: deptError } = await supabase
        .from('departments')
        .select('*')
        .order('name');

      if (deptError) throw deptError;

      // Fetch hospitals
      const { data: hospitalsData, error: hospitalError } = await supabase
        .from('hospitals')
        .select('*')
        .order('name');

      if (hospitalError) throw hospitalError;

      setDoctors(doctorsData || []);
      setDepartments(departmentsData || []);
      setHospitals(hospitalsData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteDoctor = async (id: number) => {
    if (!confirm(t('admin.confirmDeleteDoctor', 'Bu doktoru silmek istediğinizden emin misiniz?'))) return;

    try {
      const { error } = await supabase
        .from('doctors')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setDoctors(doctors.filter(doctor => doctor.id !== id));
      alert(t('admin.doctorDeleted', 'Doktor başarıyla silindi!'));
    } catch (error) {
      console.error('Error deleting doctor:', error);
      alert(t('admin.doctorDeleteError', 'Doktor silinirken hata oluştu!'));
    }
  };

  const toggleDoctorStatus = async (id: number, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('doctors')
        .update({ is_active: !currentStatus })
        .eq('id', id);

      if (error) {
        console.error('Supabase error details:', error);
        alert(t('admin.doctorStatusError', 'Durum güncellenirken hata oluştu!') + '\n' + (error.message || ''));
        return;
      }

      setDoctors(doctors.map(doctor =>
        doctor.id === id ? { ...doctor, is_active: !currentStatus } : doctor
      ));
    } catch (error: any) {
      console.error('Error toggling doctor status:', error);
      alert(t('admin.doctorStatusError', 'Durum güncellenirken hata oluştu!') + '\n' + (error?.message || ''));
    }
  };

  const filteredDoctors = doctors.filter(doctor => {
    const matchesSearch = doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.title?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = selectedDepartment === 'all' || doctor.department_id?.toString() === selectedDepartment;
    const matchesHospital = selectedHospital === 'all' || doctor.hospital_id?.toString() === selectedHospital;
    return matchesSearch && matchesDepartment && matchesHospital;
  }).sort(byDisplayOrder);

  // Sıralama modunu aç: yalnızca tek bir şube (hastane) seçiliyken
  const enterOrderMode = () => {
    if (selectedHospital === 'all') {
      alert(t('admin.doctors.selectHospitalFirst', 'Sıralamak için önce bir şube (hastane) seçin.'));
      return;
    }
    setOrderList(filteredDoctors);
    setOrderMode(true);
  };

  const exitOrderMode = () => {
    setOrderMode(false);
    setOrderList([]);
    setDragIndex(null);
  };

  const handleDrop = (dropIndex: number) => {
    if (dragIndex === null || dragIndex === dropIndex) {
      setDragIndex(null);
      return;
    }
    setOrderList(prev => {
      const next = [...prev];
      const [moved] = next.splice(dragIndex, 1);
      next.splice(dropIndex, 0, moved);
      return next;
    });
    setDragIndex(null);
  };

  const saveOrder = async () => {
    try {
      setSavingOrder(true);
      // Bu şubedeki doktorlara 1..N sıra numarası ata, yalnızca değişenleri güncelle
      const updates = orderList
        .map((doc, idx) => ({ id: doc.id, display_order: idx + 1, prev: doc.display_order }))
        .filter(u => u.prev !== u.display_order);

      for (const u of updates) {
        const { error } = await supabase
          .from('doctors')
          .update({ display_order: u.display_order })
          .eq('id', u.id);
        if (error) throw error;
      }

      // Yerel state'i güncelle
      const orderMap = new Map(orderList.map((doc, idx) => [doc.id, idx + 1]));
      setDoctors(prev =>
        prev.map(d => (orderMap.has(d.id) ? { ...d, display_order: orderMap.get(d.id)! } : d))
      );
      alert(t('admin.doctors.orderSaved', 'Sıralama kaydedildi!'));
      exitOrderMode();
    } catch (error: any) {
      console.error('Error saving doctor order:', error);
      alert(t('admin.doctors.orderSaveError', 'Sıralama kaydedilirken hata oluştu!') + '\n' + (error?.message || ''));
    } finally {
      setSavingOrder(false);
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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-primary">{t('admin.doctors.title', 'Doktor Yönetimi')}</h1>
        <div className="flex items-center gap-2">
          {!orderMode ? (
            <>
              <button
                onClick={enterOrderMode}
                className="bg-amber-500 text-white px-4 py-2 rounded-lg hover:bg-amber-600 transition-colors flex items-center"
                title={t('admin.doctors.orderModeHint', 'Bir şube seçtikten sonra sürükle-bırak ile sıralayın')}
              >
                <FaSort className="mr-2" />
                {t('admin.doctors.orderMode', 'Sıralama Modu')}
              </button>
              <Link
                to="/admin/doctors/new"
                className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors flex items-center"
              >
                <FaPlus className="mr-2" />
                {t('admin.doctors.new', 'Yeni Doktor')}
              </Link>
            </>
          ) : (
            <>
              <button
                onClick={saveOrder}
                disabled={savingOrder}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center disabled:opacity-60"
              >
                <FaSave className="mr-2" />
                {savingOrder ? t('admin.saving', 'Kaydediliyor...') : t('admin.doctors.saveOrder', 'Sıralamayı Kaydet')}
              </button>
              <button
                onClick={exitOrderMode}
                disabled={savingOrder}
                className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors flex items-center disabled:opacity-60"
              >
                <FaTimes className="mr-2" />
                {t('admin.cancel', 'İptal')}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Filters (sıralama modunda gizli) */}
      {!orderMode && (
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder={t('admin.doctors.searchPlaceholder', 'Doktor ara...')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
          <select
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="all">{t('admin.allDepartments', 'Tüm Bölümler')}</option>
            {departments.map(dept => (
              <option key={dept.id} value={dept.id.toString()}>
                {dept.name}
              </option>
            ))}
          </select>
          <select
            value={selectedHospital}
            onChange={(e) => setSelectedHospital(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="all">{t('admin.allHospitals', 'Tüm Hastaneler')}</option>
            {hospitals.map(hospital => (
              <option key={hospital.id} value={hospital.id.toString()}>
                {hospital.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      )}

      {/* Sıralama modu: sürükle-bırak listesi */}
      {orderMode && (
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex items-center gap-2 mb-4 text-sm text-gray-600 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
            <FaSort className="text-amber-500 flex-shrink-0" />
            <span>
              <strong>{hospitals.find(h => h.id.toString() === selectedHospital)?.name || ''}</strong>{' '}
              {t('admin.doctors.orderModeDesc', 'şubesindeki doktorları sürükleyip bırakarak sıralayın, ardından "Sıralamayı Kaydet"e basın.')}
            </span>
          </div>
          <ul className="space-y-2">
            {orderList.map((doctor, index) => (
              <li
                key={doctor.id}
                draggable
                onDragStart={() => setDragIndex(index)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => handleDrop(index)}
                className={`flex items-center gap-3 p-3 border rounded-lg bg-white cursor-move select-none transition-colors ${
                  dragIndex === index ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <FaGripVertical className="text-gray-400 flex-shrink-0" />
                <span className="w-7 h-7 flex items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-semibold flex-shrink-0">
                  {index + 1}
                </span>
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden flex-shrink-0">
                  {doctor.image ? (
                    <img src={doctor.image} alt={doctor.name} className="w-full h-full object-cover" />
                  ) : (
                    <FaUser className="text-primary" />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-primary truncate">{doctor.name}</p>
                  {doctor.title && <p className="text-xs text-gray-500 truncate">{doctor.title}</p>}
                </div>
                {doctor.department && (
                  <span className="ml-auto inline-block bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full flex-shrink-0">
                    {doctor.department.name}
                  </span>
                )}
              </li>
            ))}
          </ul>
          {orderList.length === 0 && (
            <p className="text-center text-gray-500 py-8">
              {t('admin.doctors.noneInHospital', 'Bu şubede gösterilecek doktor yok.')}
            </p>
          )}
        </div>
      )}

      {/* Doctors Grid */}
      {!orderMode && (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDoctors.map((doctor) => (
          <div key={doctor.id} className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                {doctor.image ? (
                  <img
                    src={doctor.image}
                    alt={doctor.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <FaUser className="text-primary text-2xl" />
                )}
              </div>
              <div className="flex space-x-2 items-center">
                <button
                  onClick={() => toggleDoctorStatus(doctor.id, !!doctor.is_active)}
                  className={`transition-colors ${doctor.is_active !== false ? 'text-green-600 hover:text-green-800' : 'text-gray-400 hover:text-gray-600'}`}
                  title={doctor.is_active !== false ? t('admin.deactivate', 'Pasif yap') : t('admin.activate', 'Aktif yap')}
                >
                  {doctor.is_active !== false ? <FaEye /> : <FaEyeSlash />}
                </button>
                <Link
                  to={`/admin/doctors/edit/${doctor.id}`}
                  className="text-blue-600 hover:text-blue-800 transition-colors"
                >
                  <FaEdit />
                </Link>
                <button
                  onClick={() => deleteDoctor(doctor.id)}
                  className="text-red-600 hover:text-red-800 transition-colors"
                >
                  <FaTrash />
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between mb-1">
              <h3 className="text-lg font-semibold text-primary">{doctor.name}</h3>
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${doctor.is_active !== false ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                {doctor.is_active !== false ? t('admin.active', 'Aktif') : t('admin.inactive', 'Pasif')}
              </span>
            </div>
            {doctor.title && (
              <p className="text-gray-600 text-sm mb-2">{doctor.title}</p>
            )}

            <div className="space-y-1 mb-4">
              {doctor.department && (
                <span className="inline-block bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full">
                  {doctor.department.name}
                </span>
              )}
              {doctor.hospital && (
                <span className="inline-block bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full ml-1">
                  {doctor.hospital.name}
                </span>
              )}
            </div>

            {doctor.education && (
              <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                <strong>{t('admin.label.education', 'Eğitim')}:</strong> {doctor.education}
              </p>
            )}

            <div className="text-xs text-gray-500">
              {t('admin.createdAt', 'Oluşturulma')}: {new Date(doctor.created_at).toLocaleDateString('tr-TR')}
            </div>
          </div>
        ))}
      </div>
      )}

      {!orderMode && filteredDoctors.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">👨‍⚕️</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">{t('admin.doctors.notFound', 'Doktor bulunamadı')}</h3>
          <p className="text-gray-500 mb-4">
            {searchTerm || selectedDepartment !== 'all' || selectedHospital !== 'all'
              ? t('admin.searchNoResults', 'Arama kriterlerinize uygun doktor bulunamadı.')
              : t('admin.doctors.empty', 'Henüz hiç doktor eklenmemiş.')}
          </p>
          <Link
            to="/admin/doctors/new"
            className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors inline-flex items-center"
          >
            <FaPlus className="mr-2" />
            {t('admin.doctors.addFirst', 'İlk Doktoru Ekle')}
          </Link>
        </div>
      )}
    </div>
  );
};

export default AdminDoctors;
