import { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaTimes, FaSave, FaWhatsapp, FaPaperPlane, FaInfoCircle } from 'react-icons/fa';
import { supabase } from '../../lib/supabase';
import { useHospitals } from '../../hooks/useHospitals';
import type { FormType } from '../../services/emailService';
import {
  NotificationRoute,
  FORM_TYPE_LABELS,
  normalizeWhatsAppNumber,
  buildWhatsAppUrl,
  openWhatsApp,
} from '../../services/whatsappService';

const FORM_TYPES: FormType[] = ['second_opinion', 'contact', 'feedback'];

const ALL_BRANCHES = '__all__';

type RouteForm = Omit<NotificationRoute, 'id'>;

const emptyForm: RouteForm = {
  form_type: 'second_opinion',
  hospital_name: null,
  whatsapp_number: '',
  label: '',
  priority: 0,
  is_active: true,
};

const AdminWhatsAppRouting = () => {
  const { data: hospitals = [] } = useHospitals();
  const [routes, setRoutes] = useState<NotificationRoute[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<RouteForm>(emptyForm);

  const loadRoutes = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('notification_routes')
      .select('*')
      .order('form_type', { ascending: true })
      .order('priority', { ascending: false });

    if (error) {
      console.error('Yönlendirme kuralları yüklenemedi:', error);
    }
    setRoutes((data || []) as NotificationRoute[]);
    setLoading(false);
  };

  useEffect(() => {
    loadRoutes();
  }, []);

  const resetForm = () => {
    setFormData(emptyForm);
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (route: NotificationRoute) => {
    const { id, ...rest } = route;
    setFormData(rest);
    setEditingId(id ?? null);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Bu yönlendirme kuralını silmek istediğinizden emin misiniz?')) return;
    const { error } = await supabase.from('notification_routes').delete().eq('id', id);
    if (error) {
      alert('Silinirken hata oluştu: ' + error.message);
      return;
    }
    await loadRoutes();
  };

  const toggleActive = async (route: NotificationRoute) => {
    const { error } = await supabase
      .from('notification_routes')
      .update({ is_active: !route.is_active, updated_at: new Date().toISOString() })
      .eq('id', route.id);
    if (error) {
      alert('Güncellenirken hata oluştu: ' + error.message);
      return;
    }
    await loadRoutes();
  };

  const handleSubmit = async () => {
    const normalized = normalizeWhatsAppNumber(formData.whatsapp_number);
    if (normalized.length < 10) {
      alert('Geçerli bir WhatsApp numarası girin. Örnek: 0532 123 45 67 veya +90 532 123 45 67');
      return;
    }

    setSaving(true);
    const payload = {
      ...formData,
      whatsapp_number: normalized,
      hospital_name: formData.hospital_name || null,
      label: formData.label?.trim() || null,
      updated_at: new Date().toISOString(),
    };

    const { error } = editingId
      ? await supabase.from('notification_routes').update(payload).eq('id', editingId)
      : await supabase.from('notification_routes').insert([payload]);

    setSaving(false);

    if (error) {
      // Aynı form + şube + numara kombinasyonu tekrar eklenirse benzersizlik indexi hata verir
      alert(
        error.code === '23505'
          ? 'Bu form ve şube için bu numara zaten tanımlı.'
          : 'Kaydedilirken hata oluştu: ' + error.message,
      );
      return;
    }

    resetForm();
    await loadRoutes();
  };

  const handleTest = (route: NotificationRoute) => {
    const url = buildWhatsAppUrl(route.whatsapp_number, route.form_type, {
      name: 'Test Kullanıcı',
      email: 'test@example.com',
      phone: '0555 000 00 00',
      hospital: route.hospital_name || 'Tüm Şubeler',
      message: 'Bu bir test mesajıdır, dikkate almayınız.',
    });
    openWhatsApp(url);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-primary flex items-center gap-3">
          <FaWhatsapp className="text-green-500" /> WhatsApp Yönlendirme
        </h1>
        <button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors flex items-center"
        >
          <FaPlus className="mr-2" /> Yeni Kural
        </button>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex gap-3 text-sm text-blue-900">
        <FaInfoCircle className="flex-shrink-0 mt-0.5 text-blue-500" />
        <div className="space-y-1">
          <p>
            Ziyaretçi formu gönderdiğinde başvuru veritabanına kaydedilir ve ekranda
            <strong> “WhatsApp'tan Gönder”</strong> butonu çıkar. Butona basınca, aşağıda
            eşleşen numaraya form detayları hazır doldurulmuş bir WhatsApp konuşması açılır.
          </p>
          <p>
            <strong>Şube boş bırakılırsa</strong> o form tipinin varsayılan numarası olur.
            Şubeye özel kural her zaman varsayılanın önüne geçer. WhatsApp linki tek numara
            desteklediği için aynı form ve şubede birden fazla kural varsa
            <strong> önceliği en yüksek olan</strong> kullanılır.
          </p>
        </div>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">
              {editingId ? 'Kuralı Düzenle' : 'Yeni Yönlendirme Kuralı'}
            </h2>
            <button onClick={resetForm} className="text-gray-400 hover:text-gray-600">
              <FaTimes />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Form Tipi</label>
              <select
                value={formData.form_type}
                onChange={(e) => setFormData({ ...formData, form_type: e.target.value as FormType })}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {FORM_TYPES.map((ft) => (
                  <option key={ft} value={ft}>
                    {FORM_TYPE_LABELS[ft]}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Şube</label>
              <select
                value={formData.hospital_name || ALL_BRANCHES}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    hospital_name: e.target.value === ALL_BRANCHES ? null : e.target.value,
                  })
                }
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value={ALL_BRANCHES}>Tüm Şubeler (varsayılan)</option>
                {hospitals.map((h) => (
                  <option key={h.id} value={h.name}>
                    {h.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                WhatsApp Numarası
              </label>
              <input
                type="tel"
                value={formData.whatsapp_number}
                onChange={(e) => setFormData({ ...formData, whatsapp_number: e.target.value })}
                placeholder="0532 123 45 67"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <p className="text-xs text-gray-400 mt-1">
                Ülke kodsuz girerseniz otomatik olarak +90 eklenir.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Etiket (yalnızca panelde görünür)
              </label>
              <input
                type="text"
                value={formData.label || ''}
                onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                placeholder="Örn: Silivri Çağrı Merkezi"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Öncelik</label>
              <input
                type="number"
                value={formData.priority}
                onChange={(e) =>
                  setFormData({ ...formData, priority: parseInt(e.target.value, 10) || 0 })
                }
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <p className="text-xs text-gray-400 mt-1">
                Yüksek sayı önce gelir. Tek kural varsa 0 bırakabilirsiniz.
              </p>
            </div>

            <div className="flex items-end">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <span className="text-sm text-gray-700">Aktif</span>
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={resetForm}
              className="px-4 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50"
            >
              İptal
            </button>
            <button
              onClick={handleSubmit}
              disabled={saving}
              className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors flex items-center disabled:opacity-60"
            >
              <FaSave className="mr-2" /> {saving ? 'Kaydediliyor...' : 'Kaydet'}
            </button>
          </div>
        </div>
      )}

      {routes.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center text-gray-400">
          <FaWhatsapp className="mx-auto text-4xl mb-3 text-gray-300" />
          <p>Henüz yönlendirme kuralı yok.</p>
          <p className="text-sm mt-1">
            Kural tanımlanmayan formlar eskisi gibi e-posta ile bildirilmeye devam eder.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 text-left">
                <tr>
                  <th className="px-4 py-3 font-medium">Form</th>
                  <th className="px-4 py-3 font-medium">Şube</th>
                  <th className="px-4 py-3 font-medium">WhatsApp</th>
                  <th className="px-4 py-3 font-medium">Etiket</th>
                  <th className="px-4 py-3 font-medium text-center">Öncelik</th>
                  <th className="px-4 py-3 font-medium text-center">Durum</th>
                  <th className="px-4 py-3 font-medium text-right">İşlem</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {routes.map((route) => (
                  <tr key={route.id} className={route.is_active ? '' : 'opacity-50'}>
                    <td className="px-4 py-3 font-medium text-secondary">
                      {FORM_TYPE_LABELS[route.form_type] || route.form_type}
                    </td>
                    <td className="px-4 py-3">
                      {route.hospital_name || (
                        <span className="text-gray-400 italic">Tüm Şubeler</span>
                      )}
                    </td>
                    <td className="px-4 py-3 font-mono">+{route.whatsapp_number}</td>
                    <td className="px-4 py-3 text-gray-500">{route.label || '—'}</td>
                    <td className="px-4 py-3 text-center">{route.priority}</td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => toggleActive(route)}
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          route.is_active
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        {route.is_active ? 'Aktif' : 'Pasif'}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleTest(route)}
                          title="Test mesajı gönder"
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                        >
                          <FaPaperPlane />
                        </button>
                        <button
                          onClick={() => handleEdit(route)}
                          title="Düzenle"
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => route.id && handleDelete(route.id)}
                          title="Sil"
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminWhatsAppRouting;
