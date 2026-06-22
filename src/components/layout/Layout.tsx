import { Outlet, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import Header from './Header'
import Footer from './Footer'
import EmergencyBanner from './EmergencyBanner'
import ScrollToTop from '../ui/ScrollToTop'
import FloatingActions from './FloatingActions'

const Layout = () => {
  const location = useLocation()

  useEffect(() => {
    const timeout = setTimeout(() => {
      window.scrollTo({ top: 0, left: 0, behavior: 'smooth' })
    }, 50)
    return () => clearTimeout(timeout)
  }, [location.pathname, location.key])

  return (
    <div className="flex flex-col min-h-screen">
      <a href="#main-content" className="skip-to-content">
        İçeriğe atla
      </a>
      <EmergencyBanner />
      <Header />
      <main id="main-content" tabIndex={-1} className="flex-grow focus:outline-none">
        <Outlet />
      </main>
      <Footer />
      <ScrollToTop />
      <FloatingActions />
    </div>
  )
}

export default Layout
