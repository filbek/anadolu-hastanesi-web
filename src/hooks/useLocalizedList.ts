import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { translateText, TARGET_LANGS, type TargetLang } from '../services/translationService'

type WithTranslations = {
  translations?: Partial<Record<TargetLang, Record<string, any>>> | null
} & Record<string, any>

function normalizeLang(raw: string | undefined): 'tr' | TargetLang {
  if (!raw) return 'tr'
  if (raw.startsWith('en')) return 'en'
  if (raw.startsWith('ar')) return 'ar'
  return 'tr'
}

/**
 * Bir kayıt listesinin seçili alanlarını aktif dile lokalize eder:
 *  1) DB'deki `translations[lang][field]` varsa onu kullanır (anlık, güvenilir),
 *  2) yoksa runtime çeviri API'sine düşer (localStorage cache'li),
 *  3) çeviri başarısızsa orijinal (TR) metni korur.
 *
 * Önce orijinal veri döner, çeviriler geldikçe yeniden render olur.
 * Özel adlar (doktor/hastane adı vb.) için o alanı `fields` listesine EKLEMEYİN.
 */
export function useLocalizedList<T extends WithTranslations>(
  items: T[] | undefined,
  fields: string[]
): T[] {
  const { i18n } = useTranslation()
  const lang = normalizeLang(i18n.language)
  const safeItems = items ?? []
  const [localized, setLocalized] = useState<T[]>(safeItems)
  const fieldKey = fields.join(',')
  const idsKey = safeItems.map((i) => (i as any).id ?? '').join('|')

  useEffect(() => {
    if (lang === 'tr' || !(TARGET_LANGS as readonly string[]).includes(lang)) {
      setLocalized(safeItems)
      return
    }
    let cancelled = false
    setLocalized(safeItems) // önce orijinali göster, sonra çevirileri uygula

    ;(async () => {
      const result = await Promise.all(
        safeItems.map(async (item) => {
          const copy: any = { ...item }
          for (const f of fields) {
            if (f.includes('.')) {
              const parts = f.split('.')
              const parentKey = parts[0]
              const childKey = parts[1]
              const parentObj = item[parentKey]
              if (parentObj) {
                copy[parentKey] = { ...parentObj }
                
                // 1. Check if the nested object itself has its own translations column
                let dbVal = parentObj.translations?.[lang as TargetLang]?.[childKey]
                
                // 2. Fallback: check if the parent object has translations for this nested path
                if (dbVal == null || dbVal === '') {
                  dbVal = item.translations?.[lang as TargetLang]?.[f]
                }
                
                if (dbVal != null && dbVal !== '') {
                  copy[parentKey][childKey] = dbVal
                } else {
                  const v = parentObj[childKey]
                  if (typeof v === 'string' && v.trim()) {
                    try {
                      copy[parentKey][childKey] = await translateText(v, lang)
                    } catch {
                      /* orijinali koru */
                    }
                  }
                }
              }
            } else {
              const dbVal = item.translations?.[lang as TargetLang]?.[f]
              if (dbVal != null && dbVal !== '') {
                copy[f] = dbVal
                continue
              }
              const v = item[f]
              if (typeof v === 'string' && v.trim()) {
                try {
                  copy[f] = await translateText(v, lang)
                } catch {
                  /* orijinali koru */
                }
              }
            }
          }
          return copy as T
        })
      )
      if (!cancelled) setLocalized(result)
    })()

    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang, fieldKey, idsKey])

  return lang === 'tr' ? safeItems : localized
}

/**
 * Tek bir kayıt için lokalizasyon.
 */
export function useLocalizedItem<T extends WithTranslations>(
  item: T | null | undefined,
  fields: string[]
): T | null {
  const list = useLocalizedList(item ? [item] : [], fields)
  return list[0] ?? null
}
