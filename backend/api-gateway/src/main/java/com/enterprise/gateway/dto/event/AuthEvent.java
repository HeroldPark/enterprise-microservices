package com.enterprise.gateway.dto.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * 인증 이벤트
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthEvent {
    
    private String userId;
    private String username;
    private String action; // LOGIN_SUCCESS, LOGIN_FAILED, LOGOUT, TOKEN_EXPIRED, UNAUTHORIZED
    private String sourceIp;
    private String userAgent;
    private String path;
    private String reason; // 실패 이유
    private LocalDateTime timestamp;
    private String eventType;
    
    public AuthEvent(String eventType) {
        this.eventType = eventType;
        this.timestamp = LocalDateTime.now();
    }
}
