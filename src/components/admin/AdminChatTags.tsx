import { useState, useEffect } from 'react';
import {
  FaTag, FaPlus, FaEdit, FaTrash, FaTimes, FaSave, FaInfoCircle, FaFlask,
} from 'react-icons/fa';
import {
  ChatTag, fetchChatTags, saveChatTag, deleteChatTag,
} from '../../services/chatService';

/** Kural formunun boş hâli */
const emptyTag: Partial<ChatTag> = {
  name: '',
  color: '#0A6B7D',
  keywords: [],
  is_active: true,
  display_order: 0,
};

/**
 * Seçilebilir renkler. İlk 6'sı birbirinden ayırt edilebilirliği doğrulanmış
 * "kimlik" renkleri, sonraki 2'si dikkat durumları, sonuncusu nötr.
 * Palet bilerek kısa: 8'den fazla renk renk körlüğünde birbirine karışır,
 * o noktadan sonra kimliği rozetin yazısı taşır. Bkz.
 * src/sql/live_chat_tags_stats_migration.sql
 */
const PALETTE = [
  '#1F5FBF', '#0F97AE', '#2D8A5E', '#A5711A', '#7C3AED', '#DB2777',
  '#DC2626', '#EA580C', '#64748B',
];

/**
 * Türkçe metni SQL tarafındaki chat_normalize() ile aynı şekilde sadeleştirir.
 * Önizlemenin veritabanı davranışıyla birebir aynı sonucu vermesi için
 * iki tarafın da aynı kuralı uygulaması şart.
 */
const normalize = (text: string): string =>
  (text || '')
    .replace(/[ÇĞİIÖŞÜÂÎÛçğıöşüâîû]/g, (ch) => {
      const map: Record<string, string> = {
        Ç: 'C', Ğ: 'G', İ: 'I', I: 'I', Ö: 'O', Ş: 'S', Ü: 'U',
        Â: 'A', Î: 'I', Û: 'U', ç: 'c', ğ: 'g', ı: 'i', ö: 'o',
        ş: 's', ü: 'u', â: 'a', î: 'i', û: 'u',
      };
      return map[ch] ?? ch;
    })
    .toLowerCase();

const AdminChatTags = () => {
  const [tags, setTags] = useState<ChatTag[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<Partial<ChatTag>>(emptyTag);
  const [keywordDraft, setKeywordDraft] = useState('');
  const [testText, setTestText] = useState('');

  const load = async () => {
    try {
      setTags(await fetchChatTags());
    } catch (err) {
      console.error('Etiketler yüklenemedi:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const resetForm = () => {
    setForm(emptyTag);
    setKeywordDraft('');
    setShowForm(false);
  };

  const addKeyword = () => {
    const value = keywordDraft.trim();
    if (!value) return;
    const list = form.keywords || [];
    if (list.some((k) => normalize(k) === normalize(value))) {
      setKeywordDraft('');
      return;
    }
    setForm({ ...form, keywords: [...list, value] });
    setKeywordDraft('');
  };

  const handleSave = async () => {
    if (!form.name?.trim()) {
      alert('Etiket adı zorunludur.');
      return;
    }
    if ((form.keywords || []).length === 0) {
      alert('En az bir anahtar kelime ekleyin, aksi hâlde etiket hiç atanmaz.');
      return;
    }

    setSaving(true);
    try {
      await saveChatTag({ ...form, name: form.name.trim() });
      resetForm();
      await load();
    } catch (err) {
      const message = (err as { code?: string; message?: string });
      alert(
        message.code === '23505'
          ? 'Bu adda bir etiket zaten var.'
          : 'Kaydedilemedi: ' + message.message,
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (tag: ChatTag) => {
    if (
      !confirm(
        `"${tag.name}" kuralı silinecek.\n\nDaha önce bu etiketi almış görüşmelerdeki rozet kalır, ` +
          'ancak yeni mesajlar bu etiketi almaz.',
      )
    ) {
      return;
    }
    try {
      await deleteChatTag(tag.id);
      await load();
    } catch (err) {
      console.error('Etiket silinemedi:', err);
      alert('Etiket silinemedi.');
    }
  };

  const toggleActive = async (tag: ChatTag) => {
    try {
      await saveChatTag({ ...tag, is_active: !tag.is_active });
      await load();
    } catch (err) {
      console.error('Güncellenemedi:', err);
    }
  };

  // Test kutusuna yazılan metin hangi etiketleri tetiklerdi?
  const testNorm = normalize(testText);
  const testMatches = testText.trim()
    ? tags.filter(
        (t) =>
          t.is_active &&
          t.keywords.some((k) => normalize(k).trim() && testNorm.includes(normalize(k))),
      )
    : [];

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="flex items-center gap-3 text-2xl font-semibold text-primary">
          <FaTag className="text-ocean" /> Canlı Destek Etiketleri
        </h1>
        <button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="flex items-center rounded-lg bg-primary px-4 py-2 text-white transition-colors hover:bg-primary-light"
        >
          <FaPlus className="mr-2" /> Yeni Etiket
        </button>
      </div>

      <div className="mb-6 flex gap-3 rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900">
        <FaInfoCircle className="mt-0.5 flex-shrink-0 text-blue-500" />
        <div className="space-y-1">
          <p>
            Ziyaretçi bir mesaj yazdığında, aşağıdaki anahtar kelimelerden herhangi biri
            mesajın içinde geçiyorsa görüşme <strong>otomatik olarak</strong> o etiketi alır.
            Bir görüşme birden fazla etiket alabilir.
          </p>
          <p>
            Eşleşme büyük/küçük harf ve Türkçe karakter farkı gözetmez —
            <strong> “görüş”</strong> yazmanız <em>Görüş, GÖRÜŞ, gorus</em> hepsini yakalar.
            Kelime metnin herhangi bir yerinde geçebilir.
          </p>
          <p>
            Yalnızca <strong>ziyaretçi</strong> mesajları değerlendirilir; operatörün yazdıkları
            etiket tetiklemez. Operatör panodan etiketi elle ekleyip kaldırabilir.
          </p>
        </div>
      </div>

      {/* --- Kural testi --- */}
      <div className="mb-6 rounded-lg bg-white p-5 shadow-sm">
        <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-800">
          <FaFlask className="text-ocean" /> Kuralları Deneyin
        </h2>
        <input
          value={testText}
          onChange={(e) => setTestText(e.target.value)}
          placeholder="Örnek: Tüp mide ameliyatı fiyatı ne kadar, SGK karşılıyor mu?"
          className="w-full rounded-lg border border-gray-200 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {!testText.trim() ? (
            <span className="text-xs text-gray-400">
              Bir ziyaretçi mesajı yazın, hangi etiketleri alacağını gösterelim.
            </span>
          ) : testMatches.length === 0 ? (
            <span className="text-xs text-gray-400">
              Bu metin hiçbir kuralla eşleşmiyor — görüşme etiketsiz kalırdı.
            </span>
          ) : (
            testMatches.map((t) => (
              <span
                key={t.id}
                className="rounded-full px-3 py-1 text-xs font-semibold"
                style={{ backgroundColor: `${t.color}1A`, color: t.color }}
              >
                {t.name}
              </span>
            ))
          )}
        </div>
      </div>

      {/* --- Form --- */}
      {showForm && (
        <div className="mb-6 rounded-lg bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">
              {form.id ? 'Etiketi Düzenle' : 'Yeni Etiket'}
            </h2>
            <button onClick={resetForm} className="text-gray-400 hover:text-gray-600">
              <FaTimes />
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Etiket Adı
              </label>
              <input
                value={form.name || ''}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Örn: Obezite"
                className="w-full rounded-lg border border-gray-200 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Renk</label>
              <div className="flex flex-wrap gap-2">
                {PALETTE.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setForm({ ...form, color: c })}
                    aria-label={`Renk ${c}`}
                    aria-pressed={form.color === c}
                    className={`h-9 w-9 rounded-lg transition-transform ${
                      form.color === c ? 'scale-110 ring-2 ring-slate-800 ring-offset-2' : ''
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="mt-4">
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Anahtar Kelimeler
            </label>
            <p className="mb-2 text-xs text-gray-400">
              Her biri tek başına yeterlidir (VEYA mantığı). Kısa ve ayırt edici tutun —
              “mide” gibi çok genel bir kelime yanlış etiketlemeye yol açar.
            </p>

            <div className="mb-3 flex flex-wrap gap-2">
              {(form.keywords || []).map((k) => (
                <span
                  key={k}
                  className="flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 text-sm text-slate-700"
                >
                  {k}
                  <button
                    type="button"
                    onClick={() =>
                      setForm({
                        ...form,
                        keywords: (form.keywords || []).filter((x) => x !== k),
                      })
                    }
                    aria-label={`"${k}" kelimesini kaldır`}
                    className="text-slate-400 hover:text-coral"
                  >
                    <FaTimes size={11} />
                  </button>
                </span>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                value={keywordDraft}
                onChange={(e) => setKeywordDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addKeyword();
                  }
                }}
                placeholder="Kelime veya kelime grubu yazıp Enter'a basın"
                className="flex-1 rounded-lg border border-gray-200 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              <button
                type="button"
                onClick={addKeyword}
                className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm text-white hover:bg-primary-light"
              >
                <FaPlus size={12} /> Ekle
              </button>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Sıra</label>
              <input
                type="number"
                value={form.display_order ?? 0}
                onChange={(e) =>
                  setForm({ ...form, display_order: parseInt(e.target.value, 10) || 0 })
                }
                className="w-full rounded-lg border border-gray-200 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div className="flex items-end">
              <label className="flex cursor-pointer items-center gap-3">
                <input
                  type="checkbox"
                  checked={form.is_active ?? true}
                  onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                  className="h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <span className="text-sm text-gray-700">Aktif</span>
              </label>
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button
              onClick={resetForm}
              className="rounded-lg border border-gray-200 px-4 py-2 text-gray-600 hover:bg-gray-50"
            >
              İptal
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center rounded-lg bg-primary px-4 py-2 text-white hover:bg-primary-light disabled:opacity-60"
            >
              <FaSave className="mr-2" /> {saving ? 'Kaydediliyor...' : 'Kaydet'}
            </button>
          </div>
        </div>
      )}

      {/* --- Liste --- */}
      <div className="overflow-hidden rounded-lg bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-gray-500">
            <tr>
              <th className="px-4 py-3 font-medium">Etiket</th>
              <th className="px-4 py-3 font-medium">Anahtar Kelimeler</th>
              <th className="px-4 py-3 text-center font-medium">Durum</th>
              <th className="px-4 py-3 text-right font-medium">İşlem</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {tags.map((t) => (
              <tr key={t.id} className={t.is_active ? '' : 'opacity-50'}>
                <td className="px-4 py-3">
                  <span
                    className="rounded-full px-3 py-1 text-xs font-semibold"
                    style={{ backgroundColor: `${t.color}1A`, color: t.color }}
                  >
                    {t.name}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {t.keywords.slice(0, 6).map((k) => (
                      <span
                        key={k}
                        className="rounded bg-slate-100 px-1.5 py-0.5 text-[11px] text-slate-600"
                      >
                        {k}
                      </span>
                    ))}
                    {t.keywords.length > 6 && (
                      <span className="text-[11px] text-slate-400">
                        +{t.keywords.length - 6} tane
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 text-center">
                  <button
                    onClick={() => toggleActive(t)}
                    className={`rounded-full px-2 py-1 text-xs font-medium ${
                      t.is_active
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {t.is_active ? 'Aktif' : 'Pasif'}
                  </button>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => {
                        setForm(t);
                        setShowForm(true);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      aria-label={`${t.name} etiketini düzenle`}
                      className="rounded-lg p-2 text-blue-600 hover:bg-blue-50"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => handleDelete(t)}
                      aria-label={`${t.name} etiketini sil`}
                      className="rounded-lg p-2 text-red-600 hover:bg-red-50"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {tags.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-12 text-center text-gray-400">
                  Henüz etiket kuralı yok.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminChatTags;
