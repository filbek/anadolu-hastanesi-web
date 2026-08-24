import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  FaUniversalAccess, FaTimes, FaPlus, FaMinus, FaAdjust,
  FaLink, FaPauseCircle, FaFont, FaUndo,
} from 'react-icons/fa';
import { useFocusTrap } from '../../hooks/useFocusTrap';

// Ziyaretçinin sayfayı kendi ihtiyacına göre uyarlayabildiği erişilebilirlik
// araç çubuğu. Tercihler <html> üzerindeki data-* özniteliklerine yazılır,
// karşılıkları index.css içindedir; seçim localStorage'da saklanır.
//
// Bkz. ACCESSIBILITY.md — RG 21.06.2025 / 20250621-17, WCAG 2.2

const STORAGE_KEY = 'a11y-prefs';

type Prefs = {
  fontScale: number; // 100 = normal
  contrast: boolean;
  highlightLinks: boolean;
  stopMotion: boolean;
  readableFont: boolean;
};

const DEFAULTS: Prefs = {
  fontScale: 100,
  contrast: false,
  highlightLinks: false,
  stopMotion: false,
  readableFont: false,
};

const readPrefs = (): Prefs => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? { ...DEFAULTS, ...JSON.parse(raw) } : DEFAULTS;
  } catch {
    return DEFAULTS;
  }
};

const applyPrefs = (p: Prefs) => {
  const root = document.documentElement;
  root.style.setProperty('--a11y-font-scale', String(p.fontScale / 100));
  root.toggleAttribute('data-a11y-contrast', p.contrast);
  root.toggleAttribute('data-a11y-links', p.highlightLinks);
  root.toggleAttribute('data-a11y-stop-motion', p.stopMotion);
  root.toggleAttribute('data-a11y-readable', p.readableFont);
};

const AccessibilityWidget = () => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [prefs, setPrefs] = useState<Prefs>(DEFAULTS);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useFocusTrap<HTMLDivElement>(open, () => setOpen(false));

  // İlk yüklemede kayıtlı tercihleri uygula
  useEffect(() => {
    const stored = readPrefs();
    setPrefs(stored);
    applyPrefs(stored);
  }, []);

  const update = (patch: Partial<Prefs>) => {
    setPrefs((prev) => {
      const next = { ...prev, ...patch };
      applyPrefs(next);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        /* depolama kapalıysa tercih yalnızca bu oturumda geçerli olur */
      }
      return next;
    });
  };

  const toggles: Array<{ key: keyof Prefs; icon: JSX.Element; label: string }> = [
    { key: 'contrast', icon: <FaAdjust />, label: t('a11y.contrast', 'Yüksek kontrast') },
    { key: 'highlightLinks', icon: <FaLink />, label: t('a11y.links', 'Bağlantıları vurgula') },
    { key: 'stopMotion', icon: <FaPauseCircle />, label: t('a11y.motion', 'Animasyonları durdur') },
    { key: 'readableFont', icon: <FaFont />, label: t('a11y.font', 'Okunaklı yazı tipi') },
  ];

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="a11y-panel"
        aria-label={t('a11y.open', 'Erişilebilirlik seçenekleri')}
        className="fixed bottom-24 left-6 z-[90] w-12 h-12 rounded-full bg-primary-600 text-white shadow-lg flex items-center justify-center hover:bg-primary-700 transition-colors"
      >
        <FaUniversalAccess className="text-2xl" aria-hidden="true" />
      </button>

      {open && (
        <div
          ref={panelRef}
          id="a11y-panel"
          role="dialog"
          aria-label={t('a11y.title', 'Erişilebilirlik Seçenekleri')}
          className="fixed bottom-40 left-6 z-[95] w-[19rem] max-w-[calc(100vw-3rem)] rounded-2xl bg-white shadow-elevated border border-neutral-200 p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-primary-600">
              {t('a11y.title', 'Erişilebilirlik Seçenekleri')}
            </h2>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label={t('common.close', 'Kapat')}
              className="w-11 h-11 -mr-2 flex items-center justify-center text-neutral-500 hover:text-primary-600"
            >
              <FaTimes aria-hidden="true" />
            </button>
          </div>

          {/* Yazı boyutu */}
          <div className="mb-4">
            <p className="text-sm font-semibold text-neutral-700 mb-2">
              {t('a11y.fontSize', 'Yazı boyutu')}
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => update({ fontScale: Math.max(90, prefs.fontScale - 10) })}
                disabled={prefs.fontScale <= 90}
                aria-label={t('a11y.fontSmaller', 'Yazıyı küçült')}
                className="w-11 h-11 rounded-xl border border-neutral-200 flex items-center justify-center hover:bg-neutral-100 disabled:opacity-40"
              >
                <FaMinus aria-hidden="true" />
              </button>
              <span className="flex-1 text-center text-sm font-bold text-primary-600" aria-live="polite">
                %{prefs.fontScale}
              </span>
              <button
                type="button"
                onClick={() => update({ fontScale: Math.min(150, prefs.fontScale + 10) })}
                disabled={prefs.fontScale >= 150}
                aria-label={t('a11y.fontLarger', 'Yazıyı büyüt')}
                className="w-11 h-11 rounded-xl border border-neutral-200 flex items-center justify-center hover:bg-neutral-100 disabled:opacity-40"
              >
                <FaPlus aria-hidden="true" />
              </button>
            </div>
          </div>

          {/* Açma/kapama seçenekleri */}
          <div className="space-y-2">
            {toggles.map(({ key, icon, label }) => {
              const active = Boolean(prefs[key]);
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => update({ [key]: !active } as Partial<Prefs>)}
                  aria-pressed={active}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-semibold transition-colors ${
                    active
                      ? 'bg-primary-600 text-white border-primary-600'
                      : 'bg-white text-neutral-700 border-neutral-200 hover:bg-neutral-100'
                  }`}
                >
                  <span aria-hidden="true">{icon}</span>
                  <span className="text-left">{label}</span>
                  <span className="ml-auto text-xs font-bold">
                    {active ? t('a11y.on', 'AÇIK') : t('a11y.off', 'KAPALI')}
                  </span>
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => update(DEFAULTS)}
            className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-neutral-200 text-sm font-semibold text-neutral-700 hover:bg-neutral-100"
          >
            <FaUndo aria-hidden="true" /> {t('a11y.reset', 'Varsayılana dön')}
          </button>

          <a
            href="/erisilebilirlik"
            className="mt-3 block text-center text-sm font-semibold text-primary-600 underline hover:no-underline"
          >
            {t('a11y.statement', 'Erişilebilirlik Beyanı')}
          </a>
        </div>
      )}
    </>
  );
};

export default AccessibilityWidget;
