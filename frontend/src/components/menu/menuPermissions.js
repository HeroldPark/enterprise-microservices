// 권한 상수 정의
export const ROLES = {
  GUEST: 'GUEST',
  USER: 'USER',
  MANAGER: 'MANAGER',
  ADMIN: 'ADMIN'
}

// 메뉴 아이템 정의
export const menuItems = [
  {
    id: 'home',
    name: 'Home',
    path: '/',
    icon: 'Home',
    roles: [ROLES.GUEST, ROLES.USER, ROLES.MANAGER, ROLES.ADMIN],
    order: 1
  },
  {
    id: 'dashboard',  // ← 추가된 Dashboard 메뉴
    name: 'Dashboard',
    path: '/dashboard',
    icon: 'BarChart',
    roles: [ROLES.GUEST, ROLES.USER, ROLES.MANAGER, ROLES.ADMIN], // 모든 사용자 접근 가능
    order: 2
  },
  {
    id: 'boards',
    name: 'Boards',
    path: '/boards',
    icon: 'MessageSquare',
    roles: [ROLES.GUEST, ROLES.USER, ROLES.MANAGER, ROLES.ADMIN],
    order: 3  // ← 순서 변경 (2 → 3)
  },
  {
    id: 'models',
    name: 'Models',
    path: null,
    icon: 'Brain',
    roles: [ROLES.USER, ROLES.MANAGER, ROLES.ADMIN],
    isDropdown: true,
    order: 4,  // ← 순서 변경 (3 → 4)
    subItems: [
      {
        id: 'isolation-forest',
        name: 'Isolation Forest',
        subtitle: '격리 숲',
        description: '이상치는 정상보다 쉽게 격리된다',
        application: '비정상적인 센서 조합 즉시 감지',
        strengths: '실시간 이상 탐지, 빠른 속도',
        weaknesses: '시계열 패턴 무시',
        path: '/models/isolation-forest',
        roles: [ROLES.USER, ROLES.MANAGER, ROLES.ADMIN]
      },
      {
        id: 'lstm',
        name: 'LSTM',
        subtitle: '장단기 메모리',
        description: '게이트 메커니즘으로 장기 기억 유지',
        application: '30분~1시간 전 패턴 학습',
        strengths: '복잡한 시계열 의존성 포착',
        weaknesses: '학습 시간 길고 데이터 많이 필요',
        path: '/models/lstm',
        roles: [ROLES.USER, ROLES.MANAGER, ROLES.ADMIN]
      },
      {
        id: 'gru',
        name: 'GRU',
        subtitle: '게이트 순환 유닛',
        description: 'LSTM 간소화 버전 (2개 게이트)',
        application: '5~15분 단기 급변 감지',
        strengths: 'LSTM보다 빠르고 효율적',
        weaknesses: '매우 긴 시퀀스에서 성능 저하',
        path: '/models/gru',
        roles: [ROLES.USER, ROLES.MANAGER, ROLES.ADMIN]
      },
      {
        id: 'random-forest',
        name: 'Random Forest',
        subtitle: '랜덤 포레스트',
        description: '여러 결정트리의 투표/평균',
        application: '센서 특징의 통계적 분석',
        strengths: '특징 중요도 제공, 과적합 방지',
        weaknesses: '시간적 순서 고려 못함',
        path: '/models/random-forest',
        roles: [ROLES.USER, ROLES.MANAGER, ROLES.ADMIN]
      },
      {
        id: 'xgboost',
        name: 'XGBoost',
        subtitle: '극한 그래디언트 부스팅',
        description: '이전 오류를 학습하며 순차적 개선',
        application: '복잡한 센서 간 상호작용 학습',
        strengths: '최고 수준 정확도, 빠른 속도',
        weaknesses: '하이퍼파라미터 튜닝 복잡',
        path: '/models/xgboost',
        roles: [ROLES.USER, ROLES.MANAGER, ROLES.ADMIN]
      }
    ]
  },
  {
    id: 'products',
    name: 'Products',
    path: '/products',
    icon: 'Package',
    roles: [ROLES.USER, ROLES.MANAGER, ROLES.ADMIN],
    order: 5  // ← 순서 변경 (4 → 5)
  },
  {
    id: 'orders',
    name: 'Orders',
    path: '/orders',
    icon: 'ShoppingCart',
    roles: [ROLES.USER, ROLES.MANAGER, ROLES.ADMIN],
    order: 6,  // ← 순서 변경 (5 → 6)
    requiresAuth: true
  },
  {
    id: 'demo',
    name: 'Demo',
    path: '/demo',
    icon: 'Sparkles',
    roles: [ROLES.ADMIN],
    order: 7  // ← 순서 변경 (6 → 7)
  },
  {
    id: 'profile',
    name: 'Profile',
    path: '/profile',
    icon: 'User',
    roles: [ROLES.USER, ROLES.MANAGER, ROLES.ADMIN],
    order: 8,  // ← 순서 변경 (7 → 8)
    requiresAuth: true,
    showUsername: true
  },
  {
    id: 'admin',
    name: 'Admin Panel',
    path: '/admin',
    icon: 'Shield',
    roles: [ROLES.MANAGER, ROLES.ADMIN],
    order: 9,  // ← 순서 변경 (8 → 9)
    requiresAuth: true
  },
  {
    id: 'messages',
    name: 'Messages',
    path: '/messages/inbox',
    icon: 'MessageSquare',
    roles: [ROLES.GUEST, ROLES.USER, ROLES.MANAGER, ROLES.ADMIN],
    order: 10
  }
]

// ... 나머지 코드는 동일 ...

// 인증 관련 메뉴
export const authMenuItems = {
  login: {
    id: 'login',
    name: 'Login',
    path: '/login',
    order: 1
  },
  register: {
    id: 'register',
    name: 'Register',
    path: '/register',
    order: 2
  },
  logout: {
    id: 'logout',
    name: 'Logout',
    icon: 'LogOut',
    order: 3,
    action: 'logout'
  }
}

/**
 * 사용자 권한에 따라 접근 가능한 메뉴 필터링
 * @param {string} userRole - 사용자 권한 (GUEST, USER, MANAGER, ADMIN)
 * @param {boolean} isAuthenticated - 인증 여부
 * @returns {Array} 필터링된 메뉴 아이템
 */
export const getFilteredMenuItems = (userRole = ROLES.GUEST, isAuthenticated = false) => {
  return menuItems
    .filter(item => {
      // 권한 체크
      const hasRole = item.roles.includes(userRole)
      
      // 인증 필수 메뉴 체크
      if (item.requiresAuth && !isAuthenticated) {
        return false
      }
      
      return hasRole
    })
    .sort((a, b) => a.order - b.order)
}

/**
 * 드롭다운 메뉴의 서브 아이템 필터링
 * @param {Array} subItems - 서브 메뉴 아이템
 * @param {string} userRole - 사용자 권한
 * @returns {Array} 필터링된 서브 메뉴 아이템
 */
export const getFilteredSubItems = (subItems, userRole = ROLES.GUEST) => {
  if (!subItems) return []
  
  return subItems.filter(item => item.roles.includes(userRole))
}

/**
 * 사용자가 특정 메뉴에 접근 가능한지 확인
 * @param {string} menuId - 메뉴 ID
 * @param {string} userRole - 사용자 권한
 * @param {boolean} isAuthenticated - 인증 여부
 * @returns {boolean} 접근 가능 여부
 */
export const canAccessMenu = (menuId, userRole = ROLES.GUEST, isAuthenticated = false) => {
  const menuItem = menuItems.find(item => item.id === menuId)
  
  if (!menuItem) return false
  
  // 권한 확인
  const hasRole = menuItem.roles.includes(userRole)
  
  // 인증 필요 메뉴 확인
  if (menuItem.requiresAuth && !isAuthenticated) {
    return false
  }
  
  return hasRole
}

/**
 * 권한 레벨 비교 (숫자가 클수록 높은 권한)
 * @param {string} role - 권한
 * @returns {number} 권한 레벨
 */
export const getRoleLevel = (role) => {
  const roleLevels = {
    [ROLES.GUEST]: 0,
    [ROLES.USER]: 1,
    [ROLES.MANAGER]: 2,
    [ROLES.ADMIN]: 3
  }
  
  return roleLevels[role] || 0
}

/**
 * 사용자가 최소 권한을 충족하는지 확인
 * @param {string} userRole - 사용자 권한
 * @param {string} requiredRole - 필요한 최소 권한
 * @returns {boolean} 권한 충족 여부
 */
export const hasMinimumRole = (userRole, requiredRole) => {
  return getRoleLevel(userRole) >= getRoleLevel(requiredRole)
}

export default {
  ROLES,
  menuItems,
  authMenuItems,
  getFilteredMenuItems,
  getFilteredSubItems,
  canAccessMenu,
  getRoleLevel,
  hasMinimumRole
}
