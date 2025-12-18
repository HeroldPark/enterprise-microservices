import api from './api'

export const orderService = {
  createOrder: async (orderData) => {
    const response = await api.post('/orders', orderData)
    return response.data
  },

  getOrderById: async (id) => {
    const response = await api.get(`/orders/${id}`)
    return response.data
  },

  getOrdersByUserId: async (userId, page = 0, size = 10) => {
    const response = await api.get(`/orders/user/${userId}`, {
      params: { page, size },
    })
    return response.data
  },

  getOrderHistory: async (userId) => {
    const response = await api.get(`/orders/user/${userId}/history`)
    return response.data
  },

  updateOrderStatus: async (id, status) => {
    const response = await api.patch(`/orders/${id}/status`, null, {
      params: { status },
    })
    return response.data
  },

  cancelOrder: async (id) => {
    await api.delete(`/orders/${id}`)
  },
}
