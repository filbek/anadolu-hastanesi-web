import { useState, useRef, useMemo } from 'react'
import { motion, useInView, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import SectionTitle from '../ui/SectionTitle'
import { FaChevronLeft, FaChevronRight, FaQuoteLeft } from 'react-icons/fa'
import { useTestimonials } from '../../hooks/useTestimonials'

interface TestimonialItem {
  id: number
  name: string
  image?: string
  text: string
  treatment?: string
  hospital?: string
}

const TestimonialsSection = () => {
  const { t } = useTranslation()
  const { data: dbItems } = useTestimonials()

  const fallbackTestimonials: TestimonialItem[] = useMemo(() => [
    {
      id: 1,
      name: 'Ayşe Yılmaz',
      image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80',
      text: t('home.testimonial1Text', 'Anadolu Hastanesi\'nde geçirdiğim ameliyat sürecinde tüm doktor ve hemşireler çok ilgiliydi. Profesyonel yaklaşım ve sıcak ilgi için minnettarım.'),
      treatment: t('home.testimonial1Treatment', 'Kalp Cerrahisi'),
      hospital: t('home.testimonial1Hospital', 'Anadolu Merkez Hastanesi'),
    },
    {
      id: 2,
      name: 'Mehmet Kaya',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80',
      text: t('home.testimonial2Text', 'Çocuğumun tedavisi için gittiğimiz Anadolu Çocuk Hastanesi\'nde aldığımız hizmet mükemmeldi. Sabırlı ve anlayışlı doktorlarımız bizi çok rahatlattı.'),
      treatment: t('home.testimonial2Treatment', 'Çocuk Sağlığı'),
      hospital: t('home.testimonial2Hospital', 'Anadolu Çocuk Hastanesi'),
    },
    {
      id: 3,
      name: 'Zeynep Demir',
      image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80',
      text: t('home.testimonial3Text', 'Check-up yaptırdım. Tüm süreç çok hızlı ve profesyonelce ilerledi. Sonuçlarımı aynı gün alabildim ve doktorum detaylı bir şekilde açıkladı.'),
      treatment: t('home.testimonial3Treatment', 'Check-up'),
      hospital: t('home.testimonial3Hospital', 'Anadolu Avrupa Hastanesi'),
    },
    {
      id: 4,
      name: 'Ali Yıldız',
      image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80',
      text: t('home.testimonial4Text', 'Kalp rahatsızlığım için tedavi edildim. Kendisi ve ekibi çok ilgili ve profesyoneldi. Şimdi kendimi çok daha iyi hissediyorum.'),
      treatment: t('home.testimonial4Treatment', 'Kardiyoloji'),
      hospital: t('home.testimonial4Hospital', 'Anadolu Merkez Hastanesi'),
    },
  ], [t])

  function mapDbTestimonials(dbItems: any[]): TestimonialItem[] {
    if (!dbItems || dbItems.length === 0) return []
    return dbItems.map((item) => ({
      id: item.id,
      name: item.name || '',
      image: item.image,
      text: item.comment || '',
      treatment: item.title || '',
      hospital: t('home.hospitalGroup', 'Anadolu Hastaneleri Grubu'),
    }))
  }

  const testimonials = useMemo(() => {
    const db = mapDbTestimonials(dbItems || [])
    return db.length > 0 ? db : fallbackTestimonials
  }, [dbItems, fallbackTestimonials])

  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.2 })
  const [activeIndex, setActiveIndex] = useState(0)

  const next = () => setActiveIndex((prev) => (prev + 1) % testimonials.length)
  const prev = () => setActiveIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length)

  const active = testimonials[activeIndex]

  if (!active) return null

  return (
    <section className="py-20 md:py-28 bg-surface relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[400px] text-primary-600/[0.02] font-display font-black select-none pointer-events-none">
        &quot;
      </div>

      <div className="container-custom relative z-10" ref={ref}>
        <SectionTitle
          label={t('home.testimonialsLabel', 'Hasta Deneyimleri')}
          title={t('home.testimonialsTitle', 'Hasta Yorumları')}
          subtitle={t('home.testimonialsSubtitle', 'Hastalarımızın deneyimleri ve memnuniyetleri bizim için çok değerli.')}
        />

        <motion.div
          initial={false}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="mt-12 max-w-4xl mx-auto"
        >
          {/* Quote Card */}
          <div className="relative bg-white rounded-3xl p-8 md:p-12 shadow-card">
            <FaQuoteLeft className="text-4xl text-ocean-200 mb-6" />

            <AnimatePresence mode="wait">
              <motion.div
                key={activeIndex}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <p className="text-lg md:text-xl text-neutral-700 leading-relaxed mb-8 font-body">
                  &ldquo;{active.text}&rdquo;
                </p>

                <div className="flex items-center gap-4">
                  {active.image ? (
                    <img
                      src={active.image}
                      alt={active.name}
                      className="w-14 h-14 rounded-full object-cover ring-2 ring-ocean-100"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-full bg-ocean-100 flex items-center justify-center text-ocean-500 font-bold text-lg ring-2 ring-ocean-100">
                      {active.name.charAt(0)}
                    </div>
                  )}
                  <div>
                    <h4 className="font-display font-semibold text-primary-600">
                      {active.name}
                    </h4>
                    <p className="text-sm text-neutral-500">
                      {active.treatment}
                      {active.treatment && active.hospital ? ' · ' : ''}
                      {active.hospital}
                    </p>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Navigation */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-neutral-100">
              <div className="flex gap-2">
                {testimonials.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveIndex(i)}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      i === activeIndex ? 'w-8 bg-coral-500' : 'w-2 bg-neutral-200 hover:bg-neutral-300'
                    }`}
                  />
                ))}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={prev}
                  className="w-10 h-10 rounded-full bg-surface flex items-center justify-center text-neutral-500 hover:bg-primary-600 hover:text-white transition-all duration-200"
                >
                  <FaChevronLeft className="text-xs" />
                </button>
                <button
                  onClick={next}
                  className="w-10 h-10 rounded-full bg-surface flex items-center justify-center text-neutral-500 hover:bg-primary-600 hover:text-white transition-all duration-200"
                >
                  <FaChevronRight className="text-xs" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default TestimonialsSection
