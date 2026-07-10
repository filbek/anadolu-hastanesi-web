import { useState, useEffect, useMemo } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import {
  FaBars,
  FaTimes,
  FaChevronDown,
  FaPhone,
  FaRegHospital,
  FaStethoscope,
  FaInfoCircle,
  FaPhoneAlt,
  FaCalendarCheck,
  FaSearch,
} from 'react-icons/fa'
import Logo from '../ui/Logo'
import { useFocusTrap } from '../../hooks/useFocusTrap'
import { useHospitals } from '../../hooks/useHospitals'

const Header = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [_isScrolled, setIsScrolled] = useState(false)
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  const location = useLocation()
  const { t, i18n } = useTranslation()
  const mobileMenuRef = useFocusTrap<HTMLDivElement>(isOpen, () => setIsOpen(false))
  const { data: hospitals = [] } = useHospitals({ onlyPublished: true })

  const toggleMenu = () => setIsOpen(!isOpen)
  const closeMenu = () => setIsOpen(false)

  useEffect(() => {
    closeMenu()
  }, [location])

  // isScrolled kept for potential future use but header is always solid white now
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 30)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const menuItems = useMemo(() => [
    {
      title: t('nav.hospitals'),
      path: '/hastanelerimiz',
      icon: <FaRegHospital className="text-sm" />,
      dropdown: null,
      navigable: true,
    },
    {
      title: t('nav.departments'),
      path: '/bolumlerimiz',
      icon: <FaStethoscope className="text-sm" />,
      dropdown: [
        { name: t('nav.departments'), path: '/bolumlerimiz' },
        { name: t('header.dropdown.surgical'), path: '/bolumlerimiz?kategori=cerrahi' },
        { name: t('header.dropdown.internal'), path: '/bolumlerimiz?kategori=dahili' },
        { name: t('header.dropdown.diagnostic'), path: '/bolumlerimiz?kategori=teshis' },
      ],
      navigable: true,
    },
    {
      title: t('nav.doctors'),
      path: '/doktorlar',
      icon: <FaStethoscope className="text-sm" />,
      // Doktorlar doğrudan açılmaz; kullanıcı mutlaka bir şube (hastane) seçer.
      navigable: false,
      dropdown: hospitals
        .slice()
        .sort((a, b) => a.name.localeCompare(b.name, 'tr'))
        .map((h) => ({
          name: h.name,
          path: `/doktorlar?hastane=${encodeURIComponent(h.name)}`,
        })),
    },
    {
      title: t('nav.healthGuide'),
      path: '/saglik-rehberi',
      dropdown: [
        { name: t('header.dropdown.articles'), path: '/saglik-rehberi' },
      ],
      navigable: true,
    },
    {
      title: t('nav.healthTourism'),
      path: '/saglik-turizmi',
      icon: <FaInfoCircle className="text-sm" />,
      dropdown: null,
      navigable: true,
    },
    {
      title: t('nav.contact'),
      path: '/iletisim',
      icon: <FaPhoneAlt className="text-sm" />,
      dropdown: null,
      navigable: true,
    },
  ], [t, hospitals])

  return (
    <header
      className="fixed top-0 left-0 right-0 z-[60] bg-white shadow-card border-b border-neutral-100 transition-shadow duration-300"
    >
      <div className="max-w-[1440px] mx-auto px-3 sm:px-4 lg:px-5 xl:px-6 w-full h-[72px] flex justify-between items-center relative">
        {/* Logo */}
        <Link to="/" className="z-50 shrink-0 transition-transform hover:scale-105 duration-300">
          <Logo clickable={false} size="large" />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden xl:flex items-center gap-1" aria-label={t('nav.mainMenu', 'Ana menü')}>
          {menuItems.map((item) => (
            <div
              key={item.title}
              className="relative group"
              onMouseEnter={() => item.dropdown && setActiveDropdown(item.title)}
              onMouseLeave={() => setActiveDropdown(null)}
              onFocus={() => item.dropdown && setActiveDropdown(item.title)}
              onBlur={(e) => {
                if (!e.currentTarget.contains(e.relatedTarget as Node)) setActiveDropdown(null)
              }}
            >
              {item.navigable ? (
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `relative px-2.5 py-2 rounded-xl text-[13px] font-semibold tracking-tight transition-all duration-300 flex items-center gap-1 whitespace-nowrap ${
                      isActive
                        ? 'text-primary-600'
                        : 'text-neutral-600 hover:text-primary-600'
                    }`
                  }
                >
                  {item.title}
                  {item.dropdown && (
                    <FaChevronDown
                      className={`text-[10px] transition-transform duration-300 ${
                        activeDropdown === item.title ? 'rotate-180' : ''
                      }`}
                    />
                  )}
                  {/* Active indicator */}
                  <span
                    className={`absolute bottom-0 left-2.5 right-2.5 h-[2px] bg-coral-500 rounded-full transition-transform duration-300 origin-center ${
                      location.pathname.startsWith(item.path) && item.path !== '/'
                        ? 'scale-x-100'
                        : 'scale-x-0 group-hover:scale-x-100'
                    }`}
                  />
                </NavLink>
              ) : (
                <button
                  type="button"
                  onClick={() =>
                    setActiveDropdown(
                      activeDropdown === item.title ? null : item.title
                    )
                  }
                  aria-haspopup="true"
                  aria-expanded={activeDropdown === item.title}
                  className="relative px-2.5 py-2 rounded-xl text-[13px] font-semibold tracking-tight transition-all duration-300 flex items-center gap-1 whitespace-nowrap text-neutral-600 hover:text-primary-600"
                >
                  {item.title}
                  {item.dropdown && (
                    <FaChevronDown
                      className={`text-[10px] transition-transform duration-300 ${
                        activeDropdown === item.title ? 'rotate-180' : ''
                      }`}
                    />
                  )}
                </button>
              )}

              {/* Dropdown */}
              <AnimatePresence>
                {item.dropdown && activeDropdown === item.title && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.96 }}
                    transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                    className="absolute top-full left-0 mt-1 w-52 pt-2"
                  >
                    <div className="bg-white rounded-2xl shadow-elevated border border-neutral-100 overflow-hidden">
                      <div className="py-2">
                        {item.dropdown.map((dropdownItem) => (
                          <Link
                            key={dropdownItem.name}
                            to={dropdownItem.path}
                            className="block px-5 py-2.5 text-sm text-neutral-600 hover:bg-surface hover:text-primary-600 transition-colors border-l-[3px] border-transparent hover:border-ocean-500 font-medium"
                          >
                            {dropdownItem.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </nav>

        {/* Action Buttons */}
        <div className="hidden lg:flex items-center gap-2">
          {/* Doctor Search */}
          <div className="hidden md:block relative">
            <label htmlFor="header-doctor-search" className="sr-only">
              {t('nav.searchDoctor')}
            </label>
            <input
              id="header-doctor-search"
              type="search"
              aria-label={t('nav.searchDoctor')}
              placeholder={t('nav.searchDoctor')}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  const term = (e.target as HTMLInputElement).value
                  if (term.trim()) {
                    window.location.href = `/doktorlar?search=${encodeURIComponent(term.trim())}`
                  }
                }
              }}
              className="w-32 xl:w-36 pl-9 pr-3 py-2 rounded-full bg-surface border border-neutral-200 text-sm text-neutral-700 placeholder:text-neutral-400 focus:outline-none focus:border-ocean-400 focus:w-44 transition-all duration-300"
            />
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 text-xs" />
          </div>

          {/* Emergency Phone */}
          <a
            href="tel:4445058"
            className="group flex items-center gap-2 text-sm font-semibold text-neutral-600 hover:text-primary-600 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-coral-50 flex items-center justify-center group-hover:bg-coral-100 transition-colors">
              <FaPhone className="text-coral-500 text-xs" />
            </div>
            <span className="hidden xl:inline">{t('nav.emergency')}</span>
          </a>

          {/* Language Switcher Dropdown */}
          <div className="relative group hidden xl:flex items-center">
            <button
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold text-neutral-600 hover:text-primary-600 transition-colors uppercase"
              aria-label={t('nav.language', 'Dil seçimi')}
              aria-haspopup="true"
            >
              {i18n.language || 'tr'}
              <FaChevronDown aria-hidden="true" className="text-[10px] opacity-50 group-hover:rotate-180 transition-transform duration-300" />
            </button>

            <div className="absolute top-full right-0 pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible group-focus-within:opacity-100 group-focus-within:visible transition-all duration-300">
              <div className="bg-white rounded-2xl shadow-elevated border border-neutral-100 p-1 min-w-[120px] flex flex-col gap-0.5">
                {(['tr', 'en', 'ar'] as const).map((lang) => (
                  <button
                    key={lang}
                    onClick={() => {
                      i18n.changeLanguage(lang)
                      closeMenu()
                    }}
                    aria-label={lang === 'tr' ? 'Türkçe' : lang === 'en' ? 'English' : 'العربية'}
                    aria-current={i18n.language === lang ? 'true' : undefined}
                    lang={lang}
                    className={`px-4 py-2.5 text-sm font-medium rounded-xl text-left transition-colors flex items-center justify-between ${
                      i18n.language === lang
                        ? 'bg-coral-50 text-coral-600'
                        : 'text-neutral-600 hover:bg-surface hover:text-primary-600'
                    }`}
                  >
                    <span>{lang === 'tr' ? 'Türkçe' : lang === 'en' ? 'English' : 'العربية'}</span>
                    <span className="text-[10px] uppercase opacity-50">{lang}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* CTA Button */}
          <a
            href="https://anadoluhastaneleri.kendineiyibak.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-coral !px-4 !py-2 !text-[13px] !rounded-full whitespace-nowrap"
          >
            <FaCalendarCheck className="text-xs" />
            {t('nav.appointment')}
          </a>
        </div>

        {/* Mobile Toggle */}
        <button
          className="lg:hidden z-50 p-3 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl bg-white/80 backdrop-blur-sm border border-neutral-100 text-neutral-800 hover:text-primary-600 transition-all"
          onClick={toggleMenu}
          aria-expanded={isOpen}
          aria-controls="mobile-menu"
          aria-label={isOpen ? t('nav.closeMenu', 'Menüyü kapat') : t('nav.openMenu', 'Menüyü aç')}
        >
          {isOpen ? <FaTimes size={18} aria-hidden="true" /> : <FaBars size={18} aria-hidden="true" />}
        </button>

        {/* Mobile Overlay */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-primary-900/40 backdrop-blur-sm z-40 lg:hidden"
              onClick={closeMenu}
            />
          )}
        </AnimatePresence>

        {/* Mobile Sidebar */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              ref={mobileMenuRef}
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 260 }}
              className="fixed inset-y-0 right-0 w-[85%] max-w-[380px] bg-white z-50 lg:hidden shadow-2xl flex flex-col"
              id="mobile-menu"
              role="dialog"
              aria-modal="true"
              aria-label={t('nav.mainMenu', 'Ana menü')}
            >
              {/* Mobile Header */}
              <div className="px-6 pt-6 pb-4 border-b border-neutral-100 flex items-center justify-between">
                <Logo clickable={false} />
                <button
                  type="button"
                  onClick={closeMenu}
                  aria-label={t('nav.closeMenu', 'Menüyü kapat')}
                  className="w-11 h-11 rounded-xl flex items-center justify-center text-neutral-600 hover:text-primary-600 hover:bg-neutral-100 transition-colors"
                >
                  <FaTimes size={18} aria-hidden="true" />
                </button>
              </div>

              <nav className="flex-1 overflow-y-auto px-6 py-4" aria-label={t('nav.mainMenu', 'Ana menü')}>
                <div className="space-y-1">
                  {menuItems.map((item) => (
                    <div key={item.title} className="border-b border-neutral-50 last:border-0">
                      <div className="flex items-center justify-between py-3">
                        {item.navigable ? (
                          <NavLink
                            to={item.path}
                            className={({ isActive }) =>
                              `text-base font-semibold ${
                                isActive ? 'text-primary-600' : 'text-neutral-800'
                              }`
                            }
                            onClick={closeMenu}
                          >
                            {item.title}
                          </NavLink>
                        ) : (
                          <span className="text-base font-semibold text-neutral-800 flex items-center gap-2">
                            {item.title}
                            {item.dropdown && <FaChevronDown className="text-[10px] opacity-50" />}
                          </span>
                        )}
                      </div>
                      {item.dropdown && (
                        <div className="pl-3 pb-3 space-y-1">
                          {item.dropdown.map((sub) => (
                            <Link
                              key={sub.name}
                              to={sub.path}
                              onClick={closeMenu}
                              className="block py-2 text-sm text-neutral-500 hover:text-primary-600 transition-colors"
                            >
                              {sub.name}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </nav>

              {/* Mobile Actions */}
              <div className="px-6 pb-8 pt-4 border-t border-neutral-100 space-y-3">
                {/* Mobile Language Switcher */}
                <div className="flex flex-col gap-1 mb-4">
                  <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-1">{t('nav.language', 'Dil Seçimi')}</span>
                  {(['tr', 'en', 'ar'] as const).map((lang) => (
                    <button
                      key={lang}
                      onClick={() => {
                        i18n.changeLanguage(lang)
                        closeMenu()
                      }}
                      aria-label={lang === 'tr' ? 'Türkçe' : lang === 'en' ? 'English' : 'العربية'}
                      aria-current={i18n.language === lang ? 'true' : undefined}
                      lang={lang}
                      className={`px-4 py-2 text-sm font-medium rounded-xl text-left transition-colors flex items-center justify-between ${
                        i18n.language === lang
                          ? 'bg-coral-50 text-coral-600'
                          : 'text-neutral-600 hover:bg-surface hover:text-primary-600'
                      }`}
                    >
                      <span>{lang === 'tr' ? 'Türkçe' : lang === 'en' ? 'English' : 'العربية'}</span>
                      <span className="text-[10px] uppercase opacity-50">{lang}</span>
                    </button>
                  ))}
                </div>

                <a
                  href="https://anadoluhastaneleri.kendineiyibak.app/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-coral w-full justify-center"
                >
                  <FaCalendarCheck />
                  {t('common.onlineAppointment')}
                </a>
                <a
                  href="tel:4445058"
                  className="flex items-center justify-center gap-2 py-3 text-sm font-semibold text-neutral-600 hover:text-primary-600 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-coral-50 flex items-center justify-center">
                    <FaPhone className="text-coral-500 text-xs" />
                  </div>
                  {t('nav.emergency')}
                </a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

    </header>
  )
}

export default Header
