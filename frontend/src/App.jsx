import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import Layout from './components/app/Layout'
import PrivateRoute from './components/user/PrivateRoute'
import RoleBasedRoute from './components/menu/RoleBasedRoute'
import { ROLES } from './components/menu/menuPermissions'

// User pages
import Login from './components/user/pages/Login'
import Register from './components/user/pages/Register'
import Profile from './components/user/pages/Profile'

// App pages
import Home from './components/app/Home'
import Demo from './components/app/Demo'

// Dashboard
import Dashboard from './components/dashboard/Dashboard'

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

// Model Config
import ModelConfigs from './components/models/ModelConfigs'

import IsolationForest from './components/models/pages/IsolationForest'
import LSTM from './components/models/pages/LSTM'
import GRU from './components/models/pages/GRU'
import RandomForest from './components/models/pages/RandomForest'
import XGBoost from './components/models/pages/XGBoost'

// AI Model Management pages (새로 추가)
import Models from './components/aimodels/pages/Models'
import ModelDetail from './components/aimodels/pages/ModelDetail'
import ModelCreate from './components/aimodels/pages/ModelCreate'
import ModelEdit from './components/aimodels/pages/ModelEdit'
import PredictionCreate from './components/aimodels/pages/PredictionCreate'

// Admin pages
import AdminPanel from './components/admin/pages/AdminPanel'
import UserManagement from './components/admin/pages/UserManagement'
import MenuManagement from './components/admin/pages/MenuManagement'

// System Setting
import SystemSettings from './components/system/SystemSettings'

// Message pages
import Inbox from './components/message/pages/Inbox'
import Sent from './components/message/pages/Sent'
import MessageCompose from './components/message/pages/MessageCompose'
import MessageDetail from './components/message/pages/MessageDetail'

// Test pages (개발용)
import MenuPermissionsTest from './components/menu/MenuPermissionsTest'

// Layout을 사용한 메뉴 구성 - 왼쪽 사이드 바 메뉴 레이아웃
function App() {
  const location = useLocation()

  return (
    <Routes location={location}>
      {/* Layout 사용 - Sidebar 포함 */}
      <Route element={<Layout />}>
        {/* Public Routes - 모든 사용자 접근 가능 (GUEST, USER, MANAGER, ADMIN) */}
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />

        {/* Profile - 로그인 필수 */}
        <Route
          path="/profile"
          element={
            <PrivateRoute>
              <Profile />
            </PrivateRoute>
          }
        />

        {/* Model Execution Routes - USER, ADMIN만 접근 가능 */}
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

        {/* AI Model Management Routes - USER, ADMIN만 접근 가능 */}
        <Route
          path="/aimodels"
          element={
            <RoleBasedRoute requiredRole={ROLES.USER}>
              <Models />
            </RoleBasedRoute>
          }
        />
        <Route
          path="/aimodels/create"
          element={
            <RoleBasedRoute requiredRole={ROLES.USER}>
              <ModelCreate />
            </RoleBasedRoute>
          }
        />
        <Route
          path="/aimodels/:id"
          element={
            <RoleBasedRoute requiredRole={ROLES.USER}>
              <ModelDetail />
            </RoleBasedRoute>
          }
        />
        <Route
          path="/aimodels/edit/:id"
          element={
            <RoleBasedRoute requiredRole={ROLES.USER}>
              <ModelEdit />
            </RoleBasedRoute>
          }
        />
        <Route
          path="/predictions/create"
          element={
            <RoleBasedRoute requiredRole={ROLES.USER}>
              <PredictionCreate />
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

        <Route path="/demo" element={<Demo />} />

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

        {/* 메뉴 관리 - ADMIN만 접근 가능 */}
        <Route
          path="/admin/menus"
          element={
            <RoleBasedRoute requiredRole={ROLES.ADMIN}>
              <MenuManagement />
            </RoleBasedRoute>
          }
        />

        {/* 모델 설정 - ADMIN만 접근 가능 */}
        <Route
          path="/admin/model-configs"
          element={
            <RoleBasedRoute requiredRole={ROLES.ADMIN}>
              <ModelConfigs />
            </RoleBasedRoute>
          }
        />

        {/* 시스템 설정 - ADMIN만 접근 가능 */}
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

        {/* Board Routes - 모든 사용자 접근 가능 (읽기) */}
        <Route path="/boards" element={<Boards />} />
        <Route path="/boards/:id" element={<BoardDetail />} />

        {/* Board 생성/수정 - 로그인 필수 (USER, ADMIN) */}
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

        {/* Message Routes - 로그인 필수 (USER, ADMIN) */}
        <Route path="/messages" element={<Navigate to="/messages/inbox" replace />} />
        <Route
          path="/messages/inbox"
          element={
            <RoleBasedRoute requiredRole={ROLES.USER}>
              <Inbox />
            </RoleBasedRoute>
          }
        />
        <Route
          path="/messages/:id"
          element={
            <RoleBasedRoute requiredRole={ROLES.USER}>
              <MessageDetail />
            </RoleBasedRoute>
          }
        />
        <Route
          path="/messages/sent"
          element={
            <RoleBasedRoute requiredRole={ROLES.USER}>
              <Sent />
            </RoleBasedRoute>
          }
        />
        <Route
          path="/messages/compose"
          element={
            <RoleBasedRoute requiredRole={ROLES.USER}>
              <MessageCompose />
            </RoleBasedRoute>
          }
        />

        {/* Fallback Route */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Route>

      {/* Layout 없는 페이지 (로그인/회원가입) */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
    </Routes>
  )
}

export default App
