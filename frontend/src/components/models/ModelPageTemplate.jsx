import { motion } from 'framer-motion'
import { ArrowLeft, Info, CheckCircle, XCircle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const ModelPageTemplate = ({ 
  title, 
  subtitle, 
  description, 
  application, 
  strengths, 
  weaknesses,
  children 
}) => {
  const navigate = useNavigate()

  return (
    <div className="max-w-6xl mx-auto">
      {/* Back Button */}
      <motion.button
        onClick={() => navigate(-1)}
        className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-6"
        whileHover={{ x: -5 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <ArrowLeft className="h-5 w-5" />
        <span>Back</span>
      </motion.button>

      {/* Header */}
      <motion.div
        className="bg-white rounded-lg shadow-md p-8 mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-baseline space-x-3 mb-4">
          <h1 className="text-4xl font-bold text-gray-900">{title}</h1>
          <span className="text-xl text-gray-500">({subtitle})</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          {/* 원리 */}
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center space-x-2 mb-2">
              <Info className="h-5 w-5 text-blue-600" />
              <h3 className="font-semibold text-blue-900">원리</h3>
            </div>
            <p className="text-gray-700">{description}</p>
          </div>

          {/* 화재 예측 적용 */}
          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center space-x-2 mb-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <h3 className="font-semibold text-green-900">화재 예측 적용</h3>
            </div>
            <p className="text-gray-700">{application}</p>
          </div>

          {/* 강점 */}
          <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
            <div className="flex items-center space-x-2 mb-2">
              <CheckCircle className="h-5 w-5 text-purple-600" />
              <h3 className="font-semibold text-purple-900">강점</h3>
            </div>
            <p className="text-gray-700">{strengths}</p>
          </div>

          {/* 약점 */}
          <div className="p-4 bg-red-50 rounded-lg border border-red-200">
            <div className="flex items-center space-x-2 mb-2">
              <XCircle className="h-5 w-5 text-red-600" />
              <h3 className="font-semibold text-red-900">약점</h3>
            </div>
            <p className="text-gray-700">{weaknesses}</p>
          </div>
        </div>
      </motion.div>

      {/* Content Area */}
      {children}
    </div>
  )
}

export default ModelPageTemplate
