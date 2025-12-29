import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { boardService } from '../services/boardService'
import { useAuthStore } from '../../app/authStore'
import { ArrowLeft, Loader } from 'lucide-react'
import { motion } from 'framer-motion'

const BoardEdit = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { user } = useAuthStore()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')

  const { data: board, isLoading } = useQuery({
    queryKey: ['board', id],
    queryFn: () => boardService.getBoardById(id),
  })

  useEffect(() => {
    if (board) {
      if (board.author !== user?.username) {
        alert('You can only edit your own posts')
        navigate(`/boards/${id}`)
        return
      }
      setTitle(board.title)
      setContent(board.content)
    }
  }, [board, user, id, navigate])

  const updateMutation = useMutation({
    mutationFn: (boardData) => boardService.updateBoard(id, boardData),
    onSuccess: () => {
      queryClient.invalidateQueries(['board', id])
      navigate(`/boards/${id}`)
    },
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (!title.trim() || !content.trim()) {
      alert('Please fill in all required fields')
      return
    }

    updateMutation.mutate({
      title: title.trim(),
      content: content.trim(),
    })
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Back Button */}
      <motion.button
        onClick={() => navigate(`/boards/${id}`)}
        className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-6"
        whileHover={{ x: -5 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <ArrowLeft className="h-5 w-5" />
        <span>Back to Post</span>
      </motion.button>

      <motion.div
        className="bg-white rounded-lg shadow-md p-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Edit Post</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Title *
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter post title"
              maxLength={200}
              required
            />
            <p className="mt-1 text-sm text-gray-500">{title.length}/200</p>
          </div>

          {/* Content */}
          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
              Content *
            </label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              placeholder="Write your content here..."
              rows="12"
              required
            />
          </div>

          <div className="text-sm text-gray-600 bg-yellow-50 p-4 rounded-lg">
            Note: File attachments cannot be modified. To change attachments, please delete and recreate the post.
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4 pt-6 border-t">
            <motion.button
              type="button"
              onClick={() => navigate(`/boards/${id}`)}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Cancel
            </motion.button>
            <motion.button
              type="submit"
              disabled={updateMutation.isPending}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {updateMutation.isPending ? 'Updating...' : 'Update Post'}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

export default BoardEdit
