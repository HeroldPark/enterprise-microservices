import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../app/authStore'
import { 
  ShoppingCart, User, LogOut, Home, Package, 
  MessageSquare, ChevronDown, Shield, Brain, Sparkles,
  BarChart, Lock, Bell  // ← 아이콘 추가
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  getFilteredMenuItems, 
  getFilteredSubItems, 
  ROLES 
} from './menuPermissions'
import menuApi from './menuApi'

const Navbar = () => {
  const [menuItems, setMenuItems] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const { isAuthenticated, user, logout } = useAuthStore()
  const [isModelsOpen, setIsModelsOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const userRole = user?.role || ROLES.GUEST

  // ✅ 아이콘 추가
  const iconComponents = {
    Home,
    BarChart,
    Package,
    MessageSquare,
    ShoppingCart,
    User,
    Shield,
    Brain,
    Sparkles,
    Lock,    // ← 추가
    Bell     // ← 추가
  }

  const renderIcon = (iconName) => {
    const IconComponent = iconComponents[iconName]
    return IconComponent ? <IconComponent className="h-5 w-5" /> : null
  }

  useEffect(() => {
    const loadMenus = async () => {
      try {
        setLoading(true)
        const menus = await menuApi.getMenusByRole(userRole)
        
        console.log('🔍 DB에서 불러온 메뉴:', menus)
        console.log('📊 메뉴 개수:', menus?.length)
        console.log('👤 현재 유저 권한:', userRole)
        console.log('✅ 인증 상태:', isAuthenticated)
        
        // 각 메뉴의 상세 정보 출력
        menus?.forEach((menu, index) => {
          console.log(`📋 메뉴 ${index}:`, {
            id: menu.id,
            name: menu.name,
            path: menu.path,
            roles: menu.roles,
            requiresAuth: menu.requiresAuth,
            isDropdown: menu.isDropdown
          })
        })
        
        setMenuItems(menus || [])
      } catch (error) {
        console.error('❌ DB 메뉴 로딩 실패, 기본 메뉴 사용:', error)
        setMenuItems(getFilteredMenuItems(userRole, isAuthenticated))
      } finally {
        setLoading(false)
      }
    }
    loadMenus()
  }, [userRole, isAuthenticated])

  if (loading) {
    return (
      <nav className="bg-white shadow-lg relative z-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <div className="text-gray-400">Loading menu...</div>
          </div>
        </div>
      </nav>
    )
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
            {/* 🐛 디버깅: 메뉴 개수 표시 */}
            <div className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
              메뉴: {menuItems.length}개
            </div>

            {/* ✅ DB에서 불러온 메뉴 렌더링 */}
            {menuItems.map((menuItem, idx) => {
              console.log(`🎨 렌더링 시도 - 메뉴 ${idx}:`, menuItem.id, menuItem.name)
              
              // 드롭다운 메뉴
              if (menuItem.isDropdown) {
                const filteredSubs = getFilteredSubItems(menuItem.subItems, userRole)
                
                if (filteredSubs.length === 0) {
                  console.log(`⏭️ 건너뜀 (서브메뉴 없음):`, menuItem.id)
                  return null
                }

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
              // 로그인 필수 메뉴이고 로그인되지 않은 경우 건너뛰기
              if (menuItem.requiresAuth && !isAuthenticated) {
                console.log(`⏭️ 건너뜀 (로그인 필요):`, menuItem.id)
                return null
              }

              console.log(`✅ 렌더링 성공:`, menuItem.id)

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

            {/* 권한 표시 배지 */}
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
