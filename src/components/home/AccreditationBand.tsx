import { useRef, useMemo } from 'react'
import { motion, useInView } from 'framer-motion'
import {
  FaShieldAlt,
  FaCertificate,
  FaCheckCircle,
  FaAward,
  FaStar,
} from 'react-icons/fa'
import { useTranslation } from 'react-i18next'
import { useAccreditations } from '../../hooks/useAccreditations'

interface AccreditationItem {
  name: string
  description?: string
  icon: React.ReactNode
  logo_url?: string
  link?: string
}

const AccreditationBand = () => {
  const { t } = useTranslation()
  const { data: dbItems } = useAccreditations()

  const fallbackAccreditations: AccreditationItem[] = useMemo(() => [
    { name: 'JCI', description: t('home.accJci', 'Joint Commission International'), icon: <FaShieldAlt /> },
    { name: 'ISO 9001', description: t('home.accIso9001', 'Kalite Yönetim Sistemi'), icon: <FaCertificate /> },
    { name: 'ISO 14001', description: t('home.accIso14001', 'Çevre Yönetim Sistemi'), icon: <FaCertificate /> },
    { name: 'TSE', description: t('home.accTse', 'Türk Standartları Enstitüsü'), icon: <FaCheckCircle /> },
    { name: t('home.ministryOfHealth', 'Sağlık Bakanlığı'), description: t('home.accMinistryDesc', 'Yetkili Sağlık Kuruluşu'), icon: <FaAward /> },
  ], [t])

  const trustItems = [
    { icon: <FaShieldAlt />, text: t('home.trustKvkk', 'KVKK Uyumlu') },
    { icon: <FaCheckCircle />, text: t('home.trustPatientRights', 'Hasta Hakları Koruması') },
    { icon: <FaStar />, text: t('home.trustEmergency', '7/24 Acil Servis') },
    { icon: <FaCertificate />, text: t('home.trustJci', 'JCI Akreditasyonu') },
  ]

  function mapDbAccreditations(dbItems: any[]): AccreditationItem[] {
    if (!dbItems || dbItems.length === 0) return []
    return dbItems.map((item) => ({
      name: item.name || '',
      description: item.link || t('home.accreditation', 'Akreditasyon'),
      icon: item.logo_url ? null : <FaAward />,
      logo_url: item.logo_url,
      link: item.link,
    }))
  }

  const accreditations = useMemo(() => {
    const db = mapDbAccreditations(dbItems || [])
    return db.length > 0 ? db : fallbackAccreditations
  }, [dbItems, fallbackAccreditations])

  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.2 })

  return (
    <section className="py-16 md:py-20 bg-white" ref={ref}>
      <div className="container-custom">
        {/* Accreditations */}
        <motion.div
          initial={false}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-10"
        >
          <span className="section-label mb-3 block">{t('home.trustLabel', 'Güven ve Kalite')}</span>
          <h2 className="section-title">
            {t('home.accreditationsTitle', 'Akreditasyonlarımız')}
          </h2>
        </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {accreditations.map((acc, index) => (
              <motion.div
                key={acc.name}
                initial={false}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.4, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
                className="group text-center p-6 rounded-2xl bg-surface border border-neutral-100 hover:bg-primary-600 hover:border-primary-600 transition-all duration-300"
              >
                {acc.logo_url ? (
                  <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-white flex items-center justify-center overflow-hidden">
                    <img
                      src={acc.logo_url}
                      alt={acc.name}
                      className="w-10 h-10 object-contain"
                      loading="lazy"
                    />
                  </div>
                ) : (
                  <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-ocean-50 flex items-center justify-center text-ocean-500 text-lg group-hover:bg-white/10 group-hover:text-ocean-300 transition-colors">
                    {acc.icon}
                  </div>
                )}
                <h3 className="font-display font-semibold text-primary-600 text-sm mb-1 group-hover:text-white transition-colors">
                  {acc.name}
                </h3>
                {acc.description && (
                  <p className="text-xs text-neutral-500 group-hover:text-white/80 transition-colors">
                    {acc.description}
                  </p>
                )}
              </motion.div>
            ))}
          </div>

        {/* Trust Bar */}
        <motion.div
          initial={false}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mt-12 pt-8 border-t border-neutral-100"
        >
          <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10">
            {trustItems.map((item) => (
              <div
                key={item.text}
                className="flex items-center gap-2 text-sm text-neutral-500"
              >
                <span className="text-ocean-500">{item.icon}</span>
                <span>{item.text}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default AccreditationBand
