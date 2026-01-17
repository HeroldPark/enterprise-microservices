package com.enterprise.mqtt.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * MQTT 메시지 DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class MqttMessage {
    
    /**
     * 메시지 ID
     */
    private String messageId;
    
    /**
     * MQTT 토픽
     */
    private String topic;
    
    /**
     * 메시지 타입 (PERIODIC, DISCRETE, REQUEST, RESPONSE, ECHO, FOTA, REBOOT, NTP, PLAINTEXT)
     */
    private MessageType messageType;
    // private String messageType; // ✅ String (Enum 아님)

    /**
     * 디바이스 ID 또는 Serial Number
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
     */
    private LocalDateTime receivedAt;
    // private String receivedAt; // ✅ String (LocalDateTime 아님)
    
    /**
     * 메시지 타입 Enum
     */
    public enum MessageType {
        PERIODIC(0),
        DISCRETE(1),
        REQUEST(2),
        RESPONSE(3),
        TEST(4),
        ECHO(5),
        FOTA(6),
        REBOOT(7),
        NTP(8),
        PLAINTEXT(9);
        
        private final int code;
        
        MessageType(int code) {
            this.code = code;
        }
        
        public int getCode() {
            return code;
        }
        
        public static MessageType fromCode(int code) {
            for (MessageType type : values()) {
                if (type.code == code) {
                    return type;
                }
            }
            return null;
        }
    }
}
