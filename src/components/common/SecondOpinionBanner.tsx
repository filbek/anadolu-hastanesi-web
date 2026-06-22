import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { FaUserMd, FaShieldAlt, FaClock, FaArrowRight, FaCommentMedical } from 'react-icons/fa';

// Sayfa altlarında kullanılan kompakt "İkinci Görüş" çağrı banner'ı.
// Tam başvuru formu /ikinci-gorus sayfasındadır; bu bileşen oraya yönlendirir.
const SecondOpinionBanner = () => {
  const { t } = useTranslation();

  const trustItems = [
    { icon: <FaUserMd />, text: t('secondOpinion.feature1Title', 'Uzman Kadro') },
    { icon: <FaClock />, text: t('secondOpinion.bannerFast', '24-48 Saat İçinde Dönüş') },
    { icon: <FaShieldAlt />, text: t('secondOpinion.bannerPrivacy', 'KVKK Güvencesi') },
  ];

  return (
    <section className="py-16">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="relative rounded-[2.5rem] overflow-hidden bg-primary shadow-2xl shadow-primary/20"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2">
            {/* Text */}
            <div className="relative z-10 p-10 lg:p-14 text-white">
              <div className="flex items-center gap-2 mb-5">
                <span className="block h-px w-10 bg-accent" />
                <span className="text-accent text-xs uppercase tracking-[0.25em] font-semibold">
                  {t('secondOpinion.tag', 'İkinci Görüş')}
                </span>
              </div>
              <h2 className="text-2xl lg:text-3xl font-black leading-tight mb-4">
                {t('secondOpinion.bannerTitle', 'Tanınız veya tedavi planınız hakkında emin olmak mı istiyorsunuz?')}
              </h2>
              <p className="text-white/80 leading-relaxed mb-8 max-w-lg">
                {t(
                  'secondOpinion.bannerDesc',
                  'Raporlarınızı yükleyin, alanında uzman hekimlerimiz mevcut tanı ve tedavi planınızı değerlendirip size dönüş yapsın.'
                )}
              </p>

              <div className="flex flex-wrap gap-3 mb-8">
                {trustItems.map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 text-sm font-semibold"
                  >
                    <span className="text-accent">{item.icon}</span> {item.text}
                  </div>
                ))}
              </div>

              <Link
                to="/ikinci-gorus"
                className="inline-flex items-center gap-3 px-8 py-4 bg-accent text-white font-bold rounded-xl hover:brightness-110 active:scale-[0.99] transition-all text-lg shadow-xl shadow-accent/20"
              >
                <FaCommentMedical />
                {t('secondOpinion.bannerCta', 'Uzman Görüşü Talep Et')}
                <FaArrowRight className="text-sm" />
              </Link>
            </div>

            {/* Visual */}
            <div className="relative min-h-[260px] lg:min-h-0">
              <img
                src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=900&q=80"
                alt={t('secondOpinion.bannerImageAlt', 'Uzman doktor hasta raporlarını inceliyor')}
                className="absolute inset-0 w-full h-full object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary/40 to-transparent lg:bg-gradient-to-r" />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default SecondOpinionBanner;
