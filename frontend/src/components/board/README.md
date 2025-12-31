# Board Client Files

React 클라이언트용 게시판(Board) 기능 파일들입니다.

## 📁 파일 구조

```
board-client/
├── services/
│   ├── boardService.js       # 게시글 API 서비스
│   ├── commentService.js     # 댓글 API 서비스
│   └── attachmentService.js  # 첨부파일 API 서비스
├── pages/
│   ├── Boards.jsx           # 게시글 목록 페이지
│   ├── BoardDetail.jsx      # 게시글 상세 페이지
│   ├── BoardCreate.jsx      # 게시글 작성 페이지
│   └── BoardEdit.jsx        # 게시글 수정 페이지
├── components/
│   ├── BoardList.jsx        # 게시글 목록 컴포넌트
│   ├── CommentList.jsx      # 댓글 목록 컴포넌트
│   └── AttachmentList.jsx   # 첨부파일 목록 컴포넌트
├── App.jsx                  # Board 라우트가 추가된 App
└── Navbar.jsx               # Board 링크가 추가된 Navbar
```

## 🚀 설치 방법

### 1. 기존 프로젝트에 파일 복사

```bash
# services 폴더에 복사
cp services/* your-project/src/services/

# pages 폴더에 복사
cp pages/* your-project/src/pages/

# components 폴더에 복사
cp components/* your-project/src/components/

# App.jsx 와 Navbar.jsx는 기존 파일과 병합
```

### 2. API 기본 URL 설정

`services/api.js` 파일에서 Board Service URL 확인:

```javascript
import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:8083/api', // Board Service URL
  headers: {
    'Content-Type': 'application/json',
  },
})

export default api
```

### 3. 라우트 추가

`App.jsx`에 Board 관련 라우트가 이미 포함되어 있습니다:

```jsx
// Board Routes
<Route path="/boards" element={<Boards />} />
<Route path="/boards/:id" element={<BoardDetail />} />
<Route path="/boards/create" element={<PrivateRoute><BoardCreate /></PrivateRoute>} />
<Route path="/boards/edit/:id" element={<PrivateRoute><BoardEdit /></PrivateRoute>} />
```

## 📋 기능 설명

### Pages

#### 1. **Boards.jsx** - 게시글 목록
- 게시글 목록 조회 (페이징)
- 검색 기능 (제목/내용/작성자)
- 새 게시글 작성 버튼

#### 2. **BoardDetail.jsx** - 게시글 상세
- 게시글 상세 내용 표시
- 댓글 작성/수정/삭제
- 첨부파일 다운로드
- 작성자만 수정/삭제 가능

#### 3. **BoardCreate.jsx** - 게시글 작성
- 제목/내용 입력
- 다중 파일 업로드 (최대 10MB)
- 파일 미리보기

#### 4. **BoardEdit.jsx** - 게시글 수정
- 제목/내용 수정
- 첨부파일은 수정 불가 (안내 메시지 표시)

### Components

#### 1. **BoardList.jsx**
- 게시글 카드 형태 목록
- 조회수, 댓글 수, 첨부파일 수 표시
- 페이지네이션

#### 2. **CommentList.jsx**
- 댓글 목록 표시
- 인라인 수정 기능
- 작성자만 수정/삭제 가능

#### 3. **AttachmentList.jsx**
- 첨부파일 목록 표시
- 파일 아이콘 (이미지/문서/기타)
- 다운로드 기능
- 작성자만 삭제 가능

### Services

#### 1. **boardService.js**
```javascript
// 주요 메서드
createBoard(boardData)                          // 게시글 생성
createBoardWithFiles(boardData, files)          // 파일과 함께 생성
getAllBoards(page, size, sortBy, direction)     // 목록 조회
getBoardById(id)                                // 상세 조회
updateBoard(id, boardData)                      // 수정
deleteBoard(id)                                 // 삭제
searchByKeyword(keyword, page, size)            // 검색
```

#### 2. **commentService.js**
```javascript
createComment(boardId, commentData)             // 댓글 생성
getCommentsByBoardId(boardId)                   // 댓글 조회
updateComment(boardId, commentId, commentData)  // 댓글 수정
deleteComment(boardId, commentId)               // 댓글 삭제
```

#### 3. **attachmentService.js**
```javascript
getAttachmentsByBoardId(boardId)                // 첨부파일 조회
downloadAttachment(boardId, attachmentId, fileName) // 다운로드
deleteAttachment(boardId, attachmentId)         // 삭제
formatFileSize(bytes)                           // 파일 크기 포맷팅
```

## 🔧 필요한 의존성

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-router-dom": "^6.20.0",
    "@tanstack/react-query": "^5.0.0",
    "axios": "^1.6.0",
    "framer-motion": "^10.16.0",
    "lucide-react": "^0.300.0"
  }
}
```

## 💡 사용 예시

### 게시글 목록 페이지 접근
```
http://localhost:3000/boards
```

### 게시글 작성 (로그인 필요)
```
http://localhost:3000/boards/create
```

### 게시글 상세 보기
```
http://localhost:3000/boards/1
```

## 🎨 주요 기능

### 1. 검색 기능
- **All**: 제목 + 내용 검색
- **Title**: 제목만 검색
- **Author**: 작성자 검색

### 2. 파일 업로드
- 다중 파일 선택 가능
- 최대 10MB 제한
- 지원 형식: 이미지, PDF, DOC, TXT

### 3. 댓글 기능
- 실시간 댓글 작성
- 인라인 수정
- 작성자 확인

### 4. 권한 관리
- 게시글 작성: 로그인 필요
- 게시글 수정/삭제: 작성자만 가능
- 댓글 수정/삭제: 작성자만 가능

## 🔐 인증 연동

`useAuthStore`를 사용하여 사용자 인증 상태를 확인합니다:

```javascript
const { isAuthenticated, user } = useAuthStore()

// user 객체 구조
{
  id: 1,
  username: "홍길동",
  // ... 기타 사용자 정보
}
```

## 🎯 API 엔드포인트

모든 API 호출은 `http://localhost:8083/api`를 기본 URL로 사용합니다:

```
GET    /boards                    # 게시글 목록
POST   /boards                    # 게시글 생성
POST   /boards/with-files         # 파일과 함께 생성
GET    /boards/{id}               # 게시글 상세
PUT    /boards/{id}               # 게시글 수정
DELETE /boards/{id}               # 게시글 삭제
GET    /boards/search             # 검색

POST   /boards/{id}/comments      # 댓글 생성
GET    /boards/{id}/comments      # 댓글 조회
PUT    /boards/{id}/comments/{commentId}    # 댓글 수정
DELETE /boards/{id}/comments/{commentId}    # 댓글 삭제

GET    /boards/{id}/attachments/{attachmentId}/download  # 파일 다운로드
DELETE /boards/{id}/attachments/{attachmentId}           # 파일 삭제
```

## 🎨 스타일링

Tailwind CSS를 사용하여 스타일링되어 있습니다. 기존 프로젝트의 Tailwind 설정을 그대로 사용하면 됩니다.

## 🔄 React Query 설정

React Query를 사용하여 서버 상태를 관리합니다:

```javascript
// Query Keys
['boards', page, searchKeyword, searchType]  // 게시글 목록
['board', id]                                // 게시글 상세
```

## 📱 반응형 디자인

모든 컴포넌트는 모바일, 태블릿, 데스크톱에서 최적화되어 있습니다.

## 🐛 문제 해결

### CORS 오류
Board Service에서 CORS 설정 확인:
```java
@CrossOrigin(origins = "http://localhost:3000")
```

### 파일 업로드 실패
- 파일 크기 제한 확인 (10MB)
- Board Service의 multipart 설정 확인

### 인증 오류
- API 요청 시 토큰이 포함되어 있는지 확인
- `api.js`의 인터셉터 설정 확인

### 이벤트 전달

1. Navbar.jsx (클릭)
   ↓
2. React Router (라우팅)
   ↓
3. Boards.jsx (컴포넌트 마운트)
   ↓
4. useQuery Hook (데이터 요청 시작)
   ↓
5. boardService.js (API 호출)
   ↓
6. api.js (axios 인스턴스)
   ↓
7. HTTP Request :
   ↓
8. Backend Server
   ↓
9. BoardController.java

```
curl -v "http://localhost:8084/api/boards?page=0&size=10"
```

## 📄 라이선스

MIT License
