import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { FaShieldAlt, FaUserShield, FaBalanceScale, FaEnvelopeOpenText } from 'react-icons/fa';
import LastUpdated from '../components/ui/LastUpdated';

const SITE = 'anadoluhastaneleri.com';

const dataCategories = [
  {
    title: 'Kimlik Bilgileri',
    desc: 'Ad, soyad, T.C. kimlik numarası, doğum tarihi gibi kimliğinizi belirleyen bilgiler.',
  },
  {
    title: 'İletişim Bilgileri',
    desc: 'Telefon numarası, e-posta adresi, posta adresi gibi sizinle iletişim kurmamızı sağlayan bilgiler.',
  },
  {
    title: 'Sağlık Bilgileri',
    desc: 'Tıbbi geçmiş, tetkik ve tahlil sonuçları, tanı ve tedavi bilgileri gibi özel nitelikli kişisel verileriniz.',
  },
  {
    title: 'İşlem ve Pazarlama Bilgileri',
    desc: 'Randevu kayıtları, talep ve şikâyetleriniz, internet sitesi kullanım verileri gibi bilgiler.',
  },
];

const purposes = [
  'Sağlık hizmetlerinin sunulması, teşhis ve tedavi süreçlerinin yürütülmesi',
  'Randevu, ikinci görüş ve iletişim taleplerinizin karşılanması',
  'Hasta hakları ve hasta güvenliği süreçlerinin yönetilmesi',
  'Yasal yükümlülüklerin yerine getirilmesi ve mevzuata uyum sağlanması',
  'İletişim ve bilgilendirme faaliyetlerinin yürütülmesi',
];

const rights = [
  'Kişisel verilerinizin işlenip işlenmediğini öğrenme',
  'Kişisel verileriniz işlenmişse buna ilişkin bilgi talep etme',
  'İşlenme amacını ve amacına uygun kullanılıp kullanılmadığını öğrenme',
  'Yurt içinde veya yurt dışında verilerin aktarıldığı üçüncü kişileri bilme',
  'Eksik veya yanlış işlenmiş verilerin düzeltilmesini isteme',
  'Mevzuatta öngörülen şartlar çerçevesinde silinmesini veya yok edilmesini isteme',
  'Düzeltme, silme ve yok edilme işlemlerinin verilerin aktarıldığı üçüncü kişilere bildirilmesini isteme',
  'İşlenen verilerin münhasıran otomatik sistemlerle analiz edilmesi sonucu aleyhinize bir sonucun ortaya çıkmasına itiraz etme',
  'Kanuna aykırı işleme sebebiyle zarara uğramanız hâlinde zararın giderilmesini talep etme',
];

const KvkkPage = () => {
  return (
    <div className="bg-white min-h-screen">
      <Helmet>
        <title>KVKK Aydınlatma Metni | Anadolu Hastaneleri Grubu</title>
        <meta
          name="description"
          content="Anadolu Hastaneleri Grubu KVKK aydınlatma metni. 6698 sayılı Kişisel Verilerin Korunması Kanunu kapsamında kişisel verilerinizin işlenmesine ilişkin bilgilendirme."
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
              <FaShieldAlt aria-hidden="true" />
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-white mb-4">
              KVKK Aydınlatma Metni
            </h1>
            <p className="text-white/70 max-w-2xl mx-auto">
              6698 sayılı Kişisel Verilerin Korunması Kanunu kapsamında, kişisel verilerinizin
              işlenmesine ilişkin olarak sizleri bilgilendirmek amacıyla hazırlanmıştır.
            </p>
          </motion.div>
        </div>
      </section>

      <div className="container-narrow py-14 space-y-12">
        {/* 1. Veri Sorumlusu */}
        <section aria-labelledby="veri-sorumlusu">
          <h2 id="veri-sorumlusu" className="text-2xl font-bold text-primary mb-4 flex items-center gap-3">
            <FaUserShield className="text-accent" aria-hidden="true" /> 1. Veri Sorumlusu
          </h2>
          <p className="text-neutral-600 leading-relaxed">
            6698 sayılı Kişisel Verilerin Korunması Kanunu (&ldquo;KVKK&rdquo;) uyarınca kişisel
            verileriniz, veri sorumlusu sıfatıyla <strong>Anadolu Hastaneleri Grubu</strong>{' '}
            tarafından aşağıda açıklanan kapsamda işlenebilecektir. <strong>{SITE}</strong> internet
            sitesini ziyaret etmeniz veya hizmetlerimizden faydalanmanız durumunda işbu aydınlatma
            metni geçerli olacaktır.
          </p>
        </section>

        {/* 2. İşlenen Veriler */}
        <section aria-labelledby="islenen-veriler">
          <h2 id="islenen-veriler" className="text-2xl font-bold text-primary mb-4 flex items-center gap-3">
            <FaShieldAlt className="text-accent" aria-hidden="true" /> 2. İşlenen Kişisel Veriler
          </h2>
          <p className="text-neutral-600 leading-relaxed mb-6">
            Sunduğumuz hizmetin niteliğine bağlı olarak aşağıdaki kategorilerde kişisel verileriniz
            işlenebilmektedir:
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            {dataCategories.map((c) => (
              <div key={c.title} className="bg-slate-50 border border-slate-100 rounded-2xl p-5">
                <h3 className="font-semibold text-primary mb-2 text-sm">{c.title}</h3>
                <p className="text-sm text-neutral-500 leading-relaxed">{c.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 3. İşleme Amaçları */}
        <section aria-labelledby="isleme-amaclari">
          <h2 id="isleme-amaclari" className="text-2xl font-bold text-primary mb-4 flex items-center gap-3">
            <FaBalanceScale className="text-accent" aria-hidden="true" /> 3. Kişisel Verilerin İşlenme Amaçları
          </h2>
          <p className="text-neutral-600 leading-relaxed mb-4">
            Kişisel verileriniz, KVKK&rsquo;nın 5. ve 6. maddelerinde belirtilen kişisel veri işleme
            şartları ve amaçları dâhilinde aşağıdaki amaçlarla işlenmektedir:
          </p>
          <ul className="space-y-2">
            {purposes.map((p) => (
              <li key={p} className="flex items-start gap-3 text-neutral-600 leading-relaxed">
                <span className="mt-2 w-1.5 h-1.5 rounded-full bg-accent shrink-0" aria-hidden="true" />
                {p}
              </li>
            ))}
          </ul>
        </section>

        {/* 4. Haklarınız */}
        <section aria-labelledby="haklariniz">
          <h2 id="haklariniz" className="text-2xl font-bold text-primary mb-4 flex items-center gap-3">
            <FaBalanceScale className="text-accent" aria-hidden="true" /> 4. KVKK Kapsamındaki Haklarınız
          </h2>
          <p className="text-neutral-600 leading-relaxed mb-4">
            KVKK&rsquo;nın 11. maddesi uyarınca veri sahibi olarak aşağıdaki haklara sahipsiniz:
          </p>
          <ul className="space-y-2">
            {rights.map((r) => (
              <li key={r} className="flex items-start gap-3 text-neutral-600 leading-relaxed">
                <span className="mt-2 w-1.5 h-1.5 rounded-full bg-accent shrink-0" aria-hidden="true" />
                {r}
              </li>
            ))}
          </ul>
        </section>

        {/* 5. Başvuru */}
        <section aria-labelledby="basvuru">
          <h2 id="basvuru" className="text-2xl font-bold text-primary mb-4 flex items-center gap-3">
            <FaEnvelopeOpenText className="text-accent" aria-hidden="true" /> 5. Başvuru Yöntemi
          </h2>
          <p className="text-neutral-600 leading-relaxed">
            Yukarıda belirtilen haklarınıza ilişkin taleplerinizi, kimliğinizi tevsik edici belgelerle
            birlikte{' '}
            <a href="mailto:info@anadoluhastaneleri.com" className="text-primary hover:text-accent transition-colors font-medium underline">
              info@anadoluhastaneleri.com
            </a>{' '}
            adresine iletebilirsiniz. Talebiniz, niteliğine göre en kısa sürede ve en geç otuz gün
            içinde ücretsiz olarak sonuçlandırılacaktır. Ancak işlemin ayrıca bir maliyet gerektirmesi
            hâlinde Kişisel Verileri Koruma Kurulu tarafından belirlenen tarifedeki ücret talep
            edilebilir.
          </p>
        </section>

        <div className="pt-4 border-t border-slate-100">
          <LastUpdated date="23.06.2026" />
        </div>
      </div>
    </div>
  );
};

export default KvkkPage;
