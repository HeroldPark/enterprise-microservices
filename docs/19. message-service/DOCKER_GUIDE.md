# Docker Compose 실행 가이드

## 전체 시스템 구성도

```
┌─────────────────────────────────────────────────────────────────┐
│                     Enterprise Microservices                     │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────┐     ┌──────────────────┐     ┌──────────────┐
│   Frontend      │────▶│   API Gateway    │────▶│   Services   │
│   (Port 3000)   │     │   (Port 8080)    │     │              │
└─────────────────┘     └──────────────────┘     └──────────────┘
                               │                        │
                               ▼                        ▼
                        ┌──────────────┐        ┌──────────────┐
                        │ Eureka Server│        │   Kafka      │
                        │ (Port 8761)  │        │ (KRaft Mode) │
                        └──────────────┘        │ (Port 9092)  │
                                                └──────────────┘
```

## 서비스 포트 매핑

### 인프라 서비스
- **Eureka Server**: 8761
- **Config Server**: 8888
- **API Gateway**: 8080
- **Kafka Broker**: 9092 (내부), 9093 (외부), 9094 (controller)
- **Kafka UI**: 8090

### 비즈니스 서비스
- **User Service**: 8081
- **Product Service**: 8082
- **Order Service**: 8083
- **Board Service**: 8084
- **Admin Service**: 8085
- **Message Service**: 8086

### 데이터베이스 (MariaDB)
- **User DB**: 13306
- **Product DB**: 13307
- **Order DB**: 13308
- **Board DB**: 13309
- **Admin DB**: 13310
- **Message DB**: 13311

### 프론트엔드
- **Frontend**: 3000

## 실행 방법

### 1. 전체 시스템 실행

```bash
# BuildKit 활성화하여 빌드 및 실행
DOCKER_BUILDKIT=1 COMPOSE_DOCKER_CLI_BUILD=1 docker-compose up -d

# 또는 일반 실행
docker-compose up -d
```

### 2. 특정 서비스만 실행

#### 인프라만 실행 (Kafka, DB, Eureka)
```bash
docker-compose up -d kafka kafka-ui \
  mariadb-user mariadb-product mariadb-order \
  mariadb-board mariadb-admin mariadb-message \
  config-server eureka-server
```

#### Message Service만 실행
```bash
docker-compose up -d message-service
```

### 3. 로그 확인

```bash
# 전체 로그
docker-compose logs -f

# 특정 서비스 로그
docker-compose logs -f message-service
docker-compose logs -f kafka
docker-compose logs -f eureka-server

# 최근 100줄만 보기
docker-compose logs --tail=100 -f message-service
```

### 4. 서비스 상태 확인

```bash
# 실행중인 컨테이너 확인
docker-compose ps

# 헬스 체크 상태 확인
docker-compose ps | grep healthy
```

## 서비스 확인

### Eureka Dashboard
```
http://localhost:8761
```
- 등록된 모든 마이크로서비스 확인
- 서비스 상태 및 인스턴스 정보

### Kafka UI
```
http://localhost:8090
```
- Topics: message.created, message.read, message.deleted
- Consumer Groups
- Broker 정보

### API Gateway
```
http://localhost:8080
```

### Message Service Endpoints
```bash
# Health Check
curl http://localhost:8086/actuator/health

# Kafka 테스트
curl -X POST "http://localhost:8086/api/kafka-test/message-created?messageId=1&senderId=100&receiverId=200&content=TestMessage"
```

## 개발 워크플로우

### 시나리오 1: 로컬에서 개발하기

1. **인프라만 Docker로 실행**
```bash
# Kafka, DB, Eureka만 실행
docker-compose up -d kafka kafka-ui \
  mariadb-message eureka-server
```

2. **IntelliJ/Eclipse에서 Message Service 실행**
```bash
# application-local.yml 프로파일 사용
./gradlew bootRun --args='--spring.profiles.active=local'
```

### 시나리오 2: 전체 시스템 테스트

```bash
# 1. 전체 실행
docker-compose up -d

# 2. 서비스 준비 대기 (약 2-3분)
docker-compose logs -f eureka-server | grep "Started"

# 3. Eureka에서 모든 서비스 등록 확인
curl http://localhost:8761/eureka/apps

# 4. 테스트 실행
curl -X POST "http://localhost:8080/api/messages" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {token}" \
  -d '{
    "senderId": 1,
    "receiverId": 2,
    "content": "Hello from Docker!"
  }'
```

### 시나리오 3: 특정 서비스만 재시작

```bash
# Message Service 재빌드 및 재시작
docker-compose up -d --build message-service

# 로그 확인
docker-compose logs -f message-service
```

## 문제 해결

### Kafka 연결 오류

**증상**: Message Service가 Kafka에 연결하지 못함

**해결**:
```bash
# Kafka 상태 확인
docker-compose logs kafka | grep "started"

# Kafka 재시작
docker-compose restart kafka

# 30초 대기 후 Message Service 재시작
sleep 30
docker-compose restart message-service
```

### Eureka 등록 실패

**증상**: 서비스가 Eureka에 등록되지 않음

**해결**:
```bash
# Eureka Server 로그 확인
docker-compose logs eureka-server

# 네트워크 확인
docker network ls
docker network inspect enterprise-network

# 서비스 재시작
docker-compose restart message-service
```

### 데이터베이스 연결 오류

**증상**: MariaDB 연결 실패

**해결**:
```bash
# MariaDB 상태 확인
docker-compose ps mariadb-message

# MariaDB 로그 확인
docker-compose logs mariadb-message

# 직접 접속 테스트
docker exec -it mariadb-message mysql -urozeta -prozeta123 message-db
```

## 데이터 관리

### 볼륨 확인
```bash
docker volume ls | grep enterprise
```

### 데이터 초기화
```bash
# 모든 컨테이너 중지
docker-compose down

# 볼륨까지 삭제 (주의: 모든 데이터 삭제됨)
docker-compose down -v

# 다시 시작
docker-compose up -d
```

### 백업
```bash
# MariaDB 백업
docker exec mariadb-message mysqldump -urozeta -prozeta123 message-db > message-db-backup.sql

# Kafka 토픽 데이터 확인
docker exec -it kafka kafka-console-consumer \
  --bootstrap-server localhost:9092 \
  --topic message.created \
  --from-beginning \
  --max-messages 10
```

## 성능 최적화

### 리소스 제한 설정

`docker-compose.yml`에 추가:
```yaml
message-service:
  deploy:
    resources:
      limits:
        cpus: '1'
        memory: 1G
      reservations:
        cpus: '0.5'
        memory: 512M
```

### 동시 실행 제한
```bash
# 3개씩 순차 실행
docker-compose up -d zookeeper kafka kafka-ui
sleep 10
docker-compose up -d mariadb-user mariadb-message
sleep 10
docker-compose up -d eureka-server
sleep 20
docker-compose up -d message-service
```

## 모니터링

### 컨테이너 리소스 사용량
```bash
docker stats
```

### 로그 크기 관리
```bash
# 로그 파일 크기 확인
docker system df

# 로그 정리
docker system prune -a
```

## 프로덕션 배포 체크리스트

- [ ] 환경 변수로 민감 정보 관리
- [ ] Kafka 레플리케이션 팩터 증가 (3 이상)
- [ ] MariaDB 레플리케이션 구성
- [ ] 로그 수집 시스템 연동 (ELK, Splunk 등)
- [ ] 모니터링 도구 설정 (Prometheus, Grafana)
- [ ] 백업 자동화
- [ ] SSL/TLS 인증서 설정
- [ ] 네트워크 보안 그룹 설정
- [ ] Health check 임계값 조정
- [ ] 리소스 제한 설정

## 유용한 명령어 모음

```bash
# 전체 시스템 종료
docker-compose down

# 빌드 캐시 없이 재빌드
docker-compose build --no-cache

# 특정 서비스만 빌드
docker-compose build message-service

# 컨테이너 내부 접속
docker exec -it message-service bash

# 네트워크 검사
docker network inspect enterprise-network

# 볼륨 검사
docker volume inspect enterprise_kafka-data

# 로그 파일로 저장
docker-compose logs message-service > message-service.log

# 실행 중인 프로세스 확인
docker-compose top
```

## 참고 자료

- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Kafka Docker Quick Start](https://kafka.apache.org/quickstart)
- [Spring Boot Docker](https://spring.io/guides/topicals/spring-boot-docker/)
- [MariaDB Docker Hub](https://hub.docker.com/_/mariadb)
