import { motion } from 'framer-motion'

/**
 * Animated gradient orb for decorative backgrounds
 */
const GradientOrb = ({ 
  size = 400,
  color1 = '#3B82F6',
  color2 = '#8B5CF6',
  top,
  left,
  right,
  bottom,
  blur = 100,
  opacity = 0.3,
  animate = true
}) => {
  const orbStyle = {
    width: size,
    height: size,
    background: `radial-gradient(circle, ${color1}, ${color2})`,
    filter: `blur(${blur}px)`,
    opacity,
    top,
    left,
    right,
    bottom,
  }

  const animationVariants = animate ? {
    animate: {
      scale: [1, 1.2, 1],
      x: [0, 30, -30, 0],
      y: [0, -30, 30, 0],
    }
  } : {}

  return (
    <motion.div
      className="absolute rounded-full pointer-events-none"
      style={orbStyle}
      variants={animationVariants}
      animate="animate"
      transition={{
        duration: 20,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    />
  )
}

export default GradientOrb
