import api from '../../app/api'

export const userManagementService = {
  // 모든 사용자 조회
  getAllUsers: async (page = 0, size = 10, sortBy = 'createdAt', direction = 'DESC') => {
    const response = await api.get('/admin/users', {
      params: { page, size, sortBy, direction }
    })
    return response.data
  },

  // 사용자 ID로 조회
  getUserById: async (userId) => {
    const response = await api.get(`/admin/users/${userId}`)
    return response.data
  },

  // 사용자 생성
  createUser: async (userData) => {
    const response = await api.post('/admin/users', userData)
    return response.data
  },

  // 사용자 정보 수정
  updateUser: async (userId, userData) => {
    const response = await api.put(`/admin/users/${userId}`, userData)
    return response.data
  },

  // 사용자 삭제
  deleteUser: async (userId) => {
    await api.delete(`/admin/users/${userId}`)
  },

  // 사용자 검색 (이름, 이메일, 아이디)
  searchUsers: async (keyword, page = 0, size = 10) => {
    const response = await api.get('/admin/users/search', {
      params: { keyword, page, size }
    })
    return response.data
  },

  // 권한별 사용자 조회
  getUsersByRole: async (role, page = 0, size = 10) => {
    const response = await api.get('/admin/users/by-role', {
      params: { role, page, size }
    })
    return response.data
  },

  // 사용자 상태 변경 (활성/비활성)
  toggleUserStatus: async (userId, enabled) => {
    const response = await api.patch(`/admin/users/${userId}/status`, { enabled })
    return response.data
  },

  // 사용자 권한 변경
  changeUserRole: async (userId, role) => {
    const response = await api.patch(`/admin/users/${userId}/role`, { role })
    return response.data
  },

  // 사용자 통계
  getUserStats: async () => {
    const response = await api.get('/admin/users/stats')
    return response.data
  }
}

export default userManagementService
