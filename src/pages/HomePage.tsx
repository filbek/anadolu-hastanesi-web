
import HeroBanner from '../components/home/HeroBanner'
import HospitalBranches from '../components/home/HospitalBranches'
import DepartmentsSection from '../components/home/DepartmentsSection'
import HealthGuideSection from '../components/home/HealthGuideSection'
import HealthTourismSection from '../components/home/HealthTourismSection'
import ScrollReveal from '../components/ui/ScrollReveal'

const HomePage = () => {
  return (
    <div className="home-page">
      <HeroBanner />
      
      <ScrollReveal>
        <HospitalBranches />
      </ScrollReveal>

      <ScrollReveal>
        <DepartmentsSection />
      </ScrollReveal>

      <ScrollReveal>
        <HealthTourismSection />
      </ScrollReveal>

      <ScrollReveal>
        <HealthGuideSection />
      </ScrollReveal>
    </div>
  )
}

export default HomePage

