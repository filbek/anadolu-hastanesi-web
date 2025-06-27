import DynamicPageRenderer from '../components/common/DynamicPageRenderer'
import { motion } from 'framer-motion'
import SectionTitle from '../components/ui/SectionTitle'
import { FaAward, FaCertificate, FaShieldAlt, FaCheckCircle } from 'react-icons/fa'

// Original quality certificates page as fallback
const OriginalQualityCertificatesPage = () => {
  const certificates = [
    {
      id: 1,
      name: 'JCI Akreditasyonu',
      description: 'Joint Commission International tarafından verilen uluslararası kalite belgesi',
      issuer: 'Joint Commission International',
      date: '2023',
      image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=400',
      icon: FaAward
    },
    {
      id: 2,
      name: 'ISO 9001:2015',
      description: 'Kalite Yönetim Sistemi Belgesi',
      issuer: 'Türk Standartları Enstitüsü',
      date: '2024',
      image: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=400',
      icon: FaCertificate
    },
    {
      id: 3,
      name: 'ISO 27001',
      description: 'Bilgi Güvenliği Yönetim Sistemi Belgesi',
      issuer: 'BSI Group',
      date: '2023',
      image: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=400',
      icon: FaShieldAlt
    },
    {
      id: 4,
      name: 'Sağlık Bakanlığı Yetki Belgesi',
      description: 'T.C. Sağlık Bakanlığı tarafından verilen faaliyet belgesi',
      issuer: 'T.C. Sağlık Bakanlığı',
      date: '2024',
      image: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400',
      icon: FaCheckCircle
    }
  ];

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
            Kalite Belgeleri
          </motion.h1>
          <motion.p 
            className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Uluslararası standartlarda hizmet kalitemizi belgeleyen sertifikalarımız
          </motion.p>
        </div>
      </section>

      {/* Certificates Grid */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <SectionTitle 
            title="Kalite Sertifikalarımız"
            subtitle="Hasta güvenliği ve hizmet kalitesi için aldığımız uluslararası belgeler"
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
            {certificates.map((cert, index) => (
              <motion.div
                key={cert.id}
                className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <div className="relative h-48 overflow-hidden">
                  <img 
                    src={cert.image} 
                    alt={cert.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-primary/20"></div>
                  <div className="absolute top-4 right-4 bg-white/90 p-3 rounded-full">
                    <cert.icon className="text-2xl text-primary" />
                  </div>
                </div>
                
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-primary mb-3">
                    {cert.name}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {cert.description}
                  </p>
                  <div className="flex justify-between items-center text-sm text-gray-500">
                    <span>{cert.issuer}</span>
                    <span className="bg-primary/10 text-primary px-3 py-1 rounded-full">
                      {cert.date}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Quality Standards */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <SectionTitle 
            title="Kalite Standartlarımız"
            subtitle="Hasta güvenliği ve hizmet kalitesi için uyguladığımız standartlar"
          />
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
            <motion.div
              className="text-center"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaShieldAlt className="text-2xl text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-primary mb-3">
                Hasta Güvenliği
              </h3>
              <p className="text-gray-600">
                Hasta güvenliğini en üst düzeyde tutmak için uluslararası protokolleri uyguluyoruz.
              </p>
            </motion.div>

            <motion.div
              className="text-center"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaAward className="text-2xl text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-primary mb-3">
                Kalite Yönetimi
              </h3>
              <p className="text-gray-600">
                Sürekli iyileştirme prensibi ile hizmet kalitemizi artırıyoruz.
              </p>
            </motion.div>

            <motion.div
              className="text-center"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaCertificate className="text-2xl text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-primary mb-3">
                Akreditasyon
              </h3>
              <p className="text-gray-600">
                Uluslararası akreditasyon kuruluşları tarafından düzenli olarak denetleniyoruz.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Kaliteli Sağlık Hizmeti İçin
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Uluslararası standartlarda hizmet veren hastanelerimizden randevu alın
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

const QualityCertificatesPage = () => {
  console.log('🏆 QualityCertificatesPage component rendered!');

  return (
    <DynamicPageRenderer
      slug="kalite-belgeleri"
      fallbackComponent={OriginalQualityCertificatesPage}
    />
  );
};

export default QualityCertificatesPage;
