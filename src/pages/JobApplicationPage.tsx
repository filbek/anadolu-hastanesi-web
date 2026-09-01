// ============================================================
// İş Başvuru Formu — 5 adımlı wizard
//
// Eski PHP formunun (basvuru/index.html + script.js + gonder.php)
// site altyapısına uyarlanmış hâli. Farklar:
//   - Kayıt JSON dosyası yerine Supabase `job_applications` tablosuna
//   - Mail kendi SMTP sınıfı yerine `send-form-email` edge function'ına
//   - Adım 4 beceri blokları pozisyon grubuna göre koşullu gösterilir
//   - alert() yerine erişilebilir inline hata mesajları (WCAG 2.2 A)
// ============================================================

import { useState, useRef, useMemo, useId } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaChevronRight,
  FaCheckCircle,
  FaArrowLeft,
  FaArrowRight,
  FaPaperPlane,
  FaPlus,
  FaTimes,
  FaCloudUploadAlt,
  FaExclamationCircle,
} from 'react-icons/fa';
import { supabase } from '../lib/supabase';
import { sendFormEmail } from '../services/emailService';
import { useHospitals } from '../hooks/useHospitals';
import TurnstileWidget from '../components/common/TurnstileWidget';
import { verifyTurnstile, turnstileEnabled } from '../services/turnstileService';
import {
  POSITION_GROUPS,
  SKILL_BLOCKS,
  GROUP_SKILL_KEYS,
  SKILL_LEVELS,
  COMPUTER_SKILLS,
  COMPUTER_LEVELS,
  LANGUAGES,
  LANGUAGE_LEVELS,
  EDUCATION_LEVELS,
  type PositionGroup,
} from '../data/jobApplicationSkills';

const STEPS = [
  { n: 1, label: 'Kişisel' },
  { n: 2, label: 'Eğitim' },
  { n: 3, label: 'Deneyim' },
  { n: 4, label: 'Mesleki' },
  { n: 5, label: 'Referans' },
];

const TOTAL_STEPS = STEPS.length;

const todayISO = () => new Date().toISOString().split('T')[0];

interface ExperienceRow {
  company: string;
  department: string;
  period: string;
  reason: string;
}
interface CertificateRow {
  name: string;
  date: string;
  institution: string;
  duration: string;
}
interface ReferenceRow {
  name: string;
  company: string;
  phone: string;
  duration: string;
}

const emptyExperience = (): ExperienceRow => ({ company: '', department: '', period: '', reason: '' });
const emptyCertificate = (): CertificateRow => ({ name: '', date: '', institution: '', duration: '' });

const initialScalars = {
  position: '',
  position_group: '' as PositionGroup | '',
  hospital: '',
  full_name: '',
  national_id: '',
  gender: '',
  birth_place_date: '',
  marital_status: '',
  nationality: 'T.C.',
  address: '',
  mobile_phone: '',
  home_phone: '',
  alternative_phone: '',
  email: '',
  blood_type: '',
  drivers_license: '',
  military_status: '',
  military_deferral_date: '',
  smoker: '',
  relative_at_company: '',
  relative_name: '',
  interviewed_before: '',
  previous_position: '',
  spouse_occupation: '',
  health_issues: '',
  profession_notes: '',
  earliest_start_date: '',
  overtime: '',
  weekend_work: '',
  night_shift: '',
  public_holiday: '',
  travel: '',
  last_salary: '',
  expected_salary: '',
  signature: '',
  signature_date: todayISO(),
};

/** Her adımda doldurulması zorunlu alanlar ve kullanıcıya gösterilen adları */
const REQUIRED_BY_STEP: Record<number, { field: keyof typeof initialScalars; label: string }[]> = {
  1: [
    { field: 'position', label: 'Pozisyon' },
    { field: 'position_group', label: 'Pozisyon Grubu' },
    { field: 'full_name', label: 'Adınız Soyadınız' },
    { field: 'national_id', label: 'T.C. Kimlik No' },
    { field: 'mobile_phone', label: 'Cep Telefonu' },
    { field: 'email', label: 'E-posta' },
  ],
  2: [],
  3: [],
  4: [],
  5: [],
};

// ── Ortak alan bileşenleri ───────────────────────────────────

const inputClass =
  'w-full px-4 py-3 rounded-xl border bg-white text-gray-900 placeholder:text-gray-400 ' +
  'focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-transparent transition-shadow';

const Field = ({
  label,
  required,
  error,
  hint,
  children,
  className = '',
}: {
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
  children: (props: { id: string; 'aria-invalid': boolean; 'aria-describedby'?: string }) => React.ReactNode;
  className?: string;
}) => {
  const id = useId();
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;
  const describedBy = [error ? errorId : null, hint ? hintId : null].filter(Boolean).join(' ') || undefined;

  return (
    <div className={className}>
      <label htmlFor={id} className="block text-sm font-bold text-secondary mb-2">
        {label}
        {required && <span className="text-accent ml-1">*</span>}
      </label>
      {children({ id, 'aria-invalid': Boolean(error), 'aria-describedby': describedBy })}
      {hint && (
        <p id={hintId} className="text-xs text-gray-500 mt-1.5">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className="text-sm text-accent font-medium mt-1.5 flex items-center gap-1.5">
          <FaExclamationCircle className="shrink-0" aria-hidden="true" />
          {error}
        </p>
      )}
    </div>
  );
};

/** Yatay seçim düğmeleri — radio grubunun görsel karşılığı */
const RadioPills = ({
  legend,
  name,
  value,
  options,
  onChange,
  required,
}: {
  legend: string;
  name: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
  required?: boolean;
}) => (
  <fieldset>
    <legend className="block text-sm font-bold text-secondary mb-2">
      {legend}
      {required && <span className="text-accent ml-1">*</span>}
    </legend>
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const checked = value === opt.value;
        return (
          <label
            key={opt.value}
            className={`cursor-pointer px-4 py-2.5 rounded-xl border text-sm font-semibold transition-colors focus-within:ring-2 focus-within:ring-primary-light ${
              checked
                ? 'bg-primary text-white border-primary'
                : 'bg-white text-gray-600 border-gray-300 hover:border-primary-light'
            }`}
          >
            <input
              type="radio"
              name={name}
              value={opt.value}
              checked={checked}
              onChange={() => onChange(opt.value)}
              className="sr-only"
            />
            {opt.label}
          </label>
        );
      })}
    </div>
  </fieldset>
);

/** Beceri satırı — madde adı + 0..3 (veya 1..4) puanlama */
const ScoreRow = ({
  name,
  label,
  value,
  levels,
  onChange,
}: {
  name: string;
  label: string;
  value: string;
  levels: { value: string; label: string }[];
  onChange: (value: string) => void;
}) => (
  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 py-2.5 px-3 rounded-lg odd:bg-gray-50">
    <span id={`${name}-label`} className="text-sm text-gray-700 pr-4">
      {label}
    </span>
    <div className="flex gap-1.5 shrink-0" role="radiogroup" aria-labelledby={`${name}-label`}>
      {levels.map((lvl) => {
        const checked = value === lvl.value;
        return (
          <label
            key={lvl.value}
            title={lvl.label}
            className={`cursor-pointer w-9 h-9 grid place-items-center rounded-lg border text-sm font-bold transition-colors focus-within:ring-2 focus-within:ring-primary-light ${
              checked
                ? 'bg-primary text-white border-primary'
                : 'bg-white text-gray-500 border-gray-300 hover:border-primary-light'
            }`}
          >
            <input
              type="radio"
              name={name}
              value={lvl.value}
              checked={checked}
              onChange={() => onChange(lvl.value)}
              className="sr-only"
            />
            <span aria-hidden="true">{lvl.value}</span>
            <span className="sr-only">{lvl.label}</span>
          </label>
        );
      })}
    </div>
  </div>
);

const SectionCard = ({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) => (
  <div className="bg-white rounded-2xl border border-gray-200 p-5 md:p-7 mb-6">
    <h3 className="text-lg font-black text-secondary mb-1">{title}</h3>
    {description && <p className="text-sm text-gray-500 mb-5">{description}</p>}
    <div className={description ? '' : 'mt-5'}>{children}</div>
  </div>
);

const YES_NO = [
  { value: 'evet', label: 'Evet' },
  { value: 'hayir', label: 'Hayır' },
];

// ── Sayfa ────────────────────────────────────────────────────

const JobApplicationPage = () => {
  const { data: hospitals = [], isLoading: hospitalsLoading } = useHospitals();
  const panelRef = useRef<HTMLDivElement>(null);

  const [step, setStep] = useState(1);
  const [form, setForm] = useState(initialScalars);
  const [cities, setCities] = useState(['', '', '', '']);
  const [education, setEducation] = useState<Record<string, { school: string; graduation: string; degree: string }>>(
    () => Object.fromEntries(EDUCATION_LEVELS.map((l) => [l.key, { school: '', graduation: '', degree: '' }]))
  );
  const [experience, setExperience] = useState<ExperienceRow[]>([emptyExperience()]);
  const [certificates, setCertificates] = useState<CertificateRow[]>([emptyCertificate()]);
  const [references, setReferences] = useState<ReferenceRow[]>([
    { name: '', company: '', phone: '', duration: '' },
    { name: '', company: '', phone: '', duration: '' },
    { name: '', company: '', phone: '', duration: '' },
  ]);
  const [skills, setSkills] = useState<Record<string, string>>({});
  const [computerSkills, setComputerSkills] = useState<Record<string, string>>({});
  const [languages, setLanguages] = useState<Record<string, string>>({});

  /*
   * Dosyalar 1. adımda seçilir, gönderim son adımdadır. Adım değişince o
   * adımın JSX'i DOM'dan kalktığı için input ref'i null olur; bu yüzden
   * seçilen File nesnesi ref'ten değil state'ten okunur.
   */
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [consent, setConsent] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [referenceCode, setReferenceCode] = useState<string | null>(null);

  const setField = (field: keyof typeof initialScalars, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => (prev[field] ? { ...prev, [field]: '' } : prev));
  };

  /** Adım 4'te gösterilecek beceri blokları — pozisyon grubuna göre */
  const activeSkillBlocks = useMemo(() => {
    if (!form.position_group) return [];
    const keys = GROUP_SKILL_KEYS[form.position_group as PositionGroup] ?? [];
    return SKILL_BLOCKS.filter((b) => keys.includes(b.key));
  }, [form.position_group]);

  // ── Doğrulama ──────────────────────────────────────────────

  const validateStep = (target: number): boolean => {
    const next: Record<string, string> = {};

    for (const { field, label } of REQUIRED_BY_STEP[target] ?? []) {
      if (!String(form[field] ?? '').trim()) next[field] = `${label} alanı zorunludur.`;
    }

    if (target === 1) {
      if (form.national_id && form.national_id.length !== 11) {
        next.national_id = 'T.C. Kimlik No 11 haneli olmalıdır.';
      }
      if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
        next.email = 'Geçerli bir e-posta adresi giriniz.';
      }
      if (form.mobile_phone && form.mobile_phone.replace(/\D/g, '').length < 10) {
        next.mobile_phone = 'Geçerli bir cep telefonu numarası giriniz.';
      }
      // Vesikalık zorunlu; CV isteğe bağlı kalır.
      if (!photoFile) {
        next.photo = 'Fotoğraf yüklemeniz zorunludur.';
      }
    }

    setErrors(next);
    if (Object.keys(next).length > 0) {
      setFormError('Lütfen işaretlenen alanları kontrol edin.');
      // Hatalı ilk alana odaklan — klavye kullanıcıları için gerekli
      requestAnimationFrame(() => {
        panelRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
      });
      return false;
    }
    setFormError('');
    return true;
  };

  const goTo = (target: number) => {
    if (target < 1 || target > TOTAL_STEPS) return;
    // İleri giderken mevcut adım doğrulanır; geri dönüş serbesttir
    if (target > step && !validateStep(step)) return;
    setStep(target);
    setFormError('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ── Dosya yükleme ──────────────────────────────────────────

  const MAX_FILE_MB = 10;

  const handleFilePick =
    (setFile: (v: File | null) => void, key: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return setFile(null);
      if (file.size > MAX_FILE_MB * 1024 * 1024) {
        setErrors((prev) => ({ ...prev, [key]: `Dosya boyutu ${MAX_FILE_MB}MB sınırını aşıyor.` }));
        e.target.value = '';
        setFile(null);
        return;
      }
      setErrors((prev) => ({ ...prev, [key]: '' }));
      setFile(file);
    };

  /*
   * Bucket gizlidir (bkz. hr_role_job_applications_migration.sql): CV ve
   * vesikalık, URL'i bilen herkese açık olamaz. Bu yüzden public URL yerine
   * DOSYA YOLU saklanır; panelde İK, imzalı URL ile açar.
   * Eski kayıtlarda tam URL bulunabilir, panel iki biçimi de çözer.
   */
  const uploadFile = async (file: File, folder: string): Promise<string> => {
    const parts = file.name.split('.');
    const ext = parts.length > 1 ? parts.pop()!.toLowerCase().replace(/[^a-z0-9]/g, '') : '';
    const path = `${folder}/${crypto.randomUUID()}${ext ? `.${ext}` : ''}`;
    const { error } = await supabase.storage
      .from('job-applications')
      .upload(path, file, { contentType: file.type || 'application/octet-stream' });
    if (error) {
      console.error('Dosya yüklenemedi:', error);
      // Sessizce null dönülürse başvuru belgesiz kaydediliyor ve aday bunu
      // hiç öğrenmiyordu; hata gönderimi durdurur.
      throw new Error(`${file.name} yüklenemedi. Lütfen tekrar deneyin.`);
    }
    return path;
  };

  // ── Gönderim ───────────────────────────────────────────────

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Son adıma kadar atlanmış zorunlu alan kalmasın
    for (let s = 1; s <= TOTAL_STEPS; s++) {
      if ((REQUIRED_BY_STEP[s] ?? []).length === 0) continue;
      if (!validateStep(s)) {
        setStep(s);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
    }

    if (!consent) {
      setFormError('Devam edebilmek için KVKK aydınlatma metnini onaylamanız gerekir.');
      return;
    }
    if (turnstileEnabled ? !captchaToken : false) {
      setFormError('Lütfen güvenlik doğrulamasını tamamlayın.');
      return;
    }

    setSubmitting(true);
    setFormError('');

    try {
      if (turnstileEnabled) {
        const ok = await verifyTurnstile(captchaToken);
        if (!ok) {
          setCaptchaToken(null);
          setFormError('Güvenlik doğrulaması başarısız oldu. Lütfen tekrar deneyin.');
          return;
        }
      }

      const photoUrl = photoFile ? await uploadFile(photoFile, 'photos') : null;
      const cvUrl = cvFile ? await uploadFile(cvFile, 'cv') : null;

      const code = `BAV-${Date.now().toString(36).toUpperCase()}`;

      // Boş satırlar kaydedilmesin
      const filledExperience = experience.filter((x) => x.company.trim() || x.department.trim());
      const filledCertificates = certificates.filter((c) => c.name.trim());
      const filledReferences = references.filter((r) => r.name.trim());
      const filledEducation = EDUCATION_LEVELS.filter((l) => education[l.key].school.trim()).map((l) => ({
        level: l.label,
        ...education[l.key],
      }));

      const record = {
        reference_code: code,
        position: form.position,
        position_group: form.position_group,
        hospital: form.hospital || null,
        full_name: form.full_name,
        national_id: form.national_id,
        gender: form.gender || null,
        birth_place_date: form.birth_place_date || null,
        marital_status: form.marital_status || null,
        nationality: form.nationality || null,
        address: form.address || null,
        mobile_phone: form.mobile_phone,
        home_phone: form.home_phone || null,
        alternative_phone: form.alternative_phone || null,
        email: form.email,
        blood_type: form.blood_type || null,
        drivers_license: form.drivers_license || null,
        military_status: form.military_status || null,
        military_deferral_date: form.military_deferral_date || null,
        smoker: form.smoker || null,
        relative_at_company: form.relative_at_company || null,
        relative_name: form.relative_name || null,
        interviewed_before: form.interviewed_before || null,
        previous_position: form.previous_position || null,
        spouse_occupation: form.spouse_occupation || null,
        health_issues: form.health_issues || null,
        preferred_cities: cities.filter((c) => c.trim()),
        photo_url: photoUrl,
        cv_url: cvUrl,
        education: filledEducation,
        experience: filledExperience,
        skills,
        computer_skills: computerSkills,
        languages,
        certificates: filledCertificates,
        references_list: filledReferences,
        profession_notes: form.profession_notes || null,
        earliest_start_date: form.earliest_start_date || null,
        overtime: form.overtime || null,
        weekend_work: form.weekend_work || null,
        night_shift: form.night_shift || null,
        public_holiday: form.public_holiday || null,
        travel: form.travel || null,
        last_salary: form.last_salary || null,
        expected_salary: form.expected_salary || null,
        signature: form.signature || null,
        signature_date: form.signature_date || null,
        consent,
      };

      const { error: insertError } = await supabase.from('job_applications').insert([record]);
      if (insertError) throw insertError;

      // E-posta bildirimi başarısız olsa da başvuru kaydedilmiş olur;
      // kullanıcı akışı bozulmaz (bkz. emailService).
      await sendFormEmail('job_application', {
        reference_code: code,
        position: form.position,
        position_group:
          POSITION_GROUPS.find((g) => g.value === form.position_group)?.label ?? form.position_group,
        hospital: form.hospital,
        name: form.full_name,
        national_id: form.national_id,
        email: form.email,
        phone: form.mobile_phone,
        birth_place_date: form.birth_place_date,
        address: form.address,
        education: filledEducation,
        experience: filledExperience,
        skills,
        profession_notes: form.profession_notes,
        computer_skills: computerSkills,
        languages,
        certificates: filledCertificates,
        references_list: filledReferences,
        expected_salary: form.expected_salary,
        earliest_start_date: form.earliest_start_date,
        // Belgelerin kendisi e-postaya konmaz; bucket gizli ve bağlantı
        // iletilirse KVKK kapsamındaki dosya e-posta zincirinde dolaşır.
        // Bunun yerine panele yönlendirilir, orada imzalı URL ile açılır.
        has_attachments: Boolean(photoUrl || cvUrl),
        admin_url: `${window.location.origin}/admin/job-applications`,
      });

      setReferenceCode(code);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      console.error('İş başvurusu gönderilemedi:', err);
      setFormError(
        'Başvurunuz gönderilirken bir hata oluştu. Lütfen tekrar deneyin. ' + (err?.message ?? '')
      );
    } finally {
      setSubmitting(false);
    }
  };

  // ── Başarı ekranı ──────────────────────────────────────────

  if (referenceCode) {
    return (
      <div className="animate-fadeIn">
        <Helmet>
          <title>Başvurunuz Alındı | Anadolu Hastaneleri Grubu</title>
          <meta name="robots" content="noindex" />
        </Helmet>
        <section className="pt-32 pb-24 bg-gray-50 min-h-[70vh] flex items-center">
          <div className="container-custom max-w-2xl text-center">
            <motion.div
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 200 }}
              className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 text-green-700 text-4xl mx-auto mb-6"
            >
              <FaCheckCircle aria-hidden="true" />
            </motion.div>
            <h1 className="text-3xl md:text-4xl font-black text-secondary mb-4">Başvurunuz Alındı</h1>
            <p className="text-gray-600 text-lg mb-6">
              Başvurunuz değerlendirilmek üzere İnsan Kaynakları birimimize iletilmiştir.
              Uygun görülmesi hâlinde sizinle iletişime geçilecektir.
            </p>
            <div className="inline-block bg-white border border-gray-200 rounded-2xl px-8 py-5 mb-8">
              <span className="block text-xs uppercase tracking-widest text-gray-500 mb-1">
                Başvuru Numaranız
              </span>
              <strong className="text-2xl font-black text-primary tracking-wide">{referenceCode}</strong>
            </div>
            <div className="flex flex-wrap gap-3 justify-center">
              <Link
                to="/kariyer"
                className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-white font-bold rounded-xl hover:brightness-125 transition-all"
              >
                Kariyer Sayfasına Dön
                <FaArrowRight aria-hidden="true" />
              </Link>
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="inline-flex items-center gap-2 px-8 py-4 bg-white text-secondary font-bold rounded-xl border border-gray-300 hover:border-primary transition-all"
              >
                Yeni Başvuru Yap
              </button>
            </div>
          </div>
        </section>
      </div>
    );
  }

  // ── Form ───────────────────────────────────────────────────

  return (
    <div className="animate-fadeIn">
      <Helmet>
        <title>İş Başvuru Formu | Anadolu Hastaneleri Grubu</title>
        <meta
          name="description"
          content="Anadolu Hastaneleri Grubu iş başvuru formu. Kişisel, eğitim, deneyim ve mesleki bilgilerinizi ileterek açık pozisyonlarımıza başvurun."
        />
        <meta name="robots" content="noindex" />
      </Helmet>

      {/* ─── BAŞLIK ─── */}
      <section className="pt-32 pb-12 bg-primary text-white">
        <div className="container-custom">
          <nav aria-label="Site haritası" className="flex items-center gap-2 text-sm text-white/70 mb-6">
            <Link to="/" className="hover:text-white transition-colors">
              Ana Sayfa
            </Link>
            <FaChevronRight className="text-[10px]" aria-hidden="true" />
            <Link to="/kariyer" className="hover:text-white transition-colors">
              Kariyer
            </Link>
            <FaChevronRight className="text-[10px]" aria-hidden="true" />
            <span className="text-white font-medium">İş Başvuru Formu</span>
          </nav>
          <h1 className="text-3xl md:text-5xl font-bold leading-tight mb-3">İş Başvuru Formu</h1>
          <p className="text-white/70 max-w-2xl">
            Formu eksiksiz doldurmanız başvurunuzun doğru değerlendirilmesi için önemlidir.
            Zorunlu alanlar <span className="text-amber-300 font-semibold">*</span> ile işaretlenmiştir.
          </p>
          <p className="text-white/40 text-xs mt-4">
            Doküman No: SC.FR.49 · Yayım: 02.06.2007 · Rev: 06 · Rev. Tarihi: 01.06.2022
          </p>
        </div>
      </section>

      <section className="bg-gray-50 py-10 lg:py-14">
        <div className="container-custom max-w-4xl">
          {/* ─── İLERLEME ─── */}
          <div className="mb-8">
            <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden mb-5">
              <motion.div
                className="h-full bg-accent"
                animate={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
                transition={{ duration: 0.35 }}
              />
            </div>
            <ol className="flex justify-between gap-1">
              {STEPS.map((s) => {
                const state = s.n === step ? 'current' : s.n < step ? 'done' : 'todo';
                return (
                  <li key={s.n} className="flex-1">
                    <button
                      type="button"
                      onClick={() => goTo(s.n)}
                      aria-current={state === 'current' ? 'step' : undefined}
                      className="w-full flex flex-col items-center gap-1.5 group"
                    >
                      <span
                        className={`w-9 h-9 grid place-items-center rounded-full text-sm font-bold border-2 transition-colors ${
                          state === 'current'
                            ? 'bg-accent text-white border-accent'
                            : state === 'done'
                            ? 'bg-primary text-white border-primary'
                            : 'bg-white text-gray-400 border-gray-300 group-hover:border-primary-light'
                        }`}
                      >
                        {state === 'done' ? <FaCheckCircle aria-hidden="true" /> : s.n}
                      </span>
                      <span
                        className={`text-[11px] md:text-xs font-semibold ${
                          state === 'todo' ? 'text-gray-400' : 'text-secondary'
                        }`}
                      >
                        {s.label}
                      </span>
                      <span className="sr-only">
                        {`Adım ${s.n} / ${TOTAL_STEPS}${state === 'done' ? ' — tamamlandı' : ''}`}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ol>
          </div>

          <form onSubmit={handleSubmit} noValidate>
            {/* Hata özeti — ekran okuyucuya duyurulur */}
            <div aria-live="polite">
              {formError && (
                <div
                  role="alert"
                  className="mb-6 flex items-start gap-3 p-4 rounded-xl bg-accent-50 border border-accent-200 text-accent-800"
                >
                  <FaExclamationCircle className="mt-0.5 shrink-0" aria-hidden="true" />
                  <p className="text-sm font-medium">{formError}</p>
                </div>
              )}
            </div>

            <div ref={panelRef}>
              <AnimatePresence mode="wait">
                <motion.div
                  key={step}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.25 }}
                >
                  {/* ═══ ADIM 1: KİŞİSEL ═══ */}
                  {step === 1 && (
                    <>
                      <SectionCard
                        title="Başvurulan Pozisyon"
                        description="Seçtiğiniz pozisyon grubu, 4. adımda size sorulacak mesleki soruları belirler."
                      >
                        <div className="grid md:grid-cols-2 gap-5">
                          <Field label="Pozisyon" required error={errors.position} className="md:col-span-2">
                            {(p) => (
                              <input
                                {...p}
                                type="text"
                                className={`${inputClass} ${errors.position ? 'border-accent' : 'border-gray-300'}`}
                                value={form.position}
                                onChange={(e) => setField('position', e.target.value)}
                                placeholder="Başvurmak istediğiniz pozisyon"
                              />
                            )}
                          </Field>
                          <Field
                            label="Pozisyon Grubu"
                            required
                            error={errors.position_group}
                            hint="Mesleki soruların size uygun olanları gösterilir."
                          >
                            {(p) => (
                              <select
                                {...p}
                                className={`${inputClass} ${errors.position_group ? 'border-accent' : 'border-gray-300'}`}
                                value={form.position_group}
                                onChange={(e) => setField('position_group', e.target.value)}
                              >
                                <option value="">Seçiniz...</option>
                                {POSITION_GROUPS.map((g) => (
                                  <option key={g.value} value={g.value}>
                                    {g.label}
                                  </option>
                                ))}
                              </select>
                            )}
                          </Field>
                          <Field label="Tercih Ettiğiniz Hastane">
                            {(p) => (
                              <select
                                {...p}
                                className={`${inputClass} border-gray-300`}
                                value={form.hospital}
                                onChange={(e) => setField('hospital', e.target.value)}
                                disabled={hospitalsLoading}
                              >
                                <option value="">
                                  {hospitalsLoading ? 'Yükleniyor...' : 'Fark etmez'}
                                </option>
                                {hospitals.map((h) => (
                                  <option key={h.id} value={h.name}>
                                    {h.name}
                                  </option>
                                ))}
                              </select>
                            )}
                          </Field>
                        </div>
                      </SectionCard>

                      <SectionCard title="Kimlik Bilgileri">
                        <div className="grid md:grid-cols-2 gap-5">
                          <Field label="Adınız Soyadınız" required error={errors.full_name}>
                            {(p) => (
                              <input
                                {...p}
                                type="text"
                                autoComplete="name"
                                className={`${inputClass} ${errors.full_name ? 'border-accent' : 'border-gray-300'}`}
                                value={form.full_name}
                                onChange={(e) => setField('full_name', e.target.value)}
                              />
                            )}
                          </Field>
                          <Field label="T.C. Kimlik No" required error={errors.national_id}>
                            {(p) => (
                              <input
                                {...p}
                                type="text"
                                inputMode="numeric"
                                maxLength={11}
                                className={`${inputClass} ${errors.national_id ? 'border-accent' : 'border-gray-300'}`}
                                value={form.national_id}
                                onChange={(e) =>
                                  setField('national_id', e.target.value.replace(/\D/g, '').slice(0, 11))
                                }
                                placeholder="11 haneli"
                              />
                            )}
                          </Field>
                          <Field label="Doğum Yeri ve Tarihi">
                            {(p) => (
                              <input
                                {...p}
                                type="text"
                                className={`${inputClass} border-gray-300`}
                                value={form.birth_place_date}
                                onChange={(e) => setField('birth_place_date', e.target.value)}
                                placeholder="İstanbul, 01.01.1990"
                              />
                            )}
                          </Field>
                          <Field label="Uyruk">
                            {(p) => (
                              <input
                                {...p}
                                type="text"
                                className={`${inputClass} border-gray-300`}
                                value={form.nationality}
                                onChange={(e) => setField('nationality', e.target.value)}
                              />
                            )}
                          </Field>
                          <Field label="Medeni Hâl">
                            {(p) => (
                              <select
                                {...p}
                                className={`${inputClass} border-gray-300`}
                                value={form.marital_status}
                                onChange={(e) => setField('marital_status', e.target.value)}
                              >
                                <option value="">Seçiniz</option>
                                <option value="bekar">Bekâr</option>
                                <option value="evli">Evli</option>
                                <option value="bosanmis">Boşanmış</option>
                                <option value="dul">Dul</option>
                              </select>
                            )}
                          </Field>
                          <Field label="Kan Grubu">
                            {(p) => (
                              <select
                                {...p}
                                className={`${inputClass} border-gray-300`}
                                value={form.blood_type}
                                onChange={(e) => setField('blood_type', e.target.value)}
                              >
                                <option value="">Seçiniz</option>
                                {['A Rh+', 'A Rh-', 'B Rh+', 'B Rh-', 'AB Rh+', 'AB Rh-', '0 Rh+', '0 Rh-'].map(
                                  (b) => (
                                    <option key={b} value={b}>
                                      {b}
                                    </option>
                                  )
                                )}
                              </select>
                            )}
                          </Field>
                          <div className="md:col-span-2">
                            <RadioPills
                              legend="Cinsiyet"
                              name="gender"
                              value={form.gender}
                              onChange={(v) => setField('gender', v)}
                              options={[
                                { value: 'kadin', label: 'Kadın' },
                                { value: 'erkek', label: 'Erkek' },
                              ]}
                            />
                          </div>
                        </div>
                      </SectionCard>

                      <SectionCard title="İletişim Bilgileri">
                        <div className="grid md:grid-cols-2 gap-5">
                          <Field label="Cep Telefonu" required error={errors.mobile_phone}>
                            {(p) => (
                              <input
                                {...p}
                                type="tel"
                                autoComplete="tel"
                                className={`${inputClass} ${errors.mobile_phone ? 'border-accent' : 'border-gray-300'}`}
                                value={form.mobile_phone}
                                onChange={(e) => setField('mobile_phone', e.target.value)}
                                placeholder="05XX XXX XX XX"
                              />
                            )}
                          </Field>
                          <Field label="E-posta" required error={errors.email}>
                            {(p) => (
                              <input
                                {...p}
                                type="email"
                                autoComplete="email"
                                className={`${inputClass} ${errors.email ? 'border-accent' : 'border-gray-300'}`}
                                value={form.email}
                                onChange={(e) => setField('email', e.target.value)}
                                placeholder="ornek@eposta.com"
                              />
                            )}
                          </Field>
                          <Field label="Ev Telefonu">
                            {(p) => (
                              <input
                                {...p}
                                type="tel"
                                className={`${inputClass} border-gray-300`}
                                value={form.home_phone}
                                onChange={(e) => setField('home_phone', e.target.value)}
                              />
                            )}
                          </Field>
                          <Field label="Ulaşılamadığında Aranacak Numara">
                            {(p) => (
                              <input
                                {...p}
                                type="tel"
                                className={`${inputClass} border-gray-300`}
                                value={form.alternative_phone}
                                onChange={(e) => setField('alternative_phone', e.target.value)}
                              />
                            )}
                          </Field>
                          <Field label="Adresiniz" className="md:col-span-2">
                            {(p) => (
                              <textarea
                                {...p}
                                rows={2}
                                className={`${inputClass} border-gray-300`}
                                value={form.address}
                                onChange={(e) => setField('address', e.target.value)}
                              />
                            )}
                          </Field>
                        </div>
                      </SectionCard>

                      <SectionCard title="Diğer Bilgiler">
                        <div className="grid md:grid-cols-2 gap-5">
                          <div>
                            <RadioPills
                              legend="Askerlik Durumu"
                              name="military_status"
                              value={form.military_status}
                              onChange={(v) => setField('military_status', v)}
                              options={[
                                { value: 'yapildi', label: 'Yapıldı' },
                                { value: 'tecilli', label: 'Tecilli' },
                                { value: 'muaf', label: 'Muaf' },
                              ]}
                            />
                          </div>
                          <Field label="Tecil Tarihi">
                            {(p) => (
                              <input
                                {...p}
                                type="date"
                                className={`${inputClass} border-gray-300`}
                                value={form.military_deferral_date}
                                onChange={(e) => setField('military_deferral_date', e.target.value)}
                              />
                            )}
                          </Field>
                          <Field label="Ehliyet">
                            {(p) => (
                              <input
                                {...p}
                                type="text"
                                className={`${inputClass} border-gray-300`}
                                value={form.drivers_license}
                                onChange={(e) => setField('drivers_license', e.target.value)}
                                placeholder="Örn. B sınıfı"
                              />
                            )}
                          </Field>
                          <Field label="Eşinizin Mesleği">
                            {(p) => (
                              <input
                                {...p}
                                type="text"
                                className={`${inputClass} border-gray-300`}
                                value={form.spouse_occupation}
                                onChange={(e) => setField('spouse_occupation', e.target.value)}
                                placeholder="Evli iseniz"
                              />
                            )}
                          </Field>
                          <div>
                            <RadioPills
                              legend="Sigara Kullanıyor musunuz?"
                              name="smoker"
                              value={form.smoker}
                              onChange={(v) => setField('smoker', v)}
                              options={YES_NO}
                            />
                          </div>
                          <div>
                            <RadioPills
                              legend="Kurumumuzda Çalışan Yakınınız Var mı?"
                              name="relative_at_company"
                              value={form.relative_at_company}
                              onChange={(v) => setField('relative_at_company', v)}
                              options={YES_NO}
                            />
                          </div>
                          {form.relative_at_company === 'evet' && (
                            <Field label="Yakınınızın Adı Soyadı / Bölümü" className="md:col-span-2">
                              {(p) => (
                                <input
                                  {...p}
                                  type="text"
                                  className={`${inputClass} border-gray-300`}
                                  value={form.relative_name}
                                  onChange={(e) => setField('relative_name', e.target.value)}
                                />
                              )}
                            </Field>
                          )}
                          <div>
                            <RadioPills
                              legend="Daha Önce Kurumumuzla Görüşme Yaptınız mı?"
                              name="interviewed_before"
                              value={form.interviewed_before}
                              onChange={(v) => setField('interviewed_before', v)}
                              options={YES_NO}
                            />
                          </div>
                          {form.interviewed_before === 'evet' && (
                            <Field label="Görüştüğünüz Pozisyon / Tarih">
                              {(p) => (
                                <input
                                  {...p}
                                  type="text"
                                  className={`${inputClass} border-gray-300`}
                                  value={form.previous_position}
                                  onChange={(e) => setField('previous_position', e.target.value)}
                                />
                              )}
                            </Field>
                          )}
                          <Field
                            label="Sağlık Problemi"
                            hint="Çalışmanıza engel olabilecek bir durum varsa belirtiniz."
                            className="md:col-span-2"
                          >
                            {(p) => (
                              <textarea
                                {...p}
                                rows={2}
                                className={`${inputClass} border-gray-300`}
                                value={form.health_issues}
                                onChange={(e) => setField('health_issues', e.target.value)}
                              />
                            )}
                          </Field>
                        </div>

                        <fieldset className="mt-6">
                          <legend className="block text-sm font-bold text-secondary mb-2">
                            Çalışmak İstediğiniz Şehirler (öncelik sırasıyla)
                          </legend>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {cities.map((c, i) => (
                              <input
                                key={i}
                                type="text"
                                aria-label={`${i + 1}. tercih şehir`}
                                className={`${inputClass} border-gray-300`}
                                value={c}
                                onChange={(e) =>
                                  setCities((prev) => prev.map((v, j) => (j === i ? e.target.value : v)))
                                }
                                placeholder={`${i + 1}. tercih`}
                              />
                            ))}
                          </div>
                        </fieldset>
                      </SectionCard>

                      <SectionCard
                        title="Belgeler"
                        description="Fotoğrafınızı yüklemeniz zorunludur; özgeçmiş isteğe bağlıdır (en fazla 10 MB)."
                      >
                        <div className="grid md:grid-cols-2 gap-5">
                          <div>
                            <span className="block text-sm font-bold text-secondary mb-2">
                              Fotoğraf
                              <span className="text-accent ml-1">*</span>
                            </span>
                            <label
                              className={`flex items-center gap-3 px-4 py-3 rounded-xl border border-dashed bg-gray-50 cursor-pointer hover:border-primary-light transition-colors focus-within:ring-2 focus-within:ring-primary-light ${
                                errors.photo ? 'border-accent' : 'border-gray-300'
                              }`}
                            >
                              <FaCloudUploadAlt className="text-xl text-primary" aria-hidden="true" />
                              <span className="text-sm text-gray-600 truncate">
                                {photoFile?.name || 'Dosya seçin (JPG, PNG)'}
                              </span>
                              <input
                                type="file"
                                accept="image/*"
                                className="sr-only"
                                aria-invalid={Boolean(errors.photo)}
                                aria-describedby={errors.photo ? 'photo-error' : undefined}
                                onChange={handleFilePick(setPhotoFile, 'photo')}
                              />
                            </label>
                            {errors.photo && (
                              <p id="photo-error" role="alert" className="text-sm text-accent font-medium mt-1.5">
                                {errors.photo}
                              </p>
                            )}
                          </div>
                          <div>
                            <span className="block text-sm font-bold text-secondary mb-2">Özgeçmiş (CV)</span>
                            <label className="flex items-center gap-3 px-4 py-3 rounded-xl border border-dashed border-gray-300 bg-gray-50 cursor-pointer hover:border-primary-light transition-colors focus-within:ring-2 focus-within:ring-primary-light">
                              <FaCloudUploadAlt className="text-xl text-primary" aria-hidden="true" />
                              <span className="text-sm text-gray-600 truncate">
                                {cvFile?.name || 'Dosya seçin (PDF, DOC)'}
                              </span>
                              <input
                                type="file"
                                accept=".pdf,.doc,.docx"
                                className="sr-only"
                                onChange={handleFilePick(setCvFile, 'cv')}
                              />
                            </label>
                            {errors.cv && (
                              <p role="alert" className="text-sm text-accent font-medium mt-1.5">
                                {errors.cv}
                              </p>
                            )}
                          </div>
                        </div>
                      </SectionCard>
                    </>
                  )}

                  {/* ═══ ADIM 2: EĞİTİM ═══ */}
                  {step === 2 && (
                    <SectionCard
                      title="Eğitim Durumu"
                      description="Yalnızca tamamladığınız kademeleri doldurmanız yeterlidir."
                    >
                      <div className="space-y-6">
                        {EDUCATION_LEVELS.map((lvl) => (
                          <fieldset key={lvl.key} className="border border-gray-200 rounded-xl p-4 md:p-5">
                            <legend className="px-2 text-sm font-black text-primary">{lvl.label}</legend>
                            <div className="grid md:grid-cols-3 gap-4">
                              <Field label="Okul / Bölüm" className="md:col-span-1">
                                {(p) => (
                                  <input
                                    {...p}
                                    type="text"
                                    className={`${inputClass} border-gray-300`}
                                    value={education[lvl.key].school}
                                    onChange={(e) =>
                                      setEducation((prev) => ({
                                        ...prev,
                                        [lvl.key]: { ...prev[lvl.key], school: e.target.value },
                                      }))
                                    }
                                  />
                                )}
                              </Field>
                              <Field label="Mezuniyet Yılı">
                                {(p) => (
                                  <input
                                    {...p}
                                    type="text"
                                    inputMode="numeric"
                                    className={`${inputClass} border-gray-300`}
                                    value={education[lvl.key].graduation}
                                    onChange={(e) =>
                                      setEducation((prev) => ({
                                        ...prev,
                                        [lvl.key]: { ...prev[lvl.key], graduation: e.target.value },
                                      }))
                                    }
                                    placeholder="Örn. 2018"
                                  />
                                )}
                              </Field>
                              <Field label="Derece / Not Ortalaması">
                                {(p) => (
                                  <input
                                    {...p}
                                    type="text"
                                    className={`${inputClass} border-gray-300`}
                                    value={education[lvl.key].degree}
                                    onChange={(e) =>
                                      setEducation((prev) => ({
                                        ...prev,
                                        [lvl.key]: { ...prev[lvl.key], degree: e.target.value },
                                      }))
                                    }
                                  />
                                )}
                              </Field>
                            </div>
                          </fieldset>
                        ))}
                      </div>
                    </SectionCard>
                  )}

                  {/* ═══ ADIM 3: DENEYİM ═══ */}
                  {step === 3 && (
                    <SectionCard
                      title="İş Deneyimi"
                      description="En güncel deneyiminizden başlayarak yazınız."
                    >
                      <div className="space-y-5">
                        {experience.map((row, i) => (
                          <fieldset key={i} className="border border-gray-200 rounded-xl p-4 md:p-5">
                            <legend className="px-2 text-sm font-black text-primary flex items-center gap-3">
                              {i + 1}. Deneyim
                            </legend>
                            <div className="flex justify-end -mt-2 mb-2">
                              {experience.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => setExperience((prev) => prev.filter((_, j) => j !== i))}
                                  className="text-sm text-accent font-semibold hover:underline inline-flex items-center gap-1.5"
                                >
                                  <FaTimes aria-hidden="true" />
                                  Kaldır
                                  <span className="sr-only">{`— ${i + 1}. deneyim`}</span>
                                </button>
                              )}
                            </div>
                            <div className="grid md:grid-cols-2 gap-4">
                              {(
                                [
                                  ['company', 'Şirket Adı', ''],
                                  ['department', 'Bölüm / Ünvan', ''],
                                  ['period', 'Tarih Aralığı', '2020 - 2024'],
                                  ['reason', 'Ayrılma Sebebi', ''],
                                ] as const
                              ).map(([key, label, placeholder]) => (
                                <Field key={key} label={label}>
                                  {(p) => (
                                    <input
                                      {...p}
                                      type="text"
                                      className={`${inputClass} border-gray-300`}
                                      value={row[key]}
                                      placeholder={placeholder}
                                      onChange={(e) =>
                                        setExperience((prev) =>
                                          prev.map((r, j) => (j === i ? { ...r, [key]: e.target.value } : r))
                                        )
                                      }
                                    />
                                  )}
                                </Field>
                              ))}
                            </div>
                          </fieldset>
                        ))}
                      </div>
                      <button
                        type="button"
                        onClick={() => setExperience((prev) => [...prev, emptyExperience()])}
                        className="mt-5 inline-flex items-center gap-2 px-5 py-3 rounded-xl border-2 border-dashed border-gray-300 text-secondary font-semibold hover:border-primary hover:text-primary transition-colors"
                      >
                        <FaPlus aria-hidden="true" />
                        Yeni Deneyim Ekle
                      </button>
                    </SectionCard>
                  )}

                  {/* ═══ ADIM 4: MESLEKİ ═══ */}
                  {step === 4 && (
                    <>
                      {activeSkillBlocks.length > 0 ? (
                        <>
                          <div className="bg-primary-50 border border-primary-200 rounded-2xl p-5 mb-6">
                            <h3 className="text-sm font-black text-primary mb-3">Puanlama Anahtarı</h3>
                            <dl className="grid sm:grid-cols-2 gap-x-6 gap-y-1.5 text-sm text-gray-700">
                              {SKILL_LEVELS.map((l) => (
                                <div key={l.value} className="flex gap-2">
                                  <dt className="font-bold text-primary shrink-0">{l.value}</dt>
                                  <dd>{l.label}</dd>
                                </div>
                              ))}
                            </dl>
                          </div>

                          {activeSkillBlocks.map((block) => (
                            <SectionCard key={block.key} title={block.section ?? block.title}>
                              <div className="divide-y divide-gray-100">
                                {block.items.map((item, idx) => {
                                  const name = `${block.key}_${idx}`;
                                  return (
                                    <ScoreRow
                                      key={name}
                                      name={name}
                                      label={item}
                                      value={skills[name] ?? ''}
                                      levels={SKILL_LEVELS}
                                      onChange={(v) => setSkills((prev) => ({ ...prev, [name]: v }))}
                                    />
                                  );
                                })}
                              </div>
                            </SectionCard>
                          ))}
                        </>
                      ) : (
                        <SectionCard
                          title="Mesleki Bilgiler"
                          description={
                            form.position_group
                              ? 'Seçtiğiniz pozisyon grubu için cihaz ve uygulama puanlaması istenmemektedir.'
                              : '1. adımda bir pozisyon grubu seçtiğinizde size uygun mesleki sorular burada görünecektir.'
                          }
                        >
                          <div />
                        </SectionCard>
                      )}

                      <SectionCard
                        title="Mesleki Yetkinlik Notu"
                        description="Uzmanlık alanınız, kullandığınız sistem/cihazlar ve öne çıkarmak istediğiniz deneyimleriniz."
                      >
                        <Field label="Açıklama">
                          {(p) => (
                            <textarea
                              {...p}
                              rows={5}
                              className={`${inputClass} border-gray-300`}
                              value={form.profession_notes}
                              onChange={(e) => setField('profession_notes', e.target.value)}
                            />
                          )}
                        </Field>
                      </SectionCard>
                    </>
                  )}

                  {/* ═══ ADIM 5: REFERANS VE DİĞER ═══ */}
                  {step === 5 && (
                    <>
                      <SectionCard title="Bilgisayar Bilgisi" description="1 = Başlangıç · 4 = Çok İyi">
                        <div className="divide-y divide-gray-100">
                          {COMPUTER_SKILLS.map((item) => (
                            <ScoreRow
                              key={item}
                              name={`bilgisayar_${item}`}
                              label={item}
                              value={computerSkills[item] ?? ''}
                              levels={COMPUTER_LEVELS}
                              onChange={(v) => setComputerSkills((prev) => ({ ...prev, [item]: v }))}
                            />
                          ))}
                        </div>
                      </SectionCard>

                      <SectionCard title="Yabancı Dil Bilgisi" description="1 = Başlangıç · 4 = Çok İyi">
                        <div className="divide-y divide-gray-100">
                          {LANGUAGES.map((item) => (
                            <ScoreRow
                              key={item}
                              name={`dil_${item}`}
                              label={item}
                              value={languages[item] ?? ''}
                              levels={LANGUAGE_LEVELS}
                              onChange={(v) => setLanguages((prev) => ({ ...prev, [item]: v }))}
                            />
                          ))}
                        </div>
                      </SectionCard>

                      <SectionCard title="Kurs / Sertifika / Seminer">
                        <div className="space-y-5">
                          {certificates.map((row, i) => (
                            <fieldset key={i} className="border border-gray-200 rounded-xl p-4 md:p-5">
                              <legend className="px-2 text-sm font-black text-primary">{i + 1}. Sertifika</legend>
                              <div className="flex justify-end -mt-2 mb-2">
                                {certificates.length > 1 && (
                                  <button
                                    type="button"
                                    onClick={() => setCertificates((prev) => prev.filter((_, j) => j !== i))}
                                    className="text-sm text-accent font-semibold hover:underline inline-flex items-center gap-1.5"
                                  >
                                    <FaTimes aria-hidden="true" />
                                    Kaldır
                                    <span className="sr-only">{`— ${i + 1}. sertifika`}</span>
                                  </button>
                                )}
                              </div>
                              <div className="grid md:grid-cols-2 gap-4">
                                {(
                                  [
                                    ['name', 'Sertifika Adı'],
                                    ['date', 'Tarih'],
                                    ['institution', 'Veren Kurum'],
                                    ['duration', 'Süre (Gün)'],
                                  ] as const
                                ).map(([key, label]) => (
                                  <Field key={key} label={label}>
                                    {(p) => (
                                      <input
                                        {...p}
                                        type="text"
                                        className={`${inputClass} border-gray-300`}
                                        value={row[key]}
                                        onChange={(e) =>
                                          setCertificates((prev) =>
                                            prev.map((r, j) => (j === i ? { ...r, [key]: e.target.value } : r))
                                          )
                                        }
                                      />
                                    )}
                                  </Field>
                                ))}
                              </div>
                            </fieldset>
                          ))}
                        </div>
                        <button
                          type="button"
                          onClick={() => setCertificates((prev) => [...prev, emptyCertificate()])}
                          className="mt-5 inline-flex items-center gap-2 px-5 py-3 rounded-xl border-2 border-dashed border-gray-300 text-secondary font-semibold hover:border-primary hover:text-primary transition-colors"
                        >
                          <FaPlus aria-hidden="true" />
                          Sertifika Ekle
                        </button>
                      </SectionCard>

                      <SectionCard
                        title="Referanslarınız"
                        description="Sizi tanıyan ve görüş bildirebilecek 3 kişiyi belirtiniz."
                      >
                        <div className="space-y-5">
                          {references.map((row, i) => (
                            <fieldset key={i} className="border border-gray-200 rounded-xl p-4 md:p-5">
                              <legend className="px-2 text-sm font-black text-primary">{i + 1}. Referans</legend>
                              <div className="grid md:grid-cols-2 gap-4">
                                {(
                                  [
                                    ['name', 'Adı Soyadı'],
                                    ['company', 'Şirket / Ünvan'],
                                    ['phone', 'Telefon'],
                                    ['duration', 'Birlikte Çalışma Süresi'],
                                  ] as const
                                ).map(([key, label]) => (
                                  <Field key={key} label={label}>
                                    {(p) => (
                                      <input
                                        {...p}
                                        type={key === 'phone' ? 'tel' : 'text'}
                                        className={`${inputClass} border-gray-300`}
                                        value={row[key]}
                                        onChange={(e) =>
                                          setReferences((prev) =>
                                            prev.map((r, j) => (j === i ? { ...r, [key]: e.target.value } : r))
                                          )
                                        }
                                      />
                                    )}
                                  </Field>
                                ))}
                              </div>
                            </fieldset>
                          ))}
                        </div>
                      </SectionCard>

                      <SectionCard title="Çalışma Koşulları">
                        <Field label="En Erken Başlayabileceğiniz Tarih" className="mb-5 max-w-xs">
                          {(p) => (
                            <input
                              {...p}
                              type="date"
                              className={`${inputClass} border-gray-300`}
                              value={form.earliest_start_date}
                              onChange={(e) => setField('earliest_start_date', e.target.value)}
                            />
                          )}
                        </Field>
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                          {(
                            [
                              ['overtime', 'Fazla Mesai Yapabilir misiniz?'],
                              ['weekend_work', 'Hafta Sonu Çalışabilir misiniz?'],
                              ['night_shift', 'Gece Vardiyasında Çalışabilir misiniz?'],
                              ['public_holiday', 'Resmî Tatillerde Çalışabilir misiniz?'],
                              ['travel', 'Seyahat Engeliniz Var mı?'],
                            ] as const
                          ).map(([key, label]) => (
                            <RadioPills
                              key={key}
                              legend={label}
                              name={key}
                              value={form[key]}
                              onChange={(v) => setField(key, v)}
                              options={YES_NO}
                            />
                          ))}
                        </div>
                      </SectionCard>

                      <SectionCard title="Ücret Beklentisi">
                        <div className="grid md:grid-cols-2 gap-5">
                          <Field label="Son İşyerinizdeki Net Ücret">
                            {(p) => (
                              <input
                                {...p}
                                type="text"
                                className={`${inputClass} border-gray-300`}
                                value={form.last_salary}
                                onChange={(e) => setField('last_salary', e.target.value)}
                                placeholder="TL"
                              />
                            )}
                          </Field>
                          <Field label="Talep Ettiğiniz Net Ücret">
                            {(p) => (
                              <input
                                {...p}
                                type="text"
                                className={`${inputClass} border-gray-300`}
                                value={form.expected_salary}
                                onChange={(e) => setField('expected_salary', e.target.value)}
                                placeholder="TL"
                              />
                            )}
                          </Field>
                        </div>
                      </SectionCard>

                      <SectionCard title="Beyan ve Onay">
                        <p className="text-sm text-gray-600 leading-relaxed bg-gray-50 border border-gray-200 rounded-xl p-4 mb-5">
                          Bu Personel Başvuru Formu'nda tarafımdan beyan edilen bilgilerin, muhtemel hizmet
                          akdine esas teşkil edeceğini; Anadolu Hastaneleri'nin işbu bilgiler hakkında araştırma
                          yapabileceğini, söz konusu beyanlarımın doğru ve eksiksiz olduğunu kabul ve beyan
                          ederim. Aksi hâlde hizmet akdimin 4857 sayılı İş Kanunu 25/II (a) maddesi uyarınca
                          ihbarsız ve tazminatsız feshedileceğini kabul, beyan ve taahhüt ederim.
                        </p>
                        <div className="grid md:grid-cols-2 gap-5 mb-5">
                          <Field label="Ad Soyad (elektronik imza yerine geçer)">
                            {(p) => (
                              <input
                                {...p}
                                type="text"
                                className={`${inputClass} border-gray-300`}
                                value={form.signature}
                                onChange={(e) => setField('signature', e.target.value)}
                              />
                            )}
                          </Field>
                          <Field label="Tarih">
                            {(p) => (
                              <input
                                {...p}
                                type="date"
                                className={`${inputClass} border-gray-300`}
                                value={form.signature_date}
                                onChange={(e) => setField('signature_date', e.target.value)}
                              />
                            )}
                          </Field>
                        </div>

                        <label className="flex items-start gap-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={consent}
                            onChange={(e) => {
                              setConsent(e.target.checked);
                              if (e.target.checked) setFormError('');
                            }}
                            className="mt-1 w-5 h-5 rounded border-gray-300 text-primary focus:ring-2 focus:ring-primary-light"
                          />
                          <span className="text-sm text-gray-600 leading-relaxed">
                            Kişisel verilerimin işe alım süreçlerinde değerlendirilmek üzere işlenmesine,{' '}
                            <Link to="/kvkk" className="text-primary font-semibold underline">
                              KVKK Aydınlatma Metni
                            </Link>{' '}
                            kapsamında onay veriyorum. <span className="text-accent">*</span>
                          </span>
                        </label>

                        {turnstileEnabled && (
                          <TurnstileWidget onVerify={setCaptchaToken} className="mt-5" />
                        )}
                      </SectionCard>
                    </>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* ─── GEZİNME ─── */}
            <div className="flex items-center justify-between gap-4 mt-8">
              <button
                type="button"
                onClick={() => goTo(step - 1)}
                disabled={step === 1}
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl border border-gray-300 bg-white text-secondary font-bold hover:border-primary disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <FaArrowLeft aria-hidden="true" />
                Geri
              </button>

              <span className="text-sm text-gray-500 font-medium" aria-hidden="true">
                {step} / {TOTAL_STEPS}
              </span>

              {step < TOTAL_STEPS ? (
                <button
                  type="button"
                  onClick={() => goTo(step + 1)}
                  className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-primary text-white font-bold hover:brightness-125 transition-all"
                >
                  İleri
                  <FaArrowRight aria-hidden="true" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-accent text-white font-bold hover:brightness-110 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
                >
                  <FaPaperPlane aria-hidden="true" />
                  {submitting ? 'Gönderiliyor...' : 'Başvuruyu Gönder'}
                </button>
              )}
            </div>
          </form>
        </div>
      </section>
    </div>
  );
};

export default JobApplicationPage;
