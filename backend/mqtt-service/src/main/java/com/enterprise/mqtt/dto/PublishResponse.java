package com.enterprise.mqtt.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * MQTT Publish 응답 DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class PublishResponse {
    
    /**
     * 성공 여부
     */
    private boolean success;
    
    /**
     * 메시지 ID
     */
    private String messageId;
    
    /**
     * 발행된 토픽
     */
    private String topic;
    
    /**
     * 디바이스 ID
     */
    private String deviceId;
    
    /**
     * 메시지 타입
     */
    private MqttMessage.MessageType messageType;
    
    /**
     * 발행 시각
     */
    private LocalDateTime publishedAt;
    
    /**
     * 에러 메시지 (실패 시)
     */
    private String errorMessage;
}
