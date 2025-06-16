import { Suspense, lazy } from 'react'
import { Routes, Route } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import Layout from './components/layout/Layout'
import AdminLayout from './components/admin/AdminLayout'
import LoadingSpinner from './components/ui/LoadingSpinner'

// Lazy loaded pages
const HomePage = lazy(() => import('./pages/HomePage'))
const HospitalsPage = lazy(() => import('./pages/HospitalsPage'))
const HospitalDetailPage = lazy(() => import('./pages/HospitalDetailPage'))
const DepartmentsPage = lazy(() => import('./pages/DepartmentsPage'))
const DepartmentDetailPage = lazy(() => import('./pages/DepartmentDetailPage'))
const DoctorsPage = lazy(() => import('./pages/DoctorsPage'))
const DoctorDetailPage = lazy(() => import('./pages/DoctorDetailPage'))
const HealthGuidePage = lazy(() => import('./pages/HealthGuidePage'))
const HealthArticlePage = lazy(() => import('./pages/HealthArticlePage'))
const HealthTourismPage = lazy(() => import('./pages/HealthTourismPage'))
const ContactPage = lazy(() => import('./pages/ContactPage'))
const AboutPage = lazy(() => import('./pages/AboutPage'))
const ProfilePage = lazy(() => import('./pages/ProfilePage'))
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'))

// Admin pages
const Dashboard = lazy(() => import('./components/admin/Dashboard'))
const AdminHospitals = lazy(() => import('./components/admin/AdminHospitals'))
const AdminLoginPage = lazy(() => import('./pages/AdminLoginPage'))
import AdminRoute from './routes/AdminRoute'; // AdminRoute'u import edin

function App() {
  return (
    <AnimatePresence mode="wait">
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="hastanelerimiz">
              <Route index element={<HospitalsPage />} />
              <Route path=":slug" element={<HospitalDetailPage />} />
            </Route>
            <Route path="bolumlerimiz">
              <Route index element={<DepartmentsPage />} />
              <Route path=":slug" element={<DepartmentDetailPage />} />
            </Route>
            <Route path="doktorlar">
              <Route index element={<DoctorsPage />} />
              <Route path=":slug" element={<DoctorDetailPage />} />
            </Route>
            <Route path="saglik-rehberi">
              <Route index element={<HealthGuidePage />} />
              <Route path=":slug" element={<HealthArticlePage />} />
            </Route>
            <Route path="saglik-turizmi" element={<HealthTourismPage />} />
            <Route path="iletisim" element={<ContactPage />} />
            <Route path="hakkimizda" element={<AboutPage />} />
            <Route path="profil" element={<ProfilePage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>

          {/* Admin Login Route */}
          <Route path="/admin/login" element={<AdminLoginPage />} />

          {/* Admin Routes */}
          <Route path="/admin" element={<AdminRoute />}>
            <Route element={<AdminLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="hospitals" element={<AdminHospitals />} />
              {/* Add more admin routes as needed */}
            </Route>
          </Route>
        </Routes>
      </Suspense>
    </AnimatePresence>
  )
}

export default App
