package com.enterprise.mqtt.service;

import com.enterprise.mqtt.dto.MqttCommandDto;
import com.enterprise.mqtt.dto.MqttMessage;
import com.enterprise.mqtt.dto.PublishRequest;
import com.fasterxml.jackson.databind.ObjectMapper;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.support.KafkaHeaders;
import org.springframework.messaging.handler.annotation.Header;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Service;

/**
 * Kafka에서 MQTT 명령을 수신하여 IoT 디바이스로 전송
 * message-service → Kafka → mqtt-service → IoT Device
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class MqttCommandConsumer {

    private final MqttPublishService mqttPublishService;
    private final ObjectMapper objectMapper;

    /**
     * Kafka에서 MQTT 명령 수신
     * Topic: mqtt.command.topic
     */
    @KafkaListener(
            topics = "${kafka.topics.mqtt-command}",
            groupId = "${spring.kafka.consumer.group-id}",
            containerFactory = "kafkaListenerContainerFactory"
    )
    public void consumeMqttCommand(
            @Payload String commandJson,
            @Header(KafkaHeaders.RECEIVED_PARTITION) int partition,
            @Header(KafkaHeaders.OFFSET) long offset) {

        log.info("Received MQTT command from Kafka - Partition: {}, Offset: {}", partition, offset);
        log.debug("Command JSON: {}", commandJson);

        try {
            // JSON을 MqttCommandDto로 변환
            MqttCommandDto command = objectMapper.readValue(commandJson, MqttCommandDto.class);
            
            log.info("Processing MQTT command - Command ID: {}, Device ID: {}, Type: {}", 
                    command.getCommandId(), command.getDeviceId(), command.getMessageType());

            // PublishRequest 생성
            PublishRequest publishRequest = convertToPublishRequest(command);

            // MQTT 메시지 발행
            var response = mqttPublishService.publishMessage(publishRequest);

            if (response.isSuccess()) {
                log.info("Successfully published MQTT command to device - Command ID: {}, Device ID: {}", 
                        command.getCommandId(), command.getDeviceId());
            } else {
                log.error("Failed to publish MQTT command - Command ID: {}, Device ID: {}, Error: {}", 
                        command.getCommandId(), command.getDeviceId(), response.getErrorMessage());
            }

        } catch (Exception e) {
            log.error("Error processing MQTT command from Kafka", e);
        }
    }

    /**
     * MqttCommandDto를 PublishRequest로 변환
     */
    private PublishRequest convertToPublishRequest(MqttCommandDto command) {
        // topicType 문자열을 Enum으로 변환
        PublishRequest.TopicType topicType;
        try {
            topicType = PublishRequest.TopicType.valueOf(command.getTopicType().toUpperCase());
        } catch (Exception e) {
            log.warn("Invalid topic type: {}, using REQUEST as default", command.getTopicType());
            topicType = PublishRequest.TopicType.REQUEST;
        }

        return PublishRequest.builder()
                .deviceId(command.getDeviceId())
                .messageType(command.getMessageType())
                .payload(command.getPayload())
                .qos(command.getQos() != null ? command.getQos() : 0)
                .topicType(topicType)
                .build();
    }
}
