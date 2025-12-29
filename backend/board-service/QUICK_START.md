# Board Service 빠른 시작 가이드 (Gradle)

## 1. 사전 요구사항

### 실행 중이어야 하는 서비스
- **Eureka Server**: `http://localhost:8761`
- **API Gateway** (선택사항): `http://localhost:8080`

### 필요한 소프트웨어
- Java 17 이상
- Gradle (또는 Gradle Wrapper 사용)

## 2. 프로젝트 실행

### Gradle Wrapper 사용 (권장)

#### Windows
```bash
cd board-service
gradlew.bat clean build
gradlew.bat bootRun
```

#### Linux/Mac
```bash
cd board-service
chmod +x gradlew
./gradlew clean build
./gradlew bootRun
```

### IDE에서 실행
- IntelliJ IDEA, Eclipse, VS Code 등에서 `BoardServiceApplication.java` 파일을 열고 실행

## 3. 서비스 확인

### Eureka 대시보드에서 확인
- URL: `http://localhost:8761`
- BOARD-SERVICE가 등록되었는지 확인

### H2 콘솔 접속
- URL: `http://localhost:8083/h2-console`
- JDBC URL: `jdbc:h2:mem:boarddb`
- Username: `sa`
- Password: (비워두기)

### Health Check
```bash
curl http://localhost:8083/actuator/health
```

## 4. 기본 API 테스트

### 4.1 게시글 생성
```bash
curl -X POST http://localhost:8083/api/boards \
  -H "Content-Type: application/json" \
  -d '{
    "title": "안녕하세요",
    "content": "첫 번째 게시글입니다.",
    "author": "홍길동"
  }'
```

**응답 예시:**
```json
{
  "id": 1,
  "title": "안녕하세요",
  "content": "첫 번째 게시글입니다.",
  "author": "홍길동",
  "viewCount": 0,
  "createdAt": "2024-01-15T10:30:00",
  "updatedAt": "2024-01-15T10:30:00",
  "commentCount": 0,
  "attachmentCount": 0
}
```

### 4.2 게시글 목록 조회
```bash
curl http://localhost:8083/api/boards
```

### 4.3 게시글 상세 조회
```bash
curl http://localhost:8083/api/boards/1
```

### 4.4 댓글 작성
```bash
curl -X POST http://localhost:8083/api/boards/1/comments \
  -H "Content-Type: application/json" \
  -d '{
    "content": "좋은 글이네요!",
    "author": "김철수"
  }'
```

### 4.5 파일 첨부와 함께 게시글 작성
```bash
curl -X POST http://localhost:8083/api/boards/with-files \
  -F 'board={"title":"파일 테스트","content":"파일 첨부 테스트입니다.","author":"이영희"};type=application/json' \
  -F 'files=@test.txt'
```

## 5. Gradle 주요 명령어

### 빌드 관련
```bash
# 프로젝트 빌드
./gradlew build

# 클린 빌드
./gradlew clean build

# 빌드 캐시 사용
./gradlew build --build-cache

# 빌드 스캔 (성능 분석)
./gradlew build --scan
```

### 테스트 관련
```bash
# 전체 테스트 실행
./gradlew test

# 특정 테스트만 실행
./gradlew test --tests BoardServiceTest

# 테스트 리포트 확인
./gradlew test --info
```

### 실행 관련
```bash
# 애플리케이션 실행
./gradlew bootRun

# JAR 파일 생성
./gradlew bootJar

# 생성된 JAR 실행
java -jar build/libs/board-service-1.0.0.jar
```

### 의존성 관련
```bash
# 의존성 트리 확인
./gradlew dependencies

# 의존성 업데이트 확인
./gradlew dependencyUpdates
```

## 6. Postman으로 테스트하기

### 주요 엔드포인트

#### 게시글
- **생성**: POST `/api/boards`
- **목록**: GET `/api/boards?page=0&size=10`
- **상세**: GET `/api/boards/{id}`
- **수정**: PUT `/api/boards/{id}`
- **삭제**: DELETE `/api/boards/{id}`
- **검색**: GET `/api/boards/search?keyword={검색어}`

#### 댓글
- **생성**: POST `/api/boards/{boardId}/comments`
- **목록**: GET `/api/boards/{boardId}/comments`
- **수정**: PUT `/api/boards/{boardId}/comments/{commentId}`
- **삭제**: DELETE `/api/boards/{boardId}/comments/{commentId}`

#### 첨부파일
- **목록**: GET `/api/boards/{boardId}/attachments`
- **다운로드**: GET `/api/boards/{boardId}/attachments/{attachmentId}/download`
- **삭제**: DELETE `/api/boards/{boardId}/attachments/{attachmentId}`

## 7. API Gateway를 통한 접근

API Gateway가 실행 중이라면:

```bash
# 직접 접근
curl http://localhost:8083/api/boards

# API Gateway를 통한 접근
curl http://localhost:8080/api/boards
```

## 8. 데이터베이스를 MySQL로 변경하기

### 8.1 MySQL 설치 및 데이터베이스 생성
```sql
CREATE DATABASE boarddb CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 8.2 application.yml 수정
```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/boarddb?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
    driver-class-name: com.mysql.cj.jdbc.Driver
    username: root
    password: your_password
  
  jpa:
    properties:
      hibernate:
        dialect: org.hibernate.dialect.MySQLDialect
```

### 8.3 H2 Console 비활성화
```yaml
spring:
  h2:
    console:
      enabled: false
```

## 9. 문제 해결

### 포트 충돌
8083 포트가 이미 사용 중인 경우:
```yaml
server:
  port: 8084  # 다른 포트로 변경
```

### Eureka 연결 실패
- Eureka Server가 실행 중인지 확인
- `application.yml`의 Eureka URL이 올바른지 확인

### 파일 업로드 실패
- `uploads` 디렉토리 생성 확인
- 파일 크기가 10MB를 초과하지 않는지 확인
- 디스크 용량 확인

### Gradle 빌드 실패
```bash
# Gradle 캐시 정리
./gradlew clean --refresh-dependencies

# Gradle Wrapper 재설정
gradle wrapper --gradle-version 8.5
```

## 10. 개발 팁

### IntelliJ IDEA 설정
1. File → Settings → Build, Execution, Deployment → Build Tools → Gradle
2. "Build and run using"을 "IntelliJ IDEA"로 설정 (빠른 빌드)
3. "Run tests using"을 "IntelliJ IDEA"로 설정 (빠른 테스트)

### Hot Reload 설정
```gradle
// build.gradle에 추가
configurations {
    developmentOnly
    runtimeClasspath {
        extendsFrom developmentOnly
    }
}

dependencies {
    developmentOnly 'org.springframework.boot:spring-boot-devtools'
}
```

### 프로파일별 실행
```bash
# 개발 프로파일
./gradlew bootRun --args='--spring.profiles.active=dev'

# 프로덕션 프로파일
./gradlew bootRun --args='--spring.profiles.active=prod'
```

## 11. 배포

### JAR 파일 생성 및 실행
```bash
# JAR 생성
./gradlew bootJar

# 실행
java -jar build/libs/board-service-1.0.0.jar

# 프로파일 지정하여 실행
java -jar build/libs/board-service-1.0.0.jar --spring.profiles.active=prod
```

### Docker 배포 (선택사항)
```dockerfile
FROM openjdk:17-jdk-slim
WORKDIR /app
COPY build/libs/board-service-1.0.0.jar app.jar
EXPOSE 8083
ENTRYPOINT ["java", "-jar", "app.jar"]
```

## 12. 다음 단계

- [ ] Spring Security 추가하여 인증/인가 구현
- [ ] 페이지네이션 개선
- [ ] 게시글 좋아요 기능 추가
- [ ] 이미지 썸네일 생성 기능 추가
- [ ] 전문 검색 (Elasticsearch) 연동
- [ ] 캐싱 (Redis) 적용
- [ ] 메시지 큐 (Kafka/RabbitMQ) 연동

## 13. 도움말

문제가 발생하면 다음을 확인하세요:
1. 로그 파일 확인: `logs/spring.log`
2. H2 콘솔에서 데이터 확인
3. Eureka 대시보드에서 서비스 등록 상태 확인
4. Actuator health endpoint 확인
5. Gradle 빌드 로그 확인: `./gradlew build --info`

---

**행복한 개발 되세요! 🚀**
