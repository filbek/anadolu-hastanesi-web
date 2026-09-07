// ============================================================
// İş başvurusu paylaşım penceresi
//
// Süreli bağlantı üretir, kopyalanabilir hale getirir ve istenirse
// WhatsApp'ta hazır mesajla açar. Ayrıca o başvuru için daha önce
// üretilmiş bağlantıları listeler ve iptal edilmesini sağlar.
//
// Token üretimi ve saklaması sunucudadır (share-job-application edge
// function). Düz token yalnızca oluşturma yanıtında bir kez döner;
// pencere kapanınca bir daha okunamaz, kaybedilirse yenisi üretilir.
// ============================================================

import { useState, useEffect, useCallback } from 'react';
import {
  FaTimes,
  FaCopy,
  FaCheck,
  FaWhatsapp,
  FaLink,
  FaBan,
  FaEye,
} from 'react-icons/fa';
import { supabase } from '../../lib/supabase';
import { normalizeWhatsAppNumber, openWhatsApp } from '../../services/whatsappService';

interface ShareRow {
  id: number;
  scope: 'ozet' | 'tam';
  include_cv: boolean;
  created_by_name: string | null;
  created_at: string;
  expires_at: string;
  revoked_at: string | null;
  view_count: number;
  last_viewed_at: string | null;
  note: string | null;
}

const DURATIONS = [
  { hours: 1, label: '1 saat' },
  { hours: 24, label: '24 saat' },
  { hours: 168, label: '7 gün' },
];

const formatDateTime = (v?: string | null) =>
  v
    ? new Date(v).toLocaleString('tr-TR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '-';

const callShareFn = async <T,>(body: Record<string, unknown>): Promise<T> => {
  const { data, error } = await supabase.functions.invoke('share-job-application', { body });
  if (error) {
    let message = error.message;
    const response = (error as any).context as Response | undefined;
    if (response) {
      try {
        const parsed = await response.clone().json();
        if (parsed?.error) message = parsed.error;
      } catch {
        /* gövde JSON değilse varsayılan mesaj kalsın */
      }
    }
    throw new Error(message);
  }
  if ((data as any)?.error) throw new Error((data as any).error);
  return data as T;
};

const JobApplicationShareModal = ({
  applicationId,
  candidateName,
  position,
  onClose,
}: {
  applicationId: number;
  candidateName: string;
  position: string;
  onClose: () => void;
}) => {
  const [scope, setScope] = useState<'ozet' | 'tam'>('ozet');
  const [hours, setHours] = useState(24);
  const [includeCv, setIncludeCv] = useState(false);
  const [note, setNote] = useState('');
  const [creating, setCreating] = useState(false);

  const [link, setLink] = useState('');
  const [linkExpiresAt, setLinkExpiresAt] = useState('');
  const [copied, setCopied] = useState(false);
  const [phone, setPhone] = useState('');

  const [shares, setShares] = useState<ShareRow[]>([]);
  const [error, setError] = useState('');

  const loadShares = useCallback(async () => {
    try {
      const res = await callShareFn<{ shares: ShareRow[] }>({
        action: 'list',
        application_id: applicationId,
      });
      setShares(res.shares);
    } catch (err: any) {
      console.error('Paylaşımlar yüklenemedi:', err);
    }
  }, [applicationId]);

  useEffect(() => {
    void loadShares();
  }, [loadShares]);

  const createLink = async () => {
    setError('');
    setCreating(true);
    try {
      const res = await callShareFn<{ token: string; expires_at: string }>({
        action: 'create',
        application_id: applicationId,
        scope,
        hours,
        include_cv: includeCv,
        note: note.trim() || undefined,
      });
      setLink(`${window.location.origin}/basvuru-paylasim/${res.token}`);
      setLinkExpiresAt(res.expires_at);
      setCopied(false);
      await loadShares();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setCreating(false);
    }
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Pano izni yoksa kullanıcı elle seçebilsin
      alert('Bağlantı kopyalanamadı, lütfen elle seçip kopyalayın.');
    }
  };

  const sendWhatsApp = () => {
    const to = normalizeWhatsAppNumber(phone);
    if (!to) {
      alert('Geçerli bir WhatsApp numarası girin. Örnek: 0532 123 45 67');
      return;
    }
    const text = [
      `${candidateName} — ${position}`,
      'Aday başvurusu (süreli bağlantı):',
      link,
      `Bağlantı ${formatDateTime(linkExpiresAt)} tarihinde geçersiz olacak.`,
    ].join('\n');
    openWhatsApp(`https://wa.me/${to}?text=${encodeURIComponent(text)}`);
  };

  const revoke = async (id: number) => {
    if (!confirm('Bu bağlantı iptal edilsin mi? Bağlantıyı açan kimse başvuruyu göremeyecek.'))
      return;
    try {
      await callShareFn({ action: 'revoke', id });
      await loadShares();
    } catch (err: any) {
      alert('Bağlantı iptal edilemedi: ' + err.message);
    }
  };

  const isActive = (s: ShareRow) =>
    !s.revoked_at && new Date(s.expires_at).getTime() > Date.now();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 sticky top-0 bg-white">
          <h2 className="text-lg font-bold text-primary flex items-center gap-2">
            <FaLink /> Başvuruyu Paylaş
          </h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100" aria-label="Kapat">
            <FaTimes />
          </button>
        </div>

        <div className="p-6">
          <p className="text-sm text-gray-600 mb-5">
            <span className="font-semibold text-gray-900">{candidateName}</span> — {position}
          </p>

          {/* Kapsam */}
          <fieldset className="mb-5">
            <legend className="text-sm font-semibold text-gray-700 mb-2">Paylaşım kapsamı</legend>
            <div className="space-y-2">
              <label className="flex items-start gap-3 p-3 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="scope"
                  className="mt-1"
                  checked={scope === 'ozet'}
                  onChange={() => setScope('ozet')}
                />
                <span>
                  <span className="block text-sm font-semibold text-gray-900">Özet</span>
                  <span className="block text-xs text-gray-600">
                    Eğitim, deneyim, beceriler, sertifikalar, referans adları. TC kimlik, adres,
                    iletişim ve sağlık bilgisi paylaşılmaz.
                  </span>
                </span>
              </label>
              <label className="flex items-start gap-3 p-3 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="scope"
                  className="mt-1"
                  checked={scope === 'tam'}
                  onChange={() => setScope('tam')}
                />
                <span>
                  <span className="block text-sm font-semibold text-gray-900">Tam kayıt</span>
                  <span className="block text-xs text-gray-600">
                    Kimlik, iletişim ve sağlık bilgileri dahil her şey. Yalnızca gerçekten gerekli
                    olduğunda kullanın.
                  </span>
                </span>
              </label>
            </div>
          </fieldset>

          {scope === 'tam' && (
            <div className="mb-5 rounded-lg bg-amber-50 border border-amber-300 px-3 py-2 text-xs text-amber-900">
              Tam kayıt TC kimlik numarası ve sağlık bilgisi içerir. Bu bağlantıyı yalnızca
              görmesi gereken kişiye gönderin; bağlantıyı alan herkes içeriği görebilir.
            </div>
          )}

          <div className="grid sm:grid-cols-2 gap-4 mb-5">
            <div>
              <label htmlFor="share-hours" className="block text-sm font-semibold text-gray-700 mb-1">
                Geçerlilik süresi
              </label>
              <select
                id="share-hours"
                value={hours}
                onChange={(e) => setHours(Number(e.target.value))}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {DURATIONS.map((d) => (
                  <option key={d.hours} value={d.hours}>
                    {d.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="share-note" className="block text-sm font-semibold text-gray-700 mb-1">
                Not (isteğe bağlı)
              </label>
              <input
                id="share-note"
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Kime, neden gönderildi"
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <label className="flex items-start gap-2 mb-5 text-sm text-gray-700">
            <input
              type="checkbox"
              className="mt-1"
              checked={includeCv}
              onChange={(e) => setIncludeCv(e.target.checked)}
            />
            <span>
              Özgeçmiş dosyası da paylaşılsın
              <span className="block text-xs text-gray-500">
                CV genellikle adayın telefon ve adresini içerir; özet paylaşımda bile bu bilgiler
                dosyanın içinden görünür.
              </span>
            </span>
          </label>

          {error && (
            <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-800">
              {error}
            </div>
          )}

          <button
            onClick={createLink}
            disabled={creating}
            className="w-full px-4 py-3 rounded-lg bg-primary text-white font-semibold hover:brightness-125 disabled:opacity-60"
          >
            {creating ? 'Bağlantı oluşturuluyor...' : 'Bağlantı Oluştur'}
          </button>

          {link && (
            <div className="mt-5 rounded-xl border border-green-300 bg-green-50 p-4">
              <p className="text-xs font-semibold text-green-900 mb-2">
                Bağlantı hazır — {formatDateTime(linkExpiresAt)} tarihine kadar geçerli
              </p>
              <div className="flex gap-2 mb-3">
                <input
                  readOnly
                  value={link}
                  onFocus={(e) => e.currentTarget.select()}
                  aria-label="Paylaşım bağlantısı"
                  className="flex-1 px-3 py-2 text-xs font-mono border border-gray-300 rounded-lg bg-white"
                />
                <button
                  onClick={copyLink}
                  className="px-3 py-2 rounded-lg bg-white border border-gray-300 hover:bg-gray-50 shrink-0"
                  aria-label="Bağlantıyı kopyala"
                >
                  {copied ? <FaCheck className="text-green-600" /> : <FaCopy />}
                </button>
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="WhatsApp numarası (0532 123 45 67)"
                  aria-label="WhatsApp numarası"
                  className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white"
                />
                <button
                  onClick={sendWhatsApp}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-green-600 text-white text-sm font-semibold hover:bg-green-700"
                >
                  <FaWhatsapp />
                  WhatsApp'ta Aç
                </button>
              </div>
              <p className="text-[11px] text-green-900/70 mt-2">
                WhatsApp mesajı hazır olarak açılır, göndermek için siz onaylarsınız. Numara
                girmeden bağlantıyı kopyalayıp istediğiniz yerden de gönderebilirsiniz.
              </p>
            </div>
          )}

          {/* Mevcut bağlantılar */}
          {shares.length > 0 && (
            <div className="mt-6">
              <h3 className="text-sm font-bold text-gray-700 mb-2">
                Bu başvuru için üretilen bağlantılar
              </h3>
              <ul className="space-y-2">
                {shares.map((s) => (
                  <li
                    key={s.id}
                    className={`rounded-lg border px-3 py-2 text-xs ${
                      isActive(s) ? 'border-gray-200 bg-white' : 'border-gray-200 bg-gray-50 opacity-70'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="font-semibold text-gray-900">
                          {s.scope === 'tam' ? 'Tam kayıt' : 'Özet'}
                          {s.include_cv && ' + CV'}
                          {' · '}
                          {isActive(s)
                            ? `${formatDateTime(s.expires_at)} tarihine kadar`
                            : s.revoked_at
                            ? 'İptal edildi'
                            : 'Süresi doldu'}
                        </div>
                        <div className="text-gray-500 mt-0.5">
                          {s.created_by_name} · {formatDateTime(s.created_at)}
                          {s.note && ` · ${s.note}`}
                        </div>
                        <div className="text-gray-500 mt-0.5 flex items-center gap-1">
                          <FaEye aria-hidden="true" />
                          {s.view_count} görüntüleme
                          {s.last_viewed_at && ` · son: ${formatDateTime(s.last_viewed_at)}`}
                        </div>
                      </div>
                      {isActive(s) && (
                        <button
                          onClick={() => revoke(s.id)}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded text-red-600 hover:bg-red-50 shrink-0"
                          title="Bağlantıyı iptal et"
                        >
                          <FaBan />
                          İptal
                        </button>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobApplicationShareModal;
