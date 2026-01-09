# Admin Service

관리자 기능을 제공하는 마이크로서비스입니다. 메뉴 관리, 사용자 관리 등 관리자 전용 기능을 담당합니다.

## 📋 주요 기능

- **메뉴 관리**: 시스템 메뉴 CRUD 및 권한 설정
- **사용자 관리**: 사용자 계정 및 권한 관리 (예정)
- **시스템 설정**: 전역 설정 관리 (예정)

## 🛠 기술 스택

- **Java**: 21
- **Spring Boot**: 3.4.10
- **Spring Cloud**: 2024.0.0
- **Database**: MongoDB
- **Security**: JWT Authentication
- **API Documentation**: SpringDoc OpenAPI

## 📊 데이터베이스

- **Type**: MongoDB
- **Database**: admin-db
- **Port**: 27017 (default)

## 🔐 보안

- JWT 기반 인증
- ADMIN 권한 필요
- Spring Security 설정

## 🚀 실행 방법

### 로컬 실행

```bash
# MongoDB 실행 (Docker)
docker run -d -p 27017:27017 --name mongodb mongo:latest

# 애플리케이션 빌드
./gradlew clean build

# 애플리케이션 실행
./gradlew bootRun
```

### Docker 실행

```bash
# 이미지 빌드
docker build -t message-service:latest .

# 컨테이너 실행
docker run -d -p 8085:8085 \
  -e SPRING_DATA_MONGODB_URI=mongodb://mongodb:27017/admin-db \
  -e EUREKA_CLIENT_SERVICEURL_DEFAULTZONE=http://eureka-server:8761/eureka/ \
  --name message-service \
  message-service:latest
```

## 📡 API 엔드포인트

### 메뉴 관리

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/menus` | 모든 메뉴 조회 | - |
| GET | `/menus/{id}` | 특정 메뉴 조회 | - |
| GET | `/menus/role/{role}` | 권한별 메뉴 조회 | - |
| POST | `/menus` | 메뉴 생성 | ADMIN |
| PUT | `/menus/{id}` | 메뉴 수정 | ADMIN |
| DELETE | `/menus/{id}` | 메뉴 삭제 | ADMIN |
| PUT | `/menus/reorder` | 메뉴 순서 변경 | ADMIN |
| POST | `/menus/{id}/submenu` | 서브메뉴 생성 | ADMIN |
| PUT | `/menus/{id}/submenu/{subId}` | 서브메뉴 수정 | ADMIN |
| DELETE | `/menus/{id}/submenu/{subId}` | 서브메뉴 삭제 | ADMIN |

## 🔧 환경 변수

| Variable | Description | Default |
|----------|-------------|---------|
| SERVER_PORT | 서버 포트 | 8085 |
| SPRING_DATA_MONGODB_URI | MongoDB 연결 URI | mongodb://localhost:27017/admin-db |
| JWT_SECRET | JWT 비밀키 | (필수) |
| JWT_EXPIRATION | JWT 만료 시간 (ms) | 86400000 |
| EUREKA_CLIENT_SERVICEURL_DEFAULTZONE | Eureka 서버 URL | http://localhost:8761/eureka/ |

## 📦 의존성

주요 라이브러리:
- Spring Boot Starter Web
- Spring Boot Starter Data MongoDB
- Spring Boot Starter Security
- Spring Cloud Netflix Eureka Client
- JJWT (JSON Web Token)
- SpringDoc OpenAPI
- Lombok

## 🏗 프로젝트 구조

```
src/main/java/com/enterprise/admin/
├── AdminServiceApplication.java       # 메인 애플리케이션
├── config/
│   └── AdminSecurityConfig.java      # Security 설정
├── controller/
│   └── MenuController.java           # Menu API 컨트롤러
├── dto/
│   └── MenuDto.java                  # Menu DTO
├── entity/
│   └── Menu.java                     # Menu 엔티티
├── exception/
│   ├── ErrorResponse.java            # 에러 응답
│   ├── GlobalExceptionHandler.java   # 전역 예외 처리
│   ├── ResourceNotFoundException.java
│   └── DuplicateResourceException.java
├── filter/
│   └── AdminJwtAuthenticationFilter.java  # JWT 필터
├── repository/
│   └── MenuRepository.java           # Menu 리포지토리
├── service/
│   └── MenuService.java              # Menu 서비스
└── util/
    └── JwtUtil.java                  # JWT 유틸리티
```

## 🧪 테스트

```bash
# 단위 테스트
./gradlew test

# 통합 테스트
./gradlew integrationTest
```

## 📝 개발 노트

### MongoDB 설정

MongoDB는 NoSQL 데이터베이스로, 메뉴 구조의 유연성을 위해 선택되었습니다.

```yaml
spring:
  data:
    mongodb:
      uri: mongodb://localhost:27017/admin-db
      database: admin-db
```

### JWT 인증

모든 관리 API는 ADMIN 권한을 가진 JWT 토큰이 필요합니다.

```
Authorization: Bearer <JWT_TOKEN>
```

### Swagger UI

API 문서는 다음 URL에서 확인할 수 있습니다:
```
http://localhost:8085/swagger-ui.html
```

## 🔄 버전 이력

- **1.0.0** (2026-01-03)
  - 초기 버전
  - 메뉴 관리 기능 구현
  - MongoDB 연동
  - JWT 인증 구현

## 📞 문의

프로젝트 관련 문의사항이 있으시면 이슈를 등록해주세요.
