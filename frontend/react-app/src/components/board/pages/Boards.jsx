import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { boardService } from '../services/boardService'
import { useAuthStore } from '../../app/authStore'
import { useNavigate } from 'react-router-dom'
import BoardList from '../components/BoardList'
import { Loader, Plus, Search } from 'lucide-react'
import { motion } from 'framer-motion'

const Boards = () => {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuthStore()
  const [page, setPage] = useState(0)
  const [searchKeyword, setSearchKeyword] = useState('')
  const [searchType, setSearchType] = useState('keyword') // keyword, title, author

  const { data: boardsData, isLoading, error, refetch } = useQuery({
    queryKey: ['boards', page, searchKeyword, searchType],
    queryFn: () => {
      if (searchKeyword) {
        switch (searchType) {
          case 'title':
            return boardService.searchByTitle(searchKeyword, page, 10)
          case 'author':
            return boardService.searchByAuthor(searchKeyword, page, 10)
          default:
            return boardService.searchByKeyword(searchKeyword, page, 10)
        }
      }
      return boardService.getAllBoards(page, 10)
    },
  })

  const handleSearch = (e) => {
    e.preventDefault()
    setPage(0)
    refetch()
  }

  const handleCreatePost = () => {
    if (!isAuthenticated) {
      alert('Please login to create a post')
      navigate('/login')
      return
    }
    navigate('/boards/create')
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
        <p className="text-red-500">Error loading boards</p>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <motion.h1 
          className="text-4xl font-bold text-gray-900"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Community Board
        </motion.h1>

        <motion.button
          onClick={handleCreatePost}
          className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition shadow-lg"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Plus className="h-5 w-5" />
          <span>New Post</span>
        </motion.button>
      </div>

      {/* Search Bar */}
      <motion.div 
        className="bg-white p-6 rounded-lg shadow-md mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <form onSubmit={handleSearch} className="flex gap-4">
          <select
            value={searchType}
            onChange={(e) => setSearchType(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="keyword">All</option>
            <option value="title">Title</option>
            <option value="author">Author</option>
          </select>

          <div className="flex-1 flex gap-2">
            <input
              type="text"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              placeholder="Search boards..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              <Search className="h-5 w-5" />
              <span>Search</span>
            </button>
          </div>
        </form>

        {searchKeyword && (
          <div className="mt-3 text-sm text-gray-600">
            Searching for "{searchKeyword}" in {searchType === 'keyword' ? 'all fields' : searchType}
          </div>
        )}
      </motion.div>

      {/* Board List */}
      <BoardList 
        boards={boardsData?.content || []} 
        totalPages={boardsData?.totalPages || 0}
        currentPage={page}
        onPageChange={setPage}
      />
    </div>
  )
}

export default Boards
