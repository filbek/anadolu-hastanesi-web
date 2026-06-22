import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { FaChevronRight } from 'react-icons/fa';
import SecondOpinionSection from '../components/home/SecondOpinionSection';

const SecondOpinionPage = () => {
  const { t } = useTranslation();

  return (
    <div className="animate-fadeIn">
      <Helmet>
        <title>{t('secondOpinion.pageTitle', 'İkinci Görüş Alın')} | Anadolu Hastaneleri Grubu</title>
        <meta
          name="description"
          content={t(
            'secondOpinion.pageMetaDesc',
            'Tanı ve tedavi planınız hakkında alanında uzman hekimlerimizden ikinci görüş alın. Raporlarınızı yükleyin, 24-48 saat içinde size dönüş yapalım.'
          )}
        />
      </Helmet>

      <section className="pt-32 pb-12 bg-primary text-white">
        <div className="container-custom">
          <motion.nav
            initial={{ x: -16, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="flex items-center space-x-2 text-sm text-white/70 mb-6"
          >
            <Link to="/" className="hover:text-white transition-colors">{t('nav.home', 'Ana Sayfa')}</Link>
            <FaChevronRight className="text-[10px]" />
            <span className="text-white font-medium">{t('secondOpinion.tag', 'İkinci Görüş')}</span>
          </motion.nav>
          <motion.h1
            initial={{ y: 16, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="text-3xl md:text-5xl font-bold leading-tight"
          >
            {t('secondOpinion.pageTitle', 'İkinci Görüş Alın')}
          </motion.h1>
        </div>
      </section>

      <SecondOpinionSection />
    </div>
  );
};

export default SecondOpinionPage;
