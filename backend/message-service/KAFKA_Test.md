# 1) Kafka 토픽 생성 (한 번만)
docker exec -it kafka kafka-topics --bootstrap-server kafka:9092 \
  --create --topic message-events --partitions 1 --replication-factor 1


이미 있으면 “Topic already exists” 경고 뜰 수 있는데 무시하면 됩니다.

토픽 확인:

docker exec -it kafka kafka-topics --bootstrap-server kafka:9092 --list

# 2) Consumer 실행 (터미널 1)
docker exec -it kafka kafka-console-consumer --bootstrap-server kafka:9092 \
  --topic message-events --from-beginning

# 3) Producer 실행 (터미널 2)
docker exec -it kafka kafka-console-producer --bootstrap-server kafka:9092 \
  --topic message-events


프로듀서 창에서 한 줄 입력:

{"type":"PING","ts":1704790000}


→ 컨슈머 창에 그대로 찍히면 Kafka 자체 송수신 OK.

# 4) “서비스까지” 붙어서 되는지 확인(진짜 E2E)

message-service가 message-events를 consume 하도록 구현되어 있다면:

위 Producer로 이벤트 발행

message-service 로그 확인:

docker compose logs -f message-service

여기서 consume 로그/처리 로그가 찍히면 서비스 연동까지 OK입니다.


----------------------------------------------------------------------------------------------------


“제대로” message-service에 찍히게 테스트하는 방법 (권장 루트)

아래 순서로 하면 원인이 바로 갈립니다.

A) message-service가 구독하는 토픽으로 보내기

1. message-service가 구독하는 토픽명(설정)을 확인

	- message-service의 application.yml 또는 config-server의 message-service.yml에 있는 토픽 키를 확인하세요.

2. 그 토픽으로 producer 실행
```
docker exec -it kafka kafka-console-producer --bootstrap-server kafka:9092 --topic <서비스가-구독하는-토픽>
```

3. 서비스가 기대하는 JSON 형태로 한 줄 입력
예시(대부분 이런 구조로 기대):
```
{"messageId":1,"senderId":1,"receiverId":2,"content":"PING","createdAt":"2026-01-09T17:29:00","eventType":"MESSAGE_CREATED","eventTimestamp":"2026-01-09T17:29:00"}
```

B) message-events 하나로 통일하고 싶으면

그럴 땐 message-service도 message-events를 구독하게 바꾸고,

eventType 같은 필드로 분기 처리하거나

type header를 쓰는 방식으로 다형 역직렬화를 맞추는 식으로 가야 합니다.

추가 체크(자주 놓치는 것)

message-service가 kafka보다 먼저 떠서 초기 연결에 실패하고(특히 재시도/auto-start 설정에 따라) 구독이 안 걸린 경우가 있습니다.
업로드된 docker-compose.yml 기준으로는 message-service가 DB/Eureka만 depends_on 되어 있습니다. 

docker-compose


→ depends_on: kafka (healthy)를 추가하면 이런 류가 줄어듭니다.

------------------------------------------------------------------------------------------------------------------------

현재 message-service가 “구독(subscribe)”하도록 설정된 토픽은 application.yml에 3개가 잡혀있습니다. (하지만 실제로 구독하는지는 코드에 Kafka consumer(@KafkaListener 등)가 있느냐로 결정됩니다.)

1) 설정상(의도된) 구독 토픽

application.yml 기준으로 토픽 이름은 아래 3개입니다. 

	- message.created
	- message.read
	- message.deleted

그리고 consumer group-id는 message-service-group 입니다. 

application

즉, 테스트를 하려면 지금처럼 message-events가 아니라 message.created / message.read / message.deleted 로 produce 하는 게 맞습니다.

2) 그런데 “왜 message-service 로그에 안 찍히나?”

제가 업로드된 message-service.zip 내부를 확인해보면, KafkaListener/consumer 코드가 아예 없는 상태라서(= 실제 구독자가 없음) 토픽에 메시지를 넣어도 서비스 로그에 찍히지 않는 상태일 가능성이 큽니다.
설정만 있고, 실제로 Kafka를 consume하는 코드가 없으면 consumer group도 생성되지 않고, 당연히 로그도 안 뜹니다.

바로 확인하는 방법(가장 확실)

Kafka 컨테이너에서 consumer group 존재 여부 확인:
```
docker exec -it kafka kafka-consumer-groups --bootstrap-server kafka:9092 --list
```

여기서 message-service-group 이 안 나오면 → message-service가 현재 Kafka를 “구독”하고 있지 않은 겁니다.

또는 상세:
```
docker exec -it kafka kafka-consumer-groups --bootstrap-server kafka:9092 --describe --group message-service-group
```

3) 토픽/메시지 테스트(설정 토픽으로 보내기)

토픽 리스트 확인:
```
docker exec -it kafka kafka-topics --bootstrap-server kafka:9092 --list
```

예: message.created로 produce:
```
docker exec -it kafka kafka-console-producer --bootstrap-server kafka:9092 --topic message.created
>{"type":"MESSAGE_CREATED","senderId":1,"receiverId":2,"content":"hello","ts":1704790000}
```

consumer로 확인:
```
docker exec -it kafka kafka-console-consumer --bootstrap-server kafka:9092 --topic message.created --from-beginning
```

4) message-service가 진짜 구독하게 만들려면(예시)

message.created를 실제로 소비하려면 message-service에 이런 식의 리스너가 있어야 합니다:
```
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Slf4j
@Component
public class MessageEventConsumer {

  @KafkaListener(
      topics = "${kafka.topic.message-created}",
      groupId = "${kafka.consumer.group-id}"
  )
  public void onCreated(String payload) {
    log.info("[KAFKA] message.created payload={}", payload);
  }
}
```