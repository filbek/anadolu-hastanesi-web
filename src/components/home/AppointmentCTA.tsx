import { motion } from 'framer-motion'
import { FaCalendarCheck, FaPhone, FaUserMd } from 'react-icons/fa'

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
              className="bg-neutral rounded-xl p-6 md:p-8"
            >
              <h3 className="text-2xl font-semibold text-primary mb-6">Randevu Formu</h3>
              
              <form className="space-y-4">
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
                  <label htmlFor="phone" className="block text-sm font-medium text-text mb-1">Telefon</label>
                  <input
                    type="tel"
                    id="phone"
                    className="input-field"
                    placeholder="0555 123 45 67"
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
                  />
                </div>
                
                <div>
                  <label htmlFor="department" className="block text-sm font-medium text-text mb-1">Bölüm</label>
                  <select id="department" className="input-field">
                    <option value="">Bölüm Seçiniz</option>
                    <option value="kardiyoloji">Kardiyoloji</option>
                    <option value="noroloji">Nöroloji</option>
                    <option value="ortopedi">Ortopedi</option>
                    <option value="goz">Göz Hastalıkları</option>
                    <option value="cerrahi">Genel Cerrahi</option>
                    <option value="kadin">Kadın Hastalıkları</option>
                    <option value="cocuk">Çocuk Sağlığı</option>
                    <option value="dahiliye">Dahiliye</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="date" className="block text-sm font-medium text-text mb-1">Tarih</label>
                  <input
                    type="date"
                    id="date"
                    className="input-field"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-text mb-1">Mesaj (Opsiyonel)</label>
                  <textarea
                    id="message"
                    rows={3}
                    className="input-field resize-none"
                    placeholder="Eklemek istediğiniz notlar..."
                  ></textarea>
                </div>
                
                <div className="pt-2">
                  <button type="submit" className="btn btn-accent w-full">
                    Randevu Talebi Gönder
                  </button>
                </div>
                
                <p className="text-xs text-text-light text-center">
                  Randevu talebiniz en kısa sürede değerlendirilecektir. Alternatif olarak 
                  <a href="tel:+902121234567" className="text-primary hover:underline"> 0212 123 45 67</a> numaralı telefondan da randevu alabilirsiniz.
                </p>
              </form>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default AppointmentCTA
