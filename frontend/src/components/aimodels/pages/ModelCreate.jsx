import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

function ModelCreate() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    name: '',
    type: 'ISOLATION_FOREST',
    description: '',
    datasetPath: '',
    config: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const modelTypes = [
    'ISOLATION_FOREST',
    'LSTM',
    'GRU',
    'RANDOM_FOREST',
    'XGBOOST'
  ]

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      setLoading(true)
      setError(null)
      
      const token = localStorage.getItem('token')
      const username = localStorage.getItem('username') || 'user'
      
      const response = await axios.post(
        'http://localhost:8080/api/models',
        {
          ...formData,
          createdBy: username
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      )

      navigate(`/aimodels/${response.data.id}`)
    } catch (err) {
      console.error('Failed to create model:', err)
      setError(err.response?.data?.message || 'Failed to create model')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Create New Model</h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6">
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">
              Model Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter model name"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">
              Model Type *
            </label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              required
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {modelTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter model description"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">
              Dataset Path
            </label>
            <input
              type="text"
              name="datasetPath"
              value={formData.datasetPath}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="./datasets/data.csv"
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">
              Configuration (JSON)
            </label>
            <textarea
              name="config"
              value={formData.config}
              onChange={handleChange}
              rows={6}
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
              placeholder='{"learning_rate": 0.001, "batch_size": 32}'
            />
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-500 text-white py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
            >
              {loading ? 'Creating...' : 'Create Model'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/aimodels')}
              className="flex-1 bg-gray-300 text-gray-700 py-2 rounded hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ModelCreate
