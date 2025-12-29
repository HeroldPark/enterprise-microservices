import api from '../../app/api'

export const attachmentService = {
  // 게시글의 모든 첨부파일 조회
  getAttachmentsByBoardId: async (boardId) => {
    const response = await api.get(`/boards/${boardId}/attachments`)
    return response.data
  },

  // 첨부파일 다운로드
  downloadAttachment: async (boardId, attachmentId, fileName) => {
    const response = await api.get(`/boards/${boardId}/attachments/${attachmentId}/download`, {
      responseType: 'blob',
    })
    
    // 파일 다운로드 처리
    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', fileName)
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)
  },

  // 첨부파일 삭제
  deleteAttachment: async (boardId, attachmentId) => {
    await api.delete(`/boards/${boardId}/attachments/${attachmentId}`)
  },

  // 파일 크기 포맷팅 유틸리티
  formatFileSize: (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  },
}
