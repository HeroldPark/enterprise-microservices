package com.enterprise.message.dto.iot;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * IoT 디바이스 메시지 DTO
 * mqtt-service에서 Kafka를 통해 수신
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class IoTDeviceMessageDto {
    
    /**
     * 메시지 ID
     */
    private String messageId;
    
    /**
     * MQTT 토픽
     */
    private String topic;
    
    /**
     * 메시지 타입
     */
    private MessageType messageType;
    
    /**
     * 디바이스 ID
     */
    private String deviceId;
    
    /**
     * 원본 Base64 메시지
     */
    private String rawMessage;
    
    /**
     * 파싱된 메시지 (JSON)
     */
    private String parsedMessage;
    
    /**
     * QoS 레벨
     */
    private Integer qos;
    
    /**
     * 수신 시각
     * Jackson의 기본 LocalDateTime 파서 사용 (가변 나노초 자릿수 지원)
     */
    @JsonFormat(shape = JsonFormat.Shape.STRING)
    private LocalDateTime receivedAt;
    
    /**
     * 메시지 타입 Enum
     */
    public enum MessageType {
        PERIODIC,    // 주기적 데이터
        DISCRETE,    // 이벤트성 데이터
        REQUEST,     // 디바이스 등록 요청
        RESPONSE,    // 응답
        TEST,        // 테스트
        ECHO,        // Echo 테스트
        FOTA,        // 펌웨어 업데이트
        REBOOT,      // 재시작
        NTP,         // 시간 동기화
        PLAINTEXT    // 평문 텍스트
    }
}
