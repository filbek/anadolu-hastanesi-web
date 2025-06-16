import { Helmet } from 'react-helmet-async'
import HeroBanner from '../components/home/HeroBanner'
import HospitalBranches from '../components/home/HospitalBranches'
import DepartmentsSection from '../components/home/DepartmentsSection'
import DoctorsSlider from '../components/home/DoctorsSlider'
import HealthGuideSection from '../components/home/HealthGuideSection'
import AppointmentCTA from '../components/home/AppointmentCTA'
import TestimonialsSection from '../components/home/TestimonialsSection'
import HealthTourismSection from '../components/home/HealthTourismSection'

const HomePage = () => {
  return (
    <>
      <Helmet>
        <title>Anadolu Hastaneleri Grubu | Sağlığınız İçin En İyi Hizmet</title>
        <meta name="description" content="Anadolu Hastaneleri Grubu olarak, sağlığınız için en iyi hizmeti sunmak amacıyla çalışıyoruz. Modern teknoloji ve uzman kadromuzla yanınızdayız." />
      </Helmet>

      <HeroBanner />
      <HospitalBranches />
      <DepartmentsSection />
      <DoctorsSlider />
      <HealthGuideSection />
      <AppointmentCTA />
      <TestimonialsSection />
      <HealthTourismSection />
    </>
  )
}

export default HomePage
