import { Suspense, lazy } from 'react'
import { Routes, Route, Navigate, useParams } from 'react-router-dom'
import Layout from './components/layout/Layout'
import AdminLayout from './components/admin/AdminLayout'
import LoadingSpinner from './components/ui/LoadingSpinner'
import HomePage from './pages/HomePage'


// Lazy loaded pages
const HospitalsPage = lazy(() => import('./pages/HospitalsPage'))
const HospitalDetailPage = lazy(() => import('./pages/HospitalDetailPage'))
const DepartmentsPage = lazy(() => import('./pages/DepartmentsPage'))
const DepartmentDetailPage = lazy(() => import('./pages/DepartmentDetailPage'))
const DoctorsPage = lazy(() => import('./pages/DoctorsPage'))
const DoctorDetailPage = lazy(() => import('./pages/DoctorDetailPage'))
const HealthGuidePage = lazy(() => import('./pages/HealthGuidePage'))
const HealthArticlePage = lazy(() => import('./pages/HealthArticlePage'))
const HealthTourismPage = lazy(() => import('./pages/HealthTourismPage'))
const HealthVideosPage = lazy(() => import('./pages/HealthVideosPage'))
const PatientInfoPage = lazy(() => import('./pages/PatientInfoPage'))
const TestNewPage = lazy(() => import('./pages/TestNewPage'))
const ContactPage = lazy(() => import('./pages/ContactPage'))
const ProfilePage = lazy(() => import('./pages/ProfilePage'))
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'))
const TestPage = lazy(() => import('./pages/TestPage'))
const MissionVisionPage = lazy(() => import('./pages/MissionVisionPage'))
const ManagementPage = lazy(() => import('./pages/ManagementPage'))
const CompanionPolicyPage = lazy(() => import('./pages/CompanionPolicyPage'))
const VisitingRulesPage = lazy(() => import('./pages/VisitingRulesPage'))
const PatientRightsPage = lazy(() => import('./pages/PatientRightsPage'))
const AboutHospitalPage = lazy(() => import('./pages/AboutHospitalPage'))
const ChairmanMessagePage = lazy(() => import('./pages/ChairmanMessagePage'))
const QualityManagementPage = lazy(() => import('./pages/QualityManagementPage'))
// const NewsPage = lazy(() => import('./pages/NewsPage'))
const PatientFeedbackPage = lazy(() => import('./pages/PatientFeedbackPage'))
const ComplaintPolicyPage = lazy(() => import('./pages/ComplaintPolicyPage'))
const GebeOkuluPage = lazy(() => import('./pages/GebeOkuluPage'))
const EmergencyServicesPage = lazy(() => import('./pages/EmergencyServicesPage'))
// const SocialResponsibilityPage = lazy(() => import('./pages/SocialResponsibilityPage'))
const CareerPage = lazy(() => import('./pages/CareerPage'))
// const MediaPage = lazy(() => import('./pages/MediaPage'))
const TransportationPage = lazy(() => import('./pages/TransportationPage'))
const HospitalGuidePage = lazy(() => import('./pages/HospitalGuidePage'))
const ContractedInstitutionsPage = lazy(() => import('./pages/ContractedInstitutionsPage'))
const MedicalCentersPage = lazy(() => import('./pages/MedicalCentersPage'))
const SecondOpinionPage = lazy(() => import('./pages/SecondOpinionPage'))
const CookiePolicyPage = lazy(() => import('./pages/CookiePolicyPage'))
const KvkkPage = lazy(() => import('./pages/KvkkPage'))

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
const AdminSEO = lazy(() => import('./components/admin/AdminSEO'))
const AdminTestConnection = lazy(() => import('./components/admin/AdminTestConnection'))
const AdminVideoContent = lazy(() => import('./components/admin/AdminVideoContent'))
const AdminQualityCertificates = lazy(() => import('./components/admin/AdminQualityCertificates'))
const AdminPatientInfo = lazy(() => import('./components/admin/AdminPatientInfo'))
const AdminContractedInstitutions = lazy(() => import('./components/admin/AdminContractedInstitutions'))
const AdminSettings = lazy(() => import('./components/admin/AdminSettings'))
const AdminHomeSettings = lazy(() => import('./components/admin/AdminHomeSettings'))
const AdminHealthTourism = lazy(() => import('./components/admin/AdminHealthTourism'))
const AdminHeroSlides = lazy(() => import('./components/admin/AdminHeroSlides'))
const AdminTestimonials = lazy(() => import('./components/admin/AdminTestimonials'))
const AdminNews = lazy(() => import('./components/admin/AdminNews'))
const AdminSiteStats = lazy(() => import('./components/admin/AdminSiteStats'))
const AdminAccreditations = lazy(() => import('./components/admin/AdminAccreditations'))
const AdminPatientFeedback = lazy(() => import('./components/admin/AdminPatientFeedback'))
const AdminAuditLogs = lazy(() => import('./components/admin/AdminAuditLogs'))
const AdminManagementTeam = lazy(() => import('./components/admin/AdminManagementTeam'))
const AdminSecondOpinion = lazy(() => import('./components/admin/AdminSecondOpinion'))
const ManagementTeamForm = lazy(() => import('./components/admin/ManagementTeamForm'))
const AdminTranslations = lazy(() => import('./components/admin/AdminTranslations'))
const AdminLoginPage = lazy(() => import('./pages/AdminLoginPage'))
const AdminGebeOkulu = lazy(() => import('./components/admin/AdminGebeOkulu'))

const HospitalForm = lazy(() => import('./components/admin/HospitalForm'))
const DepartmentForm = lazy(() => import('./components/admin/DepartmentForm'))
const DoctorForm = lazy(() => import('./components/admin/DoctorForm'))
const ArticleForm = lazy(() => import('./components/admin/ArticleForm'))

import AdminRoute from './routes/AdminRoute';

// Eski site URL formatı (/hastane/{id}/{slug}) için yönlendirme
function LegacyHospitalRedirect() {
  const { slug } = useParams<{ slug: string }>()
  return <Navigate to={slug ? `/hastanelerimiz/${slug}` : '/hastanelerimiz'} replace />
}

function App() {
  return (
    <>
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="hastanelerimiz">
              <Route index element={<HospitalsPage />} />
              <Route path=":slug" element={<HospitalDetailPage />} />
            </Route>
            {/* Eski site URL'leri */}
            <Route path="hastane">
              <Route index element={<Navigate to="/hastanelerimiz" replace />} />
              <Route path=":id/:slug" element={<LegacyHospitalRedirect />} />
              <Route path=":slug" element={<LegacyHospitalRedirect />} />
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
            <Route path="ikinci-gorus" element={<SecondOpinionPage />} />
            <Route path="test-new-page" element={<TestNewPage />} />
            <Route path="iletisim" element={<ContactPage />} />
            <Route path="profil" element={<ProfilePage />} />
            <Route path="misyon-vizyon-ve-degerlerimiz" element={<MissionVisionPage />} />
            <Route path="yonetim" element={<ManagementPage />} />
            <Route path="refakat-politikasi-ve-refakatci-kurallari" element={<CompanionPolicyPage />} />
            <Route path="ziyaret-kurallari-ve-saatleri" element={<VisitingRulesPage />} />
            <Route path="hasta-haklari" element={<PatientRightsPage />} />
            <Route path="hakkimizda" element={<AboutHospitalPage />} />
            <Route path="baskanin-mesaji" element={<ChairmanMessagePage />} />
            <Route path="kalite-yonetimi" element={<QualityManagementPage />} />
            {/* Bizden Haberler disabled for now - reactivate by uncommenting */}
            {/* <Route path="bizden-haberler" element={<NewsPage />} /> */}
            <Route path="bizden-haberler" element={<Navigate to="/404" replace />} />
            <Route path="sizi-dinliyoruz" element={<PatientFeedbackPage />} />
            <Route path="sikayet-politikasi" element={<ComplaintPolicyPage />} />
            <Route path="gebe-okulu" element={<GebeOkuluPage />} />
            <Route path="acil-servis" element={<EmergencyServicesPage />} />
            <Route path="sosyal-sorumluluk" element={<Navigate to="/404" replace />} />
            <Route path="kariyer" element={<CareerPage />} />
            <Route path="ulasim" element={<TransportationPage />} />
            <Route path="hastane-ici-rehber" element={<HospitalGuidePage />} />
            <Route path="anlasmali-kurumlar" element={<ContractedInstitutionsPage />} />
            <Route path="merkezlerimiz" element={<MedicalCentersPage />} />
            <Route path="cerez-politikasi" element={<CookiePolicyPage />} />
            <Route path="kvkk" element={<KvkkPage />} />
            <Route path="test" element={<TestPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>

          {/* Admin Login Route */}
          <Route path="/admin/login" element={<AdminLoginPage />} />

          {/* Admin Routes */}
          <Route path="/admin" element={<AdminRoute />}>
            <Route element={<AdminLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="home-settings" element={<AdminHomeSettings />} />
              <Route path="hospitals" element={<AdminHospitals />} />
              <Route path="hospitals/new" element={<HospitalForm />} />
              <Route path="hospitals/edit/:id" element={<HospitalForm />} />
              <Route path="departments" element={<AdminDepartments />} />
              <Route path="departments/new" element={<DepartmentForm />} />
              <Route path="departments/edit/:id" element={<DepartmentForm />} />
              <Route path="doctors" element={<AdminDoctors />} />
              <Route path="doctors/new" element={<DoctorForm />} />
              <Route path="doctors/edit/:id" element={<DoctorForm />} />
              <Route path="articles" element={<AdminArticles />} />
              <Route path="articles/new" element={<ArticleForm />} />
              <Route path="articles/edit/:id" element={<ArticleForm />} />
              <Route path="health-tourism" element={<AdminHealthTourism />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="pages" element={<AdminPages />} />
              <Route path="media" element={<AdminMedia />} />
              <Route path="contact-info" element={<AdminContactInfo />} />
              <Route path="seo" element={<AdminSEO />} />
              <Route path="video-content" element={<AdminVideoContent />} />
              <Route path="quality-certificates" element={<AdminQualityCertificates />} />
              <Route path="patient-info" element={<AdminPatientInfo />} />
              <Route path="contracted-institutions" element={<AdminContractedInstitutions />} />
              <Route path="test-connection" element={<AdminTestConnection />} />
              <Route path="settings" element={<AdminSettings />} />
              <Route path="hero-slides" element={<AdminHeroSlides />} />
              <Route path="testimonials" element={<AdminTestimonials />} />
              <Route path="news" element={<AdminNews />} />
              <Route path="site-stats" element={<AdminSiteStats />} />
              <Route path="accreditations" element={<AdminAccreditations />} />
              <Route path="patient-feedback" element={<AdminPatientFeedback />} />
              <Route path="translations" element={<AdminTranslations />} />
              <Route path="audit-logs" element={<AdminAuditLogs />} />
              <Route path="management-team" element={<AdminManagementTeam />} />
              <Route path="management-team/new" element={<ManagementTeamForm />} />
              <Route path="management-team/edit/:id" element={<ManagementTeamForm />} />
              <Route path="second-opinion" element={<AdminSecondOpinion />} />
              <Route path="gebe-okulu" element={<AdminGebeOkulu />} />
            </Route>
          </Route>
        </Routes>
      </Suspense>

    </>
  )
}

export default App
