import { motion } from 'framer-motion'
import { FaCalendarCheck, FaPhone, FaUserMd, FaClock } from 'react-icons/fa'

const AppointmentCTA = () => {
  return (
    <section className="py-20 bg-neutral relative overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <img
          src="https://images.unsplash.com/photo-1579684385127-1ef15d508118?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2000&q=80"
          alt="Background"
          className="w-full h-full object-cover"
          loading="lazy"
          crossOrigin="anonymous"
        />
      </div>
      
      <div className="container-custom relative z-10">
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <motion.h2 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="text-3xl md:text-4xl font-bold text-primary mb-4"
              >
                Sağlığınız İçin Hemen Randevu Alın
              </motion.h2>
              
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-text-light mb-8"
              >
                Anadolu Hastaneleri Grubu olarak, sağlığınız için en iyi hizmeti sunmak amacıyla çalışıyoruz. 
                Uzman doktorlarımız ve modern teknolojimizle sağlığınız için buradayız.
              </motion.p>
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="space-y-4"
              >
                <div className="flex items-start">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mr-4 flex-shrink-0">
                    <FaUserMd className="text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-text mb-1">Uzman Doktorlar</h3>
                    <p className="text-sm text-text-light">Alanında uzman ve deneyimli doktor kadromuzla hizmetinizdeyiz.</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mr-4 flex-shrink-0">
                    <FaCalendarCheck className="text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-text mb-1">Kolay Randevu</h3>
                    <p className="text-sm text-text-light">Online randevu sistemi ile hızlıca randevu alabilirsiniz.</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mr-4 flex-shrink-0">
                    <FaPhone className="text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-text mb-1">7/24 Destek</h3>
                    <p className="text-sm text-text-light">Sorularınız için 7/24 destek hattımız hizmetinizdedir.</p>
                  </div>
                </div>
              </motion.div>
            </div>
            
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="bg-neutral rounded-xl p-6 md:p-8 text-center"
            >
              <h3 className="text-2xl font-semibold text-primary mb-6">Online Randevu Sistemi</h3>

              <div className="mb-8">
                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaCalendarCheck className="text-primary text-3xl" />
                </div>
                <p className="text-text-light mb-6">
                  Gelişmiş online randevu sistemimiz ile kolayca randevu alabilir,
                  randevularınızı yönetebilir ve doktorlarımızla iletişim kurabilirsiniz.
                </p>
              </div>

              <div className="space-y-4">
                <a
                  href="https://anadoluhastaneleri.kendineiyibak.app/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-accent w-full text-lg py-4"
                >
                  <FaCalendarCheck className="mr-3" />
                  Online Randevu Al
                </a>

                <div className="flex items-center justify-center space-x-4 text-sm text-text-light">
                  <span>Veya telefonla arayın:</span>
                  <a
                    href="tel:+902121234567"
                    className="text-primary hover:text-primary-dark font-medium"
                  >
                    0212 123 45 67
                  </a>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center justify-center">
                    <FaCalendarCheck className="text-primary mr-2" />
                    <span>7/24 Online Randevu</span>
                  </div>
                  <div className="flex items-center justify-center">
                    <FaPhone className="text-primary mr-2" />
                    <span>Anında Onay</span>
                  </div>
                  <div className="flex items-center justify-center">
                    <FaClock className="text-primary mr-2" />
                    <span>Esnek Saatler</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default AppointmentCTA
