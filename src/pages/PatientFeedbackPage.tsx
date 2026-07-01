import { useState } from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { FaPaperPlane, FaCheckCircle, FaChevronRight, FaPhoneAlt, FaEnvelope, FaComments } from 'react-icons/fa';
import LastUpdated from '../components/ui/LastUpdated';
import { useHospitals } from '../hooks/useHospitals';
import { createPatientFeedback } from '../services/patientFeedbackService';
import { sendFormEmail } from '../services/emailService';
import TurnstileWidget from '../components/common/TurnstileWidget';
import { verifyTurnstile, turnstileEnabled } from '../services/turnstileService';

const getFeedbackTypes = (t: any) => [
  { value: 'oneri', label: t('feedback.typeSuggestion', 'Öneri'), icon: '💡', color: 'bg-blue-50 border-blue-200 text-blue-700' },
  { value: 'sikayet', label: t('feedback.typeComplaint', 'Şikayet'), icon: '⚠️', color: 'bg-red-50 border-red-200 text-red-700' },
  { value: 'tesekkur', label: t('feedback.typeThanks', 'Teşekkür'), icon: '🙏', color: 'bg-green-50 border-green-200 text-green-700' },
];

const PatientFeedbackPage = () => {
  const { t } = useTranslation();
  const { data: hospitalsData, isLoading: hospitalsLoading } = useHospitals();
  // Form kime ait: 'hasta' (hasta/ziyaretçi) veya 'personel' (çalışan)
  const [audience, setAudience] = useState<'hasta' | 'personel'>('hasta');
  // Sadece personel için: isim vermeden (anonim) gönderme
  const [anonymous, setAnonymous] = useState(false);
  const [selectedType, setSelectedType] = useState('oneri');
  const [selectedHospital, setSelectedHospital] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);

  // Personel + anonim seçiliyken isim/soyisim gizlenir ve zorunlu olmaz
  const isAnonymous = audience === 'personel' && anonymous;
  const [formData, setFormData] = useState({
    name: '',
    surname: '',
    phone: '',
    email: '',
    department: '',
    message: '',
    consent: false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.consent) {
      alert(t('feedback.kvkkAlert', 'KVKK aydınlatma metnini onaylamanız gerekmektedir.'));
      return;
    }

    if (turnstileEnabled) {
      if (!captchaToken) {
        alert(t('common.captchaRequired', 'Lütfen "robot değilim" doğrulamasını tamamlayın.'));
        return;
      }
      setSubmitting(true);
      const captchaOk = await verifyTurnstile(captchaToken);
      if (!captchaOk) {
        setSubmitting(false);
        setCaptchaToken(null);
        alert(t('common.captchaFailed', 'Doğrulama başarısız oldu. Lütfen tekrar deneyin.'));
        return;
      }
    }

    const hospital = hospitalsData?.find(h => h.slug === selectedHospital || h.name === selectedHospital);
    const hospital_id = hospital?.id ? Number(hospital.id) : undefined;
    const audienceLabel = audience === 'personel' ? t('feedback.audienceEmployee', 'Çalışan') : t('feedback.audiencePatient', 'Hasta');
    const subject = `[${audienceLabel}] ${getFeedbackTypes(t).find((ft: any) => ft.value === selectedType)?.label || t('feedback.defaultSubject', 'Geri Bildirim')}${formData.department ? ` - ${formData.department}` : ''}`;
    const fullName = isAnonymous ? t('feedback.anonymous', 'Anonim') : `${formData.name} ${formData.surname}`.trim();

    setSubmitting(true);
    const { error } = await createPatientFeedback({
      name: fullName,
      email: isAnonymous ? undefined : (formData.email || undefined),
      phone: isAnonymous ? undefined : (formData.phone || undefined),
      subject,
      message: formData.message,
      hospital_id,
      source: audience,
    });

    if (error) {
      setSubmitting(false);
      alert(t('feedback.submitError', 'Geri bildiriminiz gönderilirken bir hata oluştu. Lütfen tekrar deneyin.'));
      return;
    }

    // Geri bildirimi admin panelinde belirlenen e-posta adresine de gönder (bloklamaz)
    await sendFormEmail('feedback', {
      name: fullName,
      email: isAnonymous ? '' : formData.email,
      phone: isAnonymous ? '' : formData.phone,
      subject,
      source: audienceLabel,
      hospital: hospital?.name,
      department: formData.department,
      message: formData.message,
    });
    setSubmitting(false);

    setSubmitted(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (submitted) {
    return (
      <>
        <Helmet>
          <title>{t('feedback.pageTitle', 'Sizi Dinliyoruz')} | Anadolu Hastaneleri Grubu</title>
        </Helmet>
        <section className="min-h-screen bg-gray-50 flex items-center justify-center py-20">
          <div className="container-custom max-w-2xl text-center">
            <motion.div
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 200 }}
              className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-green-100 text-green-600 text-5xl mx-auto mb-6"
            >
              <FaCheckCircle />
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <h2 className="text-3xl font-black text-secondary mb-4">{t('feedback.successTitle', 'Geri Bildiriminiz Alındı!')}</h2>
              <p className="text-gray-600 text-lg mb-8">
                {t('feedback.successDesc', 'Değerli görüşünüz için teşekkür ederiz. Hasta İlişkileri ekibimiz en kısa sürede sizinle iletişime geçecektir.')}
              </p>
              <a
                href="/"
                className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-white font-bold rounded-xl hover:brightness-110 transition-all"
              >
                {t('feedback.backHome', 'Anasayfaya Dön')} <FaChevronRight />
              </a>
            </motion.div>
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>{t('feedback.pageTitle', 'Sizi Dinliyoruz')} | Anadolu Hastaneleri Grubu</title>
        <meta
          name="description"
          content={t('feedback.metaDescription', 'Anadolu Hastaneleri Grubu olarak görüş, öneri ve şikayetlerinizi değerlendiriyor, hizmet kalitemizi sürekli iyileştiriyoruz.')}
        />
      </Helmet>

      {/* ─── HERO ─── */}
      <section className="relative min-h-[420px] md:min-h-[500px] flex items-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1559523161-0fc0d8b38a7a?ixlib=rb-4.0.3&auto=format&fit=crop&w=2400&q=80')",
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
              <span className="text-accent text-xs uppercase tracking-[0.25em] font-semibold">Hasta İlişkileri</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-white leading-tight mb-6">
              {t('feedback.heroTitle1', 'Sizi')}
              <br />
              <span className="text-accent">{t('feedback.heroTitle2', 'Dinliyoruz')}</span>
            </h1>
            <p className="text-white/70 text-lg md:text-xl leading-relaxed max-w-xl">
              {t('feedback.heroDesc', 'Görüşleriniz bizim için değerlidir. Öneri, şikayet ve teşekkürlerinizi buradan iletebilirsiniz.')}
            </p>
          </motion.div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 overflow-hidden">
          <svg viewBox="0 0 1440 60" preserveAspectRatio="none" className="w-full h-12 md:h-16 fill-gray-50">
            <polygon points="0,60 1440,0 1440,60" />
          </svg>
        </div>
      </section>

      {/* ─── MAIN ─── */}
      <section className="bg-gray-50 py-20 lg:py-28">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

            {/* Info sidebar */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="lg:col-span-1 space-y-6"
            >
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <span className="block h-px w-[40px] bg-accent" />
                  <span className="text-xs uppercase tracking-widest text-accent font-bold">{t('feedback.channelsTag', 'İletişim Kanalları')}</span>
                </div>
                <h2 className="text-3xl font-black text-secondary mb-4">{t('feedback.contactTitle', 'Bize Ulaşın')}</h2>
                <p className="text-gray-500 leading-relaxed">
                  {t('feedback.contactDesc', 'Hasta ilişkileri ekibimiz güler yüzlü hizmet anlayışıyla sizlere her zaman yardımcı olmaya hazırdır.')}
                </p>
              </div>

              {/* Contact Info Cards */}
              {[
                {
                  icon: <FaPhoneAlt />,
                  title: t('common.phone', 'Telefon'),
                  value: '444 50 58',
                  sub: t('feedback.phoneHours', 'Pazartesi - Cuma: 08:00 - 18:00'),
                },
                {
                  icon: <FaEnvelope />,
                  title: t('common.email', 'E-Posta'),
                  value: 'hastahaklari@anadoluhastaneleri.com',
                  sub: t('feedback.emailResponse', 'En geç 24 saat içinde yanıt verilir'),
                },
                {
                  icon: <FaComments />,
                  title: t('feedback.faceToFace', 'Yüz Yüze Görüşme'),
                  value: t('feedback.faceToFaceValue', 'Hasta İlişkileri Birimi'),
                  sub: t('feedback.faceToFaceSub', 'Hastanemiz zemin katında bulunmaktadır'),
                },
              ].map((item, i) => (
                <div key={i} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                    {item.icon}
                  </div>
                  <div>
                    <p className="font-bold text-secondary text-sm">{item.title}</p>
                    <p className="text-gray-700 text-sm mt-0.5">{item.value}</p>
                    <p className="text-gray-400 text-xs mt-1">{item.sub}</p>
                  </div>
                </div>
              ))}
            </motion.div>

            {/* Form */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="lg:col-span-2"
            >
              <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-8 lg:p-10">
                <h2 className="text-2xl font-black text-secondary mb-6">{t('feedback.formTitle', 'Geri Bildirim Formu')}</h2>

                {/* Kime ait — Hasta / Çalışan sekmesi */}
                <div className="grid grid-cols-2 gap-2 p-1 bg-gray-100 rounded-xl mb-6" role="tablist" aria-label={t('feedback.audienceLabel', 'Formu dolduran')}>
                  {[
                    { value: 'hasta' as const, label: t('feedback.audiencePatientTab', 'Hasta / Ziyaretçi') },
                    { value: 'personel' as const, label: t('feedback.audienceEmployeeTab', 'Çalışan Personel') },
                  ].map((tab) => (
                    <button
                      key={tab.value}
                      type="button"
                      role="tab"
                      aria-selected={audience === tab.value}
                      onClick={() => { setAudience(tab.value); if (tab.value === 'hasta') setAnonymous(false); }}
                      className={`py-2.5 rounded-lg text-sm font-bold transition-all ${
                        audience === tab.value ? 'bg-white text-primary shadow-sm' : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Feedback type */}
                  <div>
                    <label className="block text-sm font-bold text-secondary mb-3">{t('feedback.typeLabel', 'Bildirim Türü')} *</label>
                    <div className="grid grid-cols-3 gap-3">
                      {getFeedbackTypes(t).map((type: any) => (
                        <button
                          key={type.value}
                          type="button"
                          onClick={() => setSelectedType(type.value)}
                          className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 font-bold text-sm transition-all duration-200 ${selectedType === type.value
                              ? 'border-primary bg-primary/5 text-primary'
                              : 'border-gray-200 text-gray-500 hover:border-primary/30'
                            }`}
                        >
                          <span className="text-2xl">{type.icon}</span>
                          {type.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Hospital selection */}
                  <div>
                    <label htmlFor="hospital" className="block text-sm font-bold text-secondary mb-2">{t('feedback.hospitalLabel', 'Hastane Seçimi')} *</label>
                    <select
                      id="hospital"
                      value={selectedHospital}
                      onChange={(e) => setSelectedHospital(e.target.value)}
                      required
                      disabled={hospitalsLoading}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-secondary focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                    >
                      <option value="">{t('feedback.hospitalPlaceholder', 'Hastane seçiniz...')}</option>
                      {hospitalsLoading ? (
                        <option>{t('common.loading', 'Yükleniyor...')}</option>
                      ) : (
                        hospitalsData?.map((h) => (
                          <option key={h.id} value={h.slug || h.name}>{h.name}</option>
                        ))
                      )}
                    </select>
                  </div>

                  {/* Anonim seçeneği — yalnızca çalışan personel için */}
                  {audience === 'personel' && (
                    <label className="flex items-start gap-3 cursor-pointer group bg-amber-50 border border-amber-200 rounded-xl p-4">
                      <input
                        type="checkbox"
                        checked={anonymous}
                        onChange={(e) => setAnonymous(e.target.checked)}
                        className="mt-0.5 w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary flex-shrink-0"
                      />
                      <span className="text-sm text-amber-900 leading-relaxed">
                        <strong>{t('feedback.anonymousTitle', 'Anonim gönder')}</strong>
                        <br />
                        <span className="text-amber-700">{t('feedback.anonymousDesc', 'İsim vermek istemiyorsanız işaretleyin. Ad, soyad ve iletişim bilgileriniz alınmaz.')}</span>
                      </span>
                    </label>
                  )}

                  {/* Name / Surname — anonimde gizlenir */}
                  {!isAnonymous && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="name" className="block text-sm font-bold text-secondary mb-2">Ad *</label>
                        <input
                          id="name"
                          name="name"
                          type="text"
                          required={!isAnonymous}
                          value={formData.name}
                          onChange={handleChange}
                          placeholder="Adınız"
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-secondary placeholder-gray-400 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                        />
                      </div>
                      <div>
                        <label htmlFor="surname" className="block text-sm font-bold text-secondary mb-2">Soyad *</label>
                        <input
                          id="surname"
                          name="surname"
                          type="text"
                          required={!isAnonymous}
                          value={formData.surname}
                          onChange={handleChange}
                          placeholder="Soyadınız"
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-secondary placeholder-gray-400 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                        />
                      </div>
                    </div>
                  )}

                  {/* Phone / Email — anonimde gizlenir */}
                  {!isAnonymous && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="phone" className="block text-sm font-bold text-secondary mb-2">Telefon</label>
                        <input
                          id="phone"
                          name="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={handleChange}
                          placeholder="05XX XXX XX XX"
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-secondary placeholder-gray-400 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                        />
                      </div>
                      <div>
                        <label htmlFor="email" className="block text-sm font-bold text-secondary mb-2">E-Posta</label>
                        <input
                          id="email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleChange}
                          placeholder="ornek@mail.com"
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-secondary placeholder-gray-400 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                        />
                      </div>
                    </div>
                  )}

                  {/* Department */}
                  <div>
                    <label htmlFor="department" className="block text-sm font-bold text-secondary mb-2">{t('feedback.departmentLabel', 'İlgili Birim / Bölüm')}</label>
                    <input
                      id="department"
                      name="department"
                      type="text"
                      value={formData.department}
                      onChange={handleChange}
                      placeholder={t('feedback.departmentPlaceholder', 'Örn: Acil Servis, Dahiliye, Polikliniği...')}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-secondary placeholder-gray-400 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                  </div>

                  {/* Message */}
                  <div>
                    <label htmlFor="message" className="block text-sm font-bold text-secondary mb-2">
                      {t('common.message', 'Mesajınız')} *{' '}
                      <span className="text-gray-400 font-normal">
                        — {selectedType === 'sikayet' ? t('feedback.placeholderComplaint', 'Şikayetinizi') : selectedType === 'tesekkur' ? t('feedback.placeholderThanks', 'Teşekkür mesajınızı') : t('feedback.placeholderSuggestion', 'Önerinizi')} {t('feedback.detail', 'detaylı anlatın')}
                      </span>
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      rows={5}
                      required
                      value={formData.message}
                      onChange={handleChange}
                      placeholder={t('feedback.messagePlaceholder', 'Lütfen görüşünüzü detaylı olarak paylaşın...')}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-secondary placeholder-gray-400 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all resize-none"
                    />
                  </div>

                  {/* Consent */}
                  <label className="flex items-start gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      name="consent"
                      required
                      checked={formData.consent}
                      onChange={handleChange}
                      className="mt-1 w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary flex-shrink-0"
                    />
                    <span className="text-sm text-gray-500 leading-relaxed group-hover:text-gray-700 transition-colors">
                      {t('feedback.kvkkPrefix', 'Kişisel verilerimin işlenmesine ilişkin')}{' '}
                      <a href="#" className="text-primary font-medium underline">{t('feedback.kvkkLink', 'KVKK aydınlatma metnini')}</a>{' '}
                      {t('feedback.kvkkSuffix', 'okudum ve onaylıyorum.')} *
                    </span>
                  </label>

                  {/* Bot koruması */}
                  <TurnstileWidget onVerify={setCaptchaToken} />

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full flex items-center justify-center gap-3 px-8 py-4 bg-primary text-white font-bold rounded-xl hover:brightness-110 active:scale-[0.99] transition-all text-lg disabled:opacity-60"
                  >
                    {submitting ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-white"></div>
                    ) : (
                      <FaPaperPlane />
                    )}
                    {submitting ? t('feedback.sending', 'Gönderiliyor...') : t('common.send', 'Gönder')}
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
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

export default PatientFeedbackPage;
