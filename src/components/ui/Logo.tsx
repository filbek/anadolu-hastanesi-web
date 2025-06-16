import { Link } from 'react-router-dom'

interface LogoProps {
  variant?: 'default' | 'white'
}

const Logo = ({ variant = 'default' }: LogoProps) => {
  const textColor = variant === 'white' ? 'text-white' : 'text-primary'
  
  return (
    <Link to="/" className="flex items-center">
      <div className="flex items-center">
        <i className={`bi bi-hospital text-2xl ${variant === 'white' ? 'text-white' : 'text-accent'} mr-2`}></i>
        <div className="flex flex-col">
          <span className={`font-bold text-xl leading-tight ${textColor}`}>Anadolu</span>
          <span className={`font-medium text-sm leading-tight ${textColor} opacity-90`}>Hastaneleri</span>
        </div>
      </div>
    </Link>
  )
}

export default Logo
