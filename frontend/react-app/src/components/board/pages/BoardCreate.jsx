import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { boardService } from '../services/boardService'
import { useAuthStore } from '../../app/authStore'
import { ArrowLeft, Upload, X } from 'lucide-react'
import { motion } from 'framer-motion'

const BoardCreate = () => {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [files, setFiles] = useState([])

  const createMutation = useMutation({
    mutationFn: (data) => {
      if (files.length > 0) {
        return boardService.createBoardWithFiles(data.boardData, data.files)
      }
      return boardService.createBoard(data.boardData)
    },
    onSuccess: (data) => {
      navigate(`/boards/${data.id}`)
    },
  })

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files)
    const validFiles = selectedFiles.filter(file => file.size <= 10 * 1024 * 1024) // 10MB limit
    
    if (validFiles.length !== selectedFiles.length) {
      alert('Some files were not added because they exceed 10MB limit')
    }
    
    setFiles([...files, ...validFiles])
  }

  const handleRemoveFile = (index) => {
    setFiles(files.filter((_, i) => i !== index))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (!title.trim() || !content.trim()) {
      alert('Please fill in all required fields')
      return
    }

    const boardData = {
      title: title.trim(),
      content: content.trim(),
      author: user.username,
    }

    createMutation.mutate({ boardData, files })
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

      <motion.div
        className="bg-white rounded-lg shadow-md p-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Create New Post</h1>

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

          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Attachments (Max 10MB per file)
            </label>
            <div className="flex items-center space-x-4">
              <label className="flex items-center space-x-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition cursor-pointer">
                <Upload className="h-5 w-5" />
                <span>Choose Files</span>
                <input
                  type="file"
                  multiple
                  onChange={handleFileChange}
                  className="hidden"
                  accept="image/*,.pdf,.doc,.docx,.txt"
                />
              </label>
              <span className="text-sm text-gray-500">
                {files.length} file(s) selected
              </span>
            </div>

            {/* File List */}
            {files.length > 0 && (
              <div className="mt-4 space-y-2">
                {files.map((file, index) => (
                  <motion.div
                    key={index}
                    className="flex items-center justify-between bg-gray-50 p-3 rounded-lg"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="flex-1 truncate">
                      <p className="text-sm font-medium text-gray-900">{file.name}</p>
                      <p className="text-xs text-gray-500">
                        {(file.size / 1024).toFixed(2)} KB
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveFile(index)}
                      className="ml-4 p-1 text-red-500 hover:bg-red-50 rounded"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4 pt-6 border-t">
            <motion.button
              type="button"
              onClick={() => navigate('/boards')}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Cancel
            </motion.button>
            <motion.button
              type="submit"
              disabled={createMutation.isPending}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {createMutation.isPending ? 'Creating...' : 'Create Post'}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

export default BoardCreate
