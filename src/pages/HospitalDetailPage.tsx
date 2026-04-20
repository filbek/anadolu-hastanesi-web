import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import { FaMapMarkerAlt, FaPhone, FaEnvelope, FaClock, FaCalendarAlt, FaHospital, FaChevronRight, FaSearch } from 'react-icons/fa'
import { getHospitalBySlug } from '../services/hospitalService'
import type { Hospital } from '../lib/supabase'
import 'swiper/css'

// Placeholder features since they are not in DB yet
const defaultFeatures = [
  { name: '24 Saat Acil Servis', icon: 'bi-heart-pulse-fill' },
  { name: 'MR ve Tomografi', icon: 'bi-radioactive' },
  { name: 'Yoğun Bakım Ünitesi', icon: 'bi-activity' },
  { name: 'Ameliyathane', icon: 'bi-bandaid-fill' },
  { name: 'Laboratuvar', icon: 'bi-eyedropper' },
  { name: 'Fizik Tedavi', icon: 'bi-person-arms-up' },
  { name: 'Radyoloji', icon: 'bi-file-earmark-medical-fill' },
  { name: 'Eczane', icon: 'bi-capsule' },
];

const HospitalDetailPage = () => {
  const { slug } = useParams<{ slug: string }>()
  const [hospital, setHospital] = useState<Hospital | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('about')

  useEffect(() => {
    const fetchHospital = async () => {
      if (!slug) return;
      setLoading(true);
      try {
        const data = await getHospitalBySlug(slug);
        setHospital(data);
      } catch (error) {
        console.error('Error fetching hospital:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchHospital();
  }, [slug]);

  if (loading) {
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
        <h2 className="text-3xl font-bold text-primary mb-4">Hastane Bulunamadı</h2>
        <p className="text-text-light mb-8 max-w-md mx-auto">Aradığınız şubemize şu an ulaşılamıyor. Lütfen diğer hastanelerimize göz atın.</p>
        <Link to="/hastanelerimiz" className="btn btn-primary px-10 py-4">
          Tüm Şubelerimiz
        </Link>
      </div>
    )
  }

  const heroTitle = hospital.hero_title || hospital.name;
  const heroSubtitle = hospital.hero_subtitle || hospital.description;
  const metaTitle = hospital.meta_title || `${hospital.name} | Anadolu Hastaneleri Grubu`;
  const metaDescription = hospital.meta_description || hospital.description;
  const mainImage = hospital.images && hospital.images.length > 0 ? hospital.images[0] : 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=1200&q=80';

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
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center space-x-2 text-sm text-white/70 mb-8"
            >
              <Link to="/" className="hover:text-white transition-colors">Ana Sayfa</Link>
              <FaChevronRight className="text-[10px]" />
              <Link to="/hastanelerimiz" className="hover:text-white transition-colors">Hastanelerimiz</Link>
              <FaChevronRight className="text-[10px]" />
              <span className="text-white font-medium">{hospital.name}</span>
            </motion.nav>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-6xl font-bold mb-6 leading-tight"
            >
              {heroTitle}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-lg md:text-xl text-white/90 mb-10 leading-relaxed max-w-2xl"
            >
              {heroSubtitle}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex flex-wrap gap-4"
            >
              <a href="#appointment" className="btn btn-accent px-8 py-4 text-lg">Hemen Randevu Al</a>
              <a href="#location" className="btn bg-white/10 backdrop-blur-md text-white border-white/20 hover:bg-white/20 px-8 py-4 text-lg">Yol Tarifi</a>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-20 bg-neutral/30">
        <div className="container-custom">
          <div className="flex flex-col lg:flex-row gap-12">
            {/* Main Content Area */}
            <div className="lg:w-2/3">
              <div className="bg-white rounded-3xl shadow-xl shadow-primary/5 p-8 md:p-12 mb-10 border border-gray-100">
                {/* Navigation Tabs */}
                <div className="flex overflow-x-auto pb-4 mb-10 scrollbar-hide border-b border-gray-100">
                  {[
                    { id: 'about', label: 'Hakkında', icon: <FaHospital /> },
                    { id: 'gallery', label: 'Görseller', icon: <FaHospital /> },
                    { id: 'location', label: 'Konum & Ulaşım', icon: <FaMapMarkerAlt /> }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center space-x-2 px-6 py-3 rounded-xl text-sm font-bold transition-all whitespace-nowrap mr-3 ${activeTab === tab.id
                          ? 'bg-primary text-white shadow-lg shadow-primary/30'
                          : 'text-gray-500 hover:bg-gray-100'
                        }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                <div className="min-h-[400px]">
                  {activeTab === 'about' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                      <h2 className="text-3xl font-bold text-primary mb-8">{hospital.name}</h2>
                      <div className="prose prose-lg max-w-none text-text-light leading-relaxed mb-12">
                        {hospital.description}
                      </div>

                      <h3 className="text-xl font-bold text-primary mb-6 flex items-center">
                        <div className="w-2 h-8 bg-accent rounded-full mr-3" /> Sunulan Hizmetler
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {defaultFeatures.map((f, i) => (
                          <div key={i} className="flex items-center p-4 bg-gray-50 rounded-2xl border border-gray-100 group hover:border-primary/30 transition-colors">
                            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-primary shadow-sm mr-4 group-hover:scale-110 transition-transform">
                              <i className={`bi ${f.icon}`}></i>
                            </div>
                            <span className="font-semibold text-gray-700">{f.name}</span>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {activeTab === 'gallery' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                      <h2 className="text-3xl font-bold text-primary mb-8">Kurumsal Galeri</h2>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {hospital.images?.map((img, i) => (
                          <div key={i} className="group relative aspect-video rounded-3xl overflow-hidden shadow-lg border border-gray-200">
                            <img src={img} alt={`${hospital.name} ${i}`} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                            <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <div className="bg-white/90 p-3 rounded-full text-primary scale-0 group-hover:scale-100 transition-transform duration-300">
                                <FaSearch />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {activeTab === 'location' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} id="location">
                      <h2 className="text-3xl font-bold text-primary mb-8">Konum ve Harita</h2>
                      <div className="aspect-video rounded-3xl overflow-hidden border-4 border-white shadow-2xl mb-10 bg-gray-100">
                        {hospital.map_url ? (
                          <iframe
                            src={hospital.map_url}
                            className="w-full h-full border-0"
                            allowFullScreen={false}
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 p-10 text-center">
                            <FaMapMarkerAlt className="text-5xl mb-4 opacity-20" />
                            <p className="font-medium">Bu şube için harita bilgisi eklenmemiş.</p>
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="bg-primary/5 p-8 rounded-3xl border border-primary/10">
                          <h4 className="font-bold text-primary mb-4 flex items-center">
                            <FaMapMarkerAlt className="mr-2" /> Adres Bilgisi
                          </h4>
                          <p className="text-gray-700 leading-relaxed">{hospital.address}</p>
                        </div>
                        <div className="bg-accent/5 p-8 rounded-3xl border border-accent/10">
                          <h4 className="font-bold text-accent mb-4 flex items-center">
                            <FaClock className="mr-2" /> Mesai Bilgileri
                          </h4>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-500">Çalışma Saatleri:</span>
                              <span className="font-bold text-gray-800">{hospital.working_hours}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-500">Acil Servis:</span>
                              <span className="font-bold text-red-500">{hospital.emergency_hours}</span>
                            </div>
                          </div>
                        </div>
                      </div>
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

                <h3 className="text-2xl font-bold mb-8 relative z-10">İletişim & Ulaşım</h3>

                <div className="space-y-8 relative z-10">
                  <div className="flex gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-accent text-xl flex-shrink-0">
                      <FaPhone />
                    </div>
                    <div>
                      <p className="text-white/60 text-xs uppercase font-bold tracking-widest mb-1">Telefon</p>
                      <a href={`tel:${hospital.phone}`} className="text-lg font-bold hover:text-accent transition-colors">{hospital.phone}</a>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-accent text-xl flex-shrink-0">
                      <FaEnvelope />
                    </div>
                    <div>
                      <p className="text-white/60 text-xs uppercase font-bold tracking-widest mb-1">E-posta</p>
                      <a href={`mailto:${hospital.email}`} className="text-lg font-bold hover:text-accent transition-colors underline decoration-accent/30">{hospital.email}</a>
                    </div>
                  </div>
                </div>

                <div className="mt-12 pt-10 border-t border-white/10 relative z-10">
                  <a
                    href="https://anadoluhastaneleri.kendineiyibak.app/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-accent w-full py-4 text-lg font-bold shadow-xl shadow-accent/20"
                  >
                    Online Randevu
                  </a>
                </div>
              </div>

              {/* Info Card */}
              <div className="bg-white rounded-[2rem] p-8 md:p-10 border border-gray-100 shadow-xl shadow-primary/5">
                <h3 className="text-xl font-bold text-primary mb-6 flex items-center">
                  <FaCalendarAlt className="mr-3 text-accent" /> Kurumsal Bilgiler
                </h3>
                <ul className="space-y-4">
                  <li className="flex items-center text-gray-600 bg-neutral/50 p-4 rounded-2xl">
                    <div className="w-2 h-2 rounded-full bg-primary mr-3" />
                    <span className="text-sm font-medium">JCI Uluslararası Akreditasyon</span>
                  </li>
                  <li className="flex items-center text-gray-600 bg-neutral/50 p-4 rounded-2xl">
                    <div className="w-2 h-2 rounded-full bg-primary mr-3" />
                    <span className="text-sm font-medium">Modern Teknolojik Altyapı</span>
                  </li>
                  <li className="flex items-center text-gray-600 bg-neutral/50 p-4 rounded-2xl">
                    <div className="w-2 h-2 rounded-full bg-primary mr-3" />
                    <span className="text-sm font-medium">7/24 Kesintisiz Hizmet</span>
                  </li>
                </ul>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </div>
  )
}

export default HospitalDetailPage
