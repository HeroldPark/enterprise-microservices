import { motion } from 'framer-motion'
import { useInView } from 'framer-motion'
import { useRef } from 'react'

/**
 * Fade in section when scrolled into view
 */
const FadeInSection = ({ 
  children, 
  className = '',
  delay = 0,
  direction = 'up' // 'up', 'down', 'left', 'right'
}) => {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  const directionOffset = {
    up: { y: 40 },
    down: { y: -40 },
    left: { x: 40 },
    right: { x: -40 }
  }

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ 
        opacity: 0,
        ...directionOffset[direction]
      }}
      animate={isInView ? { 
        opacity: 1,
        x: 0,
        y: 0
      } : {}}
      transition={{ 
        duration: 0.6,
        delay,
        ease: [0.25, 0.1, 0.25, 1]
      }}
    >
      {children}
    </motion.div>
  )
}

export default FadeInSection
