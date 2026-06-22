import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import SectionTitle from '../ui/SectionTitle'
import { FaMapMarkerAlt, FaPhone, FaArrowRight } from 'react-icons/fa'
import { useHospitals } from '../../hooks/useHospitals'

const HospitalBranches = () => {
  const { t } = useTranslation()
  const { data: hospitals = [] } = useHospitals({ onlyPublished: true })

  const displayHospitals = hospitals
    .filter((h) => h.display_on_homepage !== false)
    .sort((a, b) => (a.display_order || 0) - (b.display_order || 0))
    .slice(0, 3)

  return (
    <section className="py-20 md:py-28 bg-white">
      <div className="container-custom">
        <SectionTitle
          label={t('home.locationsLabel', 'Konumlarımız')}
          title={t('home.hospitalsTitle', 'Hastane Şubelerimiz')}
          subtitle={t('home.hospitalsSubtitle', 'İstanbul\'un farklı bölgelerinde, aynı kalite ve özenle hizmetinizdeyiz.')}
        />

        {displayHospitals.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            {displayHospitals.map((hospital, index) => (
              <motion.div
                key={hospital.id}
                initial={false}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.5, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
                className="group relative rounded-3xl overflow-hidden min-h-[380px]"
              >
                <img
                  src={
                    hospital.images && hospital.images[0]
                      ? hospital.images[0]
                      : 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=800&q=80'
                  }
                  alt={hospital.name}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary-900/90 via-primary-900/30 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <div className="flex items-center gap-2 text-ocean-300 text-sm font-medium mb-2">
                    <FaMapMarkerAlt />
                    <span>{hospital.address?.split(',')[0] || t('home.defaultCity', 'İstanbul')}</span>
                  </div>
                  <h3 className="font-display text-xl font-bold text-white mb-3">
                    {hospital.name}
                  </h3>
                  <p className="text-white/70 text-sm mb-4 line-clamp-2">
                    {hospital.description}
                  </p>
                  <div className="flex items-center gap-4">
                    <a
                      href={`tel:${hospital.phone?.replace(/\s/g, '')}`}
                      className="flex items-center gap-2 text-white/80 hover:text-white text-sm transition-colors"
                    >
                      <FaPhone className="text-xs" />
                      {hospital.phone}
                    </a>
                    <Link
                      to={`/hastanelerimiz/${hospital.slug}`}
                      aria-label={t('home.moreInfoAbout', '{{name}} hakkında detaylı bilgi', { name: hospital.name })}
                      className="flex items-center gap-1.5 text-coral-400 hover:text-coral-300 text-sm font-semibold transition-colors"
                    >
                      {t('home.moreInfo', 'Detaylı Bilgi')} <FaArrowRight aria-hidden="true" className="text-xs" />
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : null}

        {hospitals.length > displayHospitals.length && (
          <div className="text-center mt-12">
            <Link to="/hastanelerimiz" className="btn btn-outline">
              {t('home.allHospitals', 'Tüm Hastanelerimiz')}
            </Link>
          </div>
        )}
      </div>
    </section>
  )
}

export default HospitalBranches
