import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Loader, ArrowLeft, Trash2, Reply, MailOpen, Mail } from 'lucide-react'

import { messageService } from '../services/messageService'
import { useAuthStore } from '../../app/authStore'

const formatDateTime = (isoString) => {
  if (!isoString) return ''
  try {
    return new Date(isoString).toLocaleString()
  } catch {
    return String(isoString)
  }
}

const MessageDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { user, token } = useAuthStore()

  const messageId = Number(id)

  useEffect(() => {
    if (!user || !token) {
      alert('로그인이 필요합니다')
      navigate('/login')
    }
  }, [user, token, navigate])

  const { data: message, isLoading, error } = useQuery({
    queryKey: ['messages', 'detail', messageId],
    queryFn: () => messageService.getById(messageId),
    enabled: !!messageId,
    retry: 1,
    staleTime: 15000,
  })

  const markReadMutation = useMutation({
    mutationFn: () => messageService.markRead(messageId),
    onSuccess: (updated) => {
      // detail 캐시 업데이트
      queryClient.setQueryData(['messages', 'detail', messageId], updated)
      // inbox 캐시 무효화
      if (user?.id) {
        queryClient.invalidateQueries({ queryKey: ['messages', 'inbox', user.id] })
      }
    },
  })

  const deleteMutation = useMutation({
    mutationFn: () => messageService.deleteMessage(messageId),
    onSuccess: () => {
      // 캐시 무효화
      if (user?.id) {
        queryClient.invalidateQueries({ queryKey: ['messages', 'inbox', user.id] })
        queryClient.invalidateQueries({ queryKey: ['messages', 'sent', user.id] })
      }
      navigate(-1)
    },
    onError: (err) => {
      console.error('Delete failed:', err)
      alert(`삭제에 실패했습니다: ${err.response?.data?.message || err.message}`)
    },
  })

  // 받은 쪽지일 때만 자동 읽음 처리
  useEffect(() => {
    if (!message || !user?.id) return
    const isReceiver = message.receiverId === user.id
    if (isReceiver && message.read === false && !markReadMutation.isPending) {
      markReadMutation.mutate()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [message, user?.id])

  const handleDelete = () => {
    if (!window.confirm('쪽지를 삭제할까요?')) return
    deleteMutation.mutate()
  }

  const handleReply = () => {
    if (!message) return
    // 받은 쪽지에 대해 답장: to=senderId
    navigate('/messages/compose', { state: { receiverId: message.senderId } })
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
      </div>
    )
  }

  if (!message) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">쪽지를 찾을 수 없습니다</p>
      </div>
    )
  }

  const isReceiver = user?.id && message.receiverId === user.id
  const isSender = user?.id && message.senderId === user.id

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
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={message.read ? 'text-gray-400' : 'text-blue-600'}>
              {message.read ? <MailOpen className="h-7 w-7" /> : <Mail className="h-7 w-7" />}
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">쪽지 상세</h1>
              <p className="text-xs text-gray-500 mt-1">{formatDateTime(message.createdAt)}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isReceiver && (
              <motion.button
                onClick={handleReply}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Reply className="h-4 w-4" />
                <span>답장</span>
              </motion.button>
            )}

            {(isReceiver || isSender) && (
              <motion.button
                onClick={handleDelete}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={deleteMutation.isPending}
              >
                <Trash2 className="h-4 w-4" />
                <span>{deleteMutation.isPending ? '삭제 중...' : '삭제'}</span>
              </motion.button>
            )}
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
            <p className="text-xs text-gray-500">From</p>
            <p className="text-sm font-medium text-gray-900 mt-1">{message.senderId}</p>
          </div>
          <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
            <p className="text-xs text-gray-500">To</p>
            <p className="text-sm font-medium text-gray-900 mt-1">{message.receiverId}</p>
          </div>
        </div>

        <div className="mt-6 p-4 sm:p-6 rounded-lg border border-gray-200 bg-white">
          <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed break-words">
            {message.content}
          </p>
        </div>

        <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
          <span>
            상태: {message.read ? '읽음' : '안읽음'}
          </span>
          <span>
            updated: {formatDateTime(message.updatedAt)}
          </span>
        </div>
      </motion.div>
    </div>
  )
}

export default MessageDetail
