import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import axios from 'axios'

function PredictionCreate() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const modelId = searchParams.get('modelId')
  
  const [models, setModels] = useState([])
  const [formData, setFormData] = useState({
    modelId: modelId || '',
    inputData: '',
    metadata: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [result, setResult] = useState(null)

  useEffect(() => {
    fetchModels()
  }, [])

  const fetchModels = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get(
        'http://localhost:8080/api/models/status/TRAINED?size=100',
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setModels(response.data.content)
    } catch (err) {
      console.error('Failed to fetch models:', err)
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
      setResult(null)
      
      const token = localStorage.getItem('token')
      const username = localStorage.getItem('username') || 'user'
      
      const response = await axios.post(
        'http://localhost:8080/api/predictions',
        {
          modelId: parseInt(formData.modelId),
          inputData: formData.inputData,
          predictedBy: username,
          metadata: formData.metadata
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      )

      setResult(response.data)
    } catch (err) {
      console.error('Failed to make prediction:', err)
      setError(err.response?.data?.message || 'Failed to make prediction')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Make Prediction</h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {result && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            <h3 className="font-bold mb-2">Prediction Result</h3>
            <div className="space-y-2">
              <div>
                <span className="font-medium">Model:</span> {result.modelName}
              </div>
              <div>
                <span className="font-medium">Output:</span> {result.outputData}
              </div>
              <div>
                <span className="font-medium">Confidence:</span> {(result.confidence * 100).toFixed(2)}%
              </div>
              <div>
                <span className="font-medium">Created:</span> {new Date(result.createdAt).toLocaleString()}
              </div>
            </div>
            <div className="mt-4">
              <button
                onClick={() => setResult(null)}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              >
                Make Another Prediction
              </button>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6">
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">
              Select Model *
            </label>
            <select
              name="modelId"
              value={formData.modelId}
              onChange={handleChange}
              required
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">-- Select a trained model --</option>
              {models.map(model => (
                <option key={model.id} value={model.id}>
                  {model.name} ({model.type})
                </option>
              ))}
            </select>
            {models.length === 0 && (
              <p className="text-sm text-gray-500 mt-1">
                No trained models available. Please train a model first.
              </p>
            )}
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">
              Input Data * (JSON format)
            </label>
            <textarea
              name="inputData"
              value={formData.inputData}
              onChange={handleChange}
              required
              rows={8}
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
              placeholder='{"feature1": 1.0, "feature2": 2.5, "feature3": 0.8}'
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">
              Metadata (Optional, JSON format)
            </label>
            <textarea
              name="metadata"
              value={formData.metadata}
              onChange={handleChange}
              rows={4}
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
              placeholder='{"source": "api", "version": "1.0"}'
            />
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading || !formData.modelId}
              className="flex-1 bg-blue-500 text-white py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
            >
              {loading ? 'Predicting...' : 'Make Prediction'}
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

export default PredictionCreate
