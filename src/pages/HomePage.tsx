import DynamicPageRenderer from '../components/common/DynamicPageRenderer'
import HeroBanner from '../components/home/HeroBanner'
import HospitalBranches from '../components/home/HospitalBranches'
import DepartmentsSection from '../components/home/DepartmentsSection'
import DoctorsSlider from '../components/home/DoctorsSlider'
import HealthGuideSection from '../components/home/HealthGuideSection'
import AppointmentCTA from '../components/home/AppointmentCTA'
import TestimonialsSection from '../components/home/TestimonialsSection'
import HealthTourismSection from '../components/home/HealthTourismSection'

// Original homepage components as fallback
const OriginalHomePage = () => (
  <>
    <HeroBanner />
    <HospitalBranches />
    <DepartmentsSection />
    <DoctorsSlider />
    <HealthGuideSection />
    <AppointmentCTA />
    <TestimonialsSection />
    <HealthTourismSection />
  </>
);

const HomePage = () => {
  return (
    <DynamicPageRenderer
      slug="ana-sayfa"
      fallbackComponent={OriginalHomePage}
    />
  )
}

export default HomePage
