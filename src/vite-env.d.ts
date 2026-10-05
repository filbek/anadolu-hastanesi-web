/// <reference types="vite/client" />

/** Derleme tarihi (gg.aa.yyyy, İstanbul saati) — vite.config.ts içinde tanımlanır. */
declare const __BUILD_DATE__: string

interface Window {
  dataLayer: Record<string, any>[]
  gtag?: (...args: any[]) => void
}
