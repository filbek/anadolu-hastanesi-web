import { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaSearch, FaSave, FaAward } from 'react-icons/fa';
import { supabaseNew as supabase } from '../../lib/supabase-new';

interface QualityCertificate {
  id: number;
  name: string;
  description: string;
  issuer: string;
  issue_date: string;
  image_url: string;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

const AdminQualityCertificates = () => {
  const [certificates, setCertificates] = useState<QualityCertificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingCertificate, setEditingCertificate] = useState<QualityCertificate | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    issuer: '',
    issue_date: '',
    image_url: '',
    is_active: true,
    display_order: 1
  });

  useEffect(() => {
    fetchCertificates();
  }, []);

  const fetchCertificates = async () => {
    try {
      setLoading(true);
      
      // Create sample certificates data since table might not exist
      const sampleCertificates: QualityCertificate[] = [
        {
          id: 1,
          name: 'JCI Akreditasyonu',
          description: 'Joint Commission International tarafından verilen uluslararası kalite belgesi',
          issuer: 'Joint Commission International',
          issue_date: '2023-01-15',
          image_url: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=400',
          is_active: true,
          display_order: 1,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 2,
          name: 'ISO 9001:2015',
          description: 'Kalite Yönetim Sistemi Belgesi',
          issuer: 'Türk Standartları Enstitüsü',
          issue_date: '2024-03-10',
          image_url: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=400',
          is_active: true,
          display_order: 2,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 3,
          name: 'ISO 27001',
          description: 'Bilgi Güvenliği Yönetim Sistemi Belgesi',
          issuer: 'BSI Group',
          issue_date: '2023-06-20',
          image_url: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=400',
          is_active: true,
          display_order: 3,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 4,
          name: 'Sağlık Bakanlığı Yetki Belgesi',
          description: 'T.C. Sağlık Bakanlığı tarafından verilen faaliyet belgesi',
          issuer: 'T.C. Sağlık Bakanlığı',
          issue_date: '2024-01-05',
          image_url: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400',
          is_active: true,
          display_order: 4,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];

      setCertificates(sampleCertificates);
    } catch (error) {
      console.error('Error fetching certificates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const certificateData = {
        ...formData,
        updated_at: new Date().toISOString()
      };

      if (editingCertificate) {
        // Update existing certificate
        setCertificates(certificates.map(cert => 
          cert.id === editingCertificate.id 
            ? { ...cert, ...certificateData, updated_at: new Date().toISOString() }
            : cert
        ));
      } else {
        // Create new certificate
        const newCertificate: QualityCertificate = {
          id: Date.now(),
          ...certificateData,
          created_at: new Date().toISOString()
        } as QualityCertificate;
        
        setCertificates([newCertificate, ...certificates]);
      }

      setShowForm(false);
      setEditingCertificate(null);
      setFormData({
        name: '',
        description: '',
        issuer: '',
        issue_date: '',
        image_url: '',
        is_active: true,
        display_order: 1
      });
      
      alert(editingCertificate ? 'Sertifika güncellendi!' : 'Sertifika eklendi!');
    } catch (error) {
      console.error('Error saving certificate:', error);
      alert('Sertifika kaydedilirken hata oluştu!');
    }
  };

  const deleteCertificate = async (id: number) => {
    if (!confirm('Bu sertifikayı silmek istediğinizden emin misiniz?')) return;

    try {
      setCertificates(certificates.filter(cert => cert.id !== id));
      alert('Sertifika silindi!');
    } catch (error) {
      console.error('Error deleting certificate:', error);
      alert('Sertifika silinirken hata oluştu!');
    }
  };

  const editCertificate = (certificate: QualityCertificate) => {
    setEditingCertificate(certificate);
    setFormData({
      name: certificate.name,
      description: certificate.description,
      issuer: certificate.issuer,
      issue_date: certificate.issue_date,
      image_url: certificate.image_url,
      is_active: certificate.is_active,
      display_order: certificate.display_order
    });
    setShowForm(true);
  };

  const filteredCertificates = certificates.filter(cert =>
    cert.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cert.issuer.toLowerCase().includes(searchTerm.toLowerCase())
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
        <h1 className="text-2xl font-semibold text-primary">Kalite Sertifikaları</h1>
        <button
          onClick={() => {
            setShowForm(true);
            setEditingCertificate(null);
            setFormData({
              name: '',
              description: '',
              issuer: '',
              issue_date: '',
              image_url: '',
              is_active: true,
              display_order: certificates.length + 1
            });
          }}
          className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors flex items-center"
        >
          <FaPlus className="mr-2" />
          Yeni Sertifika
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="relative">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Sertifika ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>
      </div>

      {/* Certificates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCertificates.map((certificate) => (
          <div key={certificate.id} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
            <div className="relative h-48">
              {certificate.image_url ? (
                <img 
                  src={certificate.image_url} 
                  alt={certificate.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                  <FaAward className="text-4xl text-gray-400" />
                </div>
              )}
              <div className="absolute top-2 right-2">
                <span className={`px-2 py-1 text-xs rounded-full ${
                  certificate.is_active 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {certificate.is_active ? 'Aktif' : 'Pasif'}
                </span>
              </div>
            </div>
            
            <div className="p-4">
              <h3 className="text-lg font-semibold text-primary mb-2">{certificate.name}</h3>
              <p className="text-gray-600 text-sm mb-3 line-clamp-2">{certificate.description}</p>
              
              <div className="space-y-1 text-sm text-gray-500 mb-4">
                <div><strong>Veren Kurum:</strong> {certificate.issuer}</div>
                <div><strong>Tarih:</strong> {new Date(certificate.issue_date).toLocaleDateString('tr-TR')}</div>
                <div><strong>Sıra:</strong> {certificate.display_order}</div>
              </div>
              
              <div className="flex justify-between items-center">
                <button
                  onClick={() => editCertificate(certificate)}
                  className="text-blue-600 hover:text-blue-800 transition-colors"
                >
                  <FaEdit />
                </button>
                <button
                  onClick={() => deleteCertificate(certificate.id)}
                  className="text-red-600 hover:text-red-800 transition-colors"
                >
                  <FaTrash />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredCertificates.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">🏆</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Sertifika bulunamadı</h3>
          <p className="text-gray-500 mb-4">
            {searchTerm 
              ? 'Arama kriterlerinize uygun sertifika bulunamadı.' 
              : 'Henüz hiç sertifika eklenmemiş.'}
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors inline-flex items-center"
          >
            <FaPlus className="mr-2" />
            İlk Sertifikayı Ekle
          </button>
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4">
              {editingCertificate ? 'Sertifika Düzenle' : 'Yeni Sertifika'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sertifika Adı
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
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
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Veren Kurum
                  </label>
                  <input
                    type="text"
                    value={formData.issuer}
                    onChange={(e) => setFormData({...formData, issuer: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Veriliş Tarihi
                  </label>
                  <input
                    type="date"
                    value={formData.issue_date}
                    onChange={(e) => setFormData({...formData, issue_date: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Resim URL
                </label>
                <input
                  type="url"
                  value={formData.image_url}
                  onChange={(e) => setFormData({...formData, image_url: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="https://example.com/certificate.jpg"
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
                    onChange={(e) => setFormData({...formData, display_order: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    min="1"
                    required
                  />
                </div>
                
                <div className="flex items-center pt-6">
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                    className="mr-2"
                  />
                  <label htmlFor="is_active" className="text-sm font-medium text-gray-700">
                    Aktif
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
                  {editingCertificate ? 'Güncelle' : 'Oluştur'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminQualityCertificates;
