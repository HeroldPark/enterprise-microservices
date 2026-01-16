# MQTT Service

IoT 디바이스와 AWS IoT Core를 통해 MQTT 통신을 처리하고, 수신한 메시지를 Kafka로 전달하는 마이크로서비스입니다.

## 주요 기능

- **MQTT 메시지 수신**: AWS IoT Core로부터 디바이스 메시지 수신
- **Kafka 메시지 전송**: 수신한 MQTT 메시지를 Kafka 토픽으로 전달
- **MQTT 메시지 발행**: 디바이스로 명령 메시지 송신
- **메시지 타입 지원**: PERIODIC, DISCRETE, REQUEST, RESPONSE, ECHO, FOTA, REBOOT, NTP
- **Service Discovery**: Eureka를 통한 서비스 등록 및 검색
- **Health Check**: Actuator를 통한 서비스 상태 모니터링

## 기술 스택

- **Java**: 21
- **Spring Boot**: 3.4.1
- **Spring Cloud**: 2024.0.0
- **AWS IoT SDK**: 1.3.9
- **Apache Kafka**: 3.x
- **Gradle**: 8.5

## 아키텍처

```
IoT Devices → AWS IoT Core → MQTT Service → Kafka → Other Services
                                ↓
                            Eureka Server
```

## 사전 요구사항

1. **AWS IoT Core 설정**
   - AWS IoT Thing 생성
   - 인증서 및 키 발급
   - IoT Policy 설정
   - IoT Endpoint 확인

2. **Kafka 설치**
   - Kafka 브로커 실행 중
   - 필요한 토픽 생성 (자동 생성 지원)

3. **Eureka Server** (선택사항)
   - Service Discovery를 사용하는 경우

## 설정

### 1. AWS IoT 인증서 설정

`certs/` 디렉토리에 다음 파일들을 배치:

```
certs/
├── certificate.pem.crt
└── private.pem.key
```

### 2. application.yml 설정

```yaml
aws:
  iot:
    endpoint: your-iot-endpoint.iot.region.amazonaws.com
    certificate-file: /path/to/certificate.pem.crt
    private-key-file: /path/to/private.pem.key
    subscribe-topics:
      - device/topic/+
    qos: 0

spring:
  kafka:
    bootstrap-servers: localhost:9092

kafka:
  topics:
    mqtt-message: mqtt.message.topic
    device-data: device.data.topic
    device-request: device.request.topic
    device-response: device.response.topic
```

## 실행 방법

### Gradle로 실행

```bash
./gradlew bootRun
```

### JAR 파일로 실행

```bash
./gradlew build
java -jar build/libs/mqtt-service-1.0.0.jar
```

### Docker로 실행

```bash
# 인증서 파일을 certs/ 디렉토리에 복사
cp /path/to/certificate.pem.crt certs/
cp /path/to/private.pem.key certs/

# Docker Compose로 실행
docker-compose up -d

# 로그 확인
docker-compose logs -f mqtt-service
```

## API 엔드포인트

### MQTT 메시지 발행

#### 일반 메시지 발행
```bash
POST /api/mqtt/publish
Content-Type: application/json

{
  "deviceId": "DEVICE_001",
  "messageType": "ECHO",
  "payload": "base64EncodedMessage",
  "qos": 0,
  "topicType": "REQUEST"
}
```

#### Echo 메시지 발행 (테스트용)
```bash
POST /api/mqtt/echo/{deviceId}
Content-Type: text/plain

base64EncodedMessage
```

#### FOTA 메시지 발행
```bash
POST /api/mqtt/fota/{deviceId}
Content-Type: text/plain

base64EncodedFotaMessage
```

#### Reboot 메시지 발행
```bash
POST /api/mqtt/reboot/{deviceId}
Content-Type: text/plain

base64EncodedRebootMessage
```

#### NTP 메시지 발행
```bash
POST /api/mqtt/ntp/{deviceId}
Content-Type: text/plain

base64EncodedNtpMessage
```

### Health Check
```bash
GET /api/mqtt/health
```

### Actuator Endpoints
```bash
GET /actuator/health
GET /actuator/info
GET /actuator/metrics
```

## Kafka Topics

서비스는 메시지 타입에 따라 다음 Kafka 토픽으로 메시지를 전달합니다:

| 메시지 타입 | Kafka Topic |
|------------|-------------|
| PERIODIC, DISCRETE, ECHO | device.data.topic |
| REQUEST | device.request.topic |
| RESPONSE | device.response.topic |
| FOTA | device.fota.topic |
| REBOOT | device.reboot.topic |
| 기타 | mqtt.message.topic |

## 메시지 타입

| 타입 | 코드 | 설명 |
|-----|------|------|
| PERIODIC | 0 | 주기적 데이터 |
| DISCRETE | 1 | 이벤트성 데이터 |
| REQUEST | 2 | 디바이스 등록 요청 |
| RESPONSE | 3 | 응답 |
| TEST | 4 | 테스트 |
| ECHO | 5 | Echo 테스트 |
| FOTA | 6 | 펌웨어 업데이트 |
| REBOOT | 7 | 재시작 |
| NTP | 8 | 시간 동기화 |

## 모니터링

### Kafka UI
Docker Compose로 실행 시 Kafka UI 접속:
```
http://localhost:8090
```

### Eureka Dashboard
```
http://localhost:8761
```

### Swagger UI
```
http://localhost:8088/swagger-ui.html
```

## 로깅

애플리케이션 로그 레벨은 `application.yml`에서 설정:

```yaml
logging:
  level:
    com.rozeta.mqtt: DEBUG
    org.springframework.kafka: INFO
    com.amazonaws.services.iot: INFO
```

## 트러블슈팅

### AWS IoT 연결 실패
1. 인증서 파일 경로 확인
2. AWS IoT Endpoint 확인
3. IoT Policy 권한 확인
4. Thing 이름 확인

### Kafka 연결 실패
1. Kafka 브로커 상태 확인
2. Bootstrap servers 설정 확인
3. 네트워크 연결 확인

### 메시지 수신 안됨
1. MQTT 토픽 구독 확인
2. IoT Policy에서 subscribe 권한 확인
3. 로그에서 에러 메시지 확인

## 개발 가이드

### 새로운 메시지 타입 추가

1. `MqttMessage.MessageType` enum에 타입 추가
2. `KafkaProducerService.determineKafkaTopic()`에서 토픽 매핑 추가
3. 필요시 새로운 Kafka Topic Bean 생성

### 새로운 API 엔드포인트 추가

1. `MqttPublishService`에 메서드 추가
2. `MqttController`에 엔드포인트 추가
3. Swagger 문서 업데이트

## 라이선스

Copyright (c) 2025 Rozeta

## 문의

기술 지원이 필요한 경우 개발팀에 문의하세요.
