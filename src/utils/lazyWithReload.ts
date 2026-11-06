import { lazy, type ComponentType } from 'react'

// Yeni sürüm yayına alınınca eski sayfa dosyaları (assets/*-<hash>.js) sunucudan silinir.
// Siteyi önceden açmış bir ziyaretçi bir linke tıkladığında eski dosyayı ister, yükleme
// başarısız olur ve sayfa beyaz kalır. Bu durumda sayfa bir kez yenilenerek yeni sürüm
// alınır; yenilemeden sonra da yüklenemiyorsa hata sonsuz döngü olmasın diye fırlatılır.
const RELOAD_KEY = 'chunk-reload-at'
const RELOAD_WINDOW_MS = 10_000

function reloadOnce(): boolean {
  try {
    const last = Number(sessionStorage.getItem(RELOAD_KEY) || 0)
    if (Date.now() - last < RELOAD_WINDOW_MS) return false
    sessionStorage.setItem(RELOAD_KEY, String(Date.now()))
  } catch {
    // sessionStorage erişilemiyorsa (gizli mod vb.) yine de bir kez dene
  }
  window.location.reload()
  return true
}

export function lazyWithReload<T extends ComponentType<any>>(factory: () => Promise<{ default: T }>) {
  return lazy(() =>
    factory().catch((error) => {
      if (reloadOnce()) {
        // Sayfa yenilenirken Suspense yükleniyor göstergesinde kalsın
        return new Promise<{ default: T }>(() => {})
      }
      throw error
    })
  )
}

// Vite'ın önceden yükleme (modulepreload / CSS) hataları için de aynı davranış
export function installPreloadErrorReload() {
  window.addEventListener('vite:preloadError', (event) => {
    if (reloadOnce()) event.preventDefault()
  })
}
