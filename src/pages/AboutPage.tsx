import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Pagination, Autoplay } from 'swiper/modules'
import SectionTitle from '../components/ui/SectionTitle'
import { FaCheck, FaAward, FaUsers, FaHospital, FaUserMd, FaCalendarAlt } from 'react-icons/fa'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'

const AboutPage = () => {
  const milestones = [
    {
      year: '2005',
      title: 'Kuruluş',
      description: 'Anadolu Hastaneleri Grubu, ilk hastanesini İstanbul\'da açtı.',
    },
    {
      year: '2008',
      title: 'Büyüme',
      description: 'İkinci hastanemiz olan Anadolu Avrupa Hastanesi hizmete açıldı.',
    },
    {
      year: '2010',
      title: 'JCI Akreditasyonu',
      description: 'Uluslararası standartlarda sağlık hizmeti sunduğumuzu belgeleyen JCI akreditasyonunu aldık.',
    },
    {
      year: '2012',
      title: 'Anadolu Çocuk Hastanesi',
      description: 'Çocuk sağlığı ve hastalıkları konusunda uzmanlaşmış hastanemizi açtık.',
    },
    {
      year: '2015',
      title: 'Uluslararası Hasta Hizmetleri',
      description: 'Sağlık turizmi alanında hizmet vermeye başladık.',
    },
    {
      year: '2018',
      title: 'Teknolojik Yatırımlar',
      description: 'En son teknoloji tıbbi cihazlarla donanımımızı güçlendirdik.',
    },
    {
      year: '2020',
      title: 'Dijital Dönüşüm',
      description: 'Online randevu sistemi ve dijital hasta takip sistemini hayata geçirdik.',
    },
    {
      year: '2023',
      title: 'Sürdürülebilirlik',
      description: 'Çevre dostu hastane projelerimizi hayata geçirdik.',
    },
  ];

  const values = [
    {
      icon: 'bi-heart-fill',
      title: 'Hasta Odaklılık',
      description: 'Tüm hizmetlerimizde hasta memnuniyetini ve güvenliğini ön planda tutuyoruz.',
    },
    {
      icon: 'bi-shield-check',
      title: 'Güvenilirlik',
      description: 'Güven temelli ilişkiler kurarak, şeffaf ve dürüst bir yaklaşım sergiliyoruz.',
    },
    {
      icon: 'bi-star-fill',
      title: 'Kalite',
      description: 'Sürekli iyileştirme anlayışıyla, en yüksek kalitede sağlık hizmeti sunuyoruz.',
    },
    {
      icon: 'bi-people-fill',
      title: 'Ekip Çalışması',
      description: 'Multidisipliner yaklaşımla, ekip çalışmasına önem veriyoruz.',
    },
    {
      icon: 'bi-lightbulb-fill',
      title: 'Yenilikçilik',
      description: 'Tıp alanındaki gelişmeleri takip ederek, yenilikçi tedavi yöntemleri uyguluyoruz.',
    },
    {
      icon: 'bi-globe',
      title: 'Sosyal Sorumluluk',
      description: 'Topluma ve çevreye karşı sorumluluklarımızın bilincindeyiz.',
    },
  ];

  const stats = [
    {
      icon: <FaHospital />,
      value: '6',
      label: 'Hastane',
    },
    {
      icon: <FaUserMd />,
      value: '500+',
      label: 'Uzman Doktor',
    },
    {
      icon: <FaUsers />,
      value: '2500+',
      label: 'Çalışan',
    },
    {
      icon: <FaCalendarAlt />,
      value: '1M+',
      label: 'Yıllık Hasta',
    },
  ];

  const certifications = [
    {
      name: 'JCI (Joint Commission International)',
      description: 'Uluslararası standartlarda sağlık hizmeti sunduğumuzu belgeleyen akreditasyon.',
      image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=300&q=80',
    },
    {
      name: 'ISO 9001:2015',
      description: 'Kalite yönetim sistemimizin uluslararası standartlara uygunluğunu belgeleyen sertifika.',
      image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=300&q=80',
    },
    {
      name: 'ISO 14001:2015',
      description: 'Çevre yönetim sistemimizin uluslararası standartlara uygunluğunu belgeleyen sertifika.',
      image: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=300&q=80',
    },
    {
      name: 'ISO 45001:2018',
      description: 'İş sağlığı ve güvenliği yönetim sistemimizin uluslararası standartlara uygunluğunu belgeleyen sertifika.',
      image: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=300&q=80',
    },
  ];

  const team = [
    {
      name: 'Prof. Dr. Mehmet Yılmaz',
      title: 'Yönetim Kurulu Başkanı',
      image: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=300&q=80',
    },
    {
      name: 'Prof. Dr. Ayşe Kaya',
      title: 'Tıbbi Direktör',
      image: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=300&q=80',
    },
    {
      name: 'Ali Demir',
      title: 'Genel Müdür',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=300&q=80',
    },
    {
      name: 'Zeynep Şahin',
      title: 'Hemşirelik Hizmetleri Direktörü',
      image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=300&q=80',
    },
  ];

  return (
    <>
      <Helmet>
        <title>Hakkımızda | Anadolu Hastaneleri Grubu</title>
        <meta name="description" content="Anadolu Hastaneleri Grubu hakkında bilgi alın. Tarihçemiz, misyonumuz, vizyonumuz ve değerlerimiz." />
      </Helmet>

      <div className="pt-24 pb-12">
        {/* Hero Section */}
        <div className="relative h-[400px]">
          <div className="absolute inset-0">
            <img
              src="https://images.unsplash.com/photo-1586773860418-d37222d8fce3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1920&q=80"
              alt="Anadolu Hastaneleri Grubu"
              className="w-full h-full object-cover"
              loading="lazy"
              crossOrigin="anonymous"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-black/30" />
          </div>
          <div className="container-custom relative h-full flex flex-col justify-center">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-4xl md:text-5xl font-bold text-white mb-4"
            >
              Hakkımızda
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-white/90 text-lg max-w-3xl"
            >
              Anadolu Hastaneleri Grubu olarak, 2005 yılından bu yana sağlık sektöründe hizmet vermekteyiz. Modern teknolojimiz, uzman kadromuz ve hasta odaklı yaklaşımımızla sağlığınız için buradayız.
            </motion.p>
          </div>
        </div>

        {/* About Us */}
        <section className="py-20">
          <div className="container-custom">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <h2 className="text-3xl font-bold text-primary mb-6">Biz Kimiz?</h2>
                <p className="text-text-light mb-6">
                  Anadolu Hastaneleri Grubu, 2005 yılında İstanbul'da kurulmuş olup, bugün Türkiye'nin önde gelen sağlık kuruluşlarından biridir. 6 hastane, 500'den fazla uzman doktor ve 2500'den fazla çalışanımızla, yılda 1 milyondan fazla hastaya hizmet vermekteyiz.
                </p>
                <p className="text-text-light mb-6">
                  Modern teknoloji, uzman kadro ve hasta odaklı yaklaşımımızla, sağlık sektöründe fark yaratmaya devam ediyoruz. JCI akreditasyonu ve ISO sertifikalarımızla, uluslararası standartlarda sağlık hizmeti sunuyoruz.
                </p>
                <p className="text-text-light mb-6">
                  Anadolu Hastaneleri Grubu olarak, sadece hastalıkları tedavi etmekle kalmıyor, aynı zamanda koruyucu sağlık hizmetleri ve sağlıklı yaşam konusunda da toplumu bilinçlendirmeyi amaçlıyoruz.
                </p>
                <div className="flex flex-wrap gap-4">
                  <a href="#mission" className="btn btn-primary">
                    Misyon ve Vizyon
                  </a>
                  <a href="#values" className="btn btn-outline">
                    Değerlerimiz
                  </a>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="relative"
              >
                <div className="relative z-10">
                  <img
                    src="https://images.unsplash.com/photo-1504439468489-c8920d796a29?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80"
                    alt="Anadolu Hastaneleri Grubu"
                    className="w-full h-auto rounded-xl shadow-lg"
                    loading="lazy"
                    crossOrigin="anonymous"
                  />
                </div>
                <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-accent rounded-xl z-0"></div>
                <div className="absolute -top-6 -left-6 w-32 h-32 bg-primary rounded-xl z-0"></div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="py-16 bg-primary text-white">
          <div className="container-custom">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="text-center"
                >
                  <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center text-2xl mx-auto mb-4">
                    {stat.icon}
                  </div>
                  <h3 className="text-4xl font-bold mb-2">{stat.value}</h3>
                  <p className="text-white/80">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Mission and Vision */}
        <section id="mission" className="py-20">
          <div className="container-custom">
            <SectionTitle
              title="Misyon ve Vizyon"
              subtitle="Anadolu Hastaneleri Grubu olarak, misyonumuz ve vizyonumuz doğrultusunda hareket ediyoruz."
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="card p-8"
              >
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                  <i className="bi bi-bullseye text-2xl text-primary"></i>
                </div>
                <h3 className="text-2xl font-semibold text-primary mb-4">Misyonumuz</h3>
                <p className="text-text-light mb-6">
                  Anadolu Hastaneleri Grubu olarak misyonumuz, modern tıp teknolojisi ve uzman kadromuzla, hasta odaklı, kaliteli ve güvenilir sağlık hizmeti sunmaktır. Hastalarımızın sağlığını ve memnuniyetini ön planda tutarak, etik değerlerden ödün vermeden, sürekli gelişim anlayışıyla hareket etmekteyiz.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <FaCheck className="text-accent mt-1 mr-2 flex-shrink-0" />
                    <span className="text-text-light">Kaliteli ve güvenilir sağlık hizmeti sunmak</span>
                  </li>
                  <li className="flex items-start">
                    <FaCheck className="text-accent mt-1 mr-2 flex-shrink-0" />
                    <span className="text-text-light">Hasta memnuniyetini ön planda tutmak</span>
                  </li>
                  <li className="flex items-start">
                    <FaCheck className="text-accent mt-1 mr-2 flex-shrink-0" />
                    <span className="text-text-light">Etik değerlerden ödün vermemek</span>
                  </li>
                  <li className="flex items-start">
                    <FaCheck className="text-accent mt-1 mr-2 flex-shrink-0" />
                    <span className="text-text-light">Sürekli gelişim anlayışıyla hareket etmek</span>
                  </li>
                </ul>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="card p-8"
              >
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                  <i className="bi bi-eye text-2xl text-primary"></i>
                </div>
                <h3 className="text-2xl font-semibold text-primary mb-4">Vizyonumuz</h3>
                <p className="text-text-light mb-6">
                  Vizyonumuz, sağlık sektöründe ulusal ve uluslararası alanda öncü ve referans gösterilen bir sağlık kuruluşu olmaktır. Tıp alanındaki gelişmeleri yakından takip ederek, yenilikçi tedavi yöntemlerini uygulamak ve sağlık turizmine katkıda bulunmak hedeflerimiz arasındadır.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <FaCheck className="text-accent mt-1 mr-2 flex-shrink-0" />
                    <span className="text-text-light">Sağlık sektöründe öncü ve referans olmak</span>
                  </li>
                  <li className="flex items-start">
                    <FaCheck className="text-accent mt-1 mr-2 flex-shrink-0" />
                    <span className="text-text-light">Yenilikçi tedavi yöntemlerini uygulamak</span>
                  </li>
                  <li className="flex items-start">
                    <FaCheck className="text-accent mt-1 mr-2 flex-shrink-0" />
                    <span className="text-text-light">Sağlık turizmine katkıda bulunmak</span>
                  </li>
                  <li className="flex items-start">
                    <FaCheck className="text-accent mt-1 mr-2 flex-shrink-0" />
                    <span className="text-text-light">Toplum sağlığını iyileştirmeye katkıda bulunmak</span>
                  </li>
                </ul>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Values */}
        <section id="values" className="py-20 bg-neutral">
          <div className="container-custom">
            <SectionTitle
              title="Değerlerimiz"
              subtitle="Anadolu Hastaneleri Grubu olarak, değerlerimiz doğrultusunda hareket ediyoruz."
            />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-12">
              {values.map((value, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="card p-6"
                >
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <i className={`bi ${value.icon} text-2xl text-primary`}></i>
                  </div>
                  <h3 className="text-xl font-semibold text-primary mb-2">{value.title}</h3>
                  <p className="text-text-light">{value.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Milestones */}
        <section className="py-20">
          <div className="container-custom">
            <SectionTitle
              title="Kilometre Taşları"
              subtitle="Anadolu Hastaneleri Grubu'nun kuruluşundan bugüne kadar olan yolculuğu."
            />

            <div className="relative mt-12">
              <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-1 bg-primary/20 -translate-x-1/2"></div>
              <div className="space-y-12">
                {milestones.map((milestone, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className={`flex flex-col ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} items-center gap-8`}
                  >
                    <div className="md:w-1/2 relative">
                      <div className={`card p-6 ${index % 2 === 0 ? 'text-right' : 'text-left'}`}>
                        <div className="absolute hidden md:block top-1/2 -translate-y-1/2 w-8 h-1 bg-primary/20 z-10 right-0 md:right-0 md:left-auto"></div>
                        <h3 className="text-2xl font-semibold text-primary mb-2">{milestone.title}</h3>
                        <p className="text-text-light">{milestone.description}</p>
                      </div>
                    </div>
                    <div className="md:w-0 relative">
                      <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white font-bold relative z-20">
                        {milestone.year}
                      </div>
                    </div>
                    <div className="md:w-1/2"></div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Certifications */}
        <section className="py-20 bg-neutral">
          <div className="container-custom">
            <SectionTitle
              title="Kalite Belgeleri"
              subtitle="Anadolu Hastaneleri Grubu olarak, kalite standartlarımızı belgeleyen sertifikalarımız."
            />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mt-12">
              {certifications.map((certification, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="card overflow-hidden group"
                >
                  <div className="h-48 -mx-6 -mt-6 mb-6 overflow-hidden">
                    <img
                      src={certification.image}
                      alt={certification.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      loading="lazy"
                      crossOrigin="anonymous"
                    />
                  </div>
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                      <FaAward className="text-primary" />
                    </div>
                    <h3 className="font-semibold">{certification.name}</h3>
                  </div>
                  <p className="text-text-light text-sm">{certification.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Leadership Team */}
        <section className="py-20">
          <div className="container-custom">
            <SectionTitle
              title="Yönetim Ekibimiz"
              subtitle="Anadolu Hastaneleri Grubu'nun başarısının arkasındaki liderler."
            />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mt-12">
              {team.map((member, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="card overflow-hidden text-center group"
                >
                  <div className="h-64 -mx-6 -mt-6 mb-6 overflow-hidden">
                    <img
                      src={member.image}
                      alt={member.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      loading="lazy"
                      crossOrigin="anonymous"
                    />
                  </div>
                  <h3 className="text-xl font-semibold text-primary mb-1">{member.name}</h3>
                  <p className="text-text-light">{member.title}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-20 bg-primary text-white">
          <div className="container-custom">
            <SectionTitle
              title="Hasta Yorumları"
              subtitle="Hastalarımızın deneyimleri ve memnuniyetleri bizim için çok değerli."
              light
            />

            <Swiper
              modules={[Navigation, Pagination, Autoplay]}
              spaceBetween={30}
              slidesPerView={1}
              navigation
              pagination={{ clickable: true }}
              autoplay={{ delay: 5000, disableOnInteraction: false }}
              className="mt-12"
            >
              <SwiperSlide>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 text-center max-w-3xl mx-auto">
                  <div className="w-20 h-20 rounded-full overflow-hidden mx-auto mb-6">
                    <img
                      src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&q=80"
                      alt="Ayşe Yılmaz"
                      className="w-full h-full object-cover"
                      loading="lazy"
                      crossOrigin="anonymous"
                    />
                  </div>
                  <p className="text-xl italic mb-6">
                    "Anadolu Hastanesi'nde geçirdiğim ameliyat sürecinde tüm doktor ve hemşireler çok ilgiliydi. Özellikle Prof. Dr. Ahmet Yılmaz'a teşekkür ederim. Profesyonel yaklaşımı ve ilgisi için minnettarım."
                  </p>
                  <h3 className="font-semibold text-lg">Ayşe Yılmaz</h3>
                  <p className="text-white/80">Anadolu Merkez Hastanesi</p>
                </div>
              </SwiperSlide>
              <SwiperSlide>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 text-center max-w-3xl mx-auto">
                  <div className="w-20 h-20 rounded-full overflow-hidden mx-auto mb-6">
                    <img
                      src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&q=80"
                      alt="Mehmet Kaya"
                      className="w-full h-full object-cover"
                      loading="lazy"
                      crossOrigin="anonymous"
                    />
                  </div>
                  <p className="text-xl italic mb-6">
                    "Çocuğumun tedavisi için gittiğimiz Anadolu Çocuk Hastanesi'nde aldığımız hizmet mükemmeldi. Doktorumuz Uzm. Dr. Zeynep Şahin'in sabırlı ve anlayışlı yaklaşımı bizi çok rahatlattı."
                  </p>
                  <h3 className="font-semibold text-lg">Mehmet Kaya</h3>
                  <p className="text-white/80">Anadolu Çocuk Hastanesi</p>
                </div>
              </SwiperSlide>
              <SwiperSlide>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 text-center max-w-3xl mx-auto">
                  <div className="w-20 h-20 rounded-full overflow-hidden mx-auto mb-6">
                    <img
                      src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&q=80"
                      alt="Zeynep Demir"
                      className="w-full h-full object-cover"
                      loading="lazy"
                      crossOrigin="anonymous"
                    />
                  </div>
                  <p className="text-xl italic mb-6">
                    "Anadolu Avrupa Hastanesi'nde check-up yaptırdım. Tüm süreç çok hızlı ve profesyonelce ilerledi. Sonuçlarımı aynı gün alabildim ve doktorum detaylı bir şekilde açıkladı."
                  </p>
                  <h3 className="font-semibold text-lg">Zeynep Demir</h3>
                  <p className="text-white/80">Anadolu Avrupa Hastanesi</p>
                </div>
              </SwiperSlide>
            </Swiper>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20">
          <div className="container-custom">
            <div className="bg-primary text-white p-12 rounded-2xl">
              <div className="max-w-3xl mx-auto text-center">
                <h2 className="text-3xl font-bold mb-6">Sağlığınız İçin Yanınızdayız</h2>
                <p className="text-white/80 text-lg mb-8">
                  Anadolu Hastaneleri Grubu olarak, sağlığınız için en iyi hizmeti sunmak amacıyla çalışıyoruz. Modern teknolojimiz, uzman kadromuz ve hasta odaklı yaklaşımımızla yanınızdayız.
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                  <a
                    href="https://randevu.anadoluhastaneleri.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn bg-accent hover:bg-accent-dark transition-colors"
                  >
                    Online Randevu
                  </a>
                  <a
                    href="/iletisim"
                    className="btn bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 transition-colors"
                  >
                    İletişime Geçin
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default AboutPage;
