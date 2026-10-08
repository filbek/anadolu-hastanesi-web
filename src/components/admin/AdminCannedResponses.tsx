import { useState, useEffect } from 'react';
import {
  FaBolt, FaPlus, FaEdit, FaTrash, FaTimes, FaSave, FaInfoCircle,
} from 'react-icons/fa';
import {
  CannedResponse, fetchCannedResponses, saveCannedResponse, deleteCannedResponse,
} from '../../services/chatService';

const emptyItem: Partial<CannedResponse> = {
  shortcut: '',
  title: '',
  content: '',
  category: '',
  display_order: 0,
  is_active: true,
};

const AdminCannedResponses = () => {
  const [items, setItems] = useState<CannedResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<Partial<CannedResponse>>(emptyItem);

  const load = async () => {
    try {
      setItems(await fetchCannedResponses());
    } catch (err) {
      console.error('Hazır yanıtlar yüklenemedi:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const resetForm = () => {
    setForm(emptyItem);
    setShowForm(false);
  };

  const handleSave = async () => {
    if (!form.shortcut?.trim() || !form.title?.trim() || !form.content?.trim()) {
      alert('Kısayol, başlık ve metin alanlarının hepsi zorunludur.');
      return;
    }

    setSaving(true);
    try {
      await saveCannedResponse(form);
      resetForm();
      await load();
    } catch (err) {
      const e = err as { code?: string; message?: string };
      alert(
        e.code === '23505'
          ? 'Bu kısayol zaten kullanılıyor.'
          : 'Kaydedilemedi: ' + e.message,
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (item: CannedResponse) => {
    if (!confirm(`"${item.title}" hazır yanıtı silinsin mi?`)) return;
    try {
      await deleteCannedResponse(item.id);
      await load();
    } catch (err) {
      console.error('Silinemedi:', err);
      alert('Silinemedi.');
    }
  };

  const toggleActive = async (item: CannedResponse) => {
    try {
      await saveCannedResponse({ ...item, is_active: !item.is_active });
      await load();
    } catch (err) {
      console.error('Güncellenemedi:', err);
    }
  };

  // Kategoriye göre grupla — liste uzadıkça okunabilir kalsın
  const grouped = items.reduce<Record<string, CannedResponse[]>>((acc, item) => {
    const key = item.category || 'Diğer';
    (acc[key] ||= []).push(item);
    return acc;
  }, {});

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
          <FaBolt className="text-ocean" /> Hazır Yanıtlar
        </h1>
        <button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="flex items-center rounded-lg bg-primary px-4 py-2 text-white transition-colors hover:bg-primary-light"
        >
          <FaPlus className="mr-2" /> Yeni Yanıt
        </button>
      </div>

      <div className="mb-6 flex gap-3 rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900">
        <FaInfoCircle className="mt-0.5 flex-shrink-0 text-blue-500" />
        <div className="space-y-1">
          <p>
            Operatör, Canlı Destek ekranında yanıt kutusuna <strong>/</strong> yazınca bu
            liste açılır. Kısayolun ilk harflerini yazıp <strong>↑↓</strong> ile seçer,
            <strong> Enter</strong> veya <strong>Tab</strong> ile metni kutuya basar.
          </p>
          <p>
            Kısayolu kısa ve akılda kalıcı tutun: <code>/randevu</code>,{' '}
            <code>/sgk</code>, <code>/bekle</code> gibi. Metin gönderilmeden önce
            düzenlenebilir — hastaya özel kısmı ekleyip yollayabilirsiniz.
          </p>
        </div>
      </div>

      {showForm && (
        <div className="mb-6 rounded-lg bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">
              {form.id ? 'Yanıtı Düzenle' : 'Yeni Hazır Yanıt'}
            </h2>
            <button onClick={resetForm} className="text-gray-400 hover:text-gray-600">
              <FaTimes />
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Kısayol
              </label>
              <div className="flex items-center rounded-lg border border-gray-200 focus-within:ring-2 focus-within:ring-primary/20">
                <span className="pl-3 font-mono text-gray-400">/</span>
                <input
                  value={form.shortcut || ''}
                  onChange={(e) => setForm({ ...form, shortcut: e.target.value })}
                  placeholder="randevu"
                  className="w-full rounded-lg px-2 py-2 font-mono text-sm outline-none"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Başlık</label>
              <input
                value={form.title || ''}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Randevu yönlendirme"
                className="w-full rounded-lg border border-gray-200 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Kategori
              </label>
              <input
                value={form.category || ''}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                placeholder="Randevu"
                list="canned-categories"
                className="w-full rounded-lg border border-gray-200 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              <datalist id="canned-categories">
                {Object.keys(grouped).map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </div>
          </div>

          <div className="mt-4">
            <label className="mb-1 block text-sm font-medium text-gray-700">Metin</label>
            <textarea
              rows={5}
              value={form.content || ''}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              placeholder="Ziyaretçiye gönderilecek metin..."
              className="w-full resize-y rounded-lg border border-gray-200 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            <p className="mt-1 text-xs text-gray-400">
              Satır sonları korunur. Metin gönderilmeden önce operatör tarafından
              düzenlenebilir.
            </p>
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

      <div className="space-y-6">
        {Object.entries(grouped).map(([category, list]) => (
          <div key={category}>
            <h2 className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-400">
              {category}
            </h2>
            <div className="overflow-hidden rounded-lg bg-white shadow-sm">
              <ul className="divide-y divide-gray-100">
                {list.map((item) => (
                  <li
                    key={item.id}
                    className={`flex items-start gap-4 p-4 ${
                      item.is_active ? '' : 'opacity-50'
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded bg-slate-100 px-2 py-0.5 font-mono text-xs text-slate-600">
                          /{item.shortcut}
                        </span>
                        <span className="text-sm font-semibold text-slate-800">
                          {item.title}
                        </span>
                        {item.use_count > 0 && (
                          <span className="text-[11px] text-slate-400">
                            {item.use_count} kez kullanıldı
                          </span>
                        )}
                      </div>
                      <p className="mt-1.5 whitespace-pre-wrap text-xs leading-relaxed text-slate-500">
                        {item.content}
                      </p>
                    </div>

                    <div className="flex flex-shrink-0 items-center gap-2">
                      <button
                        onClick={() => toggleActive(item)}
                        className={`rounded-full px-2 py-1 text-xs font-medium ${
                          item.is_active
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        {item.is_active ? 'Aktif' : 'Pasif'}
                      </button>
                      <button
                        onClick={() => {
                          setForm(item);
                          setShowForm(true);
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        aria-label={`${item.title} yanıtını düzenle`}
                        className="rounded-lg p-2 text-blue-600 hover:bg-blue-50"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleDelete(item)}
                        aria-label={`${item.title} yanıtını sil`}
                        className="rounded-lg p-2 text-red-600 hover:bg-red-50"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}

        {items.length === 0 && (
          <div className="rounded-lg bg-white p-12 text-center text-gray-400 shadow-sm">
            Henüz hazır yanıt yok.
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminCannedResponses;
