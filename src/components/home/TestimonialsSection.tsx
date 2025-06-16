import { useState, useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Pagination, Navigation } from 'swiper/modules'
import SectionTitle from '../ui/SectionTitle'
import 'swiper/css'
import 'swiper/css/pagination'
import 'swiper/css/navigation'

const testimonials = [
  {
    id: 1,
    name: 'Ayşe Yılmaz',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&q=80',
    text: 'Anadolu Hastanesi\'nde geçirdiğim ameliyat sürecinde tüm doktor ve hemşireler çok ilgiliydi. Özellikle Prof. Dr. Ahmet Yılmaz\'a teşekkür ederim. Profesyonel yaklaşımı ve ilgisi için minnettarım.',
    rating: 5,
    hospital: 'Anadolu Merkez Hastanesi',
  },
  {
    id: 2,
    name: 'Mehmet Kaya',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&q=80',
    text: 'Çocuğumun tedavisi için gittiğimiz Anadolu Çocuk Hastanesi\'nde aldığımız hizmet mükemmeldi. Doktorumuz Uzm. Dr. Zeynep Şahin\'in sabırlı ve anlayışlı yaklaşımı bizi çok rahatlattı.',
    rating: 5,
    hospital: 'Anadolu Çocuk Hastanesi',
  },
  {
    id: 3,
    name: 'Zeynep Demir',
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&q=80',
    text: 'Anadolu Avrupa Hastanesi\'nde check-up yaptırdım. Tüm süreç çok hızlı ve profesyonelce ilerledi. Sonuçlarımı aynı gün alabildim ve doktorum detaylı bir şekilde açıkladı.',
    rating: 4,
    hospital: 'Anadolu Avrupa Hastanesi',
  },
  {
    id: 4,
    name: 'Ali Yıldız',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&q=80',
    text: 'Kalp rahatsızlığım için gittiğim Anadolu Merkez Hastanesi\'nde Prof. Dr. Ahmet Yılmaz tarafından tedavi edildim. Kendisi ve ekibi çok ilgili ve profesyoneldi. Şimdi kendimi çok daha iyi hissediyorum.',
    rating: 5,
    hospital: 'Anadolu Merkez Hastanesi',
  },
]

const TestimonialsSection = () => {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.2 })
  const [activeIndex, setActiveIndex] = useState(0)

  const renderStars = (rating: number) => {
    const stars = []
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <i
          key={i}
          className={`bi ${i <= rating ? 'bi-star-fill text-accent' : 'bi-star text-gray-300'} text-lg`}
        ></i>
      )
    }
    return stars
  }

  return (
    <section className="py-20 bg-neutral">
      <div className="container-custom">
        <SectionTitle
          title="Hasta Yorumları"
          subtitle="Hastalarımızın deneyimleri ve memnuniyetleri bizim için çok değerli."
        />

        <motion.div
          ref={ref}
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="mt-12"
        >
          <Swiper
            modules={[Pagination, Navigation]}
            spaceBetween={30}
            slidesPerView={1}
            pagination={{ clickable: true }}
            navigation
            onSlideChange={(swiper) => setActiveIndex(swiper.activeIndex)}
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
          >
            {testimonials.map((testimonial) => (
              <SwiperSlide key={testimonial.id}>
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
                      <p className="text-xs text-text-light">{testimonial.hospital}</p>
                    </div>
                  </div>
                  <div className="flex mb-4">{renderStars(testimonial.rating)}</div>
                  <p className="text-text-light text-sm flex-grow">"{testimonial.text}"</p>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </motion.div>
      </div>
    </section>
  )
}

export default TestimonialsSection
