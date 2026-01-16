package com.enterprise.message.kafka;

import com.enterprise.message.dto.iot.IoTCommandDto;
import com.enterprise.message.dto.iot.IoTDeviceMessageDto;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.support.SendResult;
import org.springframework.stereotype.Service;

import java.util.UUID;
import java.util.concurrent.CompletableFuture;

/**
 * IoT 명령 발행 서비스
 * message-service → Kafka → mqtt-service → IoT Device
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class IoTCommandProducer {

    private final KafkaTemplate<String, Object> kafkaTemplate;
    private final ObjectMapper objectMapper;

    @Value("${kafka.topic.mqtt-command}")
    private String mqttCommandTopic;

    /**
     * IoT 디바이스로 명령 전송
     */
    public CompletableFuture<SendResult<String, Object>> sendCommand(IoTCommandDto command) {
        try {
            // 명령 ID가 없으면 생성
            if (command.getCommandId() == null) {
                command.setCommandId(UUID.randomUUID().toString());
            }

            log.info("Sending IoT command to Kafka - Command ID: {}, Device: {}, Type: {}",
                    command.getCommandId(), command.getDeviceId(), command.getMessageType());

            // Kafka로 전송
            CompletableFuture<SendResult<String, Object>> future = kafkaTemplate.send(mqttCommandTopic,
                    command.getDeviceId(), command);

            future.whenComplete((result, ex) -> {
                if (ex == null) {
                    log.info("Successfully sent IoT command - Command ID: {}, Topic: {}, Partition: {}, Offset: {}",
                            command.getCommandId(),
                            mqttCommandTopic,
                            result.getRecordMetadata().partition(),
                            result.getRecordMetadata().offset());
                } else {
                    log.error("Failed to send IoT command - Command ID: {}", command.getCommandId(), ex);
                }
            });

            return future;

        } catch (Exception e) {
            log.error("Error sending IoT command", e);
            CompletableFuture<SendResult<String, Object>> failedFuture = new CompletableFuture<>();
            failedFuture.completeExceptionally(e);
            return failedFuture;
        }
    }

    /**
     * Echo 명령 전송 (테스트용)
     */
    public CompletableFuture<SendResult<String, Object>> sendEchoCommand(
            String deviceId, String payload) {

        IoTCommandDto command = IoTCommandDto.builder()
                .deviceId(deviceId)
                .messageType(IoTDeviceMessageDto.MessageType.ECHO)
                .payload(payload)
                .qos(0)
                .topicType("REQUEST")
                .build();

        return sendCommand(command);
    }

    /**
     * FOTA 명령 전송
     */
    public CompletableFuture<SendResult<String, Object>> sendFotaCommand(
            String deviceId, String payload) {

        IoTCommandDto command = IoTCommandDto.builder()
                .deviceId(deviceId)
                .messageType(IoTDeviceMessageDto.MessageType.FOTA)
                .payload(payload)
                .qos(0)
                .topicType("REQUEST")
                .build();

        return sendCommand(command);
    }

    /**
     * Reboot 명령 전송
     */
    public CompletableFuture<SendResult<String, Object>> sendRebootCommand(
            String deviceId, String payload) {

        IoTCommandDto command = IoTCommandDto.builder()
                .deviceId(deviceId)
                .messageType(IoTDeviceMessageDto.MessageType.REBOOT)
                .payload(payload)
                .qos(0)
                .topicType("REQUEST")
                .build();

        return sendCommand(command);
    }

    /**
     * NTP 명령 전송
     */
    public CompletableFuture<SendResult<String, Object>> sendNtpCommand(
            String deviceId, String payload) {

        IoTCommandDto command = IoTCommandDto.builder()
                .deviceId(deviceId)
                .messageType(IoTDeviceMessageDto.MessageType.NTP)
                .payload(payload)
                .qos(0)
                .topicType("REQUEST")
                .build();

        return sendCommand(command);
    }
}
