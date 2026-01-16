package com.enterprise.mqtt.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Kafka를 통해 수신한 MQTT 명령 DTO
 * message-service가 발행하고 mqtt-service가 구독
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class MqttCommandDto {
    
    /**
     * 명령 ID
     */
    private String commandId;
    
    /**
     * 대상 디바이스 ID
     */
    @NotBlank(message = "Device ID is required")
    private String deviceId;
    
    /**
     * 메시지 타입
     */
    @NotNull(message = "Message type is required")
    private MqttMessage.MessageType messageType;
    
    /**
     * 메시지 페이로드 (Base64 인코딩된 문자열)
     */
    @NotBlank(message = "Payload is required")
    private String payload;
    
    /**
     * QoS 레벨 (0, 1, 2)
     */
    @Builder.Default
    private Integer qos = 0;
    
    /**
     * 발행할 토픽 타입 (REQUEST: A0, RESPONSE: B0, TEST: B1)
     */
    @Builder.Default
    private String topicType = "REQUEST";
    
    /**
     * 명령 생성 시각
     */
    private LocalDateTime createdAt;
    
    /**
     * 발신 서비스명
     */
    private String sourceService;
}
