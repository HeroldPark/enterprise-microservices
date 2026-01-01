import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { boardService } from '../services/boardService'
import { useAuthStore } from '../../app/authStore'
import { useNavigate } from 'react-router-dom'
import BoardList from '../components/BoardList'
import { Loader, Plus, Search, X, Filter } from 'lucide-react'
import { motion } from 'framer-motion'

const Boards = () => {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuthStore()
  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(10)
  const [searchKeyword, setSearchKeyword] = useState('')
  const [searchType, setSearchType] = useState('keyword')
  const [tempKeyword, setTempKeyword] = useState('') // 입력 중인 키워드

  const { data: boardsData, isLoading, error, refetch } = useQuery({
    queryKey: ['boards', page, pageSize, searchKeyword, searchType],
    queryFn: () => {
      try {
        if (searchKeyword) {
          switch (searchType) {
            case 'title':
              return boardService.searchByTitle(searchKeyword, page, pageSize)
            case 'author':
              return boardService.searchByAuthor(searchKeyword, page, pageSize)
            default:
              return boardService.searchByKeyword(searchKeyword, page, pageSize)
          }
        }
        return boardService.getAllBoards(page, pageSize)
      } catch (err) {
        console.error('Query error:', err)
        throw err
      }
    },
    retry: 1,
    staleTime: 30000,
  })

  const handleSearch = (e) => {
    e.preventDefault()
    setSearchKeyword(tempKeyword)
    setPage(0)
  }

  const handleClearSearch = () => {
    setTempKeyword('')
    setSearchKeyword('')
    setPage(0)
  }

  const handleCreatePost = () => {
    if (!isAuthenticated) {
      alert('로그인이 필요합니다')
      navigate('/login')
      return
    }
    navigate('/boards/create')
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">게시글을 불러오는 중 오류가 발생했습니다</p>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* 헤더 */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
            게시판
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {boardsData?.totalElements || 0}개의 게시글
          </p>
        </motion.div>

        <motion.button
          onClick={handleCreatePost}
          className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition shadow-lg"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Plus className="h-5 w-5" />
          <span>글쓰기</span>
        </motion.button>
      </div>

      {/* 검색 영역 */}
      <motion.div 
        className="bg-white p-4 sm:p-6 rounded-lg shadow-md mb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <form onSubmit={handleSearch} className="space-y-4">
          {/* 검색 필터와 입력 */}
          <div className="flex flex-col sm:flex-row gap-3">
            {/* 검색 타입 선택 */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <select
                value={searchType}
                onChange={(e) => setSearchType(e.target.value)}
                className="pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white appearance-none cursor-pointer w-full sm:w-40"
              >
                <option value="keyword">전체</option>
                <option value="title">제목</option>
                <option value="author">작성자</option>
              </select>
            </div>

            {/* 검색 입력창 */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={tempKeyword}
                onChange={(e) => setTempKeyword(e.target.value)}
                placeholder="검색어를 입력하세요..."
                className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {tempKeyword && (
                <button
                  type="button"
                  onClick={() => setTempKeyword('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>

            {/* 검색 버튼 */}
            <button
              type="submit"
              className="flex items-center justify-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition whitespace-nowrap"
            >
              <Search className="h-5 w-5" />
              <span>검색</span>
            </button>
          </div>

          {/* 검색 결과 표시 */}
          {searchKeyword && (
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center space-x-2 text-sm">
                <span className="text-blue-600 font-medium">
                  "{searchKeyword}"
                </span>
                <span className="text-gray-600">
                  {searchType === 'keyword' ? '전체' : 
                   searchType === 'title' ? '제목' : '작성자'}에서 검색 중
                </span>
                <span className="text-gray-500">
                  ({boardsData?.totalElements || 0}건)
                </span>
              </div>
              <button
                onClick={handleClearSearch}
                className="flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-700 transition"
              >
                <X className="h-4 w-4" />
                <span>검색 초기화</span>
              </button>
            </div>
          )}
        </form>

        {/* 페이지 크기 선택 */}
        <div className="flex items-center justify-end space-x-2 mt-4 pt-4 border-t border-gray-200">
          <span className="text-sm text-gray-600">페이지당 표시:</span>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value))
              setPage(0)
            }}
            className="px-3 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          >
            <option value={5}>5개</option>
            <option value={10}>10개</option>
            <option value={20}>20개</option>
            <option value={50}>50개</option>
          </select>
        </div>
      </motion.div>

      {/* 게시글 목록 */}
      <BoardList 
        boards={boardsData?.content || []} 
        totalPages={boardsData?.totalPages || 0}
        currentPage={page}
        onPageChange={setPage}
      />
    </div>
  )
}

export default Boards
