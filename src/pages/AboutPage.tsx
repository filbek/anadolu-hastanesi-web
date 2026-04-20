import DynamicPageRenderer from '../components/common/DynamicPageRenderer'
import { motion } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import { FaHospital, FaUserMd, FaUsers, FaCalendarAlt } from 'react-icons/fa'

// Original about page as fallback
const OriginalAboutPage = () => {
  const milestones = [
    { year: '2005', title: 'Kuruluş', description: 'Şişli\'de ilk butik hastanemizle yola çıktık.', icon: '🚀' },
    { year: '2010', title: 'Global Standartlar', description: 'JCI Akreditasyonu ile kalitemizi tescilledik.', icon: '💎' },
    { year: '2015', title: 'Teknoloji Hamlesi', description: 'Robotik cerrahi ve yapay zeka entegrasyonu.', icon: '🤖' },
    { year: '2023', title: 'Geleceğin Sağlığı', description: '6 hastane ve 1 milyon+ mutlu hasta.', icon: '🌟' },
  ];

  const values = [
    { icon: 'bi-heart-pulse-fill', title: 'İnsan Odaklılık', description: 'Her hastamızın hikayesini dinliyor, kişiye özel çözümler sunuyoruz.', color: 'from-blue-500 to-indigo-600' },
    { icon: 'bi-shield-shaded', title: 'Sarsılmaz Güven', description: 'Şeffaflık ve etik değerler bizim en temel çalışma prensibimizdir.', color: 'from-teal-400 to-emerald-600' },
    { icon: 'bi-cpu-fill', title: 'Sürekli İnovasyon', description: 'Tıbbi teknolojideki en son gelişmeleri anlık olarak sistemimize entegre ediyoruz.', color: 'from-amber-400 to-orange-600' },
  ];

  const stats = [
    { icon: <FaHospital />, value: 6, suffix: '', label: 'Hastanelerimiz' },
    { icon: <FaUserMd />, value: 500, suffix: '+', label: 'Uzman Kadro' },
    { icon: <FaUsers />, value: 2500, suffix: '+', label: 'Sağlık Profesyoneli' },
    { icon: <FaCalendarAlt />, value: 1, suffix: 'M+', label: 'Yıllık Hasta' },
  ];

  return (
    <div className="bg-white overflow-hidden">
      <Helmet>
        <title>Hakkımızda | Anadolu Hastaneleri Grubu</title>
        <meta name="description" content="Anadolu Hastaneleri Grubu'nun 2005'ten bugüne uzanan başarı hikayesi ve değerleri." />
      </Helmet>

      {/* --- HERO SECTION: World Class Impact --- */}
      <section className="relative h-[85vh] flex items-center pt-24 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <motion.img
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            src="https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1920&q=80"
            className="w-full h-full object-cover"
            alt="Modern Hospital Architecture"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/90 via-primary/40 to-transparent" />
        </div>

        <div className="container-custom relative z-10">
          <div className="max-w-3xl">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-xl border border-white/20 px-4 py-2 rounded-full mb-6">
                <span className="w-2 h-2 bg-accent rounded-full animate-pulse" />
                <span className="text-white/80 text-sm font-bold tracking-widest uppercase">Geleceğin Sağlık Vizyonu</span>
              </div>
              <h1 className="text-5xl md:text-7xl font-extrabold text-white leading-tight mb-8">
                Değeriniz, <br />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-accent to-accent-light">Sizin Sağlığınız.</span>
              </h1>
              <p className="text-xl text-white/70 leading-relaxed mb-10 max-w-xl">
                2005'ten bugüne, her dokunuşta şifa, her adımda güven taşıyoruz. Sadece tedavi etmiyor, geleceği tasarlıyoruz.
              </p>
              <div className="flex flex-wrap gap-5">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 bg-primary text-white rounded-2xl font-bold shadow-2xl shadow-primary/30 hover:shadow-primary/50 transition-all"
                >
                  Ekibimizi Tanıyın
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 bg-white/10 backdrop-blur-xl text-white border border-white/20 rounded-2xl font-bold hover:bg-white/20 transition-all"
                >
                  Online Randevu
                </motion.button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* --- STATS: Glassmorphism Numbers --- */}
      <div className="relative z-20 -mt-20 container-custom">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="glass-modern p-8 text-center"
            >
              <div className="text-accent text-3xl mb-4 flex justify-center">{stat.icon}</div>
              <h3 className="text-4xl font-extrabold text-primary mb-1">
                {stat.value}{stat.suffix}
              </h3>
              <p className="text-slate-500 font-bold uppercase text-[11px] tracking-widest">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* --- CORE VALUES: Dynamic Cards --- */}
      <section className="py-24 bg-slate-50/50">
        <div className="container-custom">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-sm font-extrabold text-accent uppercase tracking-[0.2em] mb-4">Değerlerimiz</h2>
            <p className="text-3xl md:text-4xl font-extrabold text-primary tracking-tight">
              Sağlık Hizmetinde Kusursuzluğun Temelleri
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {values.map((v, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -10 }}
                className="group relative bg-white p-10 rounded-3xl border border-slate-100 shadow-xl hover:shadow-2xl transition-all duration-500"
              >
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${v.color} flex items-center justify-center text-white text-2xl mb-8 transform transition-transform group-hover:rotate-12`}>
                  <i className={`bi ${v.icon}`}></i>
                </div>
                <h3 className="text-xl font-bold text-primary mb-4">{v.title}</h3>
                <p className="text-slate-500 leading-relaxed font-medium">{v.description}</p>
                <div className="absolute top-0 right-0 p-8 text-slate-50 opacity-10 text-6xl font-black">{i + 1}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* --- TIMELINE: Editorial Path --- */}
      <section className="py-24 bg-white">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="relative">
              <div className="absolute top-0 left-0 w-full h-full bg-primary/5 rounded-[40px] transform rotate-3" />
              <img
                src="https://images.unsplash.com/photo-1551076805-e1869033e561?auto=format&fit=crop&w=800&q=80"
                className="relative z-10 w-full rounded-[40px] shadow-2xl"
                alt="Hospital Operations"
              />
              <div className="absolute -bottom-8 -right-8 glass-modern p-8 z-20 hidden md:block">
                <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-1">Kuruluş Tarihi</p>
                <p className="text-3xl font-black text-primary">Haziran 2005</p>
              </div>
            </div>

            <div className="space-y-12">
              <div>
                <h2 className="text-accent font-black uppercase text-xs tracking-widest mb-4">Yolculuğumuz</h2>
                <h3 className="text-4xl font-extrabold text-primary leading-tight mb-6">Türkiye'nin Sağlık Gururu Olma Yolunda</h3>
              </div>

              <div className="space-y-8 relative">
                <div className="absolute left-6 top-8 bottom-8 w-[2px] bg-slate-100" />
                {milestones.map((m, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    className="flex items-start space-x-8 relative group"
                  >
                    <div className="w-12 h-12 rounded-full bg-white border-2 border-slate-100 flex items-center justify-center text-lg shadow-sm z-10 group-hover:border-accent transition-colors">
                      {m.icon}
                    </div>
                    <div>
                      <span className="text-accent font-bold text-sm tracking-widest">{m.year}</span>
                      <h4 className="text-lg font-bold text-primary mb-1">{m.title}</h4>
                      <p className="text-slate-500 text-sm leading-relaxed">{m.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- CTA: Premium Finish --- */}
      <section className="py-24">
        <div className="container-custom">
          <div className="relative bg-primary rounded-[50px] p-12 md:p-24 overflow-hidden text-center">
            <div className="absolute top-0 right-0 w-64 h-64 bg-accent/20 rounded-full -mr-32 -mt-32 blur-[80px]" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/20 rounded-full -ml-32 -mb-32 blur-[80px]" />

            <div className="relative z-10">
              <h2 className="text-white text-4xl md:text-6xl font-black mb-8 leading-tight">
                Sağlığınız, <br />
                Profesyonel Ellerde.
              </h2>
              <p className="text-white/60 text-lg mb-10 max-w-2xl mx-auto">
                En ileri tıp teknolojileri ve şefkat dolu bakış açımızla her gün binlerce hayata dokunuyoruz. Siz de Anadolu Hastaneleri farkını yaşayın.
              </p>
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(0,0,0,0.3)" }}
                className="px-12 py-5 bg-accent text-white rounded-full font-black uppercase tracking-widest text-sm hover:bg-accent-light transition-all"
              >
                Hemen Randevu Alın
              </motion.button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

const AboutPage = () => {
  return (
    <DynamicPageRenderer
      slug="hakkimizda"
      fallbackComponent={OriginalAboutPage}
    />
  );
};

export default AboutPage;
