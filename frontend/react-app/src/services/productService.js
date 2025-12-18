import api from './api'

export const productService = {
  getAllProducts: async (page = 0, size = 12, sortBy = 'id', sortDir = 'ASC') => {
    const response = await api.get('/products', {
      params: { page, size, sortBy, sortDir },
    })
    return response.data
  },

  getActiveProducts: async (page = 0, size = 12) => {
    const response = await api.get('/products/active', {
      params: { page, size },
    })
    return response.data
  },

  getProductById: async (id) => {
    const response = await api.get(`/products/${id}`)
    return response.data
  },

  searchProducts: async (name, page = 0, size = 12) => {
    const response = await api.get('/products/search', {
      params: { name, page, size },
    })
    return response.data
  },

  getProductsByCategory: async (category, page = 0, size = 12) => {
    const response = await api.get(`/products/category/${category}`, {
      params: { page, size },
    })
    return response.data
  },

  createProduct: async (productData) => {
    const response = await api.post('/products', productData)
    return response.data
  },

  updateProduct: async (id, productData) => {
    const response = await api.put(`/products/${id}`, productData)
    return response.data
  },

  deleteProduct: async (id) => {
    await api.delete(`/products/${id}`)
  },
}
