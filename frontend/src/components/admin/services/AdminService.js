import api from '../../app/api'

/**
 * 관리자 패널 통계 및 데이터 관리 서비스
 */
export const adminService = {
  /**
   * 대시보드 전체 통계 조회
   * @returns {Promise<Object>} 통계 데이터
   */
  getDashboardStats: async () => {
    try {
      const response = await api.get('/admin/dashboard/stats')
      return response.data
    } catch (error) {
      console.error('❌ 대시보드 통계 조회 실패:', error)
      throw error
    }
  },

  /**
   * 사용자 통계 조회
   * @returns {Promise<Object>} { totalUsers, activeUsers, inactiveUsers, usersByRole }
   */
  getUserStats: async () => {
    try {
      const response = await api.get('/admin/users/stats')
      return response.data
    } catch (error) {
      console.error('❌ 사용자 통계 조회 실패:', error)
      throw error
    }
  },

  /**
   * 메뉴 통계 조회
   * @returns {Promise<Object>} { totalMenus, activeMenus, menusByRole }
   */
  getMenuStats: async () => {
    try {
      const response = await api.get('/admin/menus/stats')
      return response.data
    } catch (error) {
      console.error('❌ 메뉴 통계 조회 실패:', error)
      throw error
    }
  },

  /**
   * 게시판 통계 조회
   * @returns {Promise<Object>} { totalBoards, todayBoards, totalComments }
   */
  getBoardStats: async () => {
    try {
      const response = await api.get('/admin/boards/stats')
      return response.data
    } catch (error) {
      console.error('❌ 게시판 통계 조회 실패:', error)
      throw error
    }
  },

  /**
   * 최근 활동 로그 조회
   * @param {number} limit - 조회할 로그 수
   * @returns {Promise<Array>} 활동 로그 목록
   */
  getRecentActivities: async (limit = 5) => {
    try {
      const response = await api.get('/admin/activities/recent', {
        params: { limit }
      })
      return response.data
    } catch (error) {
      console.error('❌ 최근 활동 조회 실패:', error)
      throw error
    }
  },

  /**
   * 시스템 정보 조회
   * @returns {Promise<Object>} 시스템 정보
   */
  getSystemInfo: async () => {
    try {
      const response = await api.get('/admin/system/info')
      return response.data
    } catch (error) {
      console.error('❌ 시스템 정보 조회 실패:', error)
      throw error
    }
  }
}

export default adminService