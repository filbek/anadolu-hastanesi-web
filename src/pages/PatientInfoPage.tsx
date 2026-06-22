import DynamicPageRenderer from '../components/common/DynamicPageRenderer'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
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
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { value: 'all', label: t('patientInfo.catAll', 'Tüm Belgeler') },
    { value: 'ameliyat', label: t('patientInfo.catSurgery', 'Ameliyat Öncesi/Sonrası') },
    { value: 'taburcu', label: t('patientInfo.catDischarge', 'Taburcu Bilgileri') },
    { value: 'tedavi', label: t('patientInfo.catTreatment', 'Tedavi Süreçleri') },
    { value: 'beslenme', label: t('patientInfo.catNutrition', 'Beslenme Rehberleri') },
    { value: 'ilaç', label: t('patientInfo.catMedication', 'İlaç Kullanımı') },
    { value: 'genel', label: t('patientInfo.catGeneral', 'Genel Bilgiler') }
  ];

  const documents: InfoDocument[] = [
    {
      id: 1,
      title: t('patientInfo.doc1Title', 'Ameliyat Öncesi Hazırlık Rehberi'),
      description: t('patientInfo.doc1Desc', 'Ameliyat öncesinde yapılması ve yapılmaması gerekenler hakkında detaylı bilgiler'),
      category: 'ameliyat',
      downloadUrl: '/documents/ameliyat-oncesi-rehber.pdf',
      fileSize: '2.5 MB',
      lastUpdated: '2024-01-15',
      icon: FaUserMd
    },
    {
      id: 2,
      title: t('patientInfo.doc2Title', 'Taburcu Sonrası Bakım Kılavuzu'),
      description: t('patientInfo.doc2Desc', 'Hastaneden taburcu olduktan sonra evde dikkat edilmesi gerekenler'),
      category: 'taburcu',
      downloadUrl: '/documents/taburcu-bakim-kilavuzu.pdf',
      fileSize: '1.8 MB',
      lastUpdated: '2024-01-10',
      icon: FaHospital
    },
    {
      id: 3,
      title: t('patientInfo.doc3Title', 'Diyabet Hastaları İçin Beslenme Rehberi'),
      description: t('patientInfo.doc3Desc', 'Diyabet hastalarının günlük beslenme planı ve öneriler'),
      category: 'beslenme',
      downloadUrl: '/documents/diyabet-beslenme-rehberi.pdf',
      fileSize: '3.2 MB',
      lastUpdated: '2024-01-05',
      icon: FaFileAlt
    },
    {
      id: 4,
      title: t('patientInfo.doc4Title', 'İlaç Kullanım Kılavuzu'),
      description: t('patientInfo.doc4Desc', 'Reçeteli ilaçların doğru kullanımı ve yan etkileri hakkında bilgiler'),
      category: 'ilaç',
      downloadUrl: '/documents/ilac-kullanim-kilavuzu.pdf',
      fileSize: '1.5 MB',
      lastUpdated: '2024-01-01',
      icon: FaInfoCircle
    },
    {
      id: 5,
      title: t('patientInfo.doc5Title', 'Kalp Ameliyatı Sonrası Rehabilitasyon'),
      description: t('patientInfo.doc5Desc', 'Kalp ameliyatı geçiren hastaların rehabilitasyon süreci'),
      category: 'tedavi',
      downloadUrl: '/documents/kalp-ameliyati-rehabilitasyon.pdf',
      fileSize: '4.1 MB',
      lastUpdated: '2023-12-28',
      icon: FaUserMd
    },
    {
      id: 6,
      title: t('patientInfo.doc6Title', 'Genel Hasta Hakları'),
      description: t('patientInfo.doc6Desc', 'Hastane hizmetlerinden yararlanırken sahip olduğunuz haklar'),
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
            {t('patientInfo.pageTitle', 'Hasta Bilgilendirme')}
          </motion.h1>
          <motion.p 
            className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            {t('patientInfo.pageSubtitle', 'Tedavi sürecinizde ihtiyaç duyacağınız tüm bilgi ve belgeler')}
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
                placeholder={t('patientInfo.searchPlaceholder', 'Belge ara...')}
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
            title={t('patientInfo.documentsTitle', 'Bilgilendirme Belgeleri')}
            subtitle={t('patientInfo.documentsSubtitle', 'Tedavi sürecinizde size yardımcı olacak rehber ve belgeler')}
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
                  <span>{t('patientInfo.updated', 'Güncelleme:')} {new Date(doc.lastUpdated).toLocaleDateString('tr-TR')}</span>
                </div>
                
                <button
                  onClick={() => window.open(doc.downloadUrl, '_blank')}
                  className="w-full bg-primary text-white py-2 px-4 rounded-lg hover:bg-primary-dark transition-colors flex items-center justify-center"
                >
                  <FaDownload className="mr-2" />
                  {t('common.download', 'İndir')}
                </button>
              </motion.div>
            ))}
          </div>

          {filteredDocuments.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">📄</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">{t('patientInfo.notFound', 'Belge bulunamadı')}</h3>
              <p className="text-gray-500">
                {t('patientInfo.noResultsDesc', 'Arama kriterlerinize uygun belge bulunamadı. Lütfen farklı anahtar kelimeler deneyin.')}
              </p>
            </div>
          )}
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
