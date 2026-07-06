import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { FaSearch, FaCalendarCheck, FaMapMarkerAlt, FaPhoneAlt, FaChevronRight } from 'react-icons/fa'

const QuickActionRibbon = () => {
  const { t } = useTranslation()

  const actions = [
    {
      icon: <FaSearch className="text-xl" />,
      title: t('home.actionDoctorSearch', 'Doktor Ara'),
      desc: t('home.actionDoctorSearchDesc', 'Uzman hekimlerimizi keşfedin'),
      link: '/doktorlar',
      external: false,
      color: 'text-ocean-500',
      bgColor: 'bg-ocean-50',
    },
    {
      icon: <FaCalendarCheck className="text-xl" />,
      title: t('home.actionAppointment', 'Randevu Al'),
      desc: t('home.actionAppointmentDesc', 'Online kolay randevu'),
      link: 'https://anadoluhastaneleri.kendineiyibak.app/',
      external: true,
      color: 'text-coral-500',
      bgColor: 'bg-coral-50',
    },
    {
      icon: <FaMapMarkerAlt className="text-xl" />,
      title: t('home.actionNearestBranch', 'En Yakın Şube'),
      desc: t('home.actionNearestBranchDesc', 'Size en yakın hastane'),
      link: '/hastanelerimiz',
      external: false,
      color: 'text-primary-500',
      bgColor: 'bg-primary-50',
    },
    {
      icon: <FaPhoneAlt className="text-xl" />,
      title: t('home.actionEmergency', '7/24 Acil'),
      desc: t('home.actionEmergencyDesc', 'Anında destek hattı'),
      link: 'tel:4445058',
      external: true,
      color: 'text-success',
      bgColor: 'bg-success/10',
    },
  ]

  return (
    <section className="relative z-20 -mt-16 px-4 md:px-8">
      <motion.div
        initial={false}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="container-custom mx-auto"
      >
        <div className="glass rounded-3xl shadow-glass overflow-hidden">
          <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-neutral-100/50">
            {actions.map((action, index) => {
              const content = (
                <motion.div
                  whileHover={{ y: -2 }}
                  transition={{ duration: 0.2 }}
                  className="group flex flex-col md:flex-row items-center md:items-center justify-center md:justify-start text-center md:text-left gap-2 md:gap-4 p-4 sm:p-5 md:p-6 cursor-pointer transition-colors hover:bg-white/50"
                >
                  <div
                    className={`w-11 h-11 md:w-12 md:h-12 rounded-2xl ${action.bgColor} flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-110`}
                  >
                    <span className={action.color}>{action.icon}</span>
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-display font-semibold text-sm text-neutral-800 group-hover:text-primary-600 transition-colors leading-tight">
                      {action.title}
                    </h3>
                    <p className="text-xs text-neutral-500 hidden md:block truncate">
                      {action.desc}
                    </p>
                  </div>
                  <FaChevronRight className="hidden md:block text-xs text-neutral-300 ml-auto opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300 flex-shrink-0" />
                </motion.div>
              )

              return action.external ? (
                <a
                  key={index}
                  href={action.link}
                  target={action.link.startsWith('http') ? '_blank' : undefined}
                  rel={action.link.startsWith('http') ? 'noopener noreferrer' : undefined}
                  className={`block ${index < 2 ? 'border-b lg:border-b-0 border-neutral-100/50' : ''} ${
                    index === 0 || index === 2 ? 'border-r lg:border-r-0 border-neutral-100/50' : ''
                  }`}
                >
                  {content}
                </a>
              ) : (
                <Link
                  key={index}
                  to={action.link}
                  className={`block ${index < 2 ? 'border-b lg:border-b-0 border-neutral-100/50' : ''} ${
                    index === 0 || index === 2 ? 'border-r lg:border-r-0 border-neutral-100/50' : ''
                  }`}
                >
                  {content}
                </Link>
              )
            })}
          </div>
        </div>
      </motion.div>
    </section>
  )
}

export default QuickActionRibbon
