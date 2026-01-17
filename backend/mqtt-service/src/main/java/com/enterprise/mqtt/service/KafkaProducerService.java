package com.enterprise.mqtt.service;

import com.enterprise.mqtt.dto.MqttMessage;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.support.SendResult;
import org.springframework.stereotype.Service;

import java.util.concurrent.CompletableFuture;

/**
 * Kafka Producer Service
 * MQTT 메시지를 Kafka로 전달 (JSON 직렬화)
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class KafkaProducerService {

    // ✅ Qualifier로 명시적으로 Bean 지정
    private final KafkaTemplate<String, String> kafkaTemplate;
    private final ObjectMapper objectMapper;

    @Value("${kafka.topics.mqtt-message}")
    private String mqttMessageTopic;

    @Value("${kafka.topics.device-data}")
    private String deviceDataTopic;

    @Value("${kafka.topics.device-request}")
    private String deviceRequestTopic;

    @Value("${kafka.topics.device-response}")
    private String deviceResponseTopic;

    @Value("${kafka.topics.fota}")
    private String fotaTopic;

    @Value("${kafka.topics.reboot}")
    private String rebootTopic;

    @Value("${kafka.topics.text}")
    private String textTopic;

    /**
     * MQTT 메시지를 Kafka로 전송
     * 메시지 타입에 따라 적절한 토픽으로 라우팅
     */
    public void sendMqttMessage(MqttMessage message) {
        try {
            String jsonMessage = objectMapper.writeValueAsString(message);
            String topic = determineKafkaTopic(message.getMessageType());

            if (log.isDebugEnabled()) {
                String prettyJson = objectMapper.writerWithDefaultPrettyPrinter()
                        .writeValueAsString(objectMapper.readTree(jsonMessage));
                log.debug("Sending message to Kafka topic: {}", topic);
                log.debug("Sending message to Kafka message:\n{}", prettyJson);
            }

            CompletableFuture<SendResult<String, String>> future = kafkaTemplate.send(topic, message.getDeviceId(),
                    jsonMessage);

            future.whenComplete((result, ex) -> {
                if (ex == null) {
                    log.info("Successfully sent message to Kafka - Topic: {}, Partition: {}, Offset: {}",
                            topic,
                            result.getRecordMetadata().partition(),
                            result.getRecordMetadata().offset());
                } else {
                    log.error("Failed to send message to Kafka - Topic: {}", topic, ex);
                }
            });

        } catch (JsonProcessingException e) {
            log.error("Failed to serialize MQTT message to JSON", e);
        }
    }

    /**
     * 메시지 타입에 따른 Kafka 토픽 결정
     */
    private String determineKafkaTopic(MqttMessage.MessageType messageType) {
        if (messageType == null) {
            return mqttMessageTopic;
        }

        return switch (messageType) {
            case PERIODIC, DISCRETE, ECHO -> deviceDataTopic;
            case REQUEST -> deviceRequestTopic;
            case RESPONSE -> deviceResponseTopic;
            case FOTA -> fotaTopic;
            case REBOOT -> rebootTopic;
            case PLAINTEXT -> textTopic;
            default -> mqttMessageTopic;
        };
    }
}
