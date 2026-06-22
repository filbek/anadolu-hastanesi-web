import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { FaCalendarCheck, FaPhone, FaArrowRight } from 'react-icons/fa'

const AppointmentCTA = () => {
  const { t } = useTranslation()

  return (
    <section className="relative py-24 md:py-32 overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0" aria-hidden="true">
        <img
          src="https://images.unsplash.com/photo-1579684385127-1ef15d508118?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80"
          alt=""
          className="w-full h-full object-cover"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-primary-900/80" />
      </div>

      {/* Content */}
      <div className="container-custom relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <motion.span
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="inline-block font-display text-xs font-semibold uppercase tracking-[0.12em] text-ocean-300 mb-4"
          >
            {t('home.ctaLabel', 'Hemen Başlayın')}
          </motion.span>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-5 leading-tight"
          >
            {t('home.ctaTitle1', 'Sağlığınız İçin')}
            <br />
            <span className="text-ocean-300">{t('home.ctaTitle2', 'İlk Adımı Atın')}</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg text-white/70 mb-10 max-w-xl mx-auto"
          >
            {t('home.ctaText', 'Uzman doktorlarımızdan randevu alın, sağlığınızı önceliklendirin. Online randevu sistemi ile sadece birkaç dakikada işleminizi tamamlayın.')}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <a
              href="https://anadoluhastaneleri.kendineiyibak.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="group btn btn-coral !px-8 !py-4 !text-lg !rounded-full"
            >
              <FaCalendarCheck />
              {t('home.onlineAppointment', 'Online Randevu Al')}
              <FaArrowRight className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
            </a>

            <a
              href="tel:4445058"
              className="flex items-center gap-3 text-white/80 hover:text-white transition-colors px-6 py-4"
            >
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                <FaPhone className="text-sm" />
              </div>
              <div className="text-left">
                <div className="text-xs text-white/50">{t('home.callUs', 'Bizi Arayın')}</div>
                <div className="font-semibold">444 50 58</div>
              </div>
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

export default AppointmentCTA
