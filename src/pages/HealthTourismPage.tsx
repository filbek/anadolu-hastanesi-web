import { motion } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import {
  FaCheck, FaGlobeAmericas, FaHotel, FaAmbulance, FaUserMd, FaMicrochip, FaUserFriends,
  FaHeartbeat, FaBone, FaEye, FaUserEdit, FaTooth, FaCut,
  FaPhone, FaEnvelope, FaWhatsapp, FaFacebookF, FaTwitter, FaInstagram, FaYoutube
} from 'react-icons/fa'

const HealthTourismPage = () => {
  const whyUs = [
    { title: 'JCI Akreditasyonu', desc: 'Uluslararası standartlarda sağlık hizmeti sunduğumuzu belgeleyen JCI akreditasyonuna sahibiz.' },
    { title: 'Uzman Doktor Kadrosu', desc: 'Alanında uzman ve uluslararası deneyime sahip doktorlarımızla hizmet veriyoruz.' },
    { title: 'Modern Teknoloji', desc: 'En son teknoloji tıbbi cihazlar ve tedavi yöntemleri kullanıyoruz.' },
    { title: 'Çok Dilli Hizmet', desc: 'İngilizce, Almanca, Arapça, Rusça ve daha birçok dilde hizmet sunuyoruz.' },
    { title: 'Uygun Fiyatlar', desc: 'Avrupa ve Amerika\'daki fiyatlara göre %40-70 daha ekonomik fiyatlarla hizmet veriyoruz.' },
  ];

  const services = [
    { icon: <FaGlobeAmericas />, title: 'Çok Dilli Hizmet', desc: 'İngilizce, Almanca, Arapça, Rusça ve daha birçok dilde hizmet sunuyoruz.' },
    { icon: <FaHotel />, title: 'Konaklama Desteği', desc: 'Tedavi süreciniz boyunca konaklama ihtiyaçlarınız için destek sağlıyoruz.' },
    { icon: <FaAmbulance />, title: 'Transfer Hizmetleri', desc: 'Havalimanı-hastane-otel arasında özel transfer hizmetleri sunuyoruz.' },
    { icon: <FaUserMd />, title: 'Uzman Doktorlar', desc: 'Alanında uzman ve uluslararası deneyime sahip doktorlarımızla hizmetinizdeyiz.' },
    { icon: <FaMicrochip />, title: 'Modern Teknoloji', desc: 'En son teknoloji tıbbi cihazlar ve tedavi yöntemleri kullanıyoruz.' },
    { icon: <FaUserFriends />, title: 'Hasta Refakatçi Desteği', desc: 'Tedavi sürecinizde size ve refakatçinize özel destek sağlıyoruz.' },
  ];

  const treatments = [
    { icon: <FaHeartbeat />, title: 'Kardiyoloji', items: ['Koroner Anjiografi', 'Stent Uygulaması', 'Kalp Pili Takımı', 'Kalp Kapağı Ameliyatları'] },
    { icon: <FaBone />, title: 'Ortopedi', items: ['Diz Protezi', 'Kalça Protezi', 'Omurga Cerrahisi', 'Spor Yaralanmaları'] },
    { icon: <FaEye />, title: 'Göz Hastalıkları', items: ['LASIK Ameliyatı', 'Katarakt Ameliyatı', 'Retina Tedavileri', 'Göz Kapağı Estetiği'] },
    { icon: <FaUserEdit />, title: 'Plastik Cerrahi', items: ['Yüz Germe', 'Burun Estetiği', 'Meme Estetiği', 'Liposuction'] },
    { icon: <FaTooth />, title: 'Diş Tedavileri', items: ['İmplant', 'Zirkonyum Kaplama', 'Gülüş Tasarımı', 'Ortodonti'] },
    { icon: <FaCut />, title: 'Saç Ekimi', items: ['FUE Tekniği', 'DHI Tekniği', 'Sakal Ekimi', 'Kaş Ekimi'] },
  ];

  const process = [
    { step: 1, title: 'İletişim', desc: 'Bizimle iletişime geçin ve sağlık durumunuz hakkında bilgi verin.' },
    { step: 2, title: 'Tedavi Planı', desc: 'Uzman doktorlarımız tarafından size özel tedavi planı oluşturulur.' },
    { step: 3, title: 'Seyahat ve Konaklama', desc: 'Seyahat ve konaklama planlamasında size yardımcı oluruz.' },
    { step: 4, title: 'Tedavi ve Takip', desc: 'Tedaviniz gerçekleştirilir ve sonrasında takip edilir.' },
  ];

  const testimonials = [
    { name: 'Tamzin Tihema', country: 'Yeni Zelanda', rating: 5, text: 'Jennifer made the process clear and calm. She went above and beyond to cater to my needs. The hospital itself was clean and the cleaning staff were very thorough. I had an overall enjoyable experience and would definitely recommend this hospital.' },
    { name: 'Fil JC', country: 'Kanada', rating: 5, text: 'I had my gastric surgery at Anadolu Hospital and from the moment I was picked up at the airport until I was dropped back off, everything was absolutely flawless. The entire process was organized perfectly — the hospital runs like a well-oiled machine.' },
    { name: 'Kelsyrina Sanele', country: 'Avustralya', rating: 5, text: 'Travelled abroad to Turkey to get the Gastric Sleeve. Our surgeon Dr Ercan Yalcin was amazing, and so was the staff from Anadolu. JENNIFER assisted us throughout our whole journey. She is such a beautiful soul!' },
  ];

  const faqs = [
    { q: 'Sağlık turizmi için Türkiye\'ye nasıl gelebilirim?', a: 'Bizimle iletişime geçtiğinizde, tüm seyahat ve vize süreçleri konusunda size rehberlik ediyoruz. Havalimanı transferi de dahil tüm organizasyonu sizin adınıza gerçekleştiriyoruz.' },
    { q: 'Tedavi sürecim ne kadar sürer?', a: 'Tedavi süresi, uygulanacak prosedüre göre değişiklik gösterir. İlk görüşmede size özel tedavi planı ve tahmini süre hakkında bilgi verilir.' },
    { q: 'Tedavi maliyetleri nedir?', a: 'Maliyetler tedavi türüne göre değişmekle birlikte, Avrupa ve Amerika\'daki fiyatlara göre %40-70 daha ekonomik fiyatlar sunuyoruz.' },
    { q: 'Konaklama ve ulaşım hizmetleri sağlıyor musunuz?', a: 'Evet, havalimanı transferi, otel rezervasyonu ve hastane-otel transferleri dahil tüm lojistik süreçlerde size destek sağlıyoruz.' },
    { q: 'Tercüman hizmeti var mı?', a: 'Evet, İngilizce, Almanca, Arapça, Rusça ve daha birçok dilde tercüman hizmeti sunuyoruz.' },
    { q: 'Tedavi sonrası takip nasıl yapılıyor?', a: 'Tedaviniz tamamlandıktan sonra, düzenli online görüşmeler ve raporlama sistemi ile sağlık durumunuzu takip ediyoruz.' },
  ];

  return (
    <div className="bg-white min-h-screen">
      <Helmet>
        <title>Sağlık Turizmi | Anadolu Hastaneleri Grubu</title>
        <meta name="description" content="Dünya standartlarında sağlık hizmetleri için Türkiye'nin önde gelen sağlık kuruluşu." />
      </Helmet>

      {/* HERO SECTION WITH BANNER */}
      <section className="relative min-h-[600px] flex items-center pt-24 overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1551076805-e1869033e561?auto=format&fit=crop&w=1920&q=80"
            alt="Medical Technology"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/95 via-primary/80 to-primary/60" />
        </div>

        <div className="container-custom relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <span className="inline-block px-4 py-2 bg-accent/20 text-accent rounded-full text-sm font-bold mb-6">
                Anadolu Hastaneleri Grubu
              </span>
              <h1 className="text-4xl md:text-6xl font-black text-white leading-tight mb-6">
                Sağlık Turizmi
              </h1>
              <p className="text-lg text-white/80 leading-relaxed mb-8 max-w-lg">
                Dünya standartlarında sağlık hizmetleri için Türkiye'nin önde gelen sağlık kuruluşu. Modern teknolojimiz, uzman doktor kadromuz ve uluslararası standartlardaki tesislerimizle sağlığınız için buradayız.
              </p>
              <div className="flex flex-wrap gap-4">
                <a href="#contact" className="px-8 py-4 bg-accent text-white rounded-xl font-bold hover:bg-accent/90 transition-all shadow-lg">
                  İletişime Geçin
                </a>
                <a href="#services" className="px-8 py-4 bg-white/10 text-white border border-white/30 rounded-xl font-bold hover:bg-white/20 transition-all backdrop-blur-sm">
                  Hizmetlerimiz
                </a>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="hidden lg:block"
            >
              <img
                src="https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=600&q=80"
                alt="Medical Equipment"
                className="rounded-3xl shadow-2xl border-4 border-white/20"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* LANGUAGE SELECTOR */}
      <div className="bg-slate-100 py-4">
        <div className="container-custom flex justify-center items-center gap-6">
          <span className="text-slate-500 font-medium">Dil Seçin:</span>
          {['Türkçe', 'English', 'العربية', 'Русский', 'Deutsch'].map((lang, i) => (
            <button
              key={i}
              className={`font-medium transition-colors ${i === 0 ? 'text-primary underline' : 'text-slate-400 hover:text-primary'}`}
            >
              {lang}
            </button>
          ))}
        </div>
      </div>

      {/* WHY CHOOSE US */}
      <section className="py-20">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-black text-primary mb-6">Neden Bizi Tercih Etmelisiniz?</h2>
              <p className="text-slate-500 mb-8">
                Anadolu Hastaneleri Grubu olarak, uluslararası hastalara en yüksek kalitede sağlık hizmeti sunuyoruz.
              </p>
              <p className="text-slate-500 mb-8">
                Anadolu Hastaneleri Grubu olarak, dünyanın dört bir yanından gelen hastalara en yüksek kalitede sağlık hizmeti sunuyoruz. Modern teknolojimiz, uzman doktor kadromuz ve uluslararası standartlardaki tesislerimizle sağlığınız için buradayız.
              </p>
              <div className="space-y-4">
                {whyUs.map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <FaCheck className="text-accent mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-bold text-primary">{item.title}</h4>
                      <p className="text-sm text-slate-500">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=600&q=80"
                alt="Medical Team"
                className="rounded-3xl shadow-xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section id="services" className="py-20 bg-slate-50">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black text-primary mb-4">Hizmetlerimiz</h2>
            <p className="text-slate-500 max-w-2xl mx-auto">
              Anadolu Hastaneleri Grubu olarak, uluslararası hastalarımıza geniş bir yelpazede hizmet sunuyoruz.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow"
              >
                <div className="w-14 h-14 bg-accent/10 rounded-xl flex items-center justify-center text-accent text-2xl mb-6">
                  {service.icon}
                </div>
                <h3 className="text-lg font-bold text-primary mb-3">{service.title}</h3>
                <p className="text-slate-500 text-sm">{service.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* TREATMENTS */}
      <section className="py-20">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black text-primary mb-4">Tedavi Seçenekleri</h2>
            <p className="text-slate-500 max-w-2xl mx-auto">
              Anadolu Hastaneleri Grubu olarak, birçok farklı alanda tedavi hizmeti sunuyoruz.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {treatments.map((treatment, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white p-8 rounded-2xl border border-slate-100 hover:border-accent/20 hover:shadow-lg transition-all"
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary text-xl">
                    {treatment.icon}
                  </div>
                  <h3 className="text-lg font-bold text-primary">{treatment.title}</h3>
                </div>
                <ul className="space-y-2">
                  {treatment.items.map((item, j) => (
                    <li key={j} className="flex items-center gap-2 text-slate-500 text-sm">
                      <FaCheck className="text-accent text-xs" />
                      {item}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* PROCESS */}
      <section className="py-20 bg-primary">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black text-white mb-4">Tedavi Süreci</h2>
            <p className="text-white/60 max-w-2xl mx-auto">
              Anadolu Hastaneleri Grubu'nda tedavi süreciniz nasıl ilerler?
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {process.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center text-white text-2xl font-black mx-auto mb-6">
                  {item.step}
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{item.title}</h3>
                <p className="text-white/60 text-sm">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-20">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black text-primary mb-4">Hasta Yorumları</h2>
            <p className="text-slate-500 max-w-2xl mx-auto">
              Dünyanın dört bir yanından gelen hastalarımızın deneyimleri
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white p-8 rounded-2xl border border-slate-100 shadow-lg"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-primary font-bold">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-bold text-primary">{testimonial.name}</h4>
                    <p className="text-sm text-slate-400">{testimonial.country}</p>
                  </div>
                </div>
                <div className="flex gap-1 mb-4">
                  {Array(testimonial.rating).fill(0).map((_, j) => (
                    <span key={j} className="text-accent">★</span>
                  ))}
                </div>
                <p className="text-slate-500 text-sm leading-relaxed">{testimonial.text}</p>
              </motion.div>
            ))}
          </div>
          <div className="text-center mt-8">
            <a
              href="https://www.trustpilot.com/review/anadoluhastaneleri.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent font-medium hover:underline"
            >
              Trustpilot'ta tüm yorumları görüntüleyin →
            </a>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-slate-50">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black text-primary mb-4">Sık Sorulan Sorular</h2>
            <p className="text-slate-500 max-w-2xl mx-auto">
              Sağlık turizmi hakkında merak ettiğiniz soruların cevapları
            </p>
          </div>
          <div className="max-w-3xl mx-auto space-y-4">
            {faqs.map((faq, i) => (
              <details key={i} className="group bg-white rounded-xl overflow-hidden shadow-sm">
                <summary className="flex justify-between items-center p-6 cursor-pointer font-medium text-primary">
                  {faq.q}
                  <span className="text-slate-400 group-open:rotate-180 transition-transform">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                </summary>
                <div className="px-6 pb-6 text-slate-500">
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CONTACT */}
      <section id="contact" className="py-20">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black text-primary mb-4">İletişime Geçin</h2>
            <p className="text-slate-500 max-w-2xl mx-auto">
              Sağlık turizmi hakkında daha fazla bilgi almak için bizimle iletişime geçin.
            </p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* Contact Info */}
            <div>
              <h3 className="text-xl font-bold text-primary mb-6">Bize Ulaşın</h3>
              <p className="text-slate-500 mb-8">
                Sağlık turizmi hakkında daha fazla bilgi almak, tedavi seçeneklerini öğrenmek veya randevu almak için bizimle iletişime geçebilirsiniz. Uzman ekibimiz, size en kısa sürede dönüş yapacaktır.
              </p>
              <div className="space-y-4 mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                    <FaEnvelope />
                  </div>
                  <div>
                    <p className="text-sm text-slate-400">E-posta</p>
                    <a href="mailto:international@anadoluhastaneleri.com" className="text-primary font-medium">international@anadoluhastaneleri.com</a>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                    <FaPhone />
                  </div>
                  <div>
                    <p className="text-sm text-slate-400">Telefon</p>
                    <a href="tel:+902121234567" className="text-primary font-medium">+90 212 123 45 67</a>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                    <FaWhatsapp />
                  </div>
                  <div>
                    <p className="text-sm text-slate-400">WhatsApp</p>
                    <a href="https://wa.me/902121234567" className="text-primary font-medium">+90 212 123 45 67</a>
                  </div>
                </div>
              </div>
              <div>
                <p className="text-sm text-slate-400 mb-4">Bizi Takip Edin</p>
                <div className="flex gap-3">
                  {[FaFacebookF, FaTwitter, FaInstagram, FaYoutube].map((Icon, i) => (
                    <a key={i} href="#" className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-colors">
                      <Icon />
                    </a>
                  ))}
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div>
              <h3 className="text-xl font-bold text-primary mb-6">İletişim Formu</h3>
              <form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-2">Ad Soyad</label>
                    <input type="text" placeholder="Adınız Soyadınız" className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:border-primary" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-2">E-posta</label>
                    <input type="email" placeholder="ornek@email.com" className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:border-primary" />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-2">Telefon</label>
                    <input type="tel" placeholder="+90 555 123 45 67" className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:border-primary" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-2">Ülke</label>
                    <input type="text" placeholder="Ülkeniz" className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:border-primary" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-2">İlgilendiğiniz Tedavi</label>
                  <select className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:border-primary bg-white">
                    <option>Tedavi Seçiniz</option>
                    <option>Kardiyoloji</option>
                    <option>Ortopedi</option>
                    <option>Göz Hastalıkları</option>
                    <option>Plastik Cerrahi</option>
                    <option>Diş Tedavileri</option>
                    <option>Saç Ekimi</option>
                    <option>Diğer</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-2">Mesajınız</label>
                  <textarea rows={4} placeholder="Sağlık durumunuz ve tedavi beklentileriniz hakkında bilgi verebilirsiniz." className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:border-primary resize-none" />
                </div>
                <div className="flex items-start gap-2">
                  <input type="checkbox" id="consent" className="mt-1" />
                  <label htmlFor="consent" className="text-sm text-slate-500">
                    Kişisel verilerimin, tarafıma dönüş yapılması amacıyla işlenmesine onay veriyorum.
                  </label>
                </div>
                <button type="submit" className="w-full py-4 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-colors">
                  Gönder
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HealthTourismPage;
