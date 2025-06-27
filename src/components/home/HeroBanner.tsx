import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay, Pagination, EffectFade } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/pagination'
import 'swiper/css/effect-fade'

const slides = [
  {
    id: 1,
    image: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1920&q=80',
    title: 'Sağlığınız İçin En İyi Hizmet',
    subtitle: 'Anadolu Hastaneleri Grubu olarak, sağlığınız için en iyi hizmeti sunmak amacıyla çalışıyoruz.',
    cta: 'Randevu Al',
    ctaLink: 'https://anadoluhastaneleri.kendineiyibak.app/',
    hospital: 'Anadolu Merkez Hastanesi',
  },
  {
    id: 2,
    image: 'https://images.unsplash.com/photo-1504439468489-c8920d796a29?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1920&q=80',
    title: 'Uzman Kadromuzla Yanınızdayız',
    subtitle: 'Alanında uzman doktorlarımız ve modern teknolojimizle sağlığınız için buradayız.',
    cta: 'Doktorlarımız',
    ctaLink: '/doktorlar',
    hospital: 'Anadolu Avrupa Hastanesi',
  },
  {
    id: 3,
    image: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1920&q=80',
    title: 'Sağlık Turizmi',
    subtitle: 'Uluslararası hasta hizmetlerimizle dünya standartlarında sağlık hizmeti sunuyoruz.',
    cta: 'Detaylı Bilgi',
    ctaLink: '/saglik-turizmi',
    hospital: 'Anadolu Uluslararası Hastanesi',
  },
]

const HeroBanner = () => {
  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prevIndex) => (prevIndex + 1) % slides.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  return (
    <section className="relative h-banner md:h-banner w-full mt-16">
      <Swiper
        modules={[Autoplay, Pagination, EffectFade]}
        effect="fade"
        slidesPerView={1}
        pagination={{ clickable: true }}
        autoplay={{ delay: 5000, disableOnInteraction: false }}
        onSlideChange={(swiper) => setActiveIndex(swiper.activeIndex)}
        className="h-full w-full"
      >
        {slides.map((slide) => (
          <SwiperSlide key={slide.id} className="relative h-full">
            <div className="absolute inset-0 bg-black/40 z-10" />
            <img
              src={slide.image}
              alt={slide.title}
              className="absolute inset-0 w-full h-full object-cover"
              loading="lazy"
              crossOrigin="anonymous"
            />
            <div className="container-custom relative z-20 h-full flex flex-col justify-center">
              <div className="max-w-2xl text-white">
                <motion.span
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="inline-block bg-accent px-4 py-1 rounded-full text-sm font-medium mb-4"
                >
                  {slide.hospital}
                </motion.span>
                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4"
                >
                  {slide.title}
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                  className="text-lg md:text-xl text-white/90 mb-8"
                >
                  {slide.subtitle}
                </motion.p>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.6 }}
                  className="flex flex-wrap gap-4"
                >
                  <a
                    href={slide.ctaLink}
                    target={slide.ctaLink.startsWith('http') ? '_blank' : undefined}
                    rel={slide.ctaLink.startsWith('http') ? 'noopener noreferrer' : undefined}
                    className="btn btn-accent"
                  >
                    {slide.cta}
                  </a>
                  <a href="tel:+902121234567" className="btn bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 transition-colors">
                    <i className="bi bi-telephone-fill mr-2"></i> Acil Yardım
                  </a>
                </motion.div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Slide Indicators */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-30 flex space-x-3">
        {slides.map((_, index) => (
          <button
            key={index}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              activeIndex === index ? 'bg-accent w-8' : 'bg-white/50'
            }`}
            onClick={() => setActiveIndex(index)}
            aria-label={`Slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  )
}

export default HeroBanner
