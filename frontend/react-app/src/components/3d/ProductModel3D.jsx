import { useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, PerspectiveCamera, Environment, Float } from '@react-three/drei'
import * as THREE from 'three'

/**
 * Rotating 3D Box representing a product
 */
function ProductBox({ color = '#4F46E5' }) {
  const meshRef = useRef()
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3) * 0.2
    }
  })

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
      <mesh ref={meshRef} castShadow>
        <boxGeometry args={[2, 2, 2]} />
        <meshStandardMaterial 
          color={color}
          metalness={0.7}
          roughness={0.2}
          envMapIntensity={1}
        />
      </mesh>
    </Float>
  )
}

/**
 * 3D Product Model Viewer Component
 */
const ProductModel3D = ({ color = '#4F46E5', className = '' }) => {
  return (
    <div className={`w-full h-full ${className}`}>
      <Canvas 
        shadows
        gl={{ 
          preserveDrawingBuffer: false,
          powerPreference: 'high-performance',
          antialias: true
        }}
        dpr={[1, 2]}
      >
        <PerspectiveCamera makeDefault position={[0, 0, 6]} />
        
        {/* Lighting */}
        <ambientLight intensity={0.5} />
        <directionalLight 
          position={[10, 10, 5]} 
          intensity={1}
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />
        <pointLight position={[-10, -10, -5]} intensity={0.5} color="#3B82F6" />
        
        {/* 3D Model */}
        <ProductBox color={color} />
        
        {/* Environment & Controls */}
        <Environment preset="city" />
        <OrbitControls 
          enableZoom={false}
          enablePan={false}
          autoRotate
          autoRotateSpeed={0.5}
        />
      </Canvas>
    </div>
  )
}

export default ProductModel3D
