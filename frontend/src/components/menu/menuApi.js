import api from '../app/api'

const MENU_API_BASE = '/admin/menus'

/**
 * 메뉴 관리 API 서비스
 */
const menuApi = {
  /**
   * 모든 메뉴 조회
   * @returns {Promise} 메뉴 목록
   */
  getAllMenus: async () => {
    try {
      console.log('🔍 API 호출: GET', MENU_API_BASE)
      const response = await api.get(MENU_API_BASE)
      console.log('✅ getAllMenus 응답:', response.data)
      return response.data
    } catch (error) {
      console.error('❌ 메뉴 조회 실패:', error)
      throw error
    }
  },

  /**
   * 메뉴 트리 구조 조회 (계층 구조)
   * @returns {Promise} 트리 구조의 메뉴 목록
   */
  getMenuTree: async () => {
    try {
      const response = await api.get(`${MENU_API_BASE}/tree`)
      return response.data
    } catch (error) {
      console.error('메뉴 트리 조회 실패:', error)
      // 에러 시 빈 배열 반환
      return []
    }
  },

  /**
   * 특정 메뉴 조회
   * @param {string} menuId - 메뉴 ID
   * @returns {Promise} 메뉴 상세 정보
   */
  getMenuById: async (menuId) => {
    try {
      const response = await api.get(`${MENU_API_BASE}/${menuId}`)
      return response.data
    } catch (error) {
      console.error('메뉴 상세 조회 실패:', error)
      throw error
    }
  },

  /**
   * 권한별 메뉴 조회
   * @param {string} role - 사용자 권한
   * @returns {Promise} 필터링된 메뉴 목록
   */
  getMenusByRole: async (role) => {
    try {
      const url = `${MENU_API_BASE}/role/${role}`
      console.log('🔍 API 호출: GET', url)
      console.log('🔑 요청 권한:', role)
      
      const response = await api.get(url)
      
      console.log('✅ getMenusByRole 응답:', response.data)
      console.log('📊 응답 메뉴 개수:', response.data?.length || 0)
      
      return response.data
    } catch (error) {
      console.error('❌ 권한별 메뉴 조회 실패:', error)
      console.error('❌ 에러 상세:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        url: error.config?.url
      })
      throw error
    }
  },

  /**
   * 새 메뉴 생성
   * @param {Object} menuData - 메뉴 데이터
   * @returns {Promise} 생성된 메뉴
   */
  createMenu: async (menuData) => {
    try {
      console.log('🔍 API 호출: POST', MENU_API_BASE, menuData)
      const response = await api.post(MENU_API_BASE, menuData)
      console.log('✅ createMenu 응답:', response.data)
      return response.data
    } catch (error) {
      console.error('❌ 메뉴 생성 실패:', error)
      throw error
    }
  },

  /**
   * 메뉴 수정
   * @param {string} menuId - 메뉴 ID
   * @param {Object} menuData - 수정할 메뉴 데이터
   * @returns {Promise} 수정된 메뉴
   */
  updateMenu: async (menuId, menuData) => {
    try {
      console.log('🔍 API 호출: PUT', `${MENU_API_BASE}/${menuId}`, menuData)
      const response = await api.put(`${MENU_API_BASE}/${menuId}`, menuData)
      console.log('✅ updateMenu 응답:', response.data)
      return response.data
    } catch (error) {
      console.error('❌ 메뉴 수정 실패:', error)
      throw error
    }
  },

  /**
   * 메뉴 삭제
   * @param {string} menuId - 메뉴 ID
   * @returns {Promise}
   */
  deleteMenu: async (menuId) => {
    try {
      console.log('🔍 API 호출: DELETE', `${MENU_API_BASE}/${menuId}`)
      const response = await api.delete(`${MENU_API_BASE}/${menuId}`)
      console.log('✅ deleteMenu 응답:', response.data)
      return response.data
    } catch (error) {
      console.error('❌ 메뉴 삭제 실패:', error)
      throw error
    }
  },

  /**
   * 메뉴 순서 변경
   * ⚠️ 수정됨: PATCH /order → PUT /reorder
   * @param {Array} menuOrders - [{id: string, order: number}] 형태의 배열
   * @returns {Promise}
   */
  updateMenuOrder: async (menuOrders) => {
    try {
      // ✅ 백엔드 엔드포인트에 맞춰 수정
      const url = `${MENU_API_BASE}/reorder`
      console.log('🔍 API 호출: PUT', url, menuOrders)
      
      const response = await api.put(url, menuOrders)
      console.log('✅ updateMenuOrder 응답:', response.data)
      return response.data
    } catch (error) {
      console.error('❌ 메뉴 순서 변경 실패:', error)
      throw error
    }
  },

  /**
   * 서브메뉴 생성
   * @param {string} parentMenuId - 부모 메뉴 ID
   * @param {Object} subMenuData - 서브메뉴 데이터
   * @returns {Promise}
   */
  createSubMenu: async (parentMenuId, subMenuData) => {
    try {
      const response = await api.post(`${MENU_API_BASE}/${parentMenuId}/submenu`, subMenuData)
      return response.data
    } catch (error) {
      console.error('서브메뉴 생성 실패:', error)
      throw error
    }
  },

  /**
   * 서브메뉴 수정
   * @param {string} parentMenuId - 부모 메뉴 ID
   * @param {string} subMenuId - 서브메뉴 ID
   * @param {Object} subMenuData - 수정할 서브메뉴 데이터
   * @returns {Promise}
   */
  updateSubMenu: async (parentMenuId, subMenuId, subMenuData) => {
    try {
      const response = await api.put(`${MENU_API_BASE}/${parentMenuId}/submenu/${subMenuId}`, subMenuData)
      return response.data
    } catch (error) {
      console.error('서브메뉴 수정 실패:', error)
      throw error
    }
  },

  /**
   * 서브메뉴 삭제
   * @param {string} parentMenuId - 부모 메뉴 ID
   * @param {string} subMenuId - 서브메뉴 ID
   * @returns {Promise}
   */
  deleteSubMenu: async (parentMenuId, subMenuId) => {
    try {
      const response = await api.delete(`${MENU_API_BASE}/${parentMenuId}/submenu/${subMenuId}`)
      return response.data
    } catch (error) {
      console.error('서브메뉴 삭제 실패:', error)
      throw error
    }
  }
}

export default menuApi