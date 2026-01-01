import { useNavigate } from 'react-router-dom'
import { MessageSquare, Paperclip, Eye, Calendar, User, ChevronLeft, ChevronRight } from 'lucide-react'
import { motion } from 'framer-motion'

const BoardList = ({ boards, totalPages, currentPage, onPageChange }) => {
  console.log("BoardList 시작")
  
  const navigate = useNavigate()

  const getPageNumbers = () => {
    const maxVisiblePages = 5
    const pages = []
    let startPage = Math.max(0, currentPage - Math.floor(maxVisiblePages / 2))
    let endPage = Math.min(totalPages - 1, startPage + maxVisiblePages - 1)

    if (endPage - startPage < maxVisiblePages - 1) {
      startPage = Math.max(0, endPage - maxVisiblePages + 1)
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i)
    }

    return pages
  }

  if (!boards || boards.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg shadow-md">
        <p className="text-gray-500 text-lg">게시글이 없습니다</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 데스크톱: 테이블 뷰 */}
      <motion.div 
        className="hidden md:block bg-white rounded-lg shadow-md overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-20">
                번호
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                제목
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-32">
                작성자
              </th>
              <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider w-32">
                작성일
              </th>
              <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider w-20">
                조회
              </th>
              <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider w-20">
                댓글
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {boards.map((board, index) => (
              <motion.tr
                key={board.id}
                className="hover:bg-gray-50 transition cursor-pointer"
                onClick={() => navigate(`/boards/${board.id}`)}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.03 }}
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {board.id}
                </td>

                <td className="px-6 py-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-900 hover:text-blue-600 transition">
                      {board.title}
                    </span>
                    {board.attachmentCount > 0 && (
                      <div className="flex items-center space-x-1 text-gray-400">
                        <Paperclip className="h-3.5 w-3.5" />
                        <span className="text-xs">{board.attachmentCount}</span>
                      </div>
                    )}
                    {board.commentCount > 0 && (
                      <span className="text-xs text-blue-600 font-medium">
                        [{board.commentCount}]
                      </span>
                    )}
                  </div>
                </td>

                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-1.5 text-sm text-gray-600">
                    <User className="h-4 w-4" />
                    <span>{board.author}</span>
                  </div>
                </td>

                <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500">
                  {new Date(board.createdAt).toLocaleDateString('ko-KR')}
                </td>

                <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500">
                  {board.viewCount}
                </td>

                <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500">
                  {board.commentCount || 0}
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </motion.div>

      {/* 모바일: 카드 뷰 */}
      <div className="md:hidden space-y-3">
        {boards.map((board, index) => (
          <motion.div
            key={board.id}
            className="bg-white rounded-lg shadow-md p-4 cursor-pointer"
            onClick={() => navigate(`/boards/${board.id}`)}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            whileTap={{ scale: 0.98 }}
          >
            {/* 제목 영역 */}
            <div className="flex items-start justify-between mb-2">
              <h3 className="text-base font-semibold text-gray-900 flex-1">
                {board.title}
              </h3>
              <span className="text-xs text-gray-400 ml-2">#{board.id}</span>
            </div>

            {/* 메타 정보 */}
            <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
              <div className="flex items-center space-x-1">
                <User className="h-3.5 w-3.5" />
                <span>{board.author}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Calendar className="h-3.5 w-3.5" />
                <span>{new Date(board.createdAt).toLocaleDateString('ko-KR')}</span>
              </div>
            </div>

            {/* 통계 */}
            <div className="flex items-center space-x-4 text-xs text-gray-500">
              <div className="flex items-center space-x-1">
                <Eye className="h-3.5 w-3.5" />
                <span>{board.viewCount}</span>
              </div>
              <div className="flex items-center space-x-1">
                <MessageSquare className="h-3.5 w-3.5" />
                <span>{board.commentCount || 0}</span>
              </div>
              {board.attachmentCount > 0 && (
                <div className="flex items-center space-x-1">
                  <Paperclip className="h-3.5 w-3.5" />
                  <span>{board.attachmentCount}</span>
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* 페이징 */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white rounded-lg shadow-md px-4 sm:px-6 py-4">
          {/* 페이지 정보 */}
          <div className="text-sm text-gray-600">
            Page <span className="font-semibold">{currentPage + 1}</span> of{' '}
            <span className="font-semibold">{totalPages}</span>
          </div>

          {/* 페이지 버튼들 */}
          <div className="flex items-center space-x-1 sm:space-x-2">
            {/* 첫 페이지 (모바일에서는 숨김) */}
            <button
              onClick={() => onPageChange(0)}
              disabled={currentPage === 0}
              className="hidden sm:block px-3 py-1.5 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              처음
            </button>

            {/* 이전 */}
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 0}
              className="px-2 sm:px-3 py-1.5 border border-gray-300 rounded-md hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            {/* 페이지 번호들 */}
            <div className="flex space-x-1">
              {getPageNumbers().map((pageNum) => (
                <button
                  key={pageNum}
                  onClick={() => onPageChange(pageNum)}
                  className={`min-w-[2rem] sm:min-w-[2.5rem] px-2 sm:px-3 py-1.5 text-sm rounded-md transition ${
                    currentPage === pageNum
                      ? 'bg-blue-600 text-white font-semibold'
                      : 'border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {pageNum + 1}
                </button>
              ))}
            </div>

            {/* 다음 */}
            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages - 1}
              className="px-2 sm:px-3 py-1.5 border border-gray-300 rounded-md hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="h-4 w-4" />
            </button>

            {/* 마지막 페이지 (모바일에서는 숨김) */}
            <button
              onClick={() => onPageChange(totalPages - 1)}
              disabled={currentPage === totalPages - 1}
              className="hidden sm:block px-3 py-1.5 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              마지막
            </button>
          </div>

          {/* 오른쪽 공간 유지 (데스크톱) */}
          <div className="hidden sm:block w-20"></div>
        </div>
      )}
    </div>
  )
}

export default BoardList
