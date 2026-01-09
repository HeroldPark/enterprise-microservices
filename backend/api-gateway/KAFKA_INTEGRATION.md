# API Gateway with Kafka Integration

## 📋 개요

Spring Cloud Gateway 기반 API Gateway에 Kafka 이벤트 발행 기능이 통합되었습니다.

### 주요 기능

✅ **요청/응답 로깅**: 모든 API 요청과 응답을 Kafka로 전송  
✅ **인증 이벤트**: 로그인, 로그아웃, 인증 실패 이벤트 발행  
✅ **API 통계**: API 호출 통계 및 성능 메트릭 수집  
✅ **에러 로깅**: Gateway에서 발생한 모든 에러 기록  
✅ **비동기 처리**: Kafka를 통한 비동기 이벤트 발행으로 성능 영향 최소화

## 🎯 Kafka 토픽

| 토픽명 | 파티션 | 설명 |
|--------|--------|------|
| gateway.request | 3 | API 요청 정보 |
| gateway.response | 3 | API 응답 정보 |
| gateway.auth.event | 3 | 인증 관련 이벤트 |
| gateway.api.stats | 3 | API 통계 정보 |
| gateway.rate.limit | 3 | Rate Limit 초과 |
| gateway.error.log | 3 | 에러 로그 |

## 📦 프로젝트 구조

```
api-gateway/
├── src/main/java/com/enterprise/gateway/
│   ├── config/
│   │   ├── KafkaTopicConfig.java        # Kafka 토픽 설정
│   │   ├── KafkaProducerConfig.java     # Kafka Producer 설정
│   │   ├── GatewayConfig.java           # Gateway 기본 설정
│   │   └── SecurityConfig.java          # 보안 설정
│   ├── dto/event/
│   │   ├── GatewayRequestEvent.java     # 요청 이벤트 DTO
│   │   ├── GatewayResponseEvent.java    # 응답 이벤트 DTO
│   │   ├── AuthEvent.java               # 인증 이벤트 DTO
│   │   └── ApiStatsEvent.java           # API 통계 DTO
│   ├── filter/
│   │   ├── GatewayLoggingFilter.java    # Kafka 로깅 필터
│   │   └── JwtAuthenticationFilter.java # JWT 인증 필터
│   ├── service/
│   │   └── GatewayEventProducer.java    # Kafka 이벤트 발행 서비스
│   └── util/
│       └── JwtUtil.java                 # JWT 유틸리티
└── src/main/resources/
    └── application.yml                   # 설정 파일
```

## 🔧 설정

### application.yml

```yaml
spring:
  kafka:
    bootstrap-servers: ${KAFKA_BOOTSTRAP_SERVERS:kafka:9092}
    producer:
      key-serializer: org.apache.kafka.common.serialization.StringSerializer
      value-serializer: org.springframework.kafka.support.serializer.JsonSerializer
      acks: all
      retries: 3
    topic:
      gateway-request: gateway.request
      gateway-response: gateway.response
      auth-event: gateway.auth.event
      api-stats: gateway.api.stats
      rate-limit: gateway.rate.limit
      error-log: gateway.error.log

gateway:
  logging:
    enabled: true
    log-request: true
    log-response: true
    log-auth-events: true
    kafka-enabled: true
```

### Docker 환경 변수

```yaml
environment:
  KAFKA_BOOTSTRAP_SERVERS: kafka:9092
  EUREKA_CLIENT_SERVICEURL_DEFAULTZONE: http://eureka-server:8761/eureka/
```

## 🚀 실행 방법

### 1. Kafka 및 Eureka 실행

```bash
# Docker Compose로 전체 인프라 실행
docker-compose up -d
```

### 2. Kafka 토픽 생성

```bash
# Windows
init-kafka-topics.bat

# Linux/Mac
bash init-kafka-topics.sh

# PowerShell
.\init-kafka-topics.ps1
```

### 3. API Gateway 실행

```bash
# Gradle로 빌드 및 실행
./gradlew bootRun

# 또는 Docker로 실행
docker-compose up -d api-gateway
```

## 📊 이벤트 구조

### 1. Gateway Request Event

```json
{
  "requestId": "550e8400-e29b-41d4-a716-446655440000",
  "method": "GET",
  "path": "/api/users/123",
  "queryString": "includeDetails=true",
  "headers": {
    "User-Agent": "Mozilla/5.0...",
    "Accept": "application/json"
  },
  "sourceIp": "192.168.1.100",
  "userAgent": "Mozilla/5.0...",
  "userId": "user123",
  "targetService": "user-service",
  "targetPath": "/users/123",
  "timestamp": "2025-01-09T12:34:56",
  "eventType": "GATEWAY_REQUEST"
}
```

### 2. Gateway Response Event

```json
{
  "requestId": "550e8400-e29b-41d4-a716-446655440000",
  "statusCode": 200,
  "statusMessage": "OK",
  "responseTimeMs": 145,
  "contentLength": 1024,
  "method": "GET",
  "path": "/api/users/123",
  "targetService": "user-service",
  "success": true,
  "errorMessage": null,
  "timestamp": "2025-01-09T12:34:56",
  "eventType": "GATEWAY_RESPONSE"
}
```

### 3. Auth Event

```json
{
  "userId": "user123",
  "username": "john.doe@example.com",
  "action": "LOGIN_SUCCESS",
  "sourceIp": "192.168.1.100",
  "userAgent": "Mozilla/5.0...",
  "path": "/api/auth/login",
  "reason": null,
  "timestamp": "2025-01-09T12:34:56",
  "eventType": "AUTH_EVENT"
}
```

## 🔍 모니터링

### Kafka UI에서 확인

```
http://localhost:8090
```

1. **Topics** 메뉴 클릭
2. `gateway.request`, `gateway.response` 등 선택
3. **Messages** 탭에서 실시간 이벤트 확인

### Consumer 예제

```java
@KafkaListener(topics = "gateway.request", groupId = "analytics-service")
public void consumeGatewayRequest(GatewayRequestEvent event) {
    log.info("Received request: {} {} from {}", 
        event.getMethod(), event.getPath(), event.getSourceIp());
    
    // 분석 로직 처리
    analyticsService.recordApiCall(event);
}
```

## 📈 활용 사례

### 1. 실시간 모니터링 대시보드

```java
@Service
public class ApiMonitoringService {
    
    @KafkaListener(topics = "gateway.response")
    public void trackResponse(GatewayResponseEvent event) {
        // 실시간 대시보드 업데이트
        dashboardService.updateMetrics(
            event.getPath(),
            event.getResponseTimeMs(),
            event.getStatusCode()
        );
    }
}
```

### 2. 보안 이상 탐지

```java
@Service
public class SecurityMonitoringService {
    
    @KafkaListener(topics = "gateway.auth.event")
    public void detectAnomalies(AuthEvent event) {
        if ("LOGIN_FAILED".equals(event.getAction())) {
            // 로그인 실패 횟수 추적
            failureTracker.increment(event.getSourceIp());
            
            // 임계값 초과시 알람
            if (failureTracker.count(event.getSourceIp()) > 5) {
                alertService.sendAlert("Possible brute force attack from " + event.getSourceIp());
            }
        }
    }
}
```

### 3. API 사용 통계

```java
@Service
public class UsageAnalyticsService {
    
    @KafkaListener(topics = "gateway.request")
    public void trackUsage(GatewayRequestEvent event) {
        // 시간대별 사용량 집계
        timeSeriesRepository.increment(
            event.getTargetService(),
            event.getPath(),
            LocalDateTime.now().truncatedTo(ChronoUnit.HOURS)
        );
    }
}
```

### 4. 에러 추적 및 알람

```java
@Service
public class ErrorTrackingService {
    
    @KafkaListener(topics = "gateway.error.log")
    public void trackErrors(ErrorLogEvent event) {
        // 에러 로그 저장
        errorRepository.save(event);
        
        // 5xx 에러 발생시 즉시 알람
        if (event.getStatusCode() >= 500) {
            slackService.sendAlert(
                "🚨 Server Error: " + event.getPath() + 
                " - " + event.getErrorMessage()
            );
        }
    }
}
```

## 🎯 성능 고려사항

### 비동기 처리

모든 Kafka 이벤트 발행은 비동기로 처리되어 Gateway 성능에 영향을 최소화합니다.

```java
// 비동기 발행 (성능 영향 없음)
CompletableFuture<SendResult<String, Object>> future = 
    kafkaTemplate.send(topic, key, event);
```

### 배치 처리

Kafka Producer는 자동으로 배치 처리를 수행합니다:

```yaml
spring:
  kafka:
    producer:
      batch-size: 16384      # 16KB 배치
      linger-ms: 10          # 10ms 대기
      compression-type: snappy  # 압축 사용
```

## 🔐 보안

### 민감 정보 제외

Authorization 헤더, Cookie 등 민감한 정보는 Kafka로 전송되지 않습니다:

```java
private boolean isSensitiveHeader(String headerName) {
    String lowerName = headerName.toLowerCase();
    return lowerName.contains("authorization") || 
           lowerName.contains("cookie") || 
           lowerName.contains("token") ||
           lowerName.contains("password");
}
```

## 📚 관련 문서

- **QUICK_START.md** - 빠른 시작 가이드
- **DOCKER_GUIDE.md** - Docker 실행 가이드
- **KAFKA_KRAFT_GUIDE.md** - Kafka KRaft 모드 설명

## 🐛 문제 해결

### Kafka 연결 실패

```bash
# Kafka 상태 확인
docker-compose ps kafka

# Kafka 로그 확인
docker-compose logs -f kafka

# Gateway 로그 확인
docker-compose logs -f api-gateway
```

### 이벤트가 발행되지 않음

```yaml
# application.yml에서 로깅 활성화 확인
gateway:
  logging:
    enabled: true
    kafka-enabled: true

# 로그 레벨 확인
logging:
  level:
    com.enterprise.gateway: DEBUG
```

## ✅ 테스트

### API 호출 테스트

```bash
# 요청 전송
curl http://localhost:8080/api/users/123 \
  -H "Authorization: Bearer eyJhbGciOiJIUzUxMiJ9.eyJyb2xlIjoiQURNSU4iLCJzdWIiOiJhZG1pbiIsImlhdCI6MTc2NzkxOTUwNiwiZXhwIjoxNzY4MDA1OTA2fQ.xFOkthTirzrl_evEE-SZsh0K7ZZczOHLTQEegKNcD3V0Y-JV2o5KmftWF5RMAufOje7-_eFW4U0yqPr529kFqw"

# Kafka UI에서 확인
# http://localhost:8090
# Topics → gateway.request → Messages
```

---

**Last Updated**: 2025-01-09  
**Version**: 1.0.0
