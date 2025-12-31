import { Link } from 'react-router-dom'
import { Package, ShoppingCart, TrendingUp } from 'lucide-react'
import { motion } from 'framer-motion'
import HeroScene3D from '../3d/HeroScene3D'
import AnimatedCard from '../animations/AnimatedCard'
import FadeInSection from '../animations/FadeInSection'

const Home = () => {
  return (
    <>
      <div className="max-w-6xl mx-auto relative">
        {/* Hero Section with 3D Background */}
        <div className="relative mb-12">
          <div className="absolute inset-0 h-96 pointer-events-none">
            <HeroScene3D />
          </div>
          
          <FadeInSection className="text-center pt-32 pb-16 relative z-10">
            <motion.h1 
              className="text-6xl font-bold text-gray-900 mb-4"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
            >
              Welcome to Enterprise Store
            </motion.h1>
            
            <motion.p 
              className="text-xl text-gray-600 mb-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              Your one-stop shop for quality products
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <Link
                to="/products"
                className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-blue-700 transition shadow-lg hover:shadow-xl"
              >
                Browse Products
              </Link>
            </motion.div>
          </FadeInSection>
        </div>

        {/* Feature Cards with Animations */}
        <div className="grid md:grid-cols-3 gap-8 mt-16">
          <AnimatedCard 
            className="bg-white p-6 rounded-lg shadow-md text-center backdrop-blur-sm bg-opacity-90"
            delay={0}
          >
            <Package className="h-12 w-12 text-blue-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Wide Selection</h3>
            <p className="text-gray-600">
              Browse through our extensive collection of products
            </p>
          </AnimatedCard>

          <AnimatedCard 
            className="bg-white p-6 rounded-lg shadow-md text-center backdrop-blur-sm bg-opacity-90"
            delay={0.1}
          >
            <ShoppingCart className="h-12 w-12 text-blue-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Easy Ordering</h3>
            <p className="text-gray-600">
              Simple and secure checkout process
            </p>
          </AnimatedCard>

          <AnimatedCard 
            className="bg-white p-6 rounded-lg shadow-md text-center backdrop-blur-sm bg-opacity-90"
            delay={0.2}
          >
            <TrendingUp className="h-12 w-12 text-blue-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Track Orders</h3>
            <p className="text-gray-600">
              Monitor your orders in real-time
            </p>
          </AnimatedCard>
        </div>
      </div>
    </>
  )
}

export default Home
