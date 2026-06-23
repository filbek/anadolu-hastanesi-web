import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  FaFacebookF,
  FaTwitter,
  FaInstagram,
  FaYoutube,
  FaLinkedinIn,
  FaMapMarkerAlt,
  FaPhone,
  FaEnvelope,
  FaCalendarCheck,
} from 'react-icons/fa'
import Logo from '../ui/Logo'

const Footer = () => {
  const { t } = useTranslation()
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-[#0A1628] text-white">
      {/* Main Footer */}
      <div className="container-custom pt-20 pb-12">
        {/* Row 1: Logo + Manifesto + Social */}
        <div className="flex flex-col lg:flex-row justify-between items-start gap-10 pb-12 border-b border-white/10">
          <div className="max-w-sm">
            <Link to="/" className="inline-block mb-5">
              <Logo variant="white" clickable={false} />
            </Link>
            <p className="text-white/60 text-sm leading-relaxed mb-6">
              {t('footer.manifesto')}
            </p>
            <div className="flex gap-3">
              {[
                { icon: <FaFacebookF size={14} />, href: 'https://www.facebook.com/anadoluhastanelergrubu', label: 'Facebook' },
                { icon: <FaTwitter size={14} />, href: 'https://x.com/AnadoluHast', label: 'Twitter' },
                { icon: <FaInstagram size={14} />, href: 'https://www.instagram.com/anadoluhastanelergrubu/', label: 'Instagram' },
                { icon: <FaYoutube size={14} />, href: 'https://www.youtube.com/channel/UCCTPl8oKtJ0IeEeCEBvcXHw', label: 'YouTube' },
                { icon: <FaLinkedinIn size={14} />, href: 'https://www.linkedin.com/company/anadolu-hastaneleri-grubu', label: 'LinkedIn' },
              ].map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center hover:bg-ocean-500 hover:text-white transition-all duration-300 text-white/60"
                  aria-label={social.label}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* CTA Card */}
          <div className="bg-white/5 rounded-2xl p-6 border border-white/10 max-w-xs w-full">
            <h3 className="font-display font-bold text-lg mb-2">{t('footer.ctaTitle')}</h3>
            <p className="text-white/50 text-sm mb-5">
              {t('footer.ctaDesc')}
            </p>
            <a
              href="https://anadoluhastaneleri.kendineiyibak.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-coral w-full justify-center text-sm"
            >
              <FaCalendarCheck />
              {t('footer.ctaButton')}
            </a>
          </div>
        </div>

        {/* Row 2: Link Columns */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-12">
          {/* Hızlı Erişim */}
          <div>
            <h4 className="font-display font-semibold text-sm uppercase tracking-wider text-white/40 mb-5">
              {t('footer.quickLinks')}
            </h4>
            <ul className="space-y-3">
              {[
                { name: t('footerLinks.hospitals'), path: '/hastanelerimiz' },
                { name: t('footerLinks.departments'), path: '/bolumlerimiz' },
                { name: t('footerLinks.doctors'), path: '/doktorlar' },
                { name: t('footerLinks.healthGuide'), path: '/saglik-rehberi' },
                { name: t('footerLinks.healthTourism'), path: '/saglik-turizmi' },
              ].map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.path}
                    className="text-sm text-white/60 hover:text-white transition-colors duration-200"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Kurumsal */}
          <div>
            <h4 className="font-display font-semibold text-sm uppercase tracking-wider text-white/40 mb-5">
              {t('footer.corporate')}
            </h4>
            <ul className="space-y-3">
              {[
                { name: t('footerLinks.about'), path: '/hakkimizda' },
                { name: t('footerLinks.presidentMessage'), path: '/baskanin-mesaji' },
                { name: t('footerLinks.missionVision'), path: '/misyon-vizyon-ve-degerlerimiz' },
                { name: t('footerLinks.management'), path: '/yonetim' },
                { name: t('footerLinks.qualityManagement'), path: '/kalite-yonetimi' },
                { name: t('footerLinks.news'), path: '/bizden-haberler' },
                { name: t('footerLinks.media', 'Basında Biz'), path: '/basinda-biz' },
                { name: t('footerLinks.socialResp', 'Sosyal Sorumluluk'), path: '/sosyal-sorumluluk' },
                { name: t('footerLinks.career', 'Kariyer'), path: '/kariyer' },
              ].map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.path}
                    className="text-sm text-white/60 hover:text-white transition-colors duration-200"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Hasta Hizmetleri */}
          <div>
            <h4 className="font-display font-semibold text-sm uppercase tracking-wider text-white/40 mb-5">
              {t('footer.patientServices')}
            </h4>
            <ul className="space-y-3">
              {[
                { name: t('footerLinks.patientRights'), path: '/hasta-haklari' },
                { name: t('footerLinks.emergency', 'Acil Servis'), path: '/acil-servis' },
                { name: t('footerLinks.patientInfo', 'Hasta Bilgilendirme'), path: '/saglik-rehberi/hasta-bilgilendirme' },
                { name: t('footerLinks.companionRules'), path: '/refakat-politikasi-ve-refakatci-kurallari' },
                { name: t('footerLinks.visitHours'), path: '/ziyaret-kurallari-ve-saatleri' },
                { name: t('footerLinks.complaintPolicy'), path: '/sikayet-politikasi' },
                { name: t('footerLinks.feedback'), path: '/sizi-dinliyoruz' },
                { name: t('footerLinks.hospitalGuide', 'Hastane İçi Rehber'), path: '/hastane-ici-rehber' },
                { name: t('footerLinks.transport', 'Ulaşım'), path: '/ulasim' },
                { name: t('footerLinks.prenatalSchool'), path: '/gebe-okulu' },
              ].map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.path}
                    className="text-sm text-white/60 hover:text-white transition-colors duration-200"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* İletişim */}
          <div>
            <h4 className="font-display font-semibold text-sm uppercase tracking-wider text-white/40 mb-5">
              {t('footer.contactTitle')}
            </h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <FaMapMarkerAlt className="text-ocean-400 mt-0.5 flex-shrink-0 text-sm" />
                <span className="text-sm text-white/60">
                  Anadolu Hastaneleri Merkez,<br />
                  Atatürk Bulvarı No:123, İstanbul
                </span>
              </li>
              <li className="flex items-center gap-3">
                <FaPhone className="text-ocean-400 flex-shrink-0 text-sm" />
                <a
                  href="tel:4445058"
                  className="text-sm text-white/60 hover:text-white transition-colors"
                >
                  444 50 58
                </a>
              </li>
              <li className="flex items-center gap-3">
                <FaEnvelope className="text-ocean-400 flex-shrink-0 text-sm" />
                <a
                  href="mailto:info@anadoluhastaneleri.com"
                  className="text-sm text-white/60 hover:text-white transition-colors"
                >
                  info@anadoluhastaneleri.com
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10">
        <div className="container-custom py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-white/40 text-xs">
              &copy; {currentYear} {t('footer.copyright')}
            </p>
            <div className="flex flex-col sm:flex-row flex-wrap items-center gap-2 sm:gap-4 text-xs text-white/40">
              <span className="text-center sm:text-left">
                {t('footer.privacy')}{' '}
                <a href="https://anadoluhastaneleri.com/gizlilikilkesi" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors underline">
                  {t('footer.kvkk')}
                </a>
              </span>
              <span className="hidden sm:inline">|</span>
              <div className="flex items-center gap-3">
                <a href="https://anadoluhastaneleri.com/gizlilikilkesi" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                  {t('footer.terms')}
                </a>
                <span>/</span>
                <Link to="/cerez-politikasi" className="hover:text-white transition-colors">
                  {t('footer.cookies')}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
