import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Menu, Bell, Search, User, Settings, 
  LogOut, ChevronDown 
} from 'lucide-react'
import { useAuthStore } from './authStore'

// 권한 상수 정의
export const ROLES = {
  GUEST: 'GUEST',
  USER: 'USER',
  MANAGER: 'MANAGER',
  ADMIN: 'ADMIN'
}

// 권한별 배지 색상
const roleBadgeColors = {
  [ROLES.GUEST]: 'bg-gray-500',
  [ROLES.USER]: 'bg-blue-500',
  [ROLES.MANAGER]: 'bg-purple-500',
  [ROLES.ADMIN]: 'bg-red-500'
}

const Header = ({ onMenuClick }) => {
  const { user, logout } = useAuthStore()  // ← 사용자 정보 가져오기
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const navigate = useNavigate()

  const getDisplayName = () => {
    if (!user) return '게스트'
    return user.username || user.name || '사용자'
  }

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

  // 사용자 이니셜 (헤더와 푸터에서 공통 사용)
  const getUserInitial = () => {
    if (!user) return 'G'
    if (user.username) return user.username.charAt(0).toUpperCase()
    if (user.email) return user.email.charAt(0).toUpperCase()
    return 'U'
  }

  const notifications = [
    { id: 1, message: '새로운 사용자가 등록되었습니다', time: '5분 전' },
    { id: 2, message: '메뉴가 수정되었습니다', time: '15분 전' },
    { id: 3, message: '시스템 업데이트가 있습니다', time: '1시간 전' }
  ]

  const handleLogout = () => {
    localStorage.removeItem('accessToken')
    navigate('/login')
  }

  return (
    <header className="bg-white border-b border-gray-200 h-16">
      <div className="flex items-center justify-between h-full px-6">
        {/* 왼쪽: 메뉴 버튼 & 검색 */}
        <div className="flex items-center gap-4 flex-1">
          {/* 모바일 메뉴 버튼 */}
          <button
            onClick={onMenuClick}
            className="md:hidden text-gray-600 hover:text-gray-900"
          >
            <Menu size={24} />
          </button>

          {/* 검색바 */}
          <div className="hidden md:flex items-center bg-gray-100 rounded-lg px-4 py-2 w-96">
            <Search size={20} className="text-gray-400" />
            <input
              type="text"
              placeholder="검색..."
              className="bg-transparent border-none outline-none ml-2 w-full text-sm"
            />
          </div>
        </div>

        {/* 오른쪽: 알림 & 사용자 메뉴 */}
        <div className="flex items-center gap-4">
          {/* 알림 */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Bell size={20} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            {/* 알림 드롭다운 */}
            {showNotifications && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowNotifications(false)}
                />
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
                  <div className="p-4 border-b border-gray-200">
                    <h3 className="font-semibold text-gray-800">알림</h3>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.map(notification => (
                      <div
                        key={notification.id}
                        className="p-4 hover:bg-gray-50 border-b border-gray-100 cursor-pointer"
                      >
                        <p className="text-sm text-gray-800">{notification.message}</p>
                        <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                      </div>
                    ))}
                  </div>
                  <div className="p-2 text-center border-t border-gray-200">
                    <button className="text-sm text-blue-600 hover:text-blue-800">
                      모든 알림 보기
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* 사용자 메뉴 */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-3 p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <div className={`w-10 h-10 ${user?.role ? roleBadgeColors[user.role] : 'bg-blue-600'} rounded-lg`}>
                <span className="text-black font-bold text-xl">{getUserInitial()}</span>
              </div>
              <div>
                <h1 className="text-black font-bold text-lg">{getHeaderTitle()}</h1>
                <p className="text-gray-400 text-xs">{getHeaderSubtitle()}</p>
              </div>
              <ChevronDown size={16} className="text-gray-600" />
            </button>

            {/* 사용자 드롭다운 */}
            {showUserMenu && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowUserMenu(false)}
                />
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
                  <div className="p-2">
                    <button
                      onClick={() => {
                        navigate('/profile')
                        setShowUserMenu(false)
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg"
                    >
                      <User size={16} />
                      프로필
                    </button>
                    <button
                      onClick={() => {
                        navigate('/settings')
                        setShowUserMenu(false)
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg"
                    >
                      <Settings size={16} />
                      설정
                    </button>
                  </div>
                  <div className="border-t border-gray-200 p-2">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <LogOut size={16} />
                      로그아웃
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header
