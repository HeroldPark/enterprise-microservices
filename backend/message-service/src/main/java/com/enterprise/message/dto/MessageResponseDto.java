package com.enterprise.message.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@AllArgsConstructor
public class MessageResponseDto {
    private Long id;
    private Long senderId;
    private Long receiverId;
    private String content;
    private boolean read;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
