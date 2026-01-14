package com.enterprise.message.controller;

import com.enterprise.message.dto.event.MessageCreatedEvent;
import com.enterprise.message.dto.event.MessageDeletedEvent;
import com.enterprise.message.dto.event.MessageReadEvent;
import com.enterprise.message.kafka.MessageEventProducer;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

/**
 * Kafka 이벤트 테스트 컨트롤러
 * 개발 및 테스트 목적으로 사용
 */
@Slf4j
@RestController
@RequestMapping("/kafka-test")
@RequiredArgsConstructor
public class KafkaTestController {

    private final MessageEventProducer messageEventProducer;

    /**
     * 메시지 생성 이벤트 테스트
     */
    @PostMapping("/message-created")
    public ResponseEntity<String> testMessageCreatedEvent(
            @RequestParam Long messageId,
            @RequestParam Long senderId,
            @RequestParam Long receiverId,
            @RequestParam String content) {
        
        MessageCreatedEvent event = MessageCreatedEvent.builder()
                .messageId(messageId)
                .senderId(senderId)
                .receiverId(receiverId)
                .content(content)
                .createdAt(LocalDateTime.now())
                .eventType("MESSAGE_CREATED")
                .eventTimestamp(LocalDateTime.now())
                .build();
        
        messageEventProducer.sendMessageCreatedEvent(event);
        log.info("Test message created event sent: {}", event);
        
        return ResponseEntity.ok("Message created event sent successfully");
    }

    /**
     * 메시지 읽음 이벤트 테스트
     */
    @PostMapping("/message-read")
    public ResponseEntity<String> testMessageReadEvent(
            @RequestParam Long messageId,
            @RequestParam Long receiverId) {
        
        MessageReadEvent event = MessageReadEvent.builder()
                .messageId(messageId)
                .receiverId(receiverId)
                .readAt(LocalDateTime.now())
                .eventType("MESSAGE_READ")
                .eventTimestamp(LocalDateTime.now())
                .build();
        
        messageEventProducer.sendMessageReadEvent(event);
        log.info("Test message read event sent: {}", event);
        
        return ResponseEntity.ok("Message read event sent successfully");
    }

    /**
     * 메시지 삭제 이벤트 테스트
     */
    @PostMapping("/message-deleted")
    public ResponseEntity<String> testMessageDeletedEvent(
            @RequestParam Long messageId,
            @RequestParam Long senderId,
            @RequestParam Long receiverId) {
        
        MessageDeletedEvent event = MessageDeletedEvent.builder()
                .messageId(messageId)
                .senderId(senderId)
                .receiverId(receiverId)
                .deletedAt(LocalDateTime.now())
                .eventType("MESSAGE_DELETED")
                .eventTimestamp(LocalDateTime.now())
                .build();
        
        messageEventProducer.sendMessageDeletedEvent(event);
        log.info("Test message deleted event sent: {}", event);
        
        return ResponseEntity.ok("Message deleted event sent successfully");
    }

    /**
     * 대량 이벤트 테스트 (성능 테스트용)
     */
    @PostMapping("/bulk-test")
    public ResponseEntity<String> bulkTest(
            @RequestParam(defaultValue = "10") int count) {
        
        long startTime = System.currentTimeMillis();
        
        for (int i = 1; i <= count; i++) {
            MessageCreatedEvent event = MessageCreatedEvent.builder()
                    .messageId((long) i)
                    .senderId(1L)
                    .receiverId(2L)
                    .content("Bulk test message " + i)
                    .createdAt(LocalDateTime.now())
                    .eventType("MESSAGE_CREATED")
                    .eventTimestamp(LocalDateTime.now())
                    .build();
            
            messageEventProducer.sendMessageCreatedEvent(event);
        }
        
        long endTime = System.currentTimeMillis();
        long duration = endTime - startTime;
        
        String result = String.format("Sent %d events in %d ms (%.2f events/sec)", 
                count, duration, (count * 1000.0) / duration);
        
        log.info("Bulk test completed: {}", result);
        
        return ResponseEntity.ok(result);
    }
}
