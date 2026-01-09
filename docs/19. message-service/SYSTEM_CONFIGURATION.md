# Enterprise Microservices System Configuration

## 📋 시스템 구성 요약

### 전체 서비스 목록

| 서비스 | 포트 | 설명 | Kafka 사용 |
|--------|------|------|------------|
| Frontend | 3000 | React 프론트엔드 | ❌ |
| API Gateway | 8080 | Spring Cloud Gateway | ❌ |
| Eureka Server | 8761 | 서비스 디스커버리 | ❌ |
| Config Server | 8888 | 중앙 설정 관리 | ❌ |
| User Service | 8081 | 사용자 관리 | ✅ (선택) |
| Product Service | 8082 | 상품 관리 | ✅ (선택) |
| Order Service | 8083 | 주문 관리 | ✅ (선택) |
| Board Service | 8084 | 게시판 관리 | ✅ (선택) |
| Admin Service | 8085 | 관리자 기능 | ✅ (선택) |
| **Message Service** | **8086** | **메시지 관리** | **✅ (필수)** |
| Kafka (KRaft) | 9092/9093/9094 | 메시지 브로커 | - |
| Kafka UI | 8090 | Kafka 모니터링 | - |

> **Note**: Kafka는 KRaft 모드로 실행되어 Zookeeper가 필요 없습니다.

### 데이터베이스 (MariaDB 10.11)

| DB | 포트 | 데이터베이스명 | 사용자 | 비밀번호 |
|----|------|----------------|--------|----------|
| User DB | 13306 | user-db | rozeta | rozeta123 |
| Product DB | 13307 | product-db | rozeta | rozeta123 |
| Order DB | 13308 | order-db | rozeta | rozeta123 |
| Board DB | 13309 | board-db | rozeta | rozeta123 |
| Admin DB | 13310 | admin-db | rozeta | rozeta123 |
| **Message DB** | **13311** | **message-db** | **rozeta** | **rozeta123** |

## 🔧 환경별 설정 비교

### 1. Kafka 설정

#### Docker 환경 (application.yml)
```yaml
kafka:
  bootstrap-servers: ${KAFKA_BOOTSTRAP_SERVERS:kafka:9092}
```

#### 로컬 개발 환경 (application-local.yml)
```yaml
kafka:
  bootstrap-servers: localhost:9093
```

#### 프로덕션 환경 (권장)
```yaml
kafka:
  bootstrap-servers: kafka-1:9092,kafka-2:9092,kafka-3:9092
  consumer:
    auto-offset-reset: earliest
    enable-auto-commit: false
  producer:
    acks: all
    retries: 3
    enable-idempotence: true
```

### 2. 데이터베이스 설정

#### Docker 환경
```yaml
spring:
  datasource:
    url: jdbc:mariadb://mariadb-message:3306/message-db?useUnicode=true&characterEncoding=UTF-8
    username: rozeta
    password: rozeta123
```

#### 로컬 개발 환경
```yaml
spring:
  datasource:
    url: jdbc:mariadb://localhost:13311/message-db?useUnicode=true&characterEncoding=UTF-8
    username: rozeta
    password: rozeta123
```

#### 프로덕션 환경 (권장)
```yaml
spring:
  datasource:
    url: jdbc:mariadb://${DB_HOST}:${DB_PORT}/${DB_NAME}?useUnicode=true&characterEncoding=UTF-8
    username: ${DB_USERNAME}
    password: ${DB_PASSWORD}
    hikari:
      maximum-pool-size: 20
      minimum-idle: 5
      connection-timeout: 30000
```

### 3. Eureka 설정

#### Docker 환경
```yaml
eureka:
  client:
    service-url:
      defaultZone: ${EUREKA_CLIENT_SERVICEURL_DEFAULTZONE:http://eureka-server:8761/eureka/}
```

#### 로컬 개발 환경
```yaml
eureka:
  client:
    service-url:
      defaultZone: http://localhost:8761/eureka/
```

#### 프로덕션 환경 (HA 구성)
```yaml
eureka:
  client:
    service-url:
      defaultZone: http://eureka-1:8761/eureka/,http://eureka-2:8761/eureka/,http://eureka-3:8761/eureka/
```

## 🎯 Kafka 토픽 구성

### Message Service 토픽

| 토픽명 | 파티션 | 레플리카 | 설명 |
|--------|--------|----------|------|
| message.created | 3 | 1 | 메시지 생성 이벤트 |
| message.read | 3 | 1 | 메시지 읽음 이벤트 |
| message.deleted | 3 | 1 | 메시지 삭제 이벤트 |

### 확장 토픽 (선택사항)

| 토픽명 | 파티션 | 레플리카 | 설명 |
|--------|--------|----------|------|
| user.registered | 3 | 1 | 사용자 등록 이벤트 |
| user.updated | 3 | 1 | 사용자 정보 수정 이벤트 |
| order.created | 3 | 1 | 주문 생성 이벤트 |
| order.confirmed | 3 | 1 | 주문 확인 이벤트 |
| board.post.created | 3 | 1 | 게시글 작성 이벤트 |

### 프로덕션 토픽 설정 (권장)

```bash
# 레플리케이션 팩터 3, 파티션 5
kafka-topics --create \
  --bootstrap-server kafka:9092 \
  --replication-factor 3 \
  --partitions 5 \
  --topic message.created \
  --config retention.ms=604800000 \
  --config compression.type=lz4
```

## 🚀 배포 시나리오

### 시나리오 1: 로컬 개발 환경

**목적**: 빠른 개발 및 테스트

**구성**:
```bash
# 인프라만 Docker로 실행
docker-compose up -d zookeeper kafka kafka-ui mariadb-message eureka-server

# IDE에서 애플리케이션 실행
./gradlew bootRun --args='--spring.profiles.active=local'
```

**장점**:
- 빠른 코드 변경 및 재시작
- IDE 디버깅 가능
- 로그 직접 확인 가능

### 시나리오 2: 통합 테스트 환경

**목적**: 전체 시스템 통합 테스트

**구성**:
```bash
# 전체 시스템 Docker로 실행
docker-compose up -d

# Kafka 토픽 초기화
./init-kafka-topics.sh
```

**장점**:
- 실제 운영 환경과 유사
- 서비스 간 통신 테스트
- 성능 테스트 가능

### 시나리오 3: 프로덕션 환경

**목적**: 실제 서비스 운영

**구성**:
```yaml
# docker-compose.prod.yml
version: '3.8'
services:
  kafka:
    image: confluentinc/cp-kafka:7.5.0
    deploy:
      replicas: 3
      resources:
        limits:
          cpus: '2'
          memory: 4G
    environment:
      KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR: 3
      KAFKA_TRANSACTION_STATE_LOG_REPLICATION_FACTOR: 3
      
  message-service:
    deploy:
      replicas: 3
      resources:
        limits:
          cpus: '1'
          memory: 2G
    environment:
      SPRING_PROFILES_ACTIVE: prod
      KAFKA_BOOTSTRAP_SERVERS: kafka-1:9092,kafka-2:9092,kafka-3:9092
```

**추가 설정**:
- Load Balancer (Nginx, HAProxy)
- SSL/TLS 인증서
- 모니터링 (Prometheus, Grafana)
- 로그 수집 (ELK Stack)

## 📊 리소스 요구사항

### 최소 사양 (개발 환경)

| 서비스 | CPU | Memory | 디스크 |
|--------|-----|--------|--------|
| Kafka + Zookeeper | 1 Core | 2GB | 10GB |
| MariaDB (전체) | 1 Core | 2GB | 20GB |
| Message Service | 0.5 Core | 1GB | 1GB |
| Eureka Server | 0.5 Core | 512MB | 1GB |
| **Total** | **3 Cores** | **5.5GB** | **32GB** |

### 권장 사양 (프로덕션 환경)

| 서비스 | CPU | Memory | 디스크 |
|--------|-----|--------|--------|
| Kafka (x3) | 2 Cores | 4GB | 100GB |
| Zookeeper (x3) | 1 Core | 2GB | 50GB |
| MariaDB (x6) | 2 Cores | 4GB | 200GB |
| Message Service (x3) | 1 Core | 2GB | 10GB |
| Eureka Server (x3) | 1 Core | 1GB | 10GB |
| **Total** | **24 Cores** | **48GB** | **680GB** |

## 🔐 보안 설정

### Kafka 보안

#### SSL/TLS 설정
```yaml
kafka:
  properties:
    security.protocol: SSL
    ssl.truststore.location: /path/to/kafka.client.truststore.jks
    ssl.truststore.password: ${TRUSTSTORE_PASSWORD}
    ssl.keystore.location: /path/to/kafka.client.keystore.jks
    ssl.keystore.password: ${KEYSTORE_PASSWORD}
```

#### SASL 인증
```yaml
kafka:
  properties:
    security.protocol: SASL_SSL
    sasl.mechanism: PLAIN
    sasl.jaas.config: org.apache.kafka.common.security.plain.PlainLoginModule required username="${KAFKA_USERNAME}" password="${KAFKA_PASSWORD}";
```

### 데이터베이스 보안

```yaml
spring:
  datasource:
    url: jdbc:mariadb://${DB_HOST}:${DB_PORT}/${DB_NAME}?useSSL=true&requireSSL=true
    hikari:
      leak-detection-threshold: 60000
```

## 📈 모니터링 메트릭

### Kafka 메트릭

- Consumer Lag
- Messages per Second
- Partition Distribution
- Replication Status
- Broker Health

### Application 메트릭

- Request Rate
- Response Time
- Error Rate
- JVM Memory Usage
- Thread Pool Status

### 데이터베이스 메트릭

- Connection Pool Size
- Query Execution Time
- Slow Queries
- Replication Lag
- Disk Usage

## 🔄 백업 및 복구

### Kafka 데이터 백업

```bash
# Kafka 데이터 디렉토리 백업
docker exec kafka tar -czf /tmp/kafka-data-backup.tar.gz /var/lib/kafka/data

# 호스트로 복사
docker cp kafka:/tmp/kafka-data-backup.tar.gz ./backups/
```

### MariaDB 백업

```bash
# 데이터베이스 백업
docker exec mariadb-message mysqldump -urozeta -prozeta123 \
  --single-transaction --routines --triggers \
  message-db > message-db-backup-$(date +%Y%m%d).sql
```

### 복구

```bash
# Kafka 데이터 복구
docker cp ./backups/kafka-data-backup.tar.gz kafka:/tmp/
docker exec kafka tar -xzf /tmp/kafka-data-backup.tar.gz -C /

# MariaDB 복구
docker exec -i mariadb-message mysql -urozeta -prozeta123 message-db < message-db-backup-20250109.sql
```

## 🎓 베스트 프랙티스

### 1. Kafka 사용

- ✅ 이벤트는 작고 명확하게
- ✅ Consumer Idempotency 구현
- ✅ 적절한 파티션 키 선택
- ✅ Dead Letter Queue 설정
- ❌ 대용량 메시지 전송 지양

### 2. 데이터베이스

- ✅ Connection Pool 적절히 설정
- ✅ 인덱스 최적화
- ✅ N+1 쿼리 방지
- ✅ 트랜잭션 범위 최소화
- ❌ JPA Lazy Loading 남용 금지

### 3. 마이크로서비스

- ✅ Service 간 느슨한 결합
- ✅ Circuit Breaker 패턴 적용
- ✅ Graceful Shutdown 구현
- ✅ Health Check 엔드포인트 제공
- ❌ Synchronous 호출 최소화

## 📞 문제 해결 체크리스트

### Kafka 문제
- [ ] Kafka 컨테이너 실행 확인
- [ ] Zookeeper 연결 상태 확인
- [ ] 토픽 존재 여부 확인
- [ ] Consumer Group 상태 확인
- [ ] Network 연결 확인

### 서비스 등록 문제
- [ ] Eureka Server 실행 확인
- [ ] 네트워크 설정 확인
- [ ] 서비스 설정 파일 확인
- [ ] 로그에서 에러 메시지 확인
- [ ] Health Check 상태 확인

### 데이터베이스 문제
- [ ] MariaDB 컨테이너 실행 확인
- [ ] 접속 정보 확인
- [ ] 데이터베이스 존재 여부 확인
- [ ] Connection Pool 상태 확인
- [ ] 디스크 공간 확인

---

**Last Updated**: 2025-01-09
**Version**: 1.0.0
