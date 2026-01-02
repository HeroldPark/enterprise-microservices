import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { authStore } from './components/app/authStore'
import Navbar from './components/menu/NavbarWithPermissions'
import Home from './components/app/Home'
import Demo from './components/app/Demo'
import PrivateRoute from './components/user/PrivateRoute'
import RoleBasedRoute from './components/menu/RoleBasedRoute'
import PageTransition from './components/animations/PageTransition'
import { ROLES } from './components/menu/menuPermissions'

// User pages
import Login from './components/user/pages/Login'
import Register from './components/user/pages/Register'
import Profile from './components/user/pages/Profile'

// Product pages
import Products from './components/product/pages/Products'
import ProductDetail from './components/product/pages/ProductDetail'

// Order pages
import Orders from './components/order/pages/Orders'

// Board pages
import Boards from './components/board/pages/Boards'
import BoardDetail from './components/board/pages/BoardDetail'
import BoardCreate from './components/board/pages/BoardCreate'
import BoardEdit from './components/board/pages/BoardEdit'

// Model pages (새로 추가)
import IsolationForest from './components/models/pages/IsolationForest'
import LSTM from './components/models/pages/LSTM'
import GRU from './components/models/pages/GRU'
import RandomForest from './components/models/pages/RandomForest'
import XGBoost from './components/models/pages/XGBoost'

// Admin pages (새로 추가)
import AdminPanel from './components/admin/pages/AdminPanel'
import UserManagement from './components/admin/pages/UserManagement'

import SystemSettings from './components/system/SystemSettings'
import ModelConfigs from './components/models/ModelConfigs'

// Test pages (개발용)
import MenuPermissionsTest from './components/menu/MenuPermissionsTest'

function App() {
  const location = useLocation()

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <PageTransition key={location.pathname}>
          <Routes location={location}>
            {/* Public Routes - 모든 사용자 접근 가능 (GUEST, USER, MANAGER, ADMIN) */}
            <Route path="/" element={<Home />} />
            <Route path="/demo" element={<Demo />} />
            
            {/* User Routes - 인증 관련 */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/profile"
              element={
                <PrivateRoute>
                  <Profile />
                </PrivateRoute>
              }
            />

            {/* Board Routes - 모든 사용자 접근 가능 (읽기) */}
            <Route path="/boards" element={<Boards />} />
            <Route path="/boards/:id" element={<BoardDetail />} />
            {/* 생성/수정은 로그인 필수 (USER, ADMIN) */}
            <Route
              path="/boards/create"
              element={
                <RoleBasedRoute requiredRole={ROLES.USER}>
                  <BoardCreate />
                </RoleBasedRoute>
              }
            />
            <Route
              path="/boards/edit/:id"
              element={
                <RoleBasedRoute requiredRole={ROLES.USER}>
                  <BoardEdit />
                </RoleBasedRoute>
              }
            />

            {/* Model Routes - USER, ADMIN만 접근 가능 */}
            <Route
              path="/models/isolation-forest"
              element={
                <RoleBasedRoute requiredRole={ROLES.USER}>
                  <IsolationForest />
                </RoleBasedRoute>
              }
            />
            <Route
              path="/models/lstm"
              element={
                <RoleBasedRoute requiredRole={ROLES.USER}>
                  <LSTM />
                </RoleBasedRoute>
              }
            />
            <Route
              path="/models/gru"
              element={
                <RoleBasedRoute requiredRole={ROLES.USER}>
                  <GRU />
                </RoleBasedRoute>
              }
            />
            <Route
              path="/models/random-forest"
              element={
                <RoleBasedRoute requiredRole={ROLES.USER}>
                  <RandomForest />
                </RoleBasedRoute>
              }
            />
            <Route
              path="/models/xgboost"
              element={
                <RoleBasedRoute requiredRole={ROLES.USER}>
                  <XGBoost />
                </RoleBasedRoute>
              }
            />

            {/* Product Routes - USER, ADMIN만 접근 가능 */}
            <Route
              path="/products"
              element={
                <RoleBasedRoute requiredRole={ROLES.USER}>
                  <Products />
                </RoleBasedRoute>
              }
            />
            <Route
              path="/products/:id"
              element={
                <RoleBasedRoute requiredRole={ROLES.USER}>
                  <ProductDetail />
                </RoleBasedRoute>
              }
            />

            {/* Order Routes - USER, ADMIN만 접근 가능 */}
            <Route
              path="/orders"
              element={
                <RoleBasedRoute requiredRole={ROLES.USER}>
                  <Orders />
                </RoleBasedRoute>
              }
            />

            {/* Admin Routes - ADMIN만 접근 가능 */}
            <Route
              path="/admin"
              element={
                <RoleBasedRoute requiredRole={ROLES.ADMIN}>
                  <AdminPanel />
                </RoleBasedRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <RoleBasedRoute requiredRole={ROLES.ADMIN}>
                  <UserManagement />
                </RoleBasedRoute>
              }
            />

            {/* 모델 설정 */}
            <Route
              path="/admin/model-configs"
              element={
                <RoleBasedRoute requiredRole={ROLES.ADMIN}>
                  <ModelConfigs />
                </RoleBasedRoute>
              }
            />

            {/* 시스템 설정 */}
            <Route
              path="/admin/settings"
              element={
                <RoleBasedRoute requiredRole={ROLES.ADMIN}>
                  <SystemSettings />
                </RoleBasedRoute>
              }
            />

            {/* Development/Test Routes - 개발 환경에서만 활성화 */}
            {process.env.NODE_ENV === 'development' && (
              <Route path="/test/permissions" element={<MenuPermissionsTest />} />
            )}
            
            {/* Fallback Route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </PageTransition>
      </main>
    </div>
  )
}

export default App
