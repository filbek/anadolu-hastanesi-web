import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  FaCheckCircle,
  FaCloudUploadAlt,
  FaPaperPlane,
  FaArrowRight,
  FaStethoscope,
  FaShieldAlt,
  FaUserMd,
  FaHospital,
} from 'react-icons/fa';
import { useHospitals } from '../../hooks/useHospitals';
import { supabase } from '../../lib/supabase';
import { sendFormEmail } from '../../services/emailService';

const SecondOpinionSection = () => {
  const { t } = useTranslation();
  const { data: hospitals = [], isLoading: hospitalsLoading } = useHospitals();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    hospital: '',
    message: '',
    consent: false,
    captcha: false,
  });
  const [fileName, setFileName] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 40 * 1024 * 1024) {
        alert(t('secondOpinion.fileTooLarge', 'Dosya boyutu 40MB sınırını aşıyor. Lütfen daha küçük bir dosya yükleyin.'));
        e.target.value = '';
        setFileName('');
        return;
      }
      setFileName(file.name);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.consent) {
      alert(t('secondOpinion.consentAlert', 'Lütfen KVKK aydınlatma metnini onaylayın.'));
      return;
    }
    if (!formData.captcha) {
      alert(t('secondOpinion.captchaAlert', 'Lütfen güvenlik doğrulamasını tamamlayın.'));
      return;
    }

    setSubmitting(true);
    try {
      let fileUrl = null;
      const file = fileInputRef.current?.files?.[0];
      if (file) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}-${Date.now()}.${fileExt}`;
        const filePath = `second-opinion/${fileName}`;
        const { error: uploadError } = await supabase.storage
          .from('doctor-images')
          .upload(filePath, file);
        if (!uploadError) {
          const { data } = supabase.storage.from('doctor-images').getPublicUrl(filePath);
          fileUrl = data.publicUrl;
        }
      }

      const { error: insertError } = await supabase.from('second_opinion_submissions').insert([
        {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          hospital: formData.hospital || null,
          message: formData.message,
          file_url: fileUrl,
          consent: formData.consent,
        },
      ]);

      if (insertError) throw insertError;

      // Başvuruyu admin panelinde belirlenen e-posta adresine de gönder (bloklamaz)
      await sendFormEmail('second_opinion', {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        hospital: formData.hospital || '-',
        message: formData.message,
        file_url: fileUrl,
      });

      setSubmitted(true);
    } catch (err: any) {
      console.error('Form submission error:', err);
      alert('Başvuru gönderilirken hata oluştu: ' + (err?.message || ''));
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <section className="bg-gray-50 py-24 lg:py-32">
        <div className="container-custom max-w-2xl text-center">
          <motion.div
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 200 }}
            className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 text-green-600 text-4xl mx-auto mb-6"
          >
            <FaCheckCircle />
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <h2 className="text-3xl font-black text-secondary mb-4">
              {t('secondOpinion.successTitle', 'Başvurunuz Alındı!')}
            </h2>
            <p className="text-gray-500 text-lg mb-8">
              {t('secondOpinion.successDesc', 'Uzman ekibimiz en kısa sürede size dönüş yapacaktır.')}
            </p>
            <button
              onClick={() => {
                setSubmitted(false);
                setFormData({ name: '', email: '', phone: '', hospital: '', message: '', consent: false, captcha: false });
                setFileName('');
              }}
              className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-white font-bold rounded-xl hover:brightness-110 transition-all"
            >
              {t('secondOpinion.newForm', 'Yeni Başvuru')}
              <FaArrowRight />
            </button>
          </motion.div>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-gray-50 py-20 lg:py-28">
      <div className="container-custom">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 lg:gap-16 items-start">
          {/* Left — Info */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-2"
          >
            <div className="flex items-center gap-2 mb-5">
              <span className="block h-px w-10 bg-accent" />
              <span className="text-accent text-xs uppercase tracking-[0.25em] font-semibold">
                {t('secondOpinion.tag', 'İkinci Görüş')}
              </span>
            </div>
            <h2 className="text-3xl lg:text-4xl font-black text-secondary leading-tight mb-6">
              {t('secondOpinion.title1', 'Uzman Bir')}{' '}
              <span className="text-primary">{t('secondOpinion.title2', 'Doktordan')}</span>{' '}
              {t('secondOpinion.title3', 'İkinci Görüş Alın')}
            </h2>
            <p className="text-gray-500 leading-relaxed mb-8">
              {t(
                'secondOpinion.desc',
                'Tanı ve tedavi planınız konusunda emin olmak istiyorsanız, alanında uzman hekimlerimizden ikinci görüş alabilirsiniz. Raporlarınızı ve tahlillerinizi yükleyerek değerlendirme talebinde bulunun.'
              )}
            </p>

            {/* Trust visual */}
            <div className="relative rounded-3xl overflow-hidden shadow-xl mb-8">
              <img
                src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=800&q=80"
                alt={t('secondOpinion.imageAlt', 'Uzman doktor hasta raporlarını değerlendiriyor')}
                className="w-full aspect-[16/10] object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-secondary/60 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 flex items-center gap-3 bg-white/95 backdrop-blur-sm rounded-2xl px-4 py-3 shadow-lg">
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center text-lg flex-shrink-0">
                  <FaCheckCircle />
                </div>
                <div>
                  <p className="text-sm font-black text-secondary leading-tight">
                    {t('secondOpinion.badgeTitle', '24-48 Saat İçinde')}
                  </p>
                  <p className="text-xs text-gray-500">
                    {t('secondOpinion.badgeDesc', 'Uzman hekim değerlendirmesi')}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {[
                {
                  icon: <FaUserMd />,
                  title: t('secondOpinion.feature1Title', 'Uzman Kadro'),
                  desc: t('secondOpinion.feature1Desc', 'Her branşta deneyimli profesör ve uzman doktorlarımızdan görüş alın.'),
                },
                {
                  icon: <FaStethoscope />,
                  title: t('secondOpinion.feature2Title', 'Kapsamlı Değerlendirme'),
                  desc: t('secondOpinion.feature2Desc', 'Mevcut tanı ve tedavi planınız detaylıca incelenir.'),
                },
                {
                  icon: <FaShieldAlt />,
                  title: t('secondOpinion.feature3Title', 'Gizlilik Garantisi'),
                  desc: t('secondOpinion.feature3Desc', 'Tüm sağlık verileriniz KVKK kapsamında güvenle saklanır.'),
                },
                {
                  icon: <FaHospital />,
                  title: t('secondOpinion.feature4Title', 'Hızlı Dönüş'),
                  desc: t('secondOpinion.feature4Desc', 'Başvurunuz 24-48 saat içinde uzman hekimimize iletilir.'),
                },
              ].map((f, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-start gap-4"
                >
                  <div className="w-10 h-10 rounded-xl bg-primary/8 text-primary flex items-center justify-center text-lg flex-shrink-0">
                    {f.icon}
                  </div>
                  <div>
                    <h4 className="font-bold text-secondary text-sm">{f.title}</h4>
                    <p className="text-gray-400 text-sm leading-relaxed">{f.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right — Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="lg:col-span-3"
          >
            <div className="bg-[#E8F4F8]/60 rounded-3xl p-6 lg:p-10 border border-[#cce8f0]">
              <h3 className="text-xl font-black text-secondary mb-6">
                {t('secondOpinion.formTitle', 'Başvuru Formu')}
              </h3>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Row 1 */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="so-name" className="block text-sm font-bold text-secondary mb-2">
                      {t('secondOpinion.labelName', 'Ad Soyad')} *
                    </label>
                    <input
                      id="so-name"
                      name="name"
                      type="text"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      placeholder={t('secondOpinion.placeholderName', 'Adınız ve soyadınız')}
                      className="w-full px-5 py-3.5 rounded-xl border border-gray-200 bg-white text-secondary placeholder:text-gray-400 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                    />
                  </div>
                  <div>
                    <label htmlFor="so-email" className="block text-sm font-bold text-secondary mb-2">
                      {t('secondOpinion.labelEmail', 'E-Posta Adresiniz')} *
                    </label>
                    <input
                      id="so-email"
                      name="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      placeholder={t('secondOpinion.placeholderEmail', 'ornek@mail.com')}
                      className="w-full px-5 py-3.5 rounded-xl border border-gray-200 bg-white text-secondary placeholder:text-gray-400 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                    />
                  </div>
                </div>

                {/* Row 2 */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="so-phone" className="block text-sm font-bold text-secondary mb-2">
                      {t('secondOpinion.labelPhone', 'Telefon Numaranız')} *
                    </label>
                    <input
                      id="so-phone"
                      name="phone"
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder={t('secondOpinion.placeholderPhone', '05XX XXX XX XX')}
                      className="w-full px-5 py-3.5 rounded-xl border border-gray-200 bg-white text-secondary placeholder:text-gray-400 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                    />
                  </div>
                  <div>
                    <label htmlFor="so-hospital" className="block text-sm font-bold text-secondary mb-2">
                      {t('secondOpinion.labelHospital', 'Hastane Seçin')}
                    </label>
                    <select
                      id="so-hospital"
                      name="hospital"
                      value={formData.hospital}
                      onChange={handleChange}
                      disabled={hospitalsLoading}
                      className="w-full px-5 py-3.5 rounded-xl border border-gray-200 bg-white text-secondary focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all appearance-none"
                      style={{ backgroundImage: 'none' }}
                    >
                      <option value="">
                        {hospitalsLoading ? t('common.loading', 'Yükleniyor...') : t('secondOpinion.hospitalPlaceholder', 'Hastane seçin...')}
                      </option>
                      {hospitals.map((h) => (
                        <option key={h.id} value={h.name}>
                          {h.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Message */}
                <div>
                  <label htmlFor="so-message" className="block text-sm font-bold text-secondary mb-2">
                    {t('secondOpinion.labelMessage', 'Bilgi Almak İstediğiniz Konuyu Kısaca Açıklayınız')} *
                  </label>
                  <textarea
                    id="so-message"
                    name="message"
                    rows={4}
                    required
                    value={formData.message}
                    onChange={handleChange}
                    placeholder={t('secondOpinion.placeholderMessage', 'Şikayetleriniz, mevcut tanılarınız ve sormak istediğiniz sorular...')}
                    className="w-full px-5 py-3.5 rounded-xl border border-gray-200 bg-white text-secondary placeholder:text-gray-400 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all resize-none"
                  />
                </div>

                {/* File Upload */}
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full flex flex-col items-center justify-center gap-2 p-6 rounded-xl border-2 border-dashed border-primary/30 bg-white/50 hover:bg-white hover:border-primary/50 transition-all cursor-pointer"
                  >
                    <FaCloudUploadAlt className="text-2xl text-primary/60" />
                    <div className="text-center">
                      <p className="text-sm font-bold text-secondary">
                        {fileName || t('secondOpinion.fileLabel', 'Dosya Yükle (Rapor, tahlil vb.)')}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {t('secondOpinion.fileHint', 'Maksimum 40MB — PDF, JPG, PNG')}
                      </p>
                    </div>
                  </button>
                </div>

                {/* KVKK */}
                <label className="flex items-start gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    name="consent"
                    checked={formData.consent}
                    onChange={handleChange}
                    className="mt-1 w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary flex-shrink-0"
                  />
                  <span className="text-sm text-gray-500 leading-relaxed group-hover:text-gray-700 transition-colors">
                    <a href="#" className="text-primary font-medium underline">
                      {t('secondOpinion.kvkkLink', 'Kişisel Verilerin Korunması Kanunu')}
                    </a>{' '}
                    {t('secondOpinion.kvkkText1', 'uyarınca ilgili')}{' '}
                    <a href="#" className="text-primary font-medium underline">
                      {t('secondOpinion.kvkkInfo', 'Bilgilendirme')}
                    </a>
                    {t('secondOpinion.kvkkText2', "'yi okudum. Kişisel verilerimin belirtilen kapsamda işlenmesini ve sağlık hizmet sunumu amacıyla tarafımla iletişime geçilmesini kabul ediyorum.")}
                  </span>
                </label>

                {/* Captcha placeholder */}
                <label className="flex items-center gap-3 cursor-pointer p-4 bg-white rounded-xl border border-gray-200 w-fit">
                  <input
                    type="checkbox"
                    name="captcha"
                    checked={formData.captcha}
                    onChange={handleChange}
                    className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <span className="text-sm text-gray-600">{t('secondOpinion.captcha', 'Ben robot değilim')}</span>
                </label>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full flex items-center justify-center gap-3 px-8 py-4 bg-primary text-white font-bold rounded-xl hover:brightness-110 active:scale-[0.99] transition-all text-lg disabled:opacity-60"
                >
                  {submitting ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-white" />
                  ) : (
                    <FaPaperPlane />
                  )}
                  {submitting
                    ? t('secondOpinion.sending', 'Gönderiliyor...')
                    : t('secondOpinion.submit', '— Uzman Görüşü İste')}
                </button>
              </form>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default SecondOpinionSection;
