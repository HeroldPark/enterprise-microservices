import { useEffect, useState } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { ArrowLeft, Send, User, MessageSquareText } from 'lucide-react'

import { messageService } from '../services/messageService'
import { useAuthStore } from '../../app/authStore'

const MessageCompose = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()

  const { user, token } = useAuthStore()

  // 받는 사람 ID를 여러 방식으로 받을 수 있음
  const initialReceiverId =
    location.state?.receiverId ??   // 1순위: 이전 페이지에서 state로 전달
    (searchParams.get('to') ? Number(searchParams.get('to')) : '')  // 2순위: URL 쿼리 파라미터

  const [receiverId, setReceiverId] = useState(initialReceiverId)
  const [content, setContent] = useState('')

  useEffect(() => {
    if (!user || !token) {
      alert('로그인이 필요합니다')
      navigate('/login')
    }
  }, [user, token, navigate])

  const sendMutation = useMutation({
    mutationFn: (payload) => messageService.sendMessage(payload),
    onSuccess: (created) => {
      // 보낸함으로 이동
      navigate('/messages/sent')
    },
    onError: (error) => {
      console.error('Send message failed:', error)
      if (error.response?.status === 401) {
        alert('인증이 만료되었습니다. 다시 로그인해주세요.')
        navigate('/login')
      } else if (error.response?.status === 403) {
        alert('권한이 없습니다.')
      } else {
        alert(`쪽지 전송에 실패했습니다: ${error.response?.data?.message || error.message}`)
      }
    },
  })

  const handleSubmit = (e) => {
    e.preventDefault()

    // 1️⃣ 로그인 체크
    if (!user?.id) {
      alert('로그인이 필요합니다')
      navigate('/login')
      return
    }

    // 2️⃣ 입력값 검증
    const rid = Number(receiverId)
    if (!rid || Number.isNaN(rid)) {
      alert('받는 사람 ID(receiverId)를 입력해주세요')
      return
    }

    if (!String(content).trim()) {
      alert('내용을 입력해주세요')
      return
    }

    // 3️⃣ API 호출
    sendMutation.mutate({
      senderId: user.id,
      receiverId: rid,
      content: String(content).trim(),
    })
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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

      <motion.div
        className="bg-white rounded-lg shadow-md p-6 sm:p-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center gap-3 mb-6">
          <MessageSquareText className="h-7 w-7 text-blue-600" />
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">쪽지쓰기</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              받는 사람 ID
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="number"
                value={receiverId}
                onChange={(e) => setReceiverId(e.target.value)}
                placeholder="예: 2"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                min={1}
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              * 현재 구현은 receiverId(숫자) 기반입니다. (사용자 검색/선택 UI는 추후 확장)
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              내용
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={8}
              maxLength={500}
              placeholder="쪽지 내용을 입력하세요 (최대 500자)"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-2">
              <span>최대 500자</span>
              <span>{String(content || '').length}/500</span>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-5 py-3 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition"
            >
              취소
            </button>

            <motion.button
              type="submit"
              className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition shadow"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={sendMutation.isPending}
            >
              <Send className="h-5 w-5" />
              <span>{sendMutation.isPending ? '전송 중...' : '전송'}</span>
            </motion.button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

export default MessageCompose
