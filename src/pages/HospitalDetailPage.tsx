import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Pagination } from 'swiper/modules'
import { FaMapMarkerAlt, FaPhone, FaEnvelope, FaClock, FaCalendarAlt, FaUserMd, FaHospital, FaWheelchair } from 'react-icons/fa'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'

// Mock data for a single hospital
const hospitalData = {
  id: 1,
  name: 'Anadolu Merkez Hastanesi',
  slug: 'anadolu-merkez-hastanesi',
  description: 'Anadolu Merkez Hastanesi, modern teknoloji ve uzman kadrosuyla sağlığınız için en iyi hizmeti sunmak amacıyla çalışmaktadır. 24 saat acil servis, ameliyathane, yoğun bakım ve tüm branşlarda poliklinik hizmeti sunmaktadır.',
  longDescription: 'Anadolu Merkez Hastanesi, 2005 yılında kurulmuş olup, 20.000 m² kapalı alanda hizmet vermektedir. 150 yatak kapasitesi, 10 ameliyathane, 20 yoğun bakım ünitesi ve 50 poliklinik odası ile hastalarına hizmet vermektedir. JCI akreditasyonu ve ISO 9001 kalite belgesi sahibi olan hastanemiz, hasta memnuniyetini en üst düzeyde tutmayı hedeflemektedir. Modern teknoloji ve uzman kadrosuyla sağlığınız için en iyi hizmeti sunmak amacıyla çalışmaktadır.',
  address: 'Atatürk Bulvarı No:123, Şişli, İstanbul',
  phone: '0212 123 45 67',
  email: 'info@anadolumerkezhastanesi.com',
  workingHours: 'Pazartesi - Cumartesi: 08:00 - 20:00, Pazar: 08:00 - 18:00',
  emergencyHours: '24 saat hizmet vermektedir.',
  images: [
    'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1504439468489-c8920d796a29?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1516549655169-df83a0774514?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80',
  ],
  virtualTourUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
  departments: [
    { id: 1, name: 'Kardiyoloji', slug: 'kardiyoloji', icon: 'bi-heart-pulse-fill' },
    { id: 2, name: 'Nöroloji', slug: 'noroloji', icon: 'bi-brain' },
    { id: 3, name: 'Ortopedi', slug: 'ortopedi', icon: 'bi-person-standing' },
    { id: 4, name: 'Genel Cerrahi', slug: 'genel-cerrahi', icon: 'bi-scissors' },
    { id: 5, name: 'Göz Hastalıkları', slug: 'goz-hastaliklari', icon: 'bi-eye-fill' },
    { id: 6, name: 'Dahiliye', slug: 'dahiliye', icon: 'bi-clipboard2-pulse-fill' },
    { id: 7, name: 'Kadın Hastalıkları', slug: 'kadin-hastaliklari', icon: 'bi-gender-female' },
    { id: 8, name: 'Çocuk Sağlığı', slug: 'cocuk-sagligi', icon: 'bi-balloon-heart-fill' },
  ],
  doctors: [
    { id: 1, name: 'Prof. Dr. Ahmet Yılmaz', slug: 'prof-dr-ahmet-yilmaz', title: 'Kardiyoloji Uzmanı', image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=300&q=80' },
    { id: 3, name: 'Prof. Dr. Mehmet Demir', slug: 'prof-dr-mehmet-demir', title: 'Ortopedi Uzmanı', image: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=300&q=80' },
    { id: 5, name: 'Prof. Dr. Ali Yıldız', slug: 'prof-dr-ali-yildiz', title: 'Genel Cerrahi Uzmanı', image: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=300&q=80' },
  ],
  features: [
    { name: '24 Saat Acil Servis', icon: 'bi-heart-pulse-fill' },
    { name: 'MR ve Tomografi', icon: 'bi-radioactive' },
    { name: 'Yoğun Bakım Ünitesi', icon: 'bi-activity' },
    { name: 'Ameliyathane', icon: 'bi-bandaid-fill' },
    { name: 'Laboratuvar', icon: 'bi-eyedropper' },
    { name: 'Fizik Tedavi', icon: 'bi-person-arms-up' },
    { name: 'Radyoloji', icon: 'bi-file-earmark-medical-fill' },
    { name: 'Eczane', icon: 'bi-capsule' },
  ],
  location: {
    lat: 41.0082,
    lng: 28.9784,
    mapUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3008.9633921041065!2d28.978399999999998!3d41.008199999999995!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNDHCsDAwJzI5LjUiTiAyOMKwNTgnNDIuMiJF!5e0!3m2!1str!2str!4v1631234567890!5m2!1str!2str',
  },
}

const HospitalDetailPage = () => {
  const { slug } = useParams<{ slug: string }>()
  const [hospital, setHospital] = useState<typeof hospitalData | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('about')

  useEffect(() => {
    // In a real application, you would fetch the hospital data from an API
    // For this example, we'll use the mock data
    setLoading(true)
    setTimeout(() => {
      setHospital(hospitalData)
      setLoading(false)
    }, 500)
  }, [slug])

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!hospital) {
    return (
      <div className="container-custom py-20 text-center">
        <h2 className="text-2xl font-bold mb-4">Hastane Bulunamadı</h2>
        <p className="mb-8">Aradığınız hastane bulunamadı. Lütfen tüm hastanelerimizi görüntüleyin.</p>
        <Link to="/hastanelerimiz" className="btn btn-primary">
          Tüm Hastanelerimiz
        </Link>
      </div>
    )
  }

  return (
    <>
      <Helmet>
        <title>{hospital.name} | Anadolu Hastaneleri Grubu</title>
        <meta name="description" content={hospital.description} />
      </Helmet>

      <div className="pt-24 pb-12">
        {/* Hero Section */}
        <div className="relative h-96">
          <div className="absolute inset-0">
            <img
              src={hospital.images[0]}
              alt={hospital.name}
              className="w-full h-full object-cover"
              loading="lazy"
              crossOrigin="anonymous"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-black/30" />
          </div>
          <div className="container-custom relative h-full flex flex-col justify-end pb-12">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-4xl md:text-5xl font-bold text-white mb-4"
            >
              {hospital.name}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-white/90 text-lg max-w-3xl"
            >
              {hospital.description}
            </motion.p>
          </div>
        </div>

        {/* Contact Info Bar */}
        <div className="bg-primary text-white py-4">
          <div className="container-custom">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center">
                <FaMapMarkerAlt className="text-accent mr-3" />
                <div>
                  <p className="text-sm font-medium">Adres</p>
                  <p className="text-sm text-white/80">{hospital.address}</p>
                </div>
              </div>
              <div className="flex items-center">
                <FaPhone className="text-accent mr-3" />
                <div>
                  <p className="text-sm font-medium">Telefon</p>
                  <a href={`tel:${hospital.phone.replace(/\s/g, '')}`} className="text-sm text-white/80 hover:text-white">
                    {hospital.phone}
                  </a>
                </div>
              </div>
              <div className="flex items-center">
                <FaClock className="text-accent mr-3" />
                <div>
                  <p className="text-sm font-medium">Çalışma Saatleri</p>
                  <p className="text-sm text-white/80">{hospital.workingHours}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container-custom py-12">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Left Column - Main Content */}
            <div className="lg:w-2/3">
              {/* Tabs */}
              <div className="mb-8 border-b border-gray-200">
                <div className="flex overflow-x-auto">
                  <button
                    className={`px-4 py-2 font-medium text-sm whitespace-nowrap ${
                      activeTab === 'about' ? 'text-primary border-b-2 border-primary' : 'text-text-light hover:text-primary'
                    }`}
                    onClick={() => setActiveTab('about')}
                  >
                    Hakkında
                  </button>
                  <button
                    className={`px-4 py-2 font-medium text-sm whitespace-nowrap ${
                      activeTab === 'departments' ? 'text-primary border-b-2 border-primary' : 'text-text-light hover:text-primary'
                    }`}
                    onClick={() => setActiveTab('departments')}
                  >
                    Bölümler
                  </button>
                  <button
                    className={`px-4 py-2 font-medium text-sm whitespace-nowrap ${
                      activeTab === 'doctors' ? 'text-primary border-b-2 border-primary' : 'text-text-light hover:text-primary'
                    }`}
                    onClick={() => setActiveTab('doctors')}
                  >
                    Doktorlar
                  </button>
                  <button
                    className={`px-4 py-2 font-medium text-sm whitespace-nowrap ${
                      activeTab === 'gallery' ? 'text-primary border-b-2 border-primary' : 'text-text-light hover:text-primary'
                    }`}
                    onClick={() => setActiveTab('gallery')}
                  >
                    Galeri
                  </button>
                  <button
                    className={`px-4 py-2 font-medium text-sm whitespace-nowrap ${
                      activeTab === 'location' ? 'text-primary border-b-2 border-primary' : 'text-text-light hover:text-primary'
                    }`}
                    onClick={() => setActiveTab('location')}
                  >
                    Konum
                  </button>
                </div>
              </div>

              {/* Tab Content */}
              <div className="min-h-[500px]">
                {/* About Tab */}
                {activeTab === 'about' && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                  >
                    <h2 className="text-2xl font-semibold text-primary mb-4">{hospital.name} Hakkında</h2>
                    <p className="text-text-light mb-6">{hospital.longDescription}</p>
                    
                    <h3 className="text-xl font-semibold text-primary mb-4">Özellikler ve Hizmetler</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
                      {hospital.features.map((feature, index) => (
                        <div key={index} className="flex items-center p-3 bg-neutral rounded-lg">
                          <i className={`bi ${feature.icon} text-primary mr-3`}></i>
                          <span className="text-sm">{feature.name}</span>
                        </div>
                      ))}
                    </div>
                    
                    <h3 className="text-xl font-semibold text-primary mb-4">Sanal Tur</h3>
                    <div className="aspect-w-16 aspect-h-9 mb-8">
                      <iframe
                        src={hospital.virtualTourUrl}
                        title="Sanal Tur"
                        className="w-full h-[400px] rounded-lg"
                        allowFullScreen
                      ></iframe>
                    </div>
                  </motion.div>
                )}

                {/* Departments Tab */}
                {activeTab === 'departments' && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                  >
                    <h2 className="text-2xl font-semibold text-primary mb-6">Bölümlerimiz</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {hospital.departments.map((department) => (
                        <Link
                          key={department.id}
                          to={`/bolumlerimiz/${department.slug}`}
                          className="card p-6 hover:-translate-y-1 group"
                        >
                          <div className="flex items-center mb-4">
                            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mr-4">
                              <i className={`bi ${department.icon} text-xl text-primary`}></i>
                            </div>
                            <h3 className="text-lg font-semibold group-hover:text-primary transition-colors">
                              {department.name}
                            </h3>
                          </div>
                          <p className="text-sm text-text-light">
                            {department.name} bölümümüzde uzman doktorlarımız ve modern teknolojimizle hizmet vermekteyiz.
                          </p>
                          <div className="mt-4 text-primary text-sm font-medium">Detaylı Bilgi</div>
                        </Link>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Doctors Tab */}
                {activeTab === 'doctors' && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                  >
                    <h2 className="text-2xl font-semibold text-primary mb-6">Doktorlarımız</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {hospital.doctors.map((doctor) => (
                        <Link
                          key={doctor.id}
                          to={`/doktorlar/${doctor.slug}`}
                          className="card overflow-hidden group"
                        >
                          <div className="relative h-48 -mx-6 -mt-6 mb-6 overflow-hidden">
                            <img
                              src={doctor.image}
                              alt={doctor.name}
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                              loading="lazy"
                              crossOrigin="anonymous"
                            />
                          </div>
                          <h3 className="text-lg font-semibold mb-1 group-hover:text-primary transition-colors">
                            {doctor.name}
                          </h3>
                          <p className="text-sm text-text-light mb-4">{doctor.title}</p>
                          <div className="flex justify-between items-center">
                            <span className="text-primary text-sm font-medium">Profili Görüntüle</span>
                            <a
                              href="https://anadoluhastaneleri.kendineiyibak.app/"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm font-medium text-accent hover:text-accent-dark transition-colors"
                              onClick={(e) => e.stopPropagation()}
                            >
                              Randevu Al
                            </a>
                          </div>
                        </Link>
                      ))}
                    </div>
                    <div className="text-center mt-8">
                      <Link to="/doktorlar" className="btn btn-outline">
                        Tüm Doktorlarımız
                      </Link>
                    </div>
                  </motion.div>
                )}

                {/* Gallery Tab */}
                {activeTab === 'gallery' && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                  >
                    <h2 className="text-2xl font-semibold text-primary mb-6">Galeri</h2>
                    <Swiper
                      modules={[Navigation, Pagination]}
                      spaceBetween={30}
                      slidesPerView={1}
                      navigation
                      pagination={{ clickable: true }}
                      className="mb-8"
                    >
                      {hospital.images.map((image, index) => (
                        <SwiperSlide key={index}>
                          <div className="aspect-w-16 aspect-h-9">
                            <img
                              src={image}
                              alt={`${hospital.name} - Görsel ${index + 1}`}
                              className="w-full h-[500px] object-cover rounded-lg"
                              loading="lazy"
                              crossOrigin="anonymous"
                            />
                          </div>
                        </SwiperSlide>
                      ))}
                    </Swiper>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                      {hospital.images.map((image, index) => (
                        <div key={index} className="aspect-w-1 aspect-h-1 overflow-hidden rounded-lg">
                          <img
                            src={image}
                            alt={`${hospital.name} - Görsel ${index + 1}`}
                            className="w-full h-full object-cover transition-transform duration-500 hover:scale-110 cursor-pointer"
                            loading="lazy"
                            crossOrigin="anonymous"
                          />
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Location Tab */}
                {activeTab === 'location' && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                  >
                    <h2 className="text-2xl font-semibold text-primary mb-6">Konum</h2>
                    <div className="aspect-w-16 aspect-h-9 mb-8">
                      <iframe
                        src={hospital.location.mapUrl}
                        title="Hastane Konumu"
                        className="w-full h-[400px] rounded-lg"
                        allowFullScreen
                        loading="lazy"
                      ></iframe>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div>
                        <h3 className="text-xl font-semibold text-primary mb-4">İletişim Bilgileri</h3>
                        <ul className="space-y-4">
                          <li className="flex items-start">
                            <FaMapMarkerAlt className="text-primary mt-1 mr-3 flex-shrink-0" />
                            <span className="text-text-light">{hospital.address}</span>
                          </li>
                          <li className="flex items-center">
                            <FaPhone className="text-primary mr-3 flex-shrink-0" />
                            <a href={`tel:${hospital.phone.replace(/\s/g, '')}`} className="text-text-light hover:text-primary transition-colors">
                              {hospital.phone}
                            </a>
                          </li>
                          <li className="flex items-center">
                            <FaEnvelope className="text-primary mr-3 flex-shrink-0" />
                            <a href={`mailto:${hospital.email}`} className="text-text-light hover:text-primary transition-colors">
                              {hospital.email}
                            </a>
                          </li>
                          <li className="flex items-start">
                            <FaClock className="text-primary mt-1 mr-3 flex-shrink-0" />
                            <div>
                              <p className="text-text-light">Çalışma Saatleri:</p>
                              <p className="text-text-light">{hospital.workingHours}</p>
                            </div>
                          </li>
                        </ul>
                      </div>
                      
                      <div>
                        <h3 className="text-xl font-semibold text-primary mb-4">Ulaşım</h3>
                        <p className="text-text-light mb-4">
                          Hastanemize toplu taşıma veya özel araçla kolayca ulaşabilirsiniz. Otobüs, metro ve metrobüs hatları yakınımızdan geçmektedir.
                        </p>
                        <ul className="space-y-2">
                          <li className="flex items-center">
                            <i className="bi bi-bus-front text-primary mr-2"></i>
                            <span className="text-text-light">Otobüs: 25E, 30M, 40T hatları</span>
                          </li>
                          <li className="flex items-center">
                            <i className="bi bi-train-front text-primary mr-2"></i>
                            <span className="text-text-light">Metro: M2 hattı, Şişli durağı</span>
                          </li>
                          <li className="flex items-center">
                            <i className="bi bi-p-circle text-primary mr-2"></i>
                            <span className="text-text-light">Otopark: 200 araç kapasiteli kapalı otopark</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>

            {/* Right Column - Sidebar */}
            <div className="lg:w-1/3">
              {/* Appointment Card */}
              <div className="card mb-8">
                <h3 className="text-xl font-semibold text-primary mb-4">Randevu Al</h3>
                <p className="text-text-light text-sm mb-6">
                  Online randevu sistemimiz üzerinden kolayca randevu alabilir veya telefonla bize ulaşabilirsiniz.
                </p>
                <div className="space-y-4">
                  <a
                    href="https://anadoluhastaneleri.kendineiyibak.app/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-accent w-full flex justify-center items-center"
                  >
                    <FaCalendarAlt className="mr-2" /> Online Randevu
                  </a>
                  <a
                    href={`tel:${hospital.phone.replace(/\s/g, '')}`}
                    className="btn btn-outline w-full flex justify-center items-center"
                  >
                    <FaPhone className="mr-2" /> Telefonla Ara
                  </a>
                </div>
              </div>

              {/* Working Hours */}
              <div className="card mb-8">
                <h3 className="text-xl font-semibold text-primary mb-4">Çalışma Saatleri</h3>
                <ul className="space-y-3">
                  <li className="flex justify-between items-center pb-2 border-b border-gray-100">
                    <span className="text-text-light">Pazartesi - Cuma</span>
                    <span className="font-medium">08:00 - 20:00</span>
                  </li>
                  <li className="flex justify-between items-center pb-2 border-b border-gray-100">
                    <span className="text-text-light">Cumartesi</span>
                    <span className="font-medium">08:00 - 20:00</span>
                  </li>
                  <li className="flex justify-between items-center pb-2 border-b border-gray-100">
                    <span className="text-text-light">Pazar</span>
                    <span className="font-medium">08:00 - 18:00</span>
                  </li>
                  <li className="flex justify-between items-center text-accent">
                    <span className="font-medium">Acil Servis</span>
                    <span className="font-medium">24 Saat Açık</span>
                  </li>
                </ul>
              </div>

              {/* Services */}
              <div className="card mb-8">
                <h3 className="text-xl font-semibold text-primary mb-4">Hizmetlerimiz</h3>
                <ul className="space-y-3">
                  <li className="flex items-center">
                    <FaUserMd className="text-primary mr-3" />
                    <span className="text-text-light">Uzman Doktor Kadrosu</span>
                  </li>
                  <li className="flex items-center">
                    <FaHospital className="text-primary mr-3" />
                    <span className="text-text-light">Modern Teknoloji</span>
                  </li>
                  <li className="flex items-center">
                    <i className="bi bi-heart-pulse-fill text-primary mr-3"></i>
                    <span className="text-text-light">24 Saat Acil Servis</span>
                  </li>
                  <li className="flex items-center">
                    <i className="bi bi-clipboard2-pulse-fill text-primary mr-3"></i>
                    <span className="text-text-light">Check-Up Hizmetleri</span>
                  </li>
                  <li className="flex items-center">
                    <FaWheelchair className="text-primary mr-3" />
                    <span className="text-text-light">Engelli Dostu</span>
                  </li>
                  <li className="flex items-center">
                    <i className="bi bi-car-front-fill text-primary mr-3"></i>
                    <span className="text-text-light">Ücretsiz Otopark</span>
                  </li>
                </ul>
              </div>

              {/* Contact Form */}
              <div className="card">
                <h3 className="text-xl font-semibold text-primary mb-4">Bize Ulaşın</h3>
                <form className="space-y-4">
                  <div>
                    <input
                      type="text"
                      placeholder="Adınız Soyadınız"
                      className="input-field"
                      required
                    />
                  </div>
                  <div>
                    <input
                      type="email"
                      placeholder="E-posta Adresiniz"
                      className="input-field"
                      required
                    />
                  </div>
                  <div>
                    <input
                      type="tel"
                      placeholder="Telefon Numaranız"
                      className="input-field"
                    />
                  </div>
                  <div>
                    <textarea
                      placeholder="Mesajınız"
                      rows={4}
                      className="input-field resize-none"
                      required
                    ></textarea>
                  </div>
                  <button type="submit" className="btn btn-primary w-full">
                    Gönder
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default HospitalDetailPage
