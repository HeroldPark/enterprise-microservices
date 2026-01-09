package com.enterprise.message.kafka;

import com.enterprise.message.dto.event.MessageCreatedEvent;
import com.enterprise.message.dto.event.MessageDeletedEvent;
import com.enterprise.message.dto.event.MessageReadEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.support.SendResult;
import org.springframework.stereotype.Service;

import java.util.concurrent.CompletableFuture;

/**
 * Kafka 메시지 발행 서비스
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class MessageEventProducer {

    private final KafkaTemplate<String, Object> kafkaTemplate;

    @Value("${kafka.topic.message-created}")
    private String messageCreatedTopic;

    @Value("${kafka.topic.message-read}")
    private String messageReadTopic;

    @Value("${kafka.topic.message-deleted}")
    private String messageDeletedTopic;

    /**
     * 메시지 생성 이벤트 발행
     */
    public void sendMessageCreatedEvent(MessageCreatedEvent event) {
        log.info("Sending message created event: {}", event);
        
        CompletableFuture<SendResult<String, Object>> future = 
            kafkaTemplate.send(messageCreatedTopic, event.getMessageId().toString(), event);
        
        future.whenComplete((result, ex) -> {
            if (ex == null) {
                log.info("Message created event sent successfully: messageId={}, offset={}", 
                    event.getMessageId(), 
                    result.getRecordMetadata().offset());
            } else {
                log.error("Failed to send message created event: messageId={}", 
                    event.getMessageId(), ex);
            }
        });
    }

    /**
     * 메시지 읽음 처리 이벤트 발행
     */
    public void sendMessageReadEvent(MessageReadEvent event) {
        log.info("Sending message read event: {}", event);
        
        CompletableFuture<SendResult<String, Object>> future = 
            kafkaTemplate.send(messageReadTopic, event.getMessageId().toString(), event);
        
        future.whenComplete((result, ex) -> {
            if (ex == null) {
                log.info("Message read event sent successfully: messageId={}, offset={}", 
                    event.getMessageId(), 
                    result.getRecordMetadata().offset());
            } else {
                log.error("Failed to send message read event: messageId={}", 
                    event.getMessageId(), ex);
            }
        });
    }

    /**
     * 메시지 삭제 이벤트 발행
     */
    public void sendMessageDeletedEvent(MessageDeletedEvent event) {
        log.info("Sending message deleted event: {}", event);
        
        CompletableFuture<SendResult<String, Object>> future = 
            kafkaTemplate.send(messageDeletedTopic, event.getMessageId().toString(), event);
        
        future.whenComplete((result, ex) -> {
            if (ex == null) {
                log.info("Message deleted event sent successfully: messageId={}, offset={}", 
                    event.getMessageId(), 
                    result.getRecordMetadata().offset());
            } else {
                log.error("Failed to send message deleted event: messageId={}", 
                    event.getMessageId(), ex);
            }
        });
    }
}
