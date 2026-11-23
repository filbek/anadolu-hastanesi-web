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
  FaApple,
  FaGooglePlay,
} from 'react-icons/fa'
import Logo from '../ui/Logo'
import { SECTION_NAV_GROUPS } from '../../data/sectionNav'
import type { TFunction } from 'i18next'
import { SOCIAL_LINKS, SocialPlatform } from '../../data/socialLinks'

const SOCIAL_ICONS: Record<SocialPlatform, JSX.Element> = {
  facebook: <FaFacebookF size={14} />,
  twitter: <FaTwitter size={14} />,
  instagram: <FaInstagram size={14} />,
  youtube: <FaYoutube size={14} />,
  linkedin: <FaLinkedinIn size={14} />,
}

/** Mobil uygulama mağaza bağlantıları */
const APP_LINKS = [
  {
    id: 'ios',
    store: 'App Store',
    href: 'https://apps.apple.com/us/app/anadolu-hastaneleri/id6830258281',
    icon: <FaApple size={26} aria-hidden="true" />,
  },
  {
    id: 'android',
    store: 'Google Play',
    href: 'https://play.google.com/store/apps/details?id=com.pusula.hbys.hbys_app.special&hl=tr',
    icon: <FaGooglePlay size={21} aria-hidden="true" />,
  },
]

/** Kurumsal / Hasta Hizmetleri bağlantıları — SectionNav ile ortak kaynak */
const getSectionLinks = (id: 'corporate' | 'patientServices', t: TFunction) =>
  (SECTION_NAV_GROUPS.find((g) => g.id === id)?.links || []).map((l) => ({
    name: t(l.key, l.fallback),
    path: l.path,
  }))

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
              {SOCIAL_LINKS.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center hover:bg-ocean-500 hover:text-white transition-all duration-300 text-white/60"
                  aria-label={social.label}
                >
                  {SOCIAL_ICONS[social.id]}
                </a>
              ))}
            </div>
          </div>

          {/* Mobil Uygulama */}
          <div className="max-w-xs w-full">
            <h3 className="font-display font-bold text-lg mb-2">
              {t('footer.appTitle', 'Mobil Uygulamamız')}
            </h3>
            <p className="text-white/50 text-sm mb-5">
              {t(
                'footer.appDesc',
                'Randevularınızı ve sağlık kayıtlarınızı cebinizden yönetin.'
              )}
            </p>
            <div className="flex flex-wrap gap-3">
              {APP_LINKS.map((app) => (
                <a
                  key={app.id}
                  href={app.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${t('footer.appDownload', 'Hemen indirin')} — ${app.store}`}
                  className="inline-flex items-center gap-3 min-w-[148px] px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white hover:text-[#0A1628] transition-all duration-300"
                >
                  <span className="flex-shrink-0 w-7 flex justify-center">{app.icon}</span>
                  <span className="flex flex-col leading-tight text-start">
                    <span className="text-[10px] uppercase tracking-wide opacity-70">
                      {t('footer.appDownload', 'Hemen indirin')}
                    </span>
                    <span className="font-display font-semibold text-sm">{app.store}</span>
                  </span>
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
            <h4 className="font-display font-semibold text-sm uppercase tracking-wider text-white/70 mb-5">
              {t('footer.quickLinks')}
            </h4>
            <ul className="space-y-3">
              {[
                { name: t('footerLinks.hospitals'), path: '/hastanelerimiz' },
                { name: t('footerLinks.departments'), path: '/bolumlerimiz' },
                { name: t('footerLinks.featuredProcedures', 'Özellikli İşlemler'), path: '/ozellikli-islemler' },
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
            <h4 className="font-display font-semibold text-sm uppercase tracking-wider text-white/70 mb-5">
              {t('footer.corporate')}
            </h4>
            <ul className="space-y-3">
              {getSectionLinks('corporate', t).map((link) => (
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
            <h4 className="font-display font-semibold text-sm uppercase tracking-wider text-white/70 mb-5">
              {t('footer.patientServices')}
            </h4>
            <ul className="space-y-3">
              {getSectionLinks('patientServices', t).map((link) => (
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
            <h4 className="font-display font-semibold text-sm uppercase tracking-wider text-white/70 mb-5">
              {t('footer.contactTitle')}
            </h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <FaMapMarkerAlt className="text-ocean-400 mt-0.5 flex-shrink-0 text-sm" />
                <div className="text-sm text-white/60 space-y-1.5">
                  <div>
                    <span className="text-white/80">Silivri Anadolu Hastanesi</span>
                    <br />
                    Mimar Sinan Mahallesi, Mimar Sinan Caddesi No:72, 34570 Silivri
                  </div>
                  <div>
                    <span className="text-white/80">Avcılar Anadolu Hastanesi</span>
                    <br />
                    Mustafa Kemal Paşa Firuzköy Bulvarı, Kayabaşı Sk. No:1/3, Avcılar / İstanbul
                  </div>
                  <div>
                    <span className="text-white/80">Ereğli Anadolu Hastanesi</span>
                    <br />
                    Müftü Mah. Atatürk Cad. No:88, Ereğli / Zonguldak
                  </div>
                </div>
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
            <p className="text-white/70 text-xs">
              &copy; {currentYear} {t('footer.copyright')}
            </p>
            <div className="flex flex-col sm:flex-row flex-wrap items-center gap-2 sm:gap-4 text-xs text-white/70">
              <span className="text-center sm:text-left">
                {t('footer.privacy')}{' '}
                <Link to="/kvkk" className="hover:text-white transition-colors underline">
                  {t('footer.kvkk')}
                </Link>
              </span>
              <span className="hidden sm:inline">|</span>
              <div className="flex items-center gap-3">
                <Link to="/gizlilik-politikasi" className="hover:text-white transition-colors">
                  {t('footer.terms')}
                </Link>
                <span>/</span>
                <Link to="/cerez-politikasi" className="hover:text-white transition-colors">
                  {t('footer.cookies')}
                </Link>
                <span>/</span>
                <Link to="/erisilebilirlik" className="hover:text-white transition-colors">
                  {t('footer.accessibility', 'Erişilebilirlik')}
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
