import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

import tr from './locales/tr.json'
import en from './locales/en.json'
import ar from './locales/ar.json'

const resources = {
  tr: { translation: tr },
  en: { translation: en },
  ar: { translation: ar },
}

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'tr',
    lng: 'tr',
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
    },
  })

// <html lang> ve yön (dir) bilgisini aktif dile göre senkronize et (WCAG 3.1.1 / 3.1.2)
const RTL_LANGS = ['ar']
const applyDocumentLang = (lng: string) => {
  if (typeof document === 'undefined') return
  document.documentElement.lang = lng
  document.documentElement.dir = RTL_LANGS.includes(lng) ? 'rtl' : 'ltr'
}

applyDocumentLang(i18n.language || 'tr')
i18n.on('languageChanged', applyDocumentLang)

export default i18n
