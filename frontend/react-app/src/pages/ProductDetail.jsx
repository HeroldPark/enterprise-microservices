import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import { productService } from '../services/productService'
import { orderService } from '../services/orderService'
import { useAuthStore } from '../store/authStore'
import { ShoppingCart, Loader, ArrowLeft } from 'lucide-react'
import { motion } from 'framer-motion'
import ProductModel3D from '../components/3d/ProductModel3D'
import FadeInSection from '../components/animations/FadeInSection'

const ProductDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuthStore()
  const [quantity, setQuantity] = useState(1)

  const { data: product, isLoading, error } = useQuery({
    queryKey: ['product', id],
    queryFn: () => productService.getProductById(id),
  })

  const createOrderMutation = useMutation({
    mutationFn: orderService.createOrder,
    onSuccess: () => {
      alert('Order created successfully!')
      navigate('/orders')
    },
    onError: (error) => {
      alert(error.response?.data?.message || 'Failed to create order')
    },
  })

  const handleOrder = () => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }

    const orderData = {
      userId: user.id,
      items: [
        {
          productId: product.id,
          quantity: quantity,
        },
      ],
    }

    createOrderMutation.mutate(orderData)
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">Product not found</p>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto">
      <motion.button
        onClick={() => navigate('/products')}
        className="flex items-center text-blue-600 hover:text-blue-700 mb-6"
        whileHover={{ x: -5 }}
        whileTap={{ scale: 0.95 }}
      >
        <ArrowLeft className="h-5 w-5 mr-2" />
        Back to Products
      </motion.button>

      <motion.div 
        className="bg-white rounded-lg shadow-lg overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="grid md:grid-cols-2 gap-8 p-8">
          <FadeInSection className="rounded-lg overflow-hidden h-96">
            {product.imageUrl ? (
              <motion.div
                className="w-full h-full bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg overflow-hidden"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.3 }}
              >
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-full h-full object-cover rounded-lg"
                />
              </motion.div>
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg">
                <ProductModel3D color="#4F46E5" />
              </div>
            )}
          </FadeInSection>

          <FadeInSection delay={0.2}>
            <motion.h1 
              className="text-4xl font-bold text-gray-900 mb-4"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              {product.name}
            </motion.h1>

            {product.category && (
              <motion.span 
                className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm mb-4"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.4 }}
              >
                {product.category}
              </motion.span>
            )}

            <p className="text-gray-600 text-lg mb-6">
              {product.description || 'No description available'}
            </p>

            <div className="mb-6">
              <span className="text-4xl font-bold text-blue-600">
                ${product.price?.toFixed(2)}
              </span>
            </div>

            <div className="mb-6">
              <p className="text-gray-700 mb-2">
                <span className="font-semibold">Stock:</span> {product.stock} units
              </p>
              <p className="text-gray-700">
                <span className="font-semibold">Status:</span>{' '}
                {product.active ? (
                  <span className="text-green-600">Available</span>
                ) : (
                  <span className="text-red-600">Unavailable</span>
                )}
              </p>
            </div>

            <div className="mb-6">
              <label className="block text-gray-700 font-medium mb-2">
                Quantity
              </label>
              <input
                type="number"
                min="1"
                max={product.stock}
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                className="w-32 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <motion.button
              onClick={handleOrder}
              disabled={!product.active || product.stock < 1 || createOrderMutation.isPending}
              className="w-full bg-blue-600 text-white py-4 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 flex items-center justify-center space-x-2"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <ShoppingCart className="h-5 w-5" />
              <span>
                {createOrderMutation.isPending ? 'Processing...' : 'Order Now'}
              </span>
            </motion.button>
          </FadeInSection>
        </div>
      </motion.div>
    </div>
  )
}

export default ProductDetail
