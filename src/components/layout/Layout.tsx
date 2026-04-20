import { Outlet, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import Header from './Header'
import Footer from './Footer'
import EmergencyBanner from './EmergencyBanner'
import ScrollToTop from '../ui/ScrollToTop'
import FloatingActions from './FloatingActions'

const Layout = () => {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return (
    <div className="flex flex-col min-h-screen">
      <EmergencyBanner />
      <Header />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
      <ScrollToTop />
      <FloatingActions />
    </div>
  )
}

export default Layout
