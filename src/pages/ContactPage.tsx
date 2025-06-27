import DynamicPageRenderer from '../components/common/DynamicPageRenderer'
import { motion } from 'framer-motion'
import SectionTitle from '../components/ui/SectionTitle'
import { FaMapMarkerAlt, FaPhone, FaEnvelope, FaClock } from 'react-icons/fa'

const hospitals = [
  {
    id: 1,
    name: 'Anadolu Merkez Hastanesi',
    address: 'Atatürk Bulvarı No:123, Şişli, İstanbul',
    phone: '0212 123 45 67',
    email: 'info@anadolumerkezhastanesi.com',
    workingHours: 'Pazartesi - Cumartesi: 08:00 - 20:00, Pazar: 08:00 - 18:00',
    mapUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3008.9633921041065!2d28.978399999999998!3d41.008199999999995!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNDHCsDAwJzI5LjUiTiAyOMKwNTgnNDIuMiJF!5e0!3m2!1str!2str!4v1631234567890!5m2!1str!2str',
  },
  {
    id: 2,
    name: 'Anadolu Avrupa Hastanesi',
    address: 'Bağdat Caddesi No:456, Kadıköy, İstanbul',
    phone: '0216 987 65 43',
    email: 'info@anadoluavrupahastanesi.com',
    workingHours: 'Pazartesi - Cumartesi: 08:00 - 20:00, Pazar: 08:00 - 18:00',
    mapUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3011.6392159242455!2d29.059399999999998!3d40.9782!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNDDCsDU4JzQxLjUiTiAyOcKwMDMnMzMuOCJF!5e0!3m2!1str!2str!4v1631234567890!5m2!1str!2str',
  },
  {
    id: 3,
    name: 'Anadolu Çocuk Hastanesi',
    address: 'Cumhuriyet Caddesi No:789, Beşiktaş, İstanbul',
    phone: '0212 345 67 89',
    email: 'info@anadolucocukhastanesi.com',
    workingHours: 'Pazartesi - Cumartesi: 08:00 - 20:00, Pazar: 08:00 - 18:00',
    mapUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3009.1234567890123!2d29.0123456!3d41.0123456!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNDHCsDAwJzQ0LjQiTiAyOcKwMDAnNDQuNCJF!5e0!3m2!1str!2str!4v1631234567890!5m2!1str!2str',
  },
];

// Original contact page as fallback
const OriginalContactPage = () => {
  return (
    <div className="pt-24 pb-12">
        <div className="container-custom">
          <SectionTitle
            title="İletişim"
            subtitle="Anadolu Hastaneleri Grubu'na ulaşmak için aşağıdaki iletişim bilgilerini kullanabilirsiniz."
          />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="card flex flex-col items-center text-center p-8"
            >
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <FaPhone className="text-primary text-xl" />
              </div>
              <h3 className="text-xl font-semibold text-primary mb-2">Telefon</h3>
              <p className="text-text-light mb-4">7/24 hizmet veren çağrı merkezimiz aracılığıyla bize ulaşabilirsiniz.</p>
              <a href="tel:+902121234567" className="text-primary font-medium hover:text-primary-dark transition-colors">
                0212 123 45 67
              </a>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="card flex flex-col items-center text-center p-8"
            >
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <FaEnvelope className="text-primary text-xl" />
              </div>
              <h3 className="text-xl font-semibold text-primary mb-2">E-posta</h3>
              <p className="text-text-light mb-4">Sorularınız ve önerileriniz için e-posta adresimize yazabilirsiniz.</p>
              <a href="mailto:info@anadoluhastaneleri.com" className="text-primary font-medium hover:text-primary-dark transition-colors">
                info@anadoluhastaneleri.com
              </a>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="card flex flex-col items-center text-center p-8"
            >
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <FaClock className="text-primary text-xl" />
              </div>
              <h3 className="text-xl font-semibold text-primary mb-2">Çalışma Saatleri</h3>
              <p className="text-text-light mb-4">Hastanelerimiz aşağıdaki saatlerde hizmet vermektedir.</p>
              <p className="text-text-light">
                <span className="font-medium">Pazartesi - Cumartesi:</span> 08:00 - 20:00
              </p>
              <p className="text-text-light">
                <span className="font-medium">Pazar:</span> 08:00 - 18:00
              </p>
              <p className="text-accent font-medium mt-2">Acil Servis: 7/24 Açık</p>
            </motion.div>
          </div>

          <div className="mb-12">
            <h2 className="text-2xl font-semibold text-primary mb-6">Hastanelerimiz</h2>
            
            <div className="space-y-8">
              {hospitals.map((hospital) => (
                <motion.div
                  key={hospital.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5 }}
                  className="bg-white rounded-xl shadow-card overflow-hidden"
                >
                  <div className="grid grid-cols-1 lg:grid-cols-2">
                    <div className="p-6 lg:p-8">
                      <h3 className="text-xl font-semibold text-primary mb-4">{hospital.name}</h3>
                      <div className="space-y-4">
                        <div className="flex items-start">
                          <FaMapMarkerAlt className="text-accent mt-1 mr-3 flex-shrink-0" />
                          <p className="text-text-light">{hospital.address}</p>
                        </div>
                        <div className="flex items-center">
                          <FaPhone className="text-accent mr-3 flex-shrink-0" />
                          <a href={`tel:${hospital.phone.replace(/\s/g, '')}`} className="text-text-light hover:text-primary transition-colors">
                            {hospital.phone}
                          </a>
                        </div>
                        <div className="flex items-center">
                          <FaEnvelope className="text-accent mr-3 flex-shrink-0" />
                          <a href={`mailto:${hospital.email}`} className="text-text-light hover:text-primary transition-colors">
                            {hospital.email}
                          </a>
                        </div>
                        <div className="flex items-start">
                          <FaClock className="text-accent mt-1 mr-3 flex-shrink-0" />
                          <p className="text-text-light">{hospital.workingHours}</p>
                        </div>
                      </div>
                    </div>
                    <div className="h-64 lg:h-auto">
                      <iframe
                        src={hospital.mapUrl}
                        title={hospital.name}
                        className="w-full h-full border-0"
                        allowFullScreen
                        loading="lazy"
                      ></iframe>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-2xl font-semibold text-primary mb-6">Bize Yazın</h2>
              <p className="text-text-light mb-8">
                Sorularınız, önerileriniz veya şikayetleriniz için aşağıdaki formu doldurarak bize ulaşabilirsiniz. En kısa sürede size dönüş yapacağız.
              </p>
              <form className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-text mb-1">Ad Soyad</label>
                    <input
                      type="text"
                      id="name"
                      className="input-field"
                      placeholder="Adınız Soyadınız"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-text mb-1">E-posta</label>
                    <input
                      type="email"
                      id="email"
                      className="input-field"
                      placeholder="ornek@email.com"
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-text mb-1">Telefon</label>
                    <input
                      type="tel"
                      id="phone"
                      className="input-field"
                      placeholder="0555 123 45 67"
                    />
                  </div>
                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-text mb-1">Konu</label>
                    <select id="subject" className="input-field">
                      <option value="">Konu Seçiniz</option>
                      <option value="randevu">Randevu</option>
                      <option value="bilgi">Bilgi Talebi</option>
                      <option value="oneri">Öneri</option>
                      <option value="sikayet">Şikayet</option>
                      <option value="diger">Diğer</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-text mb-1">Mesajınız</label>
                  <textarea
                    id="message"
                    rows={6}
                    className="input-field resize-none"
                    placeholder="Mesajınızı buraya yazınız..."
                    required
                  ></textarea>
                </div>
                <div className="flex items-start">
                  <input
                    type="checkbox"
                    id="consent"
                    className="mt-1 mr-2"
                    required
                  />
                  <label htmlFor="consent" className="text-sm text-text-light">
                    Kişisel verilerimin, tarafıma dönüş yapılması amacıyla işlenmesine izin veriyorum.
                  </label>
                </div>
                <button type="submit" className="btn btn-primary">
                  Gönder
                </button>
              </form>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-2xl font-semibold text-primary mb-6">Sık Sorulan Sorular</h2>
              <div className="space-y-4">
                <details className="group bg-white rounded-xl overflow-hidden shadow-card">
                  <summary className="flex justify-between items-center p-6 cursor-pointer font-medium">
                    Nasıl randevu alabilirim?
                    <i className="bi bi-chevron-down text-primary group-open:rotate-180 transition-transform"></i>
                  </summary>
                  <div className="p-6 pt-0 text-text-light">
                    <p>
                      Randevu almak için online randevu sistemimizi kullanabilir, çağrı merkezimizi arayabilir veya hastanelerimize şahsen başvurabilirsiniz. Online randevu için web sitemizin "Online Randevu" bölümünü kullanabilirsiniz.
                    </p>
                  </div>
                </details>
                <details className="group bg-white rounded-xl overflow-hidden shadow-card">
                  <summary className="flex justify-between items-center p-6 cursor-pointer font-medium">
                    Hangi sigorta şirketleriyle anlaşmanız var?
                    <i className="bi bi-chevron-down text-primary group-open:rotate-180 transition-transform"></i>
                  </summary>
                  <div className="p-6 pt-0 text-text-light">
                    <p>
                      Anadolu Hastaneleri Grubu olarak, birçok özel sağlık sigortası ve tamamlayıcı sağlık sigortası ile anlaşmamız bulunmaktadır. Detaylı bilgi için çağrı merkezimizi arayabilir veya web sitemizin "Anlaşmalı Kurumlar" bölümünü ziyaret edebilirsiniz.
                    </p>
                  </div>
                </details>
                <details className="group bg-white rounded-xl overflow-hidden shadow-card">
                  <summary className="flex justify-between items-center p-6 cursor-pointer font-medium">
                    Check-up paketleriniz hakkında bilgi alabilir miyim?
                    <i className="bi bi-chevron-down text-primary group-open:rotate-180 transition-transform"></i>
                  </summary>
                  <div className="p-6 pt-0 text-text-light">
                    <p>
                      Farklı yaş grupları ve ihtiyaçlara yönelik çeşitli check-up paketlerimiz bulunmaktadır. Temel check-up, kardiyoloji check-up, kadın/erkek check-up gibi özel paketlerimiz hakkında detaylı bilgi için web sitemizin "Check-Up" bölümünü ziyaret edebilir veya çağrı merkezimizi arayabilirsiniz.
                    </p>
                  </div>
                </details>
                <details className="group bg-white rounded-xl overflow-hidden shadow-card">
                  <summary className="flex justify-between items-center p-6 cursor-pointer font-medium">
                    Hastanelerinizde otopark hizmeti var mı?
                    <i className="bi bi-chevron-down text-primary group-open:rotate-180 transition-transform"></i>
                  </summary>
                  <div className="p-6 pt-0 text-text-light">
                    <p>
                      Evet, tüm hastanelerimizde hastalarımız için ücretsiz otopark hizmeti sunmaktayız. Otopark kapasitesi hastaneden hastaneye değişiklik gösterebilir.
                    </p>
                  </div>
                </details>
                <details className="group bg-white rounded-xl overflow-hidden shadow-card">
                  <summary className="flex justify-between items-center p-6 cursor-pointer font-medium">
                    Hasta ziyaret saatleri nelerdir?
                    <i className="bi bi-chevron-down text-primary group-open:rotate-180 transition-transform"></i>
                  </summary>
                  <div className="p-6 pt-0 text-text-light">
                    <p>
                      Hasta ziyaret saatleri her gün 14:00-16:00 ve 19:00-20:00 saatleri arasındadır. Yoğun bakım ünitelerinde ise ziyaret saatleri farklılık gösterebilir, detaylı bilgi için ilgili üniteye başvurabilirsiniz.
                    </p>
                  </div>
                </details>
              </div>

              <div className="mt-8 bg-primary/10 rounded-xl p-6">
                <h3 className="text-xl font-semibold text-primary mb-4">Bizi Takip Edin</h3>
                <p className="text-text-light mb-4">
                  Sosyal medya hesaplarımızı takip ederek en güncel sağlık bilgilerine ve hastanemiz hakkındaki gelişmelere ulaşabilirsiniz.
                </p>
                <div className="flex space-x-4">
                  <a href="#" className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-colors">
                    <i className="bi bi-facebook"></i>
                  </a>
                  <a href="#" className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-colors">
                    <i className="bi bi-twitter"></i>
                  </a>
                  <a href="#" className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-colors">
                    <i className="bi bi-instagram"></i>
                  </a>
                  <a href="#" className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-colors">
                    <i className="bi bi-youtube"></i>
                  </a>
                  <a href="#" className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-colors">
                    <i className="bi bi-linkedin"></i>
                  </a>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
  );
};

const ContactPage = () => {
  return (
    <DynamicPageRenderer
      slug="iletisim"
      fallbackComponent={OriginalContactPage}
    />
  );
};

export default ContactPage;
