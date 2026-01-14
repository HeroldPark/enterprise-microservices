import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'

function Models() {
  const [models, setModels] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [filterType, setFilterType] = useState('')
  const [filterStatus, setFilterStatus] = useState('')

  const modelTypes = [
    'ISOLATION_FOREST',
    'LSTM',
    'GRU',
    'RANDOM_FOREST',
    'XGBOOST'
  ]

  const modelStatuses = [
    'CREATED',
    'TRAINING',
    'TRAINED',
    'FAILED',
    'DEPLOYED',
    'ARCHIVED'
  ]

  useEffect(() => {
    fetchModels()
  }, [page, filterType, filterStatus])

  const fetchModels = async () => {
    try {
      setLoading(true)
      let url = `http://localhost:8080/api/models?page=${page}&size=10`
      
      if (filterType) {
        url = `http://localhost:8080/api/models/type/${filterType}?page=${page}&size=10`
      } else if (filterStatus) {
        url = `http://localhost:8080/api/models/status/${filterStatus}?page=${page}&size=10`
      }

      const token = localStorage.getItem('token')
      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` }
      })

      setModels(response.data.content)
      setTotalPages(response.data.totalPages)
      setError(null)
    } catch (err) {
      console.error('Failed to fetch models:', err)
      setError('Failed to load models')
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadgeClass = (status) => {
    const statusClasses = {
      CREATED: 'bg-gray-100 text-gray-800',
      TRAINING: 'bg-yellow-100 text-yellow-800',
      TRAINED: 'bg-green-100 text-green-800',
      FAILED: 'bg-red-100 text-red-800',
      DEPLOYED: 'bg-blue-100 text-blue-800',
      ARCHIVED: 'bg-purple-100 text-purple-800'
    }
    return statusClasses[status] || 'bg-gray-100 text-gray-800'
  }

  const getTypeColor = (type) => {
    const typeColors = {
      ISOLATION_FOREST: 'text-blue-600',
      LSTM: 'text-green-600',
      GRU: 'text-purple-600',
      RANDOM_FOREST: 'text-orange-600',
      XGBOOST: 'text-red-600'
    }
    return typeColors[type] || 'text-gray-600'
  }

  if (loading && models.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Loading models...</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">AI Models</h1>
        <Link
          to="/aimodels/create"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Create New Model
        </Link>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="mb-6 flex gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Filter by Type</label>
          <select
            value={filterType}
            onChange={(e) => {
              setFilterType(e.target.value)
              setFilterStatus('')
              setPage(0)
            }}
            className="border rounded px-3 py-2"
          >
            <option value="">All Types</option>
            {modelTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Filter by Status</label>
          <select
            value={filterStatus}
            onChange={(e) => {
              setFilterStatus(e.target.value)
              setFilterType('')
              setPage(0)
            }}
            className="border rounded px-3 py-2"
          >
            <option value="">All Statuses</option>
            {modelStatuses.map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Models Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {models.map(model => (
          <Link
            key={model.id}
            to={`/aimodels/${model.id}`}
            className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6"
          >
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-semibold">{model.name}</h3>
              <span className={`px-2 py-1 rounded text-xs font-semibold ${getStatusBadgeClass(model.status)}`}>
                {model.status}
              </span>
            </div>

            <div className="mb-3">
              <span className={`font-medium ${getTypeColor(model.type)}`}>
                {model.type}
              </span>
            </div>

            {model.description && (
              <p className="text-gray-600 mb-4 line-clamp-2">
                {model.description}
              </p>
            )}

            <div className="text-sm text-gray-500 space-y-1">
              <div>Created by: {model.createdBy}</div>
              <div>Created: {new Date(model.createdAt).toLocaleDateString()}</div>
            </div>
          </Link>
        ))}
      </div>

      {models.length === 0 && !loading && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No models found</p>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          <button
            onClick={() => setPage(p => Math.max(0, p - 1))}
            disabled={page === 0}
            className="px-4 py-2 border rounded disabled:opacity-50"
          >
            Previous
          </button>
          <span className="px-4 py-2">
            Page {page + 1} of {totalPages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1}
            className="px-4 py-2 border rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}

export default Models
