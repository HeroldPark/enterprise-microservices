package com.enterprise.mqtt.service;

import com.amazonaws.services.iot.client.AWSIotException;
import com.amazonaws.services.iot.client.AWSIotMessage;
import com.amazonaws.services.iot.client.AWSIotMqttClient;
import com.amazonaws.services.iot.client.AWSIotQos;
import com.enterprise.mqtt.dto.MqttMessage;
import com.enterprise.mqtt.dto.PublishRequest;
import com.enterprise.mqtt.dto.PublishResponse;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * MQTT Publish Service
 * 디바이스로 MQTT 메시지 송신
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class MqttPublishService {

    private final AWSIotMqttClient awsIotMqttClient;

    @Value("${aws.iot.publish-topics.request}")
    private String requestTopicPrefix;

    @Value("${aws.iot.publish-topics.response}")
    private String responseTopicPrefix;

    @Value("${aws.iot.publish-topics.test}")
    private String testTopicPrefix;

    /**
     * MQTT 메시지 발행
     */
    public PublishResponse publishMessage(PublishRequest request) {
        String messageId = UUID.randomUUID().toString();
        
        try {
            // 토픽 생성
            String topic = buildTopic(request.getTopicType(), request.getDeviceId());
            
            // QoS 설정
            AWSIotQos qos = AWSIotQos.valueOf("QOS" + request.getQos());
            
            // MQTT 메시지 생성
            AWSIotMessage message = new AWSIotMessage(topic, qos, request.getPayload());
            
            // 메시지 발행
            awsIotMqttClient.publish(message);
            
            log.info("Successfully published MQTT message - Topic: {}, Device ID: {}, Message Type: {}", 
                    topic, request.getDeviceId(), request.getMessageType());
            
            return PublishResponse.builder()
                    .success(true)
                    .messageId(messageId)
                    .topic(topic)
                    .deviceId(request.getDeviceId())
                    .messageType(request.getMessageType())
                    .publishedAt(LocalDateTime.now())
                    .build();
                    
        } catch (AWSIotException e) {
            log.error("Failed to publish MQTT message - Device ID: {}", request.getDeviceId(), e);
            
            return PublishResponse.builder()
                    .success(false)
                    .messageId(messageId)
                    .deviceId(request.getDeviceId())
                    .messageType(request.getMessageType())
                    .publishedAt(LocalDateTime.now())
                    .errorMessage(e.getMessage())
                    .build();
        }
    }

    /**
     * Echo 메시지 발행 (디바이스 테스트용)
     */
    public PublishResponse publishEchoMessage(String deviceId, String payload, Integer qos) {
        PublishRequest request = PublishRequest.builder()
                .deviceId(deviceId)
                .messageType(MqttMessage.MessageType.ECHO)
                .payload(payload)
                .qos(qos != null ? qos : 0)
                .topicType(PublishRequest.TopicType.REQUEST)
                .build();
        
        return publishMessage(request);
    }

    /**
     * FOTA 메시지 발행
     */
    public PublishResponse publishFotaMessage(String deviceId, String payload) {
        PublishRequest request = PublishRequest.builder()
                .deviceId(deviceId)
                .messageType(MqttMessage.MessageType.FOTA)
                .payload(payload)
                .qos(0)
                .topicType(PublishRequest.TopicType.REQUEST)
                .build();
        
        return publishMessage(request);
    }

    /**
     * Reboot 메시지 발행
     */
    public PublishResponse publishRebootMessage(String deviceId, String payload) {
        PublishRequest request = PublishRequest.builder()
                .deviceId(deviceId)
                .messageType(MqttMessage.MessageType.REBOOT)
                .payload(payload)
                .qos(0)
                .topicType(PublishRequest.TopicType.REQUEST)
                .build();
        
        return publishMessage(request);
    }

    /**
     * NTP 메시지 발행
     */
    public PublishResponse publishNtpMessage(String deviceId, String payload) {
        PublishRequest request = PublishRequest.builder()
                .deviceId(deviceId)
                .messageType(MqttMessage.MessageType.NTP)
                .payload(payload)
                .qos(0)
                .topicType(PublishRequest.TopicType.REQUEST)
                .build();
        
        return publishMessage(request);
    }

    /**
     * 토픽 생성 헬퍼 메서드
     */
    private String buildTopic(PublishRequest.TopicType topicType, String deviceId) {
        String prefix = switch (topicType) {
            case REQUEST -> requestTopicPrefix;
            case RESPONSE -> responseTopicPrefix;
            case TEST -> testTopicPrefix;
        };
        
        return prefix + "/" + deviceId;
    }
}
