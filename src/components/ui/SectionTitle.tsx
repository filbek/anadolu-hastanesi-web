import { motion } from 'framer-motion'

interface SectionTitleProps {
  label?: string
  title: string
  subtitle?: string
  alignment?: 'left' | 'center' | 'right'
  light?: boolean
  /** Başlık seviyesi — sayfanın ana başlığı için 'h1' kullanın (erişilebilirlik / WCAG 1.3.1). Varsayılan 'h2'. */
  as?: 'h1' | 'h2'
}

const SectionTitle = ({
  label,
  title,
  subtitle,
  alignment = 'center',
  light = false,
  as = 'h2',
}: SectionTitleProps) => {
  const Heading = as === 'h1' ? motion.h1 : motion.h2
  const alignmentClasses = {
    left: 'text-left',
    center: 'text-center mx-auto',
    right: 'text-right ml-auto',
  }

  const labelColor = light ? 'text-ocean-300' : 'text-ocean-500'
  const titleColor = light ? 'text-white' : 'text-primary-600'
  const subtitleColor = light ? 'text-white/70' : 'text-neutral-500'
  const lineColor = light ? 'bg-ocean-400' : 'bg-coral-500'

  return (
    <div className={`max-w-3xl ${alignmentClasses[alignment]}`}>
      {label && (
        <motion.span
          initial={false}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.1 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className={`inline-block font-display text-xs font-semibold uppercase tracking-[0.12em] mb-3 ${labelColor}`}
        >
          {label}
        </motion.span>
      )}

      <Heading
        initial={false}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className={`section-title mb-4 ${titleColor}`}
      >
        {title}
      </Heading>

      {subtitle && (
        <motion.p
          initial={false}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.1 }}
          transition={{ duration: 0.45, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className={`section-subtitle ${subtitleColor}`}
        >
          {subtitle}
        </motion.p>
      )}

      <motion.div
        initial={false}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true, amount: 0.1 }}
        transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
        className={`h-[3px] w-16 rounded-full mt-6 origin-${alignment === 'center' ? 'center' : alignment} ${lineColor} ${
          alignment === 'center' ? 'mx-auto' : ''
        }`}
        style={{ transformOrigin: alignment === 'center' ? 'center' : alignment }}
      />
    </div>
  )
}

export default SectionTitle
