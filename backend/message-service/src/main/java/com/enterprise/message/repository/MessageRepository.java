package com.enterprise.message.repository;

import com.enterprise.message.entity.Message;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MessageRepository extends JpaRepository<Message, Long> {

    List<Message> findByReceiverIdAndIsReadFalseOrderByCreatedAtDesc(Long receiverId);

    List<Message> findBySenderIdOrderByCreatedAtDesc(Long senderId);
}
