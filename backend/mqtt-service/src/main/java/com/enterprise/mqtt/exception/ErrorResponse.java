package com.enterprise.mqtt.exception;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * 에러 응답 DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ErrorResponse {
    
    /**
     * 에러 코드
     */
    private String errorCode;
    
    /**
     * 에러 메시지
     */
    private String message;
    
    /**
     * 상세 설명
     */
    private String details;
    
    /**
     * 발생 시각
     */
    @Builder.Default
    private LocalDateTime timestamp = LocalDateTime.now();
    
    /**
     * 요청 경로
     */
    private String path;
}
