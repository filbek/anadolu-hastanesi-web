import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FaWhatsapp, FaCalendarAlt, FaPhoneAlt, FaPlus, FaTimes } from 'react-icons/fa'

const FloatingActions = () => {
    const [isOpen, setIsOpen] = useState(false)

    const actions = [
        {
            id: 'whatsapp',
            icon: <FaWhatsapp />,
            label: 'WhatsApp Destek',
            color: 'bg-[#25D366]',
            href: 'https://wa.me/902121234567',
        },
        {
            id: 'appointment',
            icon: <FaCalendarAlt />,
            label: 'Online Randevu',
            color: 'bg-primary',
            href: 'https://anadoluhastaneleri.kendineiyibak.app/',
        },
        {
            id: 'call',
            icon: <FaPhoneAlt />,
            label: 'Bizi Arayın',
            color: 'bg-accent',
            href: 'tel:+902121234567',
        },
    ]

    return (
        <div className="fixed bottom-8 right-8 z-[100] flex flex-col items-end gap-4">
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
                                <span className="px-3 py-1.5 rounded-lg bg-white shadow-lg text-slate-700 text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-slate-100">
                                    {action.label}
                                </span>
                                <div className={`${action.color} w-14 h-14 rounded-2xl shadow-xl flex items-center justify-center text-white text-2xl transition-transform hover:scale-110 active:scale-95`}>
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
                className={`${isOpen ? 'bg-slate-800' : 'bg-primary'
                    } w-16 h-16 rounded-3xl shadow-2xl flex items-center justify-center text-white text-2xl transition-all duration-300 hover:scale-105 active:scale-95 premium-shadow-lg`}
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
