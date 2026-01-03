import { useState } from 'react'
import { Users, Menu, Settings, BarChart, Database, Shield } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const AdminPanel = () => {
  const navigate = useNavigate()
  const [stats] = useState({
    totalUsers: 1234,
    activeUsers: 856,
    totalMenus: 12,
    totalBoards: 456
  })

  const adminCards = [
    {
      title: '사용자 관리',
      description: '사용자 계정 및 권한 관리',
      icon: Users,
      color: 'bg-blue-500',
      path: '/admin/users',
      stat: stats.totalUsers,
      statLabel: '전체 사용자'
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

  return (
    <div className="max-w-7xl mx-auto">
      {/* 헤더 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">관리자 패널</h1>
        <p className="text-gray-600">시스템 전반을 관리하고 모니터링합니다.</p>
      </div>

      {/* 빠른 통계 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {quickStats.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-800">{stat.value.toLocaleString()}</p>
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
                      <p className="text-2xl font-bold text-gray-800">{card.stat}</p>
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
        <div className="space-y-3">
          {[
            { action: '새로운 사용자 등록', user: 'user123', time: '5분 전' },
            { action: '메뉴 수정', user: 'admin', time: '15분 전' },
            { action: '모델 설정 변경', user: 'admin', time: '1시간 전' },
            { action: '게시글 작성', user: 'user456', time: '2시간 전' },
            { action: '사용자 권한 변경', user: 'admin', time: '3시간 전' }
          ].map((activity, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-800">{activity.action}</p>
                <p className="text-xs text-gray-600">사용자: {activity.user}</p>
              </div>
              <span className="text-xs text-gray-500">{activity.time}</span>
            </div>
          ))}
        </div>
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
