import { motion } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import { useTranslation } from 'react-i18next'
import { FaPhone, FaEnvelope, FaClock, FaMapMarkerAlt, FaFacebookF, FaTwitter, FaInstagram, FaYoutube, FaLinkedinIn } from 'react-icons/fa'
import { useHospitals } from '../hooks/useHospitals'
import LastUpdated from '../components/ui/LastUpdated'
import HospitalMap from '../components/common/HospitalMap'

const getMapEmbedUrl = (hospital: any) => {
  if (hospital.latitude && hospital.longitude) {
    return `https://maps.google.com/maps?q=${hospital.latitude},${hospital.longitude}&z=15&ie=UTF8&iwloc=&output=embed`;
  }
  if (hospital.address) {
    return `https://maps.google.com/maps?q=${encodeURIComponent(hospital.address)}&z=15&ie=UTF8&iwloc=&output=embed`;
  }
  return `https://maps.google.com/maps?q=${encodeURIComponent(hospital.name)}&z=15&ie=UTF8&iwloc=&output=embed`;
};

const ContactPage = () => {
  const { t } = useTranslation()
  const { data: hospitals = [], isLoading: hospitalsLoading } = useHospitals();

  const contactBoxes = [
    {
      icon: <FaPhone />,
      title: t('contactPage.phoneTitle'),
      description: t('contactPage.phoneDesc'),
      value: '444 50 58',
      isLink: true,
      href: 'tel:4445058'
    },
    {
      icon: <FaEnvelope />,
      title: t('contactPage.emailTitle'),
      description: t('contactPage.emailDesc'),
      value: 'info@anadoluhastaneleri.com',
      isLink: true,
      href: 'mailto:info@anadoluhastaneleri.com'
    },
    {
      icon: <FaClock />,
      title: t('contactPage.workingHoursTitle'),
      description: t('contactPage.workingHoursDesc'),
      value: t('contactPage.workingHoursValue'),
      extra: t('common.emergencyService'),
      isLink: false
    },
  ];

  const faqs = [
    { q: t('contactPage.faq1q', 'Nasıl randevu alabilirim?'), a: t('contactPage.faq1a', 'Web sitemiz üzerinden online randevu alabilir veya 444 50 58 numaralı çağrı merkezimizi arayabilirsiniz.') },
    { q: t('contactPage.faq2q', 'Hangi sigorta şirketleriyle anlaşmanız var?'), a: t('contactPage.faq2a', 'Birçok özel sağlık sigortası ve SGK ile anlaşmamız bulunmaktadır. Detaylı liste için çağrı merkezimizi arayabilirsiniz.') },
    { q: t('contactPage.faq3q', 'Check-up paketleriniz hakkında bilgi alabilir miyim?'), a: t('contactPage.faq3a', 'Farklı yaş grupları ve ihtiyaçlara yönelik çeşitli check-up paketlerimiz bulunmaktadır. Detaylı bilgi için web sitemizi ziyaret edebilirsiniz.') },
    { q: t('contactPage.faq4q', 'Hastanelerinizde otopark hizmeti var mı?'), a: t('contactPage.faq4a', 'Evet, tüm hastanelerimizde hastalarımız için ücretsiz otopark hizmeti sunmaktayız.') },
    { q: t('contactPage.faq5q', 'Hasta ziyaret saatleri nelerdir?'), a: t('contactPage.faq5a', 'Hasta ziyaret saatleri her gün 14:00-16:00 ve 19:00-20:00 saatleri arasındadır.') },
  ];

  return (
    <div className="bg-white min-h-screen">
      <Helmet>
        <title>{t('contactPage.title')} | Anadolu Hastaneleri Grubu</title>
        <meta name="description" content={t('contactPage.subtitle')} />
      </Helmet>

      {/* HERO BANNER */}
      <section className="relative pt-32 pb-16 bg-primary overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:20px_20px]" />
        </div>
        <div className="container-custom relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-5xl font-black text-white mb-4">{t('contactPage.title')}</h1>
            <p className="text-white/70 max-w-xl mx-auto">
              {t('contactPage.subtitle')}
            </p>
          </motion.div>
        </div>
      </section>

      {/* CONTACT BOXES */}
      <section className="py-12">
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {contactBoxes.map((box, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-slate-50 rounded-2xl p-8 text-center"
              >
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-primary text-2xl mx-auto mb-4">
                  {box.icon}
                </div>
                <h3 className="text-lg font-bold text-primary mb-2">{box.title}</h3>
                <p className="text-sm text-slate-500 mb-4">{box.description}</p>
                {box.isLink ? (
                  <a href={box.href} className="text-primary font-bold hover:text-accent transition-colors">
                    {box.value}
                  </a>
                ) : (
                  <div>
                    <p className="text-slate-600 text-sm whitespace-pre-line">{box.value}</p>
                    {box.extra && <p className="text-accent font-bold text-sm mt-2">{box.extra}</p>}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* HOSPITALS */}
      <section className="py-12">
        <div className="container-custom">
          <h2 className="text-2xl font-bold text-primary mb-8">{t('contactPage.hospitalsTitle')}</h2>
          {hospitalsLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : hospitals.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              {t('contactPage.noHospitals', 'Henüz hastane bilgisi bulunmamaktadır.')}
            </div>
          ) : (
            <div className="space-y-8">
              {hospitals.map((hospital) => (
                <motion.div
                  key={hospital.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="grid grid-cols-1 lg:grid-cols-2 gap-6 bg-white border border-slate-100 rounded-2xl overflow-hidden"
                >
                  {/* Hospital Info */}
                  <div className="p-8">
                    <h3 className="text-xl font-bold text-primary mb-4">{hospital.name}</h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex items-start gap-3">
                        <FaMapMarkerAlt className="text-accent mt-1 flex-shrink-0" />
                        <span className="text-slate-600">{hospital.address}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <FaPhone className="text-accent flex-shrink-0" />
                        <a href={`tel:${(hospital.phone || '4445058').replace(/\s/g, '')}`} className="text-primary hover:text-accent transition-colors">
                          {hospital.phone || '444 50 58'}
                        </a>
                      </div>
                      <div className="flex items-center gap-3">
                        <FaEnvelope className="text-accent flex-shrink-0" />
                        <a href={`mailto:${hospital.email || 'info@anadoluhastaneleri.com'}`} className="text-primary hover:text-accent transition-colors">
                          {hospital.email || 'info@anadoluhastaneleri.com'}
                        </a>
                      </div>
                      <div className="flex items-start gap-3">
                        <FaClock className="text-accent mt-1 flex-shrink-0" />
                        <span className="text-slate-600">{hospital.working_hours || 'Haftaiçi: 08:00 - 17:00, Haftasonu: 08:30 - 14:00'}</span>
                      </div>
                    </div>
                  </div>
                  {/* Map */}
                  <div className="h-64 lg:h-auto bg-slate-100 relative">
                    {hospital.latitude && hospital.longitude ? (
                      <div className="absolute inset-0">
                        <HospitalMap
                          latitude={hospital.latitude}
                          longitude={hospital.longitude}
                          name={hospital.name}
                          address={hospital.address}
                          className="w-full h-full"
                        />
                      </div>
                    ) : (
                      <iframe
                        src={getMapEmbedUrl(hospital)}
                        className="absolute inset-0 w-full h-full border-0"
                        allowFullScreen={false}
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        title={`${hospital.name} Harita`}
                      />
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CONTACT FORM & FAQ */}
      <section className="py-12 bg-slate-50">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div>
              <h2 className="text-2xl font-bold text-primary mb-4">{t('contactPage.writeUs')}</h2>
              <p className="text-slate-500 text-sm mb-8">
                {t('contactPage.writeUsDesc')}
              </p>
              <form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="contact-name" className="block text-sm font-medium text-slate-600 mb-2">
                      {t('common.name')} <span className="text-coral-500" aria-hidden="true">*</span>
                    </label>
                    <input
                      id="contact-name"
                      name="name"
                      type="text"
                      required
                      aria-required="true"
                      placeholder={t('contactPage.placeholderName')}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:border-primary bg-white"
                    />
                  </div>
                  <div>
                    <label htmlFor="contact-email" className="block text-sm font-medium text-slate-600 mb-2">
                      {t('common.email')} <span className="text-coral-500" aria-hidden="true">*</span>
                    </label>
                    <input
                      id="contact-email"
                      name="email"
                      type="email"
                      required
                      aria-required="true"
                      placeholder={t('contactPage.placeholderEmail')}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:border-primary bg-white"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="contact-phone" className="block text-sm font-medium text-slate-600 mb-2">
                      {t('common.phone')} <span className="text-coral-500" aria-hidden="true">*</span>
                    </label>
                    <input
                      id="contact-phone"
                      name="phone"
                      type="tel"
                      required
                      aria-required="true"
                      placeholder={t('contactPage.placeholderPhone')}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:border-primary bg-white"
                    />
                  </div>
                  <div>
                    <label htmlFor="contact-subject" className="block text-sm font-medium text-slate-600 mb-2">{t('common.subject')}</label>
                    <select id="contact-subject" name="subject" className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:border-primary bg-white">
                      <option>{t('common.selectSubject')}</option>
                      <option>{t('common.appointment')}</option>
                      <option>{t('common.infoRequest')}</option>
                      <option>{t('common.suggestion')}</option>
                      <option>{t('common.complaint')}</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label htmlFor="contact-message" className="block text-sm font-medium text-slate-600 mb-2">
                    {t('common.message')} <span className="text-coral-500" aria-hidden="true">*</span>
                  </label>
                  <textarea
                    id="contact-message"
                    name="message"
                    rows={5}
                    required
                    aria-required="true"
                    placeholder={t('contactPage.placeholderMessage')}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:border-primary bg-white resize-none"
                  />
                </div>
                <div className="flex items-start gap-2">
                  <input type="checkbox" id="consent" name="consent" required aria-required="true" className="mt-1" />
                  <label htmlFor="consent" className="text-sm text-slate-500">
                    {t('common.consentText')} <span className="text-coral-500" aria-hidden="true">*</span>
                  </label>
                </div>
                <button
                  type="submit"
                  className="px-8 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-colors"
                >
                  {t('common.send')}
                </button>
              </form>
            </div>

            {/* FAQ */}
            <div>
              <h2 className="text-2xl font-bold text-primary mb-8">{t('common.faq')}</h2>
              <div className="space-y-4">
                {faqs.map((faq, i) => (
                  <details key={i} className="group bg-white rounded-xl overflow-hidden border border-slate-100">
                    <summary className="flex justify-between items-center p-5 cursor-pointer font-medium text-primary text-sm">
                      {faq.q}
                      <span className="text-slate-400 group-open:rotate-180 transition-transform">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                          <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </span>
                    </summary>
                    <div className="px-5 pb-5 text-slate-500 text-sm">
                      {faq.a}
                    </div>
                  </details>
                ))}
              </div>

              {/* Social Follow */}
              <div className="mt-12 p-6 bg-white rounded-xl border border-slate-100">
                <h3 className="text-lg font-bold text-primary mb-2">{t('footer.followUs')}</h3>
                <p className="text-sm text-slate-500 mb-4">
                  {t('footer.followDesc')}
                </p>
                <div className="flex gap-3">
                  {[
                    { Icon: FaFacebookF, label: 'Facebook' },
                    { Icon: FaTwitter, label: 'Twitter / X' },
                    { Icon: FaInstagram, label: 'Instagram' },
                    { Icon: FaYoutube, label: 'YouTube' },
                    { Icon: FaLinkedinIn, label: 'LinkedIn' },
                  ].map(({ Icon, label }) => (
                    <a
                      key={label}
                      href="#"
                      aria-label={label}
                      className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 hover:bg-primary hover:text-white transition-colors"
                    >
                      <Icon aria-hidden="true" />
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Editor Info */}
      <section className="py-8 bg-white border-t border-slate-100">
        <div className="container-custom text-center">
          <p className="text-sm text-slate-500">
            {t('contactPage.editorInfo')} &nbsp;|&nbsp; {t('footer.contactTitle')}: <a href="tel:4445058" className="text-primary hover:underline">444 50 58</a>
          </p>
        </div>
      </section>

      <section className="bg-white py-6 border-t border-gray-100">
        <div className="container-custom">
          <LastUpdated date="10.05.2024" />
        </div>
      </section>
    </div>
  );
};

export default ContactPage;
