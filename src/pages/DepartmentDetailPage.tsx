import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Pagination } from 'swiper/modules'
import SectionTitle from '../components/ui/SectionTitle'
import { FaUserMd, FaHospital, FaCalendarAlt } from 'react-icons/fa'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'

// Mock data for a single department
const departmentData = {
  id: 1,
  name: 'Kardiyoloji',
  slug: 'kardiyoloji',
  icon: 'bi-heart-pulse-fill',
  description: 'Kalp ve damar hastalıklarının tanı ve tedavisi',
  longDescription: 'Kardiyoloji bölümümüz, kalp ve damar hastalıklarının tanı ve tedavisinde uzmanlaşmış doktorlarımız ve modern teknolojimizle hizmet vermektedir. Koroner arter hastalığı, kalp yetmezliği, kalp kapak hastalıkları, ritim bozuklukları ve hipertansiyon gibi hastalıkların tanı ve tedavisinde en son teknolojik imkanları kullanmaktayız.',
  treatments: [
    {
      name: 'Koroner Anjiyografi',
      description: 'Koroner arterlerin görüntülenmesi ve darlıkların tespit edilmesi işlemidir.',
      icon: 'bi-heart-pulse-fill',
    },
    {
      name: 'Ekokardiyografi',
      description: 'Kalbin yapısını ve fonksiyonlarını değerlendirmek için ultrason kullanılan bir tetkiktir.',
      icon: 'bi-soundwave',
    },
    {
      name: 'Holter Monitörizasyonu',
      description: '24 saat boyunca kalp ritminin izlenmesi işlemidir.',
      icon: 'bi-activity',
    },
    {
      name: 'Efor Testi',
      description: 'Kalbin egzersiz sırasındaki performansını değerlendiren bir testtir.',
      icon: 'bi-person-walking',
    },
    {
      name: 'Stent Uygulaması',
      description: 'Daralmış koroner arterlerin açılması ve stent yerleştirilmesi işlemidir.',
      icon: 'bi-bandaid-fill',
    },
    {
      name: 'Kalp Pili Takılması',
      description: 'Kalp ritim bozukluklarının tedavisi için kalp pili takılması işlemidir.',
      icon: 'bi-battery-charging',
    },
  ],
  equipment: [
    {
      name: 'Anjiyografi Cihazı',
      description: 'Koroner arterlerin görüntülenmesi için kullanılan modern cihaz.',
      image: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80',
    },
    {
      name: 'Ekokardiyografi Cihazı',
      description: 'Kalbin yapısını ve fonksiyonlarını değerlendirmek için kullanılan ultrason cihazı.',
      image: 'https://images.unsplash.com/photo-1530026186672-2cd00ffc50fe?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80',
    },
    {
      name: 'Holter Cihazı',
      description: '24 saat boyunca kalp ritminin izlenmesi için kullanılan taşınabilir cihaz.',
      image: 'https://images.unsplash.com/photo-1551190822-a9333d879b1f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80',
    },
  ],
  doctors: [
    {
      id: 1,
      name: 'Prof. Dr. Ahmet Yılmaz',
      slug: 'prof-dr-ahmet-yilmaz',
      title: 'Kardiyoloji Uzmanı',
      image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=300&q=80',
      hospital: 'Anadolu Merkez Hastanesi',
    },
    {
      id: 2,
      name: 'Doç. Dr. Ayşe Kaya',
      slug: 'doc-dr-ayse-kaya',
      title: 'Kardiyoloji Uzmanı',
      image: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=300&q=80',
      hospital: 'Anadolu Avrupa Hastanesi',
    },
    {
      id: 3,
      name: 'Uzm. Dr. Mehmet Demir',
      slug: 'uzm-dr-mehmet-demir',
      title: 'Kardiyoloji Uzmanı',
      image: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=300&q=80',
      hospital: 'Anadolu Merkez Hastanesi',
    },
  ],
  faq: [
    {
      question: 'Kardiyoloji bölümünde hangi hastalıklar tedavi edilir?',
      answer: 'Kardiyoloji bölümümüzde koroner arter hastalığı, kalp yetmezliği, kalp kapak hastalıkları, ritim bozuklukları, hipertansiyon ve diğer kalp ve damar hastalıkları tedavi edilmektedir.',
    },
    {
      question: 'Kardiyoloji muayenesi için randevu nasıl alabilirim?',
      answer: 'Kardiyoloji muayenesi için online randevu sistemimiz üzerinden veya hastanemizi telefonla arayarak randevu alabilirsiniz.',
    },
    {
      question: 'Anjiyografi işlemi ne kadar sürer?',
      answer: 'Anjiyografi işlemi genellikle 30-60 dakika sürer. İşlem sonrası 4-6 saat gözlem altında tutulursunuz.',
    },
    {
      question: 'Kalp hastalıklarından korunmak için neler yapmalıyım?',
      answer: 'Düzenli egzersiz yapmak, sağlıklı beslenmek, sigara ve alkolden uzak durmak, stresi azaltmak ve düzenli sağlık kontrollerini yaptırmak kalp hastalıklarından korunmak için önemlidir.',
    },
  ],
  images: [
    'https://images.unsplash.com/photo-1516549655169-df83a0774514?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1579684385127-1ef15d508118?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1530026186672-2cd00ffc50fe?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80',
  ],
};

const DepartmentDetailPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [department, setDepartment] = useState<typeof departmentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('about');
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  useEffect(() => {
    // In a real application, you would fetch the department data from an API
    // For this example, we'll use the mock data
    setLoading(true);
    setTimeout(() => {
      setDepartment(departmentData);
      setLoading(false);
    }, 500);
  }, [slug]);

  const toggleFaq = (index: number) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!department) {
    return (
      <div className="container-custom py-20 text-center">
        <h2 className="text-2xl font-bold mb-4">Bölüm Bulunamadı</h2>
        <p className="mb-8">Aradığınız bölüm bulunamadı. Lütfen tüm bölümlerimizi görüntüleyin.</p>
        <Link to="/bolumlerimiz" className="btn btn-primary">
          Tüm Bölümlerimiz
        </Link>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{department.name} | Anadolu Hastaneleri Grubu</title>
        <meta name="description" content={department.description} />
      </Helmet>

      <div className="pt-24 pb-12">
        {/* Hero Section */}
        <div className="relative h-80">
          <div className="absolute inset-0">
            <img
              src={department.images[0]}
              alt={department.name}
              className="w-full h-full object-cover"
              loading="lazy"
              crossOrigin="anonymous"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-black/30" />
          </div>
          <div className="container-custom relative h-full flex flex-col justify-end pb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex items-center mb-4"
            >
              <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center mr-4">
                <i className={`bi ${department.icon} text-3xl text-white`}></i>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-white">{department.name}</h1>
            </motion.div>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-white/90 text-lg max-w-3xl"
            >
              {department.description}
            </motion.p>
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
                      activeTab === 'treatments' ? 'text-primary border-b-2 border-primary' : 'text-text-light hover:text-primary'
                    }`}
                    onClick={() => setActiveTab('treatments')}
                  >
                    Tedaviler
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
                      activeTab === 'equipment' ? 'text-primary border-b-2 border-primary' : 'text-text-light hover:text-primary'
                    }`}
                    onClick={() => setActiveTab('equipment')}
                  >
                    Teknoloji
                  </button>
                  <button
                    className={`px-4 py-2 font-medium text-sm whitespace-nowrap ${
                      activeTab === 'faq' ? 'text-primary border-b-2 border-primary' : 'text-text-light hover:text-primary'
                    }`}
                    onClick={() => setActiveTab('faq')}
                  >
                    Sık Sorulan Sorular
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
                    <h2 className="text-2xl font-semibold text-primary mb-4">{department.name} Bölümü</h2>
                    <p className="text-text-light mb-6">{department.longDescription}</p>
                    
                    <div className="mb-8">
                      <Swiper
                        modules={[Navigation, Pagination]}
                        spaceBetween={30}
                        slidesPerView={1}
                        navigation
                        pagination={{ clickable: true }}
                        className="rounded-lg overflow-hidden"
                      >
                        {department.images.map((image, index) => (
                          <SwiperSlide key={index}>
                            <div className="aspect-w-16 aspect-h-9">
                              <img
                                src={image}
                                alt={`${department.name} - Görsel ${index + 1}`}
                                className="w-full h-[400px] object-cover"
                                loading="lazy"
                                crossOrigin="anonymous"
                              />
                            </div>
                          </SwiperSlide>
                        ))}
                      </Swiper>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                      <div className="card">
                        <h3 className="text-xl font-semibold text-primary mb-4">Tedavi Edilen Hastalıklar</h3>
                        <ul className="space-y-2">
                          <li className="flex items-center">
                            <i className="bi bi-check-circle-fill text-accent mr-2"></i>
                            <span className="text-text-light">Koroner Arter Hastalığı</span>
                          </li>
                          <li className="flex items-center">
                            <i className="bi bi-check-circle-fill text-accent mr-2"></i>
                            <span className="text-text-light">Kalp Yetmezliği</span>
                          </li>
                          <li className="flex items-center">
                            <i className="bi bi-check-circle-fill text-accent mr-2"></i>
                            <span className="text-text-light">Kalp Kapak Hastalıkları</span>
                          </li>
                          <li className="flex items-center">
                            <i className="bi bi-check-circle-fill text-accent mr-2"></i>
                            <span className="text-text-light">Ritim Bozuklukları</span>
                          </li>
                          <li className="flex items-center">
                            <i className="bi bi-check-circle-fill text-accent mr-2"></i>
                            <span className="text-text-light">Hipertansiyon</span>
                          </li>
                          <li className="flex items-center">
                            <i className="bi bi-check-circle-fill text-accent mr-2"></i>
                            <span className="text-text-light">Damar Hastalıkları</span>
                          </li>
                        </ul>
                      </div>
                      
                      <div className="card">
                        <h3 className="text-xl font-semibold text-primary mb-4">Neden Bizi Tercih Etmelisiniz?</h3>
                        <ul className="space-y-2">
                          <li className="flex items-center">
                            <i className="bi bi-check-circle-fill text-accent mr-2"></i>
                            <span className="text-text-light">Alanında uzman doktor kadrosu</span>
                          </li>
                          <li className="flex items-center">
                            <i className="bi bi-check-circle-fill text-accent mr-2"></i>
                            <span className="text-text-light">Modern teknoloji ve ekipmanlar</span>
                          </li>
                          <li className="flex items-center">
                            <i className="bi bi-check-circle-fill text-accent mr-2"></i>
                            <span className="text-text-light">Hasta odaklı yaklaşım</span>
                          </li>
                          <li className="flex items-center">
                            <i className="bi bi-check-circle-fill text-accent mr-2"></i>
                            <span className="text-text-light">Multidisipliner tedavi imkanı</span>
                          </li>
                          <li className="flex items-center">
                            <i className="bi bi-check-circle-fill text-accent mr-2"></i>
                            <span className="text-text-light">7/24 acil kardiyoloji hizmeti</span>
                          </li>
                          <li className="flex items-center">
                            <i className="bi bi-check-circle-fill text-accent mr-2"></i>
                            <span className="text-text-light">Uluslararası standartlarda hizmet</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Treatments Tab */}
                {activeTab === 'treatments' && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                  >
                    <h2 className="text-2xl font-semibold text-primary mb-6">Tedavi ve Hizmetlerimiz</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {department.treatments.map((treatment, index) => (
                        <div key={index} className="card p-6">
                          <div className="flex items-center mb-4">
                            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mr-4">
                              <i className={`bi ${treatment.icon} text-xl text-primary`}></i>
                            </div>
                            <h3 className="text-lg font-semibold">{treatment.name}</h3>
                          </div>
                          <p className="text-sm text-text-light">{treatment.description}</p>
                        </div>
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
                    <h2 className="text-2xl font-semibold text-primary mb-6">Bölüm Doktorlarımız</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {department.doctors.map((doctor) => (
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
                          <p className="text-sm text-text-light mb-2">{doctor.title}</p>
                          <p className="text-xs text-text-light mb-4">{doctor.hospital}</p>
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

                {/* Equipment Tab */}
                {activeTab === 'equipment' && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                  >
                    <h2 className="text-2xl font-semibold text-primary mb-6">Teknolojik Altyapımız</h2>
                    <p className="text-text-light mb-8">
                      {department.name} bölümümüzde en son teknolojik cihazlar ve ekipmanlar kullanılmaktadır. 
                      Bu sayede hastalıkların tanı ve tedavisinde en doğru ve hızlı sonuçları elde ediyoruz.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {department.equipment.map((item, index) => (
                        <div key={index} className="card overflow-hidden group">
                          <div className="relative h-48 -mx-6 -mt-6 mb-6 overflow-hidden">
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                              loading="lazy"
                              crossOrigin="anonymous"
                            />
                          </div>
                          <h3 className="text-lg font-semibold mb-2">{item.name}</h3>
                          <p className="text-sm text-text-light">{item.description}</p>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* FAQ Tab */}
                {activeTab === 'faq' && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                  >
                    <h2 className="text-2xl font-semibold text-primary mb-6">Sık Sorulan Sorular</h2>
                    <div className="space-y-4">
                      {department.faq.map((item, index) => (
                        <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
                          <button
                            className="w-full flex justify-between items-center p-4 text-left font-medium hover:bg-neutral transition-colors"
                            onClick={() => toggleFaq(index)}
                          >
                            <span>{item.question}</span>
                            <i className={`bi ${activeFaq === index ? 'bi-chevron-up' : 'bi-chevron-down'} text-primary`}></i>
                          </button>
                          {activeFaq === index && (
                            <div className="p-4 bg-neutral border-t border-gray-200">
                              <p className="text-text-light">{item.answer}</p>
                            </div>
                          )}
                        </div>
                      ))}
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
                  {department.name} bölümümüzden randevu almak için online randevu sistemimizi kullanabilir veya bizi arayabilirsiniz.
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
                    href="tel:+902121234567"
                    className="btn btn-outline w-full flex justify-center items-center"
                  >
                    <i className="bi bi-telephone-fill mr-2"></i> Telefonla Ara
                  </a>
                </div>
              </div>

              {/* Department Doctors */}
              <div className="card mb-8">
                <h3 className="text-xl font-semibold text-primary mb-4">Bölüm Doktorlarımız</h3>
                <div className="space-y-4">
                  {department.doctors.map((doctor) => (
                    <Link
                      key={doctor.id}
                      to={`/doktorlar/${doctor.slug}`}
                      className="flex items-center p-3 rounded-lg hover:bg-neutral transition-colors"
                    >
                      <img
                        src={doctor.image}
                        alt={doctor.name}
                        className="w-12 h-12 rounded-full object-cover mr-3"
                        loading="lazy"
                        crossOrigin="anonymous"
                      />
                      <div>
                        <h4 className="font-medium text-text">{doctor.name}</h4>
                        <p className="text-xs text-text-light">{doctor.title}</p>
                      </div>
                    </Link>
                  ))}
                </div>
                <div className="mt-4">
                  <Link to="/doktorlar" className="text-sm font-medium text-primary hover:text-primary-dark transition-colors">
                    Tüm Doktorlarımızı Görüntüle
                  </Link>
                </div>
              </div>

              {/* Other Departments */}
              <div className="card mb-8">
                <h3 className="text-xl font-semibold text-primary mb-4">Diğer Bölümlerimiz</h3>
                <ul className="space-y-2">
                  <li>
                    <Link to="/bolumlerimiz/noroloji" className="flex items-center p-2 rounded-lg hover:bg-neutral transition-colors">
                      <i className="bi bi-brain text-primary mr-3"></i>
                      <span className="text-text-light hover:text-primary transition-colors">Nöroloji</span>
                    </Link>
                  </li>
                  <li>
                    <Link to="/bolumlerimiz/ortopedi" className="flex items-center p-2 rounded-lg hover:bg-neutral transition-colors">
                      <i className="bi bi-person-standing text-primary mr-3"></i>
                      <span className="text-text-light hover:text-primary transition-colors">Ortopedi</span>
                    </Link>
                  </li>
                  <li>
                    <Link to="/bolumlerimiz/genel-cerrahi" className="flex items-center p-2 rounded-lg hover:bg-neutral transition-colors">
                      <i className="bi bi-scissors text-primary mr-3"></i>
                      <span className="text-text-light hover:text-primary transition-colors">Genel Cerrahi</span>
                    </Link>
                  </li>
                  <li>
                    <Link to="/bolumlerimiz/goz-hastaliklari" className="flex items-center p-2 rounded-lg hover:bg-neutral transition-colors">
                      <i className="bi bi-eye-fill text-primary mr-3"></i>
                      <span className="text-text-light hover:text-primary transition-colors">Göz Hastalıkları</span>
                    </Link>
                  </li>
                  <li>
                    <Link to="/bolumlerimiz/dahiliye" className="flex items-center p-2 rounded-lg hover:bg-neutral transition-colors">
                      <i className="bi bi-clipboard2-pulse-fill text-primary mr-3"></i>
                      <span className="text-text-light hover:text-primary transition-colors">Dahiliye</span>
                    </Link>
                  </li>
                </ul>
                <div className="mt-4">
                  <Link to="/bolumlerimiz" className="text-sm font-medium text-primary hover:text-primary-dark transition-colors">
                    Tüm Bölümlerimizi Görüntüle
                  </Link>
                </div>
              </div>

              {/* Contact */}
              <div className="card">
                <h3 className="text-xl font-semibold text-primary mb-4">İletişim</h3>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <FaHospital className="text-primary mt-1 mr-3 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium text-text">Anadolu Merkez Hastanesi</h4>
                      <p className="text-sm text-text-light">Atatürk Bulvarı No:123, Şişli, İstanbul</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <i className="bi bi-telephone-fill text-primary mr-3"></i>
                    <div>
                      <h4 className="font-medium text-text">Telefon</h4>
                      <a href="tel:+902121234567" className="text-sm text-text-light hover:text-primary transition-colors">
                        0212 123 45 67
                      </a>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <FaUserMd className="text-primary mr-3 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium text-text">Bölüm Başkanı</h4>
                      <p className="text-sm text-text-light">Prof. Dr. Ahmet Yılmaz</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default DepartmentDetailPage;
