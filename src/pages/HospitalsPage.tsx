import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import SectionTitle from '../components/ui/SectionTitle'
import { FaMapMarkerAlt, FaPhone, FaArrowRight, FaSearch } from 'react-icons/fa'
import { useHospitals } from '../hooks/useHospitals'


const HospitalsPage = () => {
  const { data: hospitals = [], isLoading, error } = useHospitals({ onlyPublished: true })
  const [searchTerm, setSearchTerm] = useState('')

  const filteredHospitals = hospitals.filter((hospital) =>
    hospital.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    hospital.address.toLowerCase().includes(searchTerm.toLowerCase())
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

  if (isLoading) {
    return (
      <div className="pt-24 pb-12 bg-neutral min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="pt-24 pb-12 bg-neutral min-h-screen text-center">
        <h3 className="text-xl font-semibold mb-2">Hata Oluştu</h3>
        <p className="text-text-light">Hastaneler yüklenirken bir sorun oluştu. Lütfen tekrar deneyin.</p>
      </div>
    )
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
                <div className="relative h-48 mb-4 rounded-lg overflow-hidden bg-slate-100">
                  <img
                    src={hospital.images && hospital.images[0] ? hospital.images[0] : 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=800&q=80'}
                    alt={hospital.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    loading="lazy"
                    crossOrigin="anonymous"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-0" />
                  <h3 className="absolute bottom-4 left-4 text-white font-bold text-xl drop-shadow-md z-10">{hospital.name}</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex items-start">
                    <FaMapMarkerAlt className="text-primary mt-1 mr-2 flex-shrink-0" />
                    <p className="text-sm text-text-light">{hospital.address}</p>
                  </div>
                  <div className="flex items-center">
                    <FaPhone className="text-primary mr-2 flex-shrink-0" />
                    <a href={`tel:${hospital.phone?.replace(/\s/g, '')}`} className="text-sm text-text-light hover:text-primary transition-colors">
                      {hospital.phone}
                    </a>
                  </div>
                  <p className="text-text-light text-sm pt-2 line-clamp-3">{hospital.description}</p>


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
              <FaSearch className="text-4xl text-text-light mx-auto mb-4" />
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
