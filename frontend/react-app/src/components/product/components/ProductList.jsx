import { useNavigate } from 'react-router-dom'
import { Package, DollarSign, ShoppingCart } from 'lucide-react'
import { motion } from 'framer-motion'

const ProductList = ({ products, totalPages, currentPage, onPageChange }) => {
  const navigate = useNavigate()

  if (!products || products.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg shadow-md">
        <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500 text-lg">No products found</p>
      </div>
    )
  }

  return (
    <div>
      <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((product, index) => (
          <motion.div
            key={product.id}
            className="bg-white rounded-lg shadow-md hover:shadow-xl transition overflow-hidden cursor-pointer group"
            onClick={() => navigate(`/products/${product.id}`)}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            whileHover={{ y: -5 }}
          >
            {/* Product Image */}
            <div className="aspect-square bg-gray-100 flex items-center justify-center overflow-hidden">
              {product.imageUrl ? (
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
                />
              ) : (
                <Package className="h-16 w-16 text-gray-400" />
              )}
            </div>

            {/* Product Info */}
            <div className="p-4">
              {/* Category Badge */}
              {product.category && (
                <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded mb-2">
                  {product.category}
                </span>
              )}

              <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition">
                {product.name}
              </h3>

              <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                {product.description}
              </p>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1">
                  <DollarSign className="h-5 w-5 text-green-600" />
                  <span className="text-xl font-bold text-green-600">
                    {product.price?.toFixed(2)}
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  {product.stock > 0 ? (
                    <span className="text-xs text-green-600 font-medium">
                      In Stock
                    </span>
                  ) : (
                    <span className="text-xs text-red-600 font-medium">
                      Out of Stock
                    </span>
                  )}
                </div>
              </div>

              <motion.button
                onClick={(e) => {
                  e.stopPropagation()
                  navigate(`/products/${product.id}`)
                }}
                className="mt-4 w-full flex items-center justify-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <ShoppingCart className="h-4 w-4" />
                <span>View Details</span>
              </motion.button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center space-x-2 mt-8">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 0}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>

          <div className="flex space-x-1">
            {[...Array(Math.min(totalPages, 5))].map((_, index) => {
              const pageIndex = currentPage < 3 ? index : currentPage - 2 + index
              if (pageIndex >= totalPages) return null
              
              return (
                <button
                  key={pageIndex}
                  onClick={() => onPageChange(pageIndex)}
                  className={`px-4 py-2 rounded-lg transition ${
                    currentPage === pageIndex
                      ? 'bg-blue-600 text-white'
                      : 'border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {pageIndex + 1}
                </button>
              )
            })}
          </div>

          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages - 1}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}

export default ProductList
