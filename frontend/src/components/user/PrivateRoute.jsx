import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../app/authStore'

const PrivateRoute = ({ children }) => {
  const { user, token, isLoading } = useAuthStore()
  
  console.log('PrivateRoute - isAuthenticated:', !!user)
  console.log('PrivateRoute - isLoading:', isLoading)
  console.log('PrivateRoute - user:', user)
  console.log('PrivateRoute - token:', token ? 'exists' : 'null')
  
  // ✅ 로딩 중일 때 로딩 UI 표시
  if (isLoading) {
    console.log('PrivateRoute - Showing loading...')
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }
  
  console.log('PrivateRoute - Loading complete')
  
  // ✅ 인증 체크
  if (!user || !token) {
    console.log('PrivateRoute - Not authenticated, redirecting to login')
    return <Navigate to="/login" replace />
  }
  
  console.log('PrivateRoute - Rendering children')
  return children
}

export default PrivateRoute
