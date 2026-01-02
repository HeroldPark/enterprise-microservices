import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../app/authStore'
import { 
  ShoppingCart, User, LogOut, Home, Package, 
  MessageSquare, ChevronDown, Shield, Brain, Sparkles
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  getFilteredMenuItems, 
  getFilteredSubItems, 
  ROLES 
} from './menuPermissions'

const Navbar = () => {
  const navigate = useNavigate()
  const { isAuthenticated, user, logout } = useAuthStore()
  const [isModelsOpen, setIsModelsOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  // 사용자 권한 가져오기 (기본값: GUEST)
  const userRole = user?.role || ROLES.GUEST

  // 권한에 따른 메뉴 필터링
  const filteredMenuItems = getFilteredMenuItems(userRole, isAuthenticated)

  // 아이콘 컴포넌트 매핑
  const iconComponents = {
    Home,
    Package,
    MessageSquare,
    ShoppingCart,
    User,
    Shield,
    Brain,
    Sparkles
  }

  // 아이콘 렌더링 함수
  const renderIcon = (iconName) => {
    const IconComponent = iconComponents[iconName]
    return IconComponent ? <IconComponent className="h-5 w-5" /> : null
  }

  return (
    <motion.nav 
      className="bg-white shadow-lg relative z-50"
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
            {/* 권한 기반 메뉴 렌더링 */}
            {filteredMenuItems.map((menuItem) => {
              // 드롭다운 메뉴
              if (menuItem.isDropdown) {
                const filteredSubs = getFilteredSubItems(menuItem.subItems, userRole)
                
                // 서브 아이템이 없으면 렌더링 안함
                if (filteredSubs.length === 0) return null

                return (
                  <div 
                    key={menuItem.id}
                    className="relative"
                    onMouseEnter={() => setIsModelsOpen(true)}
                    onMouseLeave={() => setIsModelsOpen(false)}
                  >
                    <motion.button
                      className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 transition"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {renderIcon(menuItem.icon)}
                      <span>{menuItem.name}</span>
                      <motion.div
                        animate={{ rotate: isModelsOpen ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <ChevronDown className="h-4 w-4" />
                      </motion.div>
                    </motion.button>

                    <AnimatePresence>
                      {isModelsOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.2 }}
                          className="absolute top-full left-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden"
                        >
                          <div className="p-2">
                            {filteredSubs.map((model, index) => (
                              <Link
                                key={index}
                                to={model.path}
                                className="block p-4 hover:bg-blue-50 rounded-lg transition-colors"
                              >
                                <div className="space-y-2">
                                  <div className="flex items-baseline space-x-2">
                                    <h3 className="font-bold text-gray-900">{model.name}</h3>
                                    <span className="text-sm text-gray-500">({model.subtitle})</span>
                                  </div>
                                  
                                  <div className="space-y-1 text-sm">
                                    <p className="text-gray-700">
                                      <span className="font-semibold text-blue-600">원리:</span> {model.description}
                                    </p>
                                    <p className="text-gray-700">
                                      <span className="font-semibold text-green-600">화재 예측:</span> {model.application}
                                    </p>
                                    <p className="text-gray-700">
                                      <span className="font-semibold text-purple-600">강점:</span> {model.strengths}
                                    </p>
                                    <p className="text-gray-700">
                                      <span className="font-semibold text-red-600">약점:</span> {model.weaknesses}
                                    </p>
                                  </div>
                                </div>
                              </Link>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )
              }

              // 일반 메뉴
              // 로그인 필수 메뉴이고 로그인되지 않은 경우 렌더링 안함
              if (menuItem.requiresAuth && !isAuthenticated) {
                return null
              }

              return (
                <motion.div 
                  key={menuItem.id}
                  whileHover={{ scale: 1.1 }} 
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    to={menuItem.path}
                    className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 transition"
                  >
                    {renderIcon(menuItem.icon)}
                    <span>
                      {menuItem.showUsername && user?.username 
                        ? user.username 
                        : menuItem.name}
                    </span>
                  </Link>
                </motion.div>
              )
            })}

            {/* 인증 버튼 */}
            {isAuthenticated ? (
              <motion.button
                onClick={handleLogout}
                className="flex items-center space-x-1 text-gray-700 hover:text-red-600 transition"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <LogOut className="h-5 w-5" />
                <span>Logout</span>
              </motion.button>
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

            {/* 권한 표시 배지 (개발/테스트용) */}
            {user && (
              <div className="ml-2 px-2 py-1 text-xs font-semibold rounded-full bg-gray-200 text-gray-700">
                {userRole}
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.nav>
  )
}

export default Navbar
