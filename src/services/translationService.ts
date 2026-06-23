/**
 * Otomatik çeviri servisi
 * - LibreTranslate public instance'larını dener, başarısız olursa MyMemory API'ye fallback yapar.
 * - Çeviriler localStorage'da cache'lenir (runtime fallback senaryosu için).
 * - Admin formları için çoklu alan + çoklu dil batch çevirisi yapar.
 *
 * Kaynak dil daima Türkçe (tr). Hedef diller: en, ar.
 */

const SOURCE_LANG = 'tr'
export const TARGET_LANGS = ['en', 'ar'] as const
export type TargetLang = typeof TARGET_LANGS[number]
export type SupportedLang = 'tr' | TargetLang

/* ------------------------------------------------------------------ *
 * localStorage cache (runtime için — DB'de saklanan çeviriler için değil)
 * ------------------------------------------------------------------ */

function getCacheKey(text: string, targetLang: string): string {
  let hash = 0
  for (let i = 0; i < text.length; i++) {
    const char = text.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash |= 0
  }
  return `tr_${targetLang}_${hash}_${text.length}`
}

function getCached(text: string, targetLang: string): string | null {
  try {
    const key = getCacheKey(text, targetLang)
    const item = localStorage.getItem(key)
    if (!item) return null
    const { value, ts } = JSON.parse(item)
    if (Date.now() - ts > 30 * 24 * 60 * 60 * 1000) {
      localStorage.removeItem(key)
      return null
    }
    return value
  } catch {
    return null
  }
}

function setCached(text: string, targetLang: string, translated: string): void {
  try {
    const key = getCacheKey(text, targetLang)
    localStorage.setItem(key, JSON.stringify({ value: translated, ts: Date.now() }))
  } catch {
    // localStorage dolu olabilir
  }
}

/* ------------------------------------------------------------------ *
 * Çeviri sağlayıcıları
 * ------------------------------------------------------------------ */

/**
 * Azure Translator Service (Opsiyonel / Premium)
 * - VITE_AZURE_TRANSLATOR_KEY ve VITE_AZURE_TRANSLATOR_REGION env değişkenleri tanımlıysa çalışır.
 */
async function tryAzureTranslate(text: string, targetLang: string): Promise<string | null> {
  const key = (import.meta.env.VITE_AZURE_TRANSLATOR_KEY || '').trim()
  const region = (import.meta.env.VITE_AZURE_TRANSLATOR_REGION || '').trim()
  if (!key || !region || key === 'your_azure_translator_key_here') return null

  try {
    const url = `https://api.cognitive.microsofttranslator.com/translate?api-version=3.0&from=${SOURCE_LANG}&to=${targetLang}`
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Ocp-Apim-Subscription-Key': key,
        'Ocp-Apim-Subscription-Region': region,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify([{ Text: text }]),
    })

    if (!res.ok) return null
    const data = await res.json()
    if (Array.isArray(data) && data[0]?.translations?.[0]?.text) {
      return data[0].translations[0].text
    }
  } catch (err) {
    console.error('Azure Translate Error:', err)
  }
  return null
}

/**
 * Google Translate'in anahtarsız (gtx) uç noktası — birincil sağlayıcı.
 * CORS açık (Access-Control-Allow-Origin: *), tarayıcıdan doğrudan çağrılabilir.
 * Uzun metinler GET URL sınırı için parçalara bölünür.
 */
async function tryGoogle(text: string, targetLang: string): Promise<string | null> {
  const chunks = text.length > 1800 ? splitIntoChunks(text, 1800) : [text]
  const out: string[] = []
  for (const chunk of chunks) {
    const part = await tryGoogleSingle(chunk, targetLang)
    if (part == null) return null
    out.push(part)
  }
  return out.join('')
}

async function tryGoogleSingle(text: string, targetLang: string): Promise<string | null> {
  try {
    // 1. Adım: Yerel Proxy (vite.config.ts) veya Canlı Proxy (vercel.json) üzerinden CORS'suz çağrıyı dene
    const url = `/api/translate-google?client=gtx&sl=${SOURCE_LANG}&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`
    const res = await fetch(url)
    if (res.ok) {
      const data = await res.json()
      if (Array.isArray(data) && Array.isArray(data[0])) {
        const translated = data[0]
          .map((seg: any) => (seg && typeof seg[0] === 'string' ? seg[0] : ''))
          .join('')
        return translated || null
      }
    }
  } catch {
    // Proxy başarısız olursa doğrudan Google Translate API'sine fallback yap
  }

  try {
    // 2. Adım: Doğrudan API çağrısını dene (CORS izinli tarayıcılar / sunucu tarafı testleri için)
    const url =
      `https://translate.googleapis.com/translate_a/single?client=gtx` +
      `&sl=${SOURCE_LANG}&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`
    const res = await fetch(url)
    if (!res.ok) return null
    const data = await res.json()
    if (Array.isArray(data) && Array.isArray(data[0])) {
      const translated = data[0]
        .map((seg: any) => (seg && typeof seg[0] === 'string' ? seg[0] : ''))
        .join('')
      return translated || null
    }
  } catch {
    /* ignore */
  }
  return null
}

/** Metni cümle sınırlarını koruyarak ~maxLen'lik parçalara böler. */
function splitIntoChunks(text: string, maxLen: number): string[] {
  const sentences = text.split(/(?<=[.!?])\s+/)
  const chunks: string[] = []
  let current = ''
  for (const s of sentences) {
    if ((current + ' ' + s).length > maxLen) {
      if (current) chunks.push(current.trim())
      current = s.length > maxLen ? s.slice(0, maxLen) : s
    } else {
      current = current ? current + ' ' + s : s
    }
  }
  if (current) chunks.push(current.trim())
  return chunks
}

async function tryMyMemory(text: string, targetLang: string): Promise<string | null> {
  // MyMemory'nin tek istekte sınırı ~500 karakter — uzun metinleri böl.
  if (text.length > 480) {
    const chunks = splitForMyMemory(text)
    const translated: string[] = []
    for (const chunk of chunks) {
      const part = await tryMyMemorySingle(chunk, targetLang)
      if (!part) return null
      translated.push(part)
    }
    return translated.join(' ')
  }
  return tryMyMemorySingle(text, targetLang)
}

async function tryMyMemorySingle(text: string, targetLang: string): Promise<string | null> {
  try {
    const res = await fetch(
      `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${SOURCE_LANG}|${targetLang}`
    )
    const data = await res.json()
    const t: string | undefined = data?.responseData?.translatedText
    if (t && !t.includes('MYMEMORY WARNING')) {
      return t
    }
  } catch {
    // ignore
  }
  return null
}

function splitForMyMemory(text: string): string[] {
  const sentences = text.split(/(?<=[.!?])\s+/)
  const chunks: string[] = []
  let current = ''
  for (const s of sentences) {
    if ((current + ' ' + s).length > 480) {
      if (current) chunks.push(current.trim())
      current = s
    } else {
      current = current ? current + ' ' + s : s
    }
  }
  if (current) chunks.push(current.trim())
  return chunks
}

/* ------------------------------------------------------------------ *
 * Public API
 * ------------------------------------------------------------------ */

/**
 * Tek bir metni hedef dile çevirir. Önce localStorage cache'e bakar.
 * Boş / aynı dil / hatalı durumda orijinali döndürür.
 */
export async function translateText(text: string, targetLang: string): Promise<string> {
  if (!text || !text.trim()) return text
  if (targetLang === SOURCE_LANG) return text

  const trimmed = text.trim()
  const cached = getCached(trimmed, targetLang)
  if (cached) return cached

  // 1. Azure Translate (Eğer anahtar tanımlıysa)
  let result = await tryAzureTranslate(trimmed, targetLang)

  // 2. Google Translate (Proxy üzerinden)
  if (!result) result = await tryGoogle(trimmed, targetLang)

  // 3. MyMemory (Fallback)
  if (!result) result = await tryMyMemory(trimmed, targetLang)

  if (!result) return trimmed

  setCached(trimmed, targetLang, result)
  return result
}

/**
 * Bir nesnedeki seçili alanları tek dile çevirir.
 * { name: 'Kardiyoloji', description: '...' } + 'en' →
 * { name: 'Cardiology', description: '...' }
 *
 * - String alanlar çevrilir.
 * - String dizileri (örn. tags, specialties) eleman eleman çevrilir.
 * - Diğer tipler (number, boolean, null) olduğu gibi geçer.
 * - İçinde URL/e-posta gibi `@`, `://` veya hex (#1a2b3c) içerenler atlanır.
 */
export async function translateFields<T extends Record<string, any>>(
  source: T,
  fields: (keyof T)[],
  targetLang: TargetLang
): Promise<Partial<T>> {
  const out: Partial<T> = {}
  for (const f of fields) {
    const v: any = source[f]
    if (v == null) continue
    if (typeof v === 'string') {
      if (!shouldTranslateString(v)) {
        out[f] = v as any
      } else {
        out[f] = (await translateText(v, targetLang)) as any
      }
    } else if (Array.isArray(v) && v.every((x: any) => typeof x === 'string')) {
      const arr: string[] = []
      for (const s of v as string[]) {
        arr.push(shouldTranslateString(s) ? await translateText(s, targetLang) : s)
      }
      out[f] = arr as any
    }
  }
  return out
}

/**
 * Bir nesneyi TÜM hedef dillere çevirir.
 * Çıktı: { en: {...}, ar: {...} } — DB'deki `translations` sütununa direkt yazılabilir.
 */
export async function translateToAllLangs<T extends Record<string, any>>(
  source: T,
  fields: (keyof T)[]
): Promise<Record<TargetLang, Partial<T>>> {
  const result = {} as Record<TargetLang, Partial<T>>
  for (const lang of TARGET_LANGS) {
    result[lang] = await translateFields(source, fields, lang)
  }
  return result
}

/**
 * Mevcut translations objesini yeni TR alanlarıyla birleştirir.
 * Sadece TR alanı değişmiş veya hedef dil boşsa yeniden çevirir.
 */
export async function mergeTranslations<T extends Record<string, any>>(
  source: T,
  fields: (keyof T)[],
  existing: Partial<Record<TargetLang, Partial<T>>> = {},
  options: { force?: boolean } = {}
): Promise<Record<TargetLang, Partial<T>>> {
  const result = {} as Record<TargetLang, Partial<T>>
  for (const lang of TARGET_LANGS) {
    const langExisting: any = existing[lang] || {}
    const updated: any = { ...langExisting }
    for (const f of fields) {
      const trVal: any = source[f]
      const existingVal: any = langExisting[f as string]
      const needsTranslation =
        options.force ||
        existingVal == null ||
        existingVal === '' ||
        (Array.isArray(existingVal) && existingVal.length === 0) ||
        (typeof trVal === 'string' && typeof existingVal === 'string' && trVal === existingVal && shouldTranslateString(trVal))

      if (!needsTranslation) continue
      if (trVal == null) continue

      if (typeof trVal === 'string') {
        if (!shouldTranslateString(trVal)) {
          updated[f as string] = trVal
        } else {
          const translated = await translateText(trVal, lang)
          if (translated !== trVal) {
            updated[f as string] = translated
          }
        }
      } else if (Array.isArray(trVal) && trVal.every((x: any) => typeof x === 'string')) {
        const arr: string[] = []
        let hasFailed = false
        for (const s of trVal as string[]) {
          if (!shouldTranslateString(s)) {
            arr.push(s)
          } else {
            const translated = await translateText(s, lang)
            if (translated === s) {
              hasFailed = true
            }
            arr.push(translated)
          }
        }
        if (!hasFailed) {
          updated[f as string] = arr
        }
      }
    }
    result[lang] = updated
  }
  return result
}

/**
 * URL, e-posta, telefon, hex renk gibi çevrilmemesi gereken stringleri filtreler.
 */
export function shouldTranslateString(s: string): boolean {
  if (!s || !s.trim()) return false
  const t = s.trim()
  // URL veya e-posta
  if (/^https?:\/\//i.test(t)) return false
  if (/^mailto:/i.test(t)) return false
  if (/^[\w.+-]+@[\w-]+\.[\w.-]+$/.test(t)) return false
  // Hex renk
  if (/^#[0-9a-f]{3,8}$/i.test(t)) return false
  // Tek başına sayı / telefon
  if (/^[\d\s+()\-]+$/.test(t) && t.length < 30) return false
  return true
}

/* ------------------------------------------------------------------ *
 * UI yardımcıları (mevcut runtime fallback hook'u için)
 * ------------------------------------------------------------------ */

export function useShouldTranslate(): boolean {
  const currentLang = typeof window !== 'undefined'
    ? localStorage.getItem('i18nextLng') || document.documentElement.lang || 'tr'
    : 'tr'
  return currentLang !== 'tr' && (TARGET_LANGS as readonly string[]).includes(currentLang)
}

export function getCurrentTargetLang(): SupportedLang {
  if (typeof window === 'undefined') return 'tr'
  const lng = localStorage.getItem('i18nextLng') || document.documentElement.lang || 'tr'
  if (lng.startsWith('en')) return 'en'
  if (lng.startsWith('ar')) return 'ar'
  return 'tr'
}
