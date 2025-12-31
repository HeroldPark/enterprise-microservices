# Enterprise Client - Modular Architecture

마이크로서비스 아키텍처 기반의 React 클라이언트 애플리케이션입니다. 모듈별로 구조화되어 있어 유지보수와 확장이 용이합니다.

## 📁 프로젝트 구조

```
src/
├── components/
│   ├── board/              # 게시판 모듈
│   │   ├── components/
│   │   │   ├── BoardList.jsx
│   │   │   ├── CommentList.jsx
│   │   │   └── AttachmentList.jsx
│   │   ├── pages/
│   │   │   ├── Boards.jsx
│   │   │   ├── BoardDetail.jsx
│   │   │   ├── BoardCreate.jsx
│   │   │   └── BoardEdit.jsx
│   │   └── services/
│   │       ├── boardService.js
│   │       ├── commentService.js
│   │       └── attachmentService.js
│   │
│   ├── product/            # 상품 모듈
│   │   ├── components/
│   │   │   └── ProductList.jsx
│   │   ├── pages/
│   │   │   ├── Products.jsx
│   │   │   └── ProductDetail.jsx
│   │   └── services/
│   │       └── productService.js
│   │
│   ├── order/              # 주문 모듈
│   │   ├── components/
│   │   │   └── OrderList.jsx
│   │   ├── pages/
│   │   │   └── Orders.jsx
│   │   └── services/
│   │       └── orderService.js
│   │
│   └── user/               # 사용자 모듈
│       ├── components/
│       ├── pages/
│       │   ├── Login.jsx
│       │   ├── Register.jsx
│       │   └── Profile.jsx
│       └── services/
│           └── userService.js
│
├── services/               # 공통 서비스
│   └── api.js             # Axios 인스턴스
│
├── store/                  # 상태 관리
│   └── authStore.js       # 인증 상태
│
├── pages/                  # 공통 페이지
│   ├── Home.jsx
│   └── Demo.jsx
│
└── App.jsx                 # 메인 앱 컴포넌트
```

## 🎯 모듈별 기능

### 1. Board Module (게시판)
**경로**: `src/components/board/`

#### Pages
- `Boards.jsx` - 게시글 목록 + 검색/필터
- `BoardDetail.jsx` - 게시글 상세 + 댓글 + 첨부파일
- `BoardCreate.jsx` - 게시글 작성 + 파일 업로드
- `BoardEdit.jsx` - 게시글 수정

#### Components
- `BoardList.jsx` - 게시글 카드 리스트
- `CommentList.jsx` - 댓글 CRUD
- `AttachmentList.jsx` - 첨부파일 다운로드/삭제

#### Services
- `boardService.js` - 게시글 API
- `commentService.js` - 댓글 API
- `attachmentService.js` - 첨부파일 API

### 2. Product Module (상품)
**경로**: `src/components/product/`

#### Pages
- `Products.jsx` - 상품 목록 + 필터링
- `ProductDetail.jsx` - 상품 상세 + 주문

#### Components
- `ProductList.jsx` - 상품 그리드/리스트

#### Services
- `productService.js` - 상품 API (CRUD, 검색, 카테고리)

### 3. Order Module (주문)
**경로**: `src/components/order/`

#### Pages
- `Orders.jsx` - 주문 내역

#### Components
- `OrderList.jsx` - 주문 카드 + 취소

#### Services
- `orderService.js` - 주문 API (생성, 조회, 취소)

### 4. User Module (사용자)
**경로**: `src/components/user/`

#### Pages
- `Login.jsx` - 로그인
- `Register.jsx` - 회원가입
- `Profile.jsx` - 프로필 관리

#### Services
- `userService.js` - 인증 API (로그인, 회원가입, 프로필)

## 🔧 설치 및 실행

### 1. 의존성 설치
```bash
npm install
```

### 2. 환경 변수 설정
`.env` 파일 생성:
```env
REACT_APP_API_URL=http://localhost:8080/api
```

### 3. 개발 서버 실행
```bash
npm start
```

## 📝 Import 경로 규칙

### 모듈 내부 파일간
```javascript
// board 모듈 내에서
import { boardService } from '../services/boardService'
import BoardList from '../components/BoardList'
```

### 모듈 간 참조
```javascript
// product 모듈에서 order 서비스 사용
import { orderService } from '../../order/services/orderService'
```

### 공통 리소스
```javascript
// 어느 모듈에서나
import api from '../../../services/api'
import { useAuthStore } from '../../../store/authStore'
```

## 🎨 라우팅 구조

```
/ .......................... Home
/demo ...................... Demo Page

/login ..................... 로그인
/register .................. 회원가입
/profile ................... 프로필 (인증 필요)

/products .................. 상품 목록
/products/:id .............. 상품 상세

/orders .................... 주문 내역 (인증 필요)

/boards .................... 게시글 목록
/boards/:id ................ 게시글 상세
/boards/create ............. 게시글 작성 (인증 필요)
/boards/edit/:id ........... 게시글 수정 (인증 필요)
```

## 🔐 인증 처리

### PrivateRoute 사용
```jsx
<Route
  path="/profile"
  element={
    <PrivateRoute>
      <Profile />
    </PrivateRoute>
  }
/>
```

### useAuthStore 훅
```javascript
const { isAuthenticated, user, login, logout } = useAuthStore()
```

## 📡 API 서비스 사용

### 기본 패턴
```javascript
// services/boardService.js
import api from '../../../services/api'

export const boardService = {
  getAllBoards: async (page, size) => {
    const response = await api.get('/boards', {
      params: { page, size }
    })
    return response.data
  }
}
```

### React Query와 함께 사용
```javascript
const { data, isLoading, error } = useQuery({
  queryKey: ['boards', page],
  queryFn: () => boardService.getAllBoards(page, 10)
})
```

## 🎯 새로운 모듈 추가하기

### 1. 디렉토리 생성
```bash
mkdir -p src/components/[module-name]/{components,pages,services}
```

### 2. 서비스 생성
```javascript
// src/components/[module-name]/services/[module]Service.js
import api from '../../../services/api'

export const [module]Service = {
  // API 메서드들
}
```

### 3. 페이지 생성
```javascript
// src/components/[module-name]/pages/[Page].jsx
import { [module]Service } from '../services/[module]Service'
```

### 4. 라우트 추가
```javascript
// src/App.jsx
import [Page] from './components/[module-name]/pages/[Page]'

<Route path="/[route]" element={<[Page] />} />
```

## 🔄 모듈간 의존성 관리

### 권장 사항
1. **직접 의존성 최소화**: 모듈은 가능한 독립적으로 유지
2. **공통 서비스 활용**: 여러 모듈이 사용하는 기능은 `src/services/`에 배치
3. **Props를 통한 통신**: 컴포넌트 간 데이터는 Props로 전달
4. **전역 상태 관리**: 공유 상태는 Zustand store 사용

### 예시: Product에서 Order 생성
```javascript
// product/pages/ProductDetail.jsx
import { orderService } from '../../order/services/orderService'

const handleOrder = () => {
  orderService.createOrder(orderData)
}
```

## 🧪 테스트

### 모듈별 테스트
```bash
# 특정 모듈 테스트
npm test -- board
npm test -- product
```

## 📦 빌드

```bash
npm run build
```

빌드 결과물은 `build/` 디렉토리에 생성됩니다.

## 🚀 배포

### 환경별 설정
- **개발**: `.env.development`
- **프로덕션**: `.env.production`

### Docker 배포
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## 📚 사용 기술

- **React 18** - UI 라이브러리
- **React Router v6** - 라우팅
- **React Query** - 서버 상태 관리
- **Zustand** - 클라이언트 상태 관리
- **Axios** - HTTP 클라이언트
- **Framer Motion** - 애니메이션
- **Tailwind CSS** - 스타일링
- **Lucide React** - 아이콘

## 🤝 컨벤션

### 파일명
- **컴포넌트**: PascalCase (e.g., `BoardList.jsx`)
- **서비스**: camelCase (e.g., `boardService.js`)
- **페이지**: PascalCase (e.g., `Boards.jsx`)

### 컴포넌트 구조
```javascript
// 1. Imports
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
// ...

// 2. Component
const ComponentName = () => {
  // 3. Hooks
  // 4. State
  // 5. Effects
  // 6. Handlers
  // 7. Render
}

// 8. Export
export default ComponentName
```

## 📄 라이선스

MIT License
