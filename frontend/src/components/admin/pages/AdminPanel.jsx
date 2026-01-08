import { useState, useEffect } from 'react'
import { Users, Menu, Settings, BarChart, Database, Shield, RefreshCw, AlertCircle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import adminService from '../services/AdminService'

const AdminPanel = () => {
  const navigate = useNavigate()
  
  // 상태 관리
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    loginUsers: 0,
    totalMenus: 0,
    totalBoards: 0
  })
  const [recentActivities, setRecentActivities] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // 데이터 로딩
  useEffect(() => {
    loadDashboardData()
  }, [])

  /**
   * 대시보드 데이터 로딩
   */
  const loadDashboardData = async () => {
    try {
      setLoading(true)
      setError(null)

      // 방법 1: 통합 API가 있는 경우
      try {
        const dashboardData = await adminService.getDashboardStats()
        setStats({
          totalUsers: dashboardData.totalUsers || 0,
          activeUsers: dashboardData.activeUsers || 0,
          loginUsers: dashboardData.loginUsers || 0,
          totalMenus: dashboardData.totalMenus || 0,
          totalBoards: dashboardData.totalBoards || 0
        })

        console.log('📦 [AdminPanel] dashboardData: ', dashboardData)
        
        if (dashboardData.recentActivities) {
          setRecentActivities(dashboardData.recentActivities)
        }
      } catch (dashboardError) {
        // 방법 2: 통합 API가 없는 경우, 개별 API 호출
        console.warn('⚠️ 통합 API 사용 불가, 개별 API 호출:', dashboardError)
        // await loadStatsIndividually()
      }

    } catch (error) {
      console.error('❌ 대시보드 데이터 로딩 실패:', error)
      setError('데이터를 불러오는데 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  /**
   * 개별 API 호출로 통계 데이터 로딩
   */
  const loadStatsIndividually = async () => {
    try {
      // 병렬로 모든 통계 API 호출
      const [userStats, menuStats, boardStats, activities] = await Promise.allSettled([
        adminService.getUserStats(),
        adminService.getMenuStats(),
        adminService.getBoardStats(),
        adminService.getRecentActivities(5)
      ])

      // 사용자 통계
      if (userStats.status === 'fulfilled') {
        setStats(prev => ({
          ...prev,
          totalUsers: userStats.value.totalUsers || 0,
          activeUsers: userStats.value.activeUsers || 0,
          loginUsers: userStats.value.loginUsers || 0
        }))
      }

      // 메뉴 통계
      if (menuStats.status === 'fulfilled') {
        setStats(prev => ({
          ...prev,
          totalMenus: menuStats.value.totalMenus || 0
        }))
      }

      // 게시판 통계
      if (boardStats.status === 'fulfilled') {
        setStats(prev => ({
          ...prev,
          totalBoards: boardStats.value.totalBoards || 0
        }))
      }

      // 최근 활동
      if (activities.status === 'fulfilled') {
        setRecentActivities(activities.value || [])
      }

    } catch (error) {
      console.error('❌ 개별 통계 로딩 실패:', error)
      throw error
    }
  }

  // 관리 기능 카드 설정
  const adminCards = [
    {
      title: '사용자 관리',
      description: '사용자 계정 및 권한 관리',
      icon: Users,
      color: 'bg-blue-500',
      path: '/admin/users',
      stat: stats.loginUsers,
      statLabel: '현재 사용자'
    },
    {
      title: '메뉴 관리',
      description: '시스템 메뉴 구조 및 권한 설정',
      icon: Menu,
      color: 'bg-purple-500',
      path: '/admin/menus',
      stat: stats.totalMenus,
      statLabel: '등록된 메뉴'
    },
    {
      title: '모델 설정',
      description: 'AI 모델 파라미터 및 설정 관리',
      icon: Database,
      color: 'bg-green-500',
      path: '/admin/model-configs',
      stat: 5,
      statLabel: '활성 모델'
    },
    {
      title: '시스템 설정',
      description: '전역 시스템 설정 및 환경 변수',
      icon: Settings,
      color: 'bg-orange-500',
      path: '/admin/settings',
      stat: null,
      statLabel: null
    }
  ]

  // 빠른 통계 설정
  const quickStats = [
    {
      label: '전체 사용자',
      value: stats.totalUsers,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      label: '활성 사용자',
      value: stats.activeUsers,
      icon: Shield,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    // {
    //   label: '현재 사용자',
    //   value: stats.loginUsers,
    //   icon: Shield,
    //   color: 'text-green-600',
    //   bgColor: 'bg-green-100'
    // },
    {
      label: '등록된 메뉴',
      value: stats.totalMenus,
      icon: Menu,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      label: '게시글 수',
      value: stats.totalBoards,
      icon: BarChart,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100'
    }
  ]

  // 로딩 상태
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col items-center justify-center py-20">
          <RefreshCw className="animate-spin text-blue-500 mb-4" size={48} />
          <p className="text-gray-600 text-lg">대시보드 데이터를 불러오는 중...</p>
        </div>
      </div>
    )
  }

  // 에러 상태
  if (error) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <AlertCircle className="text-red-500" size={24} />
            <h3 className="text-red-800 font-semibold text-lg">데이터 로딩 실패</h3>
          </div>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={loadDashboardData}
            className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
          >
            <RefreshCw size={16} />
            다시 시도
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* 헤더 */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">관리자 패널</h1>
          <p className="text-gray-600">시스템 전반을 관리하고 모니터링합니다.</p>
        </div>
        <button
          onClick={loadDashboardData}
          className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
          title="데이터 새로고침"
        >
          <RefreshCw size={16} />
          새로고침
        </button>
      </div>

      {/* 빠른 통계 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {quickStats.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-800">
                  {stat.value.toLocaleString()}
                </p>
              </div>
              <div className={`${stat.bgColor} p-3 rounded-lg`}>
                <stat.icon className={stat.color} size={24} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 관리 기능 카드 */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-gray-800 mb-4">관리 기능</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {adminCards.map((card, index) => (
            <div
              key={index}
              onClick={() => navigate(card.path)}
              className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer overflow-hidden group"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className={`${card.color} p-3 rounded-lg group-hover:scale-110 transition-transform`}>
                    <card.icon className="text-white" size={28} />
                  </div>
                  {card.stat !== null && (
                    <div className="text-right">
                      <p className="text-2xl font-bold text-gray-800">
                        {card.stat.toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-600">{card.statLabel}</p>
                    </div>
                  )}
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  {card.title}
                </h3>
                <p className="text-sm text-gray-600">
                  {card.description}
                </p>
              </div>
              <div className={`${card.color} h-1 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform`}></div>
            </div>
          ))}
        </div>
      </div>

      {/* 최근 활동 */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">최근 시스템 활동</h2>
        {recentActivities.length > 0 ? (
          <div className="space-y-3">
            {recentActivities.map((activity, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800">
                    {activity.action || activity.description}
                  </p>
                  <p className="text-xs text-gray-600">
                    사용자: {activity.user || activity.username || activity.userId || '알 수 없음'}
                  </p>
                </div>
                <span className="text-xs text-gray-500">
                  {activity.time || activity.createdAt || activity.timestamp}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p>최근 활동 내역이 없습니다.</p>
          </div>
        )}
      </div>

      {/* 시스템 정보 */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="font-semibold text-blue-900 mb-2">관리자 권한 안내</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• <strong>사용자 관리:</strong> 사용자 계정 생성, 수정, 삭제 및 권한 변경</li>
          <li>• <strong>메뉴 관리:</strong> 시스템 메뉴 구조 설정 및 권한별 접근 제어</li>
          <li>• <strong>모델 설정:</strong> AI 모델의 하이퍼파라미터 및 학습 설정 관리</li>
          <li>• <strong>시스템 설정:</strong> 전역 설정 및 시스템 환경 변수 관리</li>
        </ul>
      </div>
    </div>
  )
}

export default AdminPanel
