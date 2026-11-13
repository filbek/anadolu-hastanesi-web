import { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import {
  FaPlus, FaEdit, FaTrash, FaSave, FaTimes, FaEye, FaEyeSlash, FaSpinner,
  FaQrcode, FaDownload, FaExternalLinkAlt, FaCopy, FaCheck,
} from 'react-icons/fa';
import { supabase } from '../../lib/supabase';
import type { Interpreter } from '../../lib/interpreters';
import { INTERPRETERS_PATH, formatPhone, splitLanguages } from '../../lib/interpreters';

/** QR'ın her zaman canlı siteyi göstermesi için sabit alan adı (yerelde açılsa bile) */
const PUBLIC_SITE = 'https://www.anadoluhastaneleri.com';
const PUBLIC_URL = `${PUBLIC_SITE}${INTERPRETERS_PATH}`;

type FormState = { name: string; languages: string; phone: string; display_order: number; is_active: boolean };
const emptyForm: FormState = { name: '', languages: '', phone: '', display_order: 0, is_active: true };

const AdminInterpreters = () => {
  const [items, setItems] = useState<Interpreter[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<number | 'new' | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchItems();
    QRCode.toDataURL(PUBLIC_URL, { width: 1024, margin: 2, errorCorrectionLevel: 'M' })
      .then(setQrDataUrl)
      .catch((e) => console.error('QR error:', e));
  }, []);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('interpreters')
        .select('*')
        .order('display_order', { ascending: true })
        .order('name', { ascending: true });
      if (error) throw error;
      setItems((data || []) as Interpreter[]);
    } catch (error) {
      console.error('Error fetching interpreters:', error);
    } finally {
      setLoading(false);
    }
  };

  const startNew = () => {
    const nextOrder = items.reduce((m, i) => Math.max(m, i.display_order || 0), 0) + 1;
    setForm({ ...emptyForm, display_order: nextOrder });
    setEditingId('new');
  };

  const startEdit = (item: Interpreter) => {
    setForm({
      name: item.name,
      languages: item.languages,
      phone: item.phone,
      display_order: item.display_order,
      is_active: item.is_active,
    });
    setEditingId(item.id);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm(emptyForm);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      alert('Lütfen isim girin.');
      return;
    }
    try {
      setSaving(true);
      const payload = {
        name: form.name.trim(),
        // Etiketler virgülle ayrılır; fazla boşlukları temizle
        languages: splitLanguages(form.languages).join(', '),
        phone: form.phone.trim() ? formatPhone(form.phone) : '',
        display_order: Number(form.display_order) || 0,
        is_active: form.is_active,
        updated_at: new Date().toISOString(),
      };
      if (editingId === 'new') {
        const { error } = await supabase.from('interpreters').insert([payload]);
        if (error) throw error;
      } else if (editingId) {
        const { error } = await supabase.from('interpreters').update(payload).eq('id', editingId);
        if (error) throw error;
      }
      cancelEdit();
      await fetchItems();
    } catch (error: any) {
      console.error('Error saving interpreter:', error);
      alert('Kaydedilirken hata oluştu: ' + (error?.message || ''));
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (item: Interpreter) => {
    const { error } = await supabase
      .from('interpreters')
      .update({ is_active: !item.is_active, updated_at: new Date().toISOString() })
      .eq('id', item.id);
    if (error) {
      alert('Güncellenemedi: ' + error.message);
      return;
    }
    setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, is_active: !i.is_active } : i)));
  };

  const handleDelete = async (item: Interpreter) => {
    if (!confirm(`"${item.name}" listeden kalıcı olarak silinsin mi? Geçici olarak gizlemek için göz simgesini kullanabilirsiniz.`)) return;
    const { error } = await supabase.from('interpreters').delete().eq('id', item.id);
    if (error) {
      alert('Silinemedi: ' + error.message);
      return;
    }
    setItems((prev) => prev.filter((i) => i.id !== item.id));
  };

  const downloadSvg = async () => {
    try {
      const svg = await QRCode.toString(PUBLIC_URL, { type: 'svg', margin: 2, errorCorrectionLevel: 'M' });
      const url = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = 'tercumanlar-qr.svg';
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('QR SVG error:', e);
    }
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(PUBLIC_URL);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* pano izni yoksa sessizce geç */
    }
  };

  const inputClass =
    'w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary';

  const renderForm = () => (
    <form onSubmit={handleSave} className="bg-white rounded-lg shadow-sm p-5 mb-6 border border-primary/20">
      <h2 className="text-lg font-semibold text-primary mb-4">
        {editingId === 'new' ? 'Yeni Tercüman / Danışman' : 'Kaydı Düzenle'}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="int-name">İsim *</label>
          <input id="int-name" className={inputClass} value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="int-phone">Telefon</label>
          <input id="int-phone" className={inputClass} value={form.phone} placeholder="0537 303 69 19"
            onChange={(e) => setForm({ ...form, phone: e.target.value })} inputMode="tel" />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="int-langs">Dil / Bölge Desteği</label>
          <input id="int-langs" className={inputClass} value={form.languages}
            placeholder="Örn: İngilizce, Rusça, Gürcistan"
            onChange={(e) => setForm({ ...form, languages: e.target.value })} />
          <p className="mt-1 text-xs text-gray-400">Virgülle ayırın; her biri sayfada ayrı etiket olarak görünür.</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="int-order">Sıra</label>
          <input id="int-order" type="number" className={inputClass} value={form.display_order}
            onChange={(e) => setForm({ ...form, display_order: Number(e.target.value) })} />
        </div>
        <div className="flex items-end">
          <label className="inline-flex items-center gap-2 text-sm text-gray-700 pb-2">
            <input type="checkbox" checked={form.is_active}
              onChange={(e) => setForm({ ...form, is_active: e.target.checked })} />
            Sayfada göster
          </label>
        </div>
      </div>
      <div className="mt-5 flex gap-3 justify-end">
        <button type="button" onClick={cancelEdit}
          className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 inline-flex items-center gap-2">
          <FaTimes /> Vazgeç
        </button>
        <button type="submit" disabled={saving}
          className="px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary-dark inline-flex items-center gap-2 disabled:opacity-50">
          {saving ? <FaSpinner className="animate-spin" /> : <FaSave />} Kaydet
        </button>
      </div>
    </form>
  );

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
        <h1 className="text-2xl font-semibold text-primary">Tercümanlar / Danışmanlar</h1>
        {editingId === null && (
          <button onClick={startNew}
            className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark inline-flex items-center gap-2">
            <FaPlus /> Yeni Ekle
          </button>
        )}
      </div>

      {/* QR kod kartı */}
      <div className="bg-white rounded-lg shadow-sm p-5 mb-6 flex flex-col md:flex-row gap-6 items-start">
        {qrDataUrl ? (
          <img src={qrDataUrl} alt="Tercüman listesi QR kodu" className="w-40 h-40 border border-gray-200 rounded-lg" />
        ) : (
          <div className="w-40 h-40 flex items-center justify-center border border-gray-200 rounded-lg">
            <FaSpinner className="animate-spin text-primary" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h2 className="text-lg font-semibold text-primary flex items-center gap-2">
            <FaQrcode /> Banko Görseli için QR Kod
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Bu QR kod aşağıdaki sayfayı açar. Sayfa sitede hiçbir menüde yer almaz ve arama motorlarına kapalıdır.
            Listede yaptığınız değişiklikler sayfaya hemen yansır; QR kodu yeniden basmanız gerekmez.
          </p>
          <p className="mt-3 font-mono text-sm bg-gray-50 border border-gray-200 rounded px-3 py-2 break-all">{PUBLIC_URL}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <a href={qrDataUrl} download="tercumanlar-qr.png"
              className={`px-3 py-2 rounded-lg bg-primary text-white text-sm inline-flex items-center gap-2 hover:bg-primary-dark ${qrDataUrl ? '' : 'pointer-events-none opacity-50'}`}>
              <FaDownload /> PNG indir
            </a>
            <button type="button" onClick={downloadSvg}
              className="px-3 py-2 rounded-lg border border-primary text-primary text-sm inline-flex items-center gap-2 hover:bg-primary/5">
              <FaDownload /> SVG indir (baskı için)
            </button>
            <button type="button" onClick={copyLink}
              className="px-3 py-2 rounded-lg border border-gray-300 text-gray-700 text-sm inline-flex items-center gap-2 hover:bg-gray-50">
              {copied ? <FaCheck /> : <FaCopy />} {copied ? 'Kopyalandı' : 'Linki kopyala'}
            </button>
            <a href={INTERPRETERS_PATH} target="_blank" rel="noopener noreferrer"
              className="px-3 py-2 rounded-lg border border-gray-300 text-gray-700 text-sm inline-flex items-center gap-2 hover:bg-gray-50">
              <FaExternalLinkAlt /> Sayfayı aç
            </a>
          </div>
        </div>
      </div>

      {editingId !== null && renderForm()}

      <div className="bg-white rounded-lg shadow-sm overflow-x-auto">
        {loading ? (
          <div className="flex justify-center py-16"><FaSpinner className="animate-spin text-primary text-2xl" /></div>
        ) : items.length === 0 ? (
          <p className="text-center text-gray-500 py-12">Henüz kayıt yok. "Yeni Ekle" ile başlayın.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600 text-left">
              <tr>
                <th className="px-4 py-3 w-14">Sıra</th>
                <th className="px-4 py-3">İsim</th>
                <th className="px-4 py-3">Dil / Bölge</th>
                <th className="px-4 py-3">Telefon</th>
                <th className="px-4 py-3 text-right">İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className={`border-t border-gray-100 ${item.is_active ? '' : 'opacity-50'}`}>
                  <td className="px-4 py-3 text-gray-500">{item.display_order}</td>
                  <td className="px-4 py-3 font-medium text-gray-800">
                    {item.name}
                    {!item.is_active && <span className="ml-2 text-xs text-gray-500">(gizli)</span>}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {splitLanguages(item.languages).map((l) => (
                        <span key={l} className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs">{l}</span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">{item.phone}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-3 text-base">
                      <button type="button" onClick={() => toggleActive(item)}
                        className="text-gray-500 hover:text-primary"
                        title={item.is_active ? 'Sayfada gizle' : 'Sayfada göster'}
                        aria-label={item.is_active ? `${item.name}: gizle` : `${item.name}: göster`}>
                        {item.is_active ? <FaEye /> : <FaEyeSlash />}
                      </button>
                      <button type="button" onClick={() => startEdit(item)}
                        className="text-blue-600 hover:text-blue-800" title="Düzenle" aria-label={`${item.name}: düzenle`}>
                        <FaEdit />
                      </button>
                      <button type="button" onClick={() => handleDelete(item)}
                        className="text-red-600 hover:text-red-800" title="Sil" aria-label={`${item.name}: sil`}>
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AdminInterpreters;
