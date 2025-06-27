import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaPlus, FaEdit, FaTrash, FaSearch, FaUser } from 'react-icons/fa';
import { supabaseNew as supabase } from '../../lib/supabase-new';
import type { Doctor, Department, Hospital } from '../../lib/supabase-new';

interface DoctorWithRelations extends Doctor {
  department?: Department;
  hospital?: Hospital;
}

const AdminDoctors = () => {
  const [doctors, setDoctors] = useState<DoctorWithRelations[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [selectedHospital, setSelectedHospital] = useState('all');

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
          departments:department_id(id, name),
          hospitals:hospital_id(id, name)
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
    if (!confirm('Bu doktoru silmek istediğinizden emin misiniz?')) return;

    try {
      const { error } = await supabase
        .from('doctors')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setDoctors(doctors.filter(doctor => doctor.id !== id));
      alert('Doktor başarıyla silindi!');
    } catch (error) {
      console.error('Error deleting doctor:', error);
      alert('Doktor silinirken hata oluştu!');
    }
  };

  const filteredDoctors = doctors.filter(doctor => {
    const matchesSearch = doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doctor.title?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = selectedDepartment === 'all' || doctor.department_id?.toString() === selectedDepartment;
    const matchesHospital = selectedHospital === 'all' || doctor.hospital_id?.toString() === selectedHospital;
    return matchesSearch && matchesDepartment && matchesHospital;
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
        <h1 className="text-2xl font-semibold text-primary">Doktor Yönetimi</h1>
        <Link
          to="/admin/doctors/new"
          className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors flex items-center"
        >
          <FaPlus className="mr-2" />
          Yeni Doktor
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Doktor ara..."
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
            <option value="all">Tüm Bölümler</option>
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
            <option value="all">Tüm Hastaneler</option>
            {hospitals.map(hospital => (
              <option key={hospital.id} value={hospital.id.toString()}>
                {hospital.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Doctors Grid */}
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
              <div className="flex space-x-2">
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
            
            <h3 className="text-lg font-semibold text-primary mb-1">{doctor.name}</h3>
            {doctor.title && (
              <p className="text-gray-600 text-sm mb-2">{doctor.title}</p>
            )}
            
            <div className="space-y-1 mb-4">
              {doctor.departments && (
                <span className="inline-block bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full">
                  {doctor.departments.name}
                </span>
              )}
              {doctor.hospitals && (
                <span className="inline-block bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full ml-1">
                  {doctor.hospitals.name}
                </span>
              )}
            </div>
            
            {doctor.education && (
              <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                <strong>Eğitim:</strong> {doctor.education}
              </p>
            )}
            
            <div className="text-xs text-gray-500">
              Oluşturulma: {new Date(doctor.created_at).toLocaleDateString('tr-TR')}
            </div>
          </div>
        ))}
      </div>

      {filteredDoctors.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">👨‍⚕️</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Doktor bulunamadı</h3>
          <p className="text-gray-500 mb-4">
            {searchTerm || selectedDepartment !== 'all' || selectedHospital !== 'all'
              ? 'Arama kriterlerinize uygun doktor bulunamadı.' 
              : 'Henüz hiç doktor eklenmemiş.'}
          </p>
          <Link
            to="/admin/doctors/new"
            className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors inline-flex items-center"
          >
            <FaPlus className="mr-2" />
            İlk Doktoru Ekle
          </Link>
        </div>
      )}
    </div>
  );
};

export default AdminDoctors;
