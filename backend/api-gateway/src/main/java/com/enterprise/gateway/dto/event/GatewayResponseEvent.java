package com.enterprise.gateway.dto.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Gateway 응답 이벤트
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GatewayResponseEvent {
    
    private String requestId;
    private int statusCode;
    private String statusMessage;
    private long responseTimeMs;
    private long contentLength;
    private LocalDateTime timestamp;
    private String eventType;
    
    // 요청 정보 (분석용)
    private String method;
    private String path;
    private String targetService;
    
    // 성공 여부
    private boolean success;
    private String errorMessage;
    
    public GatewayResponseEvent(String eventType) {
        this.eventType = eventType;
        this.timestamp = LocalDateTime.now();
    }
}
