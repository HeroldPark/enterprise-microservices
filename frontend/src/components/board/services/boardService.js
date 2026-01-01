import api from '../../app/api'

export const boardService = {
  // 게시글 생성
  createBoard: async (boardData) => {
    const response = await api.post('/boards', boardData)
    return response.data
  },

  // 파일과 함께 게시글 생성
  createBoardWithFiles: async (boardData, files) => {
    const formData = new FormData()
    formData.append('board', new Blob([JSON.stringify(boardData)], { type: 'application/json' }))
    
    if (files && files.length > 0) {
      files.forEach((file) => {
        formData.append('files', file)
      })
    }

    const response = await api.post('/boards/with-files', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },

  // 게시글 목록 조회 (페이징)
  // getAllBoards: async (page = 0, size = 10, sortBy = 'createdAt', direction = 'DESC') => {
  //   const response = await api.get('/boards', {
  //     params: { page, size, sortBy, direction },
  //   })
  //   return response.data
  // },

  getAllBoards: async (page = 0, size = 10, sortBy = 'createdAt', direction = 'DESC') => {
    console.log("getAllBoards..."); // 👈 콘솔에 출력됨

    try {
      const response = await api.get('/boards', {
        params: { page, size, sortBy, direction },
      })
      return response.data
    } catch (error) {
      console.error('Failed to fetch boards:', error)
      // 인증 오류가 아닌 경우만 에러 throw
      if (error.response?.status !== 401) {
        throw error
      }
      // 인증 오류인 경우 빈 데이터 반환
      return { content: [], totalPages: 0 }
    }
  },

  // 게시글 상세 조회
  getBoardById: async (id) => {
    const response = await api.get(`/boards/${id}`)
    return response.data
  },

  // 게시글 수정
  updateBoard: async (id, boardData) => {
    const response = await api.put(`/boards/${id}`, boardData)
    return response.data
  },

  // 파일과 함께 게시글 수정
  updateBoardWithFiles: async (id, boardData, files) => {
    const formData = new FormData()
    formData.append('board', new Blob([JSON.stringify(boardData)], { type: 'application/json' }))
    
    if (files && files.length > 0) {
      files.forEach((file) => {
        formData.append('files', file)
      })
    }

    const response = await api.put(`/boards/${id}/with-files`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },

  // 게시글 삭제
  deleteBoard: async (id) => {
    await api.delete(`/boards/${id}`)
  },

  // 제목으로 검색
  searchByTitle: async (title, page = 0, size = 10) => {
    const response = await api.get('/boards/search/title', {
      params: { title, page, size },
    })
    return response.data
  },

  // 키워드로 검색 (제목 + 내용)
  searchByKeyword: async (keyword, page = 0, size = 10) => {
    const response = await api.get('/boards/search', {
      params: { keyword, page, size },
    })
    return response.data
  },

  // 작성자로 검색
  searchByAuthor: async (author, page = 0, size = 10) => {
    const response = await api.get('/boards/search/author', {
      params: { author, page, size },
    })
    return response.data
  },
}
