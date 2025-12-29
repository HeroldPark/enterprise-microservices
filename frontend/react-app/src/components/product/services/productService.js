import api from '../../app/api'

export const productService = {
  // 상품 목록 조회 (페이징)
  getAllProducts: async (page = 0, size = 12, sortBy = 'createdAt', direction = 'DESC') => {
    const response = await api.get('/products', {
      params: { page, size, sortBy, direction },
    })
    return response.data
  },

  // 상품 상세 조회
  getProductById: async (id) => {
    const response = await api.get(`/products/${id}`)
    return response.data
  },

  // 상품 생성 (관리자)
  createProduct: async (productData) => {
    const response = await api.post('/products', productData)
    return response.data
  },

  // 상품 수정 (관리자)
  updateProduct: async (id, productData) => {
    const response = await api.put(`/products/${id}`, productData)
    return response.data
  },

  // 상품 삭제 (관리자)
  deleteProduct: async (id) => {
    await api.delete(`/products/${id}`)
  },

  // 카테고리별 상품 조회
  getProductsByCategory: async (category, page = 0, size = 12) => {
    const response = await api.get('/products/category', {
      params: { category, page, size },
    })
    return response.data
  },

  // 상품 검색
  searchProducts: async (keyword, page = 0, size = 12) => {
    const response = await api.get('/products/search', {
      params: { keyword, page, size },
    })
    return response.data
  },

  // 가격대별 상품 조회
  getProductsByPriceRange: async (minPrice, maxPrice, page = 0, size = 12) => {
    const response = await api.get('/products/price-range', {
      params: { minPrice, maxPrice, page, size },
    })
    return response.data
  },

  // 인기 상품 조회
  getPopularProducts: async (limit = 10) => {
    const response = await api.get('/products/popular', {
      params: { limit },
    })
    return response.data
  },
}
