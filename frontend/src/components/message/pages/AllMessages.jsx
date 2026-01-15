import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import {
  Loader, Plus, Search, X, Database, Filter, ChevronDown,
  ChevronLeft, ChevronRight, Mail, MailOpen, Trash2,
  ArrowUpDown, User, Clock
} from 'lucide-react'

import { messageService } from '../services/messageService'
import { useAuthStore } from '../../app/authStore'

const AllMessages = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { user, token, isAuthenticated } = useAuthStore()

  // State
  const [searchKeyword, setSearchKeyword] = useState('')
  const [tempKeyword, setTempKeyword] = useState('')
  const [filterType, setFilterType] = useState('all') // 'all', 'read', 'unread'
  const [sortOrder, setSortOrder] = useState('desc') // 'desc', 'asc'
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10) // 페이지당 항목 수

  useEffect(() => {
    if (!user || !token) {
      alert('로그인이 필요합니다')
      navigate('/login')
    }
  }, [user, token, navigate])

  // 데이터 조회
  const { data: messages, isLoading, error, refetch } = useQuery({
    queryKey: ['messages', 'all'],
    queryFn: () => messageService.getAllMessages(),
    enabled: !!user,
    retry: 1,
    staleTime: 10000,
  })

  // 삭제 mutation
  const deleteMutation = useMutation({
    mutationFn: (messageId) => messageService.deleteMessage(messageId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages', 'all'] })
      if (user?.id) {
        queryClient.invalidateQueries({ queryKey: ['messages', 'inbox', user.id] })
        queryClient.invalidateQueries({ queryKey: ['messages', 'sent', user.id] })
      }
    },
    onError: (err) => {
      alert(`삭제에 실패했습니다: ${err.response?.data?.message || err.message}`)
    },
  })

  // 필터링 및 정렬
  const filtered = useMemo(() => {
    let list = Array.isArray(messages) ? messages : []

    // 읽음/안읽음 필터
    if (filterType === 'read') {
      list = list.filter((m) => m.read)
    } else if (filterType === 'unread') {
      list = list.filter((m) => !m.read)
    }

    // 검색 키워드 필터
    if (searchKeyword.trim()) {
      list = list.filter((m) =>
        String(m.content || '').toLowerCase().includes(searchKeyword.trim().toLowerCase())
      )
    }

    // 정렬
    const sorted = [...list].sort((a, b) => {
      const dateA = new Date(a.createdAt || 0).getTime()
      const dateB = new Date(b.createdAt || 0).getTime()
      return sortOrder === 'desc' ? dateB - dateA : dateA - dateB
    })

    return sorted
  }, [messages, filterType, searchKeyword, sortOrder])

  // 페이징 처리
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize
    const endIndex = startIndex + pageSize
    return filtered.slice(startIndex, endIndex)
  }, [filtered, currentPage, pageSize])

  const totalPages = Math.ceil(filtered.length / pageSize)

  // 페이지 변경 시 스크롤 최상단으로
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [currentPage])

  // 검색어나 필터 변경 시 첫 페이지로
  useEffect(() => {
    setCurrentPage(1)
  }, [searchKeyword, filterType, sortOrder])

  const handleSearch = (e) => {
    e.preventDefault()
    setSearchKeyword(tempKeyword)
  }

  const handleClearSearch = () => {
    setTempKeyword('')
    setSearchKeyword('')
  }

  const handleRowClick = (message) => {
    navigate(`/messages/${message.id}`)
  }

  const handleCompose = () => {
    if (!isAuthenticated) {
      alert('로그인이 필요합니다')
      navigate('/login')
      return
    }
    navigate('/messages/compose')
  }

  const handleDelete = (messageId, e) => {
    e?.stopPropagation()
    if (!window.confirm('쪽지를 삭제할까요?')) return
    deleteMutation.mutate(messageId)
  }

  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return
    setCurrentPage(page)
  }

  // 통계 계산
  const stats = useMemo(() => {
    if (!messages) return { total: 0, read: 0, unread: 0 }
    return {
      total: messages.length,
      read: messages.filter((m) => m.read).length,
      unread: messages.filter((m) => !m.read).length,
    }
  }, [messages])

  // 날짜 포맷팅
  const formatDate = (dateString) => {
    if (!dateString) return '-'
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const diffDays = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (diffDays === 0) {
      return date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
    } else if (diffDays === 1) {
      return '어제'
    } else if (diffDays < 7) {
      return `${diffDays}일 전`
    } else {
      return date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })
    }
  }

  // 내용 미리보기 (최대 50자)
  const truncateContent = (content, maxLength = 50) => {
    if (!content) return '-'
    return content.length > maxLength ? `${content.substring(0, maxLength)}...` : content
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
        <p className="text-red-500">메시지를 불러오는 중 오류가 발생했습니다</p>
        <button
          onClick={() => refetch()}
          className="mt-4 px-4 py-2 rounded-lg bg-gray-900 text-white hover:bg-gray-800"
        >
          다시 시도
        </button>
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
        >
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 flex items-center gap-3">
            <Database className="h-8 w-8 text-purple-600" />
            전체 메시지
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            총 {stats.total}개 (읽음: {stats.read}, 안읽음: {stats.unread})
          </p>
        </motion.div>

        <motion.button
          onClick={handleCompose}
          className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition shadow-lg"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <Plus className="h-5 w-5" />
          <span>쪽지쓰기</span>
        </motion.button>
      </div>

      {/* 통계 카드 */}
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
          <div className="text-sm text-blue-600 font-medium">전체</div>
          <div className="text-2xl font-bold text-blue-900 mt-1">{stats.total}</div>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
          <div className="text-sm text-green-600 font-medium">읽음</div>
          <div className="text-2xl font-bold text-green-900 mt-1">{stats.read}</div>
        </div>
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-lg border border-orange-200">
          <div className="text-sm text-orange-600 font-medium">안읽음</div>
          <div className="text-2xl font-bold text-orange-900 mt-1">{stats.unread}</div>
        </div>
      </motion.div>

      {/* 검색 / 필터 */}
      <motion.div
        className="bg-white p-4 sm:p-6 rounded-lg shadow-md mb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* 읽음 상태 필터 */}
            <div className="relative sm:w-44">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full pl-10 pr-8 py-3 border border-gray-300 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 appearance-none cursor-pointer"
              >
                <option value="all">전체</option>
                <option value="unread">안읽음만</option>
                <option value="read">읽음만</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>

            {/* 정렬 순서 */}
            <div className="relative sm:w-44">
              <ArrowUpDown className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="w-full pl-10 pr-8 py-3 border border-gray-300 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 appearance-none cursor-pointer"
              >
                <option value="desc">최신순</option>
                <option value="asc">오래된순</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>

            {/* 페이지 크기 */}
            <div className="relative sm:w-32">
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value))
                  setCurrentPage(1)
                }}
                className="w-full px-3 py-3 border border-gray-300 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 appearance-none cursor-pointer"
              >
                <option value="5">5개씩</option>
                <option value="10">10개씩</option>
                <option value="20">20개씩</option>
                <option value="50">50개씩</option>
                <option value="100">100개씩</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>

            {/* 검색 입력 */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={tempKeyword}
                onChange={(e) => setTempKeyword(e.target.value)}
                placeholder="내용으로 검색..."
                className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
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
              className="flex items-center justify-center space-x-2 bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition whitespace-nowrap"
            >
              <Search className="h-5 w-5" />
              <span>검색</span>
            </button>
          </div>

          {searchKeyword && (
            <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg border border-purple-200">
              <div className="flex items-center space-x-2 text-sm">
                <span className="text-purple-600 font-medium">"{searchKeyword}"</span>
                <span className="text-gray-600">로 검색 중</span>
                <span className="text-gray-500">({filtered.length}건)</span>
              </div>
              <button
                type="button"
                onClick={handleClearSearch}
                className="flex items-center space-x-1 text-sm text-purple-600 hover:text-purple-700 transition"
              >
                <X className="h-4 w-4" />
                <span>검색 초기화</span>
              </button>
            </div>
          )}
        </form>
      </motion.div>

      {/* 테이블 */}
      <motion.div
        className="bg-white rounded-lg shadow-md overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16">
                  상태
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    발신자
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    수신자
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  내용
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    시간
                  </div>
                </th>
                <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-20">
                  삭제
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedData.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                    메시지가 없습니다
                  </td>
                </tr>
              ) : (
                paginatedData.map((message, index) => (
                  <motion.tr
                    key={message.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => handleRowClick(message)}
                    className={`cursor-pointer hover:bg-gray-50 transition ${!message.read ? 'bg-blue-50' : ''
                      }`}
                  >
                    {/* 상태 */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      {message.read ? (
                        <MailOpen className="h-5 w-5 text-gray-400" />
                      ) : (
                        <Mail className="h-5 w-5 text-blue-600" />
                      )}
                    </td>

                    {/* 발신자 */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center">
                          <span className="text-xs font-medium text-purple-600">
                            {message.senderId}
                          </span>
                        </div>
                        <div className="ml-2">
                          <div className="text-sm font-medium text-gray-900">
                            ID {message.senderId}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* 수신자 */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-xs font-medium text-blue-600">
                            {message.receiverId}
                          </span>
                        </div>
                        <div className="ml-2">
                          <div className="text-sm font-medium text-gray-900">
                            ID {message.receiverId}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* 내용 */}
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {truncateContent(message.content)}
                      </div>
                    </td>

                    {/* 시간 */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {formatDate(message.createdAt)}
                      </div>
                    </td>

                    {/* 삭제 버튼 */}
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <button
                        onClick={(e) => handleDelete(message.id, e)}
                        disabled={deleteMutation.isPending}
                        className="text-red-600 hover:text-red-800 disabled:opacity-50 disabled:cursor-not-allowed transition"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* 페이지네이션 */}
        {totalPages > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                이전
              </button>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                다음
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  전체 <span className="font-medium">{filtered.length}</span>개 중{' '}
                  <span className="font-medium">{(currentPage - 1) * pageSize + 1}</span>
                  {' '}-{' '}
                  <span className="font-medium">
                    {Math.min(currentPage * pageSize, filtered.length)}
                  </span>
                  개 표시
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>

                  {/* 페이지 번호 */}
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                    // 현재 페이지 근처만 표시
                    if (
                      page === 1 ||
                      page === totalPages ||
                      (page >= currentPage - 1 && page <= currentPage + 1)
                    ) {
                      return (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${currentPage === page
                              ? 'z-10 bg-purple-50 border-purple-500 text-purple-600'
                              : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                            }`}
                        >
                          {page}
                        </button>
                      )
                    } else if (
                      page === currentPage - 2 ||
                      page === currentPage + 2
                    ) {
                      return (
                        <span
                          key={page}
                          className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700"
                        >
                          ...
                        </span>
                      )
                    }
                    return null
                  })}

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  )
}

export default AllMessages
