import { useRef, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { motion, useInView } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import SectionTitle from '../ui/SectionTitle'
import { DoctorCardSkeleton } from '../ui/Skeleton'
import { useDoctors } from '../../hooks/useDoctors'
import { FaCalendarCheck, FaArrowRight } from 'react-icons/fa'

const DoctorsSlider = () => {
  const { t } = useTranslation()
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.1 })
  const { data: doctors = [], isLoading } = useDoctors()

  const displayDoctors = useMemo(() => {
    const shuffled = [...doctors].sort(() => Math.random() - 0.5)
    return shuffled.slice(0, 8)
  }, [doctors])

  return (
    <section className="py-20 md:py-28 bg-surface">
      <div className="container-custom">
        <SectionTitle
          label={t('home.doctorsLabel', 'Uzman Kadromuz')}
          title={t('home.doctorsTitle', 'Doktorlarımız')}
          subtitle={t('home.doctorsSubtitle', 'Alanında uzman ve deneyimli hekimlerimizle sağlığınız emin ellerde.')}
        />

        <motion.div
          ref={ref}
          initial={false}
          animate={isInView ? 'visible' : 'hidden'}
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.08 } },
          }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-12"
        >
          {isLoading
            ? [1, 2, 3, 4].map((i) => (
                <div key={i}>
                  <DoctorCardSkeleton />
                </div>
              ))
            : displayDoctors.map((doctor) => (
                <motion.div
                  key={doctor.id}
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: {
                      opacity: 1,
                      y: 0,
                      transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
                    },
                  }}
                  className="group bg-white rounded-2xl overflow-hidden border border-neutral-100 hover:border-ocean-200 hover:shadow-hover transition-all duration-300"
                >
                  {/* Image */}
                  <div className="relative aspect-[3/4] overflow-hidden bg-surface">
                    <img
                      src={doctor.image}
                      alt={doctor.name}
                      className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <span className="inline-block px-2.5 py-0.5 rounded-full bg-ocean-50 text-ocean-600 text-xs font-medium mb-2">
                      {(doctor as any).hospitals?.name || t('home.defaultHospital', 'Anadolu Hastanesi')}
                    </span>
                    <h3 className="font-display font-bold text-primary-600 text-lg mb-1 group-hover:text-ocean-600 transition-colors">
                      {doctor.name}
                    </h3>
                    <p className="text-sm text-neutral-500 mb-4">{doctor.title}</p>

                    <div className="flex items-center gap-3 pt-3 border-t border-neutral-100">
                      <Link
                        to={`/doktorlar/${doctor.slug}`}
                        className="flex items-center gap-1.5 text-sm font-medium text-primary-600 hover:text-ocean-600 transition-colors"
                      >
                        {t('home.profile', 'Profil')} <FaArrowRight className="text-xs" />
                      </Link>
                      <a
                        href="https://anadoluhastaneleri.kendineiyibak.app/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-sm font-medium text-coral-500 hover:text-coral-600 transition-colors ml-auto"
                      >
                        <FaCalendarCheck className="text-xs" />
                        {t('home.appointment', 'Randevu')}
                      </a>
                    </div>
                  </div>
                </motion.div>
              ))}
        </motion.div>

        <div className="text-center mt-12">
          <Link to="/doktorlar" className="btn btn-outline">
            {t('home.allDoctors', 'Tüm Doktorlarımız')}
          </Link>
        </div>
      </div>
    </section>
  )
}

export default DoctorsSlider
