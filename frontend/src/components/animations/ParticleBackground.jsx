import { useRef, useMemo, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

/**
 * Particle system for background effects
 */
function Particles({ count = 1000 }) {
  const points = useRef()
  
  const particlesPosition = useMemo(() => {
    const positions = new Float32Array(count * 3)
    
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 50
      positions[i * 3 + 1] = (Math.random() - 0.5) * 50
      positions[i * 3 + 2] = (Math.random() - 0.5) * 50
    }
    
    return positions
  }, [count])

  useFrame((state) => {
    if (points.current) {
      points.current.rotation.y = state.clock.elapsedTime * 0.05
      points.current.rotation.x = state.clock.elapsedTime * 0.03
    }
  })

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particlesPosition.length / 3}
          array={particlesPosition}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.1}
        color="#3B82F6"
        sizeAttenuation
        transparent
        opacity={0.6}
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}

/**
 * Animated particle background component
 */
const ParticleBackground = ({ className = '', particleCount = 1000 }) => {
  const canvasRef = useRef()

  useEffect(() => {
    return () => {
      // Cleanup WebGL context on unmount
      if (canvasRef.current) {
        const canvas = canvasRef.current.querySelector('canvas')
        if (canvas) {
          const gl = canvas.getContext('webgl') || canvas.getContext('webgl2')
          if (gl) {
            gl.getExtension('WEBGL_lose_context')?.loseContext()
          }
        }
      }
    }
  }, [])

  return (
    <div ref={canvasRef} className={`fixed inset-0 -z-10 ${className}`}>
      <Canvas 
        camera={{ position: [0, 0, 15], fov: 75 }}
        gl={{ 
          preserveDrawingBuffer: false,
          powerPreference: 'high-performance'
        }}
      >
        <Particles count={particleCount} />
      </Canvas>
    </div>
  )
}

export default ParticleBackground
