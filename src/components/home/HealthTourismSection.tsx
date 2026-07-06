import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, useInView } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import SectionTitle from '../ui/SectionTitle'
import { FaGlobe, FaHotel, FaPlane, FaUserMd, FaHeartbeat, FaWheelchair } from 'react-icons/fa'

const HealthTourismSection = () => {
  const { t } = useTranslation()
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.2 })

  const services = [
    { icon: <FaGlobe />, title: t('home.serviceMultilingual', 'Çok Dilli Hizmet'), desc: t('home.serviceMultilingualDesc', 'İngilizce, Almanca, Arapça, Rusça ve daha birçok dilde hizmet.') },
    { icon: <FaHotel />, title: t('home.serviceAccommodation', 'Konaklama Desteği'), desc: t('home.serviceAccommodationDesc', 'Tedavi süreciniz boyunca konaklama ihtiyaçlarınız için destek.') },
    { icon: <FaPlane />, title: t('home.serviceTransfer', 'Transfer Hizmetleri'), desc: t('home.serviceTransferDesc', 'Havalimanı-hastane-otel arasında özel transfer.') },
    { icon: <FaUserMd />, title: t('home.serviceExpertDoctors', 'Uzman Doktorlar'), desc: t('home.serviceExpertDoctorsDesc', 'Uluslararası deneyime sahip doktorlarımızla hizmetinizdeyiz.') },
    { icon: <FaHeartbeat />, title: t('home.serviceModernTech', 'Modern Teknoloji'), desc: t('home.serviceModernTechDesc', 'En son teknoloji tıbbi cihazlar ve tedavi yöntemleri.') },
    { icon: <FaWheelchair />, title: t('home.serviceCompanion', 'Hasta Refakatçi Desteği'), desc: t('home.serviceCompanionDesc', 'Tedavi sürecinizde size ve refakatçinize özel destek.') },
  ]

  const floatingStats = [
    { value: '30+', label: t('home.statCountries', 'Ülke') },
    { value: '5000+', label: t('home.statInternationalPatients', 'Uluslararası Hasta') },
    { value: 'SKS', label: t('home.statAccreditation', 'Akreditasyon') },
    { value: 'ISO', label: t('home.statCertificate', 'Sertifika') },
  ]

  return (
    <section className="py-20 md:py-28 bg-white relative overflow-hidden">
      {/* Background map decoration */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
        <svg viewBox="0 0 1000 500" className="w-full h-full" preserveAspectRatio="xMidYMid slice">
          <defs>
            <pattern id="dots" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1" fill="currentColor" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#dots)" />
        </svg>
      </div>

      <div className="container-custom relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left Content */}
          <div>
            <SectionTitle
              label={t('home.healthTourismLabel', 'Uluslararası Hasta Hizmetleri')}
              title={t('home.healthTourismTitle', 'Sağlık Turizmi')}
              subtitle={t('home.healthTourismSubtitle', 'Dünya standartlarında sağlık hizmetleri için Türkiye\'nin önde gelen sağlık kuruluşu.')}
              alignment="left"
            />

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-neutral-500 leading-relaxed mb-8"
            >
              {t('home.healthTourismText', 'Anadolu Hastaneleri Grubu olarak, dünyanın dört bir yanından gelen hastalara en yüksek kalitede sağlık hizmeti sunuyoruz. Modern teknolojimiz, uzman doktor kadromuz ve uluslararası standartlardaki tesislerimizle sağlığınız için buradayız.')}
            </motion.p>

            {/* Floating Stats */}
            <motion.div
              ref={ref}
              initial={false}
              animate={isInView ? 'visible' : 'hidden'}
              variants={{
                hidden: {},
                visible: { transition: { staggerChildren: 0.1 } },
              }}
              className="grid grid-cols-4 gap-4 mb-10"
            >
              {floatingStats.map((stat) => (
                <motion.div
                  key={stat.label}
                  variants={{
                    hidden: { opacity: 0, scale: 0.9 },
                    visible: { opacity: 1, scale: 1, transition: { duration: 0.4 } },
                  }}
                  className="text-center p-4 rounded-2xl bg-surface border border-neutral-100"
                >
                  <div className="font-display text-xl md:text-2xl font-bold text-primary-600">
                    {stat.value}
                  </div>
                  <div className="text-xs text-neutral-500 mt-1">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.3 }}
              className="flex flex-wrap gap-3"
            >
              <Link to="/saglik-turizmi" className="btn btn-primary">
                {t('home.moreInfo', 'Detaylı Bilgi')}
              </Link>
              <a href="mailto:international@anadoluhastaneleri.com" className="btn btn-outline">
                {t('home.contactUs', 'İletişime Geçin')}
              </a>
            </motion.div>
          </div>

          {/* Right Image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <div className="relative rounded-3xl overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=800&q=80"
                alt={t('home.healthTourismImageAlt', 'Sağlık Turizmi')}
                className="w-full h-auto"
                loading="lazy"
              />
            </div>
            {/* Decorative elements */}
            <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-ocean-500/10 rounded-2xl -z-10" />
            <div className="absolute -top-4 -left-4 w-24 h-24 bg-coral-500/10 rounded-2xl -z-10" />
          </motion.div>
        </div>

        {/* Services Grid */}
        <motion.div
          initial={false}
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.08 } },
          }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-16"
        >
          {services.map((service) => (
            <motion.div
              key={service.title}
              variants={{
                hidden: { opacity: 0, y: 16 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
              }}
              className="group flex items-start gap-4 p-5 bg-surface rounded-2xl border border-transparent hover:border-ocean-200 hover:shadow-soft transition-all duration-300"
            >
              <div className="w-11 h-11 rounded-xl bg-ocean-50 flex items-center justify-center text-ocean-500 flex-shrink-0 transition-all duration-300 group-hover:bg-ocean-500 group-hover:text-white">
                {service.icon}
              </div>
              <div>
                <h3 className="font-display font-semibold text-primary-600 text-sm mb-1">
                  {service.title}
                </h3>
                <p className="text-sm text-neutral-500">{service.desc}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

export default HealthTourismSection
