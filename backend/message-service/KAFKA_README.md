# Message Service - Kafka Integration

## 개요

Message Service에 Apache Kafka를 통한 이벤트 기반 메시징 기능이 추가되었습니다. 메시지 생성, 읽음 처리, 삭제 등의 이벤트를 비동기로 발행하고 처리합니다.

## 주요 기능

### 1. Kafka 이벤트 타입

#### MessageCreatedEvent (메시지 생성)
- **Topic**: `message.created`
- **발행 시점**: 새로운 메시지가 생성될 때
- **처리 내용**:
  - 푸시 알림 전송
  - 이메일 알림 (선택)
  - 통계 데이터 업데이트

#### MessageReadEvent (메시지 읽음)
- **Topic**: `message.read`
- **발행 시점**: 수신자가 메시지를 읽을 때
- **처리 내용**:
  - 발신자에게 읽음 확인 알림
  - 읽음 통계 업데이트

#### MessageDeletedEvent (메시지 삭제)
- **Topic**: `message.deleted`
- **발행 시점**: 메시지가 삭제될 때
- **처리 내용**:
  - 캐시 데이터 정리
  - 삭제 통계 업데이트

### 2. 아키텍처

```
┌─────────────────┐
│ Message Service │
└────────┬────────┘
         │
         ├─ MessageService (Business Logic)
         │  └─ MessageEventProducer (Kafka Producer)
         │
         └─ MessageEventConsumer (Kafka Consumer)
            ├─ 알림 처리
            ├─ 통계 업데이트
            └─ 데이터 동기화
```

## 설치 및 실행

### 1. Kafka 실행

Docker Compose를 사용하여 Kafka 환경을 구성합니다:

```bash
# Kafka, Kafka UI 실행
docker-compose -f docker-compose-kafka.yml up -d

# 로그 확인
docker-compose -f docker-compose-kafka.yml logs -f
```

실행 후 접속 정보:
- **Kafka Broker**: localhost:9093 (외부 접속)
- **Kafka UI**: http://localhost:8090
<!-- - **Zookeeper**: localhost:2181 -->

### 2. 서비스 빌드 및 실행

```bash
# Gradle 빌드
./gradlew clean build

# Spring Boot 애플리케이션 실행
./gradlew bootRun
```

## 설정

### application.yml

```yaml
kafka:
  bootstrap-servers: localhost:9092
  consumer:
    group-id: message-service-group
    auto-offset-reset: earliest
  producer:
    acks: all
    retries: 3
  topic:
    message-created: message.created
    message-read: message.read
    message-deleted: message.deleted
```

### 주요 설정 항목

- **bootstrap-servers**: Kafka 브로커 주소
- **group-id**: Consumer 그룹 ID
- **auto-offset-reset**: 새로운 Consumer의 오프셋 설정
- **acks**: Producer 응답 보장 레벨
- **retries**: 메시지 전송 실패 시 재시도 횟수

## API 사용 예시

### 1. 메시지 생성 (이벤트 발행)

```bash
curl -X POST http://localhost:8086/api/messages \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {token}" \
  -d '{
    "senderId": 1,
    "receiverId": 2,
    "content": "Hello, this is a test message"
  }'
```

**이벤트 흐름**:
1. 메시지 DB 저장
2. `MessageCreatedEvent` 발행 → `message.created` Topic
3. Consumer가 이벤트 수신
4. 푸시 알림 전송 및 통계 업데이트

### 2. 메시지 읽음 처리 (이벤트 발행)

```bash
curl -X PATCH http://localhost:8086/api/messages/{messageId}/read \
  -H "Authorization: Bearer {token}"
```

**이벤트 흐름**:
1. 메시지 읽음 상태 업데이트
2. `MessageReadEvent` 발행 → `message.read` Topic
3. Consumer가 이벤트 수신
4. 발신자에게 읽음 확인 알림

### 3. 메시지 삭제 (이벤트 발행)

```bash
curl -X DELETE http://localhost:8086/api/messages/{messageId} \
  -H "Authorization: Bearer {token}"
```

**이벤트 흐름**:
1. 메시지 DB 삭제
2. `MessageDeletedEvent` 발행 → `message.deleted` Topic
3. Consumer가 이벤트 수신
4. 캐시 정리 및 통계 업데이트

## 모니터링

### Kafka UI를 통한 모니터링

1. 브라우저에서 http://localhost:8090 접속
2. Topics 메뉴에서 메시지 토픽 확인
   - `message.created`
   - `message.read`
   - `message.deleted`
3. 각 토픽의 메시지, 파티션, Consumer Group 정보 확인

### 로그 모니터링

```bash
# 애플리케이션 로그에서 Kafka 관련 로그 확인
tail -f logs/message-service.log | grep -i kafka
```

주요 로그 메시지:
- `Sending message created event: messageId=XXX`
- `Message created event sent successfully: offset=XXX`
- `Received message created event from partition X, offset XXX`

## 성능 최적화

### 1. 파티션 설정

각 토픽은 3개의 파티션으로 구성되어 병렬 처리 가능:

```java
@Bean
public NewTopic messageCreatedTopic() {
    return TopicBuilder.name(messageCreatedTopic)
            .partitions(3)  // 3개 파티션
            .replicas(1)
            .build();
}
```

### 2. Consumer 동시성

Consumer는 3개의 스레드로 병렬 처리:

```java
factory.setConcurrency(3); // 3개의 Consumer 스레드
```

### 3. Producer 설정

- **acks=all**: 모든 레플리카 확인으로 안정성 보장
- **enable.idempotence=true**: 중복 메시지 방지
- **retries=3**: 실패 시 최대 3회 재시도

## 에러 처리

### 1. Producer 에러 처리

```java
future.whenComplete((result, ex) -> {
    if (ex == null) {
        log.info("Event sent successfully");
    } else {
        log.error("Failed to send event", ex);
        // DLQ(Dead Letter Queue)로 전송 또는 재시도
    }
});
```

### 2. Consumer 에러 처리

```java
try {
    // 이벤트 처리
    processEvent(event);
} catch (Exception e) {
    log.error("Error processing event", e);
    // 에러 핸들링 (재시도, DLQ 등)
}
```

## 확장 가능성

### 다른 서비스와의 연동

```yaml
# 알림 서비스가 메시지 생성 이벤트를 구독
notification-service:
  kafka:
    consumer:
      group-id: notification-service-group
      topics:
        - message.created
```

### 추가 이벤트 타입

필요에 따라 새로운 이벤트 타입 추가 가능:
- `MessageForwardedEvent`: 메시지 전달
- `MessageArchivedEvent`: 메시지 보관
- `MessageFlaggedEvent`: 메시지 신고

## 트러블슈팅

### Kafka 연결 오류

```
Error: Unable to connect to Kafka broker
```

**해결 방법**:
1. Kafka 컨테이너 실행 확인: `docker ps | grep kafka`
2. 네트워크 설정 확인: `docker network ls`
3. 포트 충돌 확인: `netstat -an | grep 9092`

### Consumer 그룹 리셋

```bash
# Consumer 그룹의 오프셋 리셋
kafka-consumer-groups --bootstrap-server localhost:9093 \
  --group message-service-group \
  --reset-offsets --to-earliest \
  --topic message.created \
  --execute
```

### 토픽 목록 확인

```bash
# 모든 토픽 목록 조회
kafka-topics --bootstrap-server localhost:9093 --list

# 특정 토픽 상세 정보
kafka-topics --bootstrap-server localhost:9093 \
  --describe --topic message.created
```

## 참고 자료

- [Apache Kafka Documentation](https://kafka.apache.org/documentation/)
- [Spring for Apache Kafka](https://spring.io/projects/spring-kafka)
- [Kafka UI](https://github.com/provectus/kafka-ui)

## 라이선스

MIT License
