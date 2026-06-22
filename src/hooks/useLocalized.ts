import { useTranslation } from 'react-i18next'
import { TARGET_LANGS, type SupportedLang, type TargetLang } from '../services/translationService'

type WithTranslations = {
  translations?: Partial<Record<TargetLang, Record<string, any>>> | null
} & Record<string, any>

/**
 * DB'deki `translations` JSONB sütunundan dile uygun değeri döndürür.
 * - Geçerli dil 'tr' ise daima orijinal alanı döndürür.
 * - Çeviri varsa onu, yoksa TR fallback.
 *
 * Örnek:
 *   const name = getLocalized(department, 'name', 'en')
 *   const desc = getLocalized(department, 'description', 'ar')
 */
export function getLocalized<T extends WithTranslations, K extends keyof T & string>(
  item: T | null | undefined,
  field: K,
  lang: SupportedLang
): T[K] | string {
  if (!item) return '' as any
  const trVal = item[field]
  if (lang === 'tr') return trVal
  if (!(TARGET_LANGS as readonly string[]).includes(lang)) return trVal
  const translated = item.translations?.[lang as TargetLang]?.[field]
  if (translated == null || translated === '') return trVal
  if (Array.isArray(translated) && translated.length === 0) return trVal
  return translated
}

/**
 * React hook versiyonu: aktif i18n diline göre alanı döndürür.
 *
 * Örnek:
 *   const t = useLocalized(department)
 *   <h1>{t('name')}</h1>
 *   <p>{t('description')}</p>
 */
export function useLocalized<T extends WithTranslations>(item: T | null | undefined) {
  const { i18n } = useTranslation()
  const lang = normalizeLang(i18n.language)
  return <K extends keyof T & string>(field: K): T[K] | string => {
    return getLocalized(item, field, lang)
  }
}

function normalizeLang(raw: string | undefined): SupportedLang {
  if (!raw) return 'tr'
  if (raw.startsWith('en')) return 'en'
  if (raw.startsWith('ar')) return 'ar'
  return 'tr'
}
