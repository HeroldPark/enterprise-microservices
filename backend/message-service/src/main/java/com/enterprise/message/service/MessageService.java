package com.enterprise.message.service;

import com.enterprise.message.dto.MessageCreateRequestDto;
import com.enterprise.message.dto.MessageResponseDto;
import com.enterprise.message.entity.Message;
import com.enterprise.message.exception.ResourceNotFoundException;
import com.enterprise.message.repository.MessageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import lombok.extern.slf4j.Slf4j;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class MessageService {

    private final MessageRepository messageRepository;

    @Transactional
    public MessageResponseDto create(MessageCreateRequestDto dto) {
        Message message = new Message();
        message.setSenderId(dto.getSenderId());
        message.setReceiverId(dto.getReceiverId());
        message.setContent(dto.getContent());

        Message saved = messageRepository.save(message);
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

    @Transactional
    public MessageResponseDto markRead(Long id) {
        Message message = messageRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Message not found: " + id));
        message.setRead(true);
        return toDto(message);
    }

    @Transactional
    public void delete(Long id) {
        if (!messageRepository.existsById(id)) {
            throw new ResourceNotFoundException("Message not found: " + id);
        }
        messageRepository.deleteById(id);
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
