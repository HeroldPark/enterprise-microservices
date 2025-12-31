import { useNavigate } from 'react-router-dom'
import { MessageSquare, Paperclip, Eye, Calendar, User } from 'lucide-react'
import { motion } from 'framer-motion'

const BoardList = ({ boards, totalPages, currentPage, onPageChange }) => {
  console.log("BoardList 시작");
  
  const navigate = useNavigate()

  if (!boards || boards.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg shadow-md">
        <p className="text-gray-500 text-lg">No posts found</p>
      </div>
    )
  }

  return (
    <div>
      <div className="space-y-4">
        {boards.map((board, index) => (
          <motion.div
            key={board.id}
            className="bg-white rounded-lg shadow-md hover:shadow-lg transition cursor-pointer overflow-hidden"
            onClick={() => navigate(`/boards/${board.id}`)}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            whileHover={{ scale: 1.01 }}
          >
            <div className="p-6">
              <div className="flex items-start justify-between mb-3">
                <h2 className="text-xl font-semibold text-gray-900 hover:text-blue-600 transition flex-1">
                  {board.title}
                </h2>
              </div>

              <p className="text-gray-600 mb-4 line-clamp-2">
                {board.content}
              </p>

              <div className="flex items-center justify-between text-sm text-gray-500">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-1">
                    <User className="h-4 w-4" />
                    <span>{board.author}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-4 w-4" />
                    <span>{new Date(board.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-1">
                    <Eye className="h-4 w-4" />
                    <span>{board.viewCount}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <MessageSquare className="h-4 w-4" />
                    <span>{board.commentCount || 0}</span>
                  </div>
                  {board.attachmentCount > 0 && (
                    <div className="flex items-center space-x-1">
                      <Paperclip className="h-4 w-4" />
                      <span>{board.attachmentCount}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center space-x-2 mt-8">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 0}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>

          <div className="flex space-x-1">
            {[...Array(totalPages)].map((_, index) => (
              <button
                key={index}
                onClick={() => onPageChange(index)}
                className={`px-4 py-2 rounded-lg transition ${
                  currentPage === index
                    ? 'bg-blue-600 text-white'
                    : 'border border-gray-300 hover:bg-gray-50'
                }`}
              >
                {index + 1}
              </button>
            ))}
          </div>

          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages - 1}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}

export default BoardList
