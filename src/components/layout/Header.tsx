import { useState, useEffect } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion'
import { FaBars, FaTimes, FaChevronDown, FaPhone, FaUser, FaRegHospital, FaStethoscope, FaInfoCircle, FaPhoneAlt } from 'react-icons/fa'
import { useSupabase } from '../../contexts/SupabaseContext'
import AuthModal from '../auth/AuthModal'
import Logo from '../ui/Logo'

const Header = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const location = useLocation()
  const { user, signOut } = useSupabase()

  const { scrollY } = useScroll()
  const headerHeight = useTransform(scrollY, [0, 100], ['5.5rem', '4.5rem'])
  const headerBg = useTransform(scrollY, [0, 100], ['rgba(255, 255, 255, 0.8)', 'rgba(255, 255, 255, 0.95)'])

  const toggleMenu = () => setIsOpen(!isOpen)
  const closeMenu = () => setIsOpen(false)

  const toggleDropdown = (dropdown: string) => {
    setActiveDropdown(activeDropdown === dropdown ? null : dropdown)
  }

  useEffect(() => {
    closeMenu()
  }, [location])

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const menuItems = [
    {
      title: 'Hastanelerimiz',
      path: '/hastanelerimiz',
      icon: <FaRegHospital />,
      dropdown: [
        { name: 'Tüm Hastanelerimiz', path: '/hastanelerimiz' },
        { name: 'Tarihçe ve Misyon', path: '/hakkimizda' },
        { name: 'Kalite Belgeleri', path: '/hakkimizda/kalite-belgeleri' },
      ],
    },
    {
      title: 'Bölümlerimiz',
      path: '/bolumlerimiz',
      icon: <FaStethoscope />,
      dropdown: [
        { name: 'Tüm Bölümler', path: '/bolumlerimiz' },
        { name: 'Cerrahi Birimler', path: '/bolumlerimiz?kategori=cerrahi' },
        { name: 'Dahili Birimler', path: '/bolumlerimiz?kategori=dahili' },
        { name: 'Teşhis Birimleri', path: '/bolumlerimiz?kategori=teshis' },
      ],
    },
    {
      title: 'Doktorlar',
      path: '/doktorlar',
      dropdown: null,
    },
    {
      title: 'Sağlık Rehberi',
      path: '/saglik-rehberi',
      dropdown: [
        { name: 'Makaleler', path: '/saglik-rehberi' },
        { name: 'Video İçerikler', path: '/saglik-rehberi/videolar' },
        { name: 'Hasta Bilgilendirme', path: '/saglik-rehberi/hasta-bilgilendirme' },
      ],
    },
    {
      title: 'Sağlık Turizmi',
      path: '/saglik-turizmi',
      icon: <FaInfoCircle />,
      dropdown: null,
    },
    {
      title: 'İletişim',
      path: '/iletisim',
      icon: <FaPhoneAlt />,
      dropdown: null,
    },
  ]

  return (
    <motion.header
      style={{ height: headerHeight, backgroundColor: headerBg }}
      className={`fixed top-0 left-0 right-0 z-50 transition-shadow duration-300 backdrop-blur-xl border-b border-white/10 ${isScrolled ? 'shadow-lg' : ''
        }`}
    >
      <div className="container-custom h-full flex justify-between items-center relative">
        {/* Logo Section */}
        <Link to="/" className="z-50 shrink-0 transform transition-transform hover:scale-105">
          <Logo clickable={false} />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center space-x-1">
          {menuItems.map((item) => (
            <div
              key={item.title}
              className="relative group h-full flex items-center"
              onMouseEnter={() => item.dropdown && setActiveDropdown(item.title)}
              onMouseLeave={() => setActiveDropdown(null)}
            >
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `px-4 py-2 rounded-xl text-[14px] font-semibold tracking-wide transition-all duration-300 flex items-center gap-2 group-hover:bg-primary/5 ${isActive ? 'text-primary' : 'text-slate-600 hover:text-primary'
                  }`
                }
              >
                {item.title}
                {item.dropdown && (
                  <FaChevronDown className={`text-[10px] transition-transform duration-300 ${activeDropdown === item.title ? 'rotate-180' : ''}`} />
                )}
                {/* Active Indicator */}
                <motion.div
                  className="absolute bottom-[-1px] left-4 right-4 h-[2px] bg-primary scale-x-0 group-hover:scale-x-100 transition-transform origin-center"
                  initial={false}
                />
              </NavLink>

              {/* Enhanced Dropdown Menu */}
              <AnimatePresence>
                {item.dropdown && activeDropdown === item.title && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    className="absolute top-full left-0 mt-0 w-64 pt-2"
                  >
                    <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden premium-shadow-lg">
                      <div className="py-2">
                        {item.dropdown.map((dropdownItem) => (
                          <Link
                            key={dropdownItem.name}
                            to={dropdownItem.path}
                            className="block px-6 py-3 text-[14px] text-slate-600 hover:bg-slate-50 hover:text-primary transition-colors border-l-2 border-transparent hover:border-primary font-medium"
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
        <div className="hidden lg:flex items-center space-x-6">
          <a
            href="tel:+902121234567"
            className="group flex flex-col items-end"
          >
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Acil Destek</span>
            <span className="text-[15px] font-bold text-slate-700 group-hover:text-primary transition-colors flex items-center">
              <FaPhone className="mr-2 text-xs" /> 0212 123 45 67
            </span>
          </a>

          <div className="h-8 w-[1px] bg-slate-200" />

          {user ? (
            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center space-x-2 group"
              >
                <div className="w-10 h-10 rounded-full bg-primary/5 p-[2px] transition-transform group-hover:scale-105">
                  <div className="w-full h-full rounded-full overflow-hidden flex items-center justify-center bg-white border border-primary/10 shadow-sm">
                    {user.user_metadata?.avatar_url ? (
                      <img
                        src={user.user_metadata.avatar_url}
                        alt="Avatar"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <FaUser className="text-primary text-sm" />
                    )}
                  </div>
                </div>
                <div className="flex flex-col items-start leading-none">
                  <span className="text-[13px] font-bold text-slate-800">
                    {user.user_metadata?.full_name?.split(' ')[0] || 'Hesabım'}
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">Profil</span>
                </div>
                <FaChevronDown className={`text-[10px] text-slate-400 transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {isUserMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 mt-4 w-56 rounded-2xl bg-white shadow-2xl border border-slate-100 overflow-hidden z-50 premium-shadow-lg"
                  >
                    <div className="py-2">
                      <Link
                        to="/profil"
                        className="flex items-center px-4 py-3 text-[14px] text-slate-600 hover:bg-slate-50 hover:text-primary transition-colors"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <FaUser className="mr-3 text-xs opacity-50" /> Profilim
                      </Link>
                      <Link
                        to="/profil"
                        className="flex items-center px-4 py-3 text-[14px] text-slate-600 hover:bg-slate-50 hover:text-primary transition-colors"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <i className="bi bi-calendar-check mr-3 opacity-50"></i> Randevularım
                      </Link>
                      <div className="h-[1px] bg-slate-100 my-1 mx-2" />
                      <button
                        onClick={() => {
                          signOut();
                          setIsUserMenuOpen(false);
                        }}
                        className="flex items-center w-full text-left px-4 py-3 text-[14px] text-red-500 hover:bg-red-50/50 transition-colors"
                      >
                        <i className="bi bi-box-arrow-right mr-3 opacity-70"></i> Güvenli Çıkış
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="flex items-center px-5 py-2.5 rounded-full border border-slate-200 text-slate-700 font-bold text-[14px] hover:bg-slate-50 hover:border-slate-300 transition-all duration-300 shadow-sm"
            >
              <FaUser className="mr-2 text-xs opacity-50" />
              Giriş Yap
            </button>
          )}

          <a
            href="https://anadoluhastaneleri.kendineiyibak.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary !rounded-full !px-8 shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transform hover:-translate-y-0.5"
          >
            Online Randevu
          </a>
        </div>

        {/* Mobile menu logic remains but with enhanced UI */}
        <button
          className="lg:hidden z-50 p-3 rounded-xl bg-slate-50 text-slate-800 hover:text-primary transition-all duration-300"
          onClick={toggleMenu}
        >
          {isOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
        </button>

        {/* Mobile Menu Overlay */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 lg:hidden"
              onClick={closeMenu}
            />
          )}
        </AnimatePresence>

        {/* Improved Mobile Sidebar */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 right-0 w-[85%] max-w-[400px] bg-white z-50 lg:hidden shadow-2xl flex flex-col pt-24 px-8 pb-10"
            >
              <nav className="flex-1 overflow-y-auto custom-scrollbar pr-2">
                <div className="space-y-4">
                  {menuItems.map((item) => (
                    <div key={item.title} className="border-b border-slate-50 pb-2">
                      <div className="flex justify-between items-center">
                        <NavLink
                          to={item.path}
                          className={({ isActive }) =>
                            `py-3 text-lg font-bold tracking-tight ${isActive ? 'text-primary' : 'text-slate-800'}`
                          }
                          onClick={closeMenu}
                        >
                          {item.title}
                        </NavLink>
                        {item.dropdown && (
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              toggleDropdown(item.title);
                            }}
                            className="p-2 bg-slate-50 rounded-lg text-slate-400"
                          >
                            <FaChevronDown className={`transition-transform ${activeDropdown === item.title ? 'rotate-180' : ''}`} />
                          </button>
                        )}
                      </div>

                      <AnimatePresence>
                        {item.dropdown && activeDropdown === item.title && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden pl-4 mt-2 space-y-2 border-l-2 border-slate-100"
                          >
                            {item.dropdown.map((sub) => (
                              <Link
                                key={sub.name}
                                to={sub.path}
                                onClick={closeMenu}
                                className="block py-3 text-[15px] font-medium text-slate-500 active:text-primary transition-colors"
                              >
                                {sub.name}
                              </Link>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))}
                </div>
              </nav>

              <div className="mt-8 space-y-4 pt-8 border-t border-slate-100">
                <div className="grid grid-cols-2 gap-4">
                  <a href="tel:+902121234567" className="flex flex-col items-center justify-center p-4 rounded-2xl bg-slate-50 text-center">
                    <FaPhone className="text-primary mb-2" />
                    <span className="text-[10px] uppercase font-bold text-slate-400">Acil Çağrı</span>
                    <span className="text-xs font-bold text-slate-700 line-clamp-1">0212 123...</span>
                  </a>
                  <button className="flex flex-col items-center justify-center p-4 rounded-2xl bg-slate-50 text-center">
                    <FaUser className="text-primary mb-2" />
                    <span className="text-[10px] uppercase font-bold text-slate-400">Giriş Yap</span>
                    <span className="text-xs font-bold text-slate-700">Hesabım</span>
                  </button>
                </div>
                <a
                  href="https://anadoluhastaneleri.kendineiyibak.app/"
                  className="btn btn-primary w-full !rounded-xl !py-4 shadow-xl shadow-primary/20 text-center block"
                >
                  Hemen Randevu Al
                </a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Auth Modal remains the same */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </motion.header>
  )
}

export default Header
