import { useRef, useEffect, useState, useMemo } from 'react'
import { motion, useInView } from 'framer-motion'
import {
  FaHospital,
  FaUserMd,
  FaUsers,
  FaAward,
  FaGlobeAmericas,
  FaHeartbeat,
  FaStethoscope,
  FaProcedures,
  FaClinicMedical,
  FaNotesMedical,
} from 'react-icons/fa'
import { useTranslation } from 'react-i18next'
import { useSiteStats } from '../../hooks/useSiteStats'

const iconMap: Record<string, React.ReactNode> = {
  'FaHospital': <FaHospital className="text-2xl" />,
  'FaUserMd': <FaUserMd className="text-2xl" />,
  'FaUsers': <FaUsers className="text-2xl" />,
  'FaAward': <FaAward className="text-2xl" />,
  'FaGlobeAmericas': <FaGlobeAmericas className="text-2xl" />,
  'FaHeartbeat': <FaHeartbeat className="text-2xl" />,
  'FaStethoscope': <FaStethoscope className="text-2xl" />,
  'FaProcedures': <FaProcedures className="text-2xl" />,
  'FaClinicMedical': <FaClinicMedical className="text-2xl" />,
  'FaNotesMedical': <FaNotesMedical className="text-2xl" />,
  'bi-heart-pulse': <FaHeartbeat className="text-2xl" />,
  'bi-hospital': <FaHospital className="text-2xl" />,
  'bi-people': <FaUsers className="text-2xl" />,
  'bi-calendar-check': <FaAward className="text-2xl" />,
}

interface StatItem {
  icon: React.ReactNode
  value: number
  suffix: string
  label: string
}

function mapDbStats(dbItems: any[]): StatItem[] {
  if (!dbItems || dbItems.length === 0) return []
  return dbItems.map((item) => ({
    icon: iconMap[item.icon || ''] || <FaHospital className="text-2xl" />,
    value: parseInt(item.value || '0', 10) || 0,
    suffix: item.suffix || '',
    label: item.label || '',
  }))
}

const Counter = ({ value, suffix, inView }: { value: number; suffix: string; inView: boolean }) => {
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!inView) return
    let start = 0
    const duration = 2500
    const increment = value / (duration / 16)
    const timer = setInterval(() => {
      start += increment
      if (start >= value) {
        setCount(value)
        clearInterval(timer)
      } else {
        setCount(Math.floor(start))
      }
    }, 16)
    return () => clearInterval(timer)
  }, [inView, value])

  return (
    <span className="font-display text-3xl sm:text-4xl md:text-5xl font-extrabold text-primary-600 tabular-nums tracking-tighter">
      {count}
      <span className="text-ocean-500">{suffix}</span>
    </span>
  )
}

const StatsSection = () => {
  const { t } = useTranslation()
  const { data: dbItems } = useSiteStats()

  const fallbackStats: StatItem[] = useMemo(() => [
    { icon: <FaHospital className="text-2xl" />, value: 25, suffix: '+', label: t('home.yearsExperience', 'Yıllık Deneyim') },
    { icon: <FaUserMd className="text-2xl" />, value: 500, suffix: '+', label: t('home.expertDoctors', 'Uzman Doktor') },
    { icon: <FaUsers className="text-2xl" />, value: 50, suffix: 'K+', label: t('home.happyPatients', 'Mutlu Hasta') },
    { icon: <FaAward className="text-2xl" />, value: 50, suffix: '+', label: t('home.medicalUnits', 'Tıbbi Birim') },
    { icon: <FaGlobeAmericas className="text-2xl" />, value: 30, suffix: '+', label: t('home.countriesPatients', 'Ülkeden Hasta') },
    { icon: <FaHeartbeat className="text-2xl" />, value: 100, suffix: 'K+', label: t('home.successfulOperations', 'Başarılı Operasyon') },
  ], [t])

  const stats = useMemo(() => {
    const dbStats = mapDbStats(dbItems || [])
    return dbStats.length > 0 ? dbStats : fallbackStats
  }, [dbItems, fallbackStats])

  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.2 })

  return (
    <section className="relative py-24 md:py-32 bg-surface overflow-hidden">
      {/* Decorative SVG Pattern */}
      <div className="absolute inset-0 opacity-[0.025] pointer-events-none">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="dots" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
              <circle cx="20" cy="20" r="1.5" fill="currentColor" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#dots)" />
        </svg>
      </div>

      {/* Floating accent shapes */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-ocean-400/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-coral-400/5 rounded-full blur-3xl pointer-events-none" />

      <div className="container-custom relative z-10" ref={ref}>
        {/* Section Header */}
        <motion.div
          initial={false}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-20 md:mb-24"
        >
          <span className="section-label mb-3 block">{t('home.statsLabel', 'Rakamlarla Anadolu Hastaneleri')}</span>
          <h2 className="section-title">
            {t('home.statsTitle1', 'Güvenin')} <span className="text-ocean-500">{t('home.statsTitle2', 'Sayılarla')}</span> {t('home.statsTitle3', 'Kanıtı')}
          </h2>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-x-6 gap-y-14 md:gap-x-8 md:gap-y-16">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={false}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{
                duration: 0.5,
                delay: index * 0.1,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="text-center group"
            >
              <div className="w-14 h-14 mx-auto mb-6 rounded-2xl bg-white shadow-soft flex items-center justify-center text-ocean-500 transition-all duration-300 group-hover:shadow-card group-hover:scale-105">
                {stat.icon}
              </div>
              <Counter value={stat.value} suffix={stat.suffix} inView={isInView} />
              <p className="text-neutral-500 text-sm mt-4 font-medium tracking-wide">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default StatsSection
