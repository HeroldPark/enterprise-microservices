package com.enterprise.message.controller;

import com.enterprise.message.dto.MessageCreateRequestDto;
import com.enterprise.message.dto.MessageResponseDto;
import com.enterprise.message.service.MessageService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/messages")
@RequiredArgsConstructor
public class MessageController {

    private final MessageService messageService;

    @PostMapping
    public ResponseEntity<MessageResponseDto> create(@Valid @RequestBody MessageCreateRequestDto dto) {
        return ResponseEntity.ok(messageService.create(dto));
    }

    @GetMapping("/{id}")
    public ResponseEntity<MessageResponseDto> get(@PathVariable Long id) {
        return ResponseEntity.ok(messageService.get(id));
    }

    @GetMapping("/inbox/{receiverId}")
    public ResponseEntity<List<MessageResponseDto>> inbox(@PathVariable Long receiverId) {
        return ResponseEntity.ok(messageService.inbox(receiverId));
    }

    @GetMapping("/sent/{senderId}")
    public ResponseEntity<List<MessageResponseDto>> sent(@PathVariable Long senderId) {
        return ResponseEntity.ok(messageService.sent(senderId));
    }

    @GetMapping("/all")
    public ResponseEntity<List<MessageResponseDto>> getAllMessages() {
        return ResponseEntity.ok(messageService.getAllMessages());
    }

    @PatchMapping("/{id}/read")
    public ResponseEntity<MessageResponseDto> markRead(@PathVariable Long id) {
        return ResponseEntity.ok(messageService.markRead(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        messageService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
