package com.enterprise.message.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class MessageCreateRequestDto {

    @NotNull(message = "senderId is required")
    private Long senderId;

    @NotNull(message = "receiverId is required")
    private Long receiverId;

    @NotBlank(message = "content is required")
    @Size(max = 500, message = "content must be <= 500 chars")
    private String content;
}
