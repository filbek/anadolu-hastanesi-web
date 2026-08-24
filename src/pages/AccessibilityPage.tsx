import { Helmet } from 'react-helmet-async'
import { useTranslation } from 'react-i18next'
import { FaUniversalAccess, FaCheckCircle, FaExclamationTriangle, FaEnvelope, FaPhone } from 'react-icons/fa'

// Erişilebilirlik Beyanı — RG 21.06.2025 / 20250621-17 kapsamında
// yayımlanması beklenen uyum beyanı. İçerik ACCESSIBILITY.md ile birlikte
// güncel tutulmalıdır.

const LAST_REVIEW = '24 Ağustos 2026'

const AccessibilityPage = () => {
  const { t } = useTranslation()

  const done = [
    'Klavyeyle tam gezinme ve her zaman görünür odak halkası',
    '"İçeriğe atla" bağlantısı ve anlamlı sayfa başlık hiyerarşisi',
    'Görsellerde metin alternatifi; dekoratif görsellerin ekran okuyucudan gizlenmesi',
    'Form alanlarında etiket, zorunluluk ve hata bildirimlerinin ekran okuyucuya iletilmesi',
    'Menü, açılır pencere ve sekmelerde ARIA rolleri ile odak hapsi',
    'Hareketli içerikte (ana sayfa slaytı) duraklat/oynat kontrolü',
    'Sayfa dilinin ve yazım yönünün dil değişiminde güncellenmesi',
    'Dokunma hedeflerinin en az 44×44 piksel olması',
    'Bu sayfadaki araç çubuğu: yazı büyütme, yüksek kontrast, bağlantı vurgulama, animasyon durdurma',
  ]

  const pending = [
    'Video içeriklerinde altyazı ve metin dökümü',
    'PDF broşürlerin erişilebilir PDF veya HTML sürümlerine dönüştürülmesi',
    'Tüm sayfalarda AA seviyesi renk kontrastı taramasının tamamlanması',
    'Ekran okuyucu ile gerçek cihaz üzerinde uçtan uca test',
  ]

  return (
    <>
      <Helmet>
        <title>Erişilebilirlik Beyanı | Anadolu Hastaneleri Grubu</title>
        <meta
          name="description"
          content="Anadolu Hastaneleri Grubu web sitesinin erişilebilirlik uyum beyanı, tamamlanan çalışmalar, bilinen eksikler ve geri bildirim kanalları."
        />
      </Helmet>

      <div className="pt-24 pb-16 bg-surface">
        <div className="container-narrow">
          <div className="flex items-center gap-3 mb-6">
            <FaUniversalAccess className="text-4xl text-primary-600" aria-hidden="true" />
            <h1 className="text-3xl lg:text-4xl font-black text-primary-600">
              {t('a11yPage.title', 'Erişilebilirlik Beyanı')}
            </h1>
          </div>

          <div className="bg-white rounded-2xl shadow-card p-6 lg:p-10 space-y-10">
            <section>
              <h2 className="text-xl font-bold text-primary-600 mb-3">Taahhüdümüz</h2>
              <p className="text-text-light leading-relaxed">
                Anadolu Hastaneleri Grubu olarak, web sitemizin engelli kullanıcılar dâhil herkes tarafından
                kullanılabilmesini sağlık hizmetine erişimin bir parçası olarak görüyoruz. Sitemizi{' '}
                <strong>WCAG 2.2 A seviyesi</strong> ölçütlerine göre geliştiriyor ve düzenli olarak
                denetliyoruz. Bu çalışma, 21.06.2025 tarihli ve 20250621-17 sayılı Resmî Gazete kararı
                (Web Siteleri ve Mobil Uygulamaların Erişilebilirliği) kapsamında yürütülmektedir.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-primary-600 mb-3">Uyum Durumu</h2>
              <p className="text-text-light leading-relaxed">
                Site <strong>kısmen uyumludur</strong>. A seviyesindeki başarı ölçütlerinin büyük bölümü
                karşılanmıştır; aşağıda listelenen başlıklarda çalışma sürmektedir.
              </p>
              <p className="text-sm text-text-muted mt-3">Son gözden geçirme: {LAST_REVIEW}</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-primary-600 mb-4">Tamamlanan Çalışmalar</h2>
              <ul className="space-y-3">
                {done.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <FaCheckCircle className="text-success-500 mt-1 shrink-0" aria-hidden="true" />
                    <span className="text-text-light leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-primary-600 mb-4">Bilinen Eksikler</h2>
              <ul className="space-y-3">
                {pending.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <FaExclamationTriangle className="text-amber-600 mt-1 shrink-0" aria-hidden="true" />
                    <span className="text-text-light leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-primary-600 mb-3">Erişilebilirlik Araç Çubuğu</h2>
              <p className="text-text-light leading-relaxed">
                Sayfaların sol alt köşesindeki erişilebilirlik düğmesinden yazı boyutunu büyütebilir,
                yüksek kontrast moduna geçebilir, bağlantıları belirginleştirebilir, animasyonları
                durdurabilir ve okunaklı yazı tipine geçebilirsiniz. Tercihleriniz tarayıcınızda saklanır
                ve sonraki ziyaretlerinizde korunur.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-primary-600 mb-3">Geri Bildirim</h2>
              <p className="text-text-light leading-relaxed mb-4">
                Sitemizde erişemediğiniz bir içerik veya kullanmakta zorlandığınız bir bölüm varsa bize
                bildirin. Başvurunuzu en geç 30 gün içinde yanıtlıyoruz.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <a
                  href="mailto:info@anadoluhastaneleri.com?subject=Eri%C5%9Filebilirlik%20Geri%20Bildirimi"
                  className="btn btn-primary"
                >
                  <FaEnvelope aria-hidden="true" /> info@anadoluhastaneleri.com
                </a>
                <a href="tel:4445058" className="btn btn-outline">
                  <FaPhone aria-hidden="true" /> 444 50 58
                </a>
              </div>
            </section>
          </div>
        </div>
      </div>
    </>
  )
}

export default AccessibilityPage
