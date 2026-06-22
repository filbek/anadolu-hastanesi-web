import { useMemo, useState } from 'react'
import { FaGlobe, FaMagic, FaSyncAlt } from 'react-icons/fa'
import {
  TARGET_LANGS,
  type TargetLang,
  mergeTranslations,
} from '../../services/translationService'

type FieldDef = {
  /** form/source nesnesindeki TR alan adı */
  key: string
  /** kullanıcıya gösterilecek etiket */
  label: string
  /** input tipi: text → tek satır, textarea → çok satır, html → büyük çok satır */
  type?: 'text' | 'textarea' | 'html'
  /** dizi alanları (string[]) — virgülle ayrılarak girilir */
  array?: boolean
}

type TranslationsObj = Partial<Record<TargetLang, Record<string, any>>>

interface TranslationsPanelProps {
  /** TR (kaynak) form verisi — `name`, `description` vb. düz alanları içerir */
  source: Record<string, any>
  /** Hangi alanlar çevrilecek + label/tip bilgisi */
  fields: FieldDef[]
  /** Mevcut translations objesi (form state'inden) */
  value: TranslationsObj
  /** translations değişince çağrılır — form state'i güncelle */
  onChange: (next: TranslationsObj) => void
  /** Panel başlığı (opsiyonel) */
  title?: string
}

const LANG_LABELS: Record<TargetLang, { name: string; flag: string; dir: 'ltr' | 'rtl' }> = {
  en: { name: 'English', flag: '🇬🇧', dir: 'ltr' },
  ar: { name: 'العربية', flag: '🇸🇦', dir: 'rtl' },
}

const TranslationsPanel = ({
  source,
  fields,
  value,
  onChange,
  title = 'Çeviriler (Otomatik / Manuel)',
}: TranslationsPanelProps) => {
  const [activeLang, setActiveLang] = useState<TargetLang>('en')
  const [translating, setTranslating] = useState<null | 'all' | TargetLang>(null)
  const [error, setError] = useState<string | null>(null)

  const fieldKeys = useMemo(() => fields.map((f) => f.key), [fields])

  const setLangField = (lang: TargetLang, key: string, val: any) => {
    onChange({
      ...value,
      [lang]: {
        ...(value[lang] || {}),
        [key]: val,
      },
    })
  }

  const handleAutoFill = async (scope: 'all' | TargetLang, force = false) => {
    setError(null)
    setTranslating(scope)
    try {
      const result = await mergeTranslations(source, fieldKeys, value, { force })
      if (scope === 'all') {
        onChange({ ...value, ...result })
      } else {
        onChange({ ...value, [scope]: result[scope] })
      }
    } catch (e: any) {
      setError(e?.message || 'Çeviri sırasında hata oluştu.')
    } finally {
      setTranslating(null)
    }
  }

  const renderInput = (lang: TargetLang, field: FieldDef) => {
    const raw = value[lang]?.[field.key]
    const stringValue = field.array
      ? Array.isArray(raw)
        ? raw.join(', ')
        : (raw ?? '')
      : (raw ?? '')

    const onChangeValue = (v: string) => {
      if (field.array) {
        const arr = v
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean)
        setLangField(lang, field.key, arr)
      } else {
        setLangField(lang, field.key, v)
      }
    }

    const baseClass =
      'w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm'

    const dir = LANG_LABELS[lang].dir

    if (field.type === 'html') {
      return (
        <textarea
          value={stringValue as string}
          onChange={(e) => onChangeValue(e.target.value)}
          rows={10}
          dir={dir}
          className={`${baseClass} font-mono`}
          placeholder={`${field.label} — ${LANG_LABELS[lang].name}`}
        />
      )
    }
    if (field.type === 'textarea') {
      return (
        <textarea
          value={stringValue as string}
          onChange={(e) => onChangeValue(e.target.value)}
          rows={4}
          dir={dir}
          className={baseClass}
          placeholder={`${field.label} — ${LANG_LABELS[lang].name}`}
        />
      )
    }
    return (
      <input
        type="text"
        value={stringValue as string}
        onChange={(e) => onChangeValue(e.target.value)}
        dir={dir}
        className={baseClass}
        placeholder={`${field.label} — ${LANG_LABELS[lang].name}`}
      />
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mt-6">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <h3 className="text-lg font-semibold text-primary flex items-center">
          <FaGlobe className="mr-2" />
          {title}
        </h3>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleAutoFill('all', false)}
            disabled={translating !== null}
            className="bg-primary text-white px-3 py-1.5 rounded-md text-sm hover:bg-primary-dark transition-colors flex items-center disabled:opacity-50"
            title="Boş olan tüm dilleri Türkçeden otomatik üret"
          >
            <FaMagic className="mr-1.5" />
            {translating === 'all' ? 'Çevriliyor...' : 'Tümünü Otomatik Çevir'}
          </button>
          <button
            type="button"
            onClick={() => handleAutoFill('all', true)}
            disabled={translating !== null}
            className="bg-gray-200 text-gray-700 px-3 py-1.5 rounded-md text-sm hover:bg-gray-300 transition-colors flex items-center disabled:opacity-50"
            title="Mevcut çevirilerin üzerine yaz"
          >
            <FaSyncAlt className="mr-1.5" />
            Yenile
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-3 px-3 py-2 bg-red-50 text-red-700 text-sm rounded">
          {error}
        </div>
      )}

      <p className="text-xs text-gray-500 mb-4">
        TR alanlarını doldurduktan sonra <strong>"Tümünü Otomatik Çevir"</strong>'e
        basabilirsiniz. Her dilin kendi alanı manuel olarak da düzenlenebilir.
      </p>

      {/* Dil sekmeleri */}
      <div className="flex gap-1 border-b border-gray-200 mb-4">
        {TARGET_LANGS.map((lang) => (
          <button
            key={lang}
            type="button"
            onClick={() => setActiveLang(lang)}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
              activeLang === lang
                ? 'bg-primary text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <span className="mr-1">{LANG_LABELS[lang].flag}</span>
            {LANG_LABELS[lang].name}
          </button>
        ))}

        <div className="ml-auto flex items-center">
          <button
            type="button"
            onClick={() => handleAutoFill(activeLang, true)}
            disabled={translating !== null}
            className="text-xs text-primary hover:underline disabled:opacity-50"
            title={`${LANG_LABELS[activeLang].name} dilini Türkçeden yeniden üret`}
          >
            {translating === activeLang
              ? 'Çevriliyor...'
              : `Sadece ${LANG_LABELS[activeLang].name}'i yeniden üret`}
          </button>
        </div>
      </div>

      {/* Alanlar */}
      <div className="space-y-4">
        {fields.map((field) => (
          <div key={field.key}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {field.label}
              <span className="text-xs text-gray-400 ml-2">
                (TR: {truncate(formatSource(source[field.key], field.array), 60)})
              </span>
            </label>
            {renderInput(activeLang, field)}
          </div>
        ))}
      </div>
    </div>
  )
}

function formatSource(v: any, isArray?: boolean): string {
  if (v == null) return ''
  if (isArray && Array.isArray(v)) return v.join(', ')
  return String(v)
}

function truncate(s: string, n: number): string {
  if (s.length <= n) return s
  return s.slice(0, n) + '…'
}

export default TranslationsPanel
