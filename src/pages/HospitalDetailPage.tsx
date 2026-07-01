import { useState, useEffect, useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FaMapMarkerAlt, FaPhone, FaEnvelope, FaClock, FaCalendarAlt, FaHospital,
  FaChevronRight, FaChevronLeft, FaSearch, FaParking, FaCreditCard, FaCoffee,
  FaMosque, FaWifi, FaBus, FaUserMd, FaStethoscope, FaArrowRight, FaTimes,
} from 'react-icons/fa'
import { useHospitalDetail } from '../hooks/useHospitals'
import { useDepartments } from '../hooks/useDepartments'
import { useDoctorsByHospital } from '../hooks/useDoctors'
import { hospitalTransportInfo, parseTransportInfo } from '../data/hospitalTransport'
import AutoTranslate from '../components/common/AutoTranslate'
import SecondOpinionBanner from '../components/common/SecondOpinionBanner'
import HospitalMap from '../components/common/HospitalMap'
import 'swiper/css'

const socialFacilities = (t: any) => [
  { name: t('hospital.facilities.parking', 'Otopark'), icon: <FaParking /> },
  { name: t('hospital.facilities.atm', 'ATM'), icon: <FaCreditCard /> },
  { name: t('hospital.facilities.cafeteria', 'Kafeterya'), icon: <FaCoffee /> },
  { name: t('hospital.facilities.prayerRoom', 'İbadethane'), icon: <FaMosque /> },
  { name: t('hospital.facilities.wifi', 'Wifi'), icon: <FaWifi /> },
];

const HospitalDetailPage = () => {
  const { t } = useTranslation();
  const { slug } = useParams<{ slug: string }>()
  const { data: hospital, isLoading } = useHospitalDetail(slug || '')
  const { data: departments, isLoading: departmentsLoading } = useDepartments({ onlyPublished: true })
  const hospitalId = hospital?.id ? Number(hospital.id) : 0
  const { data: doctors, isLoading: doctorsLoading } = useDoctorsByHospital(hospitalId)
  const [activeTab, setActiveTab] = useState('about')
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  const images: string[] = hospital?.images || []

  // Bu şubede sunulan bölümler (Bölümlerimiz sayfasıyla senkron):
  //   (bu şubede aktif doktoru olan bölümler)  ∪  (admin'in eklediği department_ids)
  const hospitalDeptIds = useMemo(() => {
    const set = new Set<number>()
    ;((hospital as any)?.department_ids ?? []).forEach((depId: any) => {
      if (depId != null) set.add(Number(depId))
    })
    ;(doctors ?? []).forEach((d: any) => {
      if (d.department_id != null) set.add(Number(d.department_id))
    })
    return set
  }, [hospital, doctors])

  const visibleDepartments = useMemo(
    () => (departments ?? []).filter((dep: any) => hospitalDeptIds.has(Number(dep.id))),
    [departments, hospitalDeptIds]
  )

  useEffect(() => {
    if (lightboxIndex === null) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightboxIndex(null)
      if (e.key === 'ArrowRight') setLightboxIndex(i => (i === null ? i : (i + 1) % images.length))
      if (e.key === 'ArrowLeft') setLightboxIndex(i => (i === null ? i : (i - 1 + images.length) % images.length))
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [lightboxIndex, images.length])

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!hospital) {
    return (
      <div className="container-custom py-32 text-center">
        <div className="bg-red-50 inline-block p-6 rounded-3xl mb-8">
          <FaHospital className="text-red-500 text-6xl" />
        </div>
        <h2 className="text-3xl font-bold text-primary mb-4">{t('hospital.notFound', 'Hastane Bulunamadı')}</h2>
        <p className="text-text-light mb-8 max-w-md mx-auto">{t('hospital.notFoundDesc', 'Aradığınız şubemize şu an ulaşılamıyor. Lütfen diğer hastanelerimize göz atın.')}</p>
        <Link to="/hastanelerimiz" className="btn btn-primary px-10 py-4">
          {t('hospital.allBranches', 'Tüm Şubelerimiz')}
        </Link>
      </div>
    )
  }

  const getMapEmbedUrl = (h: any) => {
    if (h.map_url) return h.map_url
    if (h.latitude && h.longitude) {
      return `https://maps.google.com/maps?q=${h.latitude},${h.longitude}&z=15&ie=UTF8&iwloc=&output=embed`
    }
    if (h.address) {
      return `https://maps.google.com/maps?q=${encodeURIComponent(h.address)}&z=15&ie=UTF8&iwloc=&output=embed`
    }
    return null
  }

  const mapEmbedUrl = getMapEmbedUrl(hospital)
  // Ulaşım bilgisi: önce veritabanındaki sütun, yoksa koddaki statik içerik
  const transportSections = hospital.transportation_info
    ? parseTransportInfo(hospital.transportation_info)
    : hospitalTransportInfo[hospital.slug] || []

  const heroTitle = hospital.hero_title || hospital.name
  const heroSubtitle = hospital.hero_subtitle || (hospital.description || '').split('\n')[0]
  const metaTitle = hospital.meta_title || `${hospital.name} | Anadolu Hastaneleri Grubu`
  const metaDescription = hospital.meta_description || (hospital.description || '').split('\n')[0]
  const mainImage = hospital.images && hospital.images.length > 0 ? hospital.images[0] : 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=1200&q=80'

  const goToTab = (tabId: string) => {
    setActiveTab(tabId)
    document.getElementById('hospital-content')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className="animate-fadeIn">
      <Helmet>
        <title>{metaTitle}</title>
        <meta name="description" content={metaDescription} />
      </Helmet>

      {/* Hero Section */}
      <section className="relative h-[65vh] min-h-[500px] flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src={mainImage}
            alt={hospital.name}
            className="w-full h-full object-cover"
            loading="eager"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/95 via-primary/60 to-transparent" />
        </div>

        <div className="container-custom relative z-10 text-white">
          <div className="max-w-3xl">
            <motion.nav
              initial={{ x: -16 }}
              animate={{ x: 0 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="flex items-center space-x-2 text-sm text-white/70 mb-8"
            >
              <Link to="/" className="hover:text-white transition-colors">{t('nav.home', 'Ana Sayfa')}</Link>
              <FaChevronRight className="text-[10px]" />
              <Link to="/hastanelerimiz" className="hover:text-white transition-colors">{t('nav.hospitals', 'Hastanelerimiz')}</Link>
              <FaChevronRight className="text-[10px]" />
              <span className="text-white font-medium">{hospital.name}</span>
            </motion.nav>

            <motion.h1
              initial={{ y: 20 }}
              animate={{ y: 0 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="text-4xl md:text-6xl font-bold mb-6 leading-tight text-white drop-shadow-lg"
            >
              <AutoTranslate text={heroTitle} />
            </motion.h1>

            <motion.p
              initial={{ y: 20 }}
              animate={{ y: 0 }}
              transition={{ duration: 0.4, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
              className="text-lg md:text-xl text-white mb-10 leading-relaxed max-w-2xl drop-shadow-md"
            >
              <AutoTranslate text={heroSubtitle} />
            </motion.p>

            <motion.div
              initial={{ y: 20 }}
              animate={{ y: 0 }}
              transition={{ duration: 0.4, delay: 0.16, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-wrap gap-4"
            >
              <a href="https://anadoluhastaneleri.kendineiyibak.app/" target="_blank" rel="noopener noreferrer" className="btn btn-accent px-8 py-4 text-lg">{t('common.appointmentNow', 'Hemen Randevu Al')}</a>
              <button onClick={() => goToTab('contact')} className="btn bg-white/10 backdrop-blur-md text-white border-white/20 hover:bg-white/20 px-8 py-4 text-lg">{t('common.directions', 'Yol Tarifi')}</button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-20 bg-neutral/30" id="hospital-content">
        <div className="container-custom">
          <div className="flex flex-col lg:flex-row gap-12">
            {/* Main Content Area */}
            <div className="lg:w-2/3">
              <div className="bg-white rounded-3xl shadow-xl shadow-primary/5 p-8 md:p-12 mb-10 border border-gray-100">
                {/* Navigation Tabs */}
                <div className="flex flex-wrap gap-2 pb-4 mb-10 border-b border-gray-100">
                  {[
                    { id: 'about', label: t('hospital.tabAbout', 'Hakkında') },
                    { id: 'gallery', label: t('hospital.tabGallery', 'Görseller') },
                    { id: 'departments', label: t('hospital.tabDepartments', 'Bölümlerimiz') },
                    { id: 'doctors', label: t('hospital.tabDoctors', 'Doktorlar') },
                    { id: 'amenities', label: t('hospital.tabAmenities', 'Sosyal İmkanlar') },
                    { id: 'contact', label: t('hospital.tabContact', 'Adres ve İletişim') },
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`px-4 md:px-5 py-3 rounded-xl text-sm font-bold transition-all ${
                        activeTab === tab.id
                          ? 'bg-primary text-white shadow-lg shadow-primary/30'
                          : 'text-gray-500 bg-gray-50 hover:bg-gray-100'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                <div className="min-h-[400px]">
                  {activeTab === 'about' && (
                    <motion.div initial={{ y: 8 }} animate={{ y: 0 }} transition={{ duration: 0.3 }}>
                      <h2 className="text-3xl font-bold text-primary mb-8">
                        <AutoTranslate text={hospital.name} translations={hospital.translations} field="name" />
                      </h2>
                      <div className="max-w-none text-slate-700 leading-[1.8] text-lg">
                        <AutoTranslate
                          text={hospital.description || ''}
                          translations={hospital.translations}
                          field="description"
                          as="div"
                          className="whitespace-pre-line break-words"
                        />
                      </div>
                    </motion.div>
                  )}

                  {activeTab === 'gallery' && (
                    <motion.div initial={{ y: 8 }} animate={{ y: 0 }} transition={{ duration: 0.3 }}>
                      <h2 className="text-3xl font-bold text-primary mb-8">{t('hospital.gallery', 'Görseller')}</h2>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {images.map((img: string, i: number) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => setLightboxIndex(i)}
                            className="group relative aspect-video rounded-3xl overflow-hidden shadow-lg border border-gray-200 cursor-zoom-in"
                          >
                            <img src={img} alt={`${hospital.name} ${i}`} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                            <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <div className="bg-white/90 p-3 rounded-full text-primary scale-0 group-hover:scale-100 transition-transform duration-300">
                                <FaSearch />
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {activeTab === 'departments' && (
                    <motion.div initial={{ y: 8 }} animate={{ y: 0 }} transition={{ duration: 0.3 }}>
                      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
                        <h2 className="text-3xl font-bold text-primary">{t('hospital.departments', 'Bölümlerimiz')}</h2>
                        <Link to="/bolumlerimiz" className="btn btn-primary px-6 py-3 inline-flex items-center gap-2">
                          {t('hospital.allDepartments', 'Tüm Bölümlerimiz')} <FaArrowRight />
                        </Link>
                      </div>
                      {departmentsLoading || doctorsLoading ? (
                        <div className="flex justify-center py-16">
                          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                        </div>
                      ) : visibleDepartments.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {visibleDepartments.map((dep: any) => (
                            <Link
                              key={dep.id}
                              to={`/bolumlerimiz/${dep.slug}?hastane=${hospital.id}`}
                              className="flex items-center p-4 bg-gray-50 rounded-2xl border border-gray-100 group hover:border-primary/30 hover:bg-primary/5 transition-colors"
                            >
                              <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-primary shadow-sm mr-4 group-hover:scale-110 transition-transform flex-shrink-0">
                                {dep.icon ? <i className={`bi ${dep.icon}`}></i> : <FaStethoscope />}
                              </div>
                              <span className="font-semibold text-gray-700 group-hover:text-primary transition-colors">
                                <AutoTranslate text={dep.name} translations={dep.translations} field="name" />
                              </span>
                              <FaChevronRight className="ml-auto text-gray-300 group-hover:text-primary transition-colors flex-shrink-0" />
                            </Link>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-16 text-gray-400">
                          <FaStethoscope className="text-5xl mx-auto mb-4 opacity-30" />
                          <p className="font-medium">{t('hospital.noDepartments', 'Bu şube için bölüm bilgisi henüz eklenmemiş.')}</p>
                        </div>
                      )}
                    </motion.div>
                  )}

                  {activeTab === 'doctors' && (
                    <motion.div initial={{ y: 8 }} animate={{ y: 0 }} transition={{ duration: 0.3 }}>
                      <h2 className="text-3xl font-bold text-primary mb-8">{t('hospital.doctors', 'Doktorlar')}</h2>
                      {doctorsLoading ? (
                        <div className="flex justify-center py-16">
                          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                        </div>
                      ) : doctors && doctors.length > 0 ? (
                        <>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            {doctors.slice(0, 4).map((doctor: any) => (
                              <Link
                                key={doctor.id}
                                to={`/doktorlar/${doctor.slug}`}
                                className="group bg-gray-50 rounded-3xl overflow-hidden border border-gray-100 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 transition-all"
                              >
                                <div className="relative aspect-[4/3] overflow-hidden bg-white flex items-center justify-center text-primary text-6xl">
                                  {doctor.image ? (
                                    <img src={doctor.image} alt={doctor.name} className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105" />
                                  ) : (
                                    <FaUserMd />
                                  )}
                                </div>
                                <div className="p-5">
                                  <p className="text-xs font-bold text-accent uppercase tracking-wide mb-1 truncate">{doctor.title}</p>
                                  <p className="font-bold text-lg text-gray-800 group-hover:text-primary transition-colors truncate">{doctor.name}</p>
                                  {doctor.departments?.name && (
                                    <p className="text-sm text-gray-500 truncate">{doctor.departments.name}</p>
                                  )}
                                </div>
                              </Link>
                            ))}
                          </div>
                          {doctors.length > 4 && (
                            <div className="mt-8 text-center">
                              <Link
                                to={`/doktorlar?hastane=${encodeURIComponent(hospital.name)}`}
                                className="btn btn-primary px-8 py-4 inline-flex items-center gap-2"
                              >
                                {t('hospital.allDoctors', 'Tüm Doktorları Gör')} ({doctors.length}) <FaArrowRight />
                              </Link>
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="text-center py-16 text-gray-400">
                          <FaUserMd className="text-5xl mx-auto mb-4 opacity-30" />
                          <p className="font-medium">{t('hospital.noDoctors', 'Bu şube için doktor bilgisi henüz eklenmemiş.')}</p>
                        </div>
                      )}
                    </motion.div>
                  )}

                  {activeTab === 'amenities' && (
                    <motion.div initial={{ y: 8 }} animate={{ y: 0 }} transition={{ duration: 0.3 }}>
                      <h2 className="text-3xl font-bold text-primary mb-8">{t('hospital.amenities', 'Sosyal İmkanlar')}</h2>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {socialFacilities(t).map((f, i) => (
                          <div key={i} className="flex items-center p-4 bg-gray-50 rounded-2xl border border-gray-100 group hover:border-primary/30 transition-colors">
                            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-primary shadow-sm mr-4 group-hover:scale-110 transition-transform">
                              {f.icon}
                            </div>
                            <span className="font-semibold text-gray-700">{f.name}</span>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {activeTab === 'contact' && (
                    <motion.div initial={{ y: 8 }} animate={{ y: 0 }} transition={{ duration: 0.3 }} id="location">
                      <h2 className="text-3xl font-bold text-primary mb-8">{t('hospital.tabContact', 'Adres ve İletişim')}</h2>
                      <div className="aspect-video rounded-3xl overflow-hidden border-4 border-white shadow-2xl mb-10 bg-gray-100">
                        {hospital.latitude && hospital.longitude ? (
                          <HospitalMap
                            latitude={hospital.latitude}
                            longitude={hospital.longitude}
                            name={hospital.name}
                            address={hospital.address}
                            className="w-full h-full"
                          />
                        ) : mapEmbedUrl ? (
                          <iframe
                            src={mapEmbedUrl}
                            className="w-full h-full border-0"
                            allowFullScreen={false}
                            loading="lazy"
                            title={hospital.name}
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 p-10 text-center">
                            <FaMapMarkerAlt className="text-5xl mb-4 opacity-20" />
                            <p className="font-medium">{t('hospital.noMap', 'Bu şube için harita bilgisi eklenmemiş.')}</p>
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                        <div className="bg-primary/5 p-8 rounded-3xl border border-primary/10">
                          <h4 className="font-bold text-primary mb-4 flex items-center">
                            <FaMapMarkerAlt className="mr-2" /> {t('hospital.addressInfo', 'Adres Bilgisi')}
                          </h4>
                          <p className="text-gray-700 leading-relaxed mb-6">
                            <AutoTranslate text={hospital.address || ''} translations={hospital.translations} field="address" />
                          </p>
                          <div className="space-y-3">
                            <a href={`tel:${hospital.phone}`} className="flex items-center text-gray-700 hover:text-primary transition-colors">
                              <FaPhone className="mr-3 text-primary" /> <span className="font-semibold">{hospital.phone}</span>
                            </a>
                            <a href={`mailto:${hospital.email}`} className="flex items-center text-gray-700 hover:text-primary transition-colors">
                              <FaEnvelope className="mr-3 text-primary" /> <span className="font-semibold break-all">{hospital.email}</span>
                            </a>
                          </div>
                        </div>
                        <div className="bg-accent/5 p-8 rounded-3xl border border-accent/10">
                          <h4 className="font-bold text-accent mb-4 flex items-center">
                            <FaClock className="mr-2" /> {t('hospital.workingHours', 'Mesai Bilgileri')}
                          </h4>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-500">{t('hospital.workingHoursLabel', 'Çalışma Saatleri:')}</span>
                              <span className="font-bold text-gray-800">
                                <AutoTranslate text={hospital.working_hours || ''} translations={hospital.translations} field="working_hours" />
                              </span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-500">{t('hospital.emergencyLabel', 'Acil Servis:')}</span>
                              <span className="font-bold text-red-500">
                                <AutoTranslate text={hospital.emergency_hours || ''} translations={hospital.translations} field="emergency_hours" />
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {transportSections.length > 0 && (
                        <div>
                          <h3 className="text-xl font-bold text-primary mb-6 flex items-center">
                            <div className="w-2 h-8 bg-accent rounded-full mr-3" /> {t('hospital.transportation', 'Ulaşım Bilgileri')}
                          </h3>
                          <div className="space-y-6">
                            {transportSections.map((section, i) => (
                              <div key={i} className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                                {section.title && (
                                  <h4 className="font-bold text-gray-800 mb-3 flex items-center">
                                    <FaBus className="mr-3 text-primary" /> {section.title}
                                  </h4>
                                )}
                                <ul className="space-y-2">
                                  {section.items.map((item, j) => (
                                    <li key={j} className="flex items-start text-gray-600 text-sm leading-relaxed">
                                      <div className="w-1.5 h-1.5 rounded-full bg-accent mr-3 mt-2 flex-shrink-0" />
                                      <span>{item}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <aside className="lg:w-1/3 space-y-8">
              {/* Contact Card */}
              <div className="bg-primary rounded-[2rem] p-10 text-white shadow-2xl shadow-primary/20 relative overflow-hidden group">
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" />

                <h3 className="text-2xl font-bold mb-8 relative z-10">{t('hospital.contactTransport', 'İletişim & Ulaşım')}</h3>

                <div className="space-y-8 relative z-10">
                  <div className="flex gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-accent text-xl flex-shrink-0">
                      <FaPhone />
                    </div>
                    <div>
                      <p className="text-white/60 text-xs uppercase font-bold tracking-widest mb-1">{t('common.phone', 'Telefon')}</p>
                      <a href={`tel:${hospital.phone}`} className="text-lg font-bold hover:text-accent transition-colors break-all">{hospital.phone}</a>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-accent text-xl flex-shrink-0">
                      <FaEnvelope />
                    </div>
                    <div>
                      <p className="text-white/60 text-xs uppercase font-bold tracking-widest mb-1">{t('common.email', 'E-posta')}</p>
                      <a href={`mailto:${hospital.email}`} className="text-base font-bold hover:text-accent transition-colors underline decoration-accent/30 break-all">{hospital.email}</a>
                    </div>
                  </div>
                </div>

                <div className="mt-12 pt-10 border-t border-white/10 relative z-10" id="appointment">
                  <a
                    href="https://anadoluhastaneleri.kendineiyibak.app/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-accent w-full py-4 text-lg font-bold shadow-xl shadow-accent/20"
                  >
                    {t('common.onlineAppointment', 'Online Randevu')}
                  </a>
                </div>
              </div>

              {/* Info Card */}
              <div className="bg-white rounded-[2rem] p-8 md:p-10 border border-gray-100 shadow-xl shadow-primary/5">
                <h3 className="text-xl font-bold text-primary mb-6 flex items-center">
                  <FaCalendarAlt className="mr-3 text-accent" /> {t('hospital.corporateInfo', 'Kurumsal Bilgiler')}
                </h3>
                <ul className="space-y-4">
                  {hospital.slug?.includes('silivri') && (
                    <li className="flex items-center text-gray-600 bg-neutral/50 p-4 rounded-2xl">
                      <div className="w-2 h-2 rounded-full bg-primary mr-3" />
                      <span className="text-sm font-medium">{t('hospital.jci', 'JCI Uluslararası Akreditasyon')}</span>
                    </li>
                  )}
                  <li className="flex items-center text-gray-600 bg-neutral/50 p-4 rounded-2xl">
                    <div className="w-2 h-2 rounded-full bg-primary mr-3" />
                    <span className="text-sm font-medium">{t('hospital.modernTech', 'Modern Teknolojik Altyapı')}</span>
                  </li>
                  <li className="flex items-center text-gray-600 bg-neutral/50 p-4 rounded-2xl">
                    <div className="w-2 h-2 rounded-full bg-primary mr-3" />
                    <span className="text-sm font-medium">{t('hospital.service247', '7/24 Kesintisiz Hizmet')}</span>
                  </li>
                </ul>
              </div>
            </aside>
          </div>
        </div>
      </section>

      <SecondOpinionBanner />

      {/* Gallery Lightbox */}
      <AnimatePresence>
        {lightboxIndex !== null && images[lightboxIndex] && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4 md:p-10"
            onClick={() => setLightboxIndex(null)}
          >
            <button
              type="button"
              onClick={() => setLightboxIndex(null)}
              className="absolute top-4 right-4 md:top-6 md:right-6 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white text-xl flex items-center justify-center transition-colors z-10"
              aria-label={t('common.close', 'Kapat')}
            >
              <FaTimes />
            </button>

            {images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setLightboxIndex((lightboxIndex - 1 + images.length) % images.length) }}
                  className="absolute left-2 md:left-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white text-xl flex items-center justify-center transition-colors z-10"
                  aria-label={t('common.previous', 'Önceki')}
                >
                  <FaChevronLeft />
                </button>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setLightboxIndex((lightboxIndex + 1) % images.length) }}
                  className="absolute right-2 md:right-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white text-xl flex items-center justify-center transition-colors z-10"
                  aria-label={t('common.next', 'Sonraki')}
                >
                  <FaChevronRight />
                </button>
              </>
            )}

            <motion.img
              key={lightboxIndex}
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.2 }}
              src={images[lightboxIndex]}
              alt={`${hospital.name} ${lightboxIndex + 1}`}
              className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />

            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/70 text-sm font-medium bg-black/40 px-4 py-1.5 rounded-full">
              {lightboxIndex + 1} / {images.length}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default HospitalDetailPage
