package com.enterprise.message.service;

import com.enterprise.message.dto.MessageCreateRequestDto;
import com.enterprise.message.dto.MessageResponseDto;
import com.enterprise.message.dto.event.MessageCreatedEvent;
import com.enterprise.message.dto.event.MessageDeletedEvent;
import com.enterprise.message.dto.event.MessageReadEvent;
import com.enterprise.message.entity.Message;
import com.enterprise.message.exception.ResourceNotFoundException;
import com.enterprise.message.kafka.MessageEventProducer;
import com.enterprise.message.repository.MessageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import lombok.extern.slf4j.Slf4j;
import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class MessageService {

    private final MessageRepository messageRepository;
    private final MessageEventProducer messageEventProducer;

    @Transactional
    public MessageResponseDto create(MessageCreateRequestDto dto) {
        Message message = new Message();
        message.setSenderId(dto.getSenderId());
        message.setReceiverId(dto.getReceiverId());
        message.setContent(dto.getContent());

        Message saved = messageRepository.save(message);
        
        // Kafka 이벤트 발행 - 메시지 생성
        MessageCreatedEvent event = MessageCreatedEvent.builder()
                .messageId(saved.getId())
                .senderId(saved.getSenderId())
                .receiverId(saved.getReceiverId())
                .content(saved.getContent())
                .createdAt(saved.getCreatedAt())
                .eventType("MESSAGE_CREATED")
                .eventTimestamp(LocalDateTime.now())
                .build();
        
        messageEventProducer.sendMessageCreatedEvent(event);
        log.info("Message created and event published: messageId={}", saved.getId());
        
        return toDto(saved);
    }

    @Transactional(readOnly = true)
    public MessageResponseDto get(Long id) {
        Message message = messageRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Message not found: " + id));
        return toDto(message);
    }

    @Transactional(readOnly = true)
    public List<MessageResponseDto> inbox(Long receiverId) {
        return messageRepository.findByReceiverIdAndIsReadFalseOrderByCreatedAtDesc(receiverId)
                .stream().map(this::toDto).toList();
    }

    @Transactional(readOnly = true)
    public List<MessageResponseDto> sent(Long senderId) {
        return messageRepository.findBySenderIdOrderByCreatedAtDesc(senderId)
                .stream().map(this::toDto).toList();
    }

    @Transactional(readOnly = true)
    public List<MessageResponseDto> getAllMessages() {
            return messageRepository.findAllByOrderByCreatedAtDesc()
                            .stream().map(this::toDto).toList();
    }

    @Transactional
    public MessageResponseDto markRead(Long id) {
        Message message = messageRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Message not found: " + id));
        message.setRead(true);
        
        // Kafka 이벤트 발행 - 메시지 읽음 처리
        MessageReadEvent event = MessageReadEvent.builder()
                .messageId(message.getId())
                .receiverId(message.getReceiverId())
                .readAt(LocalDateTime.now())
                .eventType("MESSAGE_READ")
                .eventTimestamp(LocalDateTime.now())
                .build();
        
        messageEventProducer.sendMessageReadEvent(event);
        log.info("Message marked as read and event published: messageId={}", id);
        
        return toDto(message);
    }

    @Transactional
    public void delete(Long id) {
        Message message = messageRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Message not found: " + id));
        
        // Kafka 이벤트 발행 - 메시지 삭제
        MessageDeletedEvent event = MessageDeletedEvent.builder()
                .messageId(message.getId())
                .senderId(message.getSenderId())
                .receiverId(message.getReceiverId())
                .deletedAt(LocalDateTime.now())
                .eventType("MESSAGE_DELETED")
                .eventTimestamp(LocalDateTime.now())
                .build();
        
        messageRepository.deleteById(id);
        messageEventProducer.sendMessageDeletedEvent(event);
        log.info("Message deleted and event published: messageId={}", id);
    }

    private MessageResponseDto toDto(Message m) {
        return new MessageResponseDto(
                m.getId(),
                m.getSenderId(),
                m.getReceiverId(),
                m.getContent(),
                m.isRead(),
                m.getCreatedAt(),
                m.getUpdatedAt()
        );
    }
}
