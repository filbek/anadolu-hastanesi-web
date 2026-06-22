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
    duration = 0.5,
    className = ''
}: ScrollRevealProps) => {
    const offset = 20

    const variants = {
        hidden: {
            // NO opacity change — element is always visible
            // Only a subtle position shift so there's no "invisible" flash
            y: direction === 'up' ? offset : direction === 'down' ? -offset : 0,
            x: direction === 'left' ? offset : direction === 'right' ? -offset : 0,
        },
        visible: {
            y: 0,
            x: 0,
            transition: {
                duration,
                delay,
                ease: [0.22, 1, 0.36, 1],
            },
        },
    }

    return (
        <motion.div
            initial={false}
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            variants={variants}
            className={className}
        >
            {children}
        </motion.div>
    )
}

export default ScrollReveal
