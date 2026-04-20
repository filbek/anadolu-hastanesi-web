import { motion } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import { FaPhone, FaEnvelope, FaClock, FaMapMarkerAlt, FaFacebookF, FaTwitter, FaInstagram, FaYoutube, FaLinkedinIn } from 'react-icons/fa'

const ContactPage = () => {
  const contactBoxes = [
    {
      icon: <FaPhone />,
      title: 'Telefon',
      description: '7/24 hizmet veren çağrı merkezimiz aracılığıyla bize ulaşabilirsiniz.',
      value: '0212 123 45 67',
      isLink: true,
      href: 'tel:02121234567'
    },
    {
      icon: <FaEnvelope />,
      title: 'E-posta',
      description: 'Sorularınız ve önerileriniz için e-posta adresimize yazabilirsiniz.',
      value: 'info@anadoluhastaneleri.com',
      isLink: true,
      href: 'mailto:info@anadoluhastaneleri.com'
    },
    {
      icon: <FaClock />,
      title: 'Çalışma Saatleri',
      description: 'Hastanelerimiz aşağıdaki saatlerde hizmet vermektedir.',
      value: 'Pazartesi - Cumartesi: 08:00 - 20:00\nPazar: 08:00 - 18:00',
      extra: 'Acil Servis: 7/24 Açık',
      isLink: false
    },
  ];

  const hospitals = [
    {
      name: 'Anadolu Merkez Hastanesi',
      address: 'Atatürk Bulvarı No:123, Şişli, İstanbul',
      phone: '0212 123 45 67',
      email: 'info@anadolumerkezhastanesi.com',
      hours: 'Pazartesi - Cumartesi: 08:00 - 20:00, Pazar: 08:00 - 18:00',
      mapSrc: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3008.9633921041065!2d28.978399999999998!3d41.008199999999995!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNDHCsDAwJzI5LjUiTiAyOMKwNTgnNDIuMiJF!5e0!3m2!1str!2str!4v1631234567890!5m2!1str!2str'
    },
    {
      name: 'Anadolu Avrupa Hastanesi',
      address: 'Bağdat Caddesi No:456, Kadıköy, İstanbul',
      phone: '0216 987 65 43',
      email: 'info@anadoluavrupahastanesi.com',
      hours: 'Pazartesi - Cumartesi: 08:00 - 20:00, Pazar: 08:00 - 18:00',
      mapSrc: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3011.6392159242455!2d29.059399999999998!3d40.9782!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNDDCsDU4JzQxLjUiTiAyOcKwMDMnMzMuOCJF!5e0!3m2!1str!2str!4v1631234567890!5m2!1str!2str'
    },
    {
      name: 'Anadolu Çocuk Hastanesi',
      address: 'Cumhuriyet Caddesi No:789, Beşiktaş, İstanbul',
      phone: '0212 345 67 89',
      email: 'info@anadolucocukhastanesi.com',
      hours: 'Pazartesi - Cumartesi: 08:00 - 20:00, Pazar: 08:00 - 18:00',
      mapSrc: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3009.1234567890123!2d29.0123456!3d41.0123456!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNDHCsDAwJzQ0LjQiTiAyOcKwMDAnNDQuNCJF!5e0!3m2!1str!2str!4v1631234567890!5m2!1str!2str'
    },
  ];

  const faqs = [
    { q: 'Nasıl randevu alabilirim?', a: 'Web sitemiz üzerinden online randevu alabilir veya 0212 123 45 67 numaralı çağrı merkezimizi arayabilirsiniz.' },
    { q: 'Hangi sigorta şirketleriyle anlaşmanız var?', a: 'Birçok özel sağlık sigortası ve SGK ile anlaşmamız bulunmaktadır. Detaylı liste için çağrı merkezimizi arayabilirsiniz.' },
    { q: 'Check-up paketleriniz hakkında bilgi alabilir miyim?', a: 'Farklı yaş grupları ve ihtiyaçlara yönelik çeşitli check-up paketlerimiz bulunmaktadır. Detaylı bilgi için web sitemizi ziyaret edebilirsiniz.' },
    { q: 'Hastanelerinizde otopark hizmeti var mı?', a: 'Evet, tüm hastanelerimizde hastalarımız için ücretsiz otopark hizmeti sunmaktayız.' },
    { q: 'Hasta ziyaret saatleri nelerdir?', a: 'Hasta ziyaret saatleri her gün 14:00-16:00 ve 19:00-20:00 saatleri arasındadır.' },
  ];

  return (
    <div className="bg-white min-h-screen">
      <Helmet>
        <title>İletişim | Anadolu Hastaneleri Grubu</title>
        <meta name="description" content="Anadolu Hastaneleri Grubu iletişim bilgileri ve hastane lokasyonları." />
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
            <h1 className="text-4xl md:text-5xl font-black text-white mb-4">İletişim</h1>
            <p className="text-white/70 max-w-xl mx-auto">
              Anadolu Hastaneleri Grubu'na ulaşmak için aşağıdaki iletişim bilgilerini kullanabilirsiniz.
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
          <h2 className="text-2xl font-bold text-primary mb-8">Hastanelerimiz</h2>
          <div className="space-y-8">
            {hospitals.map((hospital, i) => (
              <motion.div
                key={i}
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
                      <a href={`tel:${hospital.phone.replace(/\s/g, '')}`} className="text-primary hover:text-accent transition-colors">
                        {hospital.phone}
                      </a>
                    </div>
                    <div className="flex items-center gap-3">
                      <FaEnvelope className="text-accent flex-shrink-0" />
                      <a href={`mailto:${hospital.email}`} className="text-primary hover:text-accent transition-colors">
                        {hospital.email}
                      </a>
                    </div>
                    <div className="flex items-start gap-3">
                      <FaClock className="text-accent mt-1 flex-shrink-0" />
                      <span className="text-slate-600">{hospital.hours}</span>
                    </div>
                  </div>
                </div>
                {/* Map */}
                <div className="h-64 lg:h-auto bg-slate-100 relative">
                  <iframe
                    src={hospital.mapSrc}
                    className="absolute inset-0 w-full h-full border-0"
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title={`${hospital.name} Harita`}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CONTACT FORM & FAQ */}
      <section className="py-12 bg-slate-50">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div>
              <h2 className="text-2xl font-bold text-primary mb-4">Bize Yazın</h2>
              <p className="text-slate-500 text-sm mb-8">
                Sorularınız, önerileriniz veya şikayetleriniz için aşağıdaki formu doldurak bize ulaşabilirsiniz. En kısa sürede size dönüş yapacağız.
              </p>
              <form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-2">Ad Soyad</label>
                    <input
                      type="text"
                      placeholder="Adınız Soyadınız"
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:border-primary bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-2">E-posta</label>
                    <input
                      type="email"
                      placeholder="ornek@email.com"
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:border-primary bg-white"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-2">Telefon</label>
                    <input
                      type="tel"
                      placeholder="0555 123 45 67"
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:border-primary bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-2">Konu</label>
                    <select className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:border-primary bg-white">
                      <option>Konu Seçiniz</option>
                      <option>Randevu</option>
                      <option>Bilgi Talebi</option>
                      <option>Öneri</option>
                      <option>Şikayet</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-2">Mesajınız</label>
                  <textarea
                    rows={5}
                    placeholder="Mesajınızı buraya yazınız..."
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:border-primary bg-white resize-none"
                  />
                </div>
                <div className="flex items-start gap-2">
                  <input type="checkbox" id="consent" className="mt-1" />
                  <label htmlFor="consent" className="text-sm text-slate-500">
                    Kişisel verilerimin, tarafıma dönüş yapılması amacıyla işlenmesine izin veriyorum.
                  </label>
                </div>
                <button
                  type="submit"
                  className="px-8 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-colors"
                >
                  Gönder
                </button>
              </form>
            </div>

            {/* FAQ */}
            <div>
              <h2 className="text-2xl font-bold text-primary mb-8">Sık Sorulan Sorular</h2>
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
                <h3 className="text-lg font-bold text-primary mb-2">Bizi Takip Edin</h3>
                <p className="text-sm text-slate-500 mb-4">
                  Sosyal medya hesaplarımızı takip ederek en güncel sağlık bilgilerine ve hastanemiz hakkındaki gelişmelere ulaşabilirsiniz.
                </p>
                <div className="flex gap-3">
                  {[FaFacebookF, FaTwitter, FaInstagram, FaYoutube, FaLinkedinIn].map((Icon, i) => (
                    <a
                      key={i}
                      href="#"
                      className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 hover:bg-primary hover:text-white transition-colors"
                    >
                      <Icon />
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ContactPage;
