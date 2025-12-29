import api from '../../app/api'

export const commentService = {
  // 댓글 생성
  createComment: async (boardId, commentData) => {
    const response = await api.post(`/boards/${boardId}/comments`, commentData)
    return response.data
  },

  // 게시글의 모든 댓글 조회
  getCommentsByBoardId: async (boardId) => {
    const response = await api.get(`/boards/${boardId}/comments`)
    return response.data
  },

  // 댓글 수정
  updateComment: async (boardId, commentId, commentData) => {
    const response = await api.put(`/boards/${boardId}/comments/${commentId}`, commentData)
    return response.data
  },

  // 댓글 삭제
  deleteComment: async (boardId, commentId) => {
    await api.delete(`/boards/${boardId}/comments/${commentId}`)
  },
}
