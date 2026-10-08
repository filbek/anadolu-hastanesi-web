import { useState, useEffect } from 'react';
import {
  FaHeadset, FaPlus, FaEdit, FaTrash, FaTimes, FaSave, FaInfoCircle,
  FaCircle, FaUserShield,
} from 'react-icons/fa';
import { supabase } from '../../lib/supabase';
import {
  ChatAgent, AvailableAgent, AgentRole, AgentStatus,
  fetchChatAgents, fetchAvailableAgents, saveChatAgent, removeChatAgent,
  AGENT_STATUS_LABELS,
} from '../../services/chatService';

interface ProfileOption {
  id: string;
  full_name: string | null;
  email: string;
  role: string | null;
}

const emptyAgent: Partial<ChatAgent> = {
  user_id: '',
  display_name: '',
  agent_role: 'agent',
  max_concurrent: 5,
  is_active: true,
};

const AdminChatAgents = () => {
  const [agents, setAgents] = useState<ChatAgent[]>([]);
  const [available, setAvailable] = useState<AvailableAgent[]>([]);
  const [profiles, setProfiles] = useState<ProfileOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<Partial<ChatAgent>>(emptyAgent);
  const [editing, setEditing] = useState(false);

  const load = async () => {
    try {
      const [list, avail] = await Promise.all([fetchChatAgents(), fetchAvailableAgents()]);
      setAgents(list);
      setAvailable(avail);

      const { data } = await supabase
        .from('profiles')
        .select('id, full_name, email, role')
        .order('full_name', { ascending: true });
      setProfiles((data || []) as ProfileOption[]);
    } catch (err) {
      console.error('Ekip yüklenemedi:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // Vardiya görünümü canlı kalsın
    const interval = setInterval(() => {
      fetchAvailableAgents().then(setAvailable).catch(() => {});
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const resetForm = () => {
    setForm(emptyAgent);
    setEditing(false);
    setShowForm(false);
  };

  const handleSave = async () => {
    if (!form.user_id) {
      alert('Bir kullanıcı seçin.');
      return;
    }
    if (!form.display_name?.trim()) {
      alert('Ziyaretçiye görünecek adı yazın.');
      return;
    }

    setSaving(true);
    try {
      await saveChatAgent(form);
      resetForm();
      await load();
    } catch (err) {
      console.error('Kaydedilemedi:', err);
      alert('Kaydedilemedi: ' + (err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const handleRemove = async (agent: ChatAgent) => {
    if (
      !confirm(
        `${agent.display_name} ekipten çıkarılacak.\n\n` +
          'Geçmiş görüşmeleri ve yazdığı mesajlar silinmez, yalnızca ' +
          'canlı destek erişimi kalkar.',
      )
    ) {
      return;
    }
    try {
      await removeChatAgent(agent.user_id);
      await load();
    } catch (err) {
      console.error('Çıkarılamadı:', err);
      alert('Çıkarılamadı.');
    }
  };

  const toggleActive = async (agent: ChatAgent) => {
    try {
      await saveChatAgent({ ...agent, is_active: !agent.is_active });
      await load();
    } catch (err) {
      console.error('Güncellenemedi:', err);
    }
  };

  const availabilityOf = (userId: string) => available.find((a) => a.user_id === userId);

  /**
   * Görünürdeki durum. Görünümdeki `is_available` yalnızca "otomatik atama
   * alabilir mi" sorusunu yanıtlar (status='online' VE sinyal taze).
   * Ekranda bunu tek başına kullanmak "Meşgul" ile "Çevrimdışı"yı aynı
   * gösterirdi; oysa meşgul operatör paneli açık tutuyordur.
   *
   * Bu yüzden tazelik ayrı hesaplanıyor: sinyal bayatsa gerçekten
   * çevrimdışıdır, tazeyse operatörün kendi seçimi gösterilir.
   */
  const presenceOf = (agent: ChatAgent) => {
    const av = availabilityOf(agent.user_id);
    const fresh =
      !!av?.last_seen_at &&
      Date.now() - new Date(av.last_seen_at).getTime() < 90_000;

    const status: AgentStatus = fresh ? agent.status : 'offline';
    return {
      status,
      label: AGENT_STATUS_LABELS[status],
      // Yeşil = atama alabilir, sarı = açık ama meşgul, gri = kapalı
      color:
        status === 'online'
          ? 'text-green-500'
          : status === 'away'
          ? 'text-amber-400'
          : 'text-slate-300',
    };
  };

  // Zaten ekipte olanları seçim listesinden çıkar
  const selectable = profiles.filter(
    (p) => editing || !agents.some((a) => a.user_id === p.id),
  );

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
          <FaHeadset className="text-ocean" /> Canlı Destek Ekibi
        </h1>
        <button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="flex items-center rounded-lg bg-primary px-4 py-2 text-white transition-colors hover:bg-primary-light"
        >
          <FaPlus className="mr-2" /> Operatör Ekle
        </button>
      </div>

      <div className="mb-6 flex gap-3 rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900">
        <FaInfoCircle className="mt-0.5 flex-shrink-0 text-blue-500" />
        <div className="space-y-1">
          <p>
            Yalnızca buradaki kişiler canlı destek görüşmelerini görebilir. Panele
            girebilen ama listede olmayan bir yönetici hasta sohbetlerine erişemez.
          </p>
          <p>
            <strong>Operatör</strong> kendine atanan ve havuzdaki görüşmeleri görür.
            <strong> Süpervizör</strong> hepsini görür, devredebilir ve tüm raporu alır.
          </p>
          <p>
            Yeni görüşme, o an müsait olan ve <strong>en az yüklü</strong> operatöre
            otomatik atanır. Müsait kimse yoksa görüşme havuzda bekler — Canlı Destek
            ekranındaki <strong>Havuz</strong> sekmesinden herkes üstlenebilir.
          </p>
        </div>
      </div>

      {showForm && (
        <div className="mb-6 rounded-lg bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">
              {editing ? 'Operatörü Düzenle' : 'Yeni Operatör'}
            </h2>
            <button onClick={resetForm} className="text-gray-400 hover:text-gray-600">
              <FaTimes />
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Kullanıcı
              </label>
              <select
                value={form.user_id || ''}
                disabled={editing}
                onChange={(e) => {
                  const p = profiles.find((x) => x.id === e.target.value);
                  setForm({
                    ...form,
                    user_id: e.target.value,
                    display_name:
                      form.display_name || p?.full_name || p?.email.split('@')[0] || '',
                  });
                }}
                className="w-full rounded-lg border border-gray-200 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:bg-gray-50"
              >
                <option value="">Seçin...</option>
                {selectable.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.full_name || p.email} {p.role ? `(${p.role})` : ''}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-gray-400">
                Listede yoksa önce Kullanıcılar sayfasından hesap oluşturun.
              </p>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Ziyaretçiye Görünen Ad
              </label>
              <input
                value={form.display_name || ''}
                onChange={(e) => setForm({ ...form, display_name: e.target.value })}
                placeholder="Hasta Danışmanı Ayşe"
                className="w-full rounded-lg border border-gray-200 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              <p className="mt-1 text-xs text-gray-400">
                Sohbette bu ad görünür — gerçek ad soyad yazmak zorunda değilsiniz.
              </p>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Rol</label>
              <select
                value={form.agent_role || 'agent'}
                onChange={(e) =>
                  setForm({ ...form, agent_role: e.target.value as AgentRole })
                }
                className="w-full rounded-lg border border-gray-200 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="agent">Operatör</option>
                <option value="supervisor">Süpervizör</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Eş Zamanlı Görüşme Tavanı
              </label>
              <input
                type="number"
                min={1}
                value={form.max_concurrent ?? 5}
                onChange={(e) =>
                  setForm({
                    ...form,
                    max_concurrent: Math.max(1, parseInt(e.target.value, 10) || 5),
                  })
                }
                className="w-full rounded-lg border border-gray-200 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              <p className="mt-1 text-xs text-gray-400">
                Bu sayıya ulaşınca otomatik atama başkasına gider.
              </p>
            </div>
          </div>

          <div className="mt-4">
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

      <div className="overflow-hidden rounded-lg bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-gray-500">
            <tr>
              <th className="px-4 py-3 font-medium">Operatör</th>
              <th className="px-4 py-3 font-medium">Rol</th>
              <th className="px-4 py-3 font-medium">Durum</th>
              <th className="px-4 py-3 text-center font-medium">Yük</th>
              <th className="px-4 py-3 text-center font-medium">Aktif</th>
              <th className="px-4 py-3 text-right font-medium">İşlem</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {agents.map((a) => {
              const av = availabilityOf(a.user_id);
              const presence = presenceOf(a);
              return (
                <tr key={a.user_id} className={a.is_active ? '' : 'opacity-50'}>
                  <td className="px-4 py-3 font-medium text-slate-800">
                    {a.display_name}
                  </td>
                  <td className="px-4 py-3">
                    {a.agent_role === 'supervisor' ? (
                      <span className="flex items-center gap-1.5 text-xs font-semibold text-ocean">
                        <FaUserShield size={11} /> Süpervizör
                      </span>
                    ) : (
                      <span className="text-xs text-slate-500">Operatör</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className="flex items-center gap-1.5 text-xs"
                      title={
                        av?.last_seen_at
                          ? `Son sinyal: ${new Date(av.last_seen_at).toLocaleString('tr-TR')}`
                          : 'Henüz sinyal alınmadı'
                      }
                    >
                      <FaCircle size={8} className={presence.color} />
                      {presence.label}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center text-xs tabular-nums text-slate-600">
                    {av ? `${av.active_load} / ${a.max_concurrent}` : '—'}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => toggleActive(a)}
                      className={`rounded-full px-2 py-1 text-xs font-medium ${
                        a.is_active
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {a.is_active ? 'Aktif' : 'Pasif'}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => {
                          setForm(a);
                          setEditing(true);
                          setShowForm(true);
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        aria-label={`${a.display_name} düzenle`}
                        className="rounded-lg p-2 text-blue-600 hover:bg-blue-50"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleRemove(a)}
                        aria-label={`${a.display_name} ekipten çıkar`}
                        className="rounded-lg p-2 text-red-600 hover:bg-red-50"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {agents.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-gray-400">
                  Henüz operatör tanımlanmamış — şu an tüm yöneticiler canlı desteğe
                  erişebiliyor. İlk operatörü ekleyince erişim bu listeyle sınırlanır.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminChatAgents;
