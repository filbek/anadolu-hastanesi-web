import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { FaClock, FaExclamationTriangle, FaUserAltSlash, FaInfoCircle, FaHeartbeat } from 'react-icons/fa';
import LastUpdated from '../components/ui/LastUpdated';
import PageBanner from '../components/common/PageBanner';

const VisitingRulesPage = () => {
  const { t } = useTranslation();
  return (
    <div className="bg-gray-50 min-h-screen">
      <PageBanner
        title={t('visiting.pageTitle', 'Ziyaret Kuralları ve Saatleri')}
        subtitle={t('visiting.pageSubtitle', 'Hastanelerimizdeki ziyaret işleyişi ve uymanız gereken kurallar')}
        image="https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80"
      />

      <div className="container-custom py-16 lg:py-24">
        {/* Intro */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-white rounded-2xl shadow-sm p-8 mb-12 border border-gray-100"
        >
          <div className="flex items-start gap-4">
            <div className="mt-1 flex-shrink-0 w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary text-xl">
              <FaInfoCircle />
            </div>
            <div>
              <h2 className="text-xl font-bold text-secondary mb-2">{t('visiting.purposeTitle', 'Ziyaretin Amacı Nedir?')}</h2>
              <ul className="list-disc pl-5 text-gray-600 space-y-1">
                <li>{t('visiting.purpose1', 'Hastanın dışarıdan temin edilmesi gereken ihtiyaçlarını (giysi vb.) karşılamak.')}</li>
                <li>{t('visiting.purpose2', 'Hastanın hatırını sorarak psikolojik destek vermek.')}</li>
                <li>{t('visiting.purpose3', 'Toplumsal dayanışma gereği, hastanın moral düzeyini yükselterek iyileşme sürecine katkıda bulunmak.')}</li>
              </ul>
            </div>
          </div>
        </motion.div>

        {/* Visiting Hours Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-primary to-primary-dark rounded-2xl shadow-xl p-8 text-white relative overflow-hidden"
          >
            <div className="absolute -right-6 -bottom-6 text-white/10 text-9xl">
              <FaClock />
            </div>
            <h2 className="text-2xl font-bold mb-6 relative z-10">{t('visiting.normalHoursTitle', 'Normal Servis Ziyaret Saatleri')}</h2>
            <p className="text-white/90 mb-6 relative z-10">
              {t('visiting.normalHoursDesc', 'Anadolu Hastanelerinde her gün ziyaret kabul edilmektedir. Gündüz ve akşam olmak üzere iki farklı zaman dilimi belirlenmiştir.')}
            </p>
            <div className="flex flex-col gap-4 relative z-10">
              <div className="bg-white/20 p-4 rounded-xl flex items-center justify-between">
                <span className="font-semibold">{t('visiting.lunchVisit', 'Öğle Ziyareti')}</span>
                <span className="text-xl font-bold">13:00 - 14:00</span>
              </div>
              <div className="bg-white/20 p-4 rounded-xl flex items-center justify-between">
                <span className="font-semibold">{t('visiting.eveningVisit', 'Akşam Ziyareti')}</span>
                <span className="text-xl font-bold">18:00 - 20:00</span>
              </div>
            </div>
            <div className="mt-6 text-sm text-white/80 bg-black/10 p-4 rounded-lg relative z-10 border border-white/20">
              <strong>{t('visiting.nightTitle', 'Gece Neden Ziyaret Yapılmamalı?')}</strong> {t('visiting.nightDesc', 'Gece personel sayısı azalır. Güvenlik, hastaların uykusu ve hasta hakları olumsuz yönde etkilendiği için gece ziyareti yasaktır.')}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 flex flex-col"
          >
            <h2 className="text-2xl font-bold text-secondary mb-6 flex items-center">
              <FaHeartbeat className="mr-3 text-accent" />
              {t('visiting.icuTitle', 'Yoğun Bakım Ziyaretleri')}
            </h2>
            <div className="space-y-4 flex-grow">
              <p className="text-gray-600 text-sm">{t('visiting.icuDesc', 'Yoğun bakımlarda ziyaretler hastanın durumuna göre hekimin kararı ile yapılır. Genellikle ziyaret süresi 5 dakikayı aşmayacak şekilde düzenlenir.')}</p>
              
              <div className="bg-gray-50 border border-gray-100 p-4 rounded-xl">
                <h4 className="font-bold text-gray-800 mb-1">{t('visiting.icuAdult', 'Erişkin Yoğun Bakımlar')}</h4>
                <p className="text-sm text-gray-600">{t('visiting.icuAdultDesc', 'Her gün saat 13:00 - 14:00 arası hekim bilgilendirmesi. Pazartesi, Çarşamba, Cuma günleri bilgilendirme sonrasında kısa ziyaret.')}</p>
              </div>

              <div className="bg-gray-50 border border-gray-100 p-4 rounded-xl">
                <h4 className="font-bold text-gray-800 mb-1">{t('visiting.icuKvc', 'KVC / Koroner Yoğun Bakım')}</h4>
                <p className="text-sm text-gray-600">{t('visiting.icuKvcDesc', 'Hafta içi her gün 12:00 - 13:30 saatleri arası bilgilendirme ve ardından planlı ufak ziyaret.')}</p>
              </div>

              <div className="bg-gray-50 border border-gray-100 p-4 rounded-xl">
                <h4 className="font-bold text-gray-800 mb-1">{t('visiting.icuNewborn', 'Yenidoğan / Çocuk Yoğun Bakım')}</h4>
                <p className="text-sm text-gray-600">{t('visiting.icuNewbornDesc', 'Her gün saat 11:30 - 12:30 arası bilgilendirme. Hekimin uygun gördüğü günlerde ziyaret gerçekleştirilir.')}</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Warning and Do Nots */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-orange-50 rounded-2xl p-8 border border-orange-100"
          >
            <h3 className="text-xl font-bold text-orange-800 mb-4 flex items-center">
              <FaUserAltSlash className="mr-3" />
              {t('visiting.whoNotVisitTitle', 'Kimler Ziyarete Gitmemelidir?')}
            </h3>
            <ul className="space-y-3 text-orange-900">
              <li className="flex items-start">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-500 mt-2 mr-2 flex-shrink-0"></span>
                {t('visiting.whoNotVisit1', '10 yaş altı çocuklar')}
              </li>
              <li className="flex items-start">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-500 mt-2 mr-2 flex-shrink-0"></span>
                {t('visiting.whoNotVisit2', 'Ateş, öksürük, aksırık ve balgam çıkarma gibi şikayetleri olanlar')}
              </li>
              <li className="flex items-start">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-500 mt-2 mr-2 flex-shrink-0"></span>
                {t('visiting.whoNotVisit3', 'Bilinen bir enfeksiyon hastalığı olan hastalar')}
              </li>
              <li className="flex items-start">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-500 mt-2 mr-2 flex-shrink-0"></span>
                {t('visiting.whoNotVisit4', 'Herhangi bir kronik hastalığı olan bireyler')}
              </li>
              <li className="flex items-start">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-500 mt-2 mr-2 flex-shrink-0"></span>
                {t('visiting.whoNotVisit5', 'Bağışıklık sistemi zayıf (enfeksiyona yatkın) kişiler')}
              </li>
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="bg-blue-50 rounded-2xl p-8 border border-blue-100"
          >
            <h3 className="text-xl font-bold text-blue-800 mb-4 flex items-center">
              <FaExclamationTriangle className="mr-3" />
              {t('visiting.rulesTitle', 'Ziyaretçi Kuralları')}
            </h3>
            <ul className="space-y-3 text-blue-900">
              <li className="flex items-start">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 mr-2 flex-shrink-0"></span>
                {t('visiting.rule1', 'Ziyaret süresi kısa olmalıdır (tercihen en fazla 10 dakika).')}
              </li>
              <li className="flex items-start">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 mr-2 flex-shrink-0"></span>
                {t('visiting.rule2', 'Her hasta başında ikiden fazla ziyaretçi olmamalı ve yüksek sesle konuşulmamalıdır.')}
              </li>
              <li className="flex items-start">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 mr-2 flex-shrink-0"></span>
                {t('visiting.rule3', 'Ziyarete gelirken yiyecek getirilmemeli, aynı odadaki diğer hastalara gıda verilmemelidir.')}
              </li>
              <li className="flex items-start">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 mr-2 flex-shrink-0"></span>
                {t('visiting.rule4', 'Hasta yataklarına oturulmamalıdır.')}
              </li>
              <li className="flex items-start">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 mr-2 flex-shrink-0"></span>
                {t('visiting.rule5', 'Ziyaret saati bitiminde görevlilerin uyarısını beklemeden odalar terk edilmelidir.')}
              </li>
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

export default VisitingRulesPage;
