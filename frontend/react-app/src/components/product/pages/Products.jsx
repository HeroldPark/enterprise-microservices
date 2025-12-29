import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { productService } from '../services/productService'
import ProductList from '../components/ProductList'
import { Loader, Search, SlidersHorizontal } from 'lucide-react'
import { motion } from 'framer-motion'

const Products = () => {
  const [page, setPage] = useState(0)
  const [searchKeyword, setSearchKeyword] = useState('')
  const [category, setCategory] = useState('')
  const [priceRange, setPriceRange] = useState({ min: '', max: '' })

  const { data: productsData, isLoading, error } = useQuery({
    queryKey: ['products', page, searchKeyword, category, priceRange],
    queryFn: () => {
      if (searchKeyword) {
        return productService.searchProducts(searchKeyword, page, 12)
      }
      if (category) {
        return productService.getProductsByCategory(category, page, 12)
      }
      if (priceRange.min || priceRange.max) {
        return productService.getProductsByPriceRange(
          priceRange.min || 0,
          priceRange.max || 999999999,
          page,
          12
        )
      }
      return productService.getAllProducts(page, 12)
    },
  })

  const handleSearch = (e) => {
    e.preventDefault()
    setPage(0)
  }

  const handleCategoryChange = (newCategory) => {
    setCategory(newCategory)
    setSearchKeyword('')
    setPriceRange({ min: '', max: '' })
    setPage(0)
  }

  const handlePriceFilter = () => {
    setCategory('')
    setSearchKeyword('')
    setPage(0)
  }

  const handleReset = () => {
    setSearchKeyword('')
    setCategory('')
    setPriceRange({ min: '', max: '' })
    setPage(0)
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
        <p className="text-red-500">Error loading products</p>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto">
      <motion.h1
        className="text-4xl font-bold text-gray-900 mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        Our Products
      </motion.h1>

      {/* Filters */}
      <motion.div
        className="bg-white p-6 rounded-lg shadow-md mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        {/* Search Bar */}
        <form onSubmit={handleSearch} className="mb-6">
          <div className="flex gap-2">
            <input
              type="text"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              placeholder="Search products..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              <Search className="h-5 w-5" />
              <span>Search</span>
            </button>
          </div>
        </form>

        <div className="flex items-center space-x-2 mb-4">
          <SlidersHorizontal className="h-5 w-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          {/* Category Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Categories</option>
              <option value="electronics">Electronics</option>
              <option value="clothing">Clothing</option>
              <option value="books">Books</option>
              <option value="home">Home & Garden</option>
              <option value="sports">Sports</option>
            </select>
          </div>

          {/* Price Range Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Min Price
            </label>
            <input
              type="number"
              value={priceRange.min}
              onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
              placeholder="0"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Max Price
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                value={priceRange.max}
                onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
                placeholder="No limit"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={handlePriceFilter}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Apply
              </button>
            </div>
          </div>
        </div>

        {/* Active Filters */}
        {(searchKeyword || category || priceRange.min || priceRange.max) && (
          <div className="mt-4 flex items-center space-x-2">
            <span className="text-sm text-gray-600">Active filters:</span>
            {searchKeyword && (
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                Search: {searchKeyword}
              </span>
            )}
            {category && (
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                Category: {category}
              </span>
            )}
            {(priceRange.min || priceRange.max) && (
              <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                Price: ${priceRange.min || '0'} - ${priceRange.max || '∞'}
              </span>
            )}
            <button
              onClick={handleReset}
              className="text-sm text-red-600 hover:text-red-800 underline"
            >
              Clear all
            </button>
          </div>
        )}
      </motion.div>

      {/* Product List */}
      <ProductList
        products={productsData?.content || []}
        totalPages={productsData?.totalPages || 0}
        currentPage={page}
        onPageChange={setPage}
      />
    </div>
  )
}

export default Products
