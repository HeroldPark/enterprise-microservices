import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../app/authStore'
import { useEffect, useState } from 'react'

const PrivateRoute = ({ children }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const [isLoading, setIsLoading] = useState(true)

  console.log('PrivateRoute - isAuthenticated:', isAuthenticated)
  console.log('PrivateRoute - isLoading:', isLoading)

  useEffect(() => {
    const timer = setTimeout(() => {
      console.log('PrivateRoute - Loading complete')
      setIsLoading(false)
    }, 50)
    return () => clearTimeout(timer)
  }, [])

  if (isLoading) {
    console.log('PrivateRoute - Returning null (loading)')
    return null
  }

  if (!isAuthenticated) {
    console.log('PrivateRoute - Redirecting to /login')
    return <Navigate to="/login" replace />
  }

  console.log('PrivateRoute - Rendering children')
  return children
}

export default PrivateRoute
