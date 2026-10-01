import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

import tr from './locales/tr.json'
import en from './locales/en.json'
import ar from './locales/ar.json'
import ru from './locales/ru.json'
import es from './locales/es.json'
import fr from './locales/fr.json'
import de from './locales/de.json'

const resources = {
  tr: { translation: tr },
  en: { translation: en },
  ar: { translation: ar },
  ru: { translation: ru },
  es: { translation: es },
  fr: { translation: fr },
  de: { translation: de },
}

type Lang = keyof typeof resources
const SUPPORTED = Object.keys(resources) as Lang[]
const DEFAULT_LANG: Lang = 'en' // ülkenin dili sitede yoksa

/* ------------------------------------------------------------------ *
 * Ülkeye göre dil seçimi
 * Öncelik: 1) kullanıcının dil menüsünden yaptığı seçim
 *          2) IP'den tespit edilen ülkenin dili (/api/geo, 7 gün cache)
 *          3) ülke bilinmiyorsa tarayıcı dili, o da desteklenmiyorsa İngilizce
 * ------------------------------------------------------------------ */

const USER_CHOICE_KEY = 'lang_user_choice'
const GEO_CACHE_KEY = 'lang_geo'
const GEO_CACHE_TTL = 7 * 24 * 60 * 60 * 1000

const COUNTRY_LANGS: Record<string, Lang[]> = {}
const addCountries = (lang: Lang, codes: string) =>
  codes.split(' ').forEach((c) => (COUNTRY_LANGS[c] = [lang]))

addCountries('tr', 'TR')
addCountries('ar', 'SA AE QA KW BH OM YE IQ SY JO LB PS EG LY TN DZ MA SD MR')
addCountries('ru', 'RU BY KZ KG')
addCountries('es', 'ES MX AR CO CL PE VE EC GT CU BO DO HN PY SV NI CR PA UY PR')
addCountries('fr', 'FR MC SN CI CM ML BF NE TG BJ GA CG CD GN MG')
addCountries('de', 'DE AT LI')
// Çok dilli ülkeler: tarayıcı dili bu listedeyse o, değilse ilki
COUNTRY_LANGS.CH = ['de', 'fr']
COUNTRY_LANGS.BE = ['fr', 'de']
COUNTRY_LANGS.LU = ['fr', 'de']
COUNTRY_LANGS.CA = ['en', 'fr']

const storage = {
  get(key: string): string | null {
    try { return localStorage.getItem(key) } catch { return null }
  },
  set(key: string, value: string) {
    try { localStorage.setItem(key, value) } catch { /* gizli sekme vb. */ }
  },
}

const toSupported = (raw: string | null | undefined): Lang | null => {
  const base = (raw || '').toLowerCase().split('-')[0] as Lang
  return SUPPORTED.includes(base) ? base : null
}

const browserLangs = (): Lang[] =>
  typeof navigator === 'undefined'
    ? []
    : (navigator.languages?.length ? navigator.languages : [navigator.language])
        .map(toSupported)
        .filter((l): l is Lang => l != null)

function langForCountry(country: string | null): Lang {
  const candidates = country ? COUNTRY_LANGS[country] : undefined
  if (!candidates) return country ? DEFAULT_LANG : browserLangs()[0] ?? DEFAULT_LANG
  return browserLangs().find((l) => candidates.includes(l)) ?? candidates[0]
}

function readGeoCache(): Lang | null {
  const raw = storage.get(GEO_CACHE_KEY)
  if (!raw) return null
  try {
    const { lang, ts } = JSON.parse(raw)
    return Date.now() - ts < GEO_CACHE_TTL ? toSupported(lang) : null
  } catch {
    return null
  }
}

const userChoice = toSupported(storage.get(USER_CHOICE_KEY))
const cachedGeoLang = readGeoCache()
// Ülke henüz bilinmiyorsa geçici tahmin: tarayıcı dili (çoğu zaman ülke diliyle aynı)
const initialLang: Lang = userChoice ?? cachedGeoLang ?? browserLangs()[0] ?? DEFAULT_LANG

i18n.use(initReactI18next).init({
  resources,
  lng: initialLang,
  fallbackLng: 'tr',
  supportedLngs: SUPPORTED,
  nonExplicitSupportedLngs: true,
  interpolation: {
    escapeValue: false,
  },
})

if (!userChoice && !cachedGeoLang && typeof window !== 'undefined') {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 3000)
  fetch('/api/geo', { signal: controller.signal })
    .then((res) => (res.ok ? res.json() : null))
    .then((data: { country?: string | null } | null) => {
      if (!data || !('country' in data)) return // yerel geliştirmede /api/geo yok
      const lang = langForCountry(data.country ?? null)
      storage.set(GEO_CACHE_KEY, JSON.stringify({ lang, ts: Date.now() }))
      // Bu arada kullanıcı menüden dil seçtiyse ona dokunma
      if (!storage.get(USER_CHOICE_KEY) && i18n.language !== lang) i18n.changeLanguage(lang)
    })
    .catch(() => { /* ağ hatası: tarayıcı diliyle devam */ })
    .finally(() => clearTimeout(timer))
}

/** Dil menüsünden yapılan seçim — kalıcıdır, ülke tespitinin önüne geçer. */
export function setUserLanguage(lang: string) {
  storage.set(USER_CHOICE_KEY, lang)
  return i18n.changeLanguage(lang)
}

// <html lang> ve yön (dir) bilgisini aktif dile göre senkronize et (WCAG 3.1.1 / 3.1.2)
const RTL_LANGS = ['ar']
const applyDocumentLang = (lng: string) => {
  if (typeof document === 'undefined') return
  document.documentElement.lang = lng
  document.documentElement.dir = RTL_LANGS.includes(lng) ? 'rtl' : 'ltr'
}

applyDocumentLang(i18n.language || initialLang)
i18n.on('languageChanged', applyDocumentLang)

export default i18n
