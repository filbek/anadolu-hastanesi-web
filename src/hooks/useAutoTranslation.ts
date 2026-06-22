import { useState, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { translateText, getCurrentTargetLang } from '../services/translationService'

export function useAutoTranslation(originalText: string) {
  const { i18n } = useTranslation()
  const targetLang = getCurrentTargetLang()
  const shouldTranslate = targetLang !== 'tr'

  const [text, setText] = useState(originalText)
  const [isTranslating, setIsTranslating] = useState(false)

  const doTranslate = useCallback(async () => {
    if (!shouldTranslate || !originalText || originalText.trim().length === 0) {
      setText(originalText)
      return
    }
    setIsTranslating(true)
    try {
      const translated = await translateText(originalText, targetLang)
      setText(translated)
    } catch {
      setText(originalText)
    } finally {
      setIsTranslating(false)
    }
  }, [originalText, shouldTranslate, targetLang])

  useEffect(() => {
    doTranslate()
  }, [doTranslate, i18n.language, originalText])

  return { text, isTranslating, originalText }
}
