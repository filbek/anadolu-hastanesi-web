import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, useInView } from 'framer-motion'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Pagination } from 'swiper/modules'
import SectionTitle from '../ui/SectionTitle'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'

const doctors = [
  {
    id: 1,
    name: 'Prof. Dr. Ahmet Yılmaz',
    slug: 'prof-dr-ahmet-yilmaz',
    title: 'Kardiyoloji Uzmanı',
    image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80',
    hospital: 'Anadolu Merkez Hastanesi',
  },
  {
    id: 2,
    name: 'Doç. Dr. Ayşe Kaya',
    slug: 'doc-dr-ayse-kaya',
    title: 'Nöroloji Uzmanı',
    image: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80',
    hospital: 'Anadolu Avrupa Hastanesi',
  },
  {
    id: 3,
    name: 'Prof. Dr. Mehmet Demir',
    slug: 'prof-dr-mehmet-demir',
    title: 'Ortopedi Uzmanı',
    image: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80',
    hospital: 'Anadolu Merkez Hastanesi',
  },
  {
    id: 4,
    name: 'Uzm. Dr. Zeynep Şahin',
    slug: 'uzm-dr-zeynep-sahin',
    title: 'Göz Hastalıkları Uzmanı',
    image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80',
    hospital: 'Anadolu Çocuk Hastanesi',
  },
  {
    id: 5,
    name: 'Prof. Dr. Ali Yıldız',
    slug: 'prof-dr-ali-yildiz',
    title: 'Genel Cerrahi Uzmanı',
    image: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80',
    hospital: 'Anadolu Uluslararası Hastanesi',
  },
  {
    id: 6,
    name: 'Doç. Dr. Selin Arslan',
    slug: 'doc-dr-selin-arslan',
    title: 'Kadın Hastalıkları Uzmanı',
    image: 'https://images.unsplash.com/photo-1651008376811-b90baee60c1f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80',
    hospital: 'Anadolu Avrupa Hastanesi',
  },
]

const DoctorsSlider = () => {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.2 })

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
            {doctors.map((doctor) => (
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
                      {doctor.hospital}
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
