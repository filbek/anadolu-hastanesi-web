import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

interface LogoProps {
  variant?: 'default' | 'white'
  clickable?: boolean
  size?: 'default' | 'large'
}

const Logo = ({ variant = 'default', clickable = true, size = 'default' }: LogoProps) => {
  const [customLogo, setCustomLogo] = useState<string>('')
  const isLarge = size === 'large'
  const isWhite = variant === 'white'

  const defaultLogo = "https://www.anadoluhastaneleri.com/img/anadolu-hastanesi-logo.png"

  useEffect(() => {
    const fetchLogo = async () => {
      try {
        const { data, error } = await supabase
          .from('site_settings')
          .select('logo_url')
          .single()

        if (error) throw error
        if (data?.logo_url) {
          setCustomLogo(data.logo_url)
        }
      } catch (err) {
        // Supabase erişiminde hata olursa localStorage'dan dene
        const cachedLogo = localStorage.getItem('site_logo_url')
        if (cachedLogo) {
          setCustomLogo(cachedLogo)
        }
        console.error('Logo fetch error:', err)
      }
    }

    fetchLogo()
  }, [])

  const logoContent = (
    <img
      src={customLogo || defaultLogo}
      alt="Anadolu Hastaneleri"
      className={`w-auto object-contain ${isLarge ? 'h-11 sm:h-14 lg:h-16' : 'h-9 md:h-12'} ${isWhite && !customLogo ? 'brightness-0 invert' : ''}`}
      referrerPolicy="no-referrer"
      crossOrigin="anonymous"
      onError={() => setCustomLogo('')}
    />
  )

  if (!clickable) {
    return (
      <span className={`flex items-center ${isLarge ? 'h-11 sm:h-14 lg:h-16' : 'h-9 md:h-12'}`}>
        {logoContent}
      </span>
    )
  }

  return (
    <a href="/" className="flex items-center">
      {logoContent}
    </a>
  )
}

export default Logo
