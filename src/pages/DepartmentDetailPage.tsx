import { useState } from 'react'
import { useParams, Link, useSearchParams } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Pagination } from 'swiper/modules'
import { FaCalendarAlt, FaStethoscope, FaClipboardList, FaArrowRight, FaCalendarCheck } from 'react-icons/fa'
import AutoTranslate from '../components/common/AutoTranslate'
import SecondOpinionBanner from '../components/common/SecondOpinionBanner'
import { useDepartment, useDepartments } from '../hooks/useDepartments'
import { useDoctorsByDepartment } from '../hooks/useDoctors'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'

function getDepartmentProcess(deptName: string, t: any): { title: string; steps: { title: string; desc: string }[]; article: string } {
  const article = t('deptDetail.processArticle', '{{deptName}} birimimizde, hastalarımıza en yüksek kalitede sağlık hizmeti sunmak için titizlikle hazırlanmış bir tedavi süreci uyguluyoruz. Süreç, hastanın ilk başvurusundan itibaren kapsamlı bir değerlendirme ile başlar. Uzman hekimlerimiz, modern tanı cihazlarımız ve laboratuvar altyapımız sayesinde doğru teşhisi hızla koyar. Teşhisin ardından, hastanın yaşı, genel sağlık durumu ve ihtiyaçları göz önünde bulundurularak kişiselleştirilmiş bir tedavi planı oluşturulur. Tedavi sürecinde hasta ve yakınları, her aşamada bilgilendirilir ve sürece aktif olarak dahil edilir. Ameliyat gerektiren durumlarda, son teknoloji ameliyathanelerimizde minimal invaziv yöntemler öncelikli olarak tercih edilir. Tedavi sonrası ise düzenli takip randevuları ve rehabilitasyon programları ile hastanın sağlığına kavuşması desteklenir. Tüm bu süreçte hasta memnuniyeti ve güvenliği bizim için en üst düzeydedir.', { deptName })

  return {
    title: t('deptDetail.processTitle', '{{deptName}} Tedavi Süreci', { deptName }),
    steps: [
      { title: t('deptDetail.step1Title', 'İlk Değerlendirme'), desc: t('deptDetail.step1Desc', 'Hastanın şikayetleri dinlenir, fizik muayene yapılır ve gerekli tahliller istenir.') },
      { title: t('deptDetail.step2Title', 'Tanı'), desc: t('deptDetail.step2Desc', 'Laboratuvar ve görüntüleme sonuçları değerlendirilerek kesin teşhis konulur.') },
      { title: t('deptDetail.step3Title', 'Tedavi Planı'), desc: t('deptDetail.step3Desc', 'Hastaya özel, multidisipliner bir tedavi stratejisi belirlenir.') },
      { title: t('deptDetail.step4Title', 'Uygulama'), desc: t('deptDetail.step4Desc', 'Modern cihazlar ve uzman kadro ile tedavi güvenle uygulanır.') },
      { title: t('deptDetail.step5Title', 'Takip ve Rehabilitasyon'), desc: t('deptDetail.step5Desc', 'Tedavi sonrası düzenli kontroller ve destek programları ile süreç tamamlanır.') },
    ],
    article,
  }
}

const DepartmentDetailPage = () => {
  const { t } = useTranslation();
  const { slug } = useParams<{ slug: string }>();
  const [searchParams] = useSearchParams();
  // Bölümlerimiz sayfasında bir şube sekmesi seçiliyken gelinirse ?hastane=<id> ile gelir
  const hospitalFilter = searchParams.get('hastane') || '';
  const { data: department, isLoading: isDeptLoading } = useDepartment(slug || '');
  const { data: allDoctors = [], isLoading: isDoctorsLoading } = useDoctorsByDepartment(department?.id || 0);
  const { data: otherDepartments = [] } = useDepartments({ onlyPublished: true });

  // Şube filtresi varsa yalnızca o hastanenin doktorlarını göster
  const doctors = hospitalFilter
    ? allDoctors.filter((d: any) => String(d.hospital_id) === hospitalFilter)
    : allDoctors;
  // Filtrelenen şubenin adı (rozet ve "tüm şubeler" bağlantısı için)
  const filteredHospitalName = hospitalFilter
    ? (allDoctors.find((d: any) => String(d.hospital_id) === hospitalFilter) as any)?.hospitals?.name || ''
    : '';

  const [activeTab, setActiveTab] = useState('about');

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
        <h2 className="text-2xl font-bold mb-4">{t('deptDetail.notFound', 'Bölüm Bulunamadı')}</h2>
        <p className="mb-8">{t('deptDetail.notFoundDesc', 'Aradığınız bölüm bulunamadı. Lütfen tüm bölümlerimizi görüntüleyin.')}</p>
        <Link to="/bolumlerimiz" className="btn btn-primary">
          {t('deptDetail.allDepts', 'Tüm Bölümlerimiz')}
        </Link>
      </div>
    );
  }

  // Parse JSONB fields
  const treatments = Array.isArray(department.treatments) ? department.treatments : [];
  const equipment = Array.isArray(department.equipment) ? department.equipment : [];
  const images = Array.isArray(department.images) ? department.images : [];
  const heroImage = images.length > 0 ? images[0] : 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=1200&q=80';

  const process = getDepartmentProcess(department.name, t);

  const tabContentClass = "min-h-[400px]";
  const tabMotionProps = { initial: { opacity: 0, y: 8 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -8 }, transition: { duration: 0.25 } };

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
              loading="eager"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-black/30" />
          </div>
          <div className="container-custom relative h-full flex flex-col justify-end pb-12">
            <motion.div
              initial={{ y: 12 }}
              animate={{ y: 0 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="flex items-center mb-4"
            >
              <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center mr-4">
                <i className={`bi ${department.icon || 'bi-hospital'} text-3xl text-white`}></i>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-white uppercase">
                <AutoTranslate
                  text={department.hero_title || department.name}
                  translations={department.translations}
                  field={department.hero_title ? 'hero_title' : 'name'}
                />
              </h1>
            </motion.div>
            {department.hero_subtitle && (
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-white/90 text-lg max-w-3xl"
              >
                <AutoTranslate
                  text={department.hero_subtitle || ''}
                  translations={department.translations}
                  field="hero_subtitle"
                />
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
                    {t('common.about', 'Hakkında')}
                  </button>
                  {treatments.length > 0 && (
                    <button
                      className={`px-4 py-2 font-medium text-sm whitespace-nowrap ${activeTab === 'treatments' ? 'text-primary border-b-2 border-primary' : 'text-text-light hover:text-primary'
                        }`}
                      onClick={() => setActiveTab('treatments')}
                    >
                      {t('deptDetail.treatments', 'Tedaviler')}
                    </button>
                  )}
                  <button
                    className={`px-4 py-2 font-medium text-sm whitespace-nowrap ${activeTab === 'process' ? 'text-primary border-b-2 border-primary' : 'text-text-light hover:text-primary'
                      }`}
                    onClick={() => setActiveTab('process')}
                  >
                    Tedavi Süreci
                  </button>
                  {equipment.length > 0 && (
                    <button
                      className={`px-4 py-2 font-medium text-sm whitespace-nowrap ${activeTab === 'equipment' ? 'text-primary border-b-2 border-primary' : 'text-text-light hover:text-primary'
                        }`}
                      onClick={() => setActiveTab('equipment')}
                    >
                      {t('deptDetail.technology', 'Teknoloji')}
                    </button>
                  )}
                </div>
              </div>

              {/* Tab Content */}
              <div className={tabContentClass}>
                <AnimatePresence mode="wait">
                {/* About Tab */}
                {activeTab === 'about' && (
                  <motion.div key="about" {...tabMotionProps}>
                    <h2 className="text-2xl font-semibold text-primary mb-4">
                      <AutoTranslate
                        text={department.name}
                        translations={department.translations}
                        field="name"
                      />
                    </h2>
                    <div className="prose max-w-none text-text-light mb-8 whitespace-pre-wrap leading-relaxed">
                      <AutoTranslate
                        text={department.long_description || department.description || `${department.name} birimimizde, alanında uzman hekim kadromuz ve modern tıp teknolojilerimizle hastalarımıza en iyi sağlık hizmetini sunmayı ilke edindik. Teşhis ve tedavi süreçlerinde multidisipliner yaklaşım benimseyerek, her hastamız için kişiselleştirilmiş çözümler üretiyoruz.`}
                        translations={department.translations}
                        field={department.long_description ? 'long_description' : 'description'}
                      />
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
                                  loading={index === 0 ? 'eager' : 'lazy'}
                                />
                              </div>
                            </SwiperSlide>
                          ))}
                        </Swiper>
                      </div>
                    )}

                    {/* Doctors Section */}
                    <div className="mt-12">
                      <h3 className="text-xl font-bold text-primary mb-6 flex items-center flex-wrap gap-x-3 gap-y-2">
                        <span className="flex items-center">
                          <div className="w-2 h-8 bg-accent rounded-full mr-3" /> {t('deptDetail.featuredDoctors', 'Bölüm Doktorlarımız')}
                        </span>
                        {filteredHospitalName && (
                          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
                            {filteredHospitalName}
                            <Link
                              to={`/bolumlerimiz/${department.slug}`}
                              className="text-xs font-semibold underline hover:no-underline"
                            >
                              {t('deptDetail.allBranches', 'Tüm şubeler')}
                            </Link>
                          </span>
                        )}
                      </h3>
                      {isDoctorsLoading ? (
                        <div className="flex justify-center py-12">
                          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
                        </div>
                      ) : doctors.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                          {doctors.map((doctor) => (
                            <Link
                              key={doctor.id}
                              to={`/doktorlar/${doctor.slug}`}
                              className="group bg-white rounded-2xl overflow-hidden border border-neutral-100 hover:border-ocean-200 hover:shadow-hover transition-all duration-300"
                            >
                              <div className="relative aspect-[3/4] overflow-hidden bg-surface">
                                <img
                                  src={doctor.image}
                                  alt={doctor.name}
                                  className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                                  loading="lazy"
                                />
                              </div>
                              <div className="p-5">
                                <span className="inline-block px-2.5 py-0.5 rounded-full bg-ocean-50 text-ocean-600 text-xs font-medium mb-2">
                                  {(doctor as any).hospitals?.name || t('home.defaultHospital', 'Anadolu Hastanesi')}
                                </span>
                                <h3 className="font-display font-bold text-primary-600 text-lg mb-1 group-hover:text-ocean-600 transition-colors">
                                  {doctor.name}
                                </h3>
                                <p className="text-sm text-neutral-500 mb-4">{doctor.title}</p>
                                <div className="flex items-center gap-3 pt-3 border-t border-neutral-100">
                                  <span className="flex items-center gap-1.5 text-sm font-medium text-primary-600 hover:text-ocean-600 transition-colors">
                                    {t('home.profile', 'Profil')} <FaArrowRight className="text-xs" />
                                  </span>
                                  <a
                                    href="https://anadoluhastaneleri.kendineiyibak.app/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1.5 text-sm font-medium text-coral-500 hover:text-coral-600 transition-colors ml-auto"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <FaCalendarCheck className="text-xs" />
                                    {t('home.appointment', 'Randevu')}
                                  </a>
                                </div>
                              </div>
                            </Link>
                          ))}
                        </div>
                      ) : filteredHospitalName ? (
                        <p className="text-text-light italic">
                          {t('deptDetail.noDoctorsAtBranch', '{{hospital}} şubesinde bu bölüme ait doktor bulunmamaktadır.', { hospital: filteredHospitalName })}{' '}
                          <Link to={`/bolumlerimiz/${department.slug}`} className="text-primary font-medium underline hover:no-underline not-italic">
                            {t('deptDetail.showAllBranchDoctors', 'Tüm şubelerdeki doktorları gör')}
                          </Link>
                        </p>
                      ) : (
                        <p className="text-text-light italic">{t('deptDetail.noDoctors', 'Bu bölümde henüz doktor bulunmamaktadır.')}</p>
                      )}
                    </div>
                  </motion.div>
                )}

                {/* Treatments Tab */}
                {activeTab === 'treatments' && (
                  <motion.div key="treatments" {...tabMotionProps}>
                    <h2 className="text-2xl font-semibold text-primary mb-6">Tedavi ve Hizmetlerimiz</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {treatments.map((treatment: any, index: number) => (
                        <div key={index} className="card p-6">
                          <div className="flex items-center mb-4">
                            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mr-4">
                              <i className={`bi ${treatment.icon || 'bi-check-circle'} text-xl text-primary`}></i>
                            </div>
                            <h3 className="text-lg font-semibold"><AutoTranslate text={treatment.name} /></h3>
                          </div>
                          <p className="text-sm text-text-light"><AutoTranslate text={treatment.description} /></p>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Process Tab */}
                {activeTab === 'process' && (
                  <motion.div key="process" {...tabMotionProps}>
                    <h2 className="text-2xl font-semibold text-primary mb-4 flex items-center gap-2">
                      <FaClipboardList className="text-ocean-500" />
                      <AutoTranslate text={process.title} />
                    </h2>
                    <div className="relative mb-8">
                      <img
                        src={images[1] || images[0] || 'https://images.unsplash.com/photo-1587351021759-3e566b0805b8?auto=format&fit=crop&w=1200&q=80'}
                        alt={`${department.name} süreç görseli`}
                        className="w-full h-64 object-cover rounded-xl"
                        loading="eager"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-primary/60 to-transparent rounded-xl" />
                      <div className="absolute bottom-4 left-4 right-4">
                        <span className="inline-flex items-center gap-2 px-3 py-1 bg-white/90 rounded-full text-xs font-semibold text-primary">
                          <FaStethoscope /> {t('deptDetail.modernCare', 'Modern Tanı ve Tedavi')}
                        </span>
                      </div>
                    </div>
                    <div className="prose max-w-none text-text-light mb-8 leading-relaxed">
                      <AutoTranslate text={process.article} />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {process.steps.map((step, idx) => (
                        <div key={idx} className="flex items-start gap-4 p-4 bg-surface rounded-xl">
                          <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold shrink-0">
                            {idx + 1}
                          </div>
                          <div>
                            <h4 className="font-semibold text-primary text-sm"><AutoTranslate text={step.title} /></h4>
                            <p className="text-xs text-text-light mt-1"><AutoTranslate text={step.desc} /></p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Equipment Tab */}
                {activeTab === 'equipment' && (
                  <motion.div key="equipment" {...tabMotionProps}>
                    <h2 className="text-2xl font-semibold text-primary mb-6">Teknolojik Altyapımız</h2>
                    <p className="text-text-light mb-8">
                      <AutoTranslate text={`${department.name} bölümümüzde en son teknolojik cihazlar ve ekipmanlar kullanılmaktadır.`} />
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
                              />
                            </div>
                          )}
                          <h3 className="text-lg font-semibold mb-2"><AutoTranslate text={item.name} /></h3>
                          <p className="text-sm text-text-light"><AutoTranslate text={item.description} /></p>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
                </AnimatePresence>
              </div>
            </div>

            {/* Right Column - Sidebar */}
            <div className="lg:w-1/3">
              {/* Appointment Card */}
              <div className="card mb-8">
                <h3 className="text-xl font-semibold text-primary mb-4">{t('common.appointment', 'Randevu Al')}</h3>
                <p className="text-text-light text-sm mb-6">
                  <AutoTranslate text={t('deptDetail.appointmentDesc', '{{name}} bölümünden randevu almak için online randevu sistemimizi kullanabilir veya bizi arayabilirsiniz.', { name: department.name })} />
                </p>
                <div className="space-y-4">
                  <a
                    href="https://anadoluhastaneleri.kendineiyibak.app/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-accent w-full flex justify-center items-center"
                  >
                    <FaCalendarAlt className="mr-2" /> {t('common.onlineAppointment', 'Online Randevu')}
                  </a>
                  <a
                    href="tel:4445058"
                    className="btn btn-outline w-full flex justify-center items-center"
                  >
                    <i className="bi bi-telephone-fill mr-2"></i> 444 50 58
                  </a>
                </div>
              </div>

              {/* Other Departments */}
              <div className="card mb-8">
                <h3 className="text-xl font-semibold text-primary mb-4">{t('deptDetail.otherDepts', 'Diğer Bölümlerimiz')}</h3>
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
                    {t('deptDetail.viewAllDepts', 'Tüm Bölümlerimizi Görüntüle')}
                  </Link>
                </div>
              </div>

              {/* Contact */}
              <div className="card">
                <h3 className="text-xl font-semibold text-primary mb-4">{t('common.contact', 'İletişim')}</h3>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <i className="bi bi-telephone-fill text-primary mr-3"></i>
                    <div>
                      <h4 className="font-medium text-text text-sm">{t('common.callCenter', 'Çağrı Merkezi')}</h4>
                      <a href="tel:4445058" className="text-sm text-text-light hover:text-primary transition-colors">
                        444 50 58
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <SecondOpinionBanner />
    </>
  );
};

export default DepartmentDetailPage;
