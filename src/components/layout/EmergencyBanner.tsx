import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { FaPhone, FaAmbulance, FaTimes } from 'react-icons/fa'

const EmergencyBanner = () => {
  const { t } = useTranslation()
  const [isVisible, setIsVisible] = useState(true)

  const handleClose = () => {
    setIsVisible(false)
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-primary-700 text-white relative z-50"
        >
          <div className="container-custom py-2.5">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4 md:gap-8">
                <div className="flex items-center gap-2">
                  <FaAmbulance className="text-ocean-300" />
                  <span className="text-sm font-medium">{t('layout.emergencyOpen', 'Acil Servis 7/24 Açık')}</span>
                </div>
                <div className="hidden md:flex items-center gap-2">
                  <FaPhone className="text-coral-400 animate-pulse" />
                  <a href="tel:4445058" className="text-sm font-medium hover:underline">
                    {t('layout.emergencyHelp', 'Acil Yardım')}: 444 50 58
                  </a>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="text-white/60 hover:text-white transition-colors p-1"
                aria-label={t('layout.close', 'Kapat')}
              >
                <FaTimes size={14} />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default EmergencyBanner
