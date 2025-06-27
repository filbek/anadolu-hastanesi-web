import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaPlus, FaEdit, FaTrash, FaSearch, FaEye, FaFileAlt, FaVideo, FaFilePdf } from 'react-icons/fa';
import { supabaseNew as supabase } from '../../lib/supabase-new';
import type { HealthArticle } from '../../lib/supabase-new';

const AdminArticles = () => {
  const [articles, setArticles] = useState<HealthArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedType, setSelectedType] = useState('all');

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('health_articles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setArticles(data || []);
    } catch (error) {
      console.error('Error fetching articles:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteArticle = async (id: number) => {
    if (!confirm('Bu makaleyi silmek istediğinizden emin misiniz?')) return;

    try {
      const { error } = await supabase
        .from('health_articles')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setArticles(articles.filter(article => article.id !== id));
      alert('Makale başarıyla silindi!');
    } catch (error) {
      console.error('Error deleting article:', error);
      alert('Makale silinirken hata oluştu!');
    }
  };

  const updateViews = async (id: number, currentViews: number) => {
    try {
      const { error } = await supabase
        .from('health_articles')
        .update({ views: currentViews + 1 })
        .eq('id', id);

      if (error) throw error;
      
      setArticles(articles.map(article => 
        article.id === id ? { ...article, views: currentViews + 1 } : article
      ));
    } catch (error) {
      console.error('Error updating views:', error);
    }
  };

  const filteredArticles = articles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         article.content?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || article.category === selectedCategory;
    const matchesType = selectedType === 'all' || article.type === selectedType;
    return matchesSearch && matchesCategory && matchesType;
  });

  const categories = ['all', ...Array.from(new Set(articles.map(article => article.category).filter(Boolean)))];
  const types = ['all', 'article', 'video', 'pdf'];

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return <FaVideo className="text-red-500" />;
      case 'pdf': return <FaFilePdf className="text-red-600" />;
      default: return <FaFileAlt className="text-blue-500" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'video': return 'Video';
      case 'pdf': return 'PDF';
      default: return 'Makale';
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
        <h1 className="text-2xl font-semibold text-primary">Makale Yönetimi</h1>
        <Link
          to="/admin/articles/new"
          className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors flex items-center"
        >
          <FaPlus className="mr-2" />
          Yeni Makale
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Makale ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
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
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="all">Tüm Türler</option>
            {types.filter(type => type !== 'all').map(type => (
              <option key={type} value={type}>
                {getTypeLabel(type)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Articles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredArticles.map((article) => (
          <div key={article.id} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
            {article.image && (
              <div className="h-48 bg-gray-200 overflow-hidden">
                <img 
                  src={article.image} 
                  alt={article.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            
            <div className="p-6">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  {getTypeIcon(article.type)}
                  <span className="text-xs text-gray-500">{getTypeLabel(article.type)}</span>
                </div>
                <div className="flex space-x-2">
                  <Link
                    to={`/admin/articles/edit/${article.id}`}
                    className="text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    <FaEdit />
                  </Link>
                  <button
                    onClick={() => deleteArticle(article.id)}
                    className="text-red-600 hover:text-red-800 transition-colors"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
              
              <h3 className="text-lg font-semibold text-primary mb-2 line-clamp-2">
                {article.title}
              </h3>
              
              {article.category && (
                <span className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full mb-3">
                  {article.category}
                </span>
              )}
              
              {article.content && (
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                  {article.content.replace(/<[^>]*>/g, '')}
                </p>
              )}
              
              <div className="flex items-center justify-between text-xs text-gray-500">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center">
                    <FaEye className="mr-1" />
                    <span>{article.views || 0}</span>
                  </div>
                  <div>
                    {new Date(article.date || article.created_at).toLocaleDateString('tr-TR')}
                  </div>
                </div>
                <button
                  onClick={() => updateViews(article.id, article.views || 0)}
                  className="text-primary hover:text-primary-dark transition-colors"
                  title="Görüntüleme sayısını artır"
                >
                  <FaEye />
                </button>
              </div>
              
              {article.tags && article.tags.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1">
                  {article.tags.slice(0, 3).map((tag, index) => (
                    <span 
                      key={index}
                      className="bg-primary/10 text-primary text-xs px-2 py-1 rounded"
                    >
                      #{tag}
                    </span>
                  ))}
                  {article.tags.length > 3 && (
                    <span className="text-xs text-gray-500">
                      +{article.tags.length - 3} daha
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredArticles.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">📰</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Makale bulunamadı</h3>
          <p className="text-gray-500 mb-4">
            {searchTerm || selectedCategory !== 'all' || selectedType !== 'all'
              ? 'Arama kriterlerinize uygun makale bulunamadı.' 
              : 'Henüz hiç makale eklenmemiş.'}
          </p>
          <Link
            to="/admin/articles/new"
            className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors inline-flex items-center"
          >
            <FaPlus className="mr-2" />
            İlk Makaleyi Ekle
          </Link>
        </div>
      )}
    </div>
  );
};

export default AdminArticles;
