import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaPlus, FaEdit, FaTrash, FaSearch, FaEyeSlash } from 'react-icons/fa';
import { getDepartments, deleteDepartment } from '../../services/departmentService';
import type { Department } from '../../lib/supabase';

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
      const data = await getDepartments();
      setDepartments(data || []);
    } catch (error) {
      console.error('Error fetching departments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Bu bölümü silmek istediğinizden emin misiniz?')) return;

    try {
      const { error } = await deleteDepartment(id);
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
      (dept.description || '').toLowerCase().includes(searchTerm.toLowerCase());
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
          <div key={department.id} className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow relative overflow-hidden">
            {!department.is_published && (
              <div className="absolute top-0 right-0 bg-yellow-400 text-white text-[10px] font-bold px-2 py-1 rounded-bl-lg flex items-center shadow-sm">
                <FaEyeSlash className="mr-1" /> TASLAK
              </div>
            )}

            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <i className={`bi ${department.icon || 'bi-hospital'} text-primary text-xl`}></i>
              </div>
              <div className="flex space-x-2">
                <Link
                  to={`/admin/departments/edit/${department.id}`}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Düzenle"
                >
                  <FaEdit />
                </Link>
                <button
                  onClick={() => handleDelete(department.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Sil"
                >
                  <FaTrash />
                </button>
              </div>
            </div>

            <h3 className="text-lg font-semibold text-primary mb-1">{department.name}</h3>

            <div className="flex flex-wrap gap-2 mb-3">
              {department.category && (
                <span className="inline-block bg-primary/5 text-primary text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {department.category}
                </span>
              )}
              <span className="inline-block bg-gray-100 text-gray-600 text-[10px] font-bold px-2 py-0.5 rounded-full">
                Sıra: {department.display_order}
              </span>
            </div>

            {department.description && (
              <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                {department.description}
              </p>
            )}

            <div className="flex items-center justify-between pt-4 border-t border-gray-50 text-[10px] text-gray-400">
              <span>Slug: {department.slug}</span>
              <span>{new Date(department.created_at).toLocaleDateString('tr-TR')}</span>
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
