import { motion } from 'framer-motion'
import { Mail, MailOpen, ChevronRight, Trash2 } from 'lucide-react'

const formatDateTime = (isoString) => {
  if (!isoString) return ''
  try {
    return new Date(isoString).toLocaleString()
  } catch {
    return String(isoString)
  }
}

const truncate = (text, max = 120) => {
  if (!text) return ''
  const t = String(text)
  return t.length > max ? `${t.slice(0, max)}…` : t
}

/**
 * MessageList.jsx - 공통 목록 컴포넌트
 * props:
 * - messages: Array<MessageResponseDto>
 * - mode: 'inbox' | 'sent' | 'all'
 * - currentUserId: number
 * - onSelect: (message) => void
 * - onDelete: (messageId, event) => void (optional)
 * - isDeleting: boolean (optional)
 */
const MessageList = ({ messages = [], mode = 'inbox', currentUserId, onSelect, onDelete, isDeleting = false }) => {
  if (!messages.length) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">쪽지가 없습니다</p>
      </div>
    )
  }

  const sorted = [...messages].sort((a, b) => {
    const da = new Date(a?.createdAt || 0).getTime()
    const db = new Date(b?.createdAt || 0).getTime()
    return db - da
  })

  return (
    <div className="space-y-3">
      {sorted.map((m) => {
        const counterpartId = mode === 'inbox' ? m.senderId : m.receiverId
        const isUnread = !m.read

        return (
          <motion.div
            key={m.id}
            className={`w-full bg-white rounded-lg shadow-md hover:shadow-lg transition border ${
              isUnread ? 'border-blue-200' : 'border-gray-100'
            }`}
            whileHover={{ scale: 1.01 }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-start gap-3 p-4 sm:p-5">
              <button
                onClick={() => onSelect?.(m)}
                className="flex items-start gap-3 flex-1 text-left"
              >
                <div className={`mt-0.5 ${isUnread ? 'text-blue-600' : 'text-gray-400'}`}>
                  {isUnread ? <Mail className="h-5 w-5" /> : <MailOpen className="h-5 w-5" />}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      {mode === 'all' ? (
                        <p className={`text-sm ${isUnread ? 'font-semibold text-gray-900' : 'text-gray-800'}`}>
                          From: {m.senderId ?? '-'} → To: {m.receiverId ?? '-'}
                        </p>
                      ) : (
                        <p className={`text-sm ${isUnread ? 'font-semibold text-gray-900' : 'text-gray-800'}`}>
                          {mode === 'inbox' ? 'From' : 'To'}: {counterpartId ?? '-'}
                        </p>
                      )}
                      <p className="text-xs text-gray-500 mt-0.5">
                        {formatDateTime(m.createdAt)}
                      </p>
                    </div>

                    <ChevronRight className="h-5 w-5 text-gray-300 flex-shrink-0" />
                  </div>

                  <p className="text-sm text-gray-700 mt-2 leading-relaxed break-words">
                    {truncate(m.content)}
                  </p>

                  <div className="mt-3">
                    {isUnread ? (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                        UNREAD
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                        READ
                      </span>
                    )}
                  </div>
                </div>
              </button>

              {/* 삭제 버튼 */}
              {onDelete && (
                <button
                  onClick={(e) => onDelete(m.id, e)}
                  disabled={isDeleting}
                  className="flex-shrink-0 p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                  title="삭제"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              )}
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}

export default MessageList
