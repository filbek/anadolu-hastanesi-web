import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FaPhone, FaAmbulance, FaTimes } from 'react-icons/fa'

const EmergencyBanner = () => {
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
          className="bg-accent text-white relative z-50"
        >
          <div className="container-custom py-2">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-6">
                <div className="flex items-center">
                  <FaAmbulance className="mr-2 text-white" />
                  <span className="text-sm font-medium">Acil Servis 7/24 Açık</span>
                </div>
                <div className="hidden md:flex items-center">
                  <FaPhone className="mr-2 text-white animate-pulse" />
                  <a href="tel:+902121234567" className="text-sm font-medium hover:underline">
                    Acil Yardım: 0212 123 45 67
                  </a>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="text-white/80 hover:text-white transition-colors"
                aria-label="Kapat"
              >
                <FaTimes size={16} />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default EmergencyBanner
