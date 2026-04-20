import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Pagination } from 'swiper/modules'
import { FaCalendarAlt } from 'react-icons/fa'
import { useDepartment, useDepartments } from '../hooks/useDepartments'
import { useDoctorsByDepartment } from '../hooks/useDoctors'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'

const DepartmentDetailPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data: department, isLoading: isDeptLoading } = useDepartment(slug || '');
  const { data: doctors = [], isLoading: isDoctorsLoading } = useDoctorsByDepartment(department?.id || 0);
  const { data: otherDepartments = [] } = useDepartments({ onlyPublished: true });

  const [activeTab, setActiveTab] = useState('about');
  /* Removed activeFaq state as it was unused in current version */

  /* Removed toggleFaq as it was unused and FAQ tab was simplified */

  const loading = isDeptLoading;

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

  // Parse JSONB fields
  const treatments = Array.isArray(department.treatments) ? department.treatments : [];
  const equipment = Array.isArray(department.equipment) ? department.equipment : [];
  const images = Array.isArray(department.images) ? department.images : [];
  const heroImage = images.length > 0 ? images[0] : 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=1200&q=80';

  return (
    <>
      <Helmet>
        <title>{department.meta_title || `${department.name} | Anadolu Hastaneleri Grubu`}</title>
        <meta name="description" content={department.meta_description || department.description} />
      </Helmet>

      <div className="pt-24 pb-12">
        {/* Hero Section */}
        <div className="relative h-80">
          <div className="absolute inset-0">
            <img
              src={heroImage}
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
                <i className={`bi ${department.icon || 'bi-hospital'} text-3xl text-white`}></i>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-white uppercase">{department.hero_title || department.name}</h1>
            </motion.div>
            {department.hero_subtitle && (
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-white/90 text-lg max-w-3xl"
              >
                {department.hero_subtitle}
              </motion.p>
            )}
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
                    className={`px-4 py-2 font-medium text-sm whitespace-nowrap ${activeTab === 'about' ? 'text-primary border-b-2 border-primary' : 'text-text-light hover:text-primary'
                      }`}
                    onClick={() => setActiveTab('about')}
                  >
                    Hakkında
                  </button>
                  {treatments.length > 0 && (
                    <button
                      className={`px-4 py-2 font-medium text-sm whitespace-nowrap ${activeTab === 'treatments' ? 'text-primary border-b-2 border-primary' : 'text-text-light hover:text-primary'
                        }`}
                      onClick={() => setActiveTab('treatments')}
                    >
                      Tedaviler
                    </button>
                  )}
                  <button
                    className={`px-4 py-2 font-medium text-sm whitespace-nowrap ${activeTab === 'doctors' ? 'text-primary border-b-2 border-primary' : 'text-text-light hover:text-primary'
                      }`}
                    onClick={() => setActiveTab('doctors')}
                  >
                    Doktorlar
                  </button>
                  {equipment.length > 0 && (
                    <button
                      className={`px-4 py-2 font-medium text-sm whitespace-nowrap ${activeTab === 'equipment' ? 'text-primary border-b-2 border-primary' : 'text-text-light hover:text-primary'
                        }`}
                      onClick={() => setActiveTab('equipment')}
                    >
                      Teknoloji
                    </button>
                  )}
                </div>
              </div>

              {/* Tab Content */}
              <div className="min-h-[400px]">
                {/* About Tab */}
                {activeTab === 'about' && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                  >
                    <h2 className="text-2xl font-semibold text-primary mb-4">{department.name}</h2>
                    <div className="prose max-w-none text-text-light mb-8 whitespace-pre-wrap">
                      {department.long_description || department.description}
                    </div>

                    {images.length > 0 && (
                      <div className="mb-8">
                        <Swiper
                          modules={[Navigation, Pagination]}
                          spaceBetween={30}
                          slidesPerView={1}
                          navigation
                          pagination={{ clickable: true }}
                          className="rounded-lg overflow-hidden"
                        >
                          {images.map((image, index) => (
                            <SwiperSlide key={index}>
                              <div className="aspect-w-16 aspect-h-9">
                                <img
                                  src={image as string}
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
                    )}
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
                      {treatments.map((treatment: any, index: number) => (
                        <div key={index} className="card p-6">
                          <div className="flex items-center mb-4">
                            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mr-4">
                              <i className={`bi ${treatment.icon || 'bi-check-circle'} text-xl text-primary`}></i>
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
                    {isDoctorsLoading ? (
                      <div className="flex justify-center py-12">
                        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
                      </div>
                    ) : doctors.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {doctors.map((doctor) => (
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
                            <p className="text-xs text-text-light mb-4">{(doctor as any).hospitals?.name}</p>
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
                    ) : (
                      <p className="text-text-light italic">Bu bölümde henüz doktor bulunmamaktadır.</p>
                    )}
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
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {equipment.map((item: any, index: number) => (
                        <div key={index} className="card overflow-hidden group">
                          {item.image && (
                            <div className="relative h-48 -mx-6 -mt-6 mb-6 overflow-hidden">
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                loading="lazy"
                                crossOrigin="anonymous"
                              />
                            </div>
                          )}
                          <h3 className="text-lg font-semibold mb-2">{item.name}</h3>
                          <p className="text-sm text-text-light">{item.description}</p>
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
                  {department.name} bölümünden randevu almak için online randevu sistemimizi kullanabilir veya bizi arayabilirsiniz.
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

              {/* Department Doctors (Mini) */}
              {doctors.length > 0 && (
                <div className="card mb-8">
                  <h3 className="text-xl font-semibold text-primary mb-4">Öne Çıkan Doktorlar</h3>
                  <div className="space-y-4">
                    {doctors.slice(0, 3).map((doctor) => (
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
                          <h4 className="font-medium text-text text-sm">{doctor.name}</h4>
                          <p className="text-[10px] text-text-light">{doctor.title}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                  <div className="mt-4">
                    <button
                      onClick={() => setActiveTab('doctors')}
                      className="text-sm font-medium text-primary hover:text-primary-dark transition-colors"
                    >
                      Tüm Doktorları Görüntüle
                    </button>
                  </div>
                </div>
              )}

              {/* Other Departments */}
              <div className="card mb-8">
                <h3 className="text-xl font-semibold text-primary mb-4">Diğer Bölümlerimiz</h3>
                <ul className="space-y-2">
                  {otherDepartments
                    .filter((d: any) => d.id !== department.id)
                    .slice(0, 6)
                    .map((dept: any) => (
                      <li key={dept.id}>
                        <Link to={`/bolumlerimiz/${dept.slug}`} className="flex items-center p-2 rounded-lg hover:bg-neutral transition-colors">
                          <i className={`bi ${dept.icon || 'bi-hospital'} text-primary mr-3`}></i>
                          <span className="text-text-light hover:text-primary transition-colors text-sm">{dept.name}</span>
                        </Link>
                      </li>
                    ))}
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
                  <div className="flex items-center">
                    <i className="bi bi-telephone-fill text-primary mr-3"></i>
                    <div>
                      <h4 className="font-medium text-text text-sm">Çağrı Merkezi</h4>
                      <a href="tel:4440919" className="text-sm text-text-light hover:text-primary transition-colors">
                        444 0 919
                      </a>
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
