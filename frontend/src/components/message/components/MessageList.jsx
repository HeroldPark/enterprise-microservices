import { motion } from 'framer-motion'
import { Mail, MailOpen, ChevronRight } from 'lucide-react'

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
 * props:
 * - messages: Array<MessageResponseDto>
 * - mode: 'inbox' | 'sent'
 * - currentUserId: number
 * - onSelect: (message) => void
 */
const MessageList = ({ messages = [], mode = 'inbox', currentUserId, onSelect }) => {
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
        const isUnread = mode === 'inbox' ? !m.read : false

        return (
          <motion.button
            key={m.id}
            onClick={() => onSelect?.(m)}
            className={`w-full text-left bg-white rounded-lg shadow-md p-4 sm:p-5 hover:shadow-lg transition border ${
              isUnread ? 'border-blue-200' : 'border-gray-100'
            }`}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-start gap-3">
              <div className={`mt-0.5 ${isUnread ? 'text-blue-600' : 'text-gray-400'}`}>
                {isUnread ? <Mail className="h-5 w-5" /> : <MailOpen className="h-5 w-5" />}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className={`text-sm ${isUnread ? 'font-semibold text-gray-900' : 'text-gray-800'}`}>
                      {mode === 'inbox' ? 'From' : 'To'}: {counterpartId ?? '-'}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {formatDateTime(m.createdAt)}
                    </p>
                  </div>

                  <ChevronRight className="h-5 w-5 text-gray-300" />
                </div>

                <p className="text-sm text-gray-700 mt-2 leading-relaxed break-words">
                  {truncate(m.content)}
                </p>

                {mode === 'inbox' && (
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
                )}
              </div>
            </div>
          </motion.button>
        )
      })}
    </div>
  )
}

export default MessageList
