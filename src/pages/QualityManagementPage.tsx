import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import {
  FaClipboardCheck,
  FaChevronRight,
  FaUserShield,
  FaGraduationCap,
  FaBuilding,
  FaRadiation,
  FaHandHoldingHeart,
  FaAppleAlt,
  FaHeartbeat,
  FaTint,
  FaPills,
  FaComments,
  FaUserCheck,
  FaRunning,
  FaWalking,
  FaExclamationTriangle,
  FaFilePdf,
  FaExternalLinkAlt,
  FaAward,
  FaHardHat,
  FaStethoscope,
  FaLock,
  FaHandPaper,
  FaFire,
  FaProcedures,
  FaBaby,
  FaTasks,
  FaSpinner,
} from 'react-icons/fa';
import LastUpdated from '../components/ui/LastUpdated';
import { supabase } from '../lib/supabase';
import type { ManagementTeamMember, Doctor } from '../lib/supabase';
import { COMMITTEE_ICONS, DEFAULT_COMMITTEE_ICON } from '../lib/qualityCommittees';
import type { QualityCommittee } from '../lib/qualityCommittees';

/* ─── Avatar helper (yönetim sayfasıyla aynı) ─── */
const avatar = (name: string) =>
  `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=1e3a5f&color=fff&size=400&bold=true`;

interface ManagerWithDoctor extends ManagementTeamMember {
  doctor?: Doctor | null;
}

const getMemberImage = (member: ManagerWithDoctor): string => {
  if (member.doctor?.image) return member.doctor.image;
  if (member.image) return member.image;
  return avatar(member.name);
};


const councils = (t: any) => [
  { icon: <FaUserShield />, title: t('quality.employeeSafety', 'Çalışan Güvenliği'), desc: t('quality.employeeSafetyDesc', 'Çalışanlarımızın sağlıklı ve güvenli bir ortamda çalışması için risk değerlendirmeleri yapan ve önlemler alan komitedir.') },
  { icon: <FaHandHoldingHeart />, title: t('quality.patientSafety', 'Hasta Güvenliği'), desc: t('quality.patientSafetyDesc', 'Hasta kimlik doğrulaması, ilaç güvenliği ve düşmelerin önlenmesi gibi temel hasta güvenliği süreçlerini koordine eden yapıdır.') },
  { icon: <FaGraduationCap />, title: t('quality.education', 'Eğitim'), desc: t('quality.educationDesc', 'Personelimizin mesleki gelişimini ve hizmet içi eğitim faaliyetlerini planlayan, kalite standartları farkındalığını artırıcı çalışmalar yapan komitedir.') },
  { icon: <FaBuilding />, title: t('quality.facilityManagement', 'Tesis Yönetimi'), desc: t('quality.facilityManagementDesc', 'Hastane altyapısının güvenliğini, acil durum sistemlerini ve teknik donanımın kesintisiz çalışmasını denetleyen komitedir.') },
  { icon: <FaClipboardCheck />, title: t('quality.infectionControl', 'Enfeksiyonların Önlenmesi ve Kontrolü'), desc: t('quality.infectionControlDesc', 'Hastane genelinde enfeksiyon risklerini izleyen, hijyen protokollerini belirleyen ve denetimlerini yürüten komitedir.') },
  { icon: <FaRadiation />, title: t('quality.radiationSafety', 'Radyasyon Güvenliği'), desc: t('quality.radiationSafetyDesc', 'Radyoloji ve nükleer tıp gibi alanlarda hastaların ve çalışanların radyasyondan korunmasını denetleyen kuruldur.') },
  { icon: <FaAppleAlt />, title: t('quality.nutritionTeam', 'Nütrisyon Ekibi'), desc: t('quality.nutritionTeamDesc', 'Yatan hastaların beslenme durumlarını değerlendiren, enteral ve parenteral beslenme planlarını oluşturan ekiptir.') },
  { icon: <FaHeartbeat />, title: t('quality.organTransplant', 'Organ Nakli Komitesi'), desc: t('quality.organTransplantDesc', 'Organ ve doku nakli süreçlerini, donör ve alıcı koordinasyonunu etik ve yasal kurallara uygun olarak denetleyen komitedir.') },
  { icon: <FaTint />, title: t('quality.transfusionCommittee', 'Transfüzyon Komitesi'), desc: t('quality.transfusionCommitteeDesc', 'Kan ve kan ürünlerinin güvenli kullanımı, transfüzyon reaksiyonlarının takibi ve kan bankası süreçlerini denetleyen komitedir.') },
  { icon: <FaPills />, title: t('quality.medicationSafety', 'İlaç Güvenliği Ekibi'), desc: t('quality.medicationSafetyDesc', 'İlaç hatalarının önlenmesi, yüksek riskli ilaçların takibi ve güvenli ilaç kullanım protokollerinin denetimini yapan ekiptir.') },
  { icon: <FaComments />, title: t('quality.employeeOpinions', 'Çalışan Görüşleri Değerlendirme Ekibi'), desc: t('quality.employeeOpinionsDesc', 'Çalışan memnuniyeti anketleri ve geri bildirimleri doğrultusunda çalışma koşullarını iyileştirici faaliyetleri yürüten ekiptir.') },
  { icon: <FaUserCheck />, title: t('quality.patientRightsSatisfaction', 'Hasta Hakları ve Hasta Memnuniyeti Değerlendirme Komitesi'), desc: t('quality.patientRightsSatisfactionDesc', 'Hasta hakları ihlallerini inceleyen, hasta memnuniyeti geri bildirimlerini analiz eden ve iyileştirici faaliyetler planlayan komitedir.') },
  { icon: <FaRunning />, title: t('quality.ftrUnitEvaluation', 'FTR Ünitesi Değerlendirme Ekibi'), desc: t('quality.ftrUnitEvaluationDesc', 'Fizik Tedavi ve Rehabilitasyon ünitesinin hizmet kalitesini, hasta güvenliğini ve cihazların uygunluğunu denetleyen ekiptir.') },
  { icon: <FaWalking />, title: t('quality.buildingTour', 'Bina Turu Ekibi'), desc: t('quality.buildingTourDesc', 'Hastane genelinde düzenli fiziksel denetimler yaparak tesis güvenliğini, temizliğini ve çevre düzenini izleyen ekiptir.') },
  { icon: <FaExclamationTriangle />, title: t('quality.disasterEmergency', 'Afet ve Acil Durum Ekibi'), desc: t('quality.disasterEmergencyDesc', 'Hastane Afet ve Acil Durum Planını (HAP) hazırlayan, acil durum tatbikatlarını organize eden ve kriz anlarında koordinasyonu sağlayan ekiptir.') },
  { icon: <FaHardHat />, title: t('quality.occupationalHealthSafety', 'İş Sağlığı Güvenliği Ekibi'), desc: '' },
  { icon: <FaStethoscope />, title: t('quality.clinicalQuality', 'Klinik Kalite Komitesi'), desc: '' },
  { icon: <FaLock />, title: t('quality.infoSecurity', 'Bilgi Güvenliği Ekibi'), desc: '' },
  { icon: <FaHandPaper />, title: t('quality.whiteCode', 'Beyaz Kod Ekibi'), desc: '' },
  { icon: <FaFire />, title: t('quality.redCode', 'Kırmızı Kod Ekibi'), desc: '' },
  { icon: <FaProcedures />, title: t('quality.blueCode', 'Mavi Kod Ekibi'), desc: '' },
  { icon: <FaBaby />, title: t('quality.pinkCode', 'Pembe Kod Ekibi'), desc: '' },
  { icon: <FaTasks />, title: t('quality.selfAssessmentTeam', 'Öz Değerlendirme Planı Ekibi'), desc: '' },
];


const QualityManagementPage = () => {
  const { t } = useTranslation();
  const [dbCommittees, setDbCommittees] = useState<QualityCommittee[]>([]);
  const [qualityManager, setQualityManager] = useState<ManagerWithDoctor | null>(null);
  const [orgChartUrl, setOrgChartUrl] = useState<string | null>(null);
  const [orgChartLoading, setOrgChartLoading] = useState(true);

  useEffect(() => {
    const fetchCommittees = async () => {
      try {
        const { data, error } = await supabase
          .from('quality_committees')
          .select('*')
          .eq('is_active', true)
          .order('display_order', { ascending: true });

        if (error) throw error;
        setDbCommittees(data || []);
      } catch (error) {
        // Tablo henüz yoksa ya da hata olursa aşağıdaki varsayılan liste gösterilir
        console.error('Error fetching quality committees:', error);
      }
    };

    const fetchQualityManager = async () => {
      try {
        const { data, error } = await supabase
          .from('management_team')
          .select(`
            *,
            doctor:doctor_id(id, name, title, image, department_id)
          `)
          .eq('is_active', true)
          .eq('role', 'quality_management_manager')
          .order('display_order', { ascending: true })
          .limit(1)
          .maybeSingle();

        if (error) throw error;
        if (data) setQualityManager(data as ManagerWithDoctor);
      } catch (error) {
        console.error('Error fetching quality manager:', error);
      }
    };

    const fetchOrgChart = async () => {
      try {
        const { data, error } = await supabase
          .from('site_settings')
          .select('organization_chart_pdf_url')
          .maybeSingle();

        if (error) throw error;
        setOrgChartUrl(data?.organization_chart_pdf_url || null);
      } catch (error) {
        console.error('Error fetching organization chart:', error);
      } finally {
        setOrgChartLoading(false);
      }
    };

    fetchCommittees();
    fetchQualityManager();
    fetchOrgChart();
  }, []);

  const committees = dbCommittees.length > 0
    ? dbCommittees.map((c) => {
        const Icon = COMMITTEE_ICONS[c.icon] || COMMITTEE_ICONS[DEFAULT_COMMITTEE_ICON];
        return { icon: <Icon />, title: c.title, desc: c.description };
      })
    : councils(t);

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


      {/* ─── KALİTE YÖNETİM BİRİMİ ─── */}
      <section className="bg-gray-50 py-20 lg:py-28">
        <div className="container-custom">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="max-w-2xl mb-12">
            <div className="flex items-center gap-3 mb-5">
              <span className="block h-px w-[60px] bg-accent" />
              <span className="text-xs uppercase tracking-[0.25em] text-accent font-bold">{t('quality.unitTag', 'Yönetim')}</span>
            </div>
            <h2 className="text-4xl lg:text-5xl font-black text-secondary leading-tight mb-4">
              {t('quality.unitTitle', 'Kalite Yönetim')} <span className="text-primary">{t('quality.unitHighlight', 'Birimi')}</span>
            </h2>
            <p className="text-gray-500 text-lg">
              {t('quality.unitDesc', 'Kalite yönetim sistemimizin yürütülmesi, iç denetimler ve sürekli iyileştirme faaliyetleri kalite yönetim birimimiz tarafından koordine edilmektedir.')}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col md:flex-row items-center"
          >
            {qualityManager && (
              <div className="relative w-full md:w-2/5 h-64 md:h-auto md:min-h-[320px] flex-shrink-0">
                <img
                  src={getMemberImage(qualityManager)}
                  alt={qualityManager.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a1628]/40 to-transparent md:bg-gradient-to-r" />
              </div>
            )}
            <div className="flex-1 p-8 md:p-12 text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold mb-4">
                <FaUserShield />
                {qualityManager?.title || t('quality.managerTitle', 'Kalite Yönetim Müdürü')}
              </div>
              <h3 className="text-2xl md:text-3xl font-black text-secondary mb-3">
                {qualityManager?.name || t('quality.managerName', 'Bilge BATUR')}
              </h3>
              <p className="text-gray-500 leading-relaxed">
                {t('quality.managerBio', 'Kalite yönetim birimimiz; Sağlık Bakanlığı Sağlıkta Kalite Standartları (SAS/SKS) ve uluslararası akreditasyon standartlarına uyumun sağlanması, süreçlerin izlenmesi, iç denetimlerin yürütülmesi ve kalite iyileştirme faaliyetlerinin koordinasyonundan sorumludur.')}
              </p>
            </div>
          </motion.div>
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
              {t('quality.orgTitle', 'Kalite Yönetim Birimi')} <span className="text-primary">{t('quality.orgHighlight', 'Organizasyon Şeması')}</span>
            </h2>
            <p className="text-gray-500 text-lg">
              {t('quality.orgDesc', 'Kalite yönetim sistemimizin temel yönetim kademeleri aşağıda gösterilmektedir.')}
            </p>
          </motion.div>

          {/* Org Chart - PDF (tıklayınca PDF açılır) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex justify-center"
          >
            {orgChartLoading ? (
              <div className="max-w-4xl w-full rounded-2xl border border-gray-200 shadow-md bg-slate-50 h-[500px] flex items-center justify-center">
                <FaSpinner className="animate-spin text-primary text-3xl" />
              </div>
            ) : orgChartUrl ? (
              <a
                href={orgChartUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block max-w-4xl w-full rounded-2xl overflow-hidden border border-gray-200 shadow-md bg-slate-50 group cursor-pointer"
              >
                {/* PDF önizleme */}
                <div className="relative w-full h-[420px] md:h-[600px] bg-white pointer-events-none">
                  <object
                    data={`${orgChartUrl}#toolbar=0&navpanes=0&view=FitH`}
                    type="application/pdf"
                    className="w-full h-full"
                    aria-label={t('quality.orgHighlight', 'Organizasyon Şeması')}
                  >
                    <iframe
                      src={orgChartUrl}
                      title={t('quality.orgHighlight', 'Organizasyon Şeması')}
                      className="w-full h-full"
                    />
                  </object>
                  {/* Tıklama katmanı — tüm alan tıklanınca PDF açılır */}
                  <div className="absolute inset-0 bg-[#0a1628]/0 group-hover:bg-[#0a1628]/40 transition-colors duration-300 flex items-center justify-center">
                    <div className="bg-white/95 text-primary font-bold px-6 py-3 rounded-xl flex items-center gap-2 shadow-lg scale-90 group-hover:scale-100 transition-transform duration-300">
                      <FaExternalLinkAlt />
                      {t('quality.openPdf', 'Tıklayın, PDF Açılsın')}
                    </div>
                  </div>
                </div>
                {/* Bilgi çubuğu */}
                <div className="bg-white border-t border-gray-100 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <FaFilePdf className="text-red-500 text-xl" />
                    <span>{t('quality.orgFileName', 'Organizasyon Şeması (PDF)')}</span>
                  </div>
                  <span className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary text-white font-bold rounded-xl group-hover:brightness-110 transition-all text-sm">
                    <FaExternalLinkAlt className="text-xs" />
                    {t('quality.openPdfButton', 'PDF Olarak Aç')}
                  </span>
                </div>
              </a>
            ) : (
              <div className="max-w-4xl w-full rounded-2xl border border-dashed border-gray-300 shadow-sm bg-gray-50 h-[360px] flex flex-col items-center justify-center text-center px-6">
                <FaFilePdf className="text-gray-300 text-5xl mb-4" />
                <p className="text-gray-500 font-semibold">
                  {t('quality.noPdfUploaded', 'Henüz organizasyon şeması yüklenmedi.')}
                </p>
                <p className="text-gray-400 text-sm mt-1">
                  {t('quality.noPdfUploadedDesc', 'İçerik yöneticisi tarafından eklenecektir.')}
                </p>
              </div>
            )}
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
              {t('quality.committeeTitle', 'Komiteler ve Ekibi')}
            </h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3"
          >
            {committees.map((c, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: Math.min(i * 0.03, 0.4) }}
                className="flex items-center gap-3 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:border-primary/30 px-4 py-3 transition-all duration-200"
              >
                <div className="w-9 h-9 flex-shrink-0 rounded-lg bg-primary/8 text-primary flex items-center justify-center text-sm">
                  {c.icon}
                </div>
                <h3 className="text-sm font-bold text-secondary leading-tight">{c.title}</h3>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>


      {/* ─── DOKÜMANLAR VE BAĞLANTILAR ─── */}
      <section className="bg-white py-20 lg:py-28 border-t border-gray-100">
        <div className="container-custom">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="max-w-2xl mb-14">
            <div className="flex items-center gap-3 mb-5">
              <span className="block h-px w-[60px] bg-accent" />
              <span className="text-xs uppercase tracking-[0.25em] text-accent font-bold">
                {t('quality.linksTag', 'Dokümanlar')}
              </span>
            </div>
            <h2 className="text-4xl lg:text-5xl font-black text-secondary leading-tight mb-4">
              {t('quality.linksTitle', 'Dokümanlar ve')} <span className="text-primary">{t('quality.linksHighlight', 'Bağlantılar')}</span>
            </h2>
            <p className="text-gray-500 text-lg">
              {t('quality.linksDesc', 'Kalite yönetim sistemimize ilişkin resmî dokümanlara ve ilgili platformlara aşağıdaki kartlardan ulaşabilirsiniz.')}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Kalite Standartları (SAS) */}
            <motion.a
              href="https://tuska.tuseb.gov.tr"
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              whileHover={{ y: -4 }}
              className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:border-primary/30 p-7 flex flex-col transition-all duration-300"
            >
              <div className="w-14 h-14 rounded-xl bg-primary/8 text-primary flex items-center justify-center text-2xl mb-5 group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                <FaFilePdf />
              </div>
              <div className="flex items-center gap-2 mb-2">
                <span className="block h-px w-6 bg-accent" />
                <span className="text-[10px] uppercase tracking-[0.2em] text-accent font-bold">
                  {t('quality.standardsTag', 'Sağlıkta Kalite')}
                </span>
              </div>
              <h3 className="text-lg font-bold text-secondary mb-2">
                {t('quality.standardsTitle', 'Kalite Standartları (SAS)')}
              </h3>
              <p className="text-gray-500 text-sm leading-relaxed flex-1">
                {t('quality.standardsDesc', 'T.C. Sağlık Bakanlığı Sağlıkta Kalite Standartları (SAS) belgesi ve ilgili dokümanlar.')}
              </p>
              <span className="mt-4 inline-flex items-center gap-2 text-primary text-sm font-bold">
                {t('quality.standardsButton', 'SAS Standartlarını İncele')}
                <FaExternalLinkAlt className="text-xs group-hover:translate-x-0.5 transition-transform" />
              </span>
            </motion.a>

            {/* Sağlıkta Kalite, Akreditasyon ve Çalışan Hakları */}
            <motion.a
              href="https://shgmkalitedb.saglik.gov.tr/"
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              whileHover={{ y: -4 }}
              className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:border-primary/30 p-7 flex flex-col transition-all duration-300"
            >
              <div className="w-14 h-14 rounded-xl bg-primary/8 text-primary flex items-center justify-center text-2xl mb-5 group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                <FaAward />
              </div>
              <div className="flex items-center gap-2 mb-2">
                <span className="block h-px w-6 bg-accent" />
                <span className="text-[10px] uppercase tracking-[0.2em] text-accent font-bold">
                  {t('quality.accreditationTag', 'Akreditasyon')}
                </span>
              </div>
              <h3 className="text-lg font-bold text-secondary mb-2">
                {t('quality.accreditationTitle', 'Sağlıkta Kalite, Akreditasyon ve Çalışan Hakları Daire Başkanlığı')}
              </h3>
              <p className="text-gray-500 text-sm leading-relaxed flex-1">
                {t('quality.accreditationDesc', 'Sağlık Bakanlığı Sağlıkta Kalite, Akreditasyon ve Çalışan Hakları Daire Başkanlığı değerlendirme veri tabanı platformu.')}
              </p>
              <span className="mt-4 inline-flex items-center gap-2 text-primary text-sm font-bold">
                {t('quality.accreditationButton', 'Platforma Git')}
                <FaExternalLinkAlt className="text-xs group-hover:translate-x-0.5 transition-transform" />
              </span>
            </motion.a>

            {/* Öz Değerlendirme Ekibi Planı */}
            <motion.a
              href={t('quality.selfAssessmentLink', '#')}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              whileHover={{ y: -4 }}
              className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:border-primary/30 p-7 flex flex-col transition-all duration-300"
            >
              <div className="w-14 h-14 rounded-xl bg-primary/8 text-primary flex items-center justify-center text-2xl mb-5 group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                <FaClipboardCheck />
              </div>
              <div className="flex items-center gap-2 mb-2">
                <span className="block h-px w-6 bg-accent" />
                <span className="text-[10px] uppercase tracking-[0.2em] text-accent font-bold">
                  {t('quality.selfAssessmentTag', 'Plan')}
                </span>
              </div>
              <h3 className="text-lg font-bold text-secondary mb-2">
                {t('quality.selfAssessmentTitle', 'Öz Değerlendirme Ekibi Planı')}
              </h3>
              <p className="text-gray-500 text-sm leading-relaxed flex-1">
                {t('quality.selfAssessmentDesc', 'Kalite öz değerlendirme ekibi çalışma planına ilişkin doküman.')}
              </p>
              <span className="mt-4 inline-flex items-center gap-2 text-primary text-sm font-bold">
                {t('quality.selfAssessmentButton', 'Dokümanı İncele')}
                <FaExternalLinkAlt className="text-xs group-hover:translate-x-0.5 transition-transform" />
              </span>
            </motion.a>
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
    </>
  );
};

export default QualityManagementPage;
