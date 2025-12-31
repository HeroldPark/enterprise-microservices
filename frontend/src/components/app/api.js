import axios from 'axios'

const API_BASE_URL = '/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,  // 10초 → 30초로 증가
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    // localStorage에서 token 가져오기
    let token = localStorage.getItem('token')
    
    // token이 없으면 auth-storage에서 시도
    if (!token) {
      const authData = localStorage.getItem('auth-storage')
      if (authData) {
        try {
          const parsed = JSON.parse(authData)
          token = parsed?.state?.token
          // auth-storage에서 찾았으면 localStorage에도 저장
          if (token) {
            localStorage.setItem('token', token)
          }
        } catch (e) {
          console.error('Failed to parse auth-storage:', e)
        }
      }
    }
    
    console.log('=== API REQUEST ===')
    console.log('Token:', token ? token.substring(0, 20) + '...' : 'NO TOKEN')
    console.log('URL:', config.url)
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
      console.log('Authorization header set')
    } else {
      console.log('NO TOKEN - Authorization header NOT set')
    }
    
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('auth-storage')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api