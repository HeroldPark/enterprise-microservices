import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import { productService } from '../services/productService'
import { orderService } from '../../order/services/orderService'
import { useAuthStore } from '../../app/authStore'
import { Loader, ArrowLeft, ShoppingCart, Package, DollarSign, Tag } from 'lucide-react'
import { motion } from 'framer-motion'

const ProductDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuthStore()
  const [quantity, setQuantity] = useState(1)

  const { data: product, isLoading, error } = useQuery({
    queryKey: ['product', id],
    queryFn: () => productService.getProductById(id),
  })

  const orderMutation = useMutation({
    mutationFn: (orderData) => orderService.createOrder(orderData),
    onSuccess: () => {
      alert('Order placed successfully!')
      navigate('/orders')
    },
  })

  const handleOrder = () => {
    if (!isAuthenticated) {
      alert('Please login to place an order')
      navigate('/login')
      return
    }

    if (quantity < 1) {
      alert('Quantity must be at least 1')
      return
    }

    const orderData = {
      userId: user.id,
      productId: product.id,
      quantity: quantity,
      totalAmount: product.price * quantity,
    }

    orderMutation.mutate(orderData)
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">Error loading product</p>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto">
      <motion.button
        onClick={() => navigate('/products')}
        className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-6"
        whileHover={{ x: -5 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <ArrowLeft className="h-5 w-5" />
        <span>Back to Products</span>
      </motion.button>

      <motion.div
        className="bg-white rounded-lg shadow-lg overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="md:flex">
          {/* Product Image */}
          <div className="md:w-1/2 bg-gray-100 flex items-center justify-center p-8">
            {product.imageUrl ? (
              <img
                src={product.imageUrl}
                alt={product.name}
                className="max-w-full h-auto rounded-lg"
              />
            ) : (
              <div className="w-full h-96 flex items-center justify-center bg-gray-200 rounded-lg">
                <Package className="h-24 w-24 text-gray-400" />
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="md:w-1/2 p-8">
            <div className="mb-4">
              <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-sm font-semibold rounded-full">
                {product.category || 'General'}
              </span>
            </div>

            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {product.name}
            </h1>

            <div className="flex items-center space-x-4 mb-6">
              <div className="flex items-center space-x-2">
                <DollarSign className="h-6 w-6 text-green-600" />
                <span className="text-3xl font-bold text-green-600">
                  ${product.price?.toFixed(2)}
                </span>
              </div>
            </div>

            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Description</h2>
              <p className="text-gray-600 whitespace-pre-wrap">
                {product.description || 'No description available'}
              </p>
            </div>

            {/* Stock Info */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-gray-700">Stock:</span>
                <span className={`font-semibold ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {product.stock > 0 ? `${product.stock} available` : 'Out of stock'}
                </span>
              </div>
            </div>

            {/* Quantity Selector */}
            {product.stock > 0 && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quantity
                </label>
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 border border-gray-300 rounded-lg hover:bg-gray-100 transition"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    min="1"
                    max={product.stock}
                    className="w-20 px-4 py-2 border border-gray-300 rounded-lg text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    className="w-10 h-10 border border-gray-300 rounded-lg hover:bg-gray-100 transition"
                  >
                    +
                  </button>
                </div>
              </div>
            )}

            {/* Order Button */}
            <motion.button
              onClick={handleOrder}
              disabled={product.stock === 0 || orderMutation.isPending}
              className="w-full flex items-center justify-center space-x-2 bg-blue-600 text-white px-8 py-4 rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed text-lg font-semibold"
              whileHover={{ scale: product.stock > 0 ? 1.02 : 1 }}
              whileTap={{ scale: product.stock > 0 ? 0.98 : 1 }}
            >
              <ShoppingCart className="h-6 w-6" />
              <span>
                {orderMutation.isPending
                  ? 'Processing...'
                  : product.stock === 0
                  ? 'Out of Stock'
                  : `Order Now - $${(product.price * quantity).toFixed(2)}`}
              </span>
            </motion.button>

            {!isAuthenticated && (
              <p className="mt-4 text-sm text-gray-600 text-center">
                Please{' '}
                <button
                  onClick={() => navigate('/login')}
                  className="text-blue-600 hover:underline"
                >
                  login
                </button>{' '}
                to place an order
              </p>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default ProductDetail
