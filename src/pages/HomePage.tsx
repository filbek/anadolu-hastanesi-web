import HeroBanner from '../components/home/HeroBanner'
import QuickActionRibbon from '../components/home/QuickActionRibbon'
import StatsSection from '../components/home/StatsSection'
import HospitalBranches from '../components/home/HospitalBranches'
import DepartmentsSection from '../components/home/DepartmentsSection'
import DoctorsSlider from '../components/home/DoctorsSlider'
import SecondOpinionSection from '../components/home/SecondOpinionSection'
// import HealthTourismSection from '../components/home/HealthTourismSection'
// import TestimonialsSection from '../components/home/TestimonialsSection'
import HealthGuideSection from '../components/home/HealthGuideSection'
import AppointmentCTA from '../components/home/AppointmentCTA'
// import AccreditationBand from '../components/home/AccreditationBand'

const HomePage = () => {
  return (
    <div className="home-page">
      {/* 1. Hero Banner — Full-bleed, emotional, single CTA */}
      <HeroBanner />

      {/* 2. Quick Action Ribbon — Glassmorphism band */}
      <QuickActionRibbon />

      {/* 3. Stats — Numbers with proof */}
      <StatsSection />

      {/* 4. Hospital Branches — Asymmetric grid */}
      <HospitalBranches />

      {/* 5. Departments — Category pills + asymmetric cards */}
      <DepartmentsSection />

      {/* 6. Doctors — Masonry grid, B&W to color */}
      <DoctorsSlider />

      {/* 7. Second Opinion — Dark, immersive CTA */}
      <SecondOpinionSection />

      {/* 8. Health Guide — Editorial cards */}
      <HealthGuideSection />

      {/* 10. Appointment CTA — Full-bleed, centered, powerful */}
      <AppointmentCTA />
    </div>
  )
}

export default HomePage
