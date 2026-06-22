import { useState, useEffect, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FaArrowRight, FaCalendarCheck, FaChevronLeft, FaChevronRight, FaPause, FaPlay } from 'react-icons/fa'
import { useTranslation } from 'react-i18next'
import AutoTranslate from '../common/AutoTranslate'
import { useHeroSlides } from '../../hooks/useHeroSlides'

interface SlideData {
  id: number
  badge?: string
  title: string
  highlight?: string
  subtitle: string
  image: string
  ctaText: string
  ctaLink: string
}

interface HeroBannerProps {
  dynamicData?: {
    title?: string
    subtitle?: string
    image?: string
  }
}

/* ═══════════════════════════════════════════
   ANIMATION VARIANTS
   ═══════════════════════════════════════════ */

const bgVariants = {
  enter: { opacity: 0, scale: 1.12 },
  center: {
    opacity: 1,
    scale: 1,
    transition: { duration: 1.8, ease: [0.22, 1, 0.36, 1] },
  },
  exit: {
    opacity: 0,
    scale: 1.03,
    transition: { duration: 1.0, ease: [0.22, 1, 0.36, 1] },
  },
}

const cardVariants = {
  enter: { opacity: 0, y: 50 },
  center: {
    opacity: 1,
    y: 0,
    transition: { duration: 1.0, ease: [0.22, 1, 0.36, 1], delay: 0.15 },
  },
  exit: {
    opacity: 0,
    y: -30,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
}

const childVariants = {
  enter: { opacity: 0, y: 18 },
  center: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.7,
      ease: [0.22, 1, 0.36, 1],
      delay: 0.35 + i * 0.14,
    },
  }),
  exit: { opacity: 0, y: -12, transition: { duration: 0.25 } },
}

const lineReveal = {
  enter: { scaleX: 0, originX: 0 },
  center: {
    scaleX: 1,
    transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.3 },
  },
  exit: { scaleX: 0, originX: 1, transition: { duration: 0.3 } },
}

/* ═══════════════════════════════════════════
   COMPONENT
   ═══════════════════════════════════════════ */
const HeroBanner = ({ dynamicData }: HeroBannerProps) => {
  const { t } = useTranslation()
  const { data: dbSlides, isLoading } = useHeroSlides()

  function mapDbSlides(dbSlides: any[]): SlideData[] {
    if (!dbSlides || dbSlides.length === 0) return []
    return dbSlides.map((s) => ({
      id: s.id,
      badge: s.subtitle ? t('home.heroBadge', 'Anadolu Hastaneleri Grubu') : undefined,
      title: s.title?.split(' ').slice(0, -2).join(' ') || '',
      highlight: s.title?.split(' ').slice(-2).join(' ') || s.title || '',
      subtitle: s.subtitle || '',
      image: s.image || '',
      ctaText: s.button_text || t('home.moreInfo', 'Detaylı Bilgi'),
      ctaLink: s.button_link || '#',
    }))
  }

  const fallbackSlides: SlideData[] = [
    {
      id: 1,
      badge: t('home.heroBadge', 'Anadolu Hastaneleri Grubu'),
      title: t('home.heroTitle1', 'Geleceğin'),
      highlight: t('home.heroHighlight1', 'Sağlığı, Bugün'),
      subtitle: t('home.heroSubtitle1', 'Çeyrek asırlık tecrübemiz, dünya standartlarındaki teknolojimiz ve 150\'yi aşkın uzman kadromuzla sağlığınızın geleceğini şekillendiriyoruz.'),
      image: 'https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=85',
      ctaText: t('home.onlineAppointment', 'Online Randevu Al'),
      ctaLink: 'https://anadoluhastaneleri.kendineiyibak.app/',
    },
    {
      id: 2,
      badge: t('home.heroBadge2', 'JCI Akredite'),
      title: t('home.heroTitle2', 'Sınırsız'),
      highlight: t('home.heroHighlight2', 'Güven, Mükemmellik'),
      subtitle: t('home.heroSubtitle2', 'Joint Commission International akreditasyonu ile uluslararası standartlarda, hasta güvenliği ve kalite yönetiminde zirvedeyiz.'),
      image: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=85',
      ctaText: t('home.qualityStandards', 'Kalite Standartlarımız'),
      ctaLink: '/hakkimizda',
    },
    {
      id: 3,
      badge: t('home.heroBadge3', '7/24 Kesintisiz Hizmet'),
      title: t('home.heroTitle3', 'Her An'),
      highlight: t('home.heroHighlight3', 'Yanınızdayız'),
      subtitle: t('home.heroSubtitle3', 'Gelişmiş acil müdahale ünitelerimiz ve deneyimli kadromuzla gecenin her saati, yaşam kurtarmaya hazırız.'),
      image: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=85',
      ctaText: t('home.emergencyService', 'Acil Servis'),
      ctaLink: '/iletisim',
    },
  ]

  const mappedDbSlides = useMemo(() => mapDbSlides(dbSlides || []), [dbSlides]);

  const slides = useMemo(() => {
    if (dynamicData) {
      return [
        {
          id: 1,
          badge: t('home.heroBadge', 'Anadolu Hastaneleri Grubu'),
          title: dynamicData.title?.split(' ').slice(0, -2).join(' ') || t('home.heroTitle1', 'Geleceğin'),
          highlight: dynamicData.title?.split(' ').slice(-2).join(' ') || t('home.heroHighlight1', 'Sağlığı, Bugün'),
          subtitle:
            dynamicData.subtitle ||
            t('home.heroSubtitle1', 'Çeyrek asırlık tecrübemiz, dünya standartlarındaki teknolojimiz ve 150\'yi aşkın uzman kadromuzla sağlığınızın geleceğini şekillendiriyoruz.'),
          image:
            dynamicData.image ||
            'https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=85',
          ctaText: t('home.onlineAppointment', 'Online Randevu Al'),
          ctaLink: 'https://anadoluhastaneleri.kendineiyibak.app/',
        },
      ]
    }
    return mappedDbSlides.length > 0 ? mappedDbSlides : fallbackSlides
  }, [dynamicData, mappedDbSlides, fallbackSlides, t])

  const [currentSlide, setCurrentSlide] = useState(0)

  const paginate = useCallback(
    (newDirection: number) => {
      setCurrentSlide((prev) => {
        let next = prev + newDirection
        if (next < 0) next = slides.length - 1
        if (next >= slides.length) next = 0
        return next
      })
    },
    [slides.length]
  )

  const goToSlide = useCallback((index: number) => {
    setCurrentSlide(index)
  }, [])

  // Otomatik geçiş duraklatma durumu (WCAG 2.2.2 — Duraklat, Durdur, Gizle)
  const [isPaused, setIsPaused] = useState(false)

  useEffect(() => {
    if (isPaused || slides.length <= 1) return
    const timer = setInterval(() => paginate(1), 8000)
    return () => clearInterval(timer)
  }, [paginate, isPaused, slides.length])

  const slide = slides[currentSlide]

  if (isLoading || !slide) {
    return (
      <section className="relative min-h-[100svh] w-full overflow-hidden bg-primary-950 flex items-center justify-center">
        {/* Deep cinematic gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary-950/95 via-primary-950/80 to-transparent z-[1]" />
        <div className="absolute inset-0 bg-gradient-to-t from-primary-950/90 via-transparent to-primary-900/40 z-[1]" />
        {/* Subtle spinner */}
        <div className="relative z-10 flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-2 border-white/10 border-t-coral-500 animate-spin" />
        </div>
      </section>
    )
  }

  return (
    <section className="relative min-h-[100svh] w-full overflow-hidden bg-primary-900 isolate">
      {/* ═══ Background Image Layer ═══ */}
      <AnimatePresence initial={false} mode="sync">
        <motion.div
          key={`bg-${slide.id}`}
          variants={bgVariants}
          initial="enter"
          animate="center"
          exit="exit"
          className="absolute inset-0"
        >
          <img
            src={slide.image}
            alt={slide.highlight || slide.title}
            className="absolute inset-0 w-full h-full object-cover img-hospital"
            loading="eager"
          />
          {/* Deep cinematic gradient — heavier on left, lighter on right */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary-950/95 via-primary-950/80 to-transparent z-[1]" />
          <div className="absolute inset-0 bg-gradient-to-t from-primary-950/90 via-transparent to-primary-900/40 z-[1]" />
          {/* Subtle vignette */}
          <div
            className="absolute inset-0 z-[1]"
            style={{
              background:
                'radial-gradient(ellipse 80% 60% at 30% 50%, transparent 0%, rgba(6,13,28,0.5) 100%)',
            }}
          />
        </motion.div>
      </AnimatePresence>

      {/* ═══ Ambient floating shapes (more refined) ═══ */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ y: [0, -24, 0], opacity: [0.15, 0.3, 0.15] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-1/3 left-1/5 w-[28rem] h-[28rem] bg-ocean-500/[0.07] rounded-full blur-[100px]"
        />
        <motion.div
          animate={{ y: [0, 28, 0], opacity: [0.08, 0.18, 0.08] }}
          transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
          className="absolute bottom-1/4 right-1/5 w-[32rem] h-[32rem] bg-coral-500/[0.04] rounded-full blur-[120px]"
        />
      </div>

      {/* ═══ Decorative top line ═══ */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent z-20" />

      {/* ═══ Main Content ═══ */}
      <div className="container-custom relative z-10 min-h-[100svh] flex flex-col justify-end pb-24 md:pb-32 pt-36 md:pt-40">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-10">
          {/* ═══ Text Block — Editorial, no heavy card ═══ */}
          <AnimatePresence mode="wait">
            <motion.div
              key={`card-${slide.id}`}
              variants={cardVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="max-w-2xl relative p-6 md:p-8 rounded-3xl"
            >
              {/* Subtle anchor background — glassmorphism */}
              <div className="absolute inset-0 bg-primary-950/40 backdrop-blur-md rounded-3xl -m-4 md:-m-6 z-[-1] border border-white/10" />
              {/* Thin accent line */}
              <motion.div
                variants={lineReveal}
                initial="enter"
                animate="center"
                exit="exit"
                className="w-12 h-[2px] bg-gradient-to-r from-coral-400 to-coral-500 rounded-full mb-8"
              />

              {/* Badge — ultra subtle */}
              {slide.badge && (
                <motion.div
                  custom={0}
                  variants={childVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  className="mb-5"
                >
                  <span className="inline-block text-[11px] md:text-xs font-semibold tracking-[0.2em] uppercase text-coral-400/90">
                    <AutoTranslate text={slide.badge || ''} />
                  </span>
                </motion.div>
              )}

              {/* Title — massive, editorial */}
              <motion.h1
                custom={1}
                variants={childVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="font-display text-[clamp(2.5rem,6vw,4.5rem)] font-extrabold text-white leading-[1.02] tracking-tight drop-shadow-[0_4px_12px_rgba(0,0,0,0.3)]"
              >
                <AutoTranslate text={slide.title} />
                {slide.highlight && (
                  <>
                    <br />
                    <span className="text-coral-500">
                      <AutoTranslate text={slide.highlight} />
                    </span>
                  </>
                )}
                {!slide.highlight && slide.title && (
                  <span className="text-coral-500">
                    <AutoTranslate text={slide.title} />
                  </span>
                )}
              </motion.h1>

              {/* Subtitle — lighter, more refined */}
              <motion.p
                custom={2}
                variants={childVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="mt-6 text-base md:text-lg text-white/90 font-medium leading-relaxed max-w-lg tracking-wide drop-shadow-[0_2px_8px_rgba(0,0,0,0.2)]"
              >
                <AutoTranslate text={slide.subtitle} />
              </motion.p>

              {/* CTAs */}
              <motion.div
                custom={3}
                variants={childVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="flex flex-wrap items-center gap-5 mt-10"
              >
                <a
                  href={slide.ctaLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative inline-flex items-center gap-3 px-8 py-4 bg-white text-primary-900 font-bold text-sm rounded-full overflow-hidden transition-all duration-500 hover:shadow-[0_8px_32px_rgba(227,6,19,0.3)]"
                >
                  {/* Hover fill - Solid Logo Red */}
                  <span className="absolute inset-0 bg-[#E30613] translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]" />
                  <span className="relative flex items-center gap-3 group-hover:text-white transition-colors duration-500">
                    <FaCalendarCheck className="text-sm" />
                    <AutoTranslate text={slide.ctaText} />
                    <FaArrowRight className="text-sm opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500 delay-100" />
                  </span>
                </a>

                <a
                  href="tel:4445058"
                  className="group inline-flex items-center gap-3 text-white/60 hover:text-white text-sm font-medium transition-colors duration-300"
                >
                  <span className="w-10 h-10 rounded-full border border-white/15 flex items-center justify-center group-hover:bg-white/10 group-hover:border-white/25 transition-all duration-300">
                    <FaArrowRight className="text-[10px] rotate-[-45deg]" />
                  </span>
                  <span className="tracking-wide">444 50 58</span>
                </a>
              </motion.div>
            </motion.div>
          </AnimatePresence>

          {/* ═══ Right side — refined counter & nav ═══ */}
          <div className="flex flex-col items-end gap-8">
            {/* Big counter — more subtle */}
            <div className="hidden lg:flex items-baseline gap-2 text-white/[0.08] font-display font-black select-none">
              <AnimatePresence mode="wait">
                <motion.span
                  key={currentSlide}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -16 }}
                  transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  className="text-[5rem] leading-none"
                >
                  {String(currentSlide + 1).padStart(2, '0')}
                </motion.span>
              </AnimatePresence>
              <span className="text-xl text-white/10 font-light">/</span>
              <span className="text-2xl text-white/10">
                {String(slides.length).padStart(2, '0')}
              </span>
            </div>

            {/* Minimal nav arrows */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsPaused((p) => !p)}
                className="w-12 h-12 rounded-full border border-white/10 bg-white/[0.03] backdrop-blur-sm flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all duration-300"
                aria-label={isPaused ? t('home.playSlider', 'Otomatik geçişi başlat') : t('home.pauseSlider', 'Otomatik geçişi duraklat')}
                aria-pressed={isPaused}
              >
                {isPaused ? <FaPlay size={12} aria-hidden="true" /> : <FaPause size={12} aria-hidden="true" />}
              </button>
              <button
                onClick={() => paginate(-1)}
                className="w-12 h-12 rounded-full border border-white/10 bg-white/[0.03] backdrop-blur-sm flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all duration-300"
                aria-label={t('home.prevSlide', 'Önceki slide')}
              >
                <FaChevronLeft size={13} aria-hidden="true" />
              </button>
              <button
                onClick={() => paginate(1)}
                className="w-12 h-12 rounded-full border border-white/10 bg-white/[0.03] backdrop-blur-sm flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all duration-300"
                aria-label={t('home.nextSlide', 'Sonraki slide')}
              >
                <FaChevronRight size={13} aria-hidden="true" />
              </button>
            </div>

            {/* Refined vertical progress bars */}
            <div className="hidden lg:flex flex-col gap-3">
              {slides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className="group flex items-center gap-3 py-1"
                  aria-label={`Slide ${index + 1}`}
                >
                  <span
                    className={`text-[10px] font-bold tracking-wider transition-colors duration-500 ${
                      index === currentSlide ? 'text-white' : 'text-white/20 group-hover:text-white/40'
                    }`}
                  >
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <div className="w-10 h-[2px] rounded-full bg-white/10 overflow-hidden relative">
                    <motion.div
                      className="absolute inset-y-0 left-0 bg-gradient-to-r from-coral-400 to-coral-500 rounded-full"
                      initial={false}
                      animate={{
                        width: index === currentSlide ? '100%' : '0%',
                      }}
                      transition={{
                        duration: index === currentSlide ? 8 : 0.4,
                        ease: 'linear',
                      }}
                    />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ═══ Bottom gradient fade — softer ═══ */}
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[#F7F9FB] to-transparent z-10 pointer-events-none" />

      {/* ═══ Scroll indicator ═══ */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 hidden md:flex flex-col items-center gap-2"
      >
        <span className="text-[10px] font-medium tracking-[0.2em] uppercase text-white/30">
          {t('home.discover', 'Keşfet')}
        </span>
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="w-[1px] h-6 bg-gradient-to-b from-white/30 to-transparent"
        />
      </motion.div>
    </section>
  )
}

export default HeroBanner
