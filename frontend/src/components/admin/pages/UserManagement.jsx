import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Users, Search, Filter, Edit2, Trash2, 
  UserPlus, X, Check, AlertCircle, ChevronDown,
  Mail, Calendar, Shield
} from 'lucide-react'
import userManagementService from '../services/userManagementService'

const UserManagement = () => {
  const [users, setUsers] = useState([])
  const [filteredUsers, setFilteredUsers] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterRole, setFilterRole] = useState('ALL')
  const [filterStatus, setFilterStatus] = useState('ALL')
  const [isLoading, setIsLoading] = useState(true)
  const [selectedUser, setSelectedUser] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState('view') // 'view', 'edit', 'create'
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  const [error, setError] = useState(null)

  // 사용자 목록 가져오기
  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      // 실제 API 호출
      const response = await userManagementService.getAllUsers(0, 1000) // 전체 조회
      const userData = response.content || response
      
      setUsers(userData)
      setFilteredUsers(userData)
    } catch (error) {
      console.error('사용자 목록 조회 실패:', error)
      setError(error.response?.data?.message || '사용자 목록을 불러오는데 실패했습니다.')
      
      // 에러 발생 시 빈 배열로 설정
      setUsers([])
      setFilteredUsers([])
    } finally {
      setIsLoading(false)
    }
  }

  // 검색 및 필터링
  useEffect(() => {
    let result = users

    // 검색어 필터
    if (searchTerm) {
      result = result.filter(user => 
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.lastName.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // 권한 필터
    if (filterRole !== 'ALL') {
      result = result.filter(user => user.role === filterRole)
    }

    // 상태 필터
    if (filterStatus !== 'ALL') {
      const isEnabled = filterStatus === 'ENABLED'
      result = result.filter(user => user.enabled === isEnabled)
    }

    setFilteredUsers(result)
    setCurrentPage(1) // 필터 변경 시 첫 페이지로
  }, [searchTerm, filterRole, filterStatus, users])

  // 페이지네이션
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentUsers = filteredUsers.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage)

  // 사용자 편집
  const handleEdit = (user) => {
    setSelectedUser({ ...user })
    setModalMode('edit')
    setIsModalOpen(true)
  }

  // 사용자 삭제
  const handleDelete = async (userId) => {
    if (window.confirm('정말 이 사용자를 삭제하시겠습니까?')) {
      try {
        await userManagementService.deleteUser(userId)
        
        // 삭제 성공 시 목록에서 제거
        setUsers(users.filter(user => user.id !== userId))
        setFilteredUsers(filteredUsers.filter(user => user.id !== userId))
        
        alert('사용자가 삭제되었습니다.')
      } catch (error) {
        console.error('사용자 삭제 실패:', error)
        alert(`삭제에 실패했습니다: ${error.response?.data?.message || error.message}`)
      }
    }
  }

  // 사용자 생성
  const handleCreate = () => {
    setSelectedUser({
      username: '',
      email: '',
      password: '',
      firstName: '',
      lastName: '',
      phoneNumber: '',
      role: 'USER',
      enabled: true
    })
    setModalMode('create')
    setIsModalOpen(true)
  }

  // 사용자 저장
  const handleSave = async () => {
    try {
      // 입력 검증
      if (!selectedUser.username || !selectedUser.email) {
        alert('아이디와 이메일은 필수 항목입니다.')
        return
      }

      if (modalMode === 'create' && !selectedUser.password) {
        alert('비밀번호는 필수 항목입니다.')
        return
      }

      if (modalMode === 'create') {
        // 사용자 생성
        const newUser = await userManagementService.createUser(selectedUser)
        
        // 목록에 추가
        setUsers([newUser, ...users])
        setFilteredUsers([newUser, ...filteredUsers])
        
        alert('사용자가 생성되었습니다.')
      } else if (modalMode === 'edit') {
        // 사용자 수정
        const updatedUser = await userManagementService.updateUser(selectedUser.id, selectedUser)
        
        // 목록 업데이트
        setUsers(users.map(user => 
          user.id === selectedUser.id ? updatedUser : user
        ))
        setFilteredUsers(filteredUsers.map(user => 
          user.id === selectedUser.id ? updatedUser : user
        ))
        
        alert('사용자 정보가 수정되었습니다.')
      }
      
      setIsModalOpen(false)
    } catch (error) {
      console.error('저장 실패:', error)
      const errorMessage = error.response?.data?.message || error.message
      alert(`저장에 실패했습니다: ${errorMessage}`)
    }
  }

  // 권한 배지 스타일
  const getRoleBadgeStyle = (role) => {
    const styles = {
      ADMIN: 'bg-red-100 text-red-700 border-red-300',
      USER: 'bg-blue-100 text-blue-700 border-blue-300',
      GUEST: 'bg-gray-100 text-gray-700 border-gray-300'
    }
    return styles[role] || styles.GUEST
  }

  // 날짜 포맷
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Users className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">사용자 관리</h1>
              <p className="text-gray-600">전체 사용자: {users.length}명</p>
            </div>
          </div>
          <motion.button
            onClick={handleCreate}
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <UserPlus className="h-5 w-5" />
            <span>새 사용자 추가</span>
          </motion.button>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div
        className="bg-white rounded-lg shadow-md p-6 mb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* 검색 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              검색
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="이름, 이메일, 아이디로 검색..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* 권한 필터 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              권한
            </label>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
              >
                <option value="ALL">전체</option>
                <option value="ADMIN">관리자</option>
                <option value="USER">일반 사용자</option>
                <option value="GUEST">게스트</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* 상태 필터 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              상태
            </label>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
              >
                <option value="ALL">전체</option>
                <option value="ENABLED">활성</option>
                <option value="DISABLED">비활성</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* 필터 결과 */}
        <div className="mt-4 text-sm text-gray-600">
          {filteredUsers.length}개의 사용자가 검색되었습니다.
        </div>
      </motion.div>

      {/* Table */}
      <motion.div
        className="bg-white rounded-lg shadow-md overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  사용자
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  연락처
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  권한
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  상태
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  가입일
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  작업
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                      <span className="text-gray-500">사용자 목록을 불러오는 중...</span>
                    </div>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center">
                      <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
                      <span className="text-red-600 font-medium mb-2">오류 발생</span>
                      <span className="text-gray-500 mb-4">{error}</span>
                      <button
                        onClick={fetchUsers}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                      >
                        다시 시도
                      </button>
                    </div>
                  </td>
                </tr>
              ) : currentUsers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                    검색 결과가 없습니다.
                  </td>
                </tr>
              ) : (
                currentUsers.map((user, index) => (
                  <motion.tr
                    key={user.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-gray-50 transition"
                  >
                    {/* 사용자 정보 */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 font-semibold">
                            {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {user.firstName} {user.lastName}
                          </div>
                          <div className="text-sm text-gray-500">
                            @{user.username}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* 연락처 */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{user.email}</div>
                      <div className="text-sm text-gray-500">{user.phoneNumber}</div>
                    </td>

                    {/* 권한 */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${getRoleBadgeStyle(user.role)}`}>
                        {user.role}
                      </span>
                    </td>

                    {/* 상태 */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      {user.enabled ? (
                        <span className="flex items-center text-green-600">
                          <Check className="h-4 w-4 mr-1" />
                          <span className="text-sm font-medium">활성</span>
                        </span>
                      ) : (
                        <span className="flex items-center text-red-600">
                          <X className="h-4 w-4 mr-1" />
                          <span className="text-sm font-medium">비활성</span>
                        </span>
                      )}
                    </td>

                    {/* 가입일 */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(user.createdAt)}
                    </td>

                    {/* 작업 버튼 */}
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => handleEdit(user)}
                          className="text-blue-600 hover:text-blue-900 p-2 rounded hover:bg-blue-50 transition"
                          title="편집"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(user.id)}
                          className="text-red-600 hover:text-red-900 p-2 rounded hover:bg-red-50 transition"
                          title="삭제"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                이전
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                다음
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  전체 <span className="font-medium">{filteredUsers.length}</span>개 중{' '}
                  <span className="font-medium">{indexOfFirstItem + 1}</span>-
                  <span className="font-medium">{Math.min(indexOfLastItem, filteredUsers.length)}</span> 표시
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    이전
                  </button>
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        currentPage === i + 1
                          ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                          : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    다음
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </motion.div>

      {/* Edit/Create Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setIsModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b">
                <h2 className="text-2xl font-bold text-gray-900">
                  {modalMode === 'create' ? '새 사용자 추가' : '사용자 정보 수정'}
                </h2>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Username */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      아이디 *
                    </label>
                    <input
                      type="text"
                      value={selectedUser?.username || ''}
                      onChange={(e) => setSelectedUser({ ...selectedUser, username: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="username"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      이메일 *
                    </label>
                    <input
                      type="email"
                      value={selectedUser?.email || ''}
                      onChange={(e) => setSelectedUser({ ...selectedUser, email: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="user@example.com"
                    />
                  </div>

                  {/* Password */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      비밀번호 {modalMode === 'create' ? '*' : '(변경 시에만 입력)'}
                    </label>
                    <input
                      type="password"
                      value={selectedUser?.password || ''}
                      onChange={(e) => setSelectedUser({ ...selectedUser, password: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder={modalMode === 'create' ? '최소 6자 이상' : '변경하지 않으려면 비워두세요'}
                    />
                    {modalMode === 'edit' && (
                      <p className="mt-1 text-xs text-gray-500">
                        비밀번호를 변경하지 않으려면 이 필드를 비워두세요
                      </p>
                    )}
                  </div>

                  {/* First Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      이름 *
                    </label>
                    <input
                      type="text"
                      value={selectedUser?.firstName || ''}
                      onChange={(e) => setSelectedUser({ ...selectedUser, firstName: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="홍"
                    />
                  </div>

                  {/* Last Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      성 *
                    </label>
                    <input
                      type="text"
                      value={selectedUser?.lastName || ''}
                      onChange={(e) => setSelectedUser({ ...selectedUser, lastName: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="길동"
                    />
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      전화번호
                    </label>
                    <input
                      type="tel"
                      value={selectedUser?.phoneNumber || ''}
                      onChange={(e) => setSelectedUser({ ...selectedUser, phoneNumber: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="010-0000-0000"
                    />
                  </div>

                  {/* Role */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      권한 *
                    </label>
                    <select
                      value={selectedUser?.role || 'USER'}
                      onChange={(e) => setSelectedUser({ ...selectedUser, role: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="GUEST">게스트</option>
                      <option value="USER">일반 사용자</option>
                      <option value="ADMIN">관리자</option>
                    </select>
                  </div>
                </div>

                {/* Enabled */}
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={selectedUser?.enabled || false}
                    onChange={(e) => setSelectedUser({ ...selectedUser, enabled: e.target.checked })}
                    className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <label className="text-sm font-medium text-gray-700">
                    계정 활성화
                  </label>
                </div>

                {/* Info Message */}
                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-start space-x-2">
                    <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div className="text-sm text-blue-700">
                      <p className="font-medium mb-1">권한 안내</p>
                      <ul className="list-disc list-inside space-y-1 text-xs">
                        <li><strong>게스트:</strong> 공개 페이지만 접근 가능</li>
                        <li><strong>일반 사용자:</strong> 대부분의 기능 사용 가능</li>
                        <li><strong>관리자:</strong> 모든 기능 및 관리 페이지 접근 가능</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex justify-end space-x-3 p-6 border-t">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                >
                  취소
                </button>
                <button
                  onClick={handleSave}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  {modalMode === 'create' ? '생성' : '저장'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default UserManagement
