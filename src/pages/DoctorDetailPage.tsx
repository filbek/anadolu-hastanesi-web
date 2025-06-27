import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import { FaCalendarAlt, FaGraduationCap, FaHospital, FaStethoscope, FaAward, FaLanguage, FaFileMedical } from 'react-icons/fa'

// Mock data for a single doctor
const doctorData = {
  id: 1,
  name: 'Prof. Dr. Ahmet Yılmaz',
  slug: 'prof-dr-ahmet-yilmaz',
  title: 'Kardiyoloji Uzmanı',
  department: 'Kardiyoloji',
  departmentSlug: 'kardiyoloji',
  hospital: 'Anadolu Merkez Hastanesi',
  hospitalSlug: 'anadolu-merkez-hastanesi',
  image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80',
  education: [
    { degree: 'Tıp Fakültesi', institution: 'İstanbul Üniversitesi', year: '1990' },
    { degree: 'Uzmanlık', institution: 'Ankara Üniversitesi', year: '1996' },
    { degree: 'Doçentlik', institution: 'İstanbul Üniversitesi', year: '2002' },
    { degree: 'Profesörlük', institution: 'İstanbul Üniversitesi', year: '2008' },
  ],
  experience: [
    { position: 'Kardiyoloji Uzmanı', institution: 'Devlet Hastanesi', years: '1996-2000' },
    { position: 'Kardiyoloji Doçenti', institution: 'Üniversite Hastanesi', years: '2000-2008' },
    { position: 'Kardiyoloji Profesörü', institution: 'Anadolu Hastaneleri', years: '2008-Günümüz' },
  ],
  specialties: [
    'Koroner Arter Hastalıkları',
    'Kalp Yetmezliği',
    'Kalp Kapak Hastalıkları',
    'Ritim Bozuklukları',
    'Hipertansiyon',
    'Koroner Anjiyografi',
    'Stent Uygulamaları',
  ],
  awards: [
    { name: 'Bilim Teşvik Ödülü', institution: 'Türk Kardiyoloji Derneği', year: '2005' },
    { name: 'En İyi Araştırma Ödülü', institution: 'Avrupa Kardiyoloji Derneği', year: '2010' },
    { name: 'Üstün Hizmet Ödülü', institution: 'Sağlık Bakanlığı', year: '2015' },
  ],
  publications: [
    { title: 'Koroner Arter Hastalıklarında Yeni Tedavi Yaklaşımları', journal: 'Türk Kardiyoloji Dergisi', year: '2018' },
    { title: 'Hipertansiyon Tedavisinde Güncel Yaklaşımlar', journal: 'Avrupa Kardiyoloji Dergisi', year: '2016' },
    { title: 'Kalp Yetmezliğinde İlaç Tedavisinin Etkinliği', journal: 'Amerikan Kardiyoloji Dergisi', year: '2014' },
    { title: 'Ritim Bozukluklarında Tanı ve Tedavi', journal: 'Türk Kardiyoloji Dergisi', year: '2012' },
  ],
  languages: ['Türkçe', 'İngilizce', 'Almanca'],
  bio: 'Prof. Dr. Ahmet Yılmaz, kardiyoloji alanında 25 yılı aşkın deneyime sahip, alanında uzman bir hekimdir. İstanbul Üniversitesi Tıp Fakültesi\'nden mezun olduktan sonra, Ankara Üniversitesi\'nde uzmanlık eğitimini tamamlamıştır. Koroner arter hastalıkları, kalp yetmezliği, kalp kapak hastalıkları ve ritim bozuklukları konularında uzmanlaşmıştır. Ulusal ve uluslararası birçok bilimsel dergide makaleleri yayınlanmış, konferanslarda konuşmacı olarak yer almıştır. 2008 yılından bu yana Anadolu Hastaneleri bünyesinde görev yapmaktadır.',
  workingDays: 'Pazartesi, Salı, Çarşamba, Perşembe, Cuma',
  workingHours: '09:00 - 17:00',
};

const DoctorDetailPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [doctor, setDoctor] = useState<typeof doctorData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('about');

  useEffect(() => {
    // In a real application, you would fetch the doctor data from an API
    // For this example, we'll use the mock data
    setLoading(true);
    setTimeout(() => {
      setDoctor(doctorData);
      setLoading(false);
    }, 500);
  }, [slug]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="container-custom py-20 text-center">
        <h2 className="text-2xl font-bold mb-4">Doktor Bulunamadı</h2>
        <p className="mb-8">Aradığınız doktor bulunamadı. Lütfen tüm doktorlarımızı görüntüleyin.</p>
        <Link to="/doktorlar" className="btn btn-primary">
          Tüm Doktorlarımız
        </Link>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{doctor.name} | Anadolu Hastaneleri Grubu</title>
        <meta name="description" content={`${doctor.name} - ${doctor.title}. ${doctor.hospital} bünyesinde hizmet veren uzman doktorumuz hakkında bilgi alın ve online randevu alın.`} />
      </Helmet>

      <div className="pt-24 pb-12">
        <div className="container-custom">
          <div className="bg-white rounded-xl shadow-card overflow-hidden">
            {/* Doctor Header */}
            <div className="bg-primary text-white p-8">
              <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
                <div className="w-48 h-48 rounded-full overflow-hidden border-4 border-white shadow-lg flex-shrink-0">
                  <img
                    src={doctor.image}
                    alt={doctor.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    crossOrigin="anonymous"
                  />
                </div>
                <div className="text-center md:text-left">
                  <h1 className="text-3xl md:text-4xl font-bold mb-2">{doctor.name}</h1>
                  <p className="text-xl text-white/90 mb-4">{doctor.title}</p>
                  <div className="flex flex-wrap justify-center md:justify-start gap-4 mb-6">
                    <Link
                      to={`/bolumlerimiz/${doctor.departmentSlug}`}
                      className="flex items-center bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-sm hover:bg-white/20 transition-colors"
                    >
                      <FaStethoscope className="mr-2" />
                      {doctor.department}
                    </Link>
                    <Link
                      to={`/hastanelerimiz/${doctor.hospitalSlug}`}
                      className="flex items-center bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-sm hover:bg-white/20 transition-colors"
                    >
                      <FaHospital className="mr-2" />
                      {doctor.hospital}
                    </Link>
                  </div>
                  <div className="flex flex-wrap justify-center md:justify-start gap-4">
                    <a
                      href="https://anadoluhastaneleri.kendineiyibak.app/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn bg-accent hover:bg-accent-dark transition-colors"
                    >
                      <FaCalendarAlt className="mr-2" /> Online Randevu
                    </a>
                    <a
                      href="tel:+902121234567"
                      className="btn bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 transition-colors"
                    >
                      <i className="bi bi-telephone-fill mr-2"></i> Telefonla Ara
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200">
              <div className="flex overflow-x-auto px-6">
                <button
                  className={`px-4 py-4 font-medium text-sm whitespace-nowrap ${
                    activeTab === 'about' ? 'text-primary border-b-2 border-primary' : 'text-text-light hover:text-primary'
                  }`}
                  onClick={() => setActiveTab('about')}
                >
                  Hakkında
                </button>
                <button
                  className={`px-4 py-4 font-medium text-sm whitespace-nowrap ${
                    activeTab === 'education' ? 'text-primary border-b-2 border-primary' : 'text-text-light hover:text-primary'
                  }`}
                  onClick={() => setActiveTab('education')}
                >
                  Eğitim ve Deneyim
                </button>
                <button
                  className={`px-4 py-4 font-medium text-sm whitespace-nowrap ${
                    activeTab === 'specialties' ? 'text-primary border-b-2 border-primary' : 'text-text-light hover:text-primary'
                  }`}
                  onClick={() => setActiveTab('specialties')}
                >
                  Uzmanlık Alanları
                </button>
                <button
                  className={`px-4 py-4 font-medium text-sm whitespace-nowrap ${
                    activeTab === 'publications' ? 'text-primary border-b-2 border-primary' : 'text-text-light hover:text-primary'
                  }`}
                  onClick={() => setActiveTab('publications')}
                >
                  Yayınlar ve Ödüller
                </button>
              </div>
            </div>

            {/* Tab Content */}
            <div className="p-8">
              {/* About Tab */}
              {activeTab === 'about' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <h2 className="text-2xl font-semibold text-primary mb-4">Biyografi</h2>
                  <p className="text-text-light mb-8 leading-relaxed">{doctor.bio}</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                    <div className="card">
                      <h3 className="text-xl font-semibold text-primary mb-4">Çalışma Bilgileri</h3>
                      <ul className="space-y-4">
                        <li className="flex items-start">
                          <FaHospital className="text-primary mt-1 mr-3 flex-shrink-0" />
                          <div>
                            <h4 className="font-medium">Hastane</h4>
                            <p className="text-text-light">{doctor.hospital}</p>
                          </div>
                        </li>
                        <li className="flex items-start">
                          <FaStethoscope className="text-primary mt-1 mr-3 flex-shrink-0" />
                          <div>
                            <h4 className="font-medium">Bölüm</h4>
                            <p className="text-text-light">{doctor.department}</p>
                          </div>
                        </li>
                        <li className="flex items-start">
                          <i className="bi bi-calendar-week text-primary mt-1 mr-3 flex-shrink-0"></i>
                          <div>
                            <h4 className="font-medium">Çalışma Günleri</h4>
                            <p className="text-text-light">{doctor.workingDays}</p>
                          </div>
                        </li>
                        <li className="flex items-start">
                          <i className="bi bi-clock text-primary mt-1 mr-3 flex-shrink-0"></i>
                          <div>
                            <h4 className="font-medium">Çalışma Saatleri</h4>
                            <p className="text-text-light">{doctor.workingHours}</p>
                          </div>
                        </li>
                      </ul>
                    </div>
                    
                    <div className="card">
                      <h3 className="text-xl font-semibold text-primary mb-4">İletişim</h3>
                      <ul className="space-y-4">
                        <li className="flex items-start">
                          <i className="bi bi-telephone-fill text-primary mt-1 mr-3 flex-shrink-0"></i>
                          <div>
                            <h4 className="font-medium">Telefon</h4>
                            <a href="tel:+902121234567" className="text-text-light hover:text-primary transition-colors">
                              0212 123 45 67
                            </a>
                          </div>
                        </li>
                        <li className="flex items-start">
                          <i className="bi bi-envelope-fill text-primary mt-1 mr-3 flex-shrink-0"></i>
                          <div>
                            <h4 className="font-medium">E-posta</h4>
                            <a href="mailto:ahmet.yilmaz@anadoluhastaneleri.com" className="text-text-light hover:text-primary transition-colors">
                              ahmet.yilmaz@anadoluhastaneleri.com
                            </a>
                          </div>
                        </li>
                        <li className="flex items-start">
                          <FaLanguage className="text-primary mt-1 mr-3 flex-shrink-0" />
                          <div>
                            <h4 className="font-medium">Konuştuğu Diller</h4>
                            <p className="text-text-light">{doctor.languages.join(', ')}</p>
                          </div>
                        </li>
                      </ul>
                      <div className="mt-6">
                        <a
                          href="https://anadoluhastaneleri.kendineiyibak.app/"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-accent w-full"
                        >
                          <FaCalendarAlt className="mr-2" /> Online Randevu
                        </a>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Education Tab */}
              {activeTab === 'education' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <h2 className="text-2xl font-semibold text-primary mb-6 flex items-center">
                        <FaGraduationCap className="mr-3" /> Eğitim Bilgileri
                      </h2>
                      <div className="relative border-l-2 border-primary/20 pl-8 pb-8">
                        {doctor.education.map((edu, index) => (
                          <div key={index} className="mb-8 relative">
                            <div className="absolute -left-10 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                              <div className="w-3 h-3 rounded-full bg-white"></div>
                            </div>
                            <div className="card">
                              <h3 className="font-semibold text-lg mb-1">{edu.degree}</h3>
                              <p className="text-text-light">{edu.institution}</p>
                              <p className="text-sm text-text-light mt-2">{edu.year}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h2 className="text-2xl font-semibold text-primary mb-6 flex items-center">
                        <i className="bi bi-briefcase-fill mr-3"></i> İş Deneyimi
                      </h2>
                      <div className="relative border-l-2 border-primary/20 pl-8 pb-8">
                        {doctor.experience.map((exp, index) => (
                          <div key={index} className="mb-8 relative">
                            <div className="absolute -left-10 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                              <div className="w-3 h-3 rounded-full bg-white"></div>
                            </div>
                            <div className="card">
                              <h3 className="font-semibold text-lg mb-1">{exp.position}</h3>
                              <p className="text-text-light">{exp.institution}</p>
                              <p className="text-sm text-text-light mt-2">{exp.years}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Specialties Tab */}
              {activeTab === 'specialties' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <h2 className="text-2xl font-semibold text-primary mb-6">Uzmanlık Alanları</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {doctor.specialties.map((specialty, index) => (
                      <div key={index} className="card p-6 flex items-start">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mr-4 flex-shrink-0">
                          <i className="bi bi-heart-pulse-fill text-xl text-primary"></i>
                        </div>
                        <div>
                          <h3 className="font-semibold mb-2">{specialty}</h3>
                          <p className="text-sm text-text-light">
                            {doctor.name}, {specialty} konusunda uzmanlaşmıştır.
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-12">
                    <h2 className="text-2xl font-semibold text-primary mb-6">Tedavi Ettiği Hastalıklar</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div className="flex items-center p-3 bg-neutral rounded-lg">
                        <i className="bi bi-heart-pulse-fill text-primary mr-3"></i>
                        <span className="text-text-light">Koroner Arter Hastalığı</span>
                      </div>
                      <div className="flex items-center p-3 bg-neutral rounded-lg">
                        <i className="bi bi-heart-fill text-primary mr-3"></i>
                        <span className="text-text-light">Kalp Yetmezliği</span>
                      </div>
                      <div className="flex items-center p-3 bg-neutral rounded-lg">
                        <i className="bi bi-heart text-primary mr-3"></i>
                        <span className="text-text-light">Kalp Kapak Hastalıkları</span>
                      </div>
                      <div className="flex items-center p-3 bg-neutral rounded-lg">
                        <i className="bi bi-activity text-primary mr-3"></i>
                        <span className="text-text-light">Ritim Bozuklukları</span>
                      </div>
                      <div className="flex items-center p-3 bg-neutral rounded-lg">
                        <i className="bi bi-graph-up-arrow text-primary mr-3"></i>
                        <span className="text-text-light">Hipertansiyon</span>
                      </div>
                      <div className="flex items-center p-3 bg-neutral rounded-lg">
                        <i className="bi bi-droplet-fill text-primary mr-3"></i>
                        <span className="text-text-light">Damar Hastalıkları</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Publications Tab */}
              {activeTab === 'publications' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <h2 className="text-2xl font-semibold text-primary mb-6 flex items-center">
                        <FaFileMedical className="mr-3" /> Bilimsel Yayınlar
                      </h2>
                      <div className="space-y-4">
                        {doctor.publications.map((pub, index) => (
                          <div key={index} className="card p-4">
                            <h3 className="font-semibold mb-2">{pub.title}</h3>
                            <p className="text-sm text-text-light">{pub.journal}, {pub.year}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h2 className="text-2xl font-semibold text-primary mb-6 flex items-center">
                        <FaAward className="mr-3" /> Ödüller ve Başarılar
                      </h2>
                      <div className="space-y-4">
                        {doctor.awards.map((award, index) => (
                          <div key={index} className="card p-4">
                            <h3 className="font-semibold mb-2">{award.name}</h3>
                            <p className="text-sm text-text-light">{award.institution}, {award.year}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </div>

          {/* Appointment CTA */}
          <div className="mt-12 bg-primary text-white p-8 rounded-xl">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div className="mb-6 md:mb-0 text-center md:text-left">
                <h2 className="text-2xl font-bold mb-2">Hemen Randevu Alın</h2>
                <p className="text-white/80">
                  {doctor.name} ile randevu almak için online randevu sistemimizi kullanabilir veya bizi arayabilirsiniz.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <a
                  href="https://anadoluhastaneleri.kendineiyibak.app/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn bg-accent hover:bg-accent-dark transition-colors"
                >
                  <FaCalendarAlt className="mr-2" /> Online Randevu
                </a>
                <a
                  href="tel:+902121234567"
                  className="btn bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 transition-colors"
                >
                  <i className="bi bi-telephone-fill mr-2"></i> Telefonla Ara
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default DoctorDetailPage;
