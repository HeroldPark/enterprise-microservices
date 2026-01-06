import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../app/authStore'

const Dashboard = () => {
  const navigate = useNavigate()
  const { user } = useAuthStore()

  console.log('Dashboard rendering...', { user })

  return (
    <div className="max-w-7xl mx-auto p-8">
      {/* 헤더 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          대시보드 테스트
        </h1>
        <p className="text-gray-600">
          {user?.username || user?.name || 'Guest'}님, 환영합니다!
        </p>
        <p className="text-sm text-gray-500 mt-2">
          ✅ Dashboard가 정상적으로 렌더링되었습니다!
        </p>
      </div>

      {/* 간단한 테스트 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-sm text-gray-600 mb-2">테스트 카드 1</h3>
          <p className="text-2xl font-bold text-gray-800">1,234</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-sm text-gray-600 mb-2">테스트 카드 2</h3>
          <p className="text-2xl font-bold text-gray-800">856</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-sm text-gray-600 mb-2">테스트 카드 3</h3>
          <p className="text-2xl font-bold text-gray-800">342</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-sm text-gray-600 mb-2">테스트 카드 4</h3>
          <p className="text-2xl font-bold text-gray-800">1,567</p>
        </div>
      </div>

      {/* 빠른 링크 */}
      <div className="mt-8 bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">빠른 링크</h2>
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => navigate('/admin')}
            className="p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-md transition-all text-left"
          >
            <p className="font-semibold text-gray-800">관리자 패널</p>
            <p className="text-sm text-gray-600">시스템 관리</p>
          </button>
          <button
            onClick={() => navigate('/admin/users')}
            className="p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-md transition-all text-left"
          >
            <p className="font-semibold text-gray-800">사용자 관리</p>
            <p className="text-sm text-gray-600">사용자 계정 관리</p>
          </button>
          <button
            onClick={() => navigate('/products')}
            className="p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-md transition-all text-left"
          >
            <p className="font-semibold text-gray-800">상품 관리</p>
            <p className="text-sm text-gray-600">상품 목록</p>
          </button>
          <button
            onClick={() => navigate('/boards')}
            className="p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-md transition-all text-left"
          >
            <p className="font-semibold text-gray-800">게시판</p>
            <p className="text-sm text-gray-600">공지사항</p>
          </button>
        </div>
      </div>

      {/* 디버깅 정보 */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="font-semibold text-blue-900 mb-2">디버깅 정보</h3>
        <div className="text-sm text-blue-800 space-y-1">
          <p>• 현재 경로: {window.location.pathname}</p>
          <p>• 사용자: {user?.username || 'Guest'}</p>
          <p>• 인증 상태: {user ? '로그인됨' : '미로그인'}</p>
          <p>• 컴포넌트: Dashboard.jsx</p>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
