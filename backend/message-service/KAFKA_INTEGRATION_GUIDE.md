# Kafka Integration Guide - Message Service

## 빠른 시작

### 1단계: Kafka 환경 구성

```bash
# Docker Compose로 Kafka 실행
docker-compose -f docker-compose-kafka.yml up -d

# 상태 확인
docker-compose -f docker-compose-kafka.yml ps
```

### 2단계: 애플리케이션 실행

```bash
# 빌드
./gradlew clean build

# 실행
./gradlew bootRun
```

### 3단계: 테스트

```bash
# 메시지 생성 이벤트 테스트
curl -X POST "http://localhost:8086/api/kafka-test/message-created?messageId=1&senderId=100&receiverId=200&content=HelloKafka"

# 메시지 읽음 이벤트 테스트
curl -X POST "http://localhost:8086/api/kafka-test/message-read?messageId=1&receiverId=200"

# 메시지 삭제 이벤트 테스트
curl -X POST "http://localhost:8086/api/kafka-test/message-deleted?messageId=1&senderId=100&receiverId=200"
```

## 실제 사용 시나리오

### 시나리오 1: 실시간 알림 시스템

**요구사항**: 사용자가 메시지를 받으면 즉시 푸시 알림 전송

**구현**:

```java
@Service
public class NotificationService {
    
    @KafkaListener(topics = "message.created")
    public void handleMessageCreated(MessageCreatedEvent event) {
        // 1. 수신자 정보 조회
        User receiver = userService.getUser(event.getReceiverId());
        
        // 2. 푸시 알림 생성
        PushNotification notification = PushNotification.builder()
                .userId(receiver.getId())
                .title("새 메시지 도착")
                .body(event.getContent())
                .type("MESSAGE")
                .data(Map.of("messageId", event.getMessageId()))
                .build();
        
        // 3. FCM으로 푸시 전송
        fcmService.send(notification);
        
        log.info("Push notification sent to user: {}", receiver.getId());
    }
}
```

### 시나리오 2: 메시지 통계 및 분석

**요구사항**: 메시지 전송/수신 통계를 실시간으로 집계

**구현**:

```java
@Service
public class MessageAnalyticsService {
    
    private final MessageStatsRepository statsRepository;
    
    @KafkaListener(topics = "message.created")
    public void updateCreatedStats(MessageCreatedEvent event) {
        // 일별 통계 업데이트
        LocalDate today = LocalDate.now();
        MessageStats stats = statsRepository
                .findByDate(today)
                .orElse(new MessageStats(today));
        
        stats.incrementTotalMessages();
        stats.addSender(event.getSenderId());
        statsRepository.save(stats);
    }
    
    @KafkaListener(topics = "message.read")
    public void updateReadStats(MessageReadEvent event) {
        LocalDate today = LocalDate.now();
        MessageStats stats = statsRepository
                .findByDate(today)
                .orElse(new MessageStats(today));
        
        stats.incrementReadMessages();
        statsRepository.save(stats);
    }
}
```

### 시나리오 3: 읽음 확인 알림

**요구사항**: 메시지가 읽히면 발신자에게 알림

**구현**:

```java
@Service
public class ReadReceiptService {
    
    @KafkaListener(topics = "message.read")
    public void handleMessageRead(MessageReadEvent event) {
        // 1. 원본 메시지 조회
        Message message = messageRepository.findById(event.getMessageId())
                .orElseThrow();
        
        // 2. 발신자에게 읽음 확인 알림
        ReadReceipt receipt = ReadReceipt.builder()
                .messageId(event.getMessageId())
                .senderId(message.getSenderId())
                .readAt(event.getReadAt())
                .build();
        
        // 3. WebSocket으로 실시간 전송
        webSocketService.sendToUser(
                message.getSenderId(),
                "/topic/read-receipts",
                receipt
        );
        
        log.info("Read receipt sent to sender: {}", message.getSenderId());
    }
}
```

### 시나리오 4: 데이터 보관 및 백업

**요구사항**: 삭제된 메시지를 일정 기간 보관

**구현**:

```java
@Service
public class MessageArchiveService {
    
    @KafkaListener(topics = "message.deleted")
    public void archiveDeletedMessage(MessageDeletedEvent event) {
        // 1. 삭제된 메시지 정보를 아카이브 DB에 저장
        ArchivedMessage archived = ArchivedMessage.builder()
                .originalMessageId(event.getMessageId())
                .senderId(event.getSenderId())
                .receiverId(event.getReceiverId())
                .deletedAt(event.getDeletedAt())
                .retentionUntil(LocalDateTime.now().plusDays(30))
                .build();
        
        archiveRepository.save(archived);
        
        // 2. S3에 백업 (선택사항)
        s3Service.backup("deleted-messages", archived);
        
        log.info("Message archived: {}", event.getMessageId());
    }
}
```

## 성능 테스트

### 대량 메시지 처리 테스트

```bash
# 1000개의 메시지 이벤트 발행
curl -X POST "http://localhost:8086/api/kafka-test/bulk-test?count=1000"
```

**예상 결과**:
```
Sent 1000 events in 543 ms (1841.62 events/sec)
```

### 파티션별 분산 확인

Kafka UI (http://localhost:8090)에서 확인:
1. Topics → message.created 선택
2. Partitions 탭 확인
3. 각 파티션의 메시지 분포 확인

## 고급 설정

### 1. Consumer 그룹별 처리

여러 Consumer 그룹이 동일한 이벤트를 다르게 처리:

```yaml
# Notification Service
kafka:
  consumer:
    group-id: notification-service-group

# Analytics Service
kafka:
  consumer:
    group-id: analytics-service-group
```

### 2. 메시지 필터링

특정 조건의 메시지만 처리:

```java
@KafkaListener(topics = "message.created")
public void handleHighPriorityMessages(MessageCreatedEvent event) {
    // VIP 사용자의 메시지만 처리
    if (isVipUser(event.getSenderId()) || isVipUser(event.getReceiverId())) {
        processPriorityMessage(event);
    }
}
```

### 3. 에러 처리 및 재시도

```java
@KafkaListener(topics = "message.created")
public void handleWithRetry(MessageCreatedEvent event) {
    try {
        processEvent(event);
    } catch (RetryableException e) {
        // 재시도 가능한 에러 - 나중에 다시 처리
        throw e;
    } catch (Exception e) {
        // 재시도 불가능한 에러 - DLQ로 전송
        sendToDeadLetterQueue(event, e);
    }
}
```

## 모니터링 및 디버깅

### 1. Consumer Lag 모니터링

```bash
# Consumer 그룹의 지연(lag) 확인
docker exec -it kafka kafka-consumer-groups \
  --bootstrap-server localhost:9092 \
  --group message-service-group \
  --describe
```

**출력 예시**:
```
TOPIC           PARTITION  CURRENT-OFFSET  LOG-END-OFFSET  LAG
message.created 0          1500            1500            0
message.created 1          1498            1500            2
message.created 2          1502            1500            -2
```

### 2. 메시지 조회

```bash
# 특정 토픽의 메시지 조회 (처음부터)
docker exec -it kafka kafka-console-consumer \
  --bootstrap-server localhost:9092 \
  --topic message.created \
  --from-beginning
```

### 3. 애플리케이션 로그

```bash
# 실시간 로그 확인
tail -f logs/message-service.log | grep "Kafka\|Event"
```

## 문제 해결

### 문제 1: Consumer가 메시지를 소비하지 않음

**증상**: 이벤트는 발행되지만 Consumer가 처리하지 않음

**해결**:
1. Consumer 그룹 확인
2. 오프셋 리셋
```bash
kafka-consumer-groups --bootstrap-server localhost:9092 \
  --group message-service-group \
  --reset-offsets --to-earliest \
  --all-topics --execute
```

### 문제 2: 메시지 중복 처리

**증상**: 동일한 메시지가 여러 번 처리됨

**해결**:
1. Producer에서 멱등성 활성화 확인
2. Consumer에서 중복 체크 로직 추가
```java
@Service
public class DuplicateCheckService {
    private final Set<String> processedEvents = ConcurrentHashMap.newKeySet();
    
    public boolean isDuplicate(String eventId) {
        return !processedEvents.add(eventId);
    }
}
```

### 문제 3: 높은 Consumer Lag

**증상**: Consumer가 메시지 처리 속도가 느림

**해결**:
1. Consumer 동시성 증가
```java
factory.setConcurrency(5); // 5개 스레드로 증가
```

2. 파티션 수 증가
```java
TopicBuilder.name(topic).partitions(5).build();
```

## 프로덕션 체크리스트

- [ ] Kafka 클러스터 구성 (최소 3대)
- [ ] 레플리케이션 팩터 설정 (3 이상)
- [ ] 모니터링 도구 설정 (Prometheus, Grafana)
- [ ] 알림 설정 (Consumer Lag 임계치)
- [ ] 백업 및 복구 계획
- [ ] 보안 설정 (SSL/TLS, SASL)
- [ ] Dead Letter Queue 설정
- [ ] 로그 수집 및 분석 시스템

## 참고 자료

- [Kafka Best Practices](https://kafka.apache.org/documentation/#bestpractices)
- [Spring Kafka Documentation](https://docs.spring.io/spring-kafka/reference/html/)
- [Kafka Performance Tuning](https://kafka.apache.org/documentation/#producerconfigs)
