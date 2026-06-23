import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { FaCookieBite, FaCog, FaShieldAlt, FaExternalLinkAlt } from 'react-icons/fa';
import LastUpdated from '../components/ui/LastUpdated';

const SITE = 'anadoluhastaneleri.com';

const cookies = [
  {
    provider: 'Google Analytics',
    name: '_gid',
    purpose: 'Kullanıcıları ayırt etmek için kullanılan çerezdir.',
    type: 'Performans ve İstatistik Çerezi, Üçüncü Taraf Çerezi',
    duration: '24 Saat',
  },
  {
    provider: 'Google Analytics',
    name: '_gat',
    purpose: 'İstek oranını kısıtlamak (throttling) için kullanılan çerezdir.',
    type: 'Fonksiyonellik Çerezi',
    duration: '1 Dakika',
  },
  {
    provider: 'Google Analytics',
    name: '_ga',
    purpose: 'İstatistiksel verinin oluşturulması amacıyla kullanıcıları ayırt etmek üzere kullanılan çerezdir.',
    type: 'Performans ve İstatistik Çerezi, Üçüncü Taraf Çerezi',
    duration: '2 Yıl',
  },
];

const optOutLinks = [
  { label: 'Google Analytics', href: 'https://tools.google.com/dlpage/gaoptout' },
  { label: 'Google Chrome', href: 'https://support.google.com/accounts/answer/61416?hl=tr' },
  { label: 'Internet Explorer', href: 'https://support.microsoft.com/tr-tr/help/17442/windows-internet-explorer-delete-manage-cookies' },
  { label: 'Mozilla Firefox', href: 'https://support.mozilla.org/tr/kb/cerezleri-silme-web-sitelerinin-bilgilerini-kaldirma' },
  { label: 'Opera', href: 'https://help.opera.com/en/latest/web-preferences/' },
  { label: 'Safari', href: 'https://support.apple.com/tr-tr/guide/safari/sfri11471/mac' },
];

const cookieTypes = [
  {
    title: 'Zorunlu Çerezler (Oturum Çerezleri)',
    desc: 'İnternet sitesinin düzgün çalışması için gerekli olan, devre dışı bırakılamayan çerezlerdir.',
  },
  {
    title: 'İşlev Odaklı Çerezler',
    desc: 'Kullanıcı deneyimini geliştirmemize, tercihlerinizi (örneğin dil seçimi) hatırlamamıza olanak sağlayan çerezlerdir.',
  },
  {
    title: 'Performans ve İstatistik Çerezleri',
    desc: 'Sitemizdeki içeriklerin nasıl ve ne sıklıkla kullanıldığını anlamak, analiz etmek ve içerikleri iyileştirmek amacıyla kullanılan çerezlerdir.',
  },
];

const CookiePolicyPage = () => {
  return (
    <div className="bg-white min-h-screen">
      <Helmet>
        <title>Çerez Politikası | Anadolu Hastaneleri Grubu</title>
        <meta
          name="description"
          content="Anadolu Hastaneleri Grubu çerez politikası. Web sitemizde kullanılan çerezler, amaçları ve çerez yönetimi hakkında bilgi alın."
        />
      </Helmet>

      {/* HERO */}
      <section className="relative pt-32 pb-16 bg-primary overflow-hidden">
        <div className="absolute inset-0 opacity-10" aria-hidden="true">
          <div className="absolute inset-0 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:20px_20px]" />
        </div>
        <div className="container-custom relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-white/10 flex items-center justify-center text-white text-2xl">
              <FaCookieBite aria-hidden="true" />
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-white mb-4">Çerez Politikası</h1>
            <p className="text-white/70 max-w-2xl mx-auto">
              Bu politika, <strong>{SITE}</strong> internet sitesini ziyaret eden kullanıcılara çerez
              kullanım esaslarımız hakkında bilgi vermek amacıyla hazırlanmıştır.
            </p>
          </motion.div>
        </div>
      </section>

      <div className="container-narrow py-14 space-y-12">
        {/* 1. Çerez nedir */}
        <section aria-labelledby="cerez-nedir">
          <h2 id="cerez-nedir" className="text-2xl font-bold text-primary mb-4 flex items-center gap-3">
            <FaCookieBite className="text-accent" aria-hidden="true" /> 1. Çerez Nedir?
          </h2>
          <p className="text-neutral-600 leading-relaxed">
            Çerezler, internet sitelerinin cihazlarınıza kaydettiği küçük boyutlu ve kullanıcıları
            tanımlamaya yarayan veri dosyalarıdır. Çerezler, internet siteleri tarafından kullanıcıların
            tanımlanması ve onlara özel hizmet sunulması amacıyla kullanılır.
          </p>
        </section>

        {/* 2. Çerez kullanımı */}
        <section aria-labelledby="cerez-kullanimi">
          <h2 id="cerez-kullanimi" className="text-2xl font-bold text-primary mb-4 flex items-center gap-3">
            <FaShieldAlt className="text-accent" aria-hidden="true" /> 2. Çerez Kullanımı
          </h2>
          <p className="text-neutral-600 leading-relaxed mb-6">
            <strong>{SITE}</strong> internet sitesinde, kullanıcılara en iyi deneyimi sunmak için çerezler
            kullanılmaktadır. Sitemizde kullandığımız çerez türleri aşağıdaki gibidir:
          </p>

          <div className="grid gap-4 sm:grid-cols-3 mb-8">
            {cookieTypes.map((c) => (
              <div key={c.title} className="bg-slate-50 border border-slate-100 rounded-2xl p-5">
                <h3 className="font-semibold text-primary mb-2 text-sm">{c.title}</h3>
                <p className="text-sm text-neutral-500 leading-relaxed">{c.desc}</p>
              </div>
            ))}
          </div>

          <h3 className="text-lg font-semibold text-primary mb-3">Kullandığımız Çerezler</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border border-slate-100 rounded-xl overflow-hidden">
              <caption className="sr-only">Sitede kullanılan çerezler, amaçları, türleri ve saklanma süreleri</caption>
              <thead className="bg-primary text-white">
                <tr>
                  <th scope="col" className="px-4 py-3 font-semibold">Çerez Sağlayıcı</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Çerez İsmi</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Çerez Amacı</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Çerez Türü</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Saklanma Süresi</th>
                </tr>
              </thead>
              <tbody>
                {cookies.map((c, i) => (
                  <tr key={c.name} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                    <td className="px-4 py-3 text-neutral-600">{c.provider}</td>
                    <th scope="row" className="px-4 py-3 font-mono font-medium text-primary">{c.name}</th>
                    <td className="px-4 py-3 text-neutral-600">{c.purpose}</td>
                    <td className="px-4 py-3 text-neutral-600">{c.type}</td>
                    <td className="px-4 py-3 text-neutral-600 whitespace-nowrap">{c.duration}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* 3. Çerez yönetimi */}
        <section aria-labelledby="cerez-yonetimi">
          <h2 id="cerez-yonetimi" className="text-2xl font-bold text-primary mb-4 flex items-center gap-3">
            <FaCog className="text-accent" aria-hidden="true" /> 3. Çerez Yönetimi
          </h2>
          <p className="text-neutral-600 leading-relaxed mb-4">
            İnternet sitemize erişim sağladığınız cihaz üzerinde çerez tutulmasını istemiyorsanız,
            tarayıcınızın ayarları üzerinden çerez kullanımını engelleyebilir, sınırlayabilir ve
            silebilirsiniz. Bu tercihlerinizi sonradan değiştirmeniz de mümkündür.
          </p>
          <p className="text-neutral-600 leading-relaxed mb-6">
            Farklı cihazlar üzerinden erişim sağlıyorsanız, eriştiğiniz her bir cihaz ve tarayıcı için
            çerez kullanım ayarlarını tercihlerinize uygun olarak aşağıdaki bağlantılar üzerinden
            gerçekleştirebilirsiniz:
          </p>
          <ul className="grid gap-2 sm:grid-cols-2">
            {optOutLinks.map((l) => (
              <li key={l.label}>
                <a
                  href={l.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-primary hover:text-accent transition-colors font-medium"
                >
                  <FaExternalLinkAlt className="text-xs" aria-hidden="true" />
                  {l.label} çerez ayarları
                </a>
              </li>
            ))}
          </ul>
        </section>

        <div className="pt-4 border-t border-slate-100">
          <LastUpdated date="22.06.2026" />
        </div>
      </div>
    </div>
  );
};

export default CookiePolicyPage;
