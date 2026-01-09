package com.enterprise.message.dto.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * 메시지 읽음 처리 이벤트
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MessageReadEvent {
    
    private Long messageId;
    private Long receiverId;
    private LocalDateTime readAt;
    
    /**
     * 이벤트 타입
     */
    private String eventType = "MESSAGE_READ";
    
    /**
     * 이벤트 발생 시간
     */
    private LocalDateTime eventTimestamp = LocalDateTime.now();
}
