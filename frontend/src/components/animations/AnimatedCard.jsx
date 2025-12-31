import { motion } from 'framer-motion'

/**
 * Animated card wrapper with hover effects
 */
const AnimatedCard = ({ 
  children, 
  className = '',
  delay = 0,
  hoverScale = 1.05,
  tapScale = 0.98
}) => {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.5, 
        delay,
        ease: [0.25, 0.1, 0.25, 1]
      }}
      whileHover={{ 
        scale: hoverScale,
        transition: { duration: 0.2 }
      }}
      whileTap={{ scale: tapScale }}
    >
      {children}
    </motion.div>
  )
}

export default AnimatedCard
