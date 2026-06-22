import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router-dom';
import { FaPlus, FaEdit, FaTrash, FaSearch, FaPhone, FaEnvelope, FaClock, FaHome } from 'react-icons/fa';
import { getHospitals, deleteHospital as deleteHospitalService } from '../../services/hospitalService';
import type { Hospital } from '../../lib/supabase';

const AdminHospitals = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchHospitals();
  }, [location.pathname]);

  const fetchHospitals = async () => {
    try {
      setLoading(true);
      const data = await getHospitals();
      setHospitals(data);
    } catch (error) {
      console.error('Error fetching hospitals:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteHospital = async (id: number | string) => {
    if (!confirm(t('admin.confirmDeleteHospital', 'Bu hastaneyi silmek istediğinizden emin misiniz?'))) return;

    try {
      const { error } = await deleteHospitalService(id);
      if (error) throw error;

      setHospitals(hospitals.filter(hospital => hospital.id !== id));
      alert(t('admin.hospitalDeleted', 'Hastane başarıyla silindi!'));
    } catch (error) {
      console.error('Error deleting hospital:', error);
      alert(t('admin.hospitalDeleteError', 'Hastane silinirken hata oluştu!'));
    }
  };

  const filteredHospitals = hospitals.filter(hospital =>
    hospital.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    hospital.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
        <h1 className="text-2xl font-semibold text-primary">{t('admin.hospitals.title', 'Hastane Yönetimi')}</h1>
        <Link
          to="/admin/hospitals/new"
          className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors flex items-center"
        >
          <FaPlus className="mr-2" />
          {t('admin.hospitals.new', 'Yeni Hastane')}
        </Link>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="relative">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder={t('admin.hospitals.searchPlaceholder', 'Hastane ara...')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>
      </div>

      {/* Hospitals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredHospitals.map((hospital) => (
          <div key={hospital.id} className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-primary text-xl">🏥</span>
              </div>
              <div className="flex space-x-2">
                <Link
                  to={`/admin/hospitals/edit/${hospital.id}`}
                  className="text-blue-600 hover:text-blue-800 transition-colors"
                >
                  <FaEdit />
                </Link>
                <button
                  onClick={() => deleteHospital(hospital.id)}
                  className="text-red-600 hover:text-red-800 transition-colors"
                >
                  <FaTrash />
                </button>
              </div>
            </div>

            <h3 className="text-lg font-semibold text-primary mb-2 flex items-center justify-between">
              {hospital.name}
              {hospital.display_on_homepage && (
                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full flex items-center shadow-sm">
                  <FaHome className="mr-1" size={10} />
                  {t('admin.homepage', 'Ana Sayfa')}
                </span>
              )}
            </h3>

            {hospital.description && (
              <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                {hospital.description}
              </p>
            )}

            <div className="space-y-2 text-sm text-gray-600">
              {hospital.phone && (
                <div className="flex items-center">
                  <FaPhone className="mr-2 text-primary" />
                  <span>{hospital.phone}</span>
                </div>
              )}
              {hospital.email && (
                <div className="flex items-center">
                  <FaEnvelope className="mr-2 text-primary" />
                  <span>{hospital.email}</span>
                </div>
              )}
              {hospital.working_hours && (
                <div className="flex items-center">
                  <FaClock className="mr-2 text-primary" />
                  <span>{hospital.working_hours}</span>
                </div>
              )}
            </div>

            <div className="mt-4 text-xs text-gray-500">
              {t('admin.createdAt', 'Oluşturulma')}: {new Date(hospital.created_at).toLocaleDateString('tr-TR')}
            </div>
          </div>
        ))}
      </div>

      {filteredHospitals.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">🏥</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">{t('admin.hospitals.notFound', 'Hastane bulunamadı')}</h3>
          <p className="text-gray-500 mb-4">
            {searchTerm
              ? t('admin.searchNoResults', 'Arama kriterlerinize uygun hastane bulunamadı.')
              : t('admin.hospitals.empty', 'Henüz hiç hastane eklenmemiş.')}
          </p>
          <Link
            to="/admin/hospitals/new"
            className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors inline-flex items-center"
          >
            <FaPlus className="mr-2" />
            {t('admin.hospitals.addFirst', 'İlk Hastaneyi Ekle')}
          </Link>
        </div>
      )}
    </div>
  );
};

export default AdminHospitals;
