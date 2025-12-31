import { useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Float, Text3D, Center } from '@react-three/drei'
import * as THREE from 'three'

/**
 * Floating 3D icon/shape
 */
function FloatingShape({ position, color, shape = 'box' }) {
  const meshRef = useRef()
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.5) * 0.1
    }
  })

  const geometry = shape === 'sphere' 
    ? <sphereGeometry args={[0.5, 32, 32]} />
    : shape === 'torus'
    ? <torusGeometry args={[0.4, 0.15, 16, 100]} />
    : <boxGeometry args={[0.7, 0.7, 0.7]} />

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
      <mesh ref={meshRef} position={position} castShadow>
        {geometry}
        <meshStandardMaterial 
          color={color}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>
    </Float>
  )
}

/**
 * Scene with multiple floating 3D shapes
 */
const FloatingIcons3D = ({ className = '' }) => {
  const shapes = [
    { position: [-2, 1, 0], color: '#3B82F6', shape: 'box' },
    { position: [2, -1, 0], color: '#8B5CF6', shape: 'sphere' },
    { position: [0, 0, -2], color: '#EC4899', shape: 'torus' },
  ]

  return (
    <div className={`w-full h-full ${className}`}>
      <Canvas 
        camera={{ position: [0, 0, 8], fov: 50 }}
        gl={{ 
          preserveDrawingBuffer: false,
          powerPreference: 'high-performance',
          antialias: true
        }}
        dpr={[1, 2]}
      >
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <pointLight position={[-10, -10, -5]} intensity={0.5} />
        
        {shapes.map((shape, i) => (
          <FloatingShape key={i} {...shape} />
        ))}
      </Canvas>
    </div>
  )
}

export default FloatingIcons3D
