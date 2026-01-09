package com.enterprise.message.dto.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * 메시지 생성 이벤트
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MessageCreatedEvent {
    
    private Long messageId;
    private Long senderId;
    private Long receiverId;
    private String content;
    private LocalDateTime createdAt;
    
    /**
     * 이벤트 타입
     */
    private String eventType = "MESSAGE_CREATED";
    
    /**
     * 이벤트 발생 시간
     */
    private LocalDateTime eventTimestamp = LocalDateTime.now();
}
