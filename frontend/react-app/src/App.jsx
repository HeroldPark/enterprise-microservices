import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from './components/app/authStore'
import Navbar from './components/Navbar'
import Home from './components/app/Home'
import Demo from './components/app/Demo'
import PrivateRoute from './components/user/PrivateRoute'
import PageTransition from './components/animations/PageTransition'

// User pages
import Login from './components/user/pages/Login'
import Register from './components/user/pages/Register'
import Profile from './components/user/pages/Profile'

// Product pages
import Products from './components/product/pages/Products'
import ProductDetail from './components/product/pages/ProductDetail'

// Order pages
import Orders from './components/order/pages/Orders'

// Board pages
import Boards from './components/board/pages/Boards'
import BoardDetail from './components/board/pages/BoardDetail'
import BoardCreate from './components/board/pages/BoardCreate'
import BoardEdit from './components/board/pages/BoardEdit'

function App() {
  const location = useLocation()

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <PageTransition key={location.pathname}>
          <Routes location={location}>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/demo" element={<Demo />} />
            
            {/* User Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/profile"
              element={
                <PrivateRoute>
                  <Profile />
                </PrivateRoute>
              }
            />

            {/* Product Routes */}
            <Route path="/products" element={<Products />} />
            <Route path="/products/:id" element={<ProductDetail />} />

            {/* Order Routes */}
            <Route
              path="/orders"
              element={
                <PrivateRoute>
                  <Orders />
                </PrivateRoute>
              }
            />
            
            {/* Board Routes */}
            <Route path="/boards" element={<Boards />} />
            <Route path="/boards/:id" element={<BoardDetail />} />
            <Route
              path="/boards/create"
              element={
                <PrivateRoute>
                  <BoardCreate />
                </PrivateRoute>
              }
            />
            <Route
              path="/boards/edit/:id"
              element={
                <PrivateRoute>
                  <BoardEdit />
                </PrivateRoute>
              }
            />
            
            {/* Fallback Route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </PageTransition>
      </main>
    </div>
  )
}

export default App
