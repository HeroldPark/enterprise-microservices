import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import axios from 'axios'
import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
)

function ModelDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [model, setModel] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    fetchModelDetail()
  }, [id])

  const fetchModelDetail = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const response = await axios.get(
        `http://localhost:8080/api/models/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setModel(response.data)
      setError(null)
    } catch (err) {
      console.error('Failed to fetch model:', err)
      setError('Failed to load model details')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this model?')) {
      return
    }

    try {
      const token = localStorage.getItem('token')
      await axios.delete(
        `http://localhost:8080/api/models/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      navigate('/aimodels')
    } catch (err) {
      console.error('Failed to delete model:', err)
      alert('Failed to delete model')
    }
  }

  const handleTrain = async () => {
    try {
      const token = localStorage.getItem('token')
      await axios.post(
        'http://localhost:8080/api/training',
        { modelId: parseInt(id), epochs: 10 },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      alert('Training started!')
      fetchModelDetail()
    } catch (err) {
      console.error('Failed to start training:', err)
      alert('Failed to start training')
    }
  }

  const getTrainingChart = () => {
    if (!model?.trainingHistories || model.trainingHistories.length === 0) {
      return null
    }

    const data = {
      labels: model.trainingHistories.map(h => `Epoch ${h.epoch}`),
      datasets: [
        {
          label: 'Training Loss',
          data: model.trainingHistories.map(h => h.trainingLoss),
          borderColor: 'rgb(255, 99, 132)',
          backgroundColor: 'rgba(255, 99, 132, 0.5)',
        },
        {
          label: 'Validation Loss',
          data: model.trainingHistories.map(h => h.validationLoss),
          borderColor: 'rgb(54, 162, 235)',
          backgroundColor: 'rgba(54, 162, 235, 0.5)',
        }
      ]
    }

    const options = {
      responsive: true,
      plugins: {
        legend: {
          position: 'top',
        },
        title: {
          display: true,
          text: 'Training Progress'
        }
      }
    }

    return <Line data={data} options={options} />
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Loading model details...</div>
      </div>
    )
  }

  if (error || !model) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error || 'Model not found'}
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold mb-2">{model.name}</h1>
            <div className="flex gap-4 text-sm text-gray-600">
              <span>Type: <span className="font-medium">{model.type}</span></span>
              <span>Status: <span className="font-medium">{model.status}</span></span>
              <span>Created by: {model.createdBy}</span>
            </div>
          </div>
          <div className="flex gap-2">
            {model.status === 'CREATED' && (
              <button
                onClick={handleTrain}
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
              >
                Start Training
              </button>
            )}
            <Link
              to={`/aimodels/edit/${id}`}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Edit
            </Link>
            <button
              onClick={handleDelete}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              Delete
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-4 border-b">
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab('overview')}
            className={`pb-2 px-4 ${activeTab === 'overview' ? 'border-b-2 border-blue-500 font-medium' : ''}`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('training')}
            className={`pb-2 px-4 ${activeTab === 'training' ? 'border-b-2 border-blue-500 font-medium' : ''}`}
          >
            Training History
          </button>
          <button
            onClick={() => setActiveTab('predictions')}
            className={`pb-2 px-4 ${activeTab === 'predictions' ? 'border-b-2 border-blue-500 font-medium' : ''}`}
          >
            Predictions
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-lg shadow p-6">
        {activeTab === 'overview' && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Model Information</h2>
            {model.description && (
              <div className="mb-4">
                <label className="font-medium">Description:</label>
                <p className="text-gray-700 mt-1">{model.description}</p>
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="font-medium">Dataset Path:</label>
                <p className="text-gray-700">{model.datasetPath || 'N/A'}</p>
              </div>
              <div>
                <label className="font-medium">Model Path:</label>
                <p className="text-gray-700">{model.modelPath || 'N/A'}</p>
              </div>
              <div>
                <label className="font-medium">Prediction Count:</label>
                <p className="text-gray-700">{model.predictionCount || 0}</p>
              </div>
              <div>
                <label className="font-medium">Average Confidence:</label>
                <p className="text-gray-700">
                  {model.averageConfidence ? (model.averageConfidence * 100).toFixed(2) + '%' : 'N/A'}
                </p>
              </div>
              <div>
                <label className="font-medium">Created At:</label>
                <p className="text-gray-700">
                  {new Date(model.createdAt).toLocaleString()}
                </p>
              </div>
              <div>
                <label className="font-medium">Updated At:</label>
                <p className="text-gray-700">
                  {new Date(model.updatedAt).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'training' && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Training History</h2>
            {model.trainingHistories && model.trainingHistories.length > 0 ? (
              <>
                <div className="mb-6">
                  {getTrainingChart()}
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Epoch</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Training Loss</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Validation Loss</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Training Acc</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Validation Acc</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {model.trainingHistories.map(history => (
                        <tr key={history.id}>
                          <td className="px-6 py-4 whitespace-nowrap">{history.epoch}</td>
                          <td className="px-6 py-4 whitespace-nowrap">{history.trainingLoss?.toFixed(4)}</td>
                          <td className="px-6 py-4 whitespace-nowrap">{history.validationLoss?.toFixed(4)}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {history.trainingAccuracy ? (history.trainingAccuracy * 100).toFixed(2) + '%' : 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {history.validationAccuracy ? (history.validationAccuracy * 100).toFixed(2) + '%' : 'N/A'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            ) : (
              <p className="text-gray-500">No training history available</p>
            )}
          </div>
        )}

        {activeTab === 'predictions' && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Predictions</h2>
            <div className="flex justify-between items-center mb-4">
              <p className="text-gray-600">
                Total predictions: {model.predictionCount || 0}
              </p>
              <Link
                to={`/predictions/create?modelId=${id}`}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Make Prediction
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ModelDetail
