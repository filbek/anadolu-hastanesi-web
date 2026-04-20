import { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaSearch, FaDownload, FaFileAlt, FaSave } from 'react-icons/fa';

interface PatientDocument {
  id: number;
  title: string;
  description: string;
  category: string;
  file_url: string;
  file_size: string;
  is_published: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

const AdminPatientInfo = () => {
  const [documents, setDocuments] = useState<PatientDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [editingDocument, setEditingDocument] = useState<PatientDocument | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'genel',
    file_url: '',
    file_size: '',
    is_published: true,
    display_order: 1
  });

  const categories = [
    { value: 'all', label: 'Tüm Kategoriler' },
    { value: 'ameliyat', label: 'Ameliyat Öncesi/Sonrası' },
    { value: 'taburcu', label: 'Taburcu Bilgileri' },
    { value: 'tedavi', label: 'Tedavi Süreçleri' },
    { value: 'beslenme', label: 'Beslenme Rehberleri' },
    { value: 'ilaç', label: 'İlaç Kullanımı' },
    { value: 'genel', label: 'Genel Bilgiler' }
  ];

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      setLoading(true);

      // Create sample documents data since table might not exist
      const sampleDocuments: PatientDocument[] = [
        {
          id: 1,
          title: 'Ameliyat Öncesi Hazırlık Rehberi',
          description: 'Ameliyat öncesinde yapılması ve yapılmaması gerekenler hakkında detaylı bilgiler',
          category: 'ameliyat',
          file_url: '/documents/ameliyat-oncesi-rehber.pdf',
          file_size: '2.5 MB',
          is_published: true,
          display_order: 1,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 2,
          title: 'Taburcu Sonrası Bakım Kılavuzu',
          description: 'Hastaneden taburcu olduktan sonra evde dikkat edilmesi gerekenler',
          category: 'taburcu',
          file_url: '/documents/taburcu-bakim-kilavuzu.pdf',
          file_size: '1.8 MB',
          is_published: true,
          display_order: 2,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 3,
          title: 'Diyabet Hastaları İçin Beslenme Rehberi',
          description: 'Diyabet hastalarının günlük beslenme planı ve öneriler',
          category: 'beslenme',
          file_url: '/documents/diyabet-beslenme-rehberi.pdf',
          file_size: '3.2 MB',
          is_published: true,
          display_order: 3,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 4,
          title: 'İlaç Kullanım Kılavuzu',
          description: 'Reçeteli ilaçların doğru kullanımı ve yan etkileri hakkında bilgiler',
          category: 'ilaç',
          file_url: '/documents/ilac-kullanim-kilavuzu.pdf',
          file_size: '1.5 MB',
          is_published: true,
          display_order: 4,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 5,
          title: 'Kalp Ameliyatı Sonrası Rehabilitasyon',
          description: 'Kalp ameliyatı geçiren hastaların rehabilitasyon süreci',
          category: 'tedavi',
          file_url: '/documents/kalp-ameliyati-rehabilitasyon.pdf',
          file_size: '4.1 MB',
          is_published: true,
          display_order: 5,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 6,
          title: 'Genel Hasta Hakları',
          description: 'Hastane hizmetlerinden yararlanırken sahip olduğunuz haklar',
          category: 'genel',
          file_url: '/documents/hasta-haklari.pdf',
          file_size: '1.2 MB',
          is_published: true,
          display_order: 6,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];

      setDocuments(sampleDocuments);
    } catch (error) {
      console.error('Error fetching documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const documentData = {
        ...formData,
        updated_at: new Date().toISOString()
      };

      if (editingDocument) {
        // Update existing document
        setDocuments(documents.map(doc =>
          doc.id === editingDocument.id
            ? { ...doc, ...documentData, updated_at: new Date().toISOString() }
            : doc
        ));
      } else {
        // Create new document
        const newDocument: PatientDocument = {
          id: Date.now(),
          ...documentData,
          created_at: new Date().toISOString()
        } as PatientDocument;

        setDocuments([newDocument, ...documents]);
      }

      setShowForm(false);
      setEditingDocument(null);
      setFormData({
        title: '',
        description: '',
        category: 'genel',
        file_url: '',
        file_size: '',
        is_published: true,
        display_order: documents.length + 1
      });

      alert(editingDocument ? 'Belge güncellendi!' : 'Belge eklendi!');
    } catch (error) {
      console.error('Error saving document:', error);
      alert('Belge kaydedilirken hata oluştu!');
    }
  };

  const deleteDocument = async (id: number) => {
    if (!confirm('Bu belgeyi silmek istediğinizden emin misiniz?')) return;

    try {
      setDocuments(documents.filter(doc => doc.id !== id));
      alert('Belge silindi!');
    } catch (error) {
      console.error('Error deleting document:', error);
      alert('Belge silinirken hata oluştu!');
    }
  };

  const editDocument = (document: PatientDocument) => {
    setEditingDocument(document);
    setFormData({
      title: document.title,
      description: document.description,
      category: document.category,
      file_url: document.file_url,
      file_size: document.file_size,
      is_published: document.is_published,
      display_order: document.display_order
    });
    setShowForm(true);
  };

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || doc.category === selectedCategory;
    return matchesSearch && matchesCategory;
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
        <h1 className="text-2xl font-semibold text-primary">Hasta Bilgilendirme Belgeleri</h1>
        <button
          onClick={() => {
            setShowForm(true);
            setEditingDocument(null);
            setFormData({
              title: '',
              description: '',
              category: 'genel',
              file_url: '',
              file_size: '',
              is_published: true,
              display_order: documents.length + 1
            });
          }}
          className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors flex items-center"
        >
          <FaPlus className="mr-2" />
          Yeni Belge
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Belge ara..."
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
            {categories.map(category => (
              <option key={category.value} value={category.value}>
                {category.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Documents Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Belge
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Kategori
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Boyut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Durum
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sıra
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  İşlemler
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredDocuments.map((document: PatientDocument) => (
                <tr key={document.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <FaFileAlt className="text-primary mr-3" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">{document.title}</div>
                        <div className="text-sm text-gray-500 line-clamp-1">{document.description}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-primary/10 text-primary">
                      {categories.find(c => c.value === document.category)?.label}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {document.file_size}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${document.is_published
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                      }`}>
                      {document.is_published ? 'Yayında' : 'Taslak'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {document.display_order}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    <button
                      onClick={() => window.open(document.file_url, '_blank')}
                      className="text-green-600 hover:text-green-800 transition-colors"
                      title="İndir"
                    >
                      <FaDownload />
                    </button>
                    <button
                      onClick={() => editDocument(document)}
                      className="text-blue-600 hover:text-blue-800 transition-colors"
                      title="Düzenle"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => deleteDocument(document.id)}
                      className="text-red-600 hover:text-red-800 transition-colors"
                      title="Sil"
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredDocuments.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">📄</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Belge bulunamadı</h3>
          <p className="text-gray-500 mb-4">
            {searchTerm || selectedCategory !== 'all'
              ? 'Arama kriterlerinize uygun belge bulunamadı.'
              : 'Henüz hiç belge eklenmemiş.'}
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors inline-flex items-center"
          >
            <FaPlus className="mr-2" />
            İlk Belgeyi Ekle
          </button>
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4">
              {editingDocument ? 'Belge Düzenle' : 'Yeni Belge'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Belge Başlığı
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Açıklama
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Kategori
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    {categories.filter(c => c.value !== 'all').map(category => (
                      <option key={category.value} value={category.value}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Dosya Boyutu
                  </label>
                  <input
                    type="text"
                    value={formData.file_size}
                    onChange={(e) => setFormData({ ...formData, file_size: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="2.5 MB"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Dosya URL
                </label>
                <input
                  type="url"
                  value={formData.file_url}
                  onChange={(e) => setFormData({ ...formData, file_url: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="/documents/belge.pdf"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Görüntüleme Sırası
                  </label>
                  <input
                    type="number"
                    value={formData.display_order}
                    onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    min="1"
                    required
                  />
                </div>

                <div className="flex items-center pt-6">
                  <input
                    type="checkbox"
                    id="is_published"
                    checked={formData.is_published}
                    onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
                    className="mr-2"
                  />
                  <label htmlFor="is_published" className="text-sm font-medium text-gray-700">
                    Yayında
                  </label>
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark flex items-center"
                >
                  <FaSave className="mr-2" />
                  {editingDocument ? 'Güncelle' : 'Oluştur'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPatientInfo;
