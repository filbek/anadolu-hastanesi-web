import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay, Pagination, EffectFade } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/pagination'
import 'swiper/css/effect-fade'
import { FaChevronRight, FaArrowRight, FaCalendarAlt, FaUserMd } from 'react-icons/fa'

const slides = [
  {
    id: 1,
    image: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1920&q=80',
    tag: 'Geleceğin Sağlığı',
    title: 'Sağlığınız İçin\nEn İyi Hizmet',
    subtitle: 'Anadolu Hastaneleri Grubu olarak, yapay zeka destekli teşhis ve uzman kadromuzla yanınızdayız.',
    cta: 'Online Randevu',
    ctaLink: 'https://anadoluhastaneleri.kendineiyibak.app/',
    accent: 'Anadolu Merkez Hastanesi',
  },
  {
    id: 2,
    image: 'https://images.unsplash.com/photo-1504439468489-c8920d796a29?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1920&q=80',
    tag: 'Uzman Kadro',
    title: 'Bilim ve Şefkatle\nİyileştiriyoruz',
    subtitle: 'Alanında dünya çapında üne sahip doktorlarımız ile her branşta yanınızdayız.',
    cta: 'Doktorlarımızı Tanıyın',
    ctaLink: '/doktorlar',
    accent: 'Akademik Kadro',
  },
  {
    id: 3,
    image: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1920&q=80',
    tag: 'Global Standartlar',
    title: 'Sınırları Aşan\nSağlık Hizmeti',
    subtitle: 'Uluslararası hasta hizmetlerimizle dünyanın her yerinden gelen misafirlerimize ev sahipliği yapıyoruz.',
    cta: 'Sağlık Turizmi',
    ctaLink: '/saglik-turizmi',
    accent: 'Uluslararası Hizmet',
  },
]

interface HeroBannerProps {
  dynamicData?: {
    title?: string;
    subtitle?: string;
    image?: string;
  };
}

const HeroBanner = ({ dynamicData }: HeroBannerProps) => {
  const [activeIndex, setActiveIndex] = useState(0)

  // If dynamic data is provided, we can prepend it or override
  // For simplicity and premium look, let's use the dynamic data as the primary slide if available
  const displaySlides = dynamicData?.title ? [
    {
      id: 'dynamic',
      image: dynamicData.image || slides[0].image,
      tag: 'Güncel',
      title: dynamicData.title,
      subtitle: dynamicData.subtitle || '',
      cta: 'Daha Fazla Bilgi',
      ctaLink: '#',
      accent: 'Öne Çıkan'
    },
    ...slides
  ] : slides;

  return (
    <section className="relative h-[85vh] md:h-screen w-full overflow-hidden">
      <Swiper
        modules={[Autoplay, Pagination, EffectFade]}
        effect="fade"
        speed={1500}
        slidesPerView={1}
        pagination={{
          clickable: true,
          renderBullet: (_index, className) => {
            return `<span class="${className} !w-8 !h-1 !rounded-full !bg-white/20 transition-all duration-500"></span>`
          }
        }}
        autoplay={{ delay: 7000, disableOnInteraction: false }}
        onSlideChange={(swiper) => setActiveIndex(swiper.activeIndex)}
        className="h-full w-full"
      >
        {displaySlides.map((slide, index) => (
          <SwiperSlide key={slide.id} className="relative h-full overflow-hidden">
            {/* Background Image with Zoom Effect */}
            <div className="absolute inset-0 overflow-hidden">
              <motion.img
                initial={{ scale: 1.2 }}
                animate={{ scale: activeIndex === index ? 1 : 1.2 }}
                transition={{ duration: 7, ease: "linear" }}
                src={slide.image}
                alt={slide.title}
                className="absolute inset-0 w-full h-full object-cover"
                loading="eager"
                crossOrigin="anonymous"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-slate-900/80 via-slate-900/40 to-transparent z-10" />
              <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-white to-transparent z-10" />
            </div>

            <div className="container-custom relative z-20 h-full flex flex-col justify-center">
              <div className="max-w-3xl">
                <AnimatePresence mode="wait">
                  {activeIndex === index && (
                    <motion.div
                      key={slide.id}
                      initial="hidden"
                      animate="visible"
                      exit="hidden"
                      variants={{
                        visible: { transition: { staggerChildren: 0.1 } }
                      }}
                    >
                      {/* Sub-tag */}
                      <motion.div
                        variants={{
                          hidden: { opacity: 0, x: -20 },
                          visible: { opacity: 1, x: 0 }
                        }}
                        className="flex items-center gap-3 mb-6"
                      >
                        <span className="w-12 h-[2px] bg-accent rounded-full" />
                        <span className="text-accent font-bold uppercase tracking-[0.2em] text-sm">
                          {slide.tag}
                        </span>
                      </motion.div>

                      {/* Main Title */}
                      <motion.h1
                        variants={{
                          hidden: { opacity: 0, y: 30 },
                          visible: { opacity: 1, y: 0 }
                        }}
                        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                        className="text-5xl md:text-7xl lg:text-8xl font-black text-white mb-6 leading-[1.05] whitespace-pre-line"
                      >
                        {slide.title}
                      </motion.h1>

                      {/* Subtitle */}
                      <motion.p
                        variants={{
                          hidden: { opacity: 0, y: 20 },
                          visible: { opacity: 1, y: 0 }
                        }}
                        transition={{ duration: 0.8, delay: 0.3 }}
                        className="text-lg md:text-xl text-white/80 mb-10 max-w-xl leading-relaxed font-medium"
                      >
                        {slide.subtitle}
                      </motion.p>

                      {/* Actions */}
                      <motion.div
                        variants={{
                          hidden: { opacity: 0, y: 20 },
                          visible: { opacity: 1, y: 0 }
                        }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                        className="flex flex-wrap items-center gap-5"
                      >
                        <a
                          href={slide.ctaLink}
                          className="group relative px-8 py-4 bg-primary text-white rounded-full font-bold text-lg overflow-hidden transition-all hover:pr-12 premium-shadow-lg"
                        >
                          <span className="relative z-10">{slide.cta}</span>
                          <span className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all">
                            <FaArrowRight />
                          </span>
                        </a>
                        <button className="px-8 py-4 bg-white/10 backdrop-blur-md text-white border border-white/20 rounded-full font-bold text-lg hover:bg-white/20 transition-all flex items-center gap-3">
                          Hizmetlerimiz <FaChevronRight className="text-sm opacity-50" />
                        </button>
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Floating Info Cards - Bento Style Overlay */}
      <div className="absolute bottom-12 right-0 left-0 z-30 hidden lg:block pointer-events-none">
        <div className="container-custom flex justify-end gap-6">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.8 }}
            className="w-72 glass-modern p-6 pointer-events-auto cursor-pointer group"
          >
            <div className="flex items-center gap-4 mb-3">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary text-xl transition-transform group-hover:scale-110">
                <FaCalendarAlt />
              </div>
              <h3 className="font-bold text-slate-800">Online Randevu</h3>
            </div>
            <p className="text-sm text-slate-500 font-medium">Sıra beklemeden randevunuzu hemen oluşturun.</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.8 }}
            className="w-72 glass-modern p-6 pointer-events-auto cursor-pointer group"
          >
            <div className="flex items-center gap-4 mb-3">
              <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center text-accent text-xl transition-transform group-hover:scale-110">
                <FaUserMd />
              </div>
              <h3 className="font-bold text-slate-800">Doktor Bul</h3>
            </div>
            <p className="text-sm text-slate-500 font-medium">Alanında uzman ekibimizle tanışın.</p>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

export default HeroBanner
