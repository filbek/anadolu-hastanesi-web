import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { FaUserShield, FaLock, FaHospital, FaClipboardCheck, FaCookieBite, FaChild, FaEdit, FaPhoneAlt, FaEnvelope, FaMapMarkerAlt } from 'react-icons/fa';
import LastUpdated from '../components/ui/LastUpdated';

const SITE = 'anadoluhastaneleri.com';
const BRAND = 'Anadolu Hastaneleri Grubu';

/**
 * Gizlilik Politikası sayfası
 * KVKK (6698 sayılı Kanun) ve hastane işleyişine uygun biçimde
 * hastane veri işleme uygulamalarını şeffaf biçimde aktarır.
 */
const PrivacyPolicyPage = () => {
  return (
    <div className="bg-white min-h-screen">
      <Helmet>
        <title>Gizlilik Politikası | Anadolu Hastaneleri Grubu</title>
        <meta
          name="description"
          content="Anadolu Hastaneleri Grubu gizlilik politikası. Kişisel verilerinizin nasıl toplandığı, kullanıldığı, korunduğu ve KVKK kapsamındaki haklarınız hakkında bilgi alın."
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
              <FaUserShield aria-hidden="true" />
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-white mb-4">Gizlilik Politikası</h1>
            <p className="text-white/70 max-w-2xl mx-auto">
              <strong>{BRAND}</strong> olarak, hasta ve ziyaretçilerimizin kişisel verilerinin
              korunmasını en üst düzeyde önceliklendiriyoruz. Bu politika, kişisel verilerinizin
              nasıl işlendiği konusunda size şeffaf bilgi sunmak amacıyla hazırlanmıştır.
            </p>
          </motion.div>
        </div>
      </section>

      {/* HIGHLIGHT BAR */}
      <section className="bg-white border-b border-slate-100">
        <div className="container-custom py-10">
          <div className="grid gap-6 sm:grid-cols-3">
            {[
              { icon: <FaLock />, title: 'Veri Güvenliği', desc: 'Verileriniz güncel güvenlik önlemleriyle korunur.' },
              { icon: <FaHospital />, title: 'Hasta Mahremiyeti', desc: 'Tıbbi gizlilik ilkeleri gözetilir.' },
              { icon: <FaClipboardCheck />, title: 'Yasal Uyum', desc: '6698 sayılı KVKK ve ilgili mevzuata uyumluyuz.' },
            ].map((item) => (
              <div key={item.title} className="flex items-start gap-4">
                <div className="w-11 h-11 flex-shrink-0 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  {item.icon}
                </div>
                <div>
                  <h3 className="font-bold text-primary text-sm mb-1">{item.title}</h3>
                  <p className="text-sm text-neutral-500 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="container-narrow py-14 space-y-12">
        {/* 1. Genel Bakış */}
        <section aria-labelledby="genel-bakis">
          <h2 id="genel-bakis" className="text-2xl font-bold text-primary mb-4 flex items-center gap-3">
            <FaUserShield className="text-accent" aria-hidden="true" /> 1. Genel Bakış
          </h2>
          <div className="space-y-4 text-neutral-600 leading-relaxed">
            <p>
              <strong>{BRAND}</strong> ("Hastanemiz"), <strong>{SITE}</strong> internet sitesi, mobil
              uygulamalar, çağrı merkezi ve fiziksel hastane hizmetleri aracılığıyla hizmet sunarken
              kişisel verilerin korunmasını temel bir sorumluluk olarak kabul eder.
            </p>
            <p>
              Bu Gizlilik Politikası, 6698 sayılı Kişisel Verilerin Korunması Kanunu ("KVKK") ve ilgili
              ikincil mevzuat ile Sağlık Bakanlığı tarafından yayımlanan hastane ve hasta hakları
              düzenlemeleri gözetilerek hazırlanmıştır. Politika, verilerinizin hangi amaçlarla
              toplandığını, nasıl kullanıldığını ve haklarınızı açıklamaktadır.
            </p>
          </div>
        </section>

        {/* 2. Veri Sorumlusu */}
        <section aria-labelledby="veri-sorumlusu">
          <h2 id="veri-sorumlusu" className="text-2xl font-bold text-primary mb-4 flex items-center gap-3">
            <FaHospital className="text-accent" aria-hidden="true" /> 2. Veri Sorumlusu
          </h2>
          <p className="text-neutral-600 leading-relaxed">
            Kişisel verileriniz, veri sorumlusu sıfatıyla <strong>{BRAND}</strong> tarafından
            işlenmektedir. Veri işleme faaliyetlerimizle ilgili başvurularınızı aşağıda belirtilen
            iletişim kanalları üzerinden bize iletebilirsiniz. Kişisel verilerinizin yurt içinde veya
            yurt dışında yukarıda açıklanan amaçlar doğrultusunda işlenmesine ilişkin bu Politikayı
            okuyup anladığınızı ve kabul ettiğinizi beyan etmektesiniz.
          </p>
        </section>

        {/* 3. İşlenen Kişisel Veriler */}
        <section aria-labelledby="islenen-veriler">
          <h2 id="islenen-veriler" className="text-2xl font-bold text-primary mb-4 flex items-center gap-3">
            <FaClipboardCheck className="text-accent" aria-hidden="true" /> 3. İşlenen Kişisel Veriler
          </h2>
          <p className="text-neutral-600 leading-relaxed mb-4">
            Hizmetlerimizden faydalanabilmeniz ve sağlığınızın korunması amacıyla aşağıdaki kişisel
            veri kategorilerini işliyoruz:
          </p>
          <ul className="space-y-3">
            {[
              ['Kimlik Bilgileri', 'Ad, soyad, T.C. kimlik numarası, pasaport numarası, doğum tarihi, cinsiyet gibi tanımlayıcı bilgiler.'],
              ['İletişim Bilgileri', 'Telefon numarası, e-posta adresi, ikamet adresi ve acil durum iletişim kişisi bilgileri.'],
              ['Sağlık Verileri (Özel Nitelikli)', 'Tıbbi öykü, tanı, tetkik ve laboratuvar sonuçları, görüntüleme raporları, reçete ve tedavi bilgileri gibi özel nitelikli kişisel sağlık verileri.'],
              ['İşlem Güvenliği Bilgileri', 'Site/e-posta/e-arşiv fatura erişimi sırasında IP adresi, oturum bilgileri, tarayıcı ve cihaz bilgileri.'],
              ['Finansal Bilgiler', 'SGK/bağlı kurum bilgileri, fatura ve ödeme kayıtları (kart bilgisi saklanmaz).'],
              ['Görsel ve İşitsel Kayıtlar', 'Fiziksel güvenlik amacıyla hastane alanlarındaki kamera kayıtları.'],
            ].map(([title, desc]) => (
              <li key={title} className="flex gap-3">
                <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-accent" aria-hidden="true" />
                <p className="text-neutral-600 leading-relaxed">
                  <strong className="text-primary">{title}:</strong> {desc}
                </p>
              </li>
            ))}
          </ul>
        </section>

        {/* 4. İşleme Amaçları ve Hukuki Sebep */}
        <section aria-labelledby="isleme-amaclari">
          <h2 id="isleme-amaclari" className="text-2xl font-bold text-primary mb-4 flex items-center gap-3">
            <FaUserShield className="text-accent" aria-hidden="true" /> 4. İşleme Amaçları ve Hukuki Sebep
          </h2>
          <p className="text-neutral-600 leading-relaxed mb-4">
            Kişisel verileriniz; KVKK'nın 5. ve 6. maddelerinde öngörülen istisnalar ile aşağıdaki
            amaçlar doğrultusunda işlenmektedir:
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              ['Sağlık Hizmetinin Sunumu', 'Muayene, tanı, tedavi ve takip süreçlerinin yürütülmesi.'],
              ['Randevu ve İletişim', 'Randevu oluşturma, hatırlatma ve hizmete ilişkin bilgilendirme.'],
              ['Yasal Yükümlülükler', 'Sağlık Bakanlığı ve diğer resmi kurumlara ilişkin mevzuat gereği kayıt tutma ve bildirim.'],
              ['Faturalandırma', 'Sağlık kuruluşlarına faturalandırma ve ödeme süreçlerinin yönetilmesi.'],
              ['Hizmet Kalitesi', 'Hasta memnuniyet anketleri ve hizmet kalitesinin iyileştirilmesi.'],
              ['Güvenlik', 'Hastane, hasta ve çalışan güvenliğinin sağlanması ile kayıtların korunması.'],
            ].map(([title, desc]) => (
              <div key={title} className="bg-slate-50 border border-slate-100 rounded-2xl p-5">
                <h3 className="font-semibold text-primary mb-1 text-sm">{title}</h3>
                <p className="text-sm text-neutral-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
          <p className="text-neutral-600 leading-relaxed mt-4">
            Özel nitelikli kişisel sağlık verileriniz, açık rızanız bulunması veya tedavinin gerektirmesi
            ile KVKK 6. madde kapsamında işlenmektedir. Sağlık verilerinin işlenmesi için açık rıza
            metnine ilişkin ayrı bir bilgilendirme Aydınlatma Metnimizde yer almaktadır.
          </p>
        </section>

        {/* 5. Veri Paylaşımı */}
        <section aria-labelledby="veri-paylasimi">
          <h2 id="veri-paylasimi" className="text-2xl font-bold text-primary mb-4 flex items-center gap-3">
            <FaHospital className="text-accent" aria-hidden="true" /> 5. Verilerin Paylaşımı
          </h2>
          <p className="text-neutral-600 leading-relaxed">
            Kişisel verileriniz; yukarıda belirtilen amaçların gerçekleştirilmesi için tedavinizin
            yürütülmesine ilişkin zorunluluk olması veya açık rızanızın bulunması halinde; bağlı
            bulunulan sağlık kuruluşları (SGK, özel sağlık sigortası şirketleri), laboratuvar ve görüntüleme
            merkezleri, anlaşmalı sağlık hizmeti sağlayıcıları, resmi makam ve kurumlar ile veri işleme
            faaliyetlerimizde bulunmamızı destekleyen tedarikçilerimizle paylaşılabilir. Verileriniz,
            gerekli önlemler alınarak yurt içinde veya yurt dışında işlenebilir ve aktarılabilir.
          </p>
        </section>

        {/* 6. Veri Saklama ve İmha */}
        <section aria-labelledby="saklama">
          <h2 id="saklama" className="text-2xl font-bold text-primary mb-4 flex items-center gap-3">
            <FaLock className="text-accent" aria-hidden="true" /> 6. Verilerin Saklanması ve İmhası
          </h2>
          <p className="text-neutral-600 leading-relaxed">
            Kişisel verileriniz, işlendikleri amaç için gerekli olan süre boyunca ve ilgili mevzuatta
            (özellikle hasta kayıtlarına ilişkin düzenlemeler) öngörülmesi halinde bu sürelere uyulmak
            suretiyle saklanmaktadır. Saklama süresinin dolması, ilgili mevzuata göre saklanma
            yükümlülüğünün ortadan kalkması veya işlemenin amaçlarının gerçekleşmesi halinde veriler
            silinmekte, yok edilmekte veya anonim hale getirilmektedir.
          </p>
        </section>

        {/* 7. Veri Güvenliği */}
        <section aria-labelledby="guvenlik">
          <h2 id="guvenlik" className="text-2xl font-bold text-primary mb-4 flex items-center gap-3">
            <FaLock className="text-accent" aria-hidden="true" /> 7. Veri Güvenliği
          </h2>
          <p className="text-neutral-600 leading-relaxed">
            Hastanemiz, kişisel verilerinizin yetkisiz erişime, ifşaya, değiştirilmeye ve silinmeye karşı
            korunması için gerekli teknik ve idari tedbirleri alır. Erişim yetkilendirme, şifreleme,
            güvenli veri depolama sistemleri ve personel eğitimi bu tedbirlerin bir parçasıdır. Tıbbi
            kayıtlarınız, yalnızca yetkili sağlık personeli tarafından gizlilik ilkeleri çerçevesinde
            erişilebilir durumda tutulur.
          </p>
        </section>

        {/* 8. Çerezler */}
        <section aria-labelledby="cerezler">
          <h2 id="cerezler" className="text-2xl font-bold text-primary mb-4 flex items-center gap-3">
            <FaCookieBite className="text-accent" aria-hidden="true" /> 8. Çerezler
          </h2>
          <p className="text-neutral-600 leading-relaxed">
            İnternet sitemiz, kullanıcı deneyimini iyileştirmek ve site performansını analiz etmek amacıyla
            çerezler kullanmaktadır. Çerezlere ilişkin detaylı bilgi için{' '}
            <a href="/cerez-politikasi" className="text-primary hover:text-accent underline font-medium">
              Çerez Politikamıza
            </a>{' '}
            bakabilirsiniz.
          </p>
        </section>

        {/* 9. Çocukların Korunması */}
        <section aria-labelledby="cocuklar">
          <h2 id="cocuklar" className="text-2xl font-bold text-primary mb-4 flex items-center gap-3">
            <FaChild className="text-accent" aria-hidden="true" /> 9. Çocukların Korunması
          </h2>
          <p className="text-neutral-600 leading-relaxed">
            Hastanemiz, reşit olmayanlardan bilinçli şekilde kişisel veri toplamamaya özen gösterir. Çocuk
            hastalarımıza ilişkin sağlık verileri, yasal temsilcilerinin rızası ve yasal düzenlemeler
            çerçevesinde işlenir. Sitemiz aracılığıyla reşit olmayan birinin kişisel verisini paylaştığını
            düşünüyorsanız bizimle iletişime geçebilirsiniz.
          </p>
        </section>

        {/* 10. Haklarınız */}
        <section aria-labelledby="haklar">
          <h2 id="haklar" className="text-2xl font-bold text-primary mb-4 flex items-center gap-3">
            <FaUserShield className="text-accent" aria-hidden="true" /> 10. Kişisel Verileriniz Hakkındaki Haklarınız
          </h2>
          <p className="text-neutral-600 leading-relaxed mb-4">
            KVKK'nın 11. maddesi uyarınca aşağıdaki haklara sahipsiniz:
          </p>
          <ul className="grid gap-2 sm:grid-cols-2">
            {[
              'Kişisel verilerinizin işlenip işlenmediğini öğrenme',
              'İşlenmişse buna ilişkin bilgi talep etme',
              'İşlenme amacını ve amacına uygun kullanılıp kullanılmadığını öğrenme',
              'Eksik veya yanlış işlenmişse düzeltilmesini isteme',
              'Silinmesini veya yok edilmesini isteme',
              'Aktarıldığı üçüncü kişileri öğrenme',
              'İşlenen verilerin münhasıran otomatik sistemlerle analiz edilmesi suretiyle aleyhinize bir sonucun ortaya çıkmasına itiraz etme',
              'Kanuna aykırı işlenmesi nedeniyle zarara uğramanız halinde zararın giderilmesini talep etme',
            ].map((item) => (
              <li key={item} className="flex gap-3 items-start">
                <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-accent" aria-hidden="true" />
                <p className="text-sm text-neutral-600 leading-relaxed">{item}</p>
              </li>
            ))}
          </ul>
          <p className="text-neutral-600 leading-relaxed mt-4">
            Bu haklarınızı kullanmak için KVKK başvuru yöntemlerine uygun olarak aşağıdaki iletişim
            kanalları üzerinden bize başvurabilirsiniz. Talebiniz, mevzuatta öngörülen süre içerisinde
            değerlendirilerek sonuçlandırılacaktır.
          </p>
        </section>

        {/* 11. Politika Değişiklikleri */}
        <section aria-labelledby="degisiklikler">
          <h2 id="degisiklikler" className="text-2xl font-bold text-primary mb-4 flex items-center gap-3">
            <FaEdit className="text-accent" aria-hidden="true" /> 11. Politikada Değişiklikler
          </h2>
          <p className="text-neutral-600 leading-relaxed">
            Bu Gizlilik Politikası, yürürlükteki mevzuattaki değişiklikler ve Hastanemizin uygulamalarındaki
            güncellemeler doğrultusunda zaman zaman revize edilebilir. Güncel politika her zaman bu sayfada
            yayımlanacaktır. Önemli değişiklikler olması halinde sitemizde duyuru yapılarak bilgilendirme
            sağlanır.
          </p>
        </section>

        {/* İLETİŞİM */}
        <section aria-labelledby="iletisim" className="bg-slate-50 border border-slate-100 rounded-2xl p-8">
          <h2 id="iletisim" className="text-2xl font-bold text-primary mb-2 flex items-center gap-3">
            <FaPhoneAlt className="text-accent" aria-hidden="true" /> İletişim
          </h2>
          <p className="text-neutral-600 leading-relaxed mb-6">
            Gizlilik politikamız veya kişisel verilerinizle ilgili herhangi bir sorunuz, talebiniz veya
            başvurunuz için bizimle iletişime geçebilirsiniz:
          </p>
          <ul className="space-y-4 text-neutral-600">
            <li className="flex items-center gap-3">
              <FaMapMarkerAlt className="text-accent flex-shrink-0" aria-hidden="true" />
              <span>Müftü Mah. Atatürk Cad. No:88, Ereğli / Zonguldak</span>
            </li>
            <li className="flex items-center gap-3">
              <FaPhoneAlt className="text-accent flex-shrink-0" aria-hidden="true" />
              <a href="tel:4445058" className="hover:text-primary transition-colors">444 50 58</a>
            </li>
            <li className="flex items-center gap-3">
              <FaEnvelope className="text-accent flex-shrink-0" aria-hidden="true" />
              <a href="mailto:info@anadoluhastaneleri.com" className="hover:text-primary transition-colors">info@anadoluhastaneleri.com</a>
            </li>
          </ul>
        </section>

        <div className="pt-4 border-t border-slate-100">
          <LastUpdated date="10.07.2026" />
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;
