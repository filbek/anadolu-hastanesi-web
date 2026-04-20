import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import SectionTitle from '../ui/SectionTitle'
import { FaMapMarkerAlt, FaPhone, FaArrowRight } from 'react-icons/fa'
import { useHospitals } from '../../hooks/useHospitals'

const HospitalBranches = () => {
  const { data: hospitals = [], isLoading } = useHospitals({ onlyPublished: true })

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
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
      <section className="py-20 bg-neutral">
        <div className="container-custom">
          <SectionTitle
            title="Hastane Şubelerimiz"
            subtitle="Hastanelerimiz yükleniyor..."
          />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="animate-pulse bg-white rounded-2xl h-80 shadow-sm border border-gray-100" />
            ))}
          </div>
        </div>
      </section>
    )
  }

  // Filter and sort hospitals for homepage
  const displayHospitals = hospitals
    .filter(h => h.display_on_homepage !== false) // Handle undefined as true for safety
    .sort((a, b) => (a.display_order || 0) - (b.display_order || 0))
    .slice(0, 4)

  return (
    <section className="py-20 bg-neutral">
      <div className="container-custom">
        <SectionTitle
          title="Hastane Şubelerimiz"
          subtitle="Anadolu Hastaneleri Grubu olarak İstanbul'un farklı bölgelerinde hizmet veriyoruz."
        />

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto"
        >
          {displayHospitals.map((hospital) => (
            <motion.div
              key={hospital.id}
              variants={itemVariants}
              className="card group hover:-translate-y-2 bg-white shadow-sm hover:shadow-md transition-all duration-300"
            >
              <div className="relative h-48 mb-4 rounded-lg overflow-hidden bg-slate-100">
                <img
                  src={hospital.images && hospital.images[0] ? hospital.images[0] : 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=800&q=80'}
                  alt={hospital.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  loading="lazy"
                  crossOrigin="anonymous"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
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
                <p className="text-text-light text-sm pt-2 line-clamp-2">{hospital.description}</p>
                <Link
                  to={`/hastanelerimiz/${hospital.slug}`}
                  className="inline-flex items-center text-primary font-bold mt-4 hover:text-primary-dark transition-colors"
                >
                  Detaylı Bilgi <FaArrowRight className="ml-2" />
                </Link>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {hospitals.length > displayHospitals.length && (
          <div className="text-center mt-12">
            <Link to="/hastanelerimiz" className="btn btn-outline">
              Tüm Hastanelerimiz
            </Link>
          </div>
        )}
      </div>
    </section>
  )
}
export default HospitalBranches
