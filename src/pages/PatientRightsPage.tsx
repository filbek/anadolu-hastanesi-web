import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { FaShieldAlt, FaInfoCircle, FaHospitalUser, FaBalanceScale, FaUserSecret, FaHandPaper } from 'react-icons/fa';
import PageBanner from '../components/common/PageBanner';
import LastUpdated from '../components/ui/LastUpdated';

const PatientRightsPage = () => {
  const { t } = useTranslation();
  const rights = [
    {
      icon: <FaBalanceScale />,
      title: t('patientRights.right1Title', 'Hizmetten Genel Olarak Faydalanma'),
      desc: t('patientRights.right1Desc', 'Adalet ve Hakkaniyet ilkeleri çerçevesinde, dil, din, ırk, cinsiyet ve sosyal durum farkı gözetilmeksizin sağlık hizmetlerinden faydalanma hakkınız vardır.')
    },
    {
      icon: <FaInfoCircle />,
      title: t('patientRights.right2Title', 'Bilgilendirme ve Bilgi İsteme'),
      desc: t('patientRights.right2Desc', 'Hastanemizde sunulan tüm hizmetlerin ve olanakların neler olduğunu öğrenmeye, sağlık durumunuz hakkında her türlü sözlü veya yazılı bilgiyi almaya hakkınız vardır.')
    },
    {
      icon: <FaHospitalUser />,
      title: t('patientRights.right3Title', 'Kuruluş ve Personel Seçme/Değiştirme'),
      desc: t('patientRights.right3Desc', 'Sağlık kuruluşunu seçmeye ve değiştirmeye, size hizmet veren doktor ve sağlık çalışanlarının kimlikleri ile görevlerini öğrenmeye, doktorunuzu seçip değiştirmeye hakkınız vardır.')
    },
    {
      icon: <FaUserSecret />,
      title: t('patientRights.right4Title', 'Mahremiyet ve Gizlilik'),
      desc: t('patientRights.right4Desc', 'Sağlık hizmetini gizlilik kurallarına uygun, mahremiyete saygı gösterilen bir ortamda almaya hakkınız bulunmaktadır.')
    },
    {
      icon: <FaHandPaper />,
      title: t('patientRights.right5Title', 'Reddetme, Durdurma ve Rıza'),
      desc: t('patientRights.right5Desc', 'Tıbbi müdahalelerde rızanızın alınmasına, uygulanan tedaviyi reddetmeye veya durdurulmasını istemeye hakkınız vardır.')
    },
    {
      icon: <FaShieldAlt />,
      title: t('patientRights.right6Title', 'Güvenlik ve İnsani Değerlere Saygı'),
      desc: t('patientRights.right6Desc', 'Güvenli, temiz, gürültüden arındırılmış, güler yüzlü ve nazik bir ortamda tedavi olmaya ve inançlarınıza uygun dini vecibelerinizi yerine getirmeye hakkınız vardır.')
    }
  ];

  return (
    <div className="bg-gray-50 min-h-screen">
      <PageBanner
        title={t('patientRights.pageTitle', 'Hasta Hakları ve Sorumlulukları')}
        subtitle={t('patientRights.pageSubtitle', 'Sizin sağlığınız, sizin haklarınız. Güvenli tedavi süreciniz için buradayız.')}
        image="https://images.unsplash.com/photo-1551076805-e18690c5e530?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80"
      />

      <div className="container-custom py-16 lg:py-24">
        {/* Intro */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto text-center mb-16"
        >
          <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center text-2xl mx-auto mb-6">
            <FaShieldAlt />
          </div>
          <h2 className="heading-2 text-secondary mb-6">{t('patientRights.rightsTitle', 'Haklarınız Bizim Güvencemiz Altında')}</h2>
          <p className="text-gray-600 text-lg leading-relaxed">
            {t('patientRights.rightsDesc', 'Hasta hakları, sağlıklı yaşama hakkının en temel parçasıdır. Sağlıklı olmak, sağlıklı kalmak insanların doğuştan getirdikleri devredilemez hakların en başında gelmektedir. Anadolu Hastaneleri olarak, tedavi sürecinizde sahip olduğunuz tüm haklara büyük önem veriyor, hizmetlerimizi bu bilinçle şekillendiriyoruz.')}
          </p>
        </motion.div>

        {/* Rights Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
          {rights.map((right, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 hover:-translate-y-1 transition-transform duration-300"
            >
              <div className="text-4xl text-accent mb-6">
                {right.icon}
              </div>
              <h3 className="text-xl font-bold text-secondary mb-4">{right.title}</h3>
              <p className="text-gray-600 text-sm leading-relaxed">{right.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* Responsibilities */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 mb-12">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            <div className="bg-primary p-12 text-white flex flex-col justify-center">
              <h2 className="text-3xl font-bold mb-6">{t('patientRights.responsibilitiesTitle', 'Hasta Olarak Sorumluluklarınız')}</h2>
              <p className="text-white/80 text-lg mb-8 leading-relaxed">
                {t('patientRights.responsibilitiesDesc', 'Tedavinizin en iyi şekilde sonuçlanması için, sizin de tedavi ekibinin katılımcı bir parçası olduğunuzu unutmamanız gerekmektedir. Sağlanan hizmetin kalitesi, uyumunuzla doğru orantılıdır.')}
              </p>
            </div>
            <div className="p-12">
              <ul className="space-y-6">
                <li className="flex">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-accent/20 text-accent flex items-center justify-center font-bold mr-4">1</div>
                  <p className="text-gray-700">{t('patientRights.resp1', 'Başvurduğunuz sağlık kurumunun kural ve uygulamalarına uygun davranmak.')}</p>
                </li>
                <li className="flex">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-accent/20 text-accent flex items-center justify-center font-bold mr-4">2</div>
                  <p className="text-gray-700">{t('patientRights.resp2', 'Kullandığınız ilaçları, önceki tedavilerinizi, şikayetlerinizi doktorunuza eksiksiz ve doğru olarak aktarmak.')}</p>
                </li>
                <li className="flex">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-accent/20 text-accent flex items-center justify-center font-bold mr-4">3</div>
                  <p className="text-gray-700">{t('patientRights.resp3', 'Hekim tarafından belirlenen sürelerde kontrole gelmek ve randevu iptallerini kuruma zamanında bildirmek.')}</p>
                </li>
                <li className="flex">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-accent/20 text-accent flex items-center justify-center font-bold mr-4">4</div>
                  <p className="text-gray-700">{t('patientRights.resp4', 'Diğer hastaların, ziyaretçilerin ve hastane personelinin haklarına saygı göstermek.')}</p>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Müracaat ve Şikayet */}
        <motion.div
           initial={{ opacity: 0, y: 20 }}
           whileInView={{ opacity: 1, y: 0 }}
           viewport={{ once: true }}
           className="bg-gray-100 rounded-2xl p-8 text-center text-gray-700"
        >
          <p>
            {t('patientRights.footer', "Aldığınız hizmetle ilgili görüş, teşekkür veya şikayetlerinizi hastanemizin Hasta Hakları Birimi'ne iletebilir veya web sitemiz üzerinden iletişim formunu kullanabilirsiniz.")}
          </p>
        </motion.div>

        <div className="container-custom pt-6 pb-0">
          <LastUpdated date="15.05.2024" />
        </div>
      </div>
    </div>
  );
};

export default PatientRightsPage;
