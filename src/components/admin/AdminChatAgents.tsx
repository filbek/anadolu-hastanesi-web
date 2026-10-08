import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  FaHeadset, FaPlus, FaEdit, FaTrash, FaTimes, FaSave, FaInfoCircle,
  FaCircle, FaUserShield, FaUserPlus, FaLock, FaLockOpen,
} from 'react-icons/fa';
import { supabase } from '../../lib/supabase';
import { useSupabase } from '../../contexts/SupabaseContext';
import { isAdminRole } from '../../lib/roles';
import { callAdminUsers } from '../../services/adminUsersService';
import {
  ChatAgent, AvailableAgent, AgentRole, AgentStatus, TeamAccount,
  fetchChatAgents, fetchAvailableAgents, fetchTeamAccounts, saveChatAgent,
  removeChatAgent, AGENT_STATUS_LABELS,
} from '../../services/chatService';
import type { ChatOutletContext } from './ChatAdminLayout';

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

interface NewAccountForm {
  full_name: string;
  email: string;
  password: string;
  display_name: string;
  max_concurrent: number;
}

const emptyAccount: NewAccountForm = {
  full_name: '',
  email: '',
  password: '',
  display_name: '',
  max_concurrent: 5,
};

const MIN_PASSWORD = 8;

const INPUT =
  'w-full rounded-lg border border-gray-200 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:bg-gray-50';

/**
 * Ekip yönetimi iki kişiye açık:
 *  - Yönetici: her şey (mevcut kullanıcıyı ekleme, süpervizör atama, silme)
 *  - Çağrı merkezi süpervizörü: yeni çağrı merkezi hesabı açar, operatörleri
 *    düzenler, şifre sıfırlar, girişini kapatır. Süpervizör atayamaz,
 *    silemez, başka süpervizöre dokunamaz.
 * Arayüzdeki gizlemeler KOZMETİKTİR; asıl sınırlar chat_agents_guard
 * tetikleyicisi ve admin-users edge function'ındadır.
 */
const AdminChatAgents = () => {
  const { userProfile } = useSupabase();
  const { isCallCenterSupervisor } = useOutletContext<ChatOutletContext>() ?? {
    isCallCenterSupervisor: false,
  };
  const isAdmin = isAdminRole(userProfile);
  const myId = userProfile?.id;

  const [agents, setAgents] = useState<ChatAgent[]>([]);
  const [available, setAvailable] = useState<AvailableAgent[]>([]);
  const [accounts, setAccounts] = useState<TeamAccount[]>([]);
  const [profiles, setProfiles] = useState<ProfileOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<Partial<ChatAgent>>(emptyAgent);
  const [editing, setEditing] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [showAccountForm, setShowAccountForm] = useState(false);
  const [account, setAccount] = useState<NewAccountForm>(emptyAccount);

  const load = async () => {
    try {
      const [list, avail] = await Promise.all([fetchChatAgents(), fetchAvailableAgents()]);
      setAgents(list);
      setAvailable(avail);

      // Migration çalışmadıysa e-posta/giriş sütunları boş kalır, ekran bozulmaz
      fetchTeamAccounts()
        .then(setAccounts)
        .catch((err) => console.warn('Ekip hesapları alınamadı:', err));

      // Mevcut kullanıcıyı ekibe ekleme yalnızca yöneticide
      if (isAdmin) {
        const { data } = await supabase
          .from('profiles')
          .select('id, full_name, email, role')
          .order('full_name', { ascending: true });
        setProfiles((data || []) as ProfileOption[]);
      }
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin]);

  const resetForm = () => {
    setForm(emptyAgent);
    setEditing(false);
    setShowForm(false);
    setNewPassword('');
  };

  const resetAccountForm = () => {
    setAccount(emptyAccount);
    setShowAccountForm(false);
  };

  const accountOf = (userId: string) => accounts.find((x) => x.user_id === userId);

  /** Süpervizör yalnızca operatörleri ve kendini düzenler */
  const canEdit = (a: ChatAgent) =>
    isAdmin || a.agent_role === 'agent' || a.user_id === myId;

  /** Hesap işlemleri (şifre, giriş) yalnızca çağrı merkezi hesaplarında */
  const canManageAccount = (a: ChatAgent) =>
    canEdit(a) && accountOf(a.user_id)?.profile_role === 'call_center';

  const handleSave = async () => {
    if (!form.user_id) {
      alert('Bir kullanıcı seçin.');
      return;
    }
    if (!form.display_name?.trim()) {
      alert('Ziyaretçiye görünecek adı yazın.');
      return;
    }
    if (newPassword && newPassword.length < MIN_PASSWORD) {
      alert(`Yeni şifre en az ${MIN_PASSWORD} karakter olmalı.`);
      return;
    }

    setSaving(true);
    try {
      await saveChatAgent(form);
      if (newPassword) {
        await callAdminUsers({ action: 'update', id: form.user_id, password: newPassword });
      }
      resetForm();
      await load();
    } catch (err) {
      console.error('Kaydedilemedi:', err);
      alert('Kaydedilemedi: ' + (err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const handleCreateAccount = async () => {
    const full_name = account.full_name.trim();
    const email = account.email.trim().toLowerCase();
    if (!full_name || !email) {
      alert('Ad soyad ve e-posta zorunlu.');
      return;
    }
    if (account.password.length < MIN_PASSWORD) {
      alert(`Geçici şifre en az ${MIN_PASSWORD} karakter olmalı.`);
      return;
    }

    setSaving(true);
    try {
      const { user } = await callAdminUsers<{ user: { id: string } }>({
        action: 'create',
        email,
        password: account.password,
        full_name,
        role: 'call_center',
        is_active: true,
      });

      // Ekip kaydını tetikleyici açtı (görünen ad = ad soyad); farklı
      // görünen ad / tavan istendiyse üzerine yaz.
      const display_name = account.display_name.trim() || full_name;
      if (display_name !== full_name || account.max_concurrent !== 5) {
        await saveChatAgent({
          user_id: user.id,
          display_name,
          agent_role: 'agent',
          max_concurrent: account.max_concurrent,
          is_active: true,
        });
      }

      alert(
        `${full_name} için hesap açıldı.\n\n` +
          `E-posta: ${email}\nGeçici şifre: ${account.password}\n\n` +
          'Bu bilgileri kişiye güvenli bir kanaldan iletin; ilk girişte ' +
          'şifresini değiştirmesini isteyin.',
      );
      resetAccountForm();
      await load();
    } catch (err) {
      console.error('Hesap açılamadı:', err);
      alert('Hesap açılamadı: ' + (err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const toggleAccount = async (a: ChatAgent) => {
    const acc = accountOf(a.user_id);
    if (!acc) return;
    const enabling = !acc.account_active;
    if (
      !enabling &&
      !confirm(
        `${a.display_name} hesabının girişi kapatılacak.\n\n` +
          'Panele giremez ve görüşme almaz. Geçmiş görüşmeleri silinmez; ' +
          'istediğinizde girişi yeniden açabilirsiniz.',
      )
    ) {
      return;
    }
    try {
      await callAdminUsers({ action: 'update', id: a.user_id, is_active: enabling });
      await load();
    } catch (err) {
      console.error('Hesap güncellenemedi:', err);
      alert('Hesap güncellenemedi: ' + (err as Error).message);
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
      alert('Güncellenemedi: ' + (err as Error).message);
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

  const showPasswordField =
    editing && !!form.user_id && accountOf(form.user_id)?.profile_role === 'call_center';

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="flex items-center gap-3 text-2xl font-semibold text-primary">
          <FaHeadset className="text-ocean" /> Canlı Destek Ekibi
        </h1>
        <div className="flex flex-wrap gap-2">
          {isAdmin && (
            <button
              onClick={() => {
                resetAccountForm();
                resetForm();
                setShowForm(true);
              }}
              className="flex items-center rounded-lg border border-primary px-4 py-2 text-primary transition-colors hover:bg-primary/5"
            >
              <FaPlus className="mr-2" /> Mevcut Kullanıcıyı Ekle
            </button>
          )}
          {(isAdmin || isCallCenterSupervisor) && (
            <button
              onClick={() => {
                resetForm();
                setAccount(emptyAccount);
                setShowAccountForm(true);
              }}
              className="flex items-center rounded-lg bg-primary px-4 py-2 text-white transition-colors hover:bg-primary-light"
            >
              <FaUserPlus className="mr-2" /> Yeni Operatör Hesabı
            </button>
          )}
        </div>
      </div>

      <div className="mb-6 flex gap-3 rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900">
        <FaInfoCircle className="mt-0.5 flex-shrink-0 text-blue-500" />
        <div className="space-y-1">
          <p>
            Yalnızca buradaki kişiler canlı destek görüşmelerini görebilir. Panele
            girebilen ama listede olmayan bir yönetici hasta sohbetlerine erişemez.
          </p>
          <p>
            <strong>Operatör</strong> kendine atanan ve havuzdaki görüşmeleri, raporda
            yalnızca kendi rakamlarını görür.
            <strong> Süpervizör</strong> hepsini görür, devredebilir, tüm raporu alır ve
            ekibi yönetir.
          </p>
          <p>
            <strong>Yeni Operatör Hesabı</strong> çağrı merkezi rolünde kişisel bir hesap
            açar ve kişiyi ekibe operatör olarak ekler. Ortak hesap kullanmayın: atama,
            rapor ve kimin ne yazdığı kişi bazında tutulur. Ayrılan çalışanın girişini
            kapatın; geçmiş görüşmeleri korunur.
          </p>
          {isCallCenterSupervisor && (
            <p>Süpervizör atamak ve ekipten tamamen çıkarmak yöneticiye aittir.</p>
          )}
          <p>
            Yeni görüşme, o an müsait olan ve <strong>en az yüklü</strong> operatöre
            otomatik atanır. Müsait kimse yoksa görüşme havuzda bekler — Canlı Destek
            ekranındaki <strong>Havuz</strong> sekmesinden herkes üstlenebilir.
          </p>
        </div>
      </div>

      {showAccountForm && (
        <div className="mb-6 rounded-lg bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Yeni Operatör Hesabı</h2>
            <button
              onClick={resetAccountForm}
              aria-label="Kapat"
              className="text-gray-400 hover:text-gray-600"
            >
              <FaTimes />
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label htmlFor="acc-name" className="mb-1 block text-sm font-medium text-gray-700">
                Ad Soyad
              </label>
              <input
                id="acc-name"
                value={account.full_name}
                onChange={(e) => setAccount({ ...account, full_name: e.target.value })}
                autoComplete="off"
                className={INPUT}
              />
            </div>

            <div>
              <label htmlFor="acc-email" className="mb-1 block text-sm font-medium text-gray-700">
                Kişisel İş E-postası
              </label>
              <input
                id="acc-email"
                type="email"
                value={account.email}
                onChange={(e) => setAccount({ ...account, email: e.target.value })}
                placeholder="ad.soyad@anadoluhastaneleri.com"
                autoComplete="off"
                className={INPUT}
              />
            </div>

            <div>
              <label htmlFor="acc-pass" className="mb-1 block text-sm font-medium text-gray-700">
                Geçici Şifre
              </label>
              <input
                id="acc-pass"
                type="text"
                value={account.password}
                onChange={(e) => setAccount({ ...account, password: e.target.value })}
                autoComplete="new-password"
                className={INPUT}
              />
              <p className="mt-1 text-xs text-gray-400">
                En az {MIN_PASSWORD} karakter. Kişi ilk girişte değiştirmeli.
              </p>
            </div>

            <div>
              <label htmlFor="acc-display" className="mb-1 block text-sm font-medium text-gray-700">
                Ziyaretçiye Görünen Ad{' '}
                <span className="font-normal text-gray-400">(isteğe bağlı)</span>
              </label>
              <input
                id="acc-display"
                value={account.display_name}
                onChange={(e) => setAccount({ ...account, display_name: e.target.value })}
                placeholder="Hasta Danışmanı Ayşe"
                className={INPUT}
              />
              <p className="mt-1 text-xs text-gray-400">Boş bırakılırsa ad soyad görünür.</p>
            </div>

            <div>
              <label htmlFor="acc-max" className="mb-1 block text-sm font-medium text-gray-700">
                Eş Zamanlı Görüşme Tavanı
              </label>
              <input
                id="acc-max"
                type="number"
                min={1}
                value={account.max_concurrent}
                onChange={(e) =>
                  setAccount({
                    ...account,
                    max_concurrent: Math.max(1, parseInt(e.target.value, 10) || 5),
                  })
                }
                className={INPUT}
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button
              onClick={resetAccountForm}
              className="rounded-lg border border-gray-200 px-4 py-2 text-gray-600 hover:bg-gray-50"
            >
              İptal
            </button>
            <button
              onClick={handleCreateAccount}
              disabled={saving}
              className="flex items-center rounded-lg bg-primary px-4 py-2 text-white hover:bg-primary-light disabled:opacity-60"
            >
              <FaUserPlus className="mr-2" /> {saving ? 'Açılıyor...' : 'Hesabı Aç'}
            </button>
          </div>
        </div>
      )}

      {showForm && (
        <div className="mb-6 rounded-lg bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">
              {editing ? 'Operatörü Düzenle' : 'Mevcut Kullanıcıyı Ekibe Ekle'}
            </h2>
            <button
              onClick={resetForm}
              aria-label="Kapat"
              className="text-gray-400 hover:text-gray-600"
            >
              <FaTimes />
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label htmlFor="agent-user" className="mb-1 block text-sm font-medium text-gray-700">
                Kullanıcı
              </label>
              {editing ? (
                <input
                  id="agent-user"
                  value={accountOf(form.user_id || '')?.email || form.display_name || ''}
                  disabled
                  className={INPUT}
                />
              ) : (
                <select
                  id="agent-user"
                  value={form.user_id || ''}
                  onChange={(e) => {
                    const p = profiles.find((x) => x.id === e.target.value);
                    setForm({
                      ...form,
                      user_id: e.target.value,
                      display_name:
                        form.display_name || p?.full_name || p?.email.split('@')[0] || '',
                    });
                  }}
                  className={INPUT}
                >
                  <option value="">Seçin...</option>
                  {selectable.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.full_name || p.email} {p.role ? `(${p.role})` : ''}
                    </option>
                  ))}
                </select>
              )}
              {!editing && (
                <p className="mt-1 text-xs text-gray-400">
                  Çağrı merkezi çalışanı için “Yeni Operatör Hesabı”nı kullanın.
                </p>
              )}
            </div>

            <div>
              <label htmlFor="agent-display" className="mb-1 block text-sm font-medium text-gray-700">
                Ziyaretçiye Görünen Ad
              </label>
              <input
                id="agent-display"
                value={form.display_name || ''}
                onChange={(e) => setForm({ ...form, display_name: e.target.value })}
                placeholder="Hasta Danışmanı Ayşe"
                className={INPUT}
              />
              <p className="mt-1 text-xs text-gray-400">
                Sohbette bu ad görünür — gerçek ad soyad yazmak zorunda değilsiniz.
              </p>
            </div>

            <div>
              <label htmlFor="agent-role" className="mb-1 block text-sm font-medium text-gray-700">
                Rol
              </label>
              <select
                id="agent-role"
                value={form.agent_role || 'agent'}
                disabled={!isAdmin}
                onChange={(e) =>
                  setForm({ ...form, agent_role: e.target.value as AgentRole })
                }
                className={INPUT}
              >
                <option value="agent">Operatör</option>
                <option value="supervisor">Süpervizör</option>
              </select>
              {!isAdmin && (
                <p className="mt-1 text-xs text-gray-400">
                  Süpervizör atamasını yönetici yapar.
                </p>
              )}
            </div>

            <div>
              <label htmlFor="agent-max" className="mb-1 block text-sm font-medium text-gray-700">
                Eş Zamanlı Görüşme Tavanı
              </label>
              <input
                id="agent-max"
                type="number"
                min={1}
                value={form.max_concurrent ?? 5}
                onChange={(e) =>
                  setForm({
                    ...form,
                    max_concurrent: Math.max(1, parseInt(e.target.value, 10) || 5),
                  })
                }
                className={INPUT}
              />
              <p className="mt-1 text-xs text-gray-400">
                Bu sayıya ulaşınca otomatik atama başkasına gider.
              </p>
            </div>

            {showPasswordField && (
              <div>
                <label htmlFor="agent-pass" className="mb-1 block text-sm font-medium text-gray-700">
                  Yeni Şifre{' '}
                  <span className="font-normal text-gray-400">(sıfırlamak için)</span>
                </label>
                <input
                  id="agent-pass"
                  type="text"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  autoComplete="new-password"
                  placeholder="Boş bırakılırsa değişmez"
                  className={INPUT}
                />
              </div>
            )}
          </div>

          <div className="mt-4">
            <label className="flex cursor-pointer items-center gap-3">
              <input
                type="checkbox"
                checked={form.is_active ?? true}
                disabled={form.user_id === myId && !isAdmin}
                onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                className="h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <span className="text-sm text-gray-700">Ekipte aktif (görüşme alır)</span>
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

      <div className="overflow-x-auto rounded-lg bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-gray-500">
            <tr>
              <th className="px-4 py-3 font-medium">Operatör</th>
              <th className="px-4 py-3 font-medium">Rol</th>
              <th className="px-4 py-3 font-medium">Durum</th>
              <th className="px-4 py-3 text-center font-medium">Yük</th>
              <th className="px-4 py-3 text-center font-medium">Ekipte</th>
              <th className="px-4 py-3 text-center font-medium">Giriş</th>
              <th className="px-4 py-3 text-right font-medium">İşlem</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {agents.map((a) => {
              const av = availabilityOf(a.user_id);
              const presence = presenceOf(a);
              const acc = accountOf(a.user_id);
              const editable = canEdit(a);
              const isSelf = a.user_id === myId;
              return (
                <tr key={a.user_id} className={a.is_active ? '' : 'opacity-50'}>
                  <td className="px-4 py-3">
                    <div className="font-medium text-slate-800">{a.display_name}</div>
                    {acc?.email && <div className="text-xs text-slate-400">{acc.email}</div>}
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
                      disabled={!editable || (isSelf && !isAdmin)}
                      className={`rounded-full px-2 py-1 text-xs font-medium disabled:cursor-default ${
                        a.is_active
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {a.is_active ? 'Aktif' : 'Pasif'}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-center">
                    {!acc ? (
                      <span className="text-xs text-slate-300">—</span>
                    ) : canManageAccount(a) && !isSelf ? (
                      <button
                        onClick={() => toggleAccount(a)}
                        title={acc.account_active ? 'Girişi kapat' : 'Girişi aç'}
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${
                          acc.account_active
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {acc.account_active ? <FaLockOpen size={9} /> : <FaLock size={9} />}
                        {acc.account_active ? 'Açık' : 'Kapalı'}
                      </button>
                    ) : (
                      <span
                        className={`text-xs ${
                          acc.account_active ? 'text-slate-500' : 'text-red-600'
                        }`}
                      >
                        {acc.account_active ? 'Açık' : 'Kapalı'}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      {editable && (
                        <button
                          onClick={() => {
                            setShowAccountForm(false);
                            setNewPassword('');
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
                      )}
                      {isAdmin && (
                        <button
                          onClick={() => handleRemove(a)}
                          aria-label={`${a.display_name} ekipten çıkar`}
                          className="rounded-lg p-2 text-red-600 hover:bg-red-50"
                        >
                          <FaTrash />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
            {agents.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-gray-400">
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
