import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, useInView } from 'framer-motion'
import SectionTitle from '../ui/SectionTitle'
import { FaMapMarkerAlt, FaPhone, FaArrowRight } from 'react-icons/fa'

const hospitals = [
  {
    id: 1,
    name: 'Anadolu Merkez Hastanesi',
    slug: 'anadolu-merkez-hastanesi',
    image: 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
    address: 'Atatürk Bulvarı No:123, Şişli, İstanbul',
    phone: '0212 123 45 67',
    description: 'Modern teknoloji ve uzman kadrosuyla hizmet veren ana hastanemiz.',
  },
  {
    id: 2,
    name: 'Anadolu Avrupa Hastanesi',
    slug: 'anadolu-avrupa-hastanesi',
    image: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
    address: 'Bağdat Caddesi No:456, Kadıköy, İstanbul',
    phone: '0216 987 65 43',
    description: 'Avrupa yakasında bulunan modern ve tam donanımlı hastanemiz.',
  },
  {
    id: 3,
    name: 'Anadolu Çocuk Hastanesi',
    slug: 'anadolu-cocuk-hastanesi',
    image: 'https://images.unsplash.com/photo-1581056771107-24ca5f033842?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
    address: 'Cumhuriyet Caddesi No:789, Beşiktaş, İstanbul',
    phone: '0212 345 67 89',
    description: 'Çocuk sağlığı ve hastalıkları konusunda uzmanlaşmış hastanemiz.',
  },
  {
    id: 4,
    name: 'Anadolu Uluslararası Hastanesi',
    slug: 'anadolu-uluslararasi-hastanesi',
    image: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
    address: 'İstiklal Caddesi No:101, Beyoğlu, İstanbul',
    phone: '0212 876 54 32',
    description: 'Uluslararası hasta hizmetleri sunan modern hastanemiz.',
  },
]

const HospitalBranches = () => {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.2 })

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

  return (
    <section className="py-20 bg-neutral">
      <div className="container-custom">
        <SectionTitle
          title="Hastane Şubelerimiz"
          subtitle="Anadolu Hastaneleri Grubu olarak İstanbul'un farklı bölgelerinde hizmet veriyoruz."
        />

        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
        >
          {hospitals.map((hospital) => (
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
                <p className="text-text-light text-sm pt-2">{hospital.description}</p>
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

        <div className="text-center mt-12">
          <Link to="/hastanelerimiz" className="btn btn-outline">
            Tüm Hastanelerimiz
          </Link>
        </div>
      </div>
    </section>
  )
}

export default HospitalBranches
