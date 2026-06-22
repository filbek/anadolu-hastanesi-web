# React + Vite i18next Multilingual System — Vibe Coding Reference

> This document is extracted from the Anadolu Hastaneleri website's translation system and can be **directly applied to any React + Vite project**.

---

## 1. System Overview

```
src/
├── i18n.ts                  ← Central configuration file
├── main.tsx                 ← Activates the system via import './i18n'
├── locales/
│   ├── tr.json              ← Turkish strings
│   ├── en.json              ← English strings
│   └── ar.json              ← Arabic strings
└── components/
    └── layout/
        └── Header.tsx       ← Language switcher UI lives here
```

**Flow:**
1. `main.tsx` → `import './i18n'` → system initializes
2. Browser checks `localStorage` → language stored? → uses it
3. Otherwise checks `navigator` (browser language) → otherwise falls back to `'tr'`
4. Any component calls `useTranslation()` hook and uses `t('key')`
5. When the user triggers `i18n.changeLanguage('en')` → entire UI updates instantly + saved to localStorage

---

## 2. Package Installation

```bash
npm install i18next react-i18next i18next-browser-languagedetector
```

| Package | Purpose |
|---------|---------|
| `i18next` | Core translation engine |
| `react-i18next` | React hooks (`useTranslation`) |
| `i18next-browser-languagedetector` | Auto-detects browser language |

---

## 3. Configuration File (`src/i18n.ts`)

```typescript
import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

// Import JSON locale files
import tr from './locales/tr.json'
import en from './locales/en.json'
import ar from './locales/ar.json'

const resources = {
  tr: { translation: tr },
  en: { translation: en },
  ar: { translation: ar },
}

i18n
  .use(LanguageDetector)      // Browser language detection
  .use(initReactI18next)      // React integration
  .init({
    resources,
    fallbackLng: 'tr',        // Use Turkish if language is not found
    lng: 'tr',                // Initial language
    interpolation: {
      escapeValue: false,     // React already handles XSS protection
    },
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],  // Detection priority
      caches: ['localStorage'],  // Save selected language to localStorage
    },
  })

export default i18n
```

### Key Configuration Notes

- **`fallbackLng`**: Falls back to this language if a key is missing in the active language
- **`escapeValue: false`**: React already sanitizes output, no need for double escaping
- **`detection.order`**: Language is resolved in order: localStorage first, then browser setting, then HTML lang attribute
- **`detection.caches: ['localStorage']`**: The user's selected language persists across sessions

---

## 4. Integration in `main.tsx`

```typescript
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './index.css'
import './i18n'          // ← This single line is enough. It runs as a side effect.

ReactDOM.createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
)
```

> **Critical:** The `import './i18n'` line must run **before** any App code that uses translations.

---

## 5. JSON Locale File Structure

### Core Rule: Nested Objects

```json
{
  "nav": {
    "home": "Home",
    "hospitals": "Our Hospitals",
    "contact": "Contact"
  },
  "hero": {
    "title": "Your Health",
    "subtitle": "We are always by your side.",
    "cta": "Book Appointment"
  },
  "common": {
    "loading": "Loading...",
    "send": "Send",
    "stats": {
      "patients": "Annual Patients",
      "doctors": "Expert Doctors"
    }
  }
}
```

### Dot Notation Access

```typescript
t('nav.home')                // → "Home"
t('common.stats.patients')  // → "Annual Patients"
```

### Consistency Rule

All JSON files must share the **same key structure**:

```
tr.json:  { "hero": { "title": "Sağlığınız" } }
en.json:  { "hero": { "title": "Your Health" } }
ar.json:  { "hero": { "title": "صحتك" } }
```

---

## 6. Usage in Components

### Basic Usage

```typescript
import { useTranslation } from 'react-i18next'

const MyComponent = () => {
  const { t } = useTranslation()

  return (
    <div>
      <h1>{t('hero.title')}</h1>
      <p>{t('hero.subtitle')}</p>
      <button>{t('common.send')}</button>
    </div>
  )
}
```

### Accessing the `i18n` Instance for Language Switching

```typescript
const { t, i18n } = useTranslation()

// Change language (automatically saves to localStorage)
i18n.changeLanguage('en')

// Read the active language
console.log(i18n.language)  // 'tr' | 'en' | 'ar'
```

### In Placeholder Attributes

```typescript
<input placeholder={t('nav.searchDoctor')} />
```

### In Conditional Rendering

```typescript
{i18n.language === 'ar' && (
  <div dir="rtl">...</div>
)}
```

---

## 7. Language Switcher Component (Taken Directly from Header.tsx)

```typescript
import { useTranslation } from 'react-i18next'

const LanguageSwitcher = () => {
  const { i18n } = useTranslation()

  return (
    <div className="flex items-center gap-0.5 text-[11px] font-semibold 
                    text-neutral-400 bg-neutral-100 rounded-lg p-0.5">
      {(['tr', 'en', 'ar'] as const).map((lang) => (
        <button
          key={lang}
          onClick={() => i18n.changeLanguage(lang)}
          className={`px-2 py-1 rounded-md cursor-pointer transition-colors uppercase ${
            i18n.language === lang
              ? 'bg-white text-primary-600 shadow-sm'
              : 'hover:bg-white/60 hover:text-neutral-600'
          }`}
        >
          {lang}
        </button>
      ))}
    </div>
  )
}
```

**What it does:**
- Maps over `['tr', 'en', 'ar']` → renders a button for each
- `i18n.changeLanguage(lang)` → switches the language
- `i18n.language === lang` → highlights the active language
- Selection is automatically saved to localStorage

---

## 8. Recommended JSON Namespace Structure

Namespaces used in the Anadolu Hastaneleri project:

| Namespace | Description |
|-----------|-------------|
| `nav` | Navigation links |
| `header.dropdown` | Header dropdown menu items |
| `hero` | Homepage hero section |
| `footer` | Footer text content |
| `footerLinks` | Footer link labels |
| `common` | Shared/global strings (buttons, errors, loading, etc.) |
| `contactPage` | Contact page strings |
| `doctorsPage` | Doctors listing page |
| `healthTourismPage` | Health tourism page |
| `admin` | Admin panel strings |

---

## 9. Common Pitfalls (Gotchas)

### ❌ Missing Translation Keys

Some keys in `en.json` and `ar.json` were left in Turkish (mostly in the `admin` namespace):

```json
// Inside en.json and ar.json
"confirmDeleteAccreditation": "Bu akreditasyonu silmek istediğinizden emin misiniz?"
```

This does not cause errors because `fallbackLng: 'tr'` catches it — but for a polished production app, all keys should be translated.

### ❌ RTL (Right-to-Left) Support

For Arabic (`ar`), the HTML `dir="rtl"` attribute is **not set automatically**. You must handle it manually:

```typescript
// In App.tsx or a layout component
useEffect(() => {
  document.documentElement.dir = i18n.language === 'ar' ? 'rtl' : 'ltr'
}, [i18n.language])
```

### ✅ Interpolation (Variable Injection)

```json
// en.json
{
  "welcome": "Hello, {{name}}!"
}
```

```typescript
t('welcome', { name: 'John' })  // → "Hello, John!"
```

---

## 10. Vibe Coding Prompt Templates

### Adding Translations to a New Page

```
Add i18next translation support to this React page:
- Import useTranslation hook
- Replace all hardcoded strings with t('pageName.keyName')
- Add the corresponding keys to src/locales/tr.json, en.json, ar.json
- Use the naming format: "pageName.sectionName.elementName"
- Follow the existing namespace structure (nav, hero, common, footer, etc.)
```

### Adding a New Language

```
Add [LANGUAGE_CODE] language support to this React i18next project:
- Create src/locales/[lang_code].json (same structure as en.json)
- Import and add it to resources in src/i18n.ts
- Add [lang_code] to the language list in the Header switcher
- Translate all strings into [LANGUAGE]
```

### Language Switcher Component

```
Add a language switcher to the Header component:
- Use i18next useTranslation hook
- Change language with i18n.changeLanguage()
- Highlight the active language
- Languages: ['tr', 'en', 'ar']
- Selection should automatically persist to localStorage
```

---

## 11. Quick Start (Copy-Paste Setup)

### Step 1: Install packages
```bash
npm install i18next react-i18next i18next-browser-languagedetector
```

### Step 2: Create `src/i18n.ts`
*(Paste the code from Section 3)*

### Step 3: Create `src/locales/en.json`
```json
{
  "nav": { "home": "Home" },
  "common": { "loading": "Loading..." }
}
```

### Step 4: Add to `src/main.tsx`
```typescript
import './i18n'  // ← At the top, before App
```

### Step 5: Use in a component
```typescript
const { t, i18n } = useTranslation()
<h1>{t('nav.home')}</h1>
<button onClick={() => i18n.changeLanguage('tr')}>TR</button>
```

---

## 12. Project File Reference

| File | Description |
|------|-------------|
| `src/i18n.ts` | Main configuration |
| `src/main.tsx` | `import './i18n'` entry point |
| `src/locales/tr.json` | 1715 lines, ~86KB Turkish |
| `src/locales/en.json` | 1715 lines, ~86KB English |
| `src/locales/ar.json` | 1715 lines, ~88KB Arabic |
| `src/components/layout/Header.tsx` | Language switcher UI (lines 196–211) |

**Active Languages:** `tr` (Turkish) · `en` (English) · `ar` (Arabic)  
**Default Language:** `tr`  
**Persistence:** `localStorage` → key: `i18nextLng`
