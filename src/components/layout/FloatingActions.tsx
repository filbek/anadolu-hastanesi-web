import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { FaWhatsapp, FaCalendarAlt, FaPhoneAlt, FaPlus, FaTimes } from 'react-icons/fa'

const FloatingActions = () => {
  const { t } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)

  const actions = [
    {
      id: 'whatsapp',
      icon: <FaWhatsapp />,
      label: t('layout.whatsappSupport', 'WhatsApp Destek'),
      color: 'bg-[#25D366]',
      href: 'https://wa.me/4445058',
    },
    {
      id: 'appointment',
      icon: <FaCalendarAlt />,
      label: t('layout.onlineAppointment', 'Online Randevu'),
      color: 'bg-coral-500',
      href: 'https://anadoluhastaneleri.kendineiyibak.app/',
    },
    {
      id: 'call',
      icon: <FaPhoneAlt />,
      label: t('layout.callUs', 'Bizi Arayın'),
      color: 'bg-ocean-500',
      href: 'tel:4445058',
    },
  ]

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end gap-4">
      {/* Action Buttons */}
      <AnimatePresence>
        {isOpen && (
          <div className="flex flex-col items-end gap-3 mb-2">
            {actions.map((action, index) => (
              <motion.a
                key={action.id}
                href={action.href}
                target={action.href.startsWith('http') ? '_blank' : undefined}
                rel={action.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                initial={{ opacity: 0, scale: 0.5, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.5, y: 20 }}
                transition={{ delay: (actions.length - 1 - index) * 0.1 }}
                className="flex items-center gap-3 group"
              >
                <span className="px-3 py-1.5 rounded-xl bg-white shadow-card text-neutral-700 text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-neutral-100">
                  {action.label}
                </span>
                <div
                  className={`${action.color} w-12 h-12 rounded-2xl shadow-hover flex items-center justify-center text-white text-lg transition-transform hover:scale-110 active:scale-95`}
                >
                  {action.icon}
                </div>
              </motion.a>
            ))}
          </div>
        )}
      </AnimatePresence>

      {/* Main Toggle Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-label={isOpen
          ? t('layout.closeQuickActions', 'Hızlı erişim menüsünü kapat')
          : t('layout.openQuickActions', 'Hızlı erişim menüsünü aç')}
        className={`${
          isOpen ? 'bg-primary-600' : 'bg-coral-500'
        } w-14 h-14 rounded-2xl shadow-elevated flex items-center justify-center text-white text-xl transition-all duration-300 hover:scale-105 active:scale-95`}
        whileHover={{ rotate: isOpen ? -90 : 0 }}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
            >
              <FaTimes />
            </motion.div>
          ) : (
            <motion.div
              key="open"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
            >
              <FaPlus />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  )
}

export default FloatingActions
