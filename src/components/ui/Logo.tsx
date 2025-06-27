import { useState, useEffect } from 'react'

interface LogoProps {
  variant?: 'default' | 'white'
  clickable?: boolean
}

const Logo = ({ variant = 'default', clickable = true }: LogoProps) => {
  const [customLogo, setCustomLogo] = useState<string>('')
  const textColor = variant === 'white' ? 'text-white' : 'text-primary'

  useEffect(() => {
    // Load custom logo from localStorage or API
    const savedLogo = localStorage.getItem('site_logo_url')
    if (savedLogo) {
      setCustomLogo(savedLogo)
    }
  }, [])

  const logoContent = customLogo ? (
    <img
      src={customLogo}
      alt="Anadolu Hastaneleri"
      className="h-full w-auto object-contain max-h-14"
      onError={() => setCustomLogo('')} // Fallback to default if image fails
    />
  ) : (
    <div className="flex items-center">
      <i className={`bi bi-hospital text-2xl ${variant === 'white' ? 'text-white' : 'text-accent'} mr-2`}></i>
      <div className="flex flex-col">
        <span className={`font-bold text-xl leading-tight ${textColor}`}>Anadolu</span>
        <span className={`font-medium text-sm leading-tight ${textColor} opacity-90`}>Hastaneleri</span>
      </div>
    </div>
  )

  if (!clickable) {
    return logoContent
  }

  return (
    <a href="/" className="flex items-center">
      {logoContent}
    </a>
  )
}

export default Logo
