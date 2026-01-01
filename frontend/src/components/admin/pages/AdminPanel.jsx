import { motion } from 'framer-motion'
import { Shield, Users, FileText, Settings, BarChart } from 'lucide-react'
import { Link } from 'react-router-dom'

const AdminPanel = () => {
  const stats = [
    { name: 'Total Users', value: '1,234', icon: Users, color: 'blue' },
    { name: 'Total Posts', value: '567', icon: FileText, color: 'green' },
    { name: 'Active Models', value: '5', icon: BarChart, color: 'purple' },
    { name: 'System Status', value: 'Healthy', icon: Settings, color: 'yellow' }
  ]

  return (
    <div className="max-w-7xl mx-auto">
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center space-x-3 mb-2">
          <Shield className="h-8 w-8 text-red-600" />
          <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
        </div>
        <p className="text-gray-600">관리자 전용 대시보드</p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          const colorClasses = {
            blue: 'bg-blue-100 text-blue-600',
            green: 'bg-green-100 text-green-600',
            purple: 'bg-purple-100 text-purple-600',
            yellow: 'bg-yellow-100 text-yellow-600'
          }

          return (
            <motion.div
              key={stat.name}
              className="bg-white rounded-lg shadow-md p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">{stat.name}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-lg ${colorClasses[stat.color]}`}>
                  <Icon className="h-6 w-6" />
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Admin Functions */}
      <motion.div
        className="bg-white rounded-lg shadow-md p-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <h2 className="text-2xl font-bold text-gray-900 mb-6">관리 기능</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link 
            to="/admin/users"
            className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition text-left block"
          >
            <h3 className="font-semibold text-gray-900 mb-1">사용자 관리</h3>
            <p className="text-sm text-gray-600">사용자 계정 및 권한 관리</p>
          </Link>

          <button className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition text-left">
            <h3 className="font-semibold text-gray-900 mb-1">게시글 관리</h3>
            <p className="text-sm text-gray-600">게시글 모니터링 및 관리</p>
          </button>

          <button className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition text-left">
            <h3 className="font-semibold text-gray-900 mb-1">모델 설정</h3>
            <p className="text-sm text-gray-600">AI 모델 파라미터 조정</p>
          </button>

          <button className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition text-left">
            <h3 className="font-semibold text-gray-900 mb-1">시스템 설정</h3>
            <p className="text-sm text-gray-600">전체 시스템 설정 관리</p>
          </button>
        </div>
      </motion.div>
    </div>
  )
}

export default AdminPanel
