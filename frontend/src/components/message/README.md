# Message Client Files

React 클라이언트용 **쪽지(Message)** 기능 파일들입니다. (board-client 스타일을 그대로 따라갑니다.)

## 📁 파일 구조

```
message-client/
├── services/
│   └── messageService.js     # 쪽지 API 서비스
├── pages/
│   ├── Inbox.jsx             # 받은 쪽지함
│   ├── Sent.jsx              # 보낸 쪽지함
│   ├── MessageDetail.jsx     # 쪽지 상세
│   └── MessageCompose.jsx    # 쪽지 쓰기
└── components/
    └── MessageList.jsx       # 쪽지 목록 컴포넌트
```

## 🚀 설치 방법

### 1) 기존 프로젝트에 파일 복사

```bash
# services 폴더에 복사
cp services/* your-project/src/services/

# pages 폴더에 복사
cp pages/* your-project/src/pages/

# components 폴더에 복사
cp components/* your-project/src/components/
```

> 현재 파일들은 `import api from '../../app/api'`, `import { useAuthStore } from '../../app/authStore'` 형태로 되어 있습니다.
> 프로젝트 구조가 다르면 import 경로만 맞춰주시면 됩니다.

### 2) API 기본 URL 설정

`app/api.js`(또는 동일 역할 파일)에서 Gateway baseURL이 `/api` 를 포함하도록 설정되어 있어야 합니다.

예시:
```javascript
import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:8080/api', // api-gateway
  headers: { 'Content-Type': 'application/json' },
})

export default api
```

`messageService`는 `api.get('/messages')` 형태로 호출하므로 최종 URL은 `.../api/messages` 가 됩니다.

### 3) 라우트 추가 (예시)

```jsx
<Route path="/messages/inbox" element={<PrivateRoute><Inbox /></PrivateRoute>} />
<Route path="/messages/sent" element={<PrivateRoute><Sent /></PrivateRoute>} />
<Route path="/messages/compose" element={<PrivateRoute><MessageCompose /></PrivateRoute>} />
<Route path="/messages/:id" element={<PrivateRoute><MessageDetail /></PrivateRoute>} />
```

### 4) Navbar 링크 추가 (예시)

- 받은함: `/messages/inbox`
- 보낸함: `/messages/sent`
- 쪽지쓰기: `/messages/compose`

## 🔐 인증 연동

board-client와 동일하게 `useAuthStore`를 사용합니다.

- `user.id` 를 senderId/receiverId에 사용
- `token` 없으면 `/login`으로 이동

## 🎯 API 엔드포인트

Gateway 기준:

```
POST   /api/messages                 # 쪽지 보내기
GET    /api/messages/{id}            # 쪽지 단건 조회
GET    /api/messages/inbox/{rid}     # 받은함
GET    /api/messages/sent/{sid}      # 보낸함
PATCH  /api/messages/{id}/read       # 읽음 처리
DELETE /api/messages/{id}            # 삭제
```

## ✅ 포함 기능

- 받은함: 안읽은 쪽지만 보기 + 내용 검색
- 보낸함: 내용 검색
- 상세: 받은쪽지 자동 읽음 처리 + 삭제 + 답장
- 쓰기: receiverId(숫자) 입력 + 내용(최대 500자)


## 🔧 필요한 의존성

board-client와 동일합니다.

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

- 받은함: `http://localhost:3000/messages/inbox`
- 보낸함: `http://localhost:3000/messages/sent`
- 쓰기: `http://localhost:3000/messages/compose`
- 답장: 상세 페이지에서 **답장** 버튼 클릭 (receiverId 자동 세팅)

