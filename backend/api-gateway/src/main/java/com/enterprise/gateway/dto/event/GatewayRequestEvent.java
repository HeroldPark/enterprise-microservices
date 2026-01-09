package com.enterprise.gateway.dto.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Map;

/**
 * Gateway 요청 이벤트
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GatewayRequestEvent {
    
    private String requestId;
    private String method;
    private String path;
    private String queryString;
    private Map<String, String> headers;
    private String sourceIp;
    private String userAgent;
    private String userId;
    private LocalDateTime timestamp;
    private String eventType;
    
    // 라우팅 정보
    private String targetService;
    private String targetPath;
    
    public GatewayRequestEvent(String eventType) {
        this.eventType = eventType;
        this.timestamp = LocalDateTime.now();
    }
}
