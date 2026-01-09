# Enterprise Microservices with Kafka - Quick Start Guide

## 🚀 빠른 시작 (5분 안에)

### 1단계: 전체 시스템 실행

```bash
# 프로젝트 디렉토리로 이동
cd herol@ShanePark MINGW64 ~/Documents/Workspace/enterprise-microservices (master)
$ 

# 전체 시스템 실행 (첫 실행은 빌드 시간 포함 5-10분 소요)
docker-compose up -d

# 실행 상태 확인
docker-compose ps
# 모두 정상 실행 상태 여야 한다.
```

### 2단계: Kafka 토픽 초기화

```bash
# Kafka 토픽 자동 생성 (약 30초 소요)
./init-kafka-topics.sh
```

### 3단계: 서비스 준비 대기

```bash
# 모든 서비스가 준비될 때까지 대기 (약 2-3분)
while true; do docker-compose ps | grep healthy; sleep 2; done
```

### 4단계: 접속 확인

브라우저에서 다음 URL 접속:

- **Eureka Dashboard**: http://localhost:8761
- **Kafka UI**: http://localhost:8090
- **API Gateway**: http://localhost:8080
- **Frontend**: http://localhost:3000

## 📊 시스템 아키텍처

```
┌─────────────────────────────────────────────────────────────────────┐
│                    Enterprise Microservices Architecture            │
└─────────────────────────────────────────────────────────────────────┘

                         ┌──────────────┐
                         │   Frontend   │
                         │  (Port 3000) │
                         └──────┬───────┘
                                │
                                ▼
                         ┌──────────────┐
                         │ API Gateway  │
                         │  (Port 8080) │
                         └──────┬───────┘
                                │
                ┌───────────────┼───────────────┐
                │               │               │
                ▼               ▼               ▼
         ┌──────────┐    ┌──────────┐   ┌──────────┐
         │   User   │    │ Message  │   │  Order   │
         │ Service  │    │ Service  │   │ Service  │
         │  :8081   │    │  :8086   │   │  :8083   │
         └─────┬────┘    └─────┬────┘   └─────┬────┘
               │               │              │
               ▼               ▼              ▼
         ┌──────────┐    ┌──────────┐   ┌──────────┐
         │ MariaDB  │    │ MariaDB  │   │ MariaDB  │
         │  :13306  │    │  :13311  │   │  :13308  │
         └──────────┘    └─────┬────┘   └──────────┘
                               │
                               ▼
                         ┌──────────────┐
                         │    Kafka     │
                         │  (KRaft Mode)│
                         │  Port 9092   │
                         └──────────────┘
```

## 🧪 테스트

### 1. Health Check

```bash
# 모든 서비스 Health Check => OK
curl http://localhost:8086/actuator/health
curl http://localhost:8081/actuator/health
curl http://localhost:8083/actuator/health
```

### 2. Eureka 서비스 등록 확인

```bash
# 등록된 모든 서비스 조회
curl http://localhost:8761/eureka/apps | grep -o '<app>.*</app>'

결과 :
  % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
                                 Dload  Upload   Total   Spent    Left  Speed
100 11431    0 11431    0     0   606k      0 --:--:-- --:--:-- --:--:--  620k
<app>MESSAGE-SERVICE</app>
<app>API-GATEWAY</app>
<app>ORDER-SERVICE</app>
<app>ADMIN-SERVICE</app>
<app>PRODUCT-SERVICE</app>
<app>BOARD-SERVICE</app>
<app>USER-SERVICE</app>
```

### 3. Kafka 메시지 발행 테스트

```bash
# 메시지 생성 이벤트 발행
curl -X POST "http://localhost:8086/api/kafka-test/message-created?messageId=1&senderId=100&receiverId=200&content=HelloKafka"

# 대량 이벤트 테스트
curl -X POST "http://localhost:8086/api/kafka-test/bulk-test?count=100"
```

### 4. Kafka UI에서 메시지 확인

1. http://localhost:8090 접속
2. Topics 메뉴 클릭
3. `message.created` 토픽 선택
4. Messages 탭에서 발행된 메시지 확인

## 📝 주요 엔드포인트

### Message Service API

```bash
# 메시지 생성
curl -X POST http://localhost:8086/api/messages \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {token}" \
  -d '{
    "senderId": 1,
    "receiverId": 2,
    "content": "Hello, World!"
  }'

# 받은 메시지 조회
curl http://localhost:8086/api/messages/inbox/2 \
  -H "Authorization: Bearer {token}"

# 보낸 메시지 조회
curl http://localhost:8086/api/messages/sent/1 \
  -H "Authorization: Bearer {token}"

# 메시지 읽음 처리
curl -X PATCH http://localhost:8086/api/messages/1/read \
  -H "Authorization: Bearer {token}"

# 메시지 삭제
curl -X DELETE http://localhost:8086/api/messages/1 \
  -H "Authorization: Bearer {token}"
```

## 🔍 모니터링

### 로그 실시간 확인

```bash
# 전체 로그
docker-compose logs -f

# Message Service 로그만
docker-compose logs -f message-service

# Kafka 로그만
docker-compose logs -f kafka

# 여러 서비스 동시에
docker-compose logs -f message-service kafka eureka-server
```

### 리소스 사용량 모니터링

```bash
# 실시간 리소스 사용량
docker stats

# 특정 컨테이너만
docker stats message-service kafka
```

## 🛑 중지 및 재시작

### 전체 시스템 중지

```bash
# 컨테이너만 중지 (데이터 유지)
docker-compose down

# 컨테이너와 볼륨 모두 삭제 (데이터 삭제)
docker-compose down -v
```

### 특정 서비스만 재시작

```bash
# Message Service만 재시작
docker-compose restart message-service

# 재빌드 후 재시작
docker-compose up -d --build message-service
```

## 🔧 개발 모드

### 로컬 개발 환경 설정

인프라만 Docker로 실행하고, 애플리케이션은 IDE에서 실행:

```bash
# 1. 필요한 인프라만 실행
docker-compose up -d kafka kafka-ui mariadb-message eureka-server

# 2. IDE에서 Message Service 실행 (application-local.yml 사용)
./gradlew bootRun --args='--spring.profiles.active=local'
```

### 설정 파일

- **Docker 환경**: `application.yml` (기본)
- **로컬 개발**: `application-local.yml`

주요 차이점:
- Kafka: `kafka:9092` → `localhost:9093`
- MariaDB: `mariadb-message:3306` → `localhost:13311`
- Eureka: `eureka-server:8761` → `localhost:8761`

## 🐛 문제 해결

### 1. Kafka 연결 실패

```bash
# Kafka 상태 확인
docker-compose logs kafka | grep "started"

# Kafka 재시작
docker-compose restart kafka
sleep 30
docker-compose restart message-service
```

### 2. 서비스가 Eureka에 등록 안됨

```bash
# Eureka 로그 확인
docker-compose logs eureka-server

# 네트워크 확인
docker network inspect enterprise-network

# 서비스 재시작
docker-compose restart message-service
```

### 3. 데이터베이스 연결 오류

```bash
# MariaDB 상태 확인
docker-compose ps mariadb-message

# 직접 접속 테스트
docker exec -it mariadb-message mysql -urozeta -prozeta123 message-db
```

### 4. 포트 충돌

```bash
# 포트 사용 확인
netstat -an | grep LISTEN | grep -E "8086|9092|9093|8761"

# 충돌하는 프로세스 종료 후 재시작
docker-compose restart
```

## 📚 추가 문서

- **DOCKER_GUIDE.md** - 상세한 Docker 실행 가이드
- **KAFKA_README.md** - Kafka 기능 상세 설명
- **KAFKA_INTEGRATION_GUIDE.md** - Kafka 통합 가이드
- **message-service/KAFKA_FEATURES.md** - Message Service Kafka 기능

## 🎯 다음 단계

1. **기능 확장**
   - User Service에 Kafka 이벤트 추가
   - Order Service에 Kafka 이벤트 추가
   - Board Service에 Kafka 이벤트 추가

2. **모니터링 강화**
   - Prometheus + Grafana 추가
   - ELK Stack 연동
   - Kafka Lag 모니터링

3. **보안 강화**
   - Kafka SSL/TLS 설정
   - JWT 토큰 기반 인증
   - API Gateway Rate Limiting

4. **성능 최적화**
   - Kafka 파티션 증가
   - Consumer 동시성 조정
   - 캐싱 전략 구현

## 📞 지원

문제가 발생하면 다음을 확인하세요:

1. **로그 확인**
   ```bash
   docker-compose logs -f message-service
   ```

2. **상태 확인**
   ```bash
   docker-compose ps
   ```

3. **Kafka UI**
   http://localhost:8090

4. **Eureka Dashboard**
   http://localhost:8761

---

**Happy Coding! 🚀**
