import api from '../../app/api'

export const userService = {
  // 사용자 등록
  register: async (userData) => {
    const response = await api.post('/users/register', userData)
    return response.data
  },

  // 로그인
  login: async (credentials) => {
    const response = await api.post('/users/login', credentials)
    return response.data
  },

  // 로그아웃
  logout: async () => {
    await api.post('/users/logout')
  },

  // 사용자 정보 조회
  getUserById: async (id) => {
    const response = await api.get(`/users/${id}`)
    return response.data
  },

  // 사용자 정보 수정
  updateUser: async (id, userData) => {
    const response = await api.put(`/users/${id}`, userData)
    return response.data
  },

  // 비밀번호 변경
  changePassword: async (id, passwordData) => {
    const response = await api.patch(`/users/${id}/password`, passwordData)
    return response.data
  },

  // 사용자 삭제 (계정 탈퇴)
  deleteUser: async (id) => {
    await api.delete(`/users/${id}`)
  },

  // 이메일 중복 확인
  checkEmailExists: async (email) => {
    const response = await api.get('/users/check-email', {
      params: { email },
    })
    return response.data
  },

  // 사용자명 중복 확인
  checkUsernameExists: async (username) => {
    const response = await api.get('/users/check-username', {
      params: { username },
    })
    return response.data
  },

  // 현재 사용자 정보 조회
  getCurrentUser: async () => {
    const response = await api.get('/users/me')
    return response.data
  },

  // 사용자 프로필 이미지 업로드
  uploadProfileImage: async (id, imageFile) => {
    const formData = new FormData()
    formData.append('image', imageFile)

    const response = await api.post(`/users/${id}/profile-image`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },
}
