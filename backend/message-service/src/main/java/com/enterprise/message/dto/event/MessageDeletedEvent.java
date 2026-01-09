package com.enterprise.message.dto.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * 메시지 삭제 이벤트
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MessageDeletedEvent {
    
    private Long messageId;
    private Long senderId;
    private Long receiverId;
    private LocalDateTime deletedAt;
    
    /**
     * 이벤트 타입
     */
    private String eventType = "MESSAGE_DELETED";
    
    /**
     * 이벤트 발생 시간
     */
    private LocalDateTime eventTimestamp = LocalDateTime.now();
}
