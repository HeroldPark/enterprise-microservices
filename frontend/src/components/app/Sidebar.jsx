import { useState, useEffect } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { 
  Home, Users, ShoppingCart, Package, Settings, 
  ChevronDown, ChevronRight, Menu as MenuIcon,
  BarChart, FileText, Shield, Database, X, Brain, LogOut, Sparkles,
  Target, GitBranch, Zap, Trees, TrendingUp
} from 'lucide-react'
import { useAuthStore } from './authStore'  // ← authStore import 추가

// 권한 상수 정의
export const ROLES = {
  GUEST: 'GUEST',
  USER: 'USER',
  MANAGER: 'MANAGER',
  ADMIN: 'ADMIN'
}

// 아이콘 매핑
const iconMap = {
  'DashboardIcon': Home,
  'PeopleIcon': Users,
  'UsersIcon': Users,
  'ShoppingCartIcon': ShoppingCart,
  'PackageIcon': Package,
  'ReceiptIcon': FileText,
  'SettingsIcon': Settings,
  'BarChartIcon': BarChart,
  'ShieldIcon': Shield,
  'DatabaseIcon': Database,
  'MenuIcon': MenuIcon,
  'ListIcon': FileText,
  'SecurityIcon': Shield,
  'ArticleIcon': FileText,
  'ComputerIcon': Settings,
  'TuneIcon': Settings,
  'Brain': Brain,
  'Sparkles': Sparkles,
  'Target': Target,
  'GitBranch': GitBranch,
  'Zap': Zap,
  'Trees': Trees,
  'TrendingUp': TrendingUp
}

// 권한별 한글 표시
const roleDisplayNames = {
  [ROLES.GUEST]: '게스트',
  [ROLES.USER]: '일반 사용자',
  [ROLES.MANAGER]: '매니저',
  [ROLES.ADMIN]: '관리자'
}

// 권한별 배지 색상
const roleBadgeColors = {
  [ROLES.GUEST]: 'bg-gray-500',
  [ROLES.USER]: 'bg-blue-500',
  [ROLES.MANAGER]: 'bg-purple-500',
  [ROLES.ADMIN]: 'bg-red-500'
}

const Sidebar = ({ isOpen, onClose }) => {
  const [menus, setMenus] = useState([])
  const [expandedMenus, setExpandedMenus] = useState({})
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  
  // authStore에서 사용자 정보 가져오기
  const { user, logout } = useAuthStore()

  // 기본 메뉴 (폴백)
  const getDefaultMenus = () => [
    {
      id: 'dashboard',
      name: '대시보드',
      path: '/dashboard',
      icon: 'DashboardIcon',
      children: []
    },
    {
      id: 'admin',
      name: '관리자 패널',
      path: '/admin',
      icon: 'ShieldIcon',
      children: []
    },
    {
      id: 'models',
      name: 'Models',
      path: null,
      icon: 'Brain',
      children: [
        {
          id: 'isolation-forest',
          name: 'Isolation Forest',
          path: '/models/isolation-forest',
          icon: 'Target'
        },
        {
          id: 'lstm',
          name: 'LSTM',
          path: '/models/lstm',
          icon: 'GitBranch'
        },
        {
          id: 'gru',
          name: 'GRU',
          path: '/models/gru',
          icon: 'Zap'
        },
        {
          id: 'random-forest',
          name: 'Random Forest',
          path: '/models/random-forest',
          icon: 'Trees'
        },
        {
          id: 'xgboost',
          name: 'XGBoost',
          path: '/models/xgboost',
          icon: 'TrendingUp'
        }
      ]
    },
    {
      id: 'products',
      name: '상품 관리',
      path: '/products',
      icon: 'PackageIcon',
      children: []
    },
    {
      id: 'orders',
      name: '주문 관리',
      path: '/orders',
      icon: 'ShoppingCartIcon',
      children: []
    },
    {
      id: 'demo',
      name: 'Demo',
      path: '/demo',
      icon: 'Sparkles',
      roles: [ROLES.ADMIN],
      children: []
    },
    {
      id: 'boards',
      name: '게시판',
      path: '/boards',
      icon: 'FileText',
      children: []
    }
  ]

  // 메뉴 데이터 로드
  useEffect(() => {
    console.log('🔧 [Sidebar] 컴포넌트 마운트됨')
    console.log('👤 [Sidebar] 현재 사용자:', user)
    
    setMenus(getDefaultMenus())
    setLoading(false)
  }, [user])

  const fetchMenus = async () => {
    try {
      setLoading(true)
      console.log('📡 [Sidebar] 메뉴 API 호출 시작...')
      
      const data = getDefaultMenus()
      console.log('✅ [Sidebar] 메뉴 데이터:', data)
      
      setMenus(data)
    } catch (error) {
      console.error('❌ [Sidebar] 메뉴 로드 실패:', error)
      setMenus(getDefaultMenus())
    } finally {
      setLoading(false)
    }
  }

  const toggleMenu = (menuId) => {
    console.log('🔄 [Sidebar] 메뉴 토글:', menuId)
    setExpandedMenus(prev => {
      const newState = {
        ...prev,
        [menuId]: !prev[menuId]
      }
      console.log('📊 [Sidebar] expandedMenus:', newState)
      return newState
    })
  }

  const handleMenuClick = (menu) => {
    console.log('🖱️ [Sidebar] 메뉴 클릭:', menu.name)
    console.log('📋 [Sidebar] menu.children:', menu.children)
    
    if (menu.children && menu.children.length > 0) {
      console.log('✅ [Sidebar] 하위 메뉴 있음 - 토글 실행')
      toggleMenu(menu.id)
    } else if (menu.path) {
      console.log('🔗 [Sidebar] 페이지 이동:', menu.path)
      navigate(menu.path)
      if (window.innerWidth < 768) {
        onClose()
      }
    }
  }

  const handleLogout = () => {
    console.log('🚪 [Sidebar] 로그아웃')
    logout()
    navigate('/login')
  }

  const MenuItem = ({ menu, level = 0 }) => {
    const Icon = iconMap[menu.icon] || MenuIcon
    const hasChildren = menu.children && menu.children.length > 0
    const isExpanded = expandedMenus[menu.id]

    return (
      <div>
        {menu.path ? (
          <NavLink
            to={menu.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-gray-700 hover:text-white transition-colors ${
                isActive ? 'bg-gray-700 text-white border-l-4 border-blue-500' : ''
              } ${level > 0 ? 'pl-8' : ''}`
            }
            onClick={() => hasChildren && toggleMenu(menu.id)}
          >
            <Icon size={20} />
            <span className="flex-1">{menu.name}</span>
            {hasChildren && (
              isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />
            )}
          </NavLink>
        ) : (
          <button
            onClick={() => handleMenuClick(menu)}
            className={`w-full flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-gray-700 hover:text-white transition-colors ${
              level > 0 ? 'pl-8' : ''
            }`}
          >
            <Icon size={20} />
            <span className="flex-1 text-left">{menu.name}</span>
            {hasChildren && (
              isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />
            )}
          </button>
        )}

        {hasChildren && isExpanded && (
          <div className="bg-gray-700">
            {menu.children.map(child => (
              <MenuItem key={child.id} menu={child} level={level + 1} />
            ))}
          </div>
        )}
      </div>
    )
  }

  // 사용자 이름의 첫 글자 추출 (아바타용)
  const getUserInitial = () => {
    if (!user) return 'G'  // Guest
    if (user.username) return user.username.charAt(0).toUpperCase()
    if (user.email) return user.email.charAt(0).toUpperCase()
    return 'U'  // User
  }

  // 표시할 사용자 이름
  const getDisplayName = () => {
    if (!user) return '게스트'
    return user.username || user.name || user.email?.split('@')[0] || '사용자'
  }

  // 표시할 이메일 또는 역할
  const getDisplayInfo = () => {
    if (!user) return 'guest@example.com'
    return user.email || roleDisplayNames[user.role] || user.role || '사용자'
  }

  // 헤더 타이틀 (권한별)
  const getHeaderTitle = () => {
    if (!user || !user.role) return 'System Panel'
    
    switch (user.role) {
      case ROLES.ADMIN:
        return 'Admin Panel'
      case ROLES.MANAGER:
        return 'Manager Panel'
      case ROLES.USER:
        return 'User Panel'
      case ROLES.GUEST:
        return 'Guest Panel'
      default:
        return 'System Panel'
    }
  }

  // 헤더 서브타이틀 (권한별)
  const getHeaderSubtitle = () => {
    if (!user || !user.role) return '시스템'
    
    switch (user.role) {
      case ROLES.ADMIN:
        return '관리자 시스템'
      case ROLES.MANAGER:
        return '매니저 시스템'
      case ROLES.USER:
        return '사용자 시스템'
      case ROLES.GUEST:
        return '게스트 모드'
      default:
        return '시스템'
    }
  }

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed md:static inset-y-0 left-0 z-30 w-64 bg-gray-800 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* 헤더 */}
        <div className="flex items-center justify-between h-16 px-4 bg-gray-900 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 ${user?.role ? roleBadgeColors[user.role] : 'bg-blue-600'} rounded-lg flex items-center justify-center`}>
              <span className="text-white font-bold text-xl">{getUserInitial()}</span>
            </div>
            <div>
              <h1 className="text-white font-bold text-lg">{getHeaderTitle()}</h1>
              <p className="text-gray-400 text-xs">{getHeaderSubtitle()}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="md:hidden text-gray-400 hover:text-white"
          >
            <X size={24} />
          </button>
        </div>

        {/* 메뉴 리스트 */}
        <nav className="flex-1 overflow-y-auto py-4" style={{ height: 'calc(100vh - 8rem)' }}>
          {loading ? (
            <div className="flex flex-col items-center justify-center py-8 gap-2">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
              <p className="text-gray-400 text-sm">메뉴 로딩 중...</p>
            </div>
          ) : menus.length === 0 ? (
            <div className="px-4 py-8">
              <div className="bg-yellow-900 bg-opacity-20 border border-yellow-500 rounded-lg p-4">
                <p className="text-yellow-400 text-sm font-medium">메뉴가 없습니다</p>
                <p className="text-yellow-300 text-xs mt-1">
                  메뉴 관리에서 메뉴를 등록하세요
                </p>
              </div>
            </div>
          ) : (
            <div>
              {menus.map(menu => (
                <MenuItem key={menu.id} menu={menu} />
              ))}
            </div>
          )}
        </nav>

        {/* 푸터 - 사용자 정보 */}
        <div className="border-t border-gray-700 p-4">
          <div className="flex items-center gap-3 text-gray-400 text-sm">
            {/* 아바타 */}
            <div className={`w-8 h-8 ${user?.role ? roleBadgeColors[user.role] : 'bg-gray-700'} rounded-full flex items-center justify-center`}>
              <span className="text-white font-semibold text-sm">
                {getUserInitial()}
              </span>
            </div>
            
            {/* 사용자 정보 */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-white font-medium truncate">
                  {getDisplayName()}
                </p>
                {user?.role && (
                  <span className={`text-xs px-2 py-0.5 rounded-full ${roleBadgeColors[user.role]} text-white`}>
                    {roleDisplayNames[user.role] || user.role}
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-400 truncate">
                {getDisplayInfo()}
              </p>
            </div>
            
            {/* 로그아웃 버튼 */}
            <button
              onClick={handleLogout}
              className="text-gray-400 hover:text-white transition-colors"
              title="로그아웃"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}

export default Sidebar
