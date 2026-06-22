import { useEffect, useRef } from 'react'

/**
 * Erişilebilir modal/dialog için odak hapsi (focus trap).
 * WCAG 2.1.2 (Klavye Tuzağı Yok) ve 2.4.3 (Odak Sırası) ile uyumludur.
 *
 * - Açılınca ilk odaklanabilir ögeye odaklanır
 * - Tab/Shift+Tab odağı kapsayıcı içinde döndürür
 * - Esc tuşu `onClose` çağırır
 * - Kapanınca odağı önceki ögeye iade eder
 */
export function useFocusTrap<T extends HTMLElement>(
  active: boolean,
  onClose?: () => void
) {
  const containerRef = useRef<T | null>(null)

  useEffect(() => {
    if (!active) return

    const container = containerRef.current
    if (!container) return

    const previouslyFocused = document.activeElement as HTMLElement | null

    const getFocusable = () =>
      Array.from(
        container.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
        )
      ).filter((el) => el.offsetParent !== null || el === document.activeElement)

    // İlk odaklanabilir ögeye odaklan
    const focusables = getFocusable()
    if (focusables.length > 0) {
      focusables[0].focus()
    } else {
      container.focus()
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation()
        onClose?.()
        return
      }
      if (e.key !== 'Tab') return

      const items = getFocusable()
      if (items.length === 0) {
        e.preventDefault()
        return
      }
      const first = items[0]
      const last = items[items.length - 1]
      const current = document.activeElement as HTMLElement

      if (e.shiftKey) {
        if (current === first || !container.contains(current)) {
          e.preventDefault()
          last.focus()
        }
      } else {
        if (current === last || !container.contains(current)) {
          e.preventDefault()
          first.focus()
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      // Odağı tetikleyen ögeye iade et
      if (previouslyFocused && typeof previouslyFocused.focus === 'function') {
        previouslyFocused.focus()
      }
    }
  }, [active, onClose])

  return containerRef
}
