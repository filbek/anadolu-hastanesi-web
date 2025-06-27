import { Suspense, lazy } from 'react'
import { Routes, Route } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import Layout from './components/layout/Layout'
import AdminLayout from './components/admin/AdminLayout'
import LoadingSpinner from './components/ui/LoadingSpinner'
import RouteDebugger from './components/debug/RouteDebugger'

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
const QualityCertificatesPage = lazy(() => import('./pages/QualityCertificatesPage'))
const HealthVideosPage = lazy(() => import('./pages/HealthVideosPage'))
const PatientInfoPage = lazy(() => import('./pages/PatientInfoPage'))
const TestNewPage = lazy(() => import('./pages/TestNewPage'))
const ContactPage = lazy(() => import('./pages/ContactPage'))
const AboutPage = lazy(() => import('./pages/AboutPage'))
const ProfilePage = lazy(() => import('./pages/ProfilePage'))
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'))
const TestPage = lazy(() => import('./pages/TestPage'))

// Admin pages
const Dashboard = lazy(() => import('./components/admin/Dashboard'))
const AdminHospitals = lazy(() => import('./components/admin/AdminHospitals'))
const AdminDepartments = lazy(() => import('./components/admin/AdminDepartments'))
const AdminDoctors = lazy(() => import('./components/admin/AdminDoctors'))
const AdminArticles = lazy(() => import('./components/admin/AdminArticles'))
const AdminUsers = lazy(() => import('./components/admin/AdminUsers'))
const AdminPages = lazy(() => import('./components/admin/AdminPages'))
const AdminMedia = lazy(() => import('./components/admin/AdminMedia'))
const AdminContactInfo = lazy(() => import('./components/admin/AdminContactInfo'))
const AdminAbout = lazy(() => import('./components/admin/AdminAbout'))
const AdminSEO = lazy(() => import('./components/admin/AdminSEO'))
const AdminTestConnection = lazy(() => import('./components/admin/AdminTestConnection'))
const AdminVideoContent = lazy(() => import('./components/admin/AdminVideoContent'))
const AdminQualityCertificates = lazy(() => import('./components/admin/AdminQualityCertificates'))
const AdminPatientInfo = lazy(() => import('./components/admin/AdminPatientInfo'))
const AdminSettings = lazy(() => import('./components/admin/AdminSettings'))
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
            <Route path="saglik-rehberi" element={<HealthGuidePage />} />
            <Route path="saglik-rehberi/videolar" element={<HealthVideosPage />} />
            <Route path="saglik-rehberi/hasta-bilgilendirme" element={<PatientInfoPage />} />
            <Route path="saglik-rehberi/:slug" element={<HealthArticlePage />} />
            <Route path="saglik-turizmi" element={<HealthTourismPage />} />
            <Route path="test-new-page" element={<TestNewPage />} />
            <Route path="iletisim" element={<ContactPage />} />
            <Route path="hakkimizda" element={<AboutPage />} />
            <Route path="hakkimizda/kalite-belgeleri" element={<QualityCertificatesPage />} />
            <Route path="profil" element={<ProfilePage />} />
            <Route path="test" element={<TestPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>

          {/* Admin Login Route */}
          <Route path="/admin/login" element={<AdminLoginPage />} />

          {/* Admin Routes */}
          <Route path="/admin" element={<AdminRoute />}>
            <Route element={<AdminLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="hospitals" element={<AdminHospitals />} />
              <Route path="departments" element={<AdminDepartments />} />
              <Route path="doctors" element={<AdminDoctors />} />
              <Route path="articles" element={<AdminArticles />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="pages" element={<AdminPages />} />
              <Route path="media" element={<AdminMedia />} />
              <Route path="contact-info" element={<AdminContactInfo />} />
              <Route path="about" element={<AdminAbout />} />
              <Route path="seo" element={<AdminSEO />} />
              <Route path="video-content" element={<AdminVideoContent />} />
              <Route path="quality-certificates" element={<AdminQualityCertificates />} />
              <Route path="patient-info" element={<AdminPatientInfo />} />
              <Route path="test-connection" element={<AdminTestConnection />} />
              <Route path="settings" element={<AdminSettings />} />
            </Route>
          </Route>
        </Routes>
      </Suspense>
      <RouteDebugger />
    </AnimatePresence>
  )
}

export default App
