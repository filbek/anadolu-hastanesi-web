import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, useInView } from 'framer-motion'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Pagination } from 'swiper/modules'
import SectionTitle from '../ui/SectionTitle'
import { useDoctors } from '../../hooks/useDoctors'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'

const DoctorsSlider = () => {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.2 })
  const { data: doctors = [], isLoading } = useDoctors()

  // Filter and display a subset of doctors for the homepage
  const displayDoctors = doctors.slice(0, 8)

  if (isLoading && doctors.length === 0) {
    return (
      <section className="py-20 bg-primary text-white">
        <div className="container-custom">
          <SectionTitle
            title="Uzman Doktorlarımız"
            subtitle="Yükleniyor..."
            light
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="animate-pulse bg-white/10 rounded-xl h-80" />
            ))}
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-20 bg-primary text-white">
      <div className="container-custom">
        <SectionTitle
          title="Uzman Doktorlarımız"
          subtitle="Alanında uzman ve deneyimli doktor kadromuzla sağlığınız için buradayız."
          light
        />

        <motion.div
          ref={ref}
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="mt-12"
        >
          <Swiper
            modules={[Navigation, Pagination]}
            spaceBetween={30}
            slidesPerView={1}
            navigation
            pagination={{ clickable: true }}
            breakpoints={{
              640: {
                slidesPerView: 2,
              },
              1024: {
                slidesPerView: 3,
              },
              1280: {
                slidesPerView: 4,
              },
            }}
          >
            {displayDoctors.map((doctor) => (
              <SwiperSlide key={doctor.id}>
                <div className="bg-white rounded-xl overflow-hidden shadow-lg text-text">
                  <div className="relative h-64 overflow-hidden">
                    <img
                      src={doctor.image}
                      alt={doctor.name}
                      className="w-full h-full object-cover object-center transition-transform duration-500 hover:scale-110"
                      loading="lazy"
                      crossOrigin="anonymous"
                    />
                  </div>
                  <div className="p-6">
                    <span className="text-xs font-medium text-primary bg-primary/10 px-3 py-1 rounded-full">
                      {(doctor as any).hospitals?.name || 'Anadolu Hastanesi'}
                    </span>
                    <h3 className="text-xl font-semibold mt-3 mb-1">{doctor.name}</h3>
                    <p className="text-text-light text-sm mb-4">{doctor.title}</p>
                    <div className="flex justify-between items-center">
                      <Link
                        to={`/doktorlar/${doctor.slug}`}
                        className="text-sm font-medium text-primary hover:text-primary-dark transition-colors"
                      >
                        Profili Görüntüle
                      </Link>
                      <a
                        href="https://anadoluhastaneleri.kendineiyibak.app/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-medium text-accent hover:text-accent-dark transition-colors"
                      >
                        Randevu Al
                      </a>
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </motion.div>

        <div className="text-center mt-12">
          <Link to="/doktorlar" className="btn bg-white text-primary hover:bg-neutral transition-colors">
            Tüm Doktorlarımız
          </Link>
        </div>
      </div>
    </section>
  )
}

export default DoctorsSlider
