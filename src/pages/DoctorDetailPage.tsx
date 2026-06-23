import { useParams, Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { FaCalendarAlt, FaGraduationCap, FaHospital, FaStethoscope, FaAward, FaFileMedical, FaPhone, FaClock } from 'react-icons/fa'
import { useDoctorDetail } from '../hooks/useDoctors'
import { useLocalizedItem } from '../hooks/useLocalizedList'
import SecondOpinionBanner from '../components/common/SecondOpinionBanner'
import AutoTranslate from '../components/common/AutoTranslate'

const TREATMENTS_BY_DEPT: Record<string, string[]> = {
  'acil-servis': ['Acil Müdahale', 'Travma Tedavisi', 'Yanık Tedavisi', 'Zehirlenme Tedavisi', 'İlk Yardım ve Stabilizasyon'],
  'agiz-ve-dis-sagligi': ['Diş Dolgusu', 'Kanal Tedavisi', 'Diş Eti Tedavisi', 'Protetik Diş Tedavisi', 'Ağız Cerrahisi'],
  'algoloji-agri': ['Kronik Ağrı Tedavisi', 'Bel ve Boyun Ağrısı', 'Migren Tedavisi', 'Kanser Ağrısı Yönetimi', 'Ağrı Enjeksiyonları'],
  'anestezi-ve-reanimasyon': ['Genel Anestezi', 'Epidural Anestezi', 'Sedasyon', 'Ağrı Yönetimi', 'Yoğun Bakım Desteği'],
  'beslenme-ve-diyet': ['Bireysel Beslenme Danışmanlığı', 'Kilo Kontrolü', 'Diyabet Diyeti', 'Sporcu Beslenmesi', 'Hastalıklarda Beslenme Tedavisi'],
  'beyin-ve-sinir-cerrahisi': ['Beyin Tümörü Cerrahisi', 'Omurilik Cerrahisi', 'Epilepsi Cerrahisi', 'Hidrosefali Tedavisi', 'Periferik Sinir Cerrahisi'],
  'biyokimya': ['Kan Tahlili', 'Biyokimyasal Analizler', 'Hormon Testleri', 'Tümör Belirteçleri', 'Genetik Testler'],
  'check-up': ['Kapsamlı Sağlık Taraması', 'Kardiyolojik Check-up', 'Kadın Sağlığı Check-up', 'Erkek Sağlığı Check-up', 'İşe Giriş Check-up'],
  'cocuk-cerrahisi': ['Sünnet', 'Çocuk Hernisi', 'Çocuk Tümörleri', 'Doğumsal Anomaliler', 'Laparoskopik Cerrahi'],
  'cocuk-kardiyoloji': ['Doğumsal Kalp Hastalıkları', 'Ekokardiografi', 'Kalp Kası Hastalıkları', 'Ritim Bozuklukları', 'Kardiyak Kateterizasyon'],
  'cocuk-sagligi-ve-hastaliklari': ['Aşı Takibi', 'Büyüme Gelişme Takibi', 'Çocuk Astımı', 'Çocuk Enfeksiyonları', 'Yenidoğan Bakımı'],
  'cocuk-ve-ergen-ruh-sagligi': ['Dikkat Eksikliği', 'Otizm Spektrum', 'Davranış Bozuklukları', 'Depresyon ve Anksiyete', 'Öğrenme Güçlükleri'],
  'dermatoloji': ['Sivilce ve Akne Tedavisi', 'Egzama Tedavisi', 'Cilt Kanseri Taraması', 'Lazer Tedavileri', 'Estetik Dermatoloji'],
  'diyabet-poliklinigi': ['Tip 1 Diyabet Takibi', 'Tip 2 Diyabet Yönetimi', 'İnsülin Eğitimi', 'Diyabetik Ayak Bakımı', 'Beslenme Danışmanlığı'],
  'el-ve-mikro-cerrahisi': ['El ve Bilek Cerrahisi', 'Sinir Onarımı', 'Tendon Onarımı', 'Mikrocerrahi', 'Replantasyon'],
  'endokrinoloji-ve-metabolizma': ['Tiroid Hastalıkları', 'Diyabet', 'Obezite', 'Hormon Bozuklukları', 'Osteoporoz'],
  'enfeksiyon-hastaliklari-ve-mikrobiyoloji': ['Bakteriyel Enfeksiyonlar', 'Viral Enfeksiyonlar', 'HIV/AIDS', 'Hepatitler', 'Aşı Danışmanlığı'],
  'fizik-tedavi-ve-rehabilitasyon': ['Kas-iskelet Rehabilitasyonu', 'Nörolojik Rehabilitasyon', 'Sporda Rehabilitasyon', 'Manuel Terapi', 'Elektroterapi'],
  'gastroenteroloji': ['Endoskopi', 'Kolonoskopi', 'Mide Hastalıkları', 'Karaciğer Hastalıkları', 'Bağırsak Hastalıkları'],
  'genel-cerrahi': ['Laparoskopik Cerrahi', 'Tiroid Cerrahisi', 'Meme Cerrahisi', 'Safra Kesesi', 'Hernia Ameliyatları'],
  'girisimsel-radyoloji': ['Anjiyografi', 'Biyopsi', 'Damara Stent', 'Ablasyon Tedavileri', 'Varis Tedavisi'],
  'gogus-hastaliklari': ['Astım Tedavisi', 'KOAH', 'Akciğer Kanseri', 'Tüberküloz', 'Uyku Apnesi'],
  'goz-sagligi-ve-hastaliklari': ['Katarakt Ameliyatı', 'Lazer Tedavisi', 'Glokom Tedavisi', 'Retina Cerrahisi', 'Korne Hastalıkları'],
  'ic-hastaliklari-dahiliye': ['Dahiliye Muayenesi', 'Kronik Hastalık Takibi', 'Check-up', 'İç Hastalıkları Teşhis', 'Kan Hastalıkları'],
  'kadin-hastaliklari-ve-dogum': ['Normal Doğum', 'Sezaryen', 'Jinekolojik Cerrahi', 'Tüp Bebek', 'Menopoz Takibi'],
  'kalp-ve-damar-cerrahisi': ['Koroner Bypass', 'Kalp Kapak Cerrahisi', 'Aort Cerrahisi', 'Varis Cerrahisi', 'Damarsal Girişimler'],
  'kardiyoloji': ['Ekokardiografi', 'EKG', 'Holter Takibi', 'Koroner Anjiyografi', 'Stent Uygulamaları'],
  'kulak-burun-bogaz': ['Sinüzit Tedavisi', 'Geniz Eti Ameliyatı', 'Bademcik Ameliyatı', 'İşitme Testleri', 'Kulak Cerrahisi'],
  'medikal-estetik': ['Botoks', 'Dolgu Uygulamaları', 'Mezoterapi', 'Lazer Epilasyon', 'Cilt Gençleştirme'],
  'medikal-onkoloji': ['Kemoterapi', 'İmmünoterapi', 'Hedefe Yönelik Tedavi', 'Palyatif Bakım', 'Kanser Taraması'],
  'nefroloji': ['Dializ', 'Böbrek Taşı Tedavisi', 'Böbrek Hastalıkları', 'Hipertansiyon', 'Böbrek Transplantasyonu'],
  'noroloji': ['Beyin ve Sinir Cerrahisi', 'Epilepsi', 'Felç Tedavisi', 'Migren', 'Parkinson'],
  'ortodonti': ['Tel Tedavisi', 'Şeffaf Plak', 'Çene Ortopedisi', 'Çocuk Ortodontisi', 'Retainer Uygulamaları'],
  'ortopedi-ve-travmatoloji': ['Kemik Kırığı Tedavisi', 'Artroskopi', 'Protez Cerrahisi', 'Omurga Cerrahisi', 'Spor Yaralanmaları'],
  'patoloji': ['Biyopsi İnceleme', 'Sitoloji', 'Moleküler Patoloji', 'İmmünohistokimya', 'Kanser Tanısı'],
  'plastik-rekonstruktif-ve-estetik-cerrahi': ['Burun Estetiği', 'Liposuction', 'Meme Estetiği', 'Yüz Germe', 'Yanık Rekonstrüksiyonu'],
  'psikiyatri': ['Depresyon Tedavisi', 'Anksiyete Bozuklukları', 'Bipolar Bozukluk', 'Şizofreni', 'Bağımlılık Tedavisi'],
  'psikoloji': ['Bireysel Terapi', 'Aile Terapisi', 'Çift Terapisi', 'Travma Tedavisi', 'Stres Yönetimi'],
  'radyoloji': ['Manyetik Rezonans (MR)', 'Bilgisayarlı Tomografi (BT)', 'Röntgen', 'Ultrason', 'Mamografi'],
  'uroloji': ['Böbrek Taşı Tedavisi', 'Prostat Cerrahisi', 'İdrar Kaçırma', 'Erkek Kısırlığı', 'Mesane Kanseri'],
  'yenidogan-yogun-bakim-unitesi': ['Yenidoğan Yoğun Bakım', 'Prematüre Bebek Bakımı', 'Solunum Desteği', 'Fototerapi', 'Gelişim Takibi'],
  'yogun-bakim': ['Genel Yoğun Bakım', 'Kardiyovasküler Yoğun Bakım', 'Nörolojik Yoğun Bakım', 'Solunum Desteği', 'Monitörizasyon'],
}

function getTreatments(deptName: string, deptSlug: string): string[] {
  return TREATMENTS_BY_DEPT[deptSlug] || [
    `${deptName} muayenesi ve teşhisi`,
    `${deptName} takibi ve tedavisi`,
    `${deptName} konsültasyonu`,
    'Modern tanı yöntemleri',
    'Kişiselleştirilmiş tedavi planı',
  ]
}

const DoctorDetailPage = () => {
  const { t } = useTranslation();
  const { slug } = useParams<{ slug: string }>()
  const { data: doctorRaw, isLoading } = useDoctorDetail(slug || '')
  const doctor = useLocalizedItem(doctorRaw, ['title', 'education', 'experience', 'departments.name', 'hospitals.name'])

  if (isLoading) {
    return (
      <div className="pt-24 pb-12 min-h-screen bg-neutral flex justify-center items-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!doctor) {
    return (
      <div className="pt-24 pb-12 min-h-screen bg-neutral">
        <div className="container-custom py-20 text-center">
          <h2 className="text-2xl font-bold mb-4">Doktor Bulunamadı</h2>
          <p className="mb-8">Aradığınız doktor bulunamadı. Lütfen tüm doktorlarımızı görüntüleyin.</p>
          <Link to="/doktorlar" className="btn btn-primary">
            Tüm Doktorlarımız
          </Link>
        </div>
      </div>
    )
  }

  const deptName = (doctor as any).departments?.name || ''
  const deptSlug = (doctor as any).departments?.slug || ''
  const hospitalName = (doctor as any).hospitals?.name || ''
  const hospitalSlug = (doctor as any).hospitals?.slug || ''
  const treatments = getTreatments(deptName, deptSlug)
  const deptDescription = t('doctorDetail.deptDescTemplate', '{{deptName}} birimimizde, alanında uzman hekim kadromuz ve modern tıp teknolojilerimizle hastalarımıza en iyi sağlık hizmetini sunmayı ilke edindik. Teşhis ve tedavi süreçlerinde multidisipliner yaklaşım benimseyerek, her hastamız için kişiselleştirilmiş çözümler üretiyoruz.', { deptName })

  const hasEducation = doctor.education && doctor.education.trim().length > 0
  const hasExperience = doctor.experience && doctor.experience.trim().length > 0

  return (
    <>
      <Helmet>
        <title>{doctor.name} | Anadolu Hastaneleri Grubu</title>
        <meta name="description" content={t('doctorDetail.metaDesc', '{{name}} - {{title}}. {{hospital}} bünyesinde hizmet veren uzman doktorumuz hakkında bilgi alın ve online randevu alın.', { name: doctor.name, title: doctor.title, hospital: hospitalName })} />
      </Helmet>

      {/* Page Banner */}
      <div className="relative pt-24 pb-16 bg-primary overflow-hidden">
        <div className="absolute inset-0 opacity-10" aria-hidden="true">
          <img
            src={doctor.image || 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=1200&q=80'}
            alt=""
            className="w-full h-full object-cover"
          />
        </div>
        <div className="container-custom relative z-10">
          <nav className="text-sm text-white/60 mb-4" aria-label="Sayfa konumu">
            <Link to="/" className="hover:text-white transition-colors">{t('nav.home', 'Anasayfa')}</Link>
            <span className="mx-2">/</span>
            <Link to="/doktorlar" className="hover:text-white transition-colors">{t('nav.doctors', 'Doktorlarımız')}</Link>
            <span className="mx-2">/</span>
            <span className="text-white">{doctor.name}</span>
          </nav>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{doctor.name}</h1>
          <p className="text-white/80 text-lg">{doctor.title} · {deptName}</p>
        </div>
      </div>

      <div className="py-12 bg-neutral">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Sidebar */}
            <div className="lg:col-span-1 space-y-6">
              {/* Doctor Card */}
              <div className="card overflow-hidden -mt-24 relative z-10">
                <div className="aspect-[3/4] overflow-hidden rounded-xl mb-5">
                  <img
                    src={doctor.image}
                    alt={doctor.name}
                    className="w-full h-full object-cover object-top"
                    loading="lazy"
                  />
                </div>
                <h2 className="text-xl font-bold text-primary mb-1">{doctor.name}</h2>
                <p className="text-ocean-600 font-medium text-sm mb-4">{doctor.title}</p>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-3 text-text-light">
                    <FaHospital className="text-ocean-500" />
                    <Link to={`/hastanelerimiz/${hospitalSlug}`} className="hover:text-primary transition-colors">
                      {hospitalName}
                    </Link>
                  </div>
                  <div className="flex items-center gap-3 text-text-light">
                    <FaStethoscope className="text-ocean-500" />
                    <Link to={`/bolumlerimiz/${deptSlug}`} className="hover:text-primary transition-colors">
                      {deptName}
                    </Link>
                  </div>
                  <div className="flex items-center gap-3 text-text-light">
                    <FaPhone className="text-ocean-500" />
                    <a href="tel:4445058" className="hover:text-primary transition-colors">
                      444 50 58
                    </a>
                  </div>
                </div>
                <div className="mt-6 space-y-3">
                  <a
                    href="https://anadoluhastaneleri.kendineiyibak.app/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-coral w-full justify-center"
                  >
                    <FaCalendarAlt className="mr-2" /> {t('onlineAppointment', 'Online Randevu')}
                  </a>
                  <a
                    href="tel:4445058"
                    className="btn btn-outline w-full justify-center"
                  >
                    <FaPhone className="mr-2" /> 444 50 58
                  </a>
                </div>
              </div>

              {/* Contact Card */}
              <div className="card">
                <h3 className="text-lg font-bold text-primary mb-4">{t('common.contactInfo', 'İletişim Bilgileri')}</h3>
                <ul className="space-y-4 text-sm">
                  <li className="flex items-start gap-3">
                    <FaPhone className="text-ocean-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-primary">{t('common.phone', 'Telefon')}</p>
                      <a href="tel:4445058" className="text-text-light hover:text-primary transition-colors">
                        444 50 58
                      </a>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <FaHospital className="text-ocean-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-primary">{t('common.hospital', 'Hastane')}</p>
                      <Link to={`/hastanelerimiz/${hospitalSlug}`} className="text-text-light hover:text-primary transition-colors">
                        {hospitalName}
                      </Link>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <FaClock className="text-ocean-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-primary">{t('common.workingHours', 'Çalışma Saatleri')}</p>
                      <p className="text-text-light">{t('common.weekdays', 'Haftaiçi')}: 08:00 - 17:00</p>
                      <p className="text-text-light">{t('common.weekends', 'Haftasonu')}: 08:30 - 14:00</p>
                    </div>
                  </li>
                </ul>
              </div>
            </div>

            {/* Right Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* About */}
              <div className="card">
                <h3 className="text-xl font-bold text-primary mb-4 flex items-center gap-2">
                  <FaStethoscope className="text-ocean-500" />
                  {t('common.about', 'Hakkında')}
                </h3>
                <p className="text-text-light leading-relaxed mb-6">
                  {deptDescription}
                </p>
                <p className="text-text-light leading-relaxed">
                  {t('doctorDetail.aboutDesc', '{{name}}, {{hospital}} bünyesinde {{dept}} biriminde görev yapmaktadır. Modern teşhis ve tedavi yöntemlerini kullanarak hastalarına en güncel ve etkili sağlık hizmetini sunmaktadır.', { name: doctor.name, hospital: hospitalName, dept: deptName })}
                </p>
              </div>

              {/* Treatments */}
              <div className="card">
                <h3 className="text-xl font-bold text-primary mb-4 flex items-center gap-2">
                  <FaFileMedical className="text-ocean-500" />
                  {t('doctorDetail.treatments', 'Uygulanan Tedaviler')}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {treatments.map((treatment, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-surface rounded-xl">
                      <div className="w-10 h-10 rounded-full bg-ocean-50 flex items-center justify-center flex-shrink-0">
                        <i className="bi bi-check-lg text-ocean-600"></i>
                      </div>
                      <span className="text-sm font-medium text-primary"><AutoTranslate text={treatment} /></span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Education */}
              {hasEducation && (
                <div className="card">
                  <h3 className="text-xl font-bold text-primary mb-4 flex items-center gap-2">
                    <FaGraduationCap className="text-ocean-500" />
                    {t('doctorDetail.education', 'Eğitim ve Deneyim')}
                  </h3>
                  <p className="text-text-light whitespace-pre-line">{doctor.education}</p>
                </div>
              )}

              {/* Experience */}
              {hasExperience && (
                <div className="card">
                  <h3 className="text-xl font-bold text-primary mb-4 flex items-center gap-2">
                    <FaAward className="text-ocean-500" />
                    {t('doctorDetail.experience', 'Mesleki Deneyim')}
                  </h3>
                  <p className="text-text-light whitespace-pre-line">{doctor.experience}</p>
                </div>
              )}

              {/* Empty state for education/experience if not filled */}
              {!hasEducation && !hasExperience && (
                <div className="card bg-surface/50 mb-8">
                  <div className="text-center py-10 px-6">
                    <div className="w-16 h-16 rounded-full bg-surface flex items-center justify-center mx-auto mb-4">
                      <FaGraduationCap className="text-3xl text-ocean-400" />
                    </div>
                    <h3 className="text-xl font-bold text-primary-600 mb-3">{t('doctorDetail.cvTitle', 'Özgeçmiş Bilgileri')}</h3>
                    <p className="text-neutral-500 text-sm max-w-lg mx-auto leading-relaxed">
                      {t('doctorDetail.cvDesc', 'Bu doktorun eğitim, deneyim ve yayın bilgileri yakında eklenecektir. Güncel bilgiler için lütfen hastanemizle iletişime geçiniz.')}
                    </p>
                  </div>
                </div>
              )}

              {/* Appointment CTA */}
              <motion.div
                initial={false}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="rounded-2xl bg-primary-700 text-white p-6 md:p-8"
              >
                <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
                  <div className="text-center lg:text-left">
                    <h3 className="text-lg font-bold mb-1 text-white">{t('common.appointmentNow', 'Hemen Randevu Alın')}</h3>
                    <p className="text-white/80 text-sm max-w-md">
                      {t('doctorDetail.appointmentDesc', '{{name}} ile randevu almak için online randevu sistemimizi kullanabilir veya bizi arayabilirsiniz.', { name: doctor.name })}
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto shrink-0">
                    <a
                      href="https://anadoluhastaneleri.kendineiyibak.app/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-coral-500 hover:bg-coral-600 text-white font-semibold rounded-xl transition-colors whitespace-nowrap"
                    >
                      <FaCalendarAlt /> {t('onlineAppointment', 'Online Randevu')}
                    </a>
                    <a
                      href="tel:4445058"
                      className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white/15 hover:bg-white/25 text-white font-semibold rounded-xl transition-colors whitespace-nowrap"
                    >
                      <FaPhone /> 444 50 58
                    </a>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      <SecondOpinionBanner />
    </>
  )
}

export default DoctorDetailPage
