package com.enterprise.mqtt.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * MQTT Publish 요청 DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class PublishRequest {
    
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
    @NotBlank(message = "Message payload is required")
    private String payload;
    
    /**
     * QoS 레벨 (기본값: 0)
     */
    @Builder.Default
    private Integer qos = 0;
    
    /**
     * 토픽 타입 (REQUEST: A0, RESPONSE: B0, TEST: B1)
     */
    @Builder.Default
    private TopicType topicType = TopicType.REQUEST;
    
    /**
     * 토픽 타입 Enum
     */
    public enum TopicType {
        REQUEST("A0"),
        RESPONSE("B0"),
        TEST("B1");
        
        private final String suffix;
        
        TopicType(String suffix) {
            this.suffix = suffix;
        }
        
        public String getSuffix() {
            return suffix;
        }
    }
}
