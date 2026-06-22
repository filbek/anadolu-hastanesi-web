import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { useAutoTranslation } from '../../hooks/useAutoTranslation'
import { TARGET_LANGS, type TargetLang } from '../../services/translationService'

interface AutoTranslateProps {
  /** Çevrilecek (Türkçe) metin */
  text: string
  /** Opsiyonel: bu nesnenin DB'deki translations objesi (Hibrit C). Verilirse önce
   *  burada çeviri aranır, sonra runtime API fallback'a düşer. */
  translations?: Partial<Record<TargetLang, Record<string, any>>> | null
  /** translations objesindeki alan adı (örn. 'name', 'description') */
  field?: string
  as?: 'span' | 'div' | 'p' | 'h1' | 'h2' | 'h3' | 'h4'
  className?: string
  showIndicator?: boolean
}

const AutoTranslate = ({
  text,
  translations,
  field,
  as: Tag = 'span',
  className = '',
  showIndicator = false,
}: AutoTranslateProps) => {
  const { i18n } = useTranslation()
  const lang = normalizeLang(i18n.language)

  // 1) DB'de hazır çeviri var mı?
  const dbTranslation = useMemo(() => {
    if (lang === 'tr') return null
    if (!translations || !field) return null
    if (!(TARGET_LANGS as readonly string[]).includes(lang)) return null
    const v = translations[lang as TargetLang]?.[field]
    if (v == null) return null
    if (typeof v === 'string' && v.trim() === '') return null
    return v
  }, [translations, field, lang])

  // 2) Runtime fallback — sadece DB'de çeviri yoksa çalışsın
  const { text: runtimeText, isTranslating } = useAutoTranslation(
    dbTranslation == null ? text : '' // boş geçince hook çevirmez
  )

  const finalText =
    dbTranslation != null
      ? typeof dbTranslation === 'string'
        ? dbTranslation
        : String(dbTranslation)
      : runtimeText || text

  return (
    <Tag className={className}>
      {finalText}
      {showIndicator && dbTranslation == null && isTranslating && (
        <motion.span
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 1.2, repeat: Infinity }}
          className="inline-block w-1.5 h-1.5 rounded-full bg-ocean-400 ml-1.5 align-middle"
        />
      )}
    </Tag>
  )
}

function normalizeLang(raw: string | undefined): 'tr' | TargetLang {
  if (!raw) return 'tr'
  if (raw.startsWith('en')) return 'en'
  if (raw.startsWith('ar')) return 'ar'
  return 'tr'
}

export default AutoTranslate
