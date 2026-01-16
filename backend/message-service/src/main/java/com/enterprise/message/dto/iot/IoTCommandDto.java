package com.enterprise.message.dto.iot;

import com.fasterxml.jackson.annotation.JsonInclude;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * IoT 디바이스 명령 DTO
 * message-service에서 Kafka를 통해 mqtt-service로 전송
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class IoTCommandDto {
    
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
    private IoTDeviceMessageDto.MessageType messageType;
    
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
     * 토픽 타입 (REQUEST, RESPONSE, TEST)
     */
    @Builder.Default
    private String topicType = "REQUEST";
    
    /**
     * 명령 생성 시각
     */
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
    
    /**
     * 발신 서비스명
     */
    @Builder.Default
    private String sourceService = "message-service";
}
