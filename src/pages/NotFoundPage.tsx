import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'

const NotFoundPage = () => {
  return (
    <>
      <Helmet>
        <title>Sayfa Bulunamadı | Anadolu Hastaneleri Grubu</title>
        <meta name="description" content="Aradığınız sayfa bulunamadı. Ana sayfaya dönmek için tıklayın." />
      </Helmet>

      <div className="pt-24 pb-12 min-h-screen flex items-center">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <div className="mb-8">
                <i className="bi bi-exclamation-circle text-9xl text-primary"></i>
              </div>
              <h1 className="text-5xl md:text-6xl font-bold text-primary mb-6">404</h1>
              <h2 className="text-2xl md:text-3xl font-semibold text-text mb-4">Sayfa Bulunamadı</h2>
              <p className="text-text-light text-lg mb-8">
                Aradığınız sayfa bulunamadı veya taşınmış olabilir. Lütfen ana sayfaya dönün veya aşağıdaki bağlantıları kullanın.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link to="/" className="btn btn-primary">
                  Ana Sayfa
                </Link>
                <Link to="/iletisim" className="btn btn-outline">
                  İletişim
                </Link>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="mt-16"
            >
              <h3 className="text-xl font-semibold text-primary mb-6">Hızlı Erişim</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Link to="/hastanelerimiz" className="card p-4 hover:bg-neutral transition-colors">
                  <i className="bi bi-hospital text-2xl text-primary mb-2"></i>
                  <span className="text-text-light">Hastanelerimiz</span>
                </Link>
                <Link to="/bolumlerimiz" className="card p-4 hover:bg-neutral transition-colors">
                  <i className="bi bi-clipboard2-pulse text-2xl text-primary mb-2"></i>
                  <span className="text-text-light">Bölümlerimiz</span>
                </Link>
                <Link to="/doktorlar" className="card p-4 hover:bg-neutral transition-colors">
                  <i className="bi bi-person-badge text-2xl text-primary mb-2"></i>
                  <span className="text-text-light">Doktorlarımız</span>
                </Link>
                <Link to="/saglik-rehberi" className="card p-4 hover:bg-neutral transition-colors">
                  <i className="bi bi-journal-medical text-2xl text-primary mb-2"></i>
                  <span className="text-text-light">Sağlık Rehberi</span>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </>
  );
};

export default NotFoundPage;
