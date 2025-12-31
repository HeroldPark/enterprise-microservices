import api from '../../app/api'

console.log("authService start");

export const authService = {
  register: async (userData) => {
    const response = await api.post('/auth/register', userData)
    return response.data
  },

  login: async (credentials) => {
    console.log("authService : ", credentials);
    const response = await api.post('/auth/login', credentials)
    return response.data
  },

  getCurrentUser: async () => {
    const response = await api.get('/users/me')
    return response.data
  },
}
