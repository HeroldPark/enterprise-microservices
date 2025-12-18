import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { productService } from '../services/productService'
import ProductCard from '../components/ProductCard'
import { Search, Loader } from 'lucide-react'
import { motion } from 'framer-motion'
import FadeInSection from '../components/animations/FadeInSection'

const Products = () => {
  const [page, setPage] = useState(0)
  const [searchTerm, setSearchTerm] = useState('')

  const { data, isLoading, error } = useQuery({
    queryKey: ['products', page, searchTerm],
    queryFn: () =>
      searchTerm
        ? productService.searchProducts(searchTerm, page, 12)
        : productService.getActiveProducts(page, 12),
  })

  const handleSearch = (e) => {
    e.preventDefault()
    setPage(0)
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">Error loading products</p>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto">
      <FadeInSection>
        <motion.h1 
          className="text-4xl font-bold text-gray-900 mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Products
        </motion.h1>
      </FadeInSection>

      <FadeInSection delay={0.1}>
        <form onSubmit={handleSearch} className="mb-8">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <motion.input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search products..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition-all"
                whileFocus={{ scale: 1.01 }}
              />
            </div>
            <motion.button
              type="submit"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Search
            </motion.button>
          </div>
        </form>
      </FadeInSection>

      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <Loader className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {data?.content?.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {data?.content?.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No products found</p>
            </div>
          )}

          {data && data.totalPages > 1 && (
            <motion.div 
              className="flex justify-center items-center gap-2 mt-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <motion.button
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 disabled:opacity-50"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Previous
              </motion.button>
              <span className="text-gray-700">
                Page {page + 1} of {data.totalPages}
              </span>
              <motion.button
                onClick={() => setPage((p) => p + 1)}
                disabled={page >= data.totalPages - 1}
                className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 disabled:opacity-50"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Next
              </motion.button>
            </motion.div>
          )}
        </>
      )}
    </div>
  )
}

export default Products
