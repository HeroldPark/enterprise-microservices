import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../app/authStore'
import { hasMinimumRole, ROLES } from './menuPermissions'

/**
 * 권한 기반 라우트 보호 컴포넌트
 * 사용자의 권한이 요구되는 최소 권한보다 낮으면 리다이렉트
 * 
 * @param {Object} props
 * @param {ReactNode} props.children - 보호할 컴포넌트
 * @param {string} props.requiredRole - 필요한 최소 권한 (GUEST, USER, ADMIN)
 * @param {string} props.redirectTo - 권한 없을 때 리다이렉트할 경로 (기본값: '/')
 * @param {boolean} props.showAlert - 권한 없을 때 알림 표시 여부 (기본값: true)
 */
const RoleBasedRoute = ({ 
  children, 
  requiredRole = ROLES.USER,
  redirectTo = '/',
  showAlert = true 
}) => {
  const { isAuthenticated, user } = useAuthStore()
  
  // 1. 로그인 체크 (GUEST 이상의 권한이 필요한 경우)
  if (requiredRole !== ROLES.GUEST && !isAuthenticated) {
    if (showAlert) {
      alert('로그인이 필요한 서비스입니다.')
    }
    return <Navigate to="/login" replace />
  }
  
  // 2. 권한 레벨 체크
  const userRole = user?.role || ROLES.GUEST
  
  if (!hasMinimumRole(userRole, requiredRole)) {
    if (showAlert) {
      const roleMessages = {
        [ROLES.USER]: '일반 회원',
        [ROLES.ADMIN]: '관리자'
      }
      const requiredRoleName = roleMessages[requiredRole] || requiredRole
      alert(`이 페이지는 ${requiredRoleName} 권한이 필요합니다.`)
    }
    return <Navigate to={redirectTo} replace />
  }
  
  return children
}

export default RoleBasedRoute
