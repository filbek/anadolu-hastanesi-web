import { motion } from 'framer-motion'
import { ReactNode } from 'react'

interface ScrollRevealProps {
    children: ReactNode
    direction?: 'up' | 'down' | 'left' | 'right'
    delay?: number
    duration?: number
    className?: string
}

const ScrollReveal = ({
    children,
    direction = 'up',
    delay = 0,
    duration = 0.8,
    className = ''
}: ScrollRevealProps) => {
    const variants = {
        hidden: {
            opacity: 0,
            y: direction === 'up' ? 40 : direction === 'down' ? -40 : 0,
            x: direction === 'left' ? 40 : direction === 'right' ? -40 : 0,
        },
        visible: {
            opacity: 1,
            y: 0,
            x: 0,
            transition: {
                duration,
                delay,
                ease: [0.16, 1, 0.3, 1], // Premium ease-out cubic
            },
        },
    }

    return (
        <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-20%' }}
            variants={variants}
            className={className}
        >
            {children}
        </motion.div>
    )
}

export default ScrollReveal
