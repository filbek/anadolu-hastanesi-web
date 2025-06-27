import DynamicPageRenderer from '../components/common/DynamicPageRenderer'
import { useState } from 'react'
import { motion } from 'framer-motion'
import SectionTitle from '../components/ui/SectionTitle'
import { FaFileAlt, FaDownload, FaSearch, FaInfoCircle, FaUserMd, FaHospital } from 'react-icons/fa'

interface InfoDocument {
  id: number;
  title: string;
  description: string;
  category: string;
  downloadUrl: string;
  fileSize: string;
  lastUpdated: string;
  icon: any;
}

// Original patient info page as fallback
const OriginalPatientInfoPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { value: 'all', label: 'Tüm Belgeler' },
    { value: 'ameliyat', label: 'Ameliyat Öncesi/Sonrası' },
    { value: 'taburcu', label: 'Taburcu Bilgileri' },
    { value: 'tedavi', label: 'Tedavi Süreçleri' },
    { value: 'beslenme', label: 'Beslenme Rehberleri' },
    { value: 'ilaç', label: 'İlaç Kullanımı' },
    { value: 'genel', label: 'Genel Bilgiler' }
  ];

  const documents: InfoDocument[] = [
    {
      id: 1,
      title: 'Ameliyat Öncesi Hazırlık Rehberi',
      description: 'Ameliyat öncesinde yapılması ve yapılmaması gerekenler hakkında detaylı bilgiler',
      category: 'ameliyat',
      downloadUrl: '/documents/ameliyat-oncesi-rehber.pdf',
      fileSize: '2.5 MB',
      lastUpdated: '2024-01-15',
      icon: FaUserMd
    },
    {
      id: 2,
      title: 'Taburcu Sonrası Bakım Kılavuzu',
      description: 'Hastaneden taburcu olduktan sonra evde dikkat edilmesi gerekenler',
      category: 'taburcu',
      downloadUrl: '/documents/taburcu-bakim-kilavuzu.pdf',
      fileSize: '1.8 MB',
      lastUpdated: '2024-01-10',
      icon: FaHospital
    },
    {
      id: 3,
      title: 'Diyabet Hastaları İçin Beslenme Rehberi',
      description: 'Diyabet hastalarının günlük beslenme planı ve öneriler',
      category: 'beslenme',
      downloadUrl: '/documents/diyabet-beslenme-rehberi.pdf',
      fileSize: '3.2 MB',
      lastUpdated: '2024-01-05',
      icon: FaFileAlt
    },
    {
      id: 4,
      title: 'İlaç Kullanım Kılavuzu',
      description: 'Reçeteli ilaçların doğru kullanımı ve yan etkileri hakkında bilgiler',
      category: 'ilaç',
      downloadUrl: '/documents/ilac-kullanim-kilavuzu.pdf',
      fileSize: '1.5 MB',
      lastUpdated: '2024-01-01',
      icon: FaInfoCircle
    },
    {
      id: 5,
      title: 'Kalp Ameliyatı Sonrası Rehabilitasyon',
      description: 'Kalp ameliyatı geçiren hastaların rehabilitasyon süreci',
      category: 'tedavi',
      downloadUrl: '/documents/kalp-ameliyati-rehabilitasyon.pdf',
      fileSize: '4.1 MB',
      lastUpdated: '2023-12-28',
      icon: FaUserMd
    },
    {
      id: 6,
      title: 'Genel Hasta Hakları',
      description: 'Hastane hizmetlerinden yararlanırken sahip olduğunuz haklar',
      category: 'genel',
      downloadUrl: '/documents/hasta-haklari.pdf',
      fileSize: '1.2 MB',
      lastUpdated: '2023-12-25',
      icon: FaInfoCircle
    }
  ];

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || doc.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="pt-24 pb-12">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary to-primary-dark text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <motion.h1 
            className="text-4xl md:text-6xl font-bold mb-6"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            Hasta Bilgilendirme
          </motion.h1>
          <motion.p 
            className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Tedavi sürecinizde ihtiyaç duyacağınız tüm bilgi ve belgeler
          </motion.p>
        </div>
      </section>

      {/* Search and Filter */}
      <section className="py-8 bg-white border-b">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative flex-1 max-w-md">
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
      </section>

      {/* Documents Grid */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <SectionTitle 
            title="Bilgilendirme Belgeleri"
            subtitle="Tedavi sürecinizde size yardımcı olacak rehber ve belgeler"
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
            {filteredDocuments.map((doc, index) => (
              <motion.div
                key={doc.id}
                className="bg-white rounded-lg shadow-sm p-6 hover:shadow-lg transition-shadow"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="bg-primary/10 p-3 rounded-lg">
                    <doc.icon className="text-2xl text-primary" />
                  </div>
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                    {categories.find(c => c.value === doc.category)?.label}
                  </span>
                </div>
                
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  {doc.title}
                </h3>
                
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                  {doc.description}
                </p>
                
                <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                  <span>{doc.fileSize}</span>
                  <span>Güncelleme: {new Date(doc.lastUpdated).toLocaleDateString('tr-TR')}</span>
                </div>
                
                <button
                  onClick={() => window.open(doc.downloadUrl, '_blank')}
                  className="w-full bg-primary text-white py-2 px-4 rounded-lg hover:bg-primary-dark transition-colors flex items-center justify-center"
                >
                  <FaDownload className="mr-2" />
                  İndir
                </button>
              </motion.div>
            ))}
          </div>

          {filteredDocuments.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">📄</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Belge bulunamadı</h3>
              <p className="text-gray-500">
                Arama kriterlerinize uygun belge bulunamadı. Lütfen farklı anahtar kelimeler deneyin.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Important Notes */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <SectionTitle 
            title="Önemli Notlar"
            subtitle="Belgeleri kullanırken dikkat edilmesi gerekenler"
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
            <motion.div
              className="bg-blue-50 border border-blue-200 rounded-lg p-6"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="flex items-center mb-4">
                <FaInfoCircle className="text-blue-600 text-2xl mr-3" />
                <h3 className="text-lg font-semibold text-blue-800">Genel Bilgilendirme</h3>
              </div>
              <ul className="text-blue-700 space-y-2 text-sm">
                <li>• Bu belgeler genel bilgilendirme amaçlıdır</li>
                <li>• Kişisel tedavi planınız için doktorunuza danışın</li>
                <li>• Belgeleri düzenli olarak güncelleyiniz</li>
                <li>• Sorularınız için hastane personelimize başvurun</li>
              </ul>
            </motion.div>

            <motion.div
              className="bg-green-50 border border-green-200 rounded-lg p-6"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="flex items-center mb-4">
                <FaUserMd className="text-green-600 text-2xl mr-3" />
                <h3 className="text-lg font-semibold text-green-800">Doktor Önerileri</h3>
              </div>
              <ul className="text-green-700 space-y-2 text-sm">
                <li>• Belgeleri doktorunuzla birlikte inceleyin</li>
                <li>• Anlamadığınız kısımları mutlaka sorun</li>
                <li>• Tedavi planınıza uygun belgeleri kullanın</li>
                <li>• Düzenli kontroller için randevu alın</li>
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Daha Fazla Bilgi İçin
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Sağlık durumunuz hakkında detaylı bilgi almak için uzman doktorlarımızdan randevu alın
          </p>
          <a
            href="https://anadoluhastaneleri.kendineiyibak.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-white text-primary px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors"
          >
            Online Randevu Al
          </a>
        </div>
      </section>
    </div>
  );
};

const PatientInfoPage = () => {
  return (
    <DynamicPageRenderer 
      slug="hasta-bilgilendirme" 
      fallbackComponent={OriginalPatientInfoPage}
    />
  );
};

export default PatientInfoPage;
