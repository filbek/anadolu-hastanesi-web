import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import SectionTitle from '../components/ui/SectionTitle'
import { FaMapMarkerAlt, FaPhone, FaArrowRight, FaSearch } from 'react-icons/fa'

const hospitals = [
  {
    id: 1,
    name: 'Anadolu Merkez Hastanesi',
    slug: 'anadolu-merkez-hastanesi',
    image: 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
    address: 'Atatürk Bulvarı No:123, Şişli, İstanbul',
    phone: '0212 123 45 67',
    description: 'Modern teknoloji ve uzman kadrosuyla hizmet veren ana hastanemiz. 24 saat acil servis, ameliyathane, yoğun bakım ve tüm branşlarda poliklinik hizmeti sunmaktadır.',
    departments: ['Kardiyoloji', 'Nöroloji', 'Ortopedi', 'Genel Cerrahi', 'Göz Hastalıkları', 'Dahiliye'],
    features: ['24 Saat Acil Servis', 'MR ve Tomografi', 'Yoğun Bakım Ünitesi', 'Ameliyathane', 'Laboratuvar'],
  },
  {
    id: 2,
    name: 'Anadolu Avrupa Hastanesi',
    slug: 'anadolu-avrupa-hastanesi',
    image: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
    address: 'Bağdat Caddesi No:456, Kadıköy, İstanbul',
    phone: '0216 987 65 43',
    description: 'Avrupa yakasında bulunan modern ve tam donanımlı hastanemiz. 24 saat acil servis, ameliyathane, yoğun bakım ve tüm branşlarda poliklinik hizmeti sunmaktadır.',
    departments: ['Kardiyoloji', 'Nöroloji', 'Ortopedi', 'Kadın Hastalıkları', 'Üroloji', 'Dahiliye'],
    features: ['24 Saat Acil Servis', 'MR ve Tomografi', 'Yoğun Bakım Ünitesi', 'Ameliyathane', 'Laboratuvar'],
  },
  {
    id: 3,
    name: 'Anadolu Çocuk Hastanesi',
    slug: 'anadolu-cocuk-hastanesi',
    image: 'https://images.unsplash.com/photo-1581056771107-24ca5f033842?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
    address: 'Cumhuriyet Caddesi No:789, Beşiktaş, İstanbul',
    phone: '0212 345 67 89',
    description: 'Çocuk sağlığı ve hastalıkları konusunda uzmanlaşmış hastanemiz. Çocuk acil servisi, çocuk yoğun bakım ve tüm pediatrik branşlarda hizmet vermektedir.',
    departments: ['Çocuk Sağlığı', 'Çocuk Kardiyolojisi', 'Çocuk Nörolojisi', 'Çocuk Cerrahisi', 'Çocuk Psikolojisi'],
    features: ['24 Saat Çocuk Acil Servisi', 'Çocuk Yoğun Bakım', 'Yenidoğan Ünitesi', 'Çocuk Ameliyathanesi', 'Oyun Alanları'],
  },
  {
    id: 4,
    name: 'Anadolu Uluslararası Hastanesi',
    slug: 'anadolu-uluslararasi-hastanesi',
    image: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
    address: 'İstiklal Caddesi No:101, Beyoğlu, İstanbul',
    phone: '0212 876 54 32',
    description: 'Uluslararası hasta hizmetleri sunan modern hastanemiz. Çok dilli personel, özel hasta hizmetleri ve tüm branşlarda hizmet vermektedir.',
    departments: ['Kardiyoloji', 'Nöroloji', 'Ortopedi', 'Plastik Cerrahi', 'Göz Hastalıkları', 'Diş Sağlığı'],
    features: ['24 Saat Acil Servis', 'Uluslararası Hasta Hizmetleri', 'VIP Odalar', 'Tercüman Hizmeti', 'Transfer Hizmetleri'],
  },
  {
    id: 5,
    name: 'Anadolu Fizik Tedavi ve Rehabilitasyon Merkezi',
    slug: 'anadolu-fizik-tedavi-rehabilitasyon-merkezi',
    image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
    address: 'Barbaros Bulvarı No:234, Beşiktaş, İstanbul',
    phone: '0212 456 78 90',
    description: 'Fizik tedavi ve rehabilitasyon hizmetleri sunan özel merkezimiz. Modern ekipmanlar ve uzman kadro ile hizmet vermektedir.',
    departments: ['Fizik Tedavi', 'Ortopedi', 'Nöroloji', 'Spor Hekimliği', 'Ağrı Tedavisi'],
    features: ['Hidroterapi Havuzu', 'Egzersiz Alanları', 'Elektroterapi Üniteleri', 'Manuel Terapi', 'Robotik Rehabilitasyon'],
  },
  {
    id: 6,
    name: 'Anadolu Diş Hastanesi',
    slug: 'anadolu-dis-hastanesi',
    image: 'https://images.unsplash.com/photo-1606811971618-4486d14f3f99?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
    address: 'Bağdat Caddesi No:567, Kadıköy, İstanbul',
    phone: '0216 345 67 89',
    description: 'Diş sağlığı ve hastalıkları konusunda uzmanlaşmış hastanemiz. Modern teknoloji ve uzman kadro ile hizmet vermektedir.',
    departments: ['Ağız ve Diş Sağlığı', 'Ortodonti', 'Endodonti', 'Periodontoloji', 'Ağız ve Çene Cerrahisi'],
    features: ['Dijital Diş Tarama', '3D Tomografi', 'Lazer Tedavisi', 'İmplant Merkezi', 'Estetik Diş Hekimliği'],
  },
]

const HospitalsPage = () => {
  const [searchTerm, setSearchTerm] = useState('')

  const filteredHospitals = hospitals.filter((hospital) =>
    hospital.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    hospital.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
    hospital.departments.some(dept => dept.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  }

  return (
    <>
      <Helmet>
        <title>Hastanelerimiz | Anadolu Hastaneleri Grubu</title>
        <meta name="description" content="Anadolu Hastaneleri Grubu'nun İstanbul'un farklı bölgelerinde hizmet veren hastaneleri hakkında bilgi alın." />
      </Helmet>

      <div className="pt-24 pb-12 bg-neutral">
        <div className="container-custom">
          <SectionTitle
            title="Hastanelerimiz"
            subtitle="Anadolu Hastaneleri Grubu olarak İstanbul'un farklı bölgelerinde hizmet veriyoruz."
          />

          <div className="max-w-xl mx-auto mb-12">
            <div className="relative">
              <input
                type="text"
                placeholder="Hastane adı, bölüm veya konum ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-12"
              />
              <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-text-light" />
            </div>
          </div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {filteredHospitals.map((hospital) => (
              <motion.div
                key={hospital.id}
                variants={itemVariants}
                className="card group hover:-translate-y-2"
              >
                <div className="relative h-48 mb-4 rounded-lg overflow-hidden">
                  <img
                    src={hospital.image}
                    alt={hospital.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    loading="lazy"
                    crossOrigin="anonymous"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                  <h3 className="absolute bottom-4 left-4 text-white font-semibold text-xl">{hospital.name}</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex items-start">
                    <FaMapMarkerAlt className="text-primary mt-1 mr-2 flex-shrink-0" />
                    <p className="text-sm text-text-light">{hospital.address}</p>
                  </div>
                  <div className="flex items-center">
                    <FaPhone className="text-primary mr-2 flex-shrink-0" />
                    <a href={`tel:${hospital.phone.replace(/\s/g, '')}`} className="text-sm text-text-light hover:text-primary transition-colors">
                      {hospital.phone}
                    </a>
                  </div>
                  <p className="text-text-light text-sm pt-2 line-clamp-3">{hospital.description}</p>
                  
                  <div className="pt-2">
                    <h4 className="text-sm font-medium text-primary mb-2">Bölümler:</h4>
                    <div className="flex flex-wrap gap-2">
                      {hospital.departments.slice(0, 3).map((dept, index) => (
                        <span key={index} className="text-xs bg-neutral px-2 py-1 rounded-full">
                          {dept}
                        </span>
                      ))}
                      {hospital.departments.length > 3 && (
                        <span className="text-xs bg-neutral px-2 py-1 rounded-full">
                          +{hospital.departments.length - 3}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <Link
                    to={`/hastanelerimiz/${hospital.slug}`}
                    className="inline-flex items-center text-primary font-medium mt-4 hover:text-primary-dark transition-colors"
                  >
                    Detaylı Bilgi <FaArrowRight className="ml-2" />
                  </Link>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {filteredHospitals.length === 0 && (
            <div className="text-center py-12">
              <i className="bi bi-search text-4xl text-text-light mb-4"></i>
              <h3 className="text-xl font-semibold mb-2">Sonuç Bulunamadı</h3>
              <p className="text-text-light">Arama kriterlerinize uygun hastane bulunamadı. Lütfen farklı bir arama terimi deneyin.</p>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default HospitalsPage
