import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaPlus, FaEdit, FaTrash, FaSearch } from 'react-icons/fa';
import { supabaseNew as supabase } from '../../lib/supabase-new';
import type { Department } from '../../lib/supabase-new';

const AdminDepartments = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('departments')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDepartments(data || []);
    } catch (error) {
      console.error('Error fetching departments:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteDepartment = async (id: number) => {
    if (!confirm('Bu bölümü silmek istediğinizden emin misiniz?')) return;

    try {
      const { error } = await supabase
        .from('departments')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setDepartments(departments.filter(dept => dept.id !== id));
      alert('Bölüm başarıyla silindi!');
    } catch (error) {
      console.error('Error deleting department:', error);
      alert('Bölüm silinirken hata oluştu!');
    }
  };

  const filteredDepartments = departments.filter(dept => {
    const matchesSearch = dept.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         dept.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || dept.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ['all', ...Array.from(new Set(departments.map(dept => dept.category).filter(Boolean)))];

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
        <h1 className="text-2xl font-semibold text-primary">Bölüm Yönetimi</h1>
        <Link
          to="/admin/departments/new"
          className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors flex items-center"
        >
          <FaPlus className="mr-2" />
          Yeni Bölüm
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Bölüm ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="all">Tüm Kategoriler</option>
              {categories.filter(cat => cat !== 'all').map(category => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Departments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDepartments.map((department) => (
          <div key={department.id} className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-primary text-xl">{department.icon || '🏥'}</span>
              </div>
              <div className="flex space-x-2">
                <Link
                  to={`/admin/departments/edit/${department.id}`}
                  className="text-blue-600 hover:text-blue-800 transition-colors"
                >
                  <FaEdit />
                </Link>
                <button
                  onClick={() => deleteDepartment(department.id)}
                  className="text-red-600 hover:text-red-800 transition-colors"
                >
                  <FaTrash />
                </button>
              </div>
            </div>
            
            <h3 className="text-lg font-semibold text-primary mb-2">{department.name}</h3>
            
            {department.category && (
              <span className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full mb-2">
                {department.category}
              </span>
            )}
            
            {department.description && (
              <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                {department.description}
              </p>
            )}
            
            <div className="text-xs text-gray-500">
              Oluşturulma: {new Date(department.created_at).toLocaleDateString('tr-TR')}
            </div>
          </div>
        ))}
      </div>

      {filteredDepartments.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">🏥</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Bölüm bulunamadı</h3>
          <p className="text-gray-500 mb-4">
            {searchTerm || selectedCategory !== 'all' 
              ? 'Arama kriterlerinize uygun bölüm bulunamadı.' 
              : 'Henüz hiç bölüm eklenmemiş.'}
          </p>
          <Link
            to="/admin/departments/new"
            className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors inline-flex items-center"
          >
            <FaPlus className="mr-2" />
            İlk Bölümü Ekle
          </Link>
        </div>
      )}
    </div>
  );
};

export default AdminDepartments;
