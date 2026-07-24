import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import {
  FaShieldAlt,
  FaChevronRight,
  FaCheckCircle,
  FaPhoneAlt,
  FaEnvelope,
  FaFileAlt,
  FaComments,
  FaClipboardList,
} from 'react-icons/fa';
import LastUpdated from '../components/ui/LastUpdated';

const ComplaintPolicyPage = () => {
  const { t } = useTranslation();

  const channels = [
    {
      icon: <FaFileAlt />,
      title: t('complaint.channelWeb', 'Web Formu'),
      desc: t('complaint.channelWebDesc', 'Web sayfamızdaki "Sizi Dinliyoruz" formunu doldurarak görüşünüzü iletebilirsiniz.'),
      action: t('complaint.channelWebAction', 'Forma Git'),
      link: '/sizi-dinliyoruz',
    },
    {
      icon: <FaClipboardList />,
      title: t('complaint.channelSurvey', 'Anket Formu'),
      desc: t('complaint.channelSurveyDesc', 'Katlarda ve bekleme salonlarında bulunan anket formlarını doldurabilirsiniz.'),
      action: null,
      link: null,
    },
    {
      icon: <FaComments />,
      title: t('complaint.channelFace', 'Yüz Yüze Görüşme'),
      desc: t('complaint.channelFaceDesc', 'Hasta Hakları Birimi yetkilileri ile yüz yüze görüşme talep edebilirsiniz.'),
      action: null,
      link: null,
    },
    {
      icon: <FaPhoneAlt />,
      title: t('complaint.channelPhone', 'Telefon'),
      desc: t('complaint.channelPhoneDesc', 'Hasta Hakları Birimi ile telefon aracılığıyla görüşme yapabilirsiniz.'),
      action: t('complaint.channelPhoneAction', 'Ara'),
      link: 'tel:4445058',
    },
    {
      icon: <FaEnvelope />,
      title: t('complaint.channelMail', 'Posta'),
      desc: t('complaint.channelMailDesc', 'Posta adresimize mektup göndererek görüş ve önerilerinizi iletebilirsiniz.'),
      action: null,
      link: null,
    },
    {
      icon: <FaEnvelope />,
      title: t('complaint.channelEmail', 'E-Posta'),
      desc: t('complaint.channelEmailDesc', 'Elektronik posta aracılığıyla hastahaklari@anadoluhastaneleri.com adresine yazabilirsiniz.'),
      action: t('complaint.channelEmailAction', 'E-Posta Gönder'),
      link: 'mailto:hastahaklari@anadoluhastaneleri.com',
    },
  ];

  const process = [
    {
      step: '01',
      title: t('complaint.step1Title', 'Başvurunun Alınması'),
      desc: t('complaint.step1Desc', 'Hasta Hakları Birimi, iletilen tüm görüş, öneri ve şikayeti kaydeder ve başvurana bilgi verir.'),
    },
    {
      step: '02',
      title: t('complaint.step2Title', 'Değerlendirme'),
      desc: t('complaint.step2Desc', 'Bildirilen görüşler ilgili departman yöneticileri ile birlikte değerlendirilir ve incelenir.'),
    },
    {
      step: '03',
      title: t('complaint.step3Title', 'Çözüm Üretme'),
      desc: t('complaint.step3Desc', 'Üst düzey yöneticilerimizin katılımıyla çözüm odaklı kararlar alınır ve uygulamaya konulur.'),
    },
    {
      step: '04',
      title: t('complaint.step4Title', 'Geri Bildirim'),
      desc: t('complaint.step4Desc', 'Değerlendirme sonuçları ve alınan kararlar hakkında başvuruya geri dönüş yapılır.'),
    },
  ];
  return (
    <>
      <Helmet>
        <title>{t('complaint.pageTitle', 'Şikayet Politikası')} | Anadolu Hastaneleri Grubu</title>
        <meta
          name="description"
          content={t('complaint.metaDescription', 'Anadolu Hastaneleri Grubu şikayet yönetim politikası ve hasta ilişkileri süreçleri.')}
        />
      </Helmet>

      {/* ─── HERO ─── */}
      <section className="relative min-h-[420px] md:min-h-[500px] flex items-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1581579440071-2b13d57e1fe7?ixlib=rb-4.0.3&auto=format&fit=crop&w=2400&q=80')",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0a1628]/95 via-[#0a1628]/80 to-[#0a1628]/50" />
        <div className="absolute left-0 top-0 h-full w-1 bg-accent" />

        <div className="container-custom relative z-10 py-24">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-3xl"
          >
            <div className="flex items-center gap-2 mb-6">
              <span className="block h-px w-10 bg-accent" />
              <span className="text-accent text-xs uppercase tracking-[0.25em] font-semibold">Hasta Hakları Birimi</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-white leading-tight mb-6">
              {t('complaint.titleLine1', 'Şikayet')}
              <br />
              <span className="text-accent">{t('complaint.titleLine2', 'Politikası')}</span>
            </h1>
            <p className="text-white/70 text-lg md:text-xl leading-relaxed max-w-xl">
              {t('complaint.subtitle', 'Görüşlerinizi ciddiye alıyor, hizmet kalitemizi sürekli iyileştirmek için çalışıyoruz.')}
            </p>
          </motion.div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 overflow-hidden">
          <svg viewBox="0 0 1440 60" preserveAspectRatio="none" className="w-full h-12 md:h-16 fill-white">
            <polygon points="0,60 1440,0 1440,60" />
          </svg>
        </div>
      </section>

      {/* ─── POLICY TEXT ─── */}
      <section className="bg-white py-20 lg:py-28">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
            {/* Intro text */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="lg:col-span-2"
            >
              <div className="flex items-center gap-3 mb-5">
                <span className="block h-px w-[60px] bg-accent" />
                <span className="text-xs uppercase tracking-[0.25em] text-accent font-bold">{t('complaint.policyTag', 'Politikamız')}</span>
              </div>
              <h2 className="text-4xl lg:text-5xl font-black text-secondary leading-tight mb-8">
                {t('complaint.sectionTitle', 'Hasta Hakları')} <span className="text-primary">{t('complaint.sectionHighlight', 'Birimimiz')}</span>
              </h2>

              <div className="space-y-5 text-gray-600 text-lg leading-relaxed">
                <p>
                  <strong className="text-secondary">Hasta Hakları Birimi</strong> olarak; hastanelerimizden arzu ettiğiniz hizmeti almak ve sizlerin memnuniyetini sağlamak için çalışmaktayız.
                </p>
                <p>
                  Hastanemizden hizmet alan tüm hasta ve yakınlarının hastanemiz ile ilgili <strong className="text-secondary">görüş ve düşüncelerini alır</strong>. Bildirilen tüm görüşleri ilgili departman yöneticileri ile değerlendirir ve sizlerin talepleri doğrultusunda hizmet kalitemizi artırmak için çalışırız.
                </p>
                <p>
                  Değerlendirme sonrası alınan kararlar ve sonuçlar hakkında, bölüme bildirimi yapan hastamıza <strong className="text-secondary">geri dönüş yaparız</strong>.
                </p>
                <p>
                  Hasta Hakları Birimi, sizlerin memnuniyetine katkı sağladığı kadar, sizlerin de öneri ve görüşleriniz ile hastanemizin gelişimine katkı sağlar. Şikayetleriniz ve olumsuz görüşlerinizle de sadece Hasta Hakları Birimimiz değil ilgili tüm üst düzey yöneticilerimiz <strong className="text-secondary">çözüm amaçlı ilgilenir</strong>.
                </p>
              </div>
            </motion.div>

            {/* Sidebar — key principles */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="lg:col-span-1"
            >
              <div className="bg-primary rounded-2xl p-8 text-white sticky top-8">
                <div className="flex items-center gap-3 mb-6">
                  <FaShieldAlt className="text-accent text-2xl" />
                  <p className="font-bold text-lg">{t('complaint.principlesTitle', 'Temel İlkelerimiz')}</p>
                </div>
                <ul className="space-y-4">
                  {[
                    t('complaint.principle1', 'Tarafsız ve adil değerlendirme'),
                    t('complaint.principle2', 'Gizlilik ve kişisel veri güvenliği'),
                    t('complaint.principle3', 'Zamanında geri bildirim'),
                    t('complaint.principle4', 'Çözüm odaklı yaklaşım'),
                    t('complaint.principle5', 'Sürekli iyileştirme taahhüdü'),
                    t('complaint.principle6', 'Şeffaf iletişim'),
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-white/90 text-sm">
                      <FaCheckCircle className="text-accent flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>

                <div className="mt-8 pt-6 border-t border-white/10">
                  <a
                    href="/sizi-dinliyoruz"
                    className="flex items-center justify-center gap-2 w-full py-3 bg-accent text-white font-bold rounded-xl hover:brightness-110 transition-all"
                  >
                    {t('complaint.feedbackButton', 'Görüş Bildir')}
                    <FaChevronRight />
                  </a>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── PROCESS ─── */}
      <section className="bg-gray-50 py-20 lg:py-28">
        <div className="container-custom">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="max-w-2xl mb-14">
            <div className="flex items-center gap-3 mb-5">
              <span className="block h-px w-[60px] bg-accent" />
              <span className="text-xs uppercase tracking-[0.25em] text-accent font-bold">Süreç</span>
            </div>
            <h2 className="text-4xl lg:text-5xl font-black text-secondary leading-tight mb-4">
              {t('complaint.processTitle', 'Başvuru')} <span className="text-primary">{t('complaint.processHighlight', 'Süreci')}</span>
            </h2>
            <p className="text-gray-500 text-lg">
              {t('complaint.processDesc', 'Şikayet ve görüşlerinizin nasıl ele alındığını şeffaf bir şekilde paylaşıyoruz.')}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {process.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="relative bg-white rounded-2xl p-7 border border-gray-100 shadow-sm overflow-hidden group hover:shadow-md transition-all"
              >
                <span className="absolute -top-2 -right-2 text-[80px] font-black text-gray-50 leading-none select-none">
                  {step.step}
                </span>
                <div className="relative z-10">
                  <span className="inline-block px-3 py-1 bg-primary text-white text-xs font-bold rounded-full mb-4">{step.step}</span>
                  <h3 className="text-lg font-bold text-secondary mb-3">{step.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CHANNELS ─── */}
      <section className="bg-white py-20 lg:py-28">
        <div className="container-custom">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="max-w-2xl mb-14">
            <div className="flex items-center gap-3 mb-5">
              <span className="block h-px w-[60px] bg-accent" />
              <span className="text-xs uppercase tracking-[0.25em] text-accent font-bold">Başvuru Kanalları</span>
            </div>
            <h2 className="text-4xl lg:text-5xl font-black text-secondary leading-tight mb-4">
              {t('complaint.channelsTitle', 'Bize')} <span className="text-primary">{t('complaint.channelsHighlight', 'Nasıl Ulaşırsınız?')}</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {channels.map((ch, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="bg-gray-50 rounded-2xl p-7 border border-gray-100 hover:border-primary/20 hover:shadow-md transition-all duration-300 group"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center text-xl mb-5 group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                  {ch.icon}
                </div>
                <h3 className="text-lg font-bold text-secondary mb-2">{ch.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed mb-4">{ch.desc}</p>
                {ch.action && ch.link && (
                  <a
                    href={ch.link}
                    className="inline-flex items-center gap-2 text-primary font-bold text-sm hover:gap-3 transition-all"
                  >
                    {ch.action} <FaChevronRight className="text-xs" />
                  </a>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── BOTTOM CTA ─── */}
      <section className="bg-primary py-14">
        <div className="container-custom flex flex-col md:flex-row items-center justify-between gap-6">
          <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <p className="text-accent text-xs uppercase tracking-[0.2em] font-bold mb-2">{t('common.brand', 'Anadolu Hastaneleri Grubu')}</p>
            <h3 className="text-2xl md:text-3xl font-black text-white">{t('complaint.bottomCta', 'Görüşünüzü Paylaşın')}</h3>
          </motion.div>
          <motion.a
            href="/sizi-dinliyoruz"
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex-shrink-0 inline-flex items-center gap-2 px-8 py-4 bg-accent text-white font-bold rounded-xl hover:brightness-110 transition-all"
          >
            {t('complaint.feedbackButton', 'Görüş Bildir')}
            <FaChevronRight className="text-sm" />
          </motion.a>
        </div>
      </section>

      <section className="bg-white py-6 border-t border-gray-100">
        <div className="container-custom">
          <LastUpdated date="22.06.2026" />
        </div>
      </section>
    </>
  );
};

export default ComplaintPolicyPage;
