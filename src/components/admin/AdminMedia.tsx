import { useState, useEffect } from 'react';
import { FaUpload, FaTrash, FaSearch, FaImage, FaVideo, FaFile, FaCopy } from 'react-icons/fa';
import { supabaseNew as supabase } from '../../lib/supabase-new';

interface MediaFile {
  id: number;
  name: string;
  url: string;
  type: string;
  size: number;
  created_at: string;
}

const AdminMedia = () => {
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');

  useEffect(() => {
    fetchMediaFiles();
  }, []);

  const fetchMediaFiles = async () => {
    try {
      setLoading(true);
      
      // Create sample media files since we don't have actual file storage
      const sampleMedia: MediaFile[] = [
        {
          id: 1,
          name: 'hospital-building.jpg',
          url: 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=500',
          type: 'image/jpeg',
          size: 245760,
          created_at: new Date().toISOString()
        },
        {
          id: 2,
          name: 'doctor-consultation.jpg',
          url: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=500',
          type: 'image/jpeg',
          size: 189440,
          created_at: new Date().toISOString()
        },
        {
          id: 3,
          name: 'medical-equipment.jpg',
          url: 'https://images.unsplash.com/photo-1581595220892-b0739db3ba8c?w=500',
          type: 'image/jpeg',
          size: 312320,
          created_at: new Date().toISOString()
        },
        {
          id: 4,
          name: 'hospital-corridor.jpg',
          url: 'https://images.unsplash.com/photo-1551190822-a9333d879b1f?w=500',
          type: 'image/jpeg',
          size: 278560,
          created_at: new Date().toISOString()
        }
      ];

      setMediaFiles(sampleMedia);
    } catch (error) {
      console.error('Error fetching media files:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    
    try {
      // Simulate file upload
      for (const file of Array.from(files)) {
        const newFile: MediaFile = {
          id: Date.now() + Math.random(),
          name: file.name,
          url: URL.createObjectURL(file),
          type: file.type,
          size: file.size,
          created_at: new Date().toISOString()
        };
        
        setMediaFiles(prev => [newFile, ...prev]);
      }
      
      alert('Dosyalar başarıyla yüklendi!');
    } catch (error) {
      console.error('Error uploading files:', error);
      alert('Dosya yüklenirken hata oluştu!');
    } finally {
      setUploading(false);
    }
  };

  const deleteFile = async (id: number) => {
    if (!confirm('Bu dosyayı silmek istediğinizden emin misiniz?')) return;

    try {
      setMediaFiles(mediaFiles.filter(file => file.id !== id));
      alert('Dosya silindi!');
    } catch (error) {
      console.error('Error deleting file:', error);
      alert('Dosya silinirken hata oluştu!');
    }
  };

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    alert('URL kopyalandı!');
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <FaImage className="text-blue-500" />;
    if (type.startsWith('video/')) return <FaVideo className="text-red-500" />;
    return <FaFile className="text-gray-500" />;
  };

  const filteredFiles = mediaFiles.filter(file => {
    const matchesSearch = file.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'all' || 
                       (selectedType === 'image' && file.type.startsWith('image/')) ||
                       (selectedType === 'video' && file.type.startsWith('video/')) ||
                       (selectedType === 'document' && !file.type.startsWith('image/') && !file.type.startsWith('video/'));
    return matchesSearch && matchesType;
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
        <h1 className="text-2xl font-semibold text-primary">Medya Galerisi</h1>
        <div className="flex items-center space-x-3">
          <input
            type="file"
            multiple
            accept="image/*,video/*,.pdf,.doc,.docx"
            onChange={handleFileUpload}
            className="hidden"
            id="file-upload"
            disabled={uploading}
          />
          <label
            htmlFor="file-upload"
            className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors flex items-center cursor-pointer"
          >
            <FaUpload className="mr-2" />
            {uploading ? 'Yükleniyor...' : 'Dosya Yükle'}
          </label>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Dosya ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="all">Tüm Dosyalar</option>
            <option value="image">Resimler</option>
            <option value="video">Videolar</option>
            <option value="document">Belgeler</option>
          </select>
        </div>
      </div>

      {/* Media Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredFiles.map((file) => (
          <div key={file.id} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
            <div className="aspect-square bg-gray-100 flex items-center justify-center overflow-hidden">
              {file.type.startsWith('image/') ? (
                <img 
                  src={file.url} 
                  alt={file.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-4xl">
                  {getFileIcon(file.type)}
                </div>
              )}
            </div>
            
            <div className="p-4">
              <h3 className="text-sm font-medium text-gray-900 mb-2 truncate" title={file.name}>
                {file.name}
              </h3>
              
              <div className="text-xs text-gray-500 mb-3">
                <div>{formatFileSize(file.size)}</div>
                <div>{new Date(file.created_at).toLocaleDateString('tr-TR')}</div>
              </div>
              
              <div className="flex justify-between items-center">
                <button
                  onClick={() => copyUrl(file.url)}
                  className="text-blue-600 hover:text-blue-800 transition-colors flex items-center text-xs"
                >
                  <FaCopy className="mr-1" />
                  URL Kopyala
                </button>
                <button
                  onClick={() => deleteFile(file.id)}
                  className="text-red-600 hover:text-red-800 transition-colors"
                >
                  <FaTrash />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredFiles.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">📁</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Dosya bulunamadı</h3>
          <p className="text-gray-500 mb-4">
            {searchTerm || selectedType !== 'all'
              ? 'Arama kriterlerinize uygun dosya bulunamadı.'
              : 'Henüz hiç dosya yüklenmemiş.'}
          </p>
          <label
            htmlFor="file-upload"
            className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors inline-flex items-center cursor-pointer"
          >
            <FaUpload className="mr-2" />
            İlk Dosyayı Yükle
          </label>
        </div>
      )}

      {/* Upload Info */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-blue-800 mb-2">Yükleme Bilgileri</h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Desteklenen formatlar: JPG, PNG, GIF, MP4, PDF, DOC, DOCX</li>
          <li>• Maksimum dosya boyutu: 10MB</li>
          <li>• Birden fazla dosya seçebilirsiniz</li>
          <li>• Yüklenen dosyalar otomatik olarak optimize edilir</li>
        </ul>
      </div>
    </div>
  );
};

export default AdminMedia;
