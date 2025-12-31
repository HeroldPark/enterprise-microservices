import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { boardService } from '../services/boardService'
import { commentService } from '../services/commentService'
import { attachmentService } from '../services/attachmentService'
import { useAuthStore } from '../../app/authStore'
import CommentList from '../components/CommentList'
import AttachmentList from '../components/AttachmentList'
import { Loader, ArrowLeft, Edit, Trash2, Eye, Calendar, User } from 'lucide-react'
import { motion } from 'framer-motion'

const BoardDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { user, isAuthenticated } = useAuthStore()
  const [commentContent, setCommentContent] = useState('')

  // 게시글 조회
  const { data: board, isLoading, error } = useQuery({
    queryKey: ['board', id],
    queryFn: () => boardService.getBoardById(id),
  })

  // 게시글 삭제
  const deleteMutation = useMutation({
    mutationFn: () => boardService.deleteBoard(id),
    onSuccess: () => {
      navigate('/boards')
    },
  })

  // 댓글 작성
  const commentMutation = useMutation({
    mutationFn: (commentData) => commentService.createComment(id, commentData),
    onSuccess: () => {
      queryClient.invalidateQueries(['board', id])
      setCommentContent('')
    },
  })

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      deleteMutation.mutate()
    }
  }

  const handleCommentSubmit = (e) => {
    e.preventDefault()
    if (!isAuthenticated) {
      alert('Please login to comment')
      navigate('/login')
      return
    }
    if (!commentContent.trim()) return

    commentMutation.mutate({
      content: commentContent,
      author: user.username,
    })
  }

  const isAuthor = user?.username === board?.author

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
        <p className="text-red-500">Error loading board</p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Back Button */}
      <motion.button
        onClick={() => navigate('/boards')}
        className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-6"
        whileHover={{ x: -5 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <ArrowLeft className="h-5 w-5" />
        <span>Back to Boards</span>
      </motion.button>

      {/* Board Content */}
      <motion.div
        className="bg-white rounded-lg shadow-md overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div className="border-b border-gray-200 p-6">
          <div className="flex justify-between items-start mb-4">
            <h1 className="text-3xl font-bold text-gray-900">{board.title}</h1>
            
            {isAuthor && (
              <div className="flex space-x-2">
                <motion.button
                  onClick={() => navigate(`/boards/edit/${id}`)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Edit className="h-5 w-5" />
                </motion.button>
                <motion.button
                  onClick={handleDelete}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Trash2 className="h-5 w-5" />
                </motion.button>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-6 text-sm text-gray-600">
            <div className="flex items-center space-x-1">
              <User className="h-4 w-4" />
              <span>{board.author}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Calendar className="h-4 w-4" />
              <span>{new Date(board.createdAt).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Eye className="h-4 w-4" />
              <span>{board.viewCount} views</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="prose max-w-none text-gray-800 whitespace-pre-wrap">
            {board.content}
          </div>
        </div>

        {/* Attachments */}
        {board.attachments && board.attachments.length > 0 && (
          <div className="px-6 pb-6">
            <AttachmentList 
              boardId={id} 
              attachments={board.attachments}
              canDelete={isAuthor}
            />
          </div>
        )}
      </motion.div>

      {/* Comments Section */}
      <motion.div
        className="bg-white rounded-lg shadow-md mt-8 p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Comments ({board.comments?.length || 0})
        </h2>

        {/* Comment Form */}
        <form onSubmit={handleCommentSubmit} className="mb-8">
          <textarea
            value={commentContent}
            onChange={(e) => setCommentContent(e.target.value)}
            placeholder={isAuthenticated ? "Write a comment..." : "Please login to comment"}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            rows="3"
            disabled={!isAuthenticated}
          />
          <div className="mt-3 flex justify-end">
            <motion.button
              type="submit"
              disabled={!isAuthenticated || !commentContent.trim() || commentMutation.isPending}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
              whileHover={{ scale: isAuthenticated ? 1.05 : 1 }}
              whileTap={{ scale: isAuthenticated ? 0.95 : 1 }}
            >
              {commentMutation.isPending ? 'Posting...' : 'Post Comment'}
            </motion.button>
          </div>
        </form>

        {/* Comments List */}
        <CommentList 
          boardId={id}
          comments={board.comments || []} 
          currentUser={user?.username}
        />
      </motion.div>
    </div>
  )
}

export default BoardDetail
