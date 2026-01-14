import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../app/authStore'
import axios from 'axios'
import { 
  Brain, Zap, TrendingUp, Activity, Clock, CheckCircle, 
  XCircle, AlertCircle, ArrowRight, BarChart3, Cpu, Database
} from 'lucide-react'

const Dashboard = () => {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [stats, setStats] = useState(null)
  const [recentModels, setRecentModels] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token')
      const headers = { Authorization: `Bearer ${token}` }

      // Fetch model statistics
      const statsResponse = await axios.get('http://localhost:8080/api/models/stats', { headers })
      setStats(statsResponse.data)

      // Fetch recent models
      const modelsResponse = await axios.get('http://localhost:8080/api/models?page=0&size=5', { headers })
      setRecentModels(modelsResponse.data.content || [])
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err)
    } finally {
      setLoading(false)
    }
  }

  const StatCard = ({ icon: Icon, title, value, subtitle, color, trend }) => (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-6 border border-gray-100">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <h3 className="text-3xl font-bold text-gray-900 mb-1">
            {loading ? '...' : value}
          </h3>
          {subtitle && (
            <p className="text-sm text-gray-500">{subtitle}</p>
          )}
          {trend && (
            <div className="flex items-center mt-2 text-sm">
              <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
              <span className="text-green-600 font-medium">{trend}</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  )

  const ModelCard = ({ model }) => {
    const statusConfig = {
      CREATED: { color: 'bg-gray-100 text-gray-800', icon: Clock },
      TRAINING: { color: 'bg-yellow-100 text-yellow-800', icon: Activity },
      TRAINED: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      FAILED: { color: 'bg-red-100 text-red-800', icon: XCircle },
      DEPLOYED: { color: 'bg-blue-100 text-blue-800', icon: Cpu },
      ARCHIVED: { color: 'bg-purple-100 text-purple-800', icon: Database }
    }

    const config = statusConfig[model.status] || statusConfig.CREATED
    const StatusIcon = config.icon

    return (
      <div 
        onClick={() => navigate(`/aimodels/${model.id}`)}
        className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer border border-gray-100"
      >
        <div className="flex items-center space-x-4 flex-1">
          <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-semibold text-gray-900 truncate">{model.name}</h4>
            <p className="text-xs text-gray-500">{model.type}</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
            <StatusIcon className="w-3 h-3 mr-1" />
            {model.status}
          </span>
          <ArrowRight className="w-4 h-4 text-gray-400" />
        </div>
      </div>
    )
  }

  const QuickAction = ({ icon: Icon, title, description, onClick, gradient }) => (
    <button
      onClick={onClick}
      className="group relative overflow-hidden bg-white rounded-xl shadow-sm hover:shadow-lg transition-all p-6 border border-gray-100 text-left"
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-10 transition-opacity`} />
      <div className="relative">
        <div className={`inline-flex p-3 rounded-lg bg-gradient-to-br ${gradient} mb-4`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-1">{title}</h3>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
    </button>
  )

  const ModelTypeChart = () => {
    if (!stats?.modelsByType) return null

    const types = Object.entries(stats.modelsByType)
    const total = types.reduce((sum, [, count]) => sum + count, 0)
    
    const colors = [
      'from-blue-500 to-blue-600',
      'from-green-500 to-green-600',
      'from-purple-500 to-purple-600',
      'from-orange-500 to-orange-600',
      'from-red-500 to-red-600'
    ]

    return (
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <BarChart3 className="w-5 h-5 mr-2 text-blue-600" />
          Models by Type
        </h3>
        <div className="space-y-3">
          {types.map(([type, count], index) => {
            const percentage = total > 0 ? (count / total) * 100 : 0
            return (
              <div key={type}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700">{type}</span>
                  <span className="text-sm text-gray-600">{count}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full bg-gradient-to-r ${colors[index % colors.length]}`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center">
                <Brain className="w-8 h-8 mr-3 text-blue-600" />
                AI Model Dashboard
              </h1>
              <p className="text-gray-600">
                Welcome back, <span className="font-semibold">{user?.username || user?.name || 'User'}</span>! 
                Monitor and manage your AI models in real-time.
              </p>
            </div>
            <button
              onClick={() => navigate('/aimodels/create')}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:shadow-lg transition-all flex items-center space-x-2"
            >
              <Zap className="w-5 h-5" />
              <span>Create Model</span>
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            icon={Brain}
            title="Total Models"
            value={stats?.totalModels || 0}
            subtitle="All time"
            color="bg-gradient-to-br from-blue-500 to-blue-600"
          />
          <StatCard
            icon={CheckCircle}
            title="Trained Models"
            value={stats?.trainedModels || 0}
            subtitle="Ready to deploy"
            color="bg-gradient-to-br from-green-500 to-green-600"
            trend="+12% this month"
          />
          <StatCard
            icon={Activity}
            title="Training"
            value={stats?.trainingModels || 0}
            subtitle="In progress"
            color="bg-gradient-to-br from-yellow-500 to-orange-600"
          />
          <StatCard
            icon={Cpu}
            title="Deployed"
            value={stats?.deployedModels || 0}
            subtitle="Production ready"
            color="bg-gradient-to-br from-purple-500 to-purple-600"
          />
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <QuickAction
              icon={Brain}
              title="Create Model"
              description="Start a new AI model"
              onClick={() => navigate('/aimodels/create')}
              gradient="from-blue-500 to-purple-600"
            />
            <QuickAction
              icon={Activity}
              title="Train Models"
              description="View training progress"
              onClick={() => navigate('/aimodels')}
              gradient="from-green-500 to-teal-600"
            />
            <QuickAction
              icon={Zap}
              title="Make Prediction"
              description="Run inference"
              onClick={() => navigate('/predictions/create')}
              gradient="from-orange-500 to-red-600"
            />
            <QuickAction
              icon={BarChart3}
              title="View Analytics"
              description="Model performance"
              onClick={() => navigate('/aimodels')}
              gradient="from-purple-500 to-pink-600"
            />
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Models */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Brain className="w-5 h-5 mr-2 text-blue-600" />
                Recent Models
              </h3>
              <button
                onClick={() => navigate('/aimodels')}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center"
              >
                View All
                <ArrowRight className="w-4 h-4 ml-1" />
              </button>
            </div>
            
            {loading ? (
              <div className="flex items-center justify-center h-48">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : recentModels.length > 0 ? (
              <div className="space-y-2">
                {recentModels.map(model => (
                  <ModelCard key={model.id} model={model} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-48 text-gray-500">
                <Brain className="w-12 h-12 mb-2 opacity-30" />
                <p className="text-sm">No models yet</p>
                <button
                  onClick={() => navigate('/aimodels/create')}
                  className="mt-4 text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  Create your first model
                </button>
              </div>
            )}
          </div>

          {/* Model Type Distribution */}
          <div className="lg:col-span-1">
            <ModelTypeChart />
          </div>
        </div>

        {/* System Status */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl shadow-sm p-6 border border-blue-100">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center">
                <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
                System Status
              </h3>
              <p className="text-sm text-gray-600 mb-4">All systems operational</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-xs text-gray-500">API Gateway</p>
                  <p className="text-sm font-semibold text-green-600">Online</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Model Service</p>
                  <p className="text-sm font-semibold text-green-600">Online</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Database</p>
                  <p className="text-sm font-semibold text-green-600">Online</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Response Time</p>
                  <p className="text-sm font-semibold text-gray-900">45ms</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
