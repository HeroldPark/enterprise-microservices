package com.enterprise.gateway.dto.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * API 통계 이벤트
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ApiStatsEvent {
    
    private String serviceName;
    private String endpoint;
    private String method;
    private long totalRequests;
    private long successRequests;
    private long failedRequests;
    private double avgResponseTime;
    private long minResponseTime;
    private long maxResponseTime;
    private LocalDateTime timestamp;
    private String eventType;
    
    // 시간대 정보
    private String period; // HOURLY, DAILY, WEEKLY
    private LocalDateTime periodStart;
    private LocalDateTime periodEnd;
    
    public ApiStatsEvent(String eventType) {
        this.eventType = eventType;
        this.timestamp = LocalDateTime.now();
    }
}
