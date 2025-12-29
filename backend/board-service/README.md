# Board Service - Microservice Architecture (Gradle)

게시판 기능을 제공하는 마이크로서비스입니다. Eureka 서비스 디스커버리와 API Gateway와 연동되어 동작합니다.

## 기술 스택

- **Java**: 17
- **Spring Boot**: 3.2.0
- **Spring Cloud**: 2023.0.0
- **Spring Data JPA**: 데이터 영속성 관리
- **Spring Cloud Netflix Eureka Client**: 서비스 디스커버리
- **H2 Database**: 개발용 인메모리 데이터베이스
- **MySQL**: 프로덕션용 데이터베이스 (선택적)
- **Lombok**: 보일러플레이트 코드 감소
- **Gradle**: 빌드 도구

## 주요 기능

### 1. 게시글 관리 (CRUD)
- 게시글 생성, 조회, 수정, 삭제
- 페이징 및 정렬 지원
- 조회수 자동 증가
- 제목, 내용, 작성자 기반 검색

### 2. 댓글 기능
- 댓글 생성, 조회, 수정, 삭제
- 게시글별 댓글 목록 조회

### 3. 파일 첨부 기능
- 다중 파일 업로드 (최대 10MB)
- 파일 다운로드
- 파일 삭제
- UUID 기반 파일명 관리

## 프로젝트 구조

```
board-service/
├── src/
│   ├── main/
│   │   ├── java/com/example/boardservice/
│   │   │   ├── controller/          # REST API 컨트롤러
│   │   │   │   ├── BoardController.java
│   │   │   │   ├── CommentController.java
│   │   │   │   └── AttachmentController.java
│   │   │   ├── service/             # 비즈니스 로직
│   │   │   │   ├── BoardService.java
│   │   │   │   ├── CommentService.java
│   │   │   │   ├── AttachmentService.java
│   │   │   │   └── FileStorageService.java
│   │   │   ├── repository/          # 데이터 접근 계층
│   │   │   │   ├── BoardRepository.java
│   │   │   │   ├── CommentRepository.java
│   │   │   │   └── AttachmentRepository.java
│   │   │   ├── entity/              # JPA 엔티티
│   │   │   │   ├── Board.java
│   │   │   │   ├── Comment.java
│   │   │   │   └── Attachment.java
│   │   │   ├── dto/                 # 데이터 전송 객체
│   │   │   │   ├── BoardDto.java
│   │   │   │   ├── CommentDto.java
│   │   │   │   └── AttachmentDto.java
│   │   │   ├── exception/           # 예외 처리
│   │   │   │   ├── GlobalExceptionHandler.java
│   │   │   │   ├── ResourceNotFoundException.java
│   │   │   │   ├── FileStorageException.java
│   │   │   │   └── ErrorResponse.java
│   │   │   └── BoardServiceApplication.java
│   │   └── resources/
│   │       └── application.yml      # 설정 파일
│   └── test/                        # 테스트 코드
├── uploads/                         # 파일 업로드 디렉토리
├── build.gradle                     # Gradle 빌드 설정
├── settings.gradle                  # Gradle 프로젝트 설정
└── gradle.properties                # Gradle 속성 설정
```

## API 엔드포인트

### 게시글 API

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/boards` | 게시글 생성 |
| POST | `/api/boards/with-files` | 파일 첨부와 함께 게시글 생성 |
| GET | `/api/boards` | 게시글 목록 조회 (페이징) |
| GET | `/api/boards/{id}` | 게시글 상세 조회 |
| PUT | `/api/boards/{id}` | 게시글 수정 |
| DELETE | `/api/boards/{id}` | 게시글 삭제 |
| GET | `/api/boards/search` | 키워드 검색 (제목+내용) |
| GET | `/api/boards/search/title` | 제목으로 검색 |
| GET | `/api/boards/search/author` | 작성자로 검색 |

### 댓글 API

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/boards/{boardId}/comments` | 댓글 생성 |
| GET | `/api/boards/{boardId}/comments` | 게시글의 모든 댓글 조회 |
| PUT | `/api/boards/{boardId}/comments/{commentId}` | 댓글 수정 |
| DELETE | `/api/boards/{boardId}/comments/{commentId}` | 댓글 삭제 |

### 첨부파일 API

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/boards/{boardId}/attachments` | 게시글의 모든 첨부파일 조회 |
| GET | `/api/boards/{boardId}/attachments/{attachmentId}/download` | 파일 다운로드 |
| DELETE | `/api/boards/{boardId}/attachments/{attachmentId}` | 첨부파일 삭제 |

## 설정 방법

### 1. application.yml 설정

```yaml
server:
  port: 8083  # 서비스 포트

eureka:
  client:
    service-url:
      defaultZone: http://localhost:8761/eureka/  # Eureka 서버 주소
```

### 2. 데이터베이스 설정

#### H2 Database (개발용 - 기본값)
```yaml
spring:
  datasource:
    url: jdbc:h2:mem:boarddb
    driver-class-name: org.h2.Driver
    username: sa
    password: 
```

#### MySQL (프로덕션용)
```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/boarddb?useSSL=false&serverTimezone=UTC
    driver-class-name: com.mysql.cj.jdbc.Driver
    username: root
    password: your_password
```

### 3. 파일 업로드 설정
```yaml
file:
  upload-dir: ./uploads  # 파일 저장 경로

spring:
  servlet:
    multipart:
      max-file-size: 10MB      # 파일당 최대 크기
      max-request-size: 10MB   # 요청당 최대 크기
```

## 실행 방법

### 1. Eureka Server 실행
```bash
# Eureka Server가 8761 포트에서 실행 중이어야 합니다
```

### 2. Board Service 빌드 및 실행

#### Gradle Wrapper 사용 (권장)
```bash
# Windows
gradlew.bat clean build
gradlew.bat bootRun

# Linux/Mac
./gradlew clean build
./gradlew bootRun
```

#### Gradle이 설치되어 있는 경우
```bash
gradle clean build
gradle bootRun
```

### 3. 서비스 확인
- Board Service: http://localhost:8083
- H2 Console: http://localhost:8083/h2-console
- Eureka Dashboard: http://localhost:8761

## Gradle 주요 명령어

```bash
# 프로젝트 빌드
./gradlew build

# 테스트 실행
./gradlew test

# 애플리케이션 실행
./gradlew bootRun

# JAR 파일 생성
./gradlew bootJar

# 의존성 확인
./gradlew dependencies

# 클린 빌드
./gradlew clean build

# 빌드 캐시 사용
./gradlew build --build-cache
```

## API 사용 예제

### 1. 게시글 생성
```bash
curl -X POST http://localhost:8083/api/boards \
  -H "Content-Type: application/json" \
  -d '{
    "title": "첫 번째 게시글",
    "content": "게시글 내용입니다.",
    "author": "홍길동"
  }'
```

### 2. 파일과 함께 게시글 생성
```bash
curl -X POST http://localhost:8083/api/boards/with-files \
  -F 'board={"title":"파일 첨부 게시글","content":"내용","author":"홍길동"};type=application/json' \
  -F 'files=@/path/to/file1.jpg' \
  -F 'files=@/path/to/file2.pdf'
```

### 3. 게시글 목록 조회
```bash
curl -X GET "http://localhost:8083/api/boards?page=0&size=10&sortBy=createdAt&direction=DESC"
```

### 4. 게시글 상세 조회
```bash
curl -X GET http://localhost:8083/api/boards/1
```

### 5. 댓글 생성
```bash
curl -X POST http://localhost:8083/api/boards/1/comments \
  -H "Content-Type: application/json" \
  -d '{
    "content": "댓글 내용입니다.",
    "author": "김철수"
  }'
```

### 6. 검색
```bash
# 키워드 검색
curl -X GET "http://localhost:8083/api/boards/search?keyword=게시글&page=0&size=10"

# 제목 검색
curl -X GET "http://localhost:8083/api/boards/search/title?title=첫번째&page=0&size=10"
```

## API Gateway 연동

### API Gateway 라우팅 설정 예시
```yaml
spring:
  cloud:
    gateway:
      routes:
        - id: board-service
          uri: lb://BOARD-SERVICE
          predicates:
            - Path=/api/boards/**
```

이렇게 설정하면 API Gateway를 통해 다음과 같이 접근할 수 있습니다:
```
http://localhost:8080/api/boards/**
```

## 데이터 모델

### Board (게시글)
- id: 게시글 ID (자동 생성)
- title: 제목
- content: 내용
- author: 작성자
- viewCount: 조회수
- createdAt: 생성일시
- updatedAt: 수정일시
- comments: 댓글 목록
- attachments: 첨부파일 목록

### Comment (댓글)
- id: 댓글 ID (자동 생성)
- content: 댓글 내용
- author: 작성자
- boardId: 게시글 ID (외래키)
- createdAt: 생성일시
- updatedAt: 수정일시

### Attachment (첨부파일)
- id: 첨부파일 ID (자동 생성)
- originalFileName: 원본 파일명
- storedFileName: 저장된 파일명 (UUID)
- filePath: 파일 경로
- fileSize: 파일 크기
- contentType: 파일 타입
- boardId: 게시글 ID (외래키)
- uploadedAt: 업로드 일시

## 예외 처리

서비스는 다음과 같은 예외를 처리합니다:
- `ResourceNotFoundException`: 리소스를 찾을 수 없을 때 (404)
- `FileStorageException`: 파일 저장 실패 시 (500)
- `MaxUploadSizeExceededException`: 파일 크기 초과 시 (413)
- `MethodArgumentNotValidException`: 유효성 검사 실패 시 (400)

## Health Check

Actuator를 통한 헬스 체크:
```bash
curl http://localhost:8083/actuator/health
```

## 추가 개선 사항

향후 추가 가능한 기능들:
- Spring Security를 통한 인증/인가
- Redis를 활용한 캐싱
- Kafka/RabbitMQ를 통한 이벤트 기반 통신
- 게시글 좋아요/싫어요 기능
- 대댓글 기능
- 이미지 리사이징 및 썸네일 생성
- 전문 검색 (Elasticsearch)

## 라이선스

MIT License
