/// <reference types="vite/client" />

interface Window {
  dataLayer: Record<string, any>[]
  gtag?: (...args: any[]) => void
}
