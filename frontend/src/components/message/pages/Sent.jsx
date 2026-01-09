import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Loader, Plus, Search, X, Send, Filter } from 'lucide-react'

import { messageService } from '../services/messageService'
import MessageList from '../components/MessageList'
import { useAuthStore } from '../../app/authStore'

const Sent = () => {
  const navigate = useNavigate()
  const { user, token, isAuthenticated } = useAuthStore()

  const [searchKeyword, setSearchKeyword] = useState('')
  const [tempKeyword, setTempKeyword] = useState('')

  useEffect(() => {
    if (!user || !token) {
      alert('로그인이 필요합니다')
      navigate('/login')
    }
  }, [user, token, navigate])

  const senderId = user?.id

  const { data: messages, isLoading, error, refetch } = useQuery({
    queryKey: ['messages', 'sent', senderId],
    queryFn: () => messageService.getSent(senderId),
    enabled: !!senderId,
    retry: 1,
    staleTime: 15000,
  })

  const filtered = useMemo(() => {
    const list = Array.isArray(messages) ? messages : []
    if (!searchKeyword.trim()) return list
    return list.filter((m) =>
      String(m.content || '').toLowerCase().includes(searchKeyword.trim().toLowerCase())
    )
  }, [messages, searchKeyword])

  const handleSearch = (e) => {
    e.preventDefault()
    setSearchKeyword(tempKeyword)
  }

  const handleClearSearch = () => {
    setTempKeyword('')
    setSearchKeyword('')
  }

  const handleSelect = (m) => {
    navigate(`/messages/${m.id}`)
  }

  const handleCompose = () => {
    if (!isAuthenticated) {
      alert('로그인이 필요합니다')
      navigate('/login')
      return
    }
    navigate('/messages/compose')
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
        <p className="text-red-500">쪽지를 불러오는 중 오류가 발생했습니다</p>
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
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 flex items-center gap-3">
            <Send className="h-8 w-8 text-blue-600" />
            보낸 쪽지함
          </h1>
          <p className="text-sm text-gray-500 mt-1">{filtered.length}개</p>
        </motion.div>

        <motion.button
          onClick={handleCompose}
          className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition shadow-lg"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Plus className="h-5 w-5" />
          <span>쪽지쓰기</span>
        </motion.button>
      </div>

      {/* 검색 */}
      <motion.div
        className="bg-white p-4 sm:p-6 rounded-lg shadow-md mb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative sm:w-44">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <div className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-700">
                내용 검색
              </div>
            </div>

            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={tempKeyword}
                onChange={(e) => setTempKeyword(e.target.value)}
                placeholder="내용으로 검색..."
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

            <button
              type="submit"
              className="flex items-center justify-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition whitespace-nowrap"
            >
              <Search className="h-5 w-5" />
              <span>검색</span>
            </button>
          </div>

          {searchKeyword && (
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center space-x-2 text-sm">
                <span className="text-blue-600 font-medium">"{searchKeyword}"</span>
                <span className="text-gray-600">로 검색 중</span>
                <span className="text-gray-500">({filtered.length}건)</span>
              </div>
              <button
                type="button"
                onClick={handleClearSearch}
                className="flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-700 transition"
              >
                <X className="h-4 w-4" />
                <span>검색 초기화</span>
              </button>
            </div>
          )}
        </form>
      </motion.div>

      {/* 목록 */}
      <MessageList
        messages={filtered}
        mode="sent"
        currentUserId={senderId}
        onSelect={handleSelect}
      />
    </div>
  )
}

export default Sent
