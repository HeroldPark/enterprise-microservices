import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'

function ModelEdit() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: '',
    config: ''
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const modelStatuses = [
    'CREATED',
    'TRAINING',
    'TRAINED',
    'FAILED',
    'DEPLOYED',
    'ARCHIVED'
  ]

  useEffect(() => {
    fetchModel()
  }, [id])

  const fetchModel = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const response = await axios.get(
        `http://localhost:8080/api/models/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      
      setFormData({
        name: response.data.name,
        description: response.data.description || '',
        status: response.data.status,
        config: response.data.config || ''
      })
      setError(null)
    } catch (err) {
      console.error('Failed to fetch model:', err)
      setError('Failed to load model')
    } finally {
      setLoading(false)
    }
  }

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
      
      await axios.put(
        `http://localhost:8080/api/models/${id}`,
        formData,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      )

      navigate(`/aimodels/${id}`)
    } catch (err) {
      console.error('Failed to update model:', err)
      setError(err.response?.data?.message || 'Failed to update model')
    } finally {
      setLoading(false)
    }
  }

  if (loading && !formData.name) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Edit Model</h1>

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
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">
              Status
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {modelStatuses.map(status => (
                <option key={status} value={status}>{status}</option>
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
            />
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-500 text-white py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
            >
              {loading ? 'Updating...' : 'Update Model'}
            </button>
            <button
              type="button"
              onClick={() => navigate(`/aimodels/${id}`)}
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

export default ModelEdit
