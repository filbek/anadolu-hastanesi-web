// ============================================================
// Admin > İş Başvuruları
//
// Kariyer sayfasındaki başvuru formundan gelen kayıtların listesi,
// detay görünümü, durum takibi ve CSV dışa aktarımı.
// Kayıtlar TC kimlik / adres gibi hassas veri içerir; tablo RLS ile
// yalnızca oturum açmış kullanıcılara okunabilir (bkz. migration).
// ============================================================

import { useState, useEffect, useMemo, Fragment } from 'react';
import {
  FaSearch,
  FaTrash,
  FaEye,
  FaTimes,
  FaFileCsv,
  FaPhone,
  FaEnvelope,
  FaIdCard,
  FaPaperclip,
  FaBriefcase,
  FaCertificate,
  FaChevronUp,
  FaCommentDots,
  FaUserFriends,
  FaStar,
  FaRegStickyNote,
  FaExternalLinkAlt,
  FaSyncAlt,
  FaCloudUploadAlt,
} from 'react-icons/fa';
import { supabase } from '../../lib/supabase';
import { useSupabase } from '../../contexts/SupabaseContext';
import {
  SKILL_BLOCKS,
  POSITION_GROUPS,
  type PositionGroup,
} from '../../data/jobApplicationSkills';

interface JobApplication {
  id: number;
  reference_code: string;
  position: string;
  position_group: string;
  hospital: string | null;
  full_name: string;
  national_id: string;
  gender: string | null;
  birth_place_date: string | null;
  marital_status: string | null;
  nationality: string | null;
  address: string | null;
  mobile_phone: string;
  home_phone: string | null;
  alternative_phone: string | null;
  email: string;
  blood_type: string | null;
  drivers_license: string | null;
  military_status: string | null;
  smoker: string | null;
  health_issues: string | null;
  preferred_cities: string[] | null;
  photo_url: string | null;
  cv_url: string | null;
  education: { level: string; school: string; graduation: string; degree: string }[];
  experience: { company: string; department: string; period: string; reason: string }[];
  skills: Record<string, string>;
  computer_skills: Record<string, string>;
  languages: Record<string, string>;
  certificates: { name: string; date: string; institution: string; duration: string }[];
  references_list: { name: string; company: string; phone: string; duration: string }[];
  profession_notes: string | null;
  earliest_start_date: string | null;
  overtime: string | null;
  weekend_work: string | null;
  night_shift: string | null;
  public_holiday: string | null;
  travel: string | null;
  last_salary: string | null;
  expected_salary: string | null;
  status: string;
  admin_note: string | null;
  is_read: boolean;
  created_at: string;
  /** Aday formu yeniden gönderdiyse damgalanır (bkz. dedupe migration) */
  updated_at: string | null;
  /** Kaç kez gönderildi; 1 ise tek başvuru */
  submission_count: number | null;
  /** Üzerine yazılan gönderimlerin eski başvuru numaraları */
  previous_reference_codes: string[] | null;
}

/*
 * Durum listesi. Değerler veritabanındaki CHECK kısıtıyla birebir aynı
 * olmalı (bkz. job_applications_status_extension_migration.sql) — burada
 * olup orada olmayan bir değer kaydetmeye çalışınca güncelleme sessizce
 * başarısız olur.
 *
 * 'red' ile 'olumsuz' bilerek ayrı: olumsuz aday havuzda kalır,
 * red edilen başvuru kapanmış kayıttır.
 */
/**
 * Bir başvuruya düşülmüş tek not.
 * Yazar bilgisi sunucudaki tetikleyici tarafından damgalanır
 * (bkz. job_application_notes_migration.sql), istemciden gönderilmez.
 */
/** Üzerine yazılan bir gönderimin arşivlenmiş hâli */
interface ApplicationRevision {
  id: number;
  application_id: number;
  reference_code: string | null;
  submitted_at: string | null;
  archived_at: string;
  snapshot: Record<string, any>;
}

interface ApplicationNote {
  id: number;
  application_id: number;
  author_id: string | null;
  author_name: string | null;
  note: string;
  created_at: string;
}

const NOTES_TABLE = 'job_application_notes';

const STATUS_OPTIONS = [
  { value: 'yeni', label: 'Yeni', className: 'bg-blue-100 text-blue-800' },
  { value: 'incelendi', label: 'İncelendi', className: 'bg-gray-100 text-gray-800' },
  { value: 'gorusme', label: 'Görüşmeye Çağrıldı', className: 'bg-amber-100 text-amber-800' },
  { value: 'olumlu', label: 'Olumlu', className: 'bg-green-100 text-green-800' },
  { value: 'olumsuz', label: 'Olumsuz', className: 'bg-orange-100 text-orange-800' },
  { value: 'red', label: 'Red', className: 'bg-red-100 text-red-800' },
  { value: 'eski_calisan', label: 'Eski Çalışan', className: 'bg-indigo-100 text-indigo-800' },
  { value: 'kara_liste', label: 'Kara Liste', className: 'bg-neutral-800 text-white' },
  { value: 'arsiv', label: 'Arşiv', className: 'bg-slate-100 text-slate-600' },
];

/** Aday formu birden çok kez gönderdiyse true */
const isResubmitted = (a: JobApplication) => (a.submission_count ?? 1) > 1;

const statusMeta = (value: string) =>
  STATUS_OPTIONS.find((s) => s.value === value) ?? STATUS_OPTIONS[0];

const groupLabel = (value: string) =>
  POSITION_GROUPS.find((g) => g.value === (value as PositionGroup))?.label ?? value;

const formatDate = (v: string | null) =>
  v ? new Date(v).toLocaleString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '-';

const formatDateTime = (v: string) =>
  new Date(v).toLocaleString('tr-TR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

const YES_NO_LABEL: Record<string, string> = { evet: 'Evet', hayir: 'Hayır' };

/**
 * Listede rozet göstermek için sertifika sayısı.
 * Form yalnızca adı dolu satırları kaydeder ama eski kayıtlarda boş
 * satırlar bulunabildiği için burada da süzülür.
 */
const certificateCount = (app: JobApplication) =>
  (app.certificates ?? []).filter((c) => c?.name?.trim()).length;

/**
 * Formda bildirilen referans sayısı.
 * Veri zaten liste sorgusuyla geliyor (select('*')), ek istek yok.
 */
const filledReferences = (app: JobApplication) =>
  (app.references_list ?? []).filter((r) => r?.name?.trim());

/**
 * Listede ayrıca vurgulanacak referans soyadları.
 * Bu soyadı taşıyan bir referans İK için ayrı anlam taşıdığından
 * gözden kaçmaması gerekir. Yeni soyad eklemek için diziye yazmak yeterli.
 */
const HIGHLIGHTED_REFERENCE_SURNAMES = ['arkaz'];

/** Türkçe büyük/küçük harf kuralına göre sadeleştirir (İ/I tuzağı) */
const trLower = (v: string) => v.toLocaleLowerCase('tr-TR').replace(/\s+/g, ' ').trim();

/**
 * Ad alanı serbest metin; "Mehmet Arkaz" da "ARKAZ, Mehmet" de gelebiliyor.
 * Bu yüzden sadece son kelimeye değil, tüm kelimelere bakılır.
 */
const isHighlightedReference = (name?: string) =>
  !!name && trLower(name).split(' ').some((w) =>
    HIGHLIGHTED_REFERENCE_SURNAMES.includes(w.replace(/[.,;:]/g, ''))
  );

const hasHighlightedReference = (app: JobApplication) =>
  filledReferences(app).some((r) => isHighlightedReference(r.name));

/** Beceri puanlarını `hemsireGenel_0` anahtarından okunabilir metne çevirir */
const readableSkills = (skills: Record<string, string>) =>
  SKILL_BLOCKS.map((block) => {
    const scored = block.items
      .map((item, idx) => ({ item, score: skills?.[`${block.key}_${idx}`] }))
      .filter((x) => x.score !== undefined && x.score !== '');
    return scored.length ? { title: block.title, scored } : null;
  }).filter(Boolean) as { title: string; scored: { item: string; score: string }[] }[];

const BUCKET = 'job-applications';
const SIGNED_URL_TTL = 60 * 60; // 1 saat

/**
 * Kayıtta saklanan değeri bucket içi yola çevirir.
 * Yeni kayıtlar doğrudan yol tutar; migration öncesi kayıtlarda tam public
 * URL bulunabilir — o durumda bucket adından sonrası ayıklanır.
 */
const toStoragePath = (value: string): string => {
  if (!/^https?:\/\//i.test(value)) return value;
  const marker = `/${BUCKET}/`;
  const idx = value.indexOf(marker);
  return idx === -1 ? value : decodeURIComponent(value.slice(idx + marker.length));
};

/**
 * Gizli bucket'taki belgeyi süreli bir bağlantıyla açar.
 * Özgeçmiş için bağlantı yalnızca tıklandığında istenir; açılmayan CV için
 * imzalı URL hiç oluşmaz. Vesikalıklar listede doğrudan gösterildiği için
 * onların bağlantısı önden toplu üretilir (bkz. signPaths).
 */
const openDocument = async (value: string) => {
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(toStoragePath(value), SIGNED_URL_TTL);

  if (error || !data?.signedUrl) {
    console.error('Belge bağlantısı oluşturulamadı:', error);
    alert('Belge açılamadı. Dosya kaldırılmış olabilir veya yetkiniz bulunmuyor.');
    return;
  }
  window.open(data.signedUrl, '_blank', 'noopener,noreferrer');
};

/**
 * Birden çok belgeyi TEK istekte imzalar; satır başına ayrı çağrı
 * atmak 30+ başvuruda listeyi gözle görülür yavaşlatırdı.
 * Dönen kayıt, yol -> imzalı URL eşlemesidir.
 */
const signPaths = async (values: string[]): Promise<Record<string, string>> => {
  const paths = [...new Set(values.map(toStoragePath))];
  if (!paths.length) return {};

  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrls(paths, SIGNED_URL_TTL);

  if (error || !data) {
    console.error('Fotoğraf bağlantıları oluşturulamadı:', error);
    return {};
  }

  const map: Record<string, string> = {};
  for (const item of data) {
    if (item.signedUrl && item.path) map[item.path] = item.signedUrl;
  }
  return map;
};

/** Ad soyaddan baş harfler — fotoğrafı olmayan aday için yer tutucu */
const initials = (name: string) =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0] ?? '')
    .join('')
    .toLocaleUpperCase('tr-TR');

/**
 * Aday vesikalığı. Fotoğrafı yoksa (düzeltme öncesi başvurular ve
 * fotoğrafın zorunlu olmadığı dönem) baş harfli yer tutucu gösterilir.
 */
const CandidatePhoto = ({
  name,
  url,
  className = '',
  onClick,
}: {
  name: string;
  url?: string;
  className?: string;
  onClick?: () => void;
}) => {
  const [failed, setFailed] = useState(false);

  if (!url || failed) {
    return (
      <div
        className={`flex items-center justify-center bg-gray-100 text-gray-500 font-bold select-none ${className}`}
        aria-hidden="true"
      >
        {initials(name) || '—'}
      </div>
    );
  }

  const img = (
    <img
      src={url}
      alt={`${name} vesikalık fotoğrafı`}
      loading="lazy"
      onError={() => setFailed(true)}
      className={`object-cover bg-gray-100 ${className}`}
    />
  );

  if (!onClick) return img;

  return (
    <button
      type="button"
      onClick={onClick}
      title="Fotoğrafı tam boyutta aç"
      className="rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
    >
      {img}
    </button>
  );
};

/**
 * Vesikalığın büyük hâlini gösteren pencere.
 * Yeni sekme yerine burada açılır; İK listeden çıkmadan yüze bakıp
 * Esc ile geri dönebilsin diye.
 */
const PhotoLightbox = ({
  name,
  url,
  onClose,
  onOpenOriginal,
}: {
  name: string;
  url: string;
  onClose: () => void;
  onOpenOriginal?: () => void;
}) => {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div
      // Başvuru detayı z-50'de; bu pencere onun da üstünde durmalı
      className="fixed inset-0 z-[60] bg-black/80 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={`${name} vesikalık fotoğrafı`}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="max-w-lg w-full">
        <div className="flex items-center justify-between gap-3 mb-3 text-white">
          <p className="font-semibold truncate">{name}</p>
          <div className="flex items-center gap-1 shrink-0">
            {onOpenOriginal && (
              <button
                type="button"
                onClick={onOpenOriginal}
                className="p-2 rounded-lg hover:bg-white/10"
                title="Yeni sekmede aç"
                aria-label="Fotoğrafı yeni sekmede aç"
              >
                <FaExternalLinkAlt />
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-white/10"
              aria-label="Kapat"
              autoFocus
            >
              <FaTimes />
            </button>
          </div>
        </div>
        <img
          src={url}
          alt={`${name} vesikalık fotoğrafı`}
          className="w-full max-h-[75vh] object-contain rounded-lg bg-white"
        />
      </div>
    </div>
  );
};

const DetailRow = ({ label, value }: { label: string; value: React.ReactNode }) => {
  if (value === null || value === undefined || value === '' || value === '-') return null;
  return (
    <div className="grid grid-cols-3 gap-3 py-2 border-b border-gray-100 last:border-0">
      <dt className="text-sm font-semibold text-gray-600 col-span-1">{label}</dt>
      <dd className="text-sm text-gray-900 col-span-2 whitespace-pre-wrap break-words">{value}</dd>
    </div>
  );
};

const DetailSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section className="mb-6">
    <h3 className="text-sm font-black text-primary uppercase tracking-wide border-b-2 border-primary/20 pb-2 mb-2">
      {title}
    </h3>
    {children}
  </section>
);

/**
 * Bir başvurunun not akışı. Hem listedeki genişleyen satırda hem de
 * detay kartında AYNI bileşen kullanılır — iki yerde iki farklı not
 * arayüzü olması kafa karıştırırdı.
 */
const NoteThread = ({
  notes,
  currentUserId,
  onAdd,
  onDelete,
  autoFocus = false,
}: {
  notes: ApplicationNote[];
  currentUserId?: string;
  onAdd: (text: string) => Promise<void>;
  onDelete: (noteId: number) => Promise<void>;
  autoFocus?: boolean;
}) => {
  const [draft, setDraft] = useState('');
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    const text = draft.trim();
    if (!text || saving) return;
    setSaving(true);
    try {
      await onAdd(text);
      setDraft('');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      {notes.length > 0 && (
        <ul className="space-y-2 mb-3">
          {notes.map((n) => (
            <li key={n.id} className="rounded-lg bg-white border border-gray-200 px-3 py-2">
              <div className="flex items-start justify-between gap-3">
                <p className="text-sm text-gray-900 whitespace-pre-wrap break-words flex-1">
                  {n.note}
                </p>
                {/* Silme yalnızca kendi notu için; RLS zaten sunucuda da engeller */}
                {n.author_id && n.author_id === currentUserId && (
                  <button
                    onClick={() => onDelete(n.id)}
                    className="p-1.5 rounded text-gray-400 hover:text-red-600 hover:bg-red-50 shrink-0"
                    aria-label="Notu sil"
                    title="Notu sil"
                  >
                    <FaTrash size={12} />
                  </button>
                )}
              </div>
              <div className="text-[11px] text-gray-500 mt-1">
                {n.author_name || 'Bilinmeyen kullanıcı'} · {formatDateTime(n.created_at)}
              </div>
            </li>
          ))}
        </ul>
      )}

      <textarea
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          // Uzun notlarda Enter yeni satır olmalı; gönderme Ctrl/Cmd+Enter
          if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
            e.preventDefault();
            void submit();
          }
        }}
        rows={2}
        autoFocus={autoFocus}
        aria-label="Yeni not"
        placeholder="Not ekleyin... (Ctrl+Enter ile kaydet)"
        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
      />
      <div className="flex items-center gap-3 mt-2">
        <button
          onClick={submit}
          disabled={!draft.trim() || saving}
          className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-semibold hover:brightness-125 disabled:opacity-50"
        >
          {saving ? 'Kaydediliyor...' : 'Not Ekle'}
        </button>
        {notes.length === 0 && (
          <span className="text-xs text-gray-500">Bu başvuruya henüz not düşülmemiş.</span>
        )}
      </div>
    </div>
  );
};

const AdminJobApplications = () => {
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [groupFilter, setGroupFilter] = useState('all');
  const [hospitalFilter, setHospitalFilter] = useState('all');
  const [selected, setSelected] = useState<JobApplication | null>(null);
  /** Başvuru kimliğine göre notlar; liste ve detay aynı kaynaktan okur */
  const [notes, setNotes] = useState<Record<number, ApplicationNote[]>>({});
  /** Listede not bölümü açık olan satır */
  const [expandedId, setExpandedId] = useState<number | null>(null);
  /**
   * Başvuru kimliğine göre imzalı fotoğraf URL'leri.
   * Küçük görsel listede doğrudan gösterileceği için bağlantılar burada
   * önden üretilir; süresi (SIGNED_URL_TTL) dolduğunda görsel kırılmasın
   * diye sayfa yenilendiğinde yeniden imzalanır.
   */
  const [photoUrls, setPhotoUrls] = useState<Record<number, string>>({});
  /** Büyütülmüş vesikalığı gösterilen aday */
  const [photoPreview, setPhotoPreview] = useState<JobApplication | null>(null);
  /** Açılan başvurunun önceki gönderimleri; detay açılırken çekilir */
  const [revisions, setRevisions] = useState<ApplicationRevision[]>([]);
  /** Detayda vesikalık yükleniyor mu / hata verdi mi */
  const [photoUploading, setPhotoUploading] = useState(false);
  const [photoUploadError, setPhotoUploadError] = useState('');
  const { user } = useSupabase();

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('job_applications')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      const list = (data ?? []) as JobApplication[];
      setApplications(list);
      await Promise.all([fetchNotes(list.map((a) => a.id)), fetchPhotoUrls(list)]);
    } catch (err) {
      console.error('Başvurular yüklenemedi:', err);
    } finally {
      setLoading(false);
    }
  };

  /** Fotoğrafı olan başvurular için imzalı URL'leri tek istekte üretir */
  const fetchPhotoUrls = async (list: JobApplication[]) => {
    const withPhoto = list.filter((a) => a.photo_url);
    const map = await signPaths(withPhoto.map((a) => a.photo_url!));
    setPhotoUrls(
      Object.fromEntries(
        withPhoto
          .map((a) => [a.id, map[toStoragePath(a.photo_url!)]])
          .filter(([, url]) => url),
      ),
    );
  };

  /*
   * Notlar tek sorguda toplu çekilir. Satır başına ayrı istek atmak
   * 100 başvuruda 100 istek demekti; liste zaten sayfalanmıyor.
   */
  const fetchNotes = async (ids: number[]) => {
    if (ids.length === 0) return setNotes({});
    const { data, error } = await supabase
      .from(NOTES_TABLE)
      .select('*')
      .in('application_id', ids)
      .order('created_at', { ascending: false });

    if (error) {
      // Migration henüz çalıştırılmadıysa liste yine de açılsın
      console.error('Notlar yüklenemedi:', error);
      return;
    }

    const grouped: Record<number, ApplicationNote[]> = {};
    for (const n of (data ?? []) as ApplicationNote[]) {
      (grouped[n.application_id] ??= []).push(n);
    }
    setNotes(grouped);
  };

  const addNote = async (applicationId: number, text: string) => {
    const { data, error } = await supabase
      .from(NOTES_TABLE)
      .insert({ application_id: applicationId, note: text })
      .select()
      .single();

    if (error || !data) {
      console.error('Not eklenemedi:', error);
      alert('Not kaydedilemedi: ' + (error?.message ?? 'bilinmeyen hata'));
      return;
    }
    setNotes((prev) => ({
      ...prev,
      [applicationId]: [data as ApplicationNote, ...(prev[applicationId] ?? [])],
    }));
  };

  const deleteNote = async (applicationId: number, noteId: number) => {
    if (!confirm('Bu notu silmek istediğinizden emin misiniz?')) return;
    const { error } = await supabase.from(NOTES_TABLE).delete().eq('id', noteId);
    if (error) {
      console.error('Not silinemedi:', error);
      alert('Not silinemedi: ' + error.message);
      return;
    }
    setNotes((prev) => ({
      ...prev,
      [applicationId]: (prev[applicationId] ?? []).filter((n) => n.id !== noteId),
    }));
  };

  const openDetail = async (app: JobApplication) => {
    setSelected(app);

    // KVKK: özel nitelikli veri içeren başvurunun kim tarafından açıldığı
    // kayda geçer. user_id sunucuda auth.uid() ile damgalanır; loglama
    // başarısız olsa da İK'nın işi kesintiye uğramamalı.
    supabase
      .rpc('log_job_application_view', { p_id: app.id })
      .then(({ error }) => {
        if (error) console.error('Görüntüleme logu yazılamadı:', error);
      });

    if (!app.is_read) {
      await supabase.from('job_applications').update({ is_read: true }).eq('id', app.id);
      setApplications((prev) => prev.map((a) => (a.id === app.id ? { ...a, is_read: true } : a)));
    }

    setPhotoUploadError('');

    // Önceki gönderimler yalnızca detay açılınca çekilir; liste için
    // her satıra ayrıca sorgu atmaya değmez.
    setRevisions([]);
    if (isResubmitted(app)) {
      const { data, error } = await supabase
        .from('job_application_revisions')
        .select('*')
        .eq('application_id', app.id)
        .order('submitted_at', { ascending: false });
      if (error) console.error('Önceki gönderimler okunamadı:', error);
      else setRevisions((data ?? []) as ApplicationRevision[]);
    }
  };

  /*
   * Vesikalığı panelden yükleme.
   *
   * Fotoğraf zorunlu olmadan önce gönderilmiş başvurularda alan boş kalıyor;
   * İK adayın gönderdiği görseli buradan ekleyebilsin diye. Yeni dosya
   * bucket'a yazılır, ardından kaydın photo_url'i güncellenir — sıralama
   * önemli: önce kayıt güncellenip yükleme başarısız olsaydı kırık yol
   * kalırdı.
   */
  const MAX_PHOTO_MB = 10;

  const uploadPhoto = async (app: JobApplication, file: File) => {
    setPhotoUploadError('');

    if (!file.type.startsWith('image/')) {
      setPhotoUploadError('Yalnızca görsel dosyası yükleyebilirsiniz (JPG, PNG).');
      return;
    }
    if (file.size > MAX_PHOTO_MB * 1024 * 1024) {
      setPhotoUploadError(`Dosya boyutu ${MAX_PHOTO_MB}MB sınırını aşıyor.`);
      return;
    }

    setPhotoUploading(true);
    try {
      const parts = file.name.split('.');
      const ext = parts.length > 1 ? parts.pop()!.toLowerCase().replace(/[^a-z0-9]/g, '') : '';
      const path = `photos/${crypto.randomUUID()}${ext ? `.${ext}` : ''}`;

      const { error: uploadError } = await supabase.storage
        .from(BUCKET)
        .upload(path, file, { contentType: file.type || 'application/octet-stream' });
      if (uploadError) throw uploadError;

      const { error: updateError } = await supabase
        .from('job_applications')
        .update({ photo_url: path })
        .eq('id', app.id);
      if (updateError) throw updateError;

      const signed = await signPaths([path]);
      setPhotoUrls((prev) => ({ ...prev, [app.id]: signed[path] }));
      setApplications((prev) =>
        prev.map((a) => (a.id === app.id ? { ...a, photo_url: path } : a))
      );
      setSelected((prev) => (prev && prev.id === app.id ? { ...prev, photo_url: path } : prev));
    } catch (err: any) {
      console.error('Fotoğraf yüklenemedi:', err);
      setPhotoUploadError(err?.message ?? 'Fotoğraf yüklenemedi. Lütfen tekrar deneyin.');
    } finally {
      setPhotoUploading(false);
    }
  };

  const updateStatus = async (id: number, status: string) => {
    const { error } = await supabase.from('job_applications').update({ status }).eq('id', id);
    if (error) return console.error('Durum güncellenemedi:', error);
    setApplications((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)));
    setSelected((prev) => (prev && prev.id === id ? { ...prev, status } : prev));
  };

  const remove = async (id: number) => {
    if (!confirm('Bu başvuruyu kalıcı olarak silmek istediğinizden emin misiniz?')) return;
    const { error } = await supabase.from('job_applications').delete().eq('id', id);
    if (error) {
      console.error('Başvuru silinemedi:', error);
      alert('Silme işlemi başarısız oldu.');
      return;
    }
    setApplications((prev) => prev.filter((a) => a.id !== id));
    setNotes((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
    if (expandedId === id) setExpandedId(null);
    if (selected?.id === id) setSelected(null);
  };

  /**
   * Filtredeki şube listesi başvurulardan türetilir; hastaneler tablosundan
   * değil. Böylece eski bir şube adıyla kaydedilmiş başvurular da
   * filtrelenebilir ve hiç başvurusu olmayan şube listede yer kaplamaz.
   */
  const hospitalOptions = useMemo(
    () =>
      [...new Set(applications.map((a) => a.hospital).filter(Boolean) as string[])].sort(
        (a, b) => a.localeCompare(b, 'tr')
      ),
    [applications]
  );

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return applications.filter((a) => {
      const matchesSearch =
        !q ||
        a.full_name.toLowerCase().includes(q) ||
        a.email.toLowerCase().includes(q) ||
        a.position.toLowerCase().includes(q) ||
        a.mobile_phone.includes(q) ||
        a.reference_code.toLowerCase().includes(q) ||
        // Aday elindeki ESKİ numarayla arandığında da bulunsun
        (a.previous_reference_codes ?? []).some((c) => c.toLowerCase().includes(q)) ||
        // Referans kişinin adı/kurumu da aranabilir: "Arkaz" yazıp o kişiyi
        // referans gösteren tüm başvurular tek seferde bulunabilsin.
        filledReferences(a).some(
          (r) =>
            r.name.toLowerCase().includes(q) ||
            (r.company ?? '').toLowerCase().includes(q)
        );
      const matchesStatus = statusFilter === 'all' || a.status === statusFilter;
      const matchesGroup = groupFilter === 'all' || a.position_group === groupFilter;
      // 'none': şube seçilmeden gönderilmiş eski başvurular
      const matchesHospital =
        hospitalFilter === 'all' ||
        (hospitalFilter === 'none' ? !a.hospital : a.hospital === hospitalFilter);
      return matchesSearch && matchesStatus && matchesGroup && matchesHospital;
    })
      /*
       * Yeniden gönderilen başvuru listenin başına gelsin diye son hareket
       * tarihine göre sıralanır. Sıralama SUNUCUDA değil burada yapılır:
       * updated_at kolonu dedupe migration ile geliyor, sorguya konursa
       * migration çalıştırılmamış bir veritabanında istek 400 döner ve
       * liste tamamen boş kalırdı.
       */
      .sort(
        (a, b) =>
          new Date(b.updated_at ?? b.created_at).getTime() -
          new Date(a.updated_at ?? a.created_at).getTime()
      );
  }, [applications, search, statusFilter, groupFilter, hospitalFilter]);

  /** Excel'de açılabilmesi için UTF-8 BOM'lu, noktalı virgül ayraçlı CSV */
  const exportCsv = () => {
    const headers = [
      'Başvuru No', 'Tarih', 'Ad Soyad', 'TC Kimlik', 'Pozisyon', 'Pozisyon Grubu',
      'Hastane', 'E-posta', 'Cep Telefonu', 'Ücret Beklentisi', 'Durum',
    ];
    const escape = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const rows = filtered.map((a) =>
      [
        a.reference_code, formatDateTime(a.created_at), a.full_name, a.national_id,
        a.position, groupLabel(a.position_group), a.hospital ?? '', a.email,
        a.mobile_phone, a.expected_salary ?? '', statusMeta(a.status).label,
      ].map(escape).join(';')
    );
    const csv = '﻿' + [headers.map(escape).join(';'), ...rows].join('\r\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `is-basvurulari-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const unreadCount = applications.filter((a) => !a.is_read).length;

  if (loading) {
    return (
      <div className="p-8 text-center text-gray-500">Başvurular yükleniyor...</div>
    );
  }

  return (
    <div className="p-4 md:p-6">
      {/* Başlık */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-primary flex items-center gap-3">
            <FaBriefcase />
            İş Başvuruları
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Toplam {applications.length} başvuru
            {unreadCount > 0 && (
              <span className="ml-2 px-2 py-0.5 rounded-full bg-accent text-white text-xs font-bold">
                {unreadCount} okunmamış
              </span>
            )}
          </p>
        </div>
        <button
          onClick={exportCsv}
          disabled={filtered.length === 0}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-green-600 text-white font-semibold hover:bg-green-700 disabled:opacity-50 transition-colors"
        >
          <FaFileCsv />
          CSV İndir ({filtered.length})
        </button>
      </div>

      {/* Filtreler */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6 grid md:grid-cols-3 gap-3">
        <div className="relative">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" aria-hidden="true" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Ad, e-posta, pozisyon, başvuru no, referans adı..."
            aria-label="Başvurularda ve referans adlarında ara"
            className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          aria-label="Duruma göre filtrele"
          className="px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="all">Tüm durumlar</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
        <select
          value={groupFilter}
          onChange={(e) => setGroupFilter(e.target.value)}
          aria-label="Pozisyon grubuna göre filtrele"
          className="px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="all">Tüm pozisyon grupları</option>
          {POSITION_GROUPS.map((g) => (
            <option key={g.value} value={g.value}>{g.label}</option>
          ))}
        </select>
        <select
          value={hospitalFilter}
          onChange={(e) => setHospitalFilter(e.target.value)}
          aria-label="Hastane şubesine göre filtrele"
          className="px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="all">Tüm şubeler</option>
          {hospitalOptions.map((h) => (
            <option key={h} value={h}>{h}</option>
          ))}
          {applications.some((a) => !a.hospital) && (
            <option value="none">Şube belirtilmemiş</option>
          )}
        </select>
      </div>

      {/* Liste */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center text-gray-500">
          {applications.length === 0
            ? 'Henüz başvuru bulunmuyor.'
            : 'Arama kriterlerine uyan başvuru bulunamadı.'}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left">
              <tr>
                <th scope="col" className="px-4 py-3 font-semibold text-gray-600">Aday</th>
                <th scope="col" className="px-4 py-3 font-semibold text-gray-600">Pozisyon</th>
                <th scope="col" className="px-4 py-3 font-semibold text-gray-600 hidden lg:table-cell">İletişim</th>
                <th scope="col" className="px-4 py-3 font-semibold text-gray-600">Durum</th>
                <th scope="col" className="px-4 py-3 font-semibold text-gray-600 hidden md:table-cell">Tarih</th>
                <th scope="col" className="px-4 py-3 font-semibold text-gray-600 text-right">İşlem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((a) => (
                <Fragment key={a.id}>
                <tr className={a.is_read ? '' : 'bg-blue-50/40'}>
                  <td className="px-4 py-3">
                    <div className="flex items-start gap-3">
                      {/* Vesikalık; adayı listede yüzünden tanımak için */}
                      <CandidatePhoto
                        name={a.full_name}
                        url={photoUrls[a.id]}
                        className="w-10 h-[52px] rounded-md shrink-0 text-xs"
                        onClick={photoUrls[a.id] ? () => setPhotoPreview(a) : undefined}
                      />
                      <div className="min-w-0">
                        <div className="font-semibold text-gray-900 flex items-center gap-2">
                          {!a.is_read && (
                            <span className="w-2 h-2 rounded-full bg-accent shrink-0" aria-label="Okunmadı" />
                          )}
                          {a.full_name}
                          {/*
                            Aday formu yeniden gönderdiğinde yeni satır
                            açılmaz, mevcut kayıt güncellenir. İK'nın bunu
                            fark etmesi için rozet gösterilir.
                          */}
                          {isResubmitted(a) && (
                            <span
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 text-[11px] font-bold"
                              title={`Aday ${a.submission_count} kez başvuru gönderdi. Son güncelleme: ${
                                a.updated_at ? formatDateTime(a.updated_at) : '-'
                              }`}
                            >
                              <FaSyncAlt aria-hidden="true" />
                              {a.submission_count}× güncellendi
                            </span>
                          )}
                          {certificateCount(a) > 0 && (
                            <span
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 text-[11px] font-bold"
                              title={`${certificateCount(a)} sertifika bildirildi`}
                            >
                              <FaCertificate aria-hidden="true" />
                              {certificateCount(a)}
                              <span className="sr-only">sertifika bildirildi</span>
                            </span>
                          )}
                          {/*
                            Yalnızca SAYI gösterilir. Referans kişiler başvuru
                            sahibi değil, kendi verisinin işlenmesine rıza
                            vermemiş üçüncü kişiler; ad ve telefonları sürekli
                            açık ekranda durmak yerine İK'nın bilerek açtığı
                            bölümde görünür.
                          */}
                          {filledReferences(a).length > 0 && (
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold ${
                                hasHighlightedReference(a)
                                  ? 'bg-amber-400 text-amber-950 ring-2 ring-amber-500'
                                  : 'bg-violet-100 text-violet-800'
                              }`}
                              title={
                                hasHighlightedReference(a)
                                  ? `${filledReferences(a).length} referans — aralarında vurgulanan bir soyad var`
                                  : `${filledReferences(a).length} referans bildirildi`
                              }
                            >
                              <FaUserFriends aria-hidden="true" />
                              {filledReferences(a).length}
                              <span className="sr-only">
                                referans bildirildi
                                {hasHighlightedReference(a) && ', aralarında vurgulanan bir soyad var'}
                              </span>
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-gray-500 font-mono">{a.reference_code}</div>
                        {/* Son not, satır açılmadan da okunabilsin */}
                        {(notes[a.id]?.length ?? 0) > 0 && (
                          <div className="mt-1 flex items-start gap-1.5 text-xs text-gray-600 max-w-xs">
                            <FaRegStickyNote className="mt-0.5 shrink-0 text-amber-500" aria-hidden="true" />
                            <span className="line-clamp-2 italic">{notes[a.id][0].note}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-gray-900">{a.position}</div>
                    <div className="text-xs text-gray-500">{groupLabel(a.position_group)}</div>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell text-gray-600">
                    <div>{a.email}</div>
                    <div className="text-xs">{a.mobile_phone}</div>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={a.status}
                      onChange={(e) => updateStatus(a.id, e.target.value)}
                      aria-label={`${a.full_name} başvuru durumu`}
                      className={`text-xs font-bold px-2.5 py-1.5 rounded-full border-0 cursor-pointer ${statusMeta(a.status).className}`}
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s.value} value={s.value}>{s.label}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell text-gray-500 text-xs whitespace-nowrap">
                    {formatDateTime(a.created_at)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => setExpandedId(expandedId === a.id ? null : a.id)}
                        aria-expanded={expandedId === a.id}
                        aria-label={`${a.full_name} notlarını ${expandedId === a.id ? 'kapat' : 'aç'}`}
                        title="Notlar"
                        className={`relative p-2 rounded-lg transition-colors ${
                          expandedId === a.id
                            ? 'bg-amber-100 text-amber-700'
                            : 'text-gray-500 hover:bg-gray-100'
                        }`}
                      >
                        {expandedId === a.id ? <FaChevronUp /> : <FaCommentDots />}
                        {(notes[a.id]?.length ?? 0) > 0 && (
                          <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-amber-500 text-white text-[10px] font-bold leading-4">
                            {notes[a.id].length}
                          </span>
                        )}
                      </button>
                      <button
                        onClick={() => openDetail(a)}
                        className="p-2 rounded-lg text-primary hover:bg-primary/10 transition-colors"
                        aria-label={`${a.full_name} başvurusunu görüntüle`}
                      >
                        <FaEye />
                      </button>
                      <button
                        onClick={() => remove(a.id)}
                        className="p-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                        aria-label={`${a.full_name} başvurusunu sil`}
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
                {expandedId === a.id && (
                  <tr key={`${a.id}-notes`} className="bg-amber-50/50">
                    <td colSpan={6} className="px-4 py-4">
                      <div className="grid lg:grid-cols-2 gap-6">
                        <div>
                          <h3 className="text-xs font-black text-amber-800 uppercase tracking-wide mb-3">
                            İK Notları — {a.full_name}
                          </h3>
                          <NoteThread
                            notes={notes[a.id] ?? []}
                            currentUserId={user?.id}
                            onAdd={(text) => addNote(a.id, text)}
                            onDelete={(noteId) => deleteNote(a.id, noteId)}
                            autoFocus
                          />
                        </div>

                        <div>
                          <h3 className="text-xs font-black text-violet-800 uppercase tracking-wide mb-3">
                            Formda Bildirilen Referanslar
                          </h3>
                          {filledReferences(a).length === 0 ? (
                            <p className="text-xs text-gray-500">
                              Aday referans bildirmemiş.
                            </p>
                          ) : (
                            <ul className="space-y-2">
                              {filledReferences(a).map((r, i) => (
                                <li
                                  key={i}
                                  className={`rounded-lg px-3 py-2 border ${
                                    isHighlightedReference(r.name)
                                      ? 'bg-amber-50 border-amber-400 ring-1 ring-amber-300'
                                      : 'bg-white border-gray-200'
                                  }`}
                                >
                                  <div
                                    className={`text-sm font-semibold flex items-center gap-1.5 ${
                                      isHighlightedReference(r.name)
                                        ? 'text-amber-900'
                                        : 'text-gray-900'
                                    }`}
                                  >
                                    {isHighlightedReference(r.name) && (
                                      <FaStar className="text-amber-500 shrink-0" aria-hidden="true" />
                                    )}
                                    {r.name}
                                  </div>
                                  {r.company && (
                                    <div className="text-xs text-gray-600">{r.company}</div>
                                  )}
                                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs">
                                    {r.phone && (
                                      <a
                                        href={`tel:${r.phone.replace(/\s/g, '')}`}
                                        className="inline-flex items-center gap-1 text-primary hover:underline"
                                      >
                                        <FaPhone aria-hidden="true" />
                                        {r.phone}
                                      </a>
                                    )}
                                    {r.duration && (
                                      <span className="text-gray-500">
                                        Birlikte çalışma: {r.duration}
                                      </span>
                                    )}
                                  </div>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Detay */}
      {selected && (
        <div
          className="fixed inset-0 z-50 bg-black/50 flex items-start justify-center p-4 overflow-y-auto"
          role="dialog"
          aria-modal="true"
          aria-label={`${selected.full_name} başvuru detayı`}
          onClick={(e) => e.target === e.currentTarget && setSelected(null)}
        >
          <div className="bg-white rounded-2xl w-full max-w-3xl my-8 shadow-2xl">
            <div className="sticky top-0 bg-primary text-white px-6 py-4 rounded-t-2xl flex items-start justify-between gap-4 z-10">
              <div className="flex items-center gap-3 min-w-0">
                <CandidatePhoto
                  name={selected.full_name}
                  url={photoUrls[selected.id]}
                  className="w-9 h-11 rounded-md shrink-0 text-xs bg-white/20 text-white"
                />
                <div className="min-w-0">
                <h2 className="text-lg font-bold">{selected.full_name}</h2>
                <p className="text-sm text-white/70">
                  {selected.position} · {selected.reference_code}
                </p>
                {isResubmitted(selected) && (
                  <p className="text-xs text-sky-100 flex items-center gap-1.5 mt-0.5">
                    <FaSyncAlt aria-hidden="true" />
                    {selected.submission_count} kez gönderildi · son güncelleme{' '}
                    {selected.updated_at ? formatDateTime(selected.updated_at) : '-'}
                  </p>
                )}
                </div>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                aria-label="Kapat"
              >
                <FaTimes />
              </button>
            </div>

            <div className="p-6">
              {/*
                Vesikalık, basılı özgeçmiş formlarındaki gibi sağ üstte
                gömülü durur; tıklanınca tam boyutta yeni sekmede açılır.
              */}
              <div className="flex flex-col-reverse sm:flex-row sm:items-start gap-4 mb-6">
              <div className="flex flex-wrap gap-2 flex-1">
                <a
                  href={`mailto:${selected.email}`}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white text-sm font-semibold hover:brightness-125"
                >
                  <FaEnvelope /> E-posta Gönder
                </a>
                <a
                  href={`tel:${selected.mobile_phone}`}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 text-sm font-semibold hover:border-primary"
                >
                  <FaPhone /> Ara
                </a>
                {selected.cv_url && (
                  <button
                    type="button"
                    onClick={() => openDocument(selected.cv_url!)}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 text-sm font-semibold hover:border-primary"
                  >
                    <FaPaperclip /> Özgeçmiş
                  </button>
                )}
                {selected.photo_url && (
                  <button
                    type="button"
                    onClick={() => openDocument(selected.photo_url!)}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 text-sm font-semibold hover:border-primary"
                  >
                    <FaIdCard /> Fotoğraf
                  </button>
                )}
              </div>

                <figure className="shrink-0 self-start">
                  {photoUrls[selected.id] ? (
                    <CandidatePhoto
                      name={selected.full_name}
                      url={photoUrls[selected.id]}
                      className="w-32 h-40 rounded-lg border border-gray-200 shadow-sm text-2xl"
                      onClick={() => setPhotoPreview(selected)}
                    />
                  ) : (
                    /*
                      Fotoğrafın zorunlu olmadığı dönemde gönderilmiş
                      başvurularda alan boş kalıyor; İK boşluğa tıklayıp
                      vesikalığı buradan tamamlayabilsin.
                    */
                    <label
                      className={`w-32 h-40 rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 flex flex-col items-center justify-center gap-1.5 text-center px-2 transition-colors focus-within:ring-2 focus-within:ring-primary ${
                        photoUploading
                          ? 'opacity-60 cursor-wait'
                          : 'cursor-pointer hover:border-primary hover:bg-primary/5'
                      }`}
                    >
                      <FaCloudUploadAlt className="text-2xl text-primary" aria-hidden="true" />
                      <span className="text-xs font-semibold text-gray-600 leading-tight">
                        {photoUploading ? 'Yükleniyor…' : 'Fotoğraf yükle'}
                      </span>
                      <span className="text-[10px] text-gray-400 leading-tight">JPG, PNG</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="sr-only"
                        disabled={photoUploading}
                        aria-label={`${selected.full_name} için vesikalık fotoğraf yükle`}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          // Aynı dosya tekrar seçilebilsin diye input sıfırlanır
                          e.target.value = '';
                          if (file) uploadPhoto(selected, file);
                        }}
                      />
                    </label>
                  )}
                  {photoUploadError && (
                    <p role="alert" className="text-xs text-accent font-medium mt-1.5 w-32">
                      {photoUploadError}
                    </p>
                  )}
                  <figcaption className="sr-only">
                    {selected.full_name} vesikalık fotoğrafı
                  </figcaption>
                </figure>
              </div>

              <DetailSection title="Başvuru">
                <dl>
                  <DetailRow label="Başvuru No" value={selected.reference_code} />
                  <DetailRow label="Başvuru Tarihi" value={formatDateTime(selected.created_at)} />
                  <DetailRow
                    label="Son Güncelleme"
                    value={selected.updated_at ? formatDateTime(selected.updated_at) : null}
                  />
                  <DetailRow
                    label="Eski Başvuru No"
                    value={(selected.previous_reference_codes ?? []).join(', ') || null}
                  />
                  <DetailRow label="Pozisyon" value={selected.position} />
                  <DetailRow label="Pozisyon Grubu" value={groupLabel(selected.position_group)} />
                  <DetailRow label="Tercih Edilen Hastane" value={selected.hospital} />
                  <DetailRow label="En Erken Başlama" value={formatDate(selected.earliest_start_date)} />
                  <DetailRow label="Son Ücret" value={selected.last_salary} />
                  <DetailRow label="Ücret Beklentisi" value={selected.expected_salary} />
                </dl>
              </DetailSection>

              <DetailSection title="Kişisel Bilgiler">
                <dl>
                  <DetailRow label="T.C. Kimlik No" value={selected.national_id} />
                  <DetailRow label="E-posta" value={selected.email} />
                  <DetailRow label="Cep Telefonu" value={selected.mobile_phone} />
                  <DetailRow label="Ev Telefonu" value={selected.home_phone} />
                  <DetailRow label="Alternatif Telefon" value={selected.alternative_phone} />
                  <DetailRow label="Doğum Yeri / Tarihi" value={selected.birth_place_date} />
                  <DetailRow label="Cinsiyet" value={selected.gender === 'kadin' ? 'Kadın' : selected.gender === 'erkek' ? 'Erkek' : null} />
                  <DetailRow label="Medeni Hâl" value={selected.marital_status} />
                  <DetailRow label="Uyruk" value={selected.nationality} />
                  <DetailRow label="Kan Grubu" value={selected.blood_type} />
                  <DetailRow label="Ehliyet" value={selected.drivers_license} />
                  <DetailRow label="Askerlik" value={selected.military_status} />
                  <DetailRow label="Sigara" value={YES_NO_LABEL[selected.smoker ?? '']} />
                  <DetailRow label="Adres" value={selected.address} />
                  <DetailRow label="Sağlık Problemi" value={selected.health_issues} />
                  <DetailRow
                    label="Tercih Edilen Şehirler"
                    value={selected.preferred_cities?.length ? selected.preferred_cities.join(', ') : null}
                  />
                </dl>
              </DetailSection>

              {selected.education?.length > 0 && (
                <DetailSection title="Eğitim">
                  <dl>
                    {selected.education.map((e, i) => (
                      <DetailRow
                        key={i}
                        label={e.level}
                        value={[e.school, e.graduation, e.degree].filter(Boolean).join(' · ')}
                      />
                    ))}
                  </dl>
                </DetailSection>
              )}

              {selected.experience?.length > 0 && (
                <DetailSection title="İş Deneyimi">
                  <div className="space-y-3">
                    {selected.experience.map((x, i) => (
                      <div key={i} className="bg-gray-50 rounded-lg p-3">
                        <div className="font-semibold text-gray-900">{x.company}</div>
                        <div className="text-sm text-gray-600">
                          {[x.department, x.period].filter(Boolean).join(' · ')}
                        </div>
                        {x.reason && (
                          <div className="text-xs text-gray-500 mt-1">Ayrılma sebebi: {x.reason}</div>
                        )}
                      </div>
                    ))}
                  </div>
                </DetailSection>
              )}

              {readableSkills(selected.skills ?? {}).length > 0 && (
                <DetailSection title="Mesleki Deneyim (0 = hiç · 3 = çok iyi)">
                  <div className="space-y-3">
                    {readableSkills(selected.skills).map((block) => (
                      <div key={block.title}>
                        <h4 className="text-xs font-bold text-gray-500 uppercase mb-1.5">{block.title}</h4>
                        <div className="flex flex-wrap gap-1.5">
                          {block.scored.map((s) => (
                            <span
                              key={s.item}
                              className="text-xs px-2 py-1 rounded-md bg-gray-100 text-gray-700"
                            >
                              {s.item} <strong className="text-primary">{s.score}</strong>
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </DetailSection>
              )}

              {selected.profession_notes && (
                <DetailSection title="Mesleki Yetkinlik Notu">
                  <p className="text-sm text-gray-700 whitespace-pre-wrap bg-gray-50 rounded-lg p-3">
                    {selected.profession_notes}
                  </p>
                </DetailSection>
              )}

              {(Object.keys(selected.computer_skills ?? {}).length > 0 ||
                Object.keys(selected.languages ?? {}).length > 0) && (
                <DetailSection title="Bilgisayar ve Yabancı Dil (1 = başlangıç · 4 = çok iyi)">
                  <dl>
                    <DetailRow
                      label="Bilgisayar"
                      value={Object.entries(selected.computer_skills ?? {})
                        .filter(([, v]) => v)
                        .map(([k, v]) => `${k}: ${v}`)
                        .join(' · ')}
                    />
                    <DetailRow
                      label="Yabancı Dil"
                      value={Object.entries(selected.languages ?? {})
                        .filter(([, v]) => v)
                        .map(([k, v]) => `${k}: ${v}`)
                        .join(' · ')}
                    />
                  </dl>
                </DetailSection>
              )}

              {selected.certificates?.length > 0 && (
                <DetailSection title="Sertifikalar">
                  <dl>
                    {selected.certificates.map((c, i) => (
                      <DetailRow
                        key={i}
                        label={c.name}
                        value={[c.institution, c.date, c.duration && `${c.duration} gün`]
                          .filter(Boolean)
                          .join(' · ')}
                      />
                    ))}
                  </dl>
                </DetailSection>
              )}

              {selected.references_list?.length > 0 && (
                <DetailSection title="Referanslar">
                  <dl>
                    {selected.references_list.map((r, i) => (
                      <DetailRow
                        key={i}
                        label={r.name}
                        value={[r.company, r.phone, r.duration].filter(Boolean).join(' · ')}
                      />
                    ))}
                  </dl>
                </DetailSection>
              )}

              <DetailSection title="Çalışma Koşulları">
                <dl>
                  <DetailRow label="Fazla Mesai" value={YES_NO_LABEL[selected.overtime ?? '']} />
                  <DetailRow label="Hafta Sonu" value={YES_NO_LABEL[selected.weekend_work ?? '']} />
                  <DetailRow label="Gece Vardiyası" value={YES_NO_LABEL[selected.night_shift ?? '']} />
                  <DetailRow label="Resmî Tatil" value={YES_NO_LABEL[selected.public_holiday ?? '']} />
                  <DetailRow label="Seyahat Engeli" value={YES_NO_LABEL[selected.travel ?? '']} />
                </dl>
              </DetailSection>

              {/*
                Üzerine yazılan gönderimler burada durur; hangi bilgiyi ne
                zaman değiştirdiği görülebilsin diye ilk gönderime kadar
                tüm sürümler listelenir.
              */}
              {revisions.length > 0 && (
                <DetailSection title="Önceki Gönderimler">
                  <ul className="space-y-2">
                    {revisions.map((r) => (
                      <li
                        key={r.id}
                        className="rounded-lg border border-gray-200 px-3 py-2 text-sm"
                      >
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                          <span className="font-semibold text-gray-900">
                            {r.submitted_at ? formatDateTime(r.submitted_at) : 'Tarih yok'}
                          </span>
                          <span className="font-mono text-xs text-gray-500">
                            {r.reference_code}
                          </span>
                        </div>
                        <div className="text-xs text-gray-600 mt-1">
                          {[
                            r.snapshot?.position,
                            r.snapshot?.email,
                            r.snapshot?.mobile_phone,
                          ]
                            .filter(Boolean)
                            .join(' · ')}
                        </div>
                      </li>
                    ))}
                  </ul>
                </DetailSection>
              )}

              <DetailSection title="İK Notları">
                <NoteThread
                  notes={notes[selected.id] ?? []}
                  currentUserId={user?.id}
                  onAdd={(text) => addNote(selected.id, text)}
                  onDelete={(noteId) => deleteNote(selected.id, noteId)}
                />
              </DetailSection>
            </div>
          </div>
        </div>
      )}

      {photoPreview && photoUrls[photoPreview.id] && (
        <PhotoLightbox
          name={photoPreview.full_name}
          url={photoUrls[photoPreview.id]}
          onClose={() => setPhotoPreview(null)}
          onOpenOriginal={
            photoPreview.photo_url
              ? () => openDocument(photoPreview.photo_url!)
              : undefined
          }
        />
      )}
    </div>
  );
};

export default AdminJobApplications;
