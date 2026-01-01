# App.jsx 업데이트 가이드

## 📋 변경 사항 요약

권한 기반 메뉴 시스템에 맞춰 App.jsx를 업데이트했습니다.

### 🆕 추가된 기능

1. **권한 기반 라우팅**: RoleBasedRoute 컴포넌트 사용
2. **Model 페이지 라우트**: 5개 모델 페이지 추가
3. **Admin 페이지 라우트**: 관리자 전용 페이지 추가
4. **개발 테스트 라우트**: 권한 테스트 페이지 (개발 환경 전용)

## 📁 파일 구조

```
/src/components/
├── app/
│   ├── App.jsx                          # 업데이트됨
│   ├── Home.jsx
│   └── Demo.jsx
├── menu/
│   ├── menuPermissions.js               # 기존
│   ├── NavbarWithPermissions.jsx        # 기존
│   ├── MenuPermissionsTest.jsx          # 기존
│   └── RoleBasedRoute.jsx               # 🆕 새로 추가
├── models/
│   ├── ModelPageTemplate.jsx            # 🆕 새로 추가
│   └── pages/
│       ├── IsolationForest.jsx          # 🆕 새로 추가
│       ├── LSTM.jsx                     # 🆕 새로 추가
│       ├── GRU.jsx                      # 🆕 새로 추가
│       ├── RandomForest.jsx             # 🆕 새로 추가
│       └── XGBoost.jsx                  # 🆕 새로 추가
└── admin/
    └── pages/
        └── AdminPanel.jsx               # 🆕 새로 추가
```

## 🚀 설치 방법

### 1. 파일 복사

```bash
# 프로젝트 루트에서
cp app-updated/App.jsx src/components/app/

# Menu 컴포넌트
mkdir -p src/components/menu
cp app-updated/menu/RoleBasedRoute.jsx src/components/menu/

# Models 컴포넌트
mkdir -p src/components/models/pages
cp app-updated/models/ModelPageTemplate.jsx src/components/models/
cp app-updated/models/pages/*.jsx src/components/models/pages/

# Admin 컴포넌트
mkdir -p src/components/admin/pages
cp app-updated/admin/pages/AdminPanel.jsx src/components/admin/pages/
```

### 2. 경로 확인

App.jsx의 import 경로가 프로젝트 구조와 일치하는지 확인:

```javascript
import Navbar from './components/menu/NavbarWithPermissions'
import RoleBasedRoute from './components/menu/RoleBasedRoute'
import { ROLES } from './components/menu/menuPermissions'
```

## 📝 주요 변경 내용

### 1. Navbar 변경

```javascript
// 기존
import Navbar from './components/Navbar'

// 변경 후
import Navbar from './components/menu/NavbarWithPermissions'
```

### 2. RoleBasedRoute 추가

```javascript
import RoleBasedRoute from './components/menu/RoleBasedRoute'
import { ROLES } from './components/menu/menuPermissions'

// 사용 예
<Route
  path="/models/lstm"
  element={
    <RoleBasedRoute requiredRole={ROLES.USER}>
      <LSTM />
    </RoleBasedRoute>
  }
/>
```

### 3. 새로운 라우트

#### Models 라우트 (USER, ADMIN)
- `/models/isolation-forest` - Isolation Forest 페이지
- `/models/lstm` - LSTM 페이지
- `/models/gru` - GRU 페이지
- `/models/random-forest` - Random Forest 페이지
- `/models/xgboost` - XGBoost 페이지

#### Admin 라우트 (ADMIN만)
- `/admin` - 관리자 대시보드

#### 테스트 라우트 (개발 환경)
- `/test/permissions` - 권한 테스트 페이지

## 🔒 권한별 접근 제어

### GUEST (비로그인 또는 게스트)
- ✅ Home
- ✅ Boards (읽기)
- ✅ Login/Register
- ❌ Models
- ❌ Products
- ❌ Orders
- ❌ Profile
- ❌ Admin

### USER (일반 사용자)
- ✅ 모든 GUEST 권한
- ✅ Models (모든 모델)
- ✅ Products
- ✅ Orders
- ✅ Profile
- ✅ Boards (생성/수정)
- ❌ Admin

### ADMIN (관리자)
- ✅ 모든 USER 권한
- ✅ Admin Panel

## 🛠️ RoleBasedRoute 사용법

### 기본 사용

```javascript
<RoleBasedRoute requiredRole={ROLES.USER}>
  <YourComponent />
</RoleBasedRoute>
```

### 옵션

```javascript
<RoleBasedRoute 
  requiredRole={ROLES.ADMIN}
  redirectTo="/custom-path"  // 기본값: '/'
  showAlert={true}            // 기본값: true
>
  <AdminComponent />
</RoleBasedRoute>
```

### Props

| Prop | Type | Default | 설명 |
|------|------|---------|------|
| requiredRole | string | ROLES.USER | 필요한 최소 권한 |
| redirectTo | string | '/' | 권한 없을 때 리다이렉트 경로 |
| showAlert | boolean | true | 권한 없을 때 알림 표시 여부 |

## 📊 Model 페이지 구조

### ModelPageTemplate 사용

모든 Model 페이지는 공통 템플릿을 사용합니다:

```javascript
import ModelPageTemplate from '../ModelPageTemplate'

const YourModel = () => {
  return (
    <ModelPageTemplate
      title="모델 이름"
      subtitle="한글 이름"
      description="원리 설명"
      application="화재 예측 적용"
      strengths="강점"
      weaknesses="약점"
    >
      {/* 추가 컨텐츠 */}
      <div className="bg-white rounded-lg shadow-md p-8">
        <h2>상세 내용</h2>
        {/* ... */}
      </div>
    </ModelPageTemplate>
  )
}
```

### 템플릿 특징

- ✅ 일관된 UI/UX
- ✅ 자동 색상 코딩 (원리: 파란색, 화재예측: 녹색, 강점: 보라색, 약점: 빨간색)
- ✅ Back 버튼 자동 포함
- ✅ 애니메이션 효과

## 🧪 테스트 방법

### 1. 권한 테스트 페이지 접근

개발 환경에서만 접근 가능:

```
http://localhost:3000/test/permissions
```

### 2. 권한별 테스트

1. 로그아웃 상태 (GUEST):
   - Home, Boards만 접근 가능
   - Models 접근 시 로그인 페이지로 리다이렉트

2. USER로 로그인:
   - Models, Products, Orders 접근 가능
   - Admin 접근 시 홈으로 리다이렉트

3. ADMIN으로 로그인:
   - 모든 페이지 접근 가능

### 3. authStore 권한 설정

로그인 후 user 객체에 role 속성 확인:

```javascript
// authStore.js
const user = {
  username: 'testuser',
  email: 'test@example.com',
  role: 'USER'  // 또는 'ADMIN', 'GUEST'
}
```

## ⚠️ 주의사항

1. **환경 변수**: 테스트 라우트는 `NODE_ENV === 'development'`에서만 활성화
2. **경로 일치**: import 경로가 실제 파일 위치와 일치해야 함
3. **authStore**: user 객체에 role 속성이 반드시 필요
4. **Model 페이지**: 실제 데이터 시각화나 API 연동은 별도 구현 필요

## 🔄 기존 코드와의 호환성

### PrivateRoute는 계속 사용 가능

기존 PrivateRoute는 그대로 유지하고, 권한 레벨이 필요한 경우만 RoleBasedRoute 사용:

```javascript
// 단순 로그인 체크만 필요한 경우
<PrivateRoute>
  <Profile />
</PrivateRoute>

// 특정 권한이 필요한 경우
<RoleBasedRoute requiredRole={ROLES.ADMIN}>
  <AdminPanel />
</RoleBasedRoute>
```

## 📈 향후 확장

### 1. Model 페이지 개선
- 실시간 데이터 시각화
- 모델 성능 비교
- 파라미터 조정 인터페이스

### 2. Admin 기능 추가
- 사용자 권한 관리
- 게시글 모니터링
- 시스템 로그 조회

### 3. 동적 권한 로딩
- API에서 권한 정보 가져오기
- 실시간 권한 업데이트

## 🐛 트러블슈팅

### "Cannot find module" 에러
→ import 경로가 올바른지 확인

### 권한이 있는데 접근이 안됨
→ authStore의 user.role 값 확인

### 테스트 페이지가 안보임
→ NODE_ENV가 'development'인지 확인

### 모델 페이지 스타일이 깨짐
→ Tailwind CSS 설정 확인

## 📞 지원

문제 발생 시:
1. 브라우저 콘솔 에러 확인
2. user 객체 구조 확인
3. 라우트 경로 확인
4. 권한 설정 확인
