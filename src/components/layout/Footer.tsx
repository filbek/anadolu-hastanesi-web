import { Link } from 'react-router-dom'
import { FaFacebookF, FaTwitter, FaInstagram, FaYoutube, FaLinkedinIn, FaMapMarkerAlt, FaPhone, FaEnvelope } from 'react-icons/fa'
import Logo from '../ui/Logo'

const Footer = () => {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-primary text-white pt-16 pb-8">
      <div className="container-custom">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Logo and About */}
          <div className="space-y-4">
            <Link to="/" className="inline-block">
              <Logo variant="white" />
            </Link>
            <p className="text-white/80 text-sm">
              Anadolu Hastaneleri Grubu olarak, sağlığınız için en iyi hizmeti sunmak amacıyla çalışıyoruz. Modern teknoloji ve uzman kadromuzla yanınızdayız.
            </p>
            <div className="flex space-x-3">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-accent transition-colors duration-300">
                <FaFacebookF className="text-white" />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-accent transition-colors duration-300">
                <FaTwitter className="text-white" />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-accent transition-colors duration-300">
                <FaInstagram className="text-white" />
              </a>
              <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-accent transition-colors duration-300">
                <FaYoutube className="text-white" />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-accent transition-colors duration-300">
                <FaLinkedinIn className="text-white" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4 border-b border-white/20 pb-2">Hızlı Erişim</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/hastanelerimiz" className="text-white/80 hover:text-white transition-colors duration-200 text-sm">Hastanelerimiz</Link>
              </li>
              <li>
                <Link to="/bolumlerimiz" className="text-white/80 hover:text-white transition-colors duration-200 text-sm">Bölümlerimiz</Link>
              </li>
              <li>
                <Link to="/doktorlar" className="text-white/80 hover:text-white transition-colors duration-200 text-sm">Doktorlarımız</Link>
              </li>
              <li>
                <Link to="/saglik-rehberi" className="text-white/80 hover:text-white transition-colors duration-200 text-sm">Sağlık Rehberi</Link>
              </li>
              <li>
                <Link to="/saglik-turizmi" className="text-white/80 hover:text-white transition-colors duration-200 text-sm">Sağlık Turizmi</Link>
              </li>
              <li>
                <Link to="/iletisim" className="text-white/80 hover:text-white transition-colors duration-200 text-sm">İletişim</Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-lg font-semibold mb-4 border-b border-white/20 pb-2">Hizmetlerimiz</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/bolumlerimiz/check-up" className="text-white/80 hover:text-white transition-colors duration-200 text-sm">Check-Up</Link>
              </li>
              <li>
                <Link to="/bolumlerimiz/kardiyoloji" className="text-white/80 hover:text-white transition-colors duration-200 text-sm">Kardiyoloji</Link>
              </li>
              <li>
                <Link to="/bolumlerimiz/noroloji" className="text-white/80 hover:text-white transition-colors duration-200 text-sm">Nöroloji</Link>
              </li>
              <li>
                <Link to="/bolumlerimiz/ortopedi" className="text-white/80 hover:text-white transition-colors duration-200 text-sm">Ortopedi</Link>
              </li>
              <li>
                <Link to="/bolumlerimiz/genel-cerrahi" className="text-white/80 hover:text-white transition-colors duration-200 text-sm">Genel Cerrahi</Link>
              </li>
              <li>
                <Link to="/bolumlerimiz/goz-hastaliklari" className="text-white/80 hover:text-white transition-colors duration-200 text-sm">Göz Hastalıkları</Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-semibold mb-4 border-b border-white/20 pb-2">İletişim</h3>
            <ul className="space-y-4">
              <li className="flex items-start">
                <FaMapMarkerAlt className="text-accent mt-1 mr-3 flex-shrink-0" />
                <span className="text-white/80 text-sm">Anadolu Hastaneleri Merkez, Atatürk Bulvarı No:123, İstanbul</span>
              </li>
              <li className="flex items-center">
                <FaPhone className="text-accent mr-3 flex-shrink-0" />
                <a href="tel:+902121234567" className="text-white/80 hover:text-white transition-colors duration-200 text-sm">0212 123 45 67</a>
              </li>
              <li className="flex items-center">
                <FaEnvelope className="text-accent mr-3 flex-shrink-0" />
                <a href="mailto:info@anadoluhastaneleri.com" className="text-white/80 hover:text-white transition-colors duration-200 text-sm">info@anadoluhastaneleri.com</a>
              </li>
            </ul>
            <div className="mt-6">
              <a
                href="https://anadoluhastaneleri.kendineiyibak.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-accent"
              >
                Online Randevu
              </a>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-white/20">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-white/70 text-sm">
              &copy; {currentYear} Anadolu Hastaneleri Grubu. Tüm hakları saklıdır.
            </p>
            <div className="mt-4 md:mt-0 flex flex-wrap gap-4 text-sm text-white/70">
              <Link to="/kvkk" className="hover:text-white transition-colors duration-200">KVKK</Link>
              <Link to="/gizlilik-politikasi" className="hover:text-white transition-colors duration-200">Gizlilik Politikası</Link>
              <Link to="/cerez-politikasi" className="hover:text-white transition-colors duration-200">Çerez Politikası</Link>
              <span className="text-white/50">|</span>
              <span className="text-white/70">Designed by <a href="https://websparks.ai" target="_blank" rel="noopener noreferrer" className="text-accent hover:text-accent-light">WebSparks AI</a></span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
