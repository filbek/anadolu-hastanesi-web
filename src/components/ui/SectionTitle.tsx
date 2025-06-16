import { motion } from 'framer-motion'

interface SectionTitleProps {
  title: string
  subtitle?: string
  alignment?: 'left' | 'center' | 'right'
  light?: boolean
}

const SectionTitle = ({ 
  title, 
  subtitle, 
  alignment = 'center',
  light = false 
}: SectionTitleProps) => {
  const alignmentClasses = {
    left: 'text-left',
    center: 'text-center mx-auto',
    right: 'text-right ml-auto',
  }

  const titleColor = light ? 'text-white' : 'text-primary'
  const subtitleColor = light ? 'text-white/80' : 'text-secondary'

  return (
    <div className={`max-w-3xl mb-12 ${alignmentClasses[alignment]}`}>
      <motion.h2 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className={`text-3xl md:text-4xl font-bold mb-4 ${titleColor}`}
      >
        {title}
      </motion.h2>
      
      {subtitle && (
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className={`text-lg ${subtitleColor}`}
        >
          {subtitle}
        </motion.p>
      )}
      
      <motion.div 
        initial={{ width: 0 }}
        whileInView={{ width: alignment === 'center' ? '120px' : '80px' }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className={`h-1 bg-accent mt-6 ${alignment === 'center' ? 'mx-auto' : alignment === 'right' ? 'ml-auto' : ''}`}
      />
    </div>
  )
}

export default SectionTitle
