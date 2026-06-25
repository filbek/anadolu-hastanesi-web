import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import { useTranslation } from 'react-i18next'
import { FaCalendarAlt, FaUserMd, FaBaby, FaHeart, FaStethoscope, FaBookOpen } from 'react-icons/fa'
import { getActiveSeminars, GebeOkuluSeminar } from '../services/gebeOkuluService'
import { defaultSeminars } from '../data/gebeOkuluSeminars'

const features = (t: any) => [
  { icon: <FaUserMd />, title: t('gebe.featureExpert', 'Uzman Kadro'), desc: t('gebe.featureExpertDesc', 'Jinekolog, ebe ve diyetisyenlerden oluşan deneyimli ekibimizle bilgilendirme.') },
  { icon: <FaBaby />, title: t('gebe.featureWorkshop', 'Pratik Uygulamalar'), desc: t('gebe.featureWorkshopDesc', 'Teorik bilginin yanı sıra uygulamalı doğum hazırlık ve bebek bakım uygulamaları.') },
  { icon: <FaHeart />, title: t('gebe.featureFamily', 'Aile Desteği'), desc: t('gebe.featureFamilyDesc', 'Eşlerin de katıldığı seminerlerle aile bütünlüğü içinde hazırlık süreci.') },
  { icon: <FaStethoscope />, title: t('gebe.featureFreeCheck', 'Ücretsiz Kontrol'), desc: t('gebe.featureFreeCheckDesc', 'Seminer sonrası ücretsiz doktor konsültasyonu ve check-up imkanı.') },
];

const GebeOkuluPage = () => {
  const { t } = useTranslation();
  const [seminars, setSeminars] = useState<GebeOkuluSeminar[]>(defaultSeminars);

  useEffect(() => {
    const fetchSeminars = async () => {
      try {
        const data = await getActiveSeminars();
        if (data && data.length > 0) {
          setSeminars(data);
        }
      } catch (err) {
        console.warn('Could not fetch seminars from DB, using fallback data:', err);
      }
    };
    fetchSeminars();
  }, []);

  return (
    <div className="bg-white min-h-screen">
      <Helmet>
        <title>{t('gebe.pageTitle', 'Gebe Okulu')} | Anadolu Hastaneleri Grubu</title>
        <meta name="description" content={t('gebe.metaDescription', "Anadolu Hastaneleri Gebe Okulu'nda uzman kadromuzla anne adaylarına özel seminerler ve eğitimler.")} />
      </Helmet>

      {/* Hero */}
      <section className="relative pt-32 pb-20 bg-gradient-to-br from-rose-50 to-sky-50 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-rose-100/50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-sky-100/50 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4" />
        <div className="container-custom relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-rose-100 text-rose-700 rounded-full text-sm font-bold mb-6">
              <FaBaby />
              {t('gebe.badge', 'Anne Adaylarına Özel')}
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-primary mb-4">
              {t('gebe.title', 'Gebe Okulu')}
            </h1>
            <p className="text-lg text-slate-500 leading-relaxed">
              {t('gebe.description', "Anadolu Hastaneleri Gebe Okulu'nda, anne adaylarına gebelik sürecinden doğuma, yenidoğan bakımından emzirmeye kadar her konuda uzman kadromuzla destek oluyoruz. Sağlıklı bir gebelik ve mutlu bir doğum için bilgi dolu seminerlerimize davetlisiniz.")}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16">
        <div className="container-custom">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features(t).map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-slate-50 rounded-2xl p-6 text-center"
              >
                <div className="w-14 h-14 bg-rose-100 text-rose-600 rounded-xl flex items-center justify-center text-xl mx-auto mb-4">
                  {feature.icon}
                </div>
                <h3 className="font-bold text-primary mb-2">{feature.title}</h3>
                <p className="text-sm text-slate-500">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Seminars */}
      <section className="py-16 bg-slate-50">
        <div className="container-custom">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary text-xl">
              <FaBookOpen />
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-primary">{t('gebe.seminarsTitle', 'Düzenlediğimiz Seminerler')}</h2>
              <p className="text-slate-500 text-sm">{t('gebe.seminarsSubtitle', 'Gebe okulumuzda gerçekleştirdiğimiz eğitim ve atölyelerden öne çıkanlar')}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {seminars.map((seminar, i) => (
              <motion.article
                key={seminar.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 hover:shadow-md transition-all duration-300 flex flex-col"
              >
                <div className="relative h-64 overflow-hidden bg-slate-100">
                  {seminar.link_url ? (
                    <a
                      href={seminar.link_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full h-full cursor-pointer overflow-hidden group"
                      title={`${seminar.title} sayfasına git`}
                    >
                      <img
                        src={seminar.image}
                        alt={seminar.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                      />
                    </a>
                  ) : (
                    <img
                      src={seminar.image}
                      alt={seminar.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  )}
                  <div className="absolute top-4 left-4 px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-semibold text-primary shadow-sm">
                    {seminar.date}
                  </div>
                </div>
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-primary mb-3">{seminar.title}</h3>
                    <p className="text-sm text-slate-500 mb-4 leading-relaxed">{seminar.summary}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {Array.isArray(seminar.topics) && seminar.topics.map((topic, idx) => (
                      <span key={idx} className="px-3 py-1 bg-rose-50 text-rose-700 text-xs font-medium rounded-full">
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16">
        <div className="container-custom">
          <div className="bg-primary rounded-3xl p-8 md:p-12 text-center text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:24px_24px] opacity-5" />
            <div className="relative z-10">
              <h2 className="text-2xl md:text-3xl font-bold mb-4">{t('gebe.ctaTitle', "Gebe Okulu'na Katılmak İster misiniz?")}</h2>
              <p className="text-white/70 max-w-xl mx-auto mb-8">
                {t('gebe.ctaDesc', 'Uzman kadromuzla birlikte sağlıklı bir gebelik süreci geçirmek için seminerlerimize kaydolun. Tüm seminerlerimiz ücretsizdir.')}
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <a
                  href="https://anadoluhastaneleri.kendineiyibak.app/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-8 py-3.5 bg-coral hover:bg-coral-600 text-white rounded-full font-bold transition-colors"
                >
                  <FaCalendarAlt />
                  {t('common.appointment', 'Randevu Al')}
                </a>
                <a href="tel:4445058" className="inline-flex items-center gap-2 px-8 py-3.5 bg-white/10 hover:bg-white/20 text-white rounded-full font-bold transition-colors border border-white/20">
                  444 50 58
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default GebeOkuluPage
