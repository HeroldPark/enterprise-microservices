import { motion } from 'framer-motion'
import ProductModel3D from '../components/3d/ProductModel3D'
import HeroScene3D from '../components/3d/HeroScene3D'
import FloatingIcons3D from '../components/3d/FloatingIcons3D'
import AnimatedCard from '../components/animations/AnimatedCard'
import FadeInSection from '../components/animations/FadeInSection'
import GradientOrb from '../components/animations/GradientOrb'

/**
 * Demo page showcasing all visual components
 */
const Demo = () => {
  return (
    <>
      <div className="max-w-7xl mx-auto relative">
        <FadeInSection>
          <h1 className="text-5xl font-bold text-gray-900 mb-4 text-center">
            Visual Components Demo
          </h1>
          <p className="text-xl text-gray-600 mb-12 text-center">
            Showcase of 3D graphics and animations
          </p>
        </FadeInSection>

        {/* 3D Components Section */}
        <FadeInSection delay={0.1}>
          <section className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">3D Components</h2>
            
            <div className="grid md:grid-cols-3 gap-8">
              <AnimatedCard className="bg-white p-6 rounded-lg shadow-lg" delay={0}>
                <h3 className="text-xl font-semibold mb-4">Product Model 3D</h3>
                <div className="h-64 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg">
                  <ProductModel3D color="#3B82F6" />
                </div>
                <p className="text-gray-600 mt-4">Interactive 3D product viewer</p>
              </AnimatedCard>

              <AnimatedCard className="bg-white p-6 rounded-lg shadow-lg" delay={0.1}>
                <h3 className="text-xl font-semibold mb-4">Hero Scene 3D</h3>
                <div className="h-64 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg">
                  <HeroScene3D />
                </div>
                <p className="text-gray-600 mt-4">Floating spheres with distortion</p>
              </AnimatedCard>

              <AnimatedCard className="bg-white p-6 rounded-lg shadow-lg" delay={0.2}>
                <h3 className="text-xl font-semibold mb-4">Floating Icons 3D</h3>
                <div className="h-64 bg-gradient-to-br from-pink-50 to-orange-50 rounded-lg">
                  <FloatingIcons3D />
                </div>
                <p className="text-gray-600 mt-4">Multiple geometric shapes</p>
              </AnimatedCard>
            </div>
          </section>
        </FadeInSection>

        {/* Animation Components Section */}
        <FadeInSection delay={0.2}>
          <section className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Animation Components</h2>
            
            <div className="grid md:grid-cols-2 gap-8">
              <AnimatedCard 
                className="bg-white p-8 rounded-lg shadow-lg"
                delay={0}
                hoverScale={1.08}
              >
                <h3 className="text-xl font-semibold mb-4">Animated Card</h3>
                <p className="text-gray-600 mb-4">
                  This card has entrance animations, hover effects, and tap feedback.
                </p>
                <motion.button
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Click Me
                </motion.button>
              </AnimatedCard>

              <div className="bg-white p-8 rounded-lg shadow-lg">
                <h3 className="text-xl font-semibold mb-4">Fade In Sections</h3>
                <FadeInSection direction="left" delay={0.1}>
                  <p className="text-gray-600 mb-2">↓ Slides in from left</p>
                </FadeInSection>
                <FadeInSection direction="right" delay={0.2}>
                  <p className="text-gray-600 mb-2">← Slides in from right</p>
                </FadeInSection>
                <FadeInSection direction="up" delay={0.3}>
                  <p className="text-gray-600">↑ Slides in from bottom</p>
                </FadeInSection>
              </div>
            </div>
          </section>
        </FadeInSection>

        {/* Gradient Orbs Section */}
        <FadeInSection delay={0.3}>
          <section className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Gradient Orbs</h2>
            
            <div className="relative h-96 bg-gray-900 rounded-lg overflow-hidden">
              <GradientOrb 
                size={300}
                color1="#3B82F6"
                color2="#8B5CF6"
                top="10%"
                left="10%"
                blur={80}
                opacity={0.4}
              />
              <GradientOrb 
                size={400}
                color1="#EC4899"
                color2="#F59E0B"
                bottom="10%"
                right="10%"
                blur={100}
                opacity={0.3}
              />
              <div className="relative z-10 flex items-center justify-center h-full">
                <div className="text-center text-white">
                  <h3 className="text-3xl font-bold mb-4">Animated Gradient Orbs</h3>
                  <p className="text-xl">Perfect for hero sections and backgrounds</p>
                </div>
              </div>
            </div>
          </section>
        </FadeInSection>

        {/* Interactive Elements */}
        <FadeInSection delay={0.4}>
          <section className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Interactive Elements</h2>
            
            <div className="grid md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <motion.div
                  key={i}
                  className="bg-gradient-to-br from-blue-500 to-purple-600 p-8 rounded-lg text-white text-center cursor-pointer"
                  whileHover={{ 
                    scale: 1.1,
                    rotate: 5,
                    boxShadow: "0 20px 40px rgba(0,0,0,0.3)"
                  }}
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <h3 className="text-2xl font-bold">Card {i}</h3>
                  <p className="mt-2">Hover me!</p>
                </motion.div>
              ))}
            </div>
          </section>
        </FadeInSection>

        {/* Color Variations */}
        <FadeInSection delay={0.5}>
          <section className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Color Variations</h2>
            
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { color: '#3B82F6', name: 'Blue' },
                { color: '#8B5CF6', name: 'Purple' },
                { color: '#EC4899', name: 'Pink' }
              ].map((item, i) => (
                <AnimatedCard 
                  key={i}
                  className="bg-white p-6 rounded-lg shadow-lg"
                  delay={i * 0.1}
                >
                  <h3 className="text-xl font-semibold mb-4">{item.name} Theme</h3>
                  <div className="h-48 bg-gray-50 rounded-lg">
                    <ProductModel3D color={item.color} />
                  </div>
                </AnimatedCard>
              ))}
            </div>
          </section>
        </FadeInSection>

        {/* Performance Info */}
        <FadeInSection delay={0.6}>
          <section className="mb-16">
            <div className="bg-blue-50 border-l-4 border-blue-600 p-6 rounded-lg">
              <h3 className="text-xl font-semibold text-blue-900 mb-2">
                Performance Optimized
              </h3>
              <p className="text-blue-800">
                All components use GPU acceleration, lazy loading, and efficient rendering.
                3D scenes are optimized for 60fps on modern devices.
              </p>
            </div>
          </section>
        </FadeInSection>
      </div>
    </>
  )
}

export default Demo
