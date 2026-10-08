import { useState, useEffect } from 'react';
import {
  FaSave, FaCog, FaInfoCircle, FaPlus, FaTimes, FaWhatsapp,
} from 'react-icons/fa';
import {
  ChatSettings, DEFAULT_CHAT_SETTINGS,
  fetchChatSettings, updateChatSettings, isWithinWorkingHours,
} from '../../services/chatService';
import { normalizeWhatsAppNumber } from '../../services/whatsappService';

const DAYS = [
  { value: 1, label: 'Pzt' },
  { value: 2, label: 'Sal' },
  { value: 3, label: 'Çar' },
  { value: 4, label: 'Per' },
  { value: 5, label: 'Cum' },
  { value: 6, label: 'Cmt' },
  { value: 7, label: 'Paz' },
];

const AdminChatSettings = () => {
  const [settings, setSettings] = useState<ChatSettings>(DEFAULT_CHAT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [newReply, setNewReply] = useState('');

  useEffect(() => {
    fetchChatSettings().then((s) => {
      // Saat alanları "HH:MM:SS" gelir, <input type="time"> "HH:MM" bekler
      setSettings({
        ...s,
        online_start: s.online_start.slice(0, 5),
        online_end: s.online_end.slice(0, 5),
      });
      setLoading(false);
    });
  }, []);

  const patch = <K extends keyof ChatSettings>(key: K, value: ChatSettings[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  const toggleDay = (day: number) => {
    const days = settings.online_days.includes(day)
      ? settings.online_days.filter((d) => d !== day)
      : [...settings.online_days, day].sort((a, b) => a - b);
    patch('online_days', days);
  };

  const addQuickReply = () => {
    const value = newReply.trim();
    if (!value || settings.quick_replies.includes(value)) return;
    patch('quick_replies', [...settings.quick_replies, value]);
    setNewReply('');
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateChatSettings({
        ...settings,
        whatsapp_fallback_number: settings.whatsapp_fallback_number
          ? normalizeWhatsAppNumber(settings.whatsapp_fallback_number)
          : null,
      });
      setSaved(true);
    } catch (err) {
      console.error('Ayarlar kaydedilemedi:', err);
      alert('Ayarlar kaydedilemedi: ' + (err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-primary" />
      </div>
    );
  }

  const onlineNow = isWithinWorkingHours(settings);

  return (
    <div className="max-w-4xl">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="flex items-center gap-3 text-2xl font-semibold text-primary">
          <FaCog className="text-ocean" /> Canlı Destek Ayarları
        </h1>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center rounded-lg bg-primary px-4 py-2 text-white transition-colors hover:bg-primary-light disabled:opacity-60"
        >
          <FaSave className="mr-2" />
          {saving ? 'Kaydediliyor...' : saved ? 'Kaydedildi ✓' : 'Kaydet'}
        </button>
      </div>

      <div className="mb-6 flex gap-3 rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900">
        <FaInfoCircle className="mt-0.5 flex-shrink-0 text-blue-500" />
        <div className="space-y-1">
          <p>
            Widget yalnızca <strong>“Canlı destek açık”</strong> işaretliyken sitede görünür.
            7/24 modu kapatılırsa, çalışma saatleri dışında widget yine açılır ama
            ziyaretçiye çevrimdışı metni ve (tanımlıysa) WhatsApp alternatifi gösterilir —
            mesaj her hâlükârda kaydedilir.
          </p>
          <p>
            {settings.is_24_7 ? (
              <>
                Şu anda <strong>7/24 modu</strong> açık — widget her zaman çevrimiçi
                görünüyor, saat ayarları devre dışı.
              </>
            ) : (
              <>
                Saatler <strong>Europe/Istanbul</strong> saat dilimine göre
                değerlendirilir. Şu an durumu:{' '}
                <strong className={onlineNow ? 'text-green-700' : 'text-slate-600'}>
                  {onlineNow ? 'Çevrimiçi' : 'Çevrimdışı'}
                </strong>
              </>
            )}
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {/* --- Genel --- */}
        <Card title="Genel">
          <Toggle
            label="Canlı destek açık"
            hint="Kapatıldığında widget sitede hiç görünmez."
            checked={settings.is_enabled}
            onChange={(v) => patch('is_enabled', v)}
          />

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Text
              label="Widget Başlığı"
              value={settings.widget_title}
              onChange={(v) => patch('widget_title', v)}
            />
            <Text
              label="Alt Başlık"
              value={settings.widget_subtitle}
              onChange={(v) => patch('widget_subtitle', v)}
            />
            <Text
              label="Danışman Görünen Adı"
              value={settings.agent_display_name}
              onChange={(v) => patch('agent_display_name', v)}
              hint="Ziyaretçiye operatör adı olarak gösterilir."
            />
            <Text
              label="Danışman Avatar URL"
              value={settings.agent_avatar_url || ''}
              onChange={(v) => patch('agent_avatar_url', v || null)}
              placeholder="https://..."
            />
          </div>

          <TextArea
            label="Karşılama Mesajı"
            value={settings.welcome_message}
            onChange={(v) => patch('welcome_message', v)}
          />
          <TextArea
            label="Çevrimdışı Mesajı"
            value={settings.offline_message}
            onChange={(v) => patch('offline_message', v)}
          />
        </Card>

        {/* --- Çalışma saatleri --- */}
        <Card title="Çalışma Saatleri">
          <Toggle
            label="7 gün 24 saat açık"
            hint="Açıkken widget her zaman çevrimiçi görünür; gün ve saat ayarları hiç dikkate alınmaz."
            checked={settings.is_24_7}
            onChange={(v) => patch('is_24_7', v)}
          />

          {settings.is_24_7 ? (
            <p className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-900">
              Çağrı merkezi kesintisiz çalıştığı için widget hiçbir zaman
              “çevrimdışı” göstermez. Aşağıdaki saat ayarlarını düzenlemek için
              bu seçeneği kapatmanız gerekir.
            </p>
          ) : (
            <>
              <div>
                <p className="mb-2 text-sm font-medium text-gray-700">Çevrimiçi Günler</p>
                <div className="flex flex-wrap gap-2">
                  {DAYS.map((d) => {
                    const active = settings.online_days.includes(d.value);
                    return (
                      <button
                        key={d.value}
                        type="button"
                        onClick={() => toggleDay(d.value)}
                        aria-pressed={active}
                        className={`h-11 w-14 rounded-lg text-sm font-medium transition-colors ${
                          active
                            ? 'bg-primary text-white'
                            : 'border border-gray-200 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {d.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Text
                  label="Başlangıç"
                  type="time"
                  value={settings.online_start}
                  onChange={(v) => patch('online_start', v)}
                />
                <Text
                  label="Bitiş"
                  type="time"
                  value={settings.online_end}
                  onChange={(v) => patch('online_end', v)}
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  <FaWhatsapp className="mr-1.5 inline text-green-500" />
                  Çevrimdışı WhatsApp Numarası
                </label>
                <input
                  type="tel"
                  value={settings.whatsapp_fallback_number || ''}
                  onChange={(e) => patch('whatsapp_fallback_number', e.target.value || null)}
                  placeholder="0532 123 45 67"
                  className="w-full rounded-lg border border-gray-200 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
                <p className="mt-1 text-xs text-gray-400">
                  Boş bırakılırsa çevrimdışıyken WhatsApp butonu gösterilmez.
                </p>
              </div>
            </>
          )}
        </Card>

        {/* --- Ön form --- */}
        <Card title="Görüşme Öncesi Form">
          <div className="space-y-3">
            <Toggle
              label="Ad Soyad zorunlu"
              checked={settings.require_name}
              onChange={(v) => patch('require_name', v)}
            />
            <Toggle
              label="Telefon zorunlu"
              checked={settings.require_phone}
              onChange={(v) => patch('require_phone', v)}
            />
            <Toggle
              label="E-posta zorunlu"
              checked={settings.require_email}
              onChange={(v) => patch('require_email', v)}
            />
          </div>

          <TextArea
            label="KVKK Onay Metni"
            value={settings.consent_text || ''}
            onChange={(v) => patch('consent_text', v || null)}
            hint="Boş bırakılırsa onay kutusu gösterilmez."
          />

          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
            <Toggle
              label="Dosya eki gönderilebilsin"
              hint="Ziyaretçi ve operatör görsel/PDF paylaşabilir."
              checked={settings.allow_attachments}
              onChange={(v) => patch('allow_attachments', v)}
            />
            <p className="mt-2 text-xs leading-relaxed text-amber-900">
              <strong>Açmadan önce okuyun:</strong> dosyalar herkese açık bir Storage
              bucket'ında tutulur. Adresler tahmin edilemez (rastgele UUID) ve yalnızca
              görüşme transkriptinde görünür, ancak adresi ele geçiren biri dosyayı
              açabilir. Hasta raporu gibi hassas belgeler için bu riski değerlendirin.
              Ayrıntı: CHAT_SETUP.md
            </p>
            {settings.allow_attachments && (
              <div className="mt-3 max-w-[200px]">
                <Text
                  label="Azami dosya boyutu (MB)"
                  type="number"
                  value={String(settings.max_attachment_mb)}
                  onChange={(v) =>
                    patch('max_attachment_mb', Math.max(1, parseInt(v, 10) || 5))
                  }
                />
              </div>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Hazır Sorular
            </label>
            <p className="mb-2 text-xs text-gray-400">
              Ziyaretçi tek tıkla mesaj kutusuna doldurabilir.
            </p>

            <div className="mb-3 flex flex-wrap gap-2">
              {settings.quick_replies.map((q) => (
                <span
                  key={q}
                  className="flex items-center gap-2 rounded-full bg-primary/5 px-3 py-1.5 text-sm text-primary"
                >
                  {q}
                  <button
                    type="button"
                    onClick={() =>
                      patch('quick_replies', settings.quick_replies.filter((r) => r !== q))
                    }
                    aria-label={`"${q}" sorusunu kaldır`}
                    className="text-primary/50 hover:text-coral"
                  >
                    <FaTimes size={11} />
                  </button>
                </span>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                value={newReply}
                onChange={(e) => setNewReply(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addQuickReply();
                  }
                }}
                placeholder="Yeni hazır soru ekle..."
                className="flex-1 rounded-lg border border-gray-200 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              <button
                type="button"
                onClick={addQuickReply}
                className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm text-white hover:bg-primary-light"
              >
                <FaPlus size={12} /> Ekle
              </button>
            </div>
          </div>
        </Card>
      </div>

      <div className="mt-6 flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center rounded-lg bg-primary px-6 py-2.5 text-white transition-colors hover:bg-primary-light disabled:opacity-60"
        >
          <FaSave className="mr-2" />
          {saving ? 'Kaydediliyor...' : saved ? 'Kaydedildi ✓' : 'Kaydet'}
        </button>
      </div>
    </div>
  );
};

// ============================================================
// Form yardımcıları
// ============================================================

const Card = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section className="rounded-lg bg-white p-6 shadow-sm">
    <h2 className="mb-4 text-lg font-semibold text-slate-800">{title}</h2>
    <div className="space-y-4">{children}</div>
  </section>
);

const Text = ({
  label, value, onChange, type = 'text', hint, placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  hint?: string;
  placeholder?: string;
}) => (
  <div>
    <label className="mb-1 block text-sm font-medium text-gray-700">{label}</label>
    <input
      type={type}
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-lg border border-gray-200 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20"
    />
    {hint && <p className="mt-1 text-xs text-gray-400">{hint}</p>}
  </div>
);

const TextArea = ({
  label, value, onChange, hint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  hint?: string;
}) => (
  <div>
    <label className="mb-1 block text-sm font-medium text-gray-700">{label}</label>
    <textarea
      rows={3}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full resize-none rounded-lg border border-gray-200 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20"
    />
    {hint && <p className="mt-1 text-xs text-gray-400">{hint}</p>}
  </div>
);

const Toggle = ({
  label, hint, checked, onChange,
}: {
  label: string;
  hint?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) => (
  <label className="flex cursor-pointer items-start gap-3">
    <input
      type="checkbox"
      checked={checked}
      onChange={(e) => onChange(e.target.checked)}
      className="mt-0.5 h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary"
    />
    <span>
      <span className="block text-sm font-medium text-gray-700">{label}</span>
      {hint && <span className="block text-xs text-gray-400">{hint}</span>}
    </span>
  </label>
);

export default AdminChatSettings;
