interface LogoProps {
  variant?: 'default' | 'white'
  clickable?: boolean
}

const Logo = ({ variant = 'default', clickable = true }: LogoProps) => {
  const textColor = variant === 'white' ? 'text-white' : 'text-primary'

  const logoContent = (
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
