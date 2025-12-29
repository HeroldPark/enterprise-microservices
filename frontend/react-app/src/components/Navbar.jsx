import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from './app/authStore'
import { ShoppingCart, User, LogOut, Home, Package, MessageSquare } from 'lucide-react'
import { motion } from 'framer-motion'

const Navbar = () => {
  const navigate = useNavigate()
  const { isAuthenticated, user, logout } = useAuthStore()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <motion.nav 
      className="bg-white shadow-lg"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
    >
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2 group">
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.5 }}
            >
              <Package className="h-8 w-8 text-blue-600" />
            </motion.div>
            <span className="text-xl font-bold text-gray-800 group-hover:text-blue-600 transition">
              Enterprise
            </span>
          </Link>

          <div className="flex items-center space-x-6">
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
              <Link
                to="/"
                className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 transition"
              >
                <Home className="h-5 w-5" />
                <span>Home</span>
              </Link>
            </motion.div>

            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
              <Link
                to="/products"
                className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 transition"
              >
                <Package className="h-5 w-5" />
                <span>Products</span>
              </Link>
            </motion.div>

            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
              <Link
                to="/boards"
                className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 transition"
              >
                <MessageSquare className="h-5 w-5" />
                <span>Board</span>
              </Link>
            </motion.div>

            {isAuthenticated ? (
              <>
                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                  <Link
                    to="/orders"
                    className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 transition"
                  >
                    <ShoppingCart className="h-5 w-5" />
                    <span>Orders</span>
                  </Link>
                </motion.div>

                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                  <Link
                    to="/profile"
                    className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 transition"
                  >
                    <User className="h-5 w-5" />
                    <span>{user?.username}</span>
                  </Link>
                </motion.div>

                <motion.button
                  onClick={handleLogout}
                  className="flex items-center space-x-1 text-gray-700 hover:text-red-600 transition"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <LogOut className="h-5 w-5" />
                  <span>Logout</span>
                </motion.button>
              </>
            ) : (
              <>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link
                    to="/login"
                    className="text-gray-700 hover:text-blue-600 transition"
                  >
                    Login
                  </Link>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link
                    to="/register"
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                  >
                    Register
                  </Link>
                </motion.div>
              </>
            )}
          </div>
        </div>
      </div>
    </motion.nav>
  )
}

export default Navbar
