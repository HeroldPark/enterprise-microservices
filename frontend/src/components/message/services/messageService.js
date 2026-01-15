import api from '../../app/api'

// Message Service API Client
// - Gateway baseURL이 예: http://localhost:8080/api 라면
//   api.get('/messages') => http://localhost:8080/api/messages 로 호출됩니다.
// - api-gateway에서 /api/messages/** -> lb://message-service 로 라우팅 + stripPrefix(1) 이므로
//   message-service에는 /messages/** 로 전달됩니다.

export const messageService = {
  // ✅ 쪽지 보내기
  sendMessage: async ({ senderId, receiverId, content }) => {
    const payload = { senderId, receiverId, content }
    const response = await api.post('/messages', payload)
    return response.data
  },

  // ✅ 받은 쪽지함
  getInbox: async (receiverId) => {
    const response = await api.get(`/messages/inbox/${receiverId}`)
    return response.data
  },

  // ✅ 보낸 쪽지함
  getSent: async (senderId) => {
    const response = await api.get(`/messages/sent/${senderId}`)
    return response.data
  },

  // ✅ 전체 메시지 조회 (관리자용)
  getAllMessages: async () => {
    const response = await api.get('/messages/all')
    return response.data
  },

  // ✅ 쪽지 단건 조회
  getById: async (id) => {
    const response = await api.get(`/messages/${id}`)
    return response.data
  },

  // ✅ 읽음 처리
  markRead: async (id) => {
    const response = await api.patch(`/messages/${id}/read`)
    return response.data
  },

  // ✅ 삭제
  deleteMessage: async (id) => {
    await api.delete(`/messages/${id}`)
  },
}
