import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import {
  FaFileAlt,
  FaClipboardCheck,
  FaUsers,
  FaShieldAlt,
  FaCertificate,
  FaChevronRight,
  FaUserTie,
  FaChartLine,
  FaSitemap,
  FaBalanceScale,
  FaSearchPlus,
  FaSearchMinus,
  FaTimes,
} from 'react-icons/fa';
import LastUpdated from '../components/ui/LastUpdated';

const documents = (t: any) => [
  {
    icon: <FaFileAlt />,
    category: t('quality.legalDocs', 'Yasal Belgeler'),
    items: [
      'Ayakta Teşhis ve Tedavi Yapılan Özel Sağlık Kuruluşları Hakkında Yönetmelik',
      'Özel Hastaneler Yönetmeliği',
      'Hasta Hakları Yönetmeliği',
      'Sağlık Hizmetleri Temel Kanunu',
      'Tıbbi Deontoloji Nizamnamesi',
    ],
  },
  {
    icon: <FaClipboardCheck />,
    category: t('quality.qualityStandards', 'Kalite Standartları'),
    items: [
      'Sağlıkta Kalite Standartları (SKS) — Hastane Seti',
      'ISO 9001:2015 Kalite Yönetim Sistemi',
      'ISO 15189 Tıbbi Laboratuvar Akreditasyonu',
      'JCI (Joint Commission International) Standartları',
      'TÜRKAK Akreditasyon Belgeleri',
    ],
  },
  {
    icon: <FaShieldAlt />,
    category: t('quality.patientSafety', 'Hasta Güvenliği'),
    items: [
      'Hasta Güvenliği El Kitabı',
      'Tıbbi Hata Bildirimi ve Yönetimi Prosedürü',
      'Enfeksiyon Kontrol Komitesi Prosedürleri',
      'İlaç Güvenliği Prosedürü',
      'Kimlik Doğrulama Prosedürü',
    ],
  },
  {
    icon: <FaCertificate />,
    category: t('quality.accreditation', 'Akreditasyon & Sertifikalar'),
    items: [
      'Sağlık Bakanlığı Ruhsatı',
      'Kalite Belgesi (SKS)',
      'Gıda Güvenliği Sertifikası',
      'Radyasyon Güvenliği Lisansı',
      'Yangın Güvenliği Uygunluk Belgesi',
    ],
  },
];

const councils = (t: any) => [
  { icon: <FaUsers />, title: t('quality.councilSafety', 'Hasta Güvenliği Komitesi'), desc: t('quality.councilSafetyDesc', 'Hastanemizdeki tüm güvenlik olaylarını değerlendiren, önlem alan ve politikaları belirleyen komitedir.') },
  { icon: <FaClipboardCheck />, title: t('quality.councilInfection', 'Enfeksiyon Kontrol Komitesi'), desc: t('quality.councilInfectionDesc', 'Hastane enfeksiyonlarının önlenmesi ve takibini sağlayan, sürveyans çalışmalarını yürüten komitedir.') },
  { icon: <FaBalanceScale />, title: t('quality.councilEthics', 'Etik Komite'), desc: t('quality.councilEthicsDesc', 'Tıbbi etik ilkeler doğrultusunda hasta haklarını koruma ve etik meseleleri değerlendirme komitesidir.') },
  { icon: <FaChartLine />, title: t('quality.councilQuality', 'Kalite Geliştirme Komitesi'), desc: t('quality.councilQualityDesc', 'SKS (Sağlıkta Kalite Standartları) çerçevesinde sürekli iyileştirme faaliyetlerini planlayan ve izleyen komitedir.') },
  { icon: <FaUserTie />, title: t('quality.councilMedical', 'Tıbbi Hizmetler Konseyi'), desc: t('quality.councilMedicalDesc', 'Tıbbi süreçlerin verimliliğini ve hasta memnuniyetini artırmaya yönelik kararlar alan üst konseydedir.') },
  { icon: <FaSitemap />, title: t('quality.councilRisk', 'Risk Yönetim Komitesi'), desc: t('quality.councilRiskDesc', 'Kurumsal riskleri belirleyen, değerlendiren ve azaltmaya yönelik stratejiler geliştiren komitedir.') },
];

const qualitySteps = (t: any) => [
  { number: '01', title: t('quality.step1Title', 'Planlama'), desc: t('quality.step1Desc', 'Kalite hedeflerinin belirlenmesi ve standartların tanımlanması.') },
  { number: '02', title: t('quality.step2Title', 'Uygulama'), desc: t('quality.step2Desc', 'Belirlenen prosedür ve protokollerin tüm birimlerde hayata geçirilmesi.') },
  { number: '03', title: t('quality.step3Title', 'Kontrol'), desc: t('quality.step3Desc', 'Süreçlerin SKS ve ISO standartlarına uygunluğunun iç denetimle izlenmesi.') },
  { number: '04', title: t('quality.step4Title', 'İyileştirme'), desc: t('quality.step4Desc', 'Bulgular doğrultusunda düzeltici faaliyetlerin başlatılması ve sonuçların değerlendirilmesi.') },
];

const QualityManagementPage = () => {
  const { t } = useTranslation();
  const [isZoomModalOpen, setIsZoomModalOpen] = useState(false);
  const [zoomScale, setZoomScale] = useState(1);

  return (
    <>
      <Helmet>
        <title>{t('quality.pageTitle', 'Kalite Yönetimi')} | Anadolu Hastaneleri Grubu</title>
        <meta
          name="description"
          content={t('quality.metaDescription', 'Anadolu Hastaneleri Grubu kalite yönetim sistemi, organizasyon şeması, komiteler ve akreditasyon bilgileri.')}
        />
      </Helmet>

      {/* ─── HERO ─── */}
      <section className="relative min-h-[480px] md:min-h-[560px] flex items-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?ixlib=rb-4.0.3&auto=format&fit=crop&w=2400&q=80')",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0a1628]/95 via-[#0a1628]/80 to-[#0a1628]/50" />
        <div className="absolute left-0 top-0 h-full w-1 bg-accent" />

        <div className="container-custom relative z-10 py-24">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-3xl"
          >
            <div className="flex items-center gap-2 mb-6">
              <span className="block h-px w-10 bg-accent" />
              <span className="text-accent text-xs uppercase tracking-[0.25em] font-semibold">Kurumsal</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-white leading-tight mb-6">
              {t('quality.heroTitle1', 'Kalite')}
              <br />
              <span className="text-accent">{t('quality.heroTitle2', 'Yönetimi')}</span>
            </h1>
            <p className="text-white/70 text-lg md:text-xl leading-relaxed max-w-xl">
              {t('quality.heroDesc', 'Uluslararası standartlar ve Sağlık Bakanlığı mevzuatı doğrultusunda kesintisiz kalite iyileştirme anlayışımız.')}
            </p>
          </motion.div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 overflow-hidden">
          <svg viewBox="0 0 1440 60" preserveAspectRatio="none" className="w-full h-12 md:h-16 fill-gray-50">
            <polygon points="0,60 1440,0 1440,60" />
          </svg>
        </div>
      </section>

      {/* ─── PUKÖ CYCLE ─── */}
      <section className="bg-gray-50 py-20 lg:py-28">
        <div className="container-custom">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="max-w-2xl mb-14">
            <div className="flex items-center gap-3 mb-5">
              <span className="block h-px w-[60px] bg-accent" />
              <span className="text-xs uppercase tracking-[0.25em] text-accent font-bold">Süreç Döngüsü</span>
            </div>
            <h2 className="text-4xl lg:text-5xl font-black text-secondary leading-tight mb-4">
              {t('quality.cycleTitle', 'PUKÖ')} <span className="text-primary">{t('quality.cycleHighlight', 'Kalite Döngüsü')}</span>
            </h2>
            <p className="text-gray-500 text-lg">
              {t('quality.cycleDesc', 'Tüm süreçlerimizi "Planla → Uygula → Kontrol Et → Önlem Al" döngüsüyle sürekli iyileştiriyoruz.')}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {qualitySteps(t).map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="relative bg-white rounded-2xl p-8 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 group overflow-hidden"
              >
                <span className="absolute top-4 right-4 text-6xl font-black text-gray-50 leading-none select-none group-hover:text-primary/5 transition-colors">
                  {step.number}
                </span>
                <div className="relative z-10">
                  <span className="inline-block px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded-full mb-4">{step.number}</span>
                  <h3 className="text-xl font-black text-secondary mb-3">{step.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── ORGANİZASYON ŞEMASI ─── */}
      <section className="bg-white py-20 lg:py-28">
        <div className="container-custom">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="max-w-2xl mb-14">
            <div className="flex items-center gap-3 mb-5">
              <span className="block h-px w-[60px] bg-accent" />
              <span className="text-xs uppercase tracking-[0.25em] text-accent font-bold">Yapı</span>
            </div>
            <h2 className="text-4xl lg:text-5xl font-black text-secondary leading-tight mb-4">
              {t('quality.orgTitle', 'Organizasyon')} <span className="text-primary">{t('quality.orgHighlight', 'Şeması')}</span>
            </h2>
            <p className="text-gray-500 text-lg">
              {t('quality.orgDesc', 'Kalite yönetim sistemimizin temel yönetim kademeleri aşağıda gösterilmektedir.')}
            </p>
          </motion.div>

          {/* Org Chart Visual - Image with Click to Zoom */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex justify-center"
          >
            <div 
              className="relative group max-w-4xl w-full rounded-2xl overflow-hidden border border-gray-200 shadow-md bg-slate-50 cursor-pointer" 
              onClick={() => setIsZoomModalOpen(true)}
            >
              <img 
                src="/uploads/organizasyon-semasi.png" 
                alt={t('quality.orgTitle', 'Organizasyon Şeması')} 
                className="w-full h-auto object-contain max-h-[600px] mx-auto"
              />
              <div className="absolute inset-0 bg-[#0a1628]/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <div className="bg-white/95 text-primary font-bold px-6 py-3 rounded-xl flex items-center gap-2 shadow-lg scale-90 group-hover:scale-100 transition-transform duration-300">
                  <FaSearchPlus />
                  {t('quality.clickToZoom', 'Tıklayın ve Büyütün')}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── KOMİTELER ─── */}
      <section className="bg-gray-50 py-20 lg:py-28">
        <div className="container-custom">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="max-w-2xl mb-14">
            <div className="flex items-center gap-3 mb-5">
              <span className="block h-px w-[60px] bg-accent" />
              <span className="text-xs uppercase tracking-[0.25em] text-accent font-bold">Kalite Yapısı</span>
            </div>
            <h2 className="text-4xl lg:text-5xl font-black text-secondary leading-tight mb-4">
              {t('quality.committeeTitle', 'Komiteler &')} <span className="text-primary">{t('quality.committeeHighlight', 'Konseyler')}</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {councils(t).map((c, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="bg-white rounded-2xl p-7 border border-gray-100 shadow-sm hover:shadow-md hover:border-primary/20 transition-all duration-300 group"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/8 text-primary flex items-center justify-center text-xl mb-5 group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                  {c.icon}
                </div>
                <h3 className="text-lg font-bold text-secondary mb-2">{c.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{c.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── BELGELER ─── */}
      <section className="bg-white py-20 lg:py-28">
        <div className="container-custom">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="max-w-2xl mb-14">
            <div className="flex items-center gap-3 mb-5">
              <span className="block h-px w-[60px] bg-accent" />
              <span className="text-xs uppercase tracking-[0.25em] text-accent font-bold">Mevzuat</span>
            </div>
            <h2 className="text-4xl lg:text-5xl font-black text-secondary leading-tight mb-4">
              {t('quality.legislationTitle', 'Yasal Belgeler &')} <span className="text-primary">{t('quality.legislationHighlight', 'Standartlar')}</span>
            </h2>
            <p className="text-gray-500 text-lg">
              {t('quality.legislationDesc', 'Sağlık mevzuatı çerçevesinde sürdürdüğümüz belgelendirme ve standart çalışmalarımız.')}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {documents(t).map((doc, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-gray-50 rounded-2xl p-8 border border-gray-100"
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-primary text-white flex items-center justify-center text-xl">
                    {doc.icon}
                  </div>
                  <h3 className="text-lg font-bold text-secondary">{doc.category}</h3>
                </div>
                <ul className="space-y-3">
                  {doc.items.map((item, j) => (
                    <li key={j} className="flex items-start gap-3 text-sm text-gray-600">
                      <FaChevronRight className="text-accent text-xs mt-1 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── BOTTOM CTA ─── */}
      <section className="bg-primary py-14">
        <div className="container-custom flex flex-col md:flex-row items-center justify-between gap-6">
          <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <p className="text-accent text-xs uppercase tracking-[0.2em] font-bold mb-2">{t('common.brand', 'Anadolu Hastaneleri Grubu')}</p>
            <h3 className="text-2xl md:text-3xl font-black text-white">{t('quality.bottomCta', 'Kalite Anlayışımızla Hizmetinizdeyiz')}</h3>
          </motion.div>
          <motion.a
            href="/iletisim"
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex-shrink-0 inline-flex items-center gap-2 px-8 py-4 bg-accent text-white font-bold rounded-xl hover:brightness-110 transition-all"
          >
            {t('common.contactUs', 'İletişime Geçin')}
            <FaChevronRight className="text-sm" />
          </motion.a>
        </div>
      </section>

      <section className="bg-white py-6 border-t border-gray-100">
        <div className="container-custom">
          <LastUpdated date="22.06.2026" />
        </div>
      </section>

      {/* Zoom Modal Overlay */}
      <AnimatePresence>
        {isZoomModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-[#0a1628]/95 backdrop-blur-md flex flex-col items-center justify-center p-4"
          >
            {/* Control bar */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-white/10 backdrop-blur-md px-6 py-3 rounded-full flex items-center gap-6 text-white z-[110] border border-white/10 shadow-2xl">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setZoomScale(prev => Math.max(0.5, prev - 0.25));
                }}
                className="hover:text-accent transition-colors p-1"
                title={t('quality.zoomOut', 'Uzaklaştır')}
              >
                <FaSearchMinus size={18} />
              </button>
              <span className="text-sm font-semibold select-none w-12 text-center">
                %{Math.round(zoomScale * 100)}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setZoomScale(prev => Math.min(4, prev + 0.25));
                }}
                className="hover:text-accent transition-colors p-1"
                title={t('quality.zoomIn', 'Yakınlaştır')}
              >
                <FaSearchPlus size={18} />
              </button>
              <div className="w-px h-5 bg-white/20" />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setZoomScale(1);
                }}
                className="hover:text-accent transition-colors p-1 text-xs font-bold"
                title={t('quality.resetZoom', 'Sıfırla')}
              >
                {t('quality.reset', 'SIFIRLA')}
              </button>
            </div>

            {/* Close Button */}
            <button
              onClick={() => {
                setIsZoomModalOpen(false);
                setZoomScale(1);
              }}
              className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 text-white w-12 h-12 rounded-full flex items-center justify-center transition-colors z-[110] border border-white/10"
              title={t('common.close', 'Kapat')}
            >
              <FaTimes size={20} />
            </button>

            {/* Image container */}
            <div 
              className="w-full h-full flex items-center justify-center overflow-hidden relative cursor-grab active:cursor-grabbing"
              onClick={() => {
                setIsZoomModalOpen(false);
                setZoomScale(1);
              }}
            >
              <motion.div
                drag
                dragConstraints={{ left: -1000, right: 1000, top: -1000, bottom: 1000 }}
                dragElastic={0.15}
                className="flex items-center justify-center"
                onClick={(e) => e.stopPropagation()}
              >
                <motion.img
                  src="/uploads/organizasyon-semasi.png"
                  alt="Organizasyon Şeması"
                  animate={{ scale: zoomScale }}
                  transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                  className="max-w-[90vw] max-h-[80vh] object-contain select-none pointer-events-none rounded-lg"
                />
              </motion.div>
            </div>

            {/* Navigation Instruction */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/50 text-xs text-center select-none bg-black/40 px-4 py-2 rounded-full pointer-events-none">
              {t('quality.dragToPan', 'Görseli sürükleyerek kaydırabilir, arka plana tıklayarak kapatabilirsiniz.')}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default QualityManagementPage;
