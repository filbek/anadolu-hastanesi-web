import { motion } from 'framer-motion';
import LastUpdated from '../components/ui/LastUpdated';
import { useTranslation } from 'react-i18next';
import { FaUserPlus, FaSmokingBan, FaVolumeMute, FaHandSparkles, FaUtensils, FaBan, FaBed } from 'react-icons/fa';
import PageBanner from '../components/common/PageBanner';

const CompanionPolicyPage = () => {
  const { t } = useTranslation();
  return (
    <div className="bg-gray-50 min-h-screen">
      <PageBanner
        title={t('companion.pageTitle', 'Refakat Politikası ve Refakatçi Kuralları')}
        subtitle={t('companion.pageSubtitle', 'Hastanelerimizde yatan hastalarımızın ve yakınlarının güvenliği için')}
        image="https://images.unsplash.com/photo-1538108149393-fbbd81895907?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80"
      />

      <div className="container-custom py-16 lg:py-24">
        {/* Policy Info Box */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-white rounded-2xl shadow-lg p-8 mb-16 border-l-4 border-primary"
        >
          <h2 className="text-2xl font-bold text-secondary mb-4">{t('companion.policyTitle', 'Hastane Refakat Politikası')}</h2>
          <p className="text-gray-600 leading-relaxed">
            {t('companion.policyDesc', 'Anadolu Hastaneleri olarak hizmet akışını engellemeyecek şekilde, hastanemizin imkanlarının elverdiği ve hastanın sağlık durumunun gerektirdiği ölçüde, uygun zaman ve yöntem dahilinde, belirli kurallar konularak, yatarak hizmet alan hastalarımızın tıbbi bakım ve psikososyal ihtiyaçlarının karşılanmasına yönelik hasta yakınlarının destek ve katılımı sağlanarak, kurumsal imajımızı artırmak ve kaliteli sağlık hizmeti sunmayı amaçlamaktayız.')}
          </p>
        </motion.div>

        {/* Kimler Refakatçi Olmamalıdır? */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-16">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-4"
          >
            <div className="bg-red-50 rounded-2xl p-8 border border-red-100 h-full">
              <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center text-2xl mb-6">
                <FaBan />
              </div>
              <h2 className="text-2xl font-bold text-secondary mb-6">{t('companion.whoNotTitle', 'Kimler Refakatçi Olmamalıdır?')}</h2>
              <ul className="space-y-4">
                {[
                  t('companion.whoNot1', '18 yaş altı çocuklar,'),
                  t('companion.whoNot2', 'Ateş, öksürük, balgam çıkarma gibi şikâyeti olanlar,'),
                  t('companion.whoNot3', 'Enfeksiyon hastalığı veya enfeksiyona yatkınlığı olanlar,'),
                  t('companion.whoNot4', 'Bakıma ihtiyacı olan kişiler,'),
                  t('companion.whoNot5', 'Herhangi bir kronik hastalığı olanlar refakatçi olmamalıdır.')
                ].map((item, index) => (
                  <li key={index} className="flex items-start">
                    <span className="inline-block w-2 h-2 rounded-full bg-red-400 mt-2 mr-3 flex-shrink-0"></span>
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-6"
          >
            <h2 className="text-3xl font-bold text-secondary col-span-full border-b pb-4 mb-2">{t('companion.generalRulesTitle', 'Genel Refakat Kuralları')}</h2>
            {[
              { icon: <FaSmokingBan />, title: t('companion.ruleSmoking', 'Sigara ve Tütün'), desc: t('companion.ruleSmokingDesc', 'Hastane binası içerisinde sigara ve tütün ürünleri içilmez.') },
              { icon: <FaVolumeMute />, title: t('companion.ruleNoise', 'Gürültü'), desc: t('companion.ruleNoiseDesc', 'Hastane binası içinde yüksek sesle konuşulmaz ve gürültü yapılmaz.') },
              { icon: <FaHandSparkles />, title: t('companion.ruleHygiene', 'El Hijyeni'), desc: t('companion.ruleHygieneDesc', 'Refakatçiler el hijyeni kurallarına mutlak suretle uymalıdır.') },
              { icon: <FaUtensils />, title: t('companion.ruleFood', 'Yiyecek ve İçecek'), desc: t('companion.ruleFoodDesc', 'Dışarıdan yiyecek/içecek getirilmemeli, hekime/hemşireye danışmadan hastaya verilmemelidir.') },
              { icon: <FaUserPlus />, title: t('companion.ruleLimit', 'Sınırlı Sayı'), desc: t('companion.ruleLimitDesc', 'Refakatçi sayısı özel durumlar dışında 1 (bir) kişiyle sınırlıdır.') },
              { icon: <FaBed />, title: t('companion.ruleVisit', 'Vizit Saatleri'), desc: t('companion.ruleVisitDesc', 'Doktor vizit saatlerinde refakatçiler hasta odalarını boşaltmalıdır.') },
            ].map((rule, idx) => (
              <div key={idx} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-start gap-4 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-primary/10 text-primary rounded-lg flex items-center justify-center text-xl flex-shrink-0">
                  {rule.icon}
                </div>
                <div>
                  <h3 className="font-bold text-secondary mb-1">{rule.title}</h3>
                  <p className="text-sm text-gray-500">{rule.desc}</p>
                </div>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Detailed Rules List */}
        <motion.div
           initial={{ opacity: 0, y: 20 }}
           whileInView={{ opacity: 1, y: 0 }}
           viewport={{ once: true }}
           className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 mb-16"
        >
          <div className="bg-secondary p-8 text-white">
            <h2 className="text-2xl font-bold">{t('companion.detailsTitle', 'Önemli Detaylar')}</h2>
          </div>
          <div className="p-8">
            <ul className="space-y-4 columns-1 md:columns-2 gap-8 text-gray-600">
              <li className="break-inside-avoid">Refakatçiler doktor ve hemşire direktifleri dışında hastaya herhangi bir uygulama yapmamalıdır.</li>
              <li className="break-inside-avoid">Hastane kuralları konusunda görevlilere yardımcı olunmalıdır.</li>
              <li className="break-inside-avoid">Refakatçi için hasta kabulü sırasında kimlik ibrazı ile refakatçi kaydı yapılır.</li>
              <li className="break-inside-avoid">Değişimde mutlaka servis hemşiresine bilgi verilmesi gerekmektedir. İlgili hekim ya da hemşire istemi dışında, hasta dışarı çıkarılmamalıdır.</li>
              <li className="break-inside-avoid">Yatış sırasında değerli eşyalar hasta tarafından refakatçisine teslim edilmelidir.</li>
              <li className="break-inside-avoid">Hastanın sağlığı açısından herhangi bir sorun olduğunda öncelikle servis hemşirelerine bilgi verilmelidir.</li>
              <li className="break-inside-avoid">Topraklı çiçekler, enfeksiyon taşıma riskleri nedeniyle hasta odalarına kabul edilmemektedir.</li>
              <li className="break-inside-avoid">Kadın servisinde erkek refakatçi kalamaz.</li>
              <li className="break-inside-avoid">Refakatçiler adlarına düzenlenmiş refakat kimlik kartlarını sürekli takılı tutmak mecburiyetindedirler.</li>
              <li className="break-inside-avoid">Odalar içerisinde elektrikli ev aletleri (çay, kahve makinesi) kullanılmamalıdır.</li>
              <li className="break-inside-avoid">Çocuk hastalar için küçük oyuncaklar getirmeyiniz. Yere düşen oyuncakları temizlemeden vermeyiniz.</li>
              <li className="break-inside-avoid">Hasta düşmelerini önlemek için yatak korkuluklarının kalkık pozisyonda olmasına özen gösteriniz.</li>
            </ul>
          </div>
        </motion.div>

        {/* Eating and Special Units */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white rounded-2xl shadow-md p-8 border border-gray-100"
          >
            <h3 className="text-xl font-bold text-secondary mb-6 flex items-center">
              <FaUtensils className="mr-3 text-primary" />
              {t('companion.mealTimesTitle', 'Yemek Saatlerimiz')}
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <tbody>
                  <tr className="border-b border-gray-100">
                    <td className="py-3 text-gray-600 font-medium">{t('companion.breakfast', 'Kahvaltı')}</td>
                    <td className="py-3 text-primary font-bold">06.30 - 07.30</td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-3 text-gray-600 font-medium">{t('companion.midMorning', 'Kuşluk')}</td>
                    <td className="py-3 text-primary font-bold">09.00 - 09.45</td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-3 text-gray-600 font-medium">{t('companion.lunch', 'Öğle')}</td>
                    <td className="py-3 text-primary font-bold">12.00 - 13.00</td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-3 text-gray-600 font-medium">{t('companion.afternoon', 'İkindi')}</td>
                    <td className="py-3 text-primary font-bold">15.00 - 15.45</td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-3 text-gray-600 font-medium">{t('companion.dinner', 'Akşam')}</td>
                    <td className="py-3 text-primary font-bold">17.00 - 18.00</td>
                  </tr>
                  <tr>
                    <td className="py-3 text-gray-600 font-medium">{t('companion.nightMeal', 'Gece')}</td>
                    <td className="py-3 text-primary font-bold">21.00 - 21.45</td>
                  </tr>
                </tbody>
              </table>
              <p className="mt-4 text-xs text-gray-500 italic">{t('companion.mealNote', 'Sadece kayıtlı olan refakatçimiz ücretsiz olarak yemek hizmetinden faydalanabilmektedir.')}</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl shadow-md p-8 border border-gray-100"
          >
            <h3 className="text-xl font-bold text-secondary mb-6 flex items-center">
              <FaBan className="mr-3 text-accent" />
              {t('companion.specialRulesTitle', 'Özellikli Bölüm Refakatçi Kuralları')}
            </h3>
            <ul className="space-y-4 text-gray-600 pl-4 list-disc marker:text-accent">
              <li>Terminal dönem, geriatri, bağışıklık sistemi baskılanmış veya istismara uğramış hastaların bulunduğu bölümlerde refakatçiler mutlaka kişisel koruyucu ekipman (maske, bone vb.) kullanmalıdır.</li>
              <li>Bu özellikli hasta gruplarının yanında kalacak kişilerin enfeksiyon veya ciddi kronik hastalığı olmamalıdır ve hastanın tanıdığı, güven duyduğu kişiler olmalıdır.</li>
              <li>Ameliyat sonrası veya yoğun bakım çıkışı süreçlerinde bölüm hemşiresinin direktiflerine harfiyen uyulmalıdır.</li>
            </ul>
          </motion.div>
        </div>

      </div>

      <section className="bg-white py-6 border-t border-gray-100">
        <div className="container-custom">
          <LastUpdated date="22.06.2026" />
        </div>
      </section>
    </div>
  );
};

export default CompanionPolicyPage;
