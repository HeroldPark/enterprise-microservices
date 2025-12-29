import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { commentService } from '../services/commentService'
import { Calendar, User, Edit, Trash2, Check, X } from 'lucide-react'
import { motion } from 'framer-motion'

const CommentList = ({ boardId, comments, currentUser }) => {
  const queryClient = useQueryClient()
  const [editingId, setEditingId] = useState(null)
  const [editContent, setEditContent] = useState('')

  // 댓글 수정
  const updateMutation = useMutation({
    mutationFn: ({ commentId, content }) =>
      commentService.updateComment(boardId, commentId, { content }),
    onSuccess: () => {
      queryClient.invalidateQueries(['board', boardId])
      setEditingId(null)
      setEditContent('')
    },
  })

  // 댓글 삭제
  const deleteMutation = useMutation({
    mutationFn: (commentId) => commentService.deleteComment(boardId, commentId),
    onSuccess: () => {
      queryClient.invalidateQueries(['board', boardId])
    },
  })

  const handleEdit = (comment) => {
    setEditingId(comment.id)
    setEditContent(comment.content)
  }

  const handleUpdate = (commentId) => {
    if (!editContent.trim()) return
    updateMutation.mutate({ commentId, content: editContent })
  }

  const handleDelete = (commentId) => {
    if (window.confirm('Are you sure you want to delete this comment?')) {
      deleteMutation.mutate(commentId)
    }
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setEditContent('')
  }

  if (!comments || comments.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No comments yet. Be the first to comment!
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {comments.map((comment, index) => {
        const isAuthor = currentUser === comment.author
        const isEditing = editingId === comment.id

        return (
          <motion.div
            key={comment.id}
            className="border-b border-gray-200 pb-4 last:border-b-0"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-1 text-sm text-gray-600">
                  <User className="h-4 w-4" />
                  <span className="font-medium">{comment.author}</span>
                </div>
                <div className="flex items-center space-x-1 text-sm text-gray-500">
                  <Calendar className="h-4 w-4" />
                  <span>{new Date(comment.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              {isAuthor && !isEditing && (
                <div className="flex space-x-2">
                  <motion.button
                    onClick={() => handleEdit(comment)}
                    className="p-1 text-blue-600 hover:bg-blue-50 rounded transition"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Edit className="h-4 w-4" />
                  </motion.button>
                  <motion.button
                    onClick={() => handleDelete(comment.id)}
                    className="p-1 text-red-600 hover:bg-red-50 rounded transition"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </motion.button>
                </div>
              )}
            </div>

            {isEditing ? (
              <div className="space-y-2">
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  rows="3"
                />
                <div className="flex justify-end space-x-2">
                  <motion.button
                    onClick={handleCancelEdit}
                    className="flex items-center space-x-1 px-3 py-1 text-gray-600 hover:bg-gray-100 rounded transition"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <X className="h-4 w-4" />
                    <span>Cancel</span>
                  </motion.button>
                  <motion.button
                    onClick={() => handleUpdate(comment.id)}
                    disabled={updateMutation.isPending}
                    className="flex items-center space-x-1 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition disabled:bg-gray-400"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Check className="h-4 w-4" />
                    <span>Save</span>
                  </motion.button>
                </div>
              </div>
            ) : (
              <p className="text-gray-800 whitespace-pre-wrap">{comment.content}</p>
            )}

            {comment.updatedAt !== comment.createdAt && !isEditing && (
              <p className="text-xs text-gray-400 mt-1">(edited)</p>
            )}
          </motion.div>
        )
      })}
    </div>
  )
}

export default CommentList
