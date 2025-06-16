import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, useInView } from 'framer-motion'
import SectionTitle from '../ui/SectionTitle'
import { FaGlobe, FaHotel, FaPlane, FaUserMd, FaHeartbeat, FaWheelchair } from 'react-icons/fa'

const HealthTourismSection = () => {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.2 })

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  }

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
  ]

  return (
    <section className="py-20 bg-white">
      <div className="container-custom">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <SectionTitle
              title="Sağlık Turizmi"
              subtitle="Dünya standartlarında sağlık hizmetleri için Türkiye'nin önde gelen sağlık kuruluşu."
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
              className="mb-8"
            >
              <h3 className="text-lg font-semibold text-primary mb-3">Neden Bizi Tercih Etmelisiniz?</h3>
              <ul className="space-y-2">
                <li className="flex items-center">
                  <i className="bi bi-check-circle-fill text-accent mr-2"></i>
                  <span className="text-text-light">JCI Akreditasyonu ve uluslararası kalite belgeleri</span>
                </li>
                <li className="flex items-center">
                  <i className="bi bi-check-circle-fill text-accent mr-2"></i>
                  <span className="text-text-light">Alanında uzman ve uluslararası deneyime sahip doktorlar</span>
                </li>
                <li className="flex items-center">
                  <i className="bi bi-check-circle-fill text-accent mr-2"></i>
                  <span className="text-text-light">En son teknoloji tıbbi cihazlar ve tedavi yöntemleri</span>
                </li>
                <li className="flex items-center">
                  <i className="bi bi-check-circle-fill text-accent mr-2"></i>
                  <span className="text-text-light">Çok dilli hasta hizmetleri ve destek ekibi</span>
                </li>
                <li className="flex items-center">
                  <i className="bi bi-check-circle-fill text-accent mr-2"></i>
                  <span className="text-text-light">Uygun fiyatlar ve şeffaf maliyet politikası</span>
                </li>
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <Link to="/saglik-turizmi" className="btn btn-primary mr-4">
                Detaylı Bilgi
              </Link>
              <a
                href="mailto:international@anadoluhastaneleri.com"
                className="btn btn-outline"
              >
                İletişime Geçin
              </a>
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
                src="https://images.unsplash.com/photo-1631815588090-d4bfec5b1ccb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80"
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

        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-16"
        >
          {services.map((service, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
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
        </motion.div>
      </div>
    </section>
  )
}

export default HealthTourismSection
