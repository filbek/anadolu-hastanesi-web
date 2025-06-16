import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Pagination, Autoplay } from 'swiper/modules'
import SectionTitle from '../components/ui/SectionTitle'
import { FaGlobe, FaHotel, FaPlane, FaUserMd, FaHeartbeat, FaWheelchair, FaCheck, FaEnvelope, FaWhatsapp } from 'react-icons/fa'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'

const HealthTourismPage = () => {
  const services = [
    {
      icon: <FaGlobe />,
      title: 'Çok Dilli Hizmet',
      description: 'İngilizce, Almanca, Arapça, Rusça ve daha birçok dilde hizmet sunuyoruz.',
    },
    {
      icon: <FaHotel />,
      title: 'Konaklama Desteği',
      description: 'Tedavi süreciniz boyunca konaklama ihtiyaçlarınız için destek sağlıyoruz.',
    },
    {
      icon: <FaPlane />,
      title: 'Transfer Hizmetleri',
      description: 'Havalimanı-hastane-otel arasında özel transfer hizmetleri sunuyoruz.',
    },
    {
      icon: <FaUserMd />,
      title: 'Uzman Doktorlar',
      description: 'Alanında uzman ve uluslararası deneyime sahip doktorlarımızla hizmetinizdeyiz.',
    },
    {
      icon: <FaHeartbeat />,
      title: 'Modern Teknoloji',
      description: 'En son teknoloji tıbbi cihazlar ve tedavi yöntemleri kullanıyoruz.',
    },
    {
      icon: <FaWheelchair />,
      title: 'Hasta Refakatçi Desteği',
      description: 'Tedavi sürecinizde size ve refakatçinize özel destek sağlıyoruz.',
    },
  ];

  const treatments = [
    {
      title: 'Kardiyoloji',
      icon: 'bi-heart-pulse-fill',
      procedures: ['Koroner Anjiyografi', 'Stent Uygulaması', 'Kalp Pili Takılması', 'Kalp Kapak Ameliyatları'],
    },
    {
      title: 'Ortopedi',
      icon: 'bi-person-standing',
      procedures: ['Diz Protezi', 'Kalça Protezi', 'Omurga Cerrahisi', 'Spor Yaralanmaları'],
    },
    {
      title: 'Göz Hastalıkları',
      icon: 'bi-eye-fill',
      procedures: ['LASIK Ameliyatı', 'Katarakt Ameliyatı', 'Retina Tedavileri', 'Göz Kapağı Estetiği'],
    },
    {
      title: 'Plastik Cerrahi',
      icon: 'bi-scissors',
      procedures: ['Yüz Germe', 'Burun Estetiği', 'Meme Estetiği', 'Liposuction'],
    },
    {
      title: 'Diş Tedavileri',
      icon: 'bi-emoji-smile-fill',
      procedures: ['İmplant', 'Zirkonyum Kaplama', 'Gülüş Tasarımı', 'Ortodonti'],
    },
    {
      title: 'Saç Ekimi',
      icon: 'bi-person-fill',
      procedures: ['FUE Tekniği', 'DHI Tekniği', 'Saç Mezoterapisi', 'PRP Tedavisi'],
    },
  ];

  const testimonials = [
    {
      name: 'John Smith',
      country: 'United Kingdom',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&q=80',
      text: 'I had my heart surgery at Anadolu Hospitals and I am extremely satisfied with the results. The doctors and staff were very professional and caring. The facilities were modern and clean. I would highly recommend Anadolu Hospitals to anyone seeking medical treatment in Turkey.',
      treatment: 'Kalp Ameliyatı',
    },
    {
      name: 'Maria Rodriguez',
      country: 'Spain',
      image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&q=80',
      text: 'My experience with Anadolu Hospitals for my knee replacement surgery was exceptional. From the initial consultation to the post-operative care, everything was handled with utmost professionalism. The hospital arranged my accommodation and transportation, which made my stay in Turkey very comfortable.',
      treatment: 'Diz Protezi',
    },
    {
      name: 'Ahmed Al-Farsi',
      country: 'United Arab Emirates',
      image: 'https://images.unsplash.com/photo-1566753323558-f4e0952af115?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&q=80',
      text: 'I came to Anadolu Hospitals for dental treatment and I am very happy with the results. The dental team was highly skilled and used the latest technology. The international patient services team was very helpful and made my stay in Turkey enjoyable. I would definitely come back for any future treatments.',
      treatment: 'Diş Tedavisi',
    },
  ];

  const faqItems = [
    {
      question: 'Sağlık turizmi için Türkiye\'ye nasıl gelebilirim?',
      answer: 'Türkiye\'ye sağlık turizmi için gelmek isteyen hastalar, öncelikle bizimle iletişime geçerek tedavi planı ve randevu alabilirler. Vize işlemleri için gerekli davet mektubu ve sağlık raporlarını sağlıyoruz. Ayrıca, havalimanı transferi, konaklama ve tercüman hizmetleri de sunuyoruz.',
    },
    {
      question: 'Tedavi sürecim ne kadar sürer?',
      answer: 'Tedavi süresi, alacağınız tedavinin türüne ve kişisel sağlık durumunuza bağlı olarak değişiklik gösterir. Örneğin, diş tedavileri 3-7 gün, saç ekimi 2-3 gün, ortopedik ameliyatlar 7-14 gün sürebilir. Tedavi planınız oluşturulurken, tahmini süre size bildirilecektir.',
    },
    {
      question: 'Tedavi maliyetleri nedir?',
      answer: 'Tedavi maliyetleri, alacağınız tedavinin türüne, kapsamına ve süresine göre değişiklik gösterir. Bizimle iletişime geçtiğinizde, tedavi planınıza özel detaylı bir fiyat teklifi sunuyoruz. Genel olarak, Türkiye\'deki sağlık hizmetleri, Avrupa ve Amerika\'daki fiyatlara göre %50-70 daha ekonomiktir.',
    },
    {
      question: 'Konaklama ve ulaşım hizmetleri sağlıyor musunuz?',
      answer: 'Evet, uluslararası hastalarımız için konaklama ve ulaşım hizmetleri sunuyoruz. Havalimanı transferleri, hastane-otel transferleri ve şehir içi ulaşım için araç tahsis ediyoruz. Ayrıca, anlaşmalı otellerimizde özel indirimli konaklama imkanı sağlıyoruz.',
    },
    {
      question: 'Tercüman hizmeti var mı?',
      answer: 'Evet, uluslararası hastalarımız için İngilizce, Almanca, Arapça, Rusça ve daha birçok dilde tercüman hizmeti sunuyoruz. Tedavi süreciniz boyunca, doktor görüşmelerinde ve hastane işlemlerinde size yardımcı olacak bir tercüman tahsis ediyoruz.',
    },
    {
      question: 'Tedavi sonrası takip nasıl yapılıyor?',
      answer: 'Tedavi sonrası takip, tedavinin türüne göre değişiklik gösterir. Ülkenize döndükten sonra, düzenli olarak durumunuzu kontrol ediyor ve gerekli tavsiyelerde bulunuyoruz. Ayrıca, ihtiyaç duyulması halinde, ülkenizdeki partner sağlık kuruluşlarımız aracılığıyla takip muayeneleri düzenliyoruz.',
    },
  ];

  return (
    <>
      <Helmet>
        <title>Sağlık Turizmi | Anadolu Hastaneleri Grubu</title>
        <meta name="description" content="Anadolu Hastaneleri Grubu olarak, dünya standartlarında sağlık hizmetleri sunuyoruz. Uluslararası hasta hizmetlerimiz, konaklama ve transfer desteğimiz ile sağlık turizmi için ideal bir seçimiz." />
      </Helmet>

      <div className="pt-24 pb-12">
        {/* Hero Section */}
        <div className="relative h-[500px]">
          <div className="absolute inset-0">
            <img
              src="https://images.unsplash.com/photo-1631815588090-d4bfec5b1ccb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1920&q=80"
              alt="Sağlık Turizmi"
              className="w-full h-full object-cover"
              loading="lazy"
              crossOrigin="anonymous"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-black/30" />
          </div>
          <div className="container-custom relative h-full flex flex-col justify-center">
            <div className="max-w-2xl text-white">
              <motion.span
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="inline-block bg-accent px-4 py-1 rounded-full text-sm font-medium mb-4"
              >
                Anadolu Hastaneleri Grubu
              </motion.span>
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4"
              >
                Sağlık Turizmi
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="text-lg md:text-xl text-white/90 mb-8"
              >
                Dünya standartlarında sağlık hizmetleri için Türkiye'nin önde gelen sağlık kuruluşu. Modern teknolojimiz, uzman doktor kadromuz ve uluslararası standartlardaki tesislerimizle sağlığınız için buradayız.
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
                className="flex flex-wrap gap-4"
              >
                <a
                  href="#contact"
                  className="btn btn-accent"
                >
                  İletişime Geçin
                </a>
                <a
                  href="#services"
                  className="btn bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 transition-colors"
                >
                  Hizmetlerimiz
                </a>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Language Selector */}
        <div className="bg-primary text-white py-4">
          <div className="container-custom">
            <div className="flex items-center justify-center space-x-6">
              <span className="font-medium">Dil Seçin:</span>
              <a href="#" className="hover:text-accent transition-colors">Türkçe</a>
              <a href="#" className="hover:text-accent transition-colors">English</a>
              <a href="#" className="hover:text-accent transition-colors">العربية</a>
              <a href="#" className="hover:text-accent transition-colors">Русский</a>
              <a href="#" className="hover:text-accent transition-colors">Deutsch</a>
            </div>
          </div>
        </div>

        {/* Why Choose Us */}
        <section className="py-20">
          <div className="container-custom">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <SectionTitle
                  title="Neden Bizi Tercih Etmelisiniz?"
                  subtitle="Anadolu Hastaneleri Grubu olarak, uluslararası hastalara en yüksek kalitede sağlık hizmeti sunuyoruz."
                  alignment="left"
                />

                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="text-text-light mb-6"
                >
                  Anadolu Hastaneleri Grubu olarak, dünyanın dört bir yanından gelen hastalara en yüksek kalitede sağlık hizmeti sunuyoruz. Modern teknolojimiz, uzman doktor kadromuz ve uluslararası standartlardaki tesislerimizle sağlığınız için buradayız.
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                  className="space-y-4 mb-8"
                >
                  <div className="flex items-start">
                    <div className="w-6 h-6 rounded-full bg-accent flex items-center justify-center mt-1 mr-3 flex-shrink-0">
                      <FaCheck className="text-white text-xs" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-primary">JCI Akreditasyonu</h3>
                      <p className="text-text-light text-sm">Uluslararası standartlarda sağlık hizmeti sunduğumuzu belgeleyen JCI akreditasyonuna sahibiz.</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="w-6 h-6 rounded-full bg-accent flex items-center justify-center mt-1 mr-3 flex-shrink-0">
                      <FaCheck className="text-white text-xs" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-primary">Uzman Doktor Kadrosu</h3>
                      <p className="text-text-light text-sm">Alanında uzman ve uluslararası deneyime sahip doktorlarımızla hizmet veriyoruz.</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="w-6 h-6 rounded-full bg-accent flex items-center justify-center mt-1 mr-3 flex-shrink-0">
                      <FaCheck className="text-white text-xs" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-primary">Modern Teknoloji</h3>
                      <p className="text-text-light text-sm">En son teknoloji tıbbi cihazlar ve tedavi yöntemleri kullanıyoruz.</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="w-6 h-6 rounded-full bg-accent flex items-center justify-center mt-1 mr-3 flex-shrink-0">
                      <FaCheck className="text-white text-xs" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-primary">Çok Dilli Hizmet</h3>
                      <p className="text-text-light text-sm">İngilizce, Almanca, Arapça, Rusça ve daha birçok dilde hizmet sunuyoruz.</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="w-6 h-6 rounded-full bg-accent flex items-center justify-center mt-1 mr-3 flex-shrink-0">
                      <FaCheck className="text-white text-xs" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-primary">Uygun Fiyatlar</h3>
                      <p className="text-text-light text-sm">Avrupa ve Amerika'daki fiyatlara göre %50-70 daha ekonomik fiyatlarla hizmet veriyoruz.</p>
                    </div>
                  </div>
                </motion.div>
              </div>

              <div className="relative">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.7 }}
                  className="relative z-10"
                >
                  <img
                    src="https://images.unsplash.com/photo-1579684385127-1ef15d508118?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80"
                    alt="Sağlık Turizmi"
                    className="w-full h-auto rounded-xl shadow-lg"
                    loading="lazy"
                    crossOrigin="anonymous"
                  />
                </motion.div>
                <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-accent rounded-xl z-0"></div>
                <div className="absolute -top-6 -left-6 w-32 h-32 bg-primary rounded-xl z-0"></div>
              </div>
            </div>
          </div>
        </section>

        {/* Our Services */}
        <section id="services" className="py-20 bg-neutral">
          <div className="container-custom">
            <SectionTitle
              title="Hizmetlerimiz"
              subtitle="Anadolu Hastaneleri Grubu olarak, uluslararası hastalarımıza geniş bir yelpazede hizmet sunuyoruz."
            />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {services.map((service, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="card flex items-start p-6"
                >
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mr-4 flex-shrink-0 text-primary text-xl">
                    {service.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-primary mb-2">{service.title}</h3>
                    <p className="text-sm text-text-light">{service.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Treatments */}
        <section className="py-20">
          <div className="container-custom">
            <SectionTitle
              title="Tedavi Seçenekleri"
              subtitle="Anadolu Hastaneleri Grubu olarak, birçok farklı alanda tedavi hizmeti sunuyoruz."
            />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {treatments.map((treatment, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="card p-6"
                >
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mr-4">
                      <i className={`bi ${treatment.icon} text-xl text-primary`}></i>
                    </div>
                    <h3 className="text-lg font-semibold text-primary">{treatment.title}</h3>
                  </div>
                  <ul className="space-y-2">
                    {treatment.procedures.map((procedure, idx) => (
                      <li key={idx} className="flex items-center">
                        <div className="w-5 h-5 rounded-full bg-accent/10 flex items-center justify-center mr-2">
                          <FaCheck className="text-accent text-xs" />
                        </div>
                        <span className="text-text-light text-sm">{procedure}</span>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Process */}
        <section className="py-20 bg-primary text-white">
          <div className="container-custom">
            <SectionTitle
              title="Tedavi Süreci"
              subtitle="Anadolu Hastaneleri Grubu'nda tedavi süreciniz nasıl ilerler?"
              light
            />

            <div className="relative">
              <div className="hidden md:block absolute top-1/2 left-0 right-0 h-1 bg-white/20 -translate-y-1/2"></div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5 }}
                  className="relative text-center"
                >
                  <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center text-2xl font-bold mx-auto mb-4 relative z-10">
                    1
                  </div>
                  <h3 className="text-xl font-semibold mb-2">İletişim</h3>
                  <p className="text-white/80 text-sm">
                    Bizimle iletişime geçin ve sağlık durumunuz hakkında bilgi verin.
                  </p>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="relative text-center"
                >
                  <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center text-2xl font-bold mx-auto mb-4 relative z-10">
                    2
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Tedavi Planı</h3>
                  <p className="text-white/80 text-sm">
                    Uzman doktorlarımız tarafından size özel tedavi planı oluşturulur.
                  </p>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                  className="relative text-center"
                >
                  <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center text-2xl font-bold mx-auto mb-4 relative z-10">
                    3
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Seyahat ve Konaklama</h3>
                  <p className="text-white/80 text-sm">
                    Seyahat ve konaklama planlamanızda size yardımcı oluruz.
                  </p>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.6 }}
                  className="relative text-center"
                >
                  <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center text-2xl font-bold mx-auto mb-4 relative z-10">
                    4
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Tedavi ve Takip</h3>
                  <p className="text-white/80 text-sm">
                    Tedaviniz gerçekleştirilir ve sonrasında takip edilir.
                  </p>
                </motion.div>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-20">
          <div className="container-custom">
            <SectionTitle
              title="Hasta Yorumları"
              subtitle="Dünyanın dört bir yanından gelen hastalarımızın deneyimleri"
            />

            <Swiper
              modules={[Navigation, Pagination, Autoplay]}
              spaceBetween={30}
              slidesPerView={1}
              navigation
              pagination={{ clickable: true }}
              autoplay={{ delay: 5000, disableOnInteraction: false }}
              breakpoints={{
                640: {
                  slidesPerView: 1,
                },
                768: {
                  slidesPerView: 2,
                },
                1024: {
                  slidesPerView: 3,
                },
              }}
              className="mt-12"
            >
              {testimonials.map((testimonial, index) => (
                <SwiperSlide key={index}>
                  <div className="bg-white rounded-xl p-6 shadow-card h-full flex flex-col">
                    <div className="flex items-center mb-4">
                      <img
                        src={testimonial.image}
                        alt={testimonial.name}
                        className="w-14 h-14 rounded-full object-cover mr-4"
                        loading="lazy"
                        crossOrigin="anonymous"
                      />
                      <div>
                        <h3 className="font-semibold text-text">{testimonial.name}</h3>
                        <p className="text-xs text-text-light">{testimonial.country}</p>
                      </div>
                    </div>
                    <div className="flex mb-4">
                      {[...Array(5)].map((_, i) => (
                        <i key={i} className="bi bi-star-fill text-accent text-lg"></i>
                      ))}
                    </div>
                    <p className="text-text-light text-sm flex-grow">"{testimonial.text}"</p>
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <p className="text-xs text-text-light">
                        <span className="font-medium text-primary">Tedavi:</span> {testimonial.treatment}
                      </p>
                    </div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-20 bg-neutral">
          <div className="container-custom">
            <SectionTitle
              title="Sık Sorulan Sorular"
              subtitle="Sağlık turizmi hakkında merak ettiğiniz soruların cevapları"
            />

            <div className="max-w-3xl mx-auto mt-12">
              {faqItems.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="mb-4"
                >
                  <details className="group bg-white rounded-xl overflow-hidden">
                    <summary className="flex justify-between items-center p-6 cursor-pointer font-semibold text-primary">
                      {item.question}
                      <i className="bi bi-chevron-down text-primary group-open:rotate-180 transition-transform"></i>
                    </summary>
                    <div className="p-6 pt-0 text-text-light">
                      <p>{item.answer}</p>
                    </div>
                  </details>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Contact */}
        <section id="contact" className="py-20">
          <div className="container-custom">
            <SectionTitle
              title="İletişime Geçin"
              subtitle="Sağlık turizmi hakkında daha fazla bilgi almak için bizimle iletişime geçin"
            />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mt-12">
              <div>
                <h3 className="text-2xl font-semibold text-primary mb-6">Bize Ulaşın</h3>
                <p className="text-text-light mb-8">
                  Sağlık turizmi hakkında daha fazla bilgi almak, tedavi seçeneklerini öğrenmek veya randevu almak için bizimle iletişime geçebilirsiniz. Uzman ekibimiz, size en kısa sürede dönüş yapacaktır.
                </p>

                <div className="space-y-6">
                  <div className="flex items-start">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mr-4 flex-shrink-0">
                      <FaEnvelope className="text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-text mb-1">E-posta</h4>
                      <a href="mailto:international@anadoluhastaneleri.com" className="text-text-light hover:text-primary transition-colors">
                        international@anadoluhastaneleri.com
                      </a>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mr-4 flex-shrink-0">
                      <i className="bi bi-telephone-fill text-primary"></i>
                    </div>
                    <div>
                      <h4 className="font-semibold text-text mb-1">Telefon</h4>
                      <a href="tel:+902121234567" className="text-text-light hover:text-primary transition-colors">
                        +90 212 123 45 67
                      </a>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mr-4 flex-shrink-0">
                      <FaWhatsapp className="text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-text mb-1">WhatsApp</h4>
                      <a href="https://wa.me/902121234567" className="text-text-light hover:text-primary transition-colors">
                        +90 212 123 45 67
                      </a>
                    </div>
                  </div>
                </div>

                <div className="mt-8">
                  <h4 className="font-semibold text-text mb-4">Bizi Takip Edin</h4>
                  <div className="flex space-x-4">
                    <a href="#" className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-colors">
                      <i className="bi bi-facebook"></i>
                    </a>
                    <a href="#" className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-colors">
                      <i className="bi bi-twitter"></i>
                    </a>
                    <a href="#" className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-colors">
                      <i className="bi bi-instagram"></i>
                    </a>
                    <a href="#" className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-colors">
                      <i className="bi bi-linkedin"></i>
                    </a>
                  </div>
                </div>
              </div>

              <div>
                <div className="card">
                  <h3 className="text-2xl font-semibold text-primary mb-6">İletişim Formu</h3>
                  <form className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="name" className="block text-sm font-medium text-text mb-1">Ad Soyad</label>
                        <input
                          type="text"
                          id="name"
                          className="input-field"
                          placeholder="Adınız Soyadınız"
                          required
                        />
                      </div>
                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-text mb-1">E-posta</label>
                        <input
                          type="email"
                          id="email"
                          className="input-field"
                          placeholder="ornek@email.com"
                          required
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-text mb-1">Telefon</label>
                        <input
                          type="tel"
                          id="phone"
                          className="input-field"
                          placeholder="+90 555 123 45 67"
                        />
                      </div>
                      <div>
                        <label htmlFor="country" className="block text-sm font-medium text-text mb-1">Ülke</label>
                        <input
                          type="text"
                          id="country"
                          className="input-field"
                          placeholder="Ülkeniz"
                        />
                      </div>
                    </div>
                    <div>
                      <label htmlFor="treatment" className="block text-sm font-medium text-text mb-1">İlgilendiğiniz Tedavi</label>
                      <select id="treatment" className="input-field">
                        <option value="">Tedavi Seçiniz</option>
                        <option value="kardiyoloji">Kardiyoloji</option>
                        <option value="ortopedi">Ortopedi</option>
                        <option value="goz">Göz Hastalıkları</option>
                        <option value="plastik-cerrahi">Plastik Cerrahi</option>
                        <option value="dis">Diş Tedavileri</option>
                        <option value="sac-ekimi">Saç Ekimi</option>
                        <option value="diger">Diğer</option>
                      </select>
                    </div>
                    <div>
                      <label htmlFor="message" className="block text-sm font-medium text-text mb-1">Mesajınız</label>
                      <textarea
                        id="message"
                        rows={4}
                        className="input-field resize-none"
                        placeholder="Sağlık durumunuz ve tedavi beklentileriniz hakkında bilgi verebilirsiniz."
                        required
                      ></textarea>
                    </div>
                    <div className="flex items-start">
                      <input
                        type="checkbox"
                        id="consent"
                        className="mt-1 mr-2"
                        required
                      />
                      <label htmlFor="consent" className="text-sm text-text-light">
                        Kişisel verilerimin, tarafıma sağlık hizmeti sunulması amacıyla işlenmesine izin veriyorum.
                      </label>
                    </div>
                    <button type="submit" className="btn btn-primary w-full">
                      Gönder
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default HealthTourismPage;
