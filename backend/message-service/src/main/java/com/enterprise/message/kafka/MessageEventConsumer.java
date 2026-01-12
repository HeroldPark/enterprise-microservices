package com.enterprise.message.kafka;

import com.enterprise.message.dto.event.MessageCreatedEvent;
import com.enterprise.message.dto.event.MessageDeletedEvent;
import com.enterprise.message.dto.event.MessageReadEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.support.KafkaHeaders;
import org.springframework.messaging.handler.annotation.Header;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Service;

/**
 * Kafka 메시지 수신 서비스
 * 다른 서비스나 외부 시스템에서 발행한 메시지 이벤트를 처리
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class MessageEventConsumer {

    /**
     * 메시지 생성 이벤트 수신
     * - 알림 서비스로 푸시 알림 전송
     * - 이메일 알림 전송
     * - 통계 데이터 업데이트
     */
    @KafkaListener(
        topics = "${kafka.topic.message-created}",
        groupId = "${spring.kafka.consumer.group-id}",
        containerFactory = "kafkaListenerContainerFactory"
    )
    public void consumeMessageCreatedEvent(
            @Payload MessageCreatedEvent event,
            @Header(KafkaHeaders.RECEIVED_PARTITION) int partition,
            @Header(KafkaHeaders.OFFSET) long offset) {
        
        log.info("Received message created event from partition {}, offset {}: {}", 
            partition, offset, event);
        
        try {
            // 1. 푸시 알림 전송 (구현 예정)
            sendPushNotification(event);
            
            // 2. 이메일 알림 전송 (필요시)
            sendEmailNotification(event);
            
            // 3. 통계 업데이트
            updateStatistics(event);
            
            log.info("Successfully processed message created event: messageId={}", 
                event.getMessageId());
            
        } catch (Exception e) {
            log.error("Error processing message created event: messageId={}", 
                event.getMessageId(), e);
            // 에러 처리 로직 (재시도, DLQ 전송 등)
        }
    }

    /**
     * 메시지 읽음 처리 이벤트 수신
     * - 발신자에게 읽음 확인 알림
     * - 읽음 통계 업데이트
     */
    @KafkaListener(
        topics = "${kafka.topic.message-read}",
        groupId = "${spring.kafka.consumer.group-id}",
        containerFactory = "kafkaListenerContainerFactory"
    )
    public void consumeMessageReadEvent(
            @Payload MessageReadEvent event,
            @Header(KafkaHeaders.RECEIVED_PARTITION) int partition,
            @Header(KafkaHeaders.OFFSET) long offset) {
        
        log.info("Received message read event from partition {}, offset {}: {}", 
            partition, offset, event);
        
        try {
            // 1. 발신자에게 읽음 확인 알림
            notifySenderAboutRead(event);
            
            // 2. 읽음 통계 업데이트
            updateReadStatistics(event);
            
            log.info("Successfully processed message read event: messageId={}", 
                event.getMessageId());
            
        } catch (Exception e) {
            log.error("Error processing message read event: messageId={}", 
                event.getMessageId(), e);
        }
    }

    /**
     * 메시지 삭제 이벤트 수신
     * - 관련 데이터 정리
     * - 통계 업데이트
     */
    @KafkaListener(
        topics = "${kafka.topic.message-deleted}",
        groupId = "${spring.kafka.consumer.group-id}",
        containerFactory = "kafkaListenerContainerFactory"
    )
    public void consumeMessageDeletedEvent(
            @Payload MessageDeletedEvent event,
            @Header(KafkaHeaders.RECEIVED_PARTITION) int partition,
            @Header(KafkaHeaders.OFFSET) long offset) {
        
        log.info("Received message deleted event from partition {}, offset {}: {}", 
            partition, offset, event);
        
        try {
            // 1. 관련 캐시 데이터 삭제
            clearCacheData(event);
            
            // 2. 통계 업데이트
            updateDeleteStatistics(event);
            
            log.info("Successfully processed message deleted event: messageId={}", 
                event.getMessageId());
            
        } catch (Exception e) {
            log.error("Error processing message deleted event: messageId={}", 
                event.getMessageId(), e);
        }
    }

    // === Private Helper Methods ===

    private void sendPushNotification(MessageCreatedEvent event) {
        log.debug("Sending push notification for message: {}", event.getMessageId());
    }

    private void sendEmailNotification(MessageCreatedEvent event) {
        log.debug("Sending email notification for message: {}", event.getMessageId());
    }

    private void updateStatistics(MessageCreatedEvent event) {
        log.debug("Updating statistics for message created: {}", event.getMessageId());
    }

    private void notifySenderAboutRead(MessageReadEvent event) {
        log.debug("Notifying sender about message read: {}", event.getMessageId());
    }

    private void updateReadStatistics(MessageReadEvent event) {
        log.debug("Updating read statistics for message: {}", event.getMessageId());
    }

    private void clearCacheData(MessageDeletedEvent event) {
        log.debug("Clearing cache data for message: {}", event.getMessageId());
    }

    private void updateDeleteStatistics(MessageDeletedEvent event) {
        log.debug("Updating delete statistics for message: {}", event.getMessageId());
    }
}
