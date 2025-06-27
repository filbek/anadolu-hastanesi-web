import { useState, useEffect } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { FaBars, FaTimes, FaChevronDown, FaPhone, FaUser } from 'react-icons/fa'
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
      setIsScrolled(window.scrollY > 50)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const menuItems = [
    {
      title: 'Hastanelerimiz',
      path: '/hastanelerimiz',
      dropdown: [
        { name: 'Tüm Hastanelerimiz', path: '/hastanelerimiz' },
        { name: 'Tarihçe ve Misyon', path: '/hakkimizda' },
        { name: 'Kalite Belgeleri', path: '/hakkimizda/kalite-belgeleri' },
      ],
    },
    {
      title: 'Bölümlerimiz',
      path: '/bolumlerimiz',
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
      dropdown: null,
    },
    {
      title: 'İletişim',
      path: '/iletisim',
      dropdown: null,
    },
  ]

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white shadow-md py-2' : 'bg-white/90 backdrop-blur-md py-4'
      }`}
    >
      <div className="container-custom flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="z-50 flex items-center h-16 py-1">
          <Logo clickable={false} />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center space-x-1">
          {menuItems.map((item) => (
            <div key={item.title} className="relative group">
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 hover:text-primary ${
                    isActive ? 'text-primary' : 'text-text'
                  }`
                }
                onClick={() => item.dropdown && toggleDropdown(item.title)}
              >
                <span className="flex items-center">
                  {item.title}
                  {item.dropdown && (
                    <FaChevronDown className="ml-1 text-xs transition-transform duration-200 group-hover:rotate-180" />
                  )}
                </span>
              </NavLink>

              {/* Dropdown Menu */}
              {item.dropdown && (
                <div className="absolute left-0 mt-2 w-64 origin-top-left rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform group-hover:translate-y-0 translate-y-2">
                  <div className="py-1">
                    {item.dropdown.map((dropdownItem) => (
                      <NavLink
                        key={dropdownItem.name}
                        to={dropdownItem.path}
                        className={({ isActive }) =>
                          `block px-4 py-2 text-sm hover:bg-neutral hover:text-primary transition-colors duration-200 ${
                            isActive ? 'text-primary font-medium' : 'text-text'
                          }`
                        }
                      >
                        {dropdownItem.name}
                      </NavLink>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* CTA Button */}
        <div className="hidden lg:flex items-center space-x-4">
          <a
            href="tel:+902121234567"
            className="flex items-center text-primary font-medium hover:text-primary-dark transition-colors"
          >
            <FaPhone className="mr-2" />
            <span>0212 123 45 67</span>
          </a>
          
          {user ? (
            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center space-x-2 text-primary hover:text-primary-dark transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  {user.user_metadata?.avatar_url ? (
                    <img
                      src={user.user_metadata.avatar_url}
                      alt="Avatar"
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <FaUser />
                  )}
                </div>
                <span className="font-medium">
                  {user.user_metadata?.full_name?.split(' ')[0] || 'Hesabım'}
                </span>
                <FaChevronDown className={`text-xs transition-transform duration-200 ${isUserMenuOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                  <div className="py-1">
                    <Link
                      to="/profil"
                      className="block px-4 py-2 text-sm text-text hover:bg-neutral hover:text-primary transition-colors"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <i className="bi bi-person mr-2"></i> Profilim
                    </Link>
                    <Link
                      to="/profil"
                      className="block px-4 py-2 text-sm text-text hover:bg-neutral hover:text-primary transition-colors"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <i className="bi bi-calendar-check mr-2"></i> Randevularım
                    </Link>
                    <button
                      onClick={() => {
                        signOut();
                        setIsUserMenuOpen(false);
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-neutral hover:text-red-700 transition-colors"
                    >
                      <i className="bi bi-box-arrow-right mr-2"></i> Çıkış Yap
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="flex items-center text-primary font-medium hover:text-primary-dark transition-colors"
            >
              <FaUser className="mr-2" />
              <span>Giriş Yap</span>
            </button>
          )}
          
          <a
            href="https://anadoluhastaneleri.kendineiyibak.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-accent"
          >
            Online Randevu
          </a>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="lg:hidden z-50 text-text hover:text-primary transition-colors"
          onClick={toggleMenu}
          aria-label={isOpen ? 'Menüyü Kapat' : 'Menüyü Aç'}
        >
          {isOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
        </button>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, x: '100%' }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: '100%' }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 bg-white z-40 lg:hidden"
            >
              <div className="flex flex-col h-full pt-24 pb-8 px-6 overflow-y-auto">
                <nav className="flex-1">
                  <ul className="space-y-2">
                    {menuItems.map((item) => (
                      <li key={item.title}>
                        <div className="border-b border-gray-100 pb-2">
                          {item.dropdown ? (
                            <>
                              <button
                                onClick={() => toggleDropdown(item.title)}
                                className="w-full flex justify-between items-center py-3 text-lg font-medium text-text hover:text-primary transition-colors"
                              >
                                {item.title}
                                <FaChevronDown
                                  className={`transition-transform duration-200 ${
                                    activeDropdown === item.title ? 'rotate-180' : ''
                                  }`}
                                />
                              </button>
                              <AnimatePresence>
                                {activeDropdown === item.title && (
                                  <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="overflow-hidden"
                                  >
                                    <ul className="pl-4 py-2 space-y-2">
                                      {item.dropdown.map((dropdownItem) => (
                                        <li key={dropdownItem.name}>
                                          <NavLink
                                            to={dropdownItem.path}
                                            className={({ isActive }) =>
                                              `block py-2 text-base ${
                                                isActive ? 'text-primary font-medium' : 'text-text-light'
                                              }`
                                            }
                                            onClick={closeMenu}
                                          >
                                            {dropdownItem.name}
                                          </NavLink>
                                        </li>
                                      ))}
                                    </ul>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </>
                          ) : (
                            <NavLink
                              to={item.path}
                              className={({ isActive }) =>
                                `block py-3 text-lg font-medium ${
                                  isActive ? 'text-primary' : 'text-text hover:text-primary'
                                }`
                              }
                              onClick={closeMenu}
                            >
                              {item.title}
                            </NavLink>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                </nav>
                <div className="mt-8 space-y-4">
                  <a
                    href="tel:+902121234567"
                    className="flex items-center justify-center text-primary font-medium hover:text-primary-dark transition-colors"
                  >
                    <FaPhone className="mr-2" />
                    <span>0212 123 45 67</span>
                  </a>
                  
                  {user ? (
                    <div className="space-y-2">
                      <Link
                        to="/profil"
                        className="btn btn-outline w-full flex items-center justify-center"
                        onClick={closeMenu}
                      >
                        <i className="bi bi-person mr-2"></i> Profilim
                      </Link>
                      <button
                        onClick={() => {
                          signOut();
                          closeMenu();
                        }}
                        className="btn bg-red-600 hover:bg-red-700 text-white w-full flex items-center justify-center"
                      >
                        <i className="bi bi-box-arrow-right mr-2"></i> Çıkış Yap
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setIsAuthModalOpen(true);
                        closeMenu();
                      }}
                      className="btn btn-outline w-full flex items-center justify-center"
                    >
                      <FaUser className="mr-2" />
                      <span>Giriş Yap</span>
                    </button>
                  )}
                  
                  <a
                    href="https://anadoluhastaneleri.kendineiyibak.app/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-accent w-full text-center"
                  >
                    Online Randevu
                  </a>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </header>
  )
}

export default Header
