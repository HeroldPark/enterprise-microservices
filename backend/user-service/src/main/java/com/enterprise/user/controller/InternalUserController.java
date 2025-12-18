package com.enterprise.user.controller;

import com.enterprise.user.dto.UserDto;
import com.enterprise.user.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Internal API for inter-service communication
 * Not exposed through API Gateway - only accessible within internal network
 */
@Slf4j
@RestController
@RequestMapping("/internal/users")
@RequiredArgsConstructor
public class InternalUserController {

    private final UserService userService;

    @GetMapping("/{id}")
    public ResponseEntity<UserDto> getUserById(@PathVariable Long id) {
        log.info("Internal GET /internal/users/{}", id);
        UserDto user = userService.getUserById(id);
        return ResponseEntity.ok(user);
    }

    @GetMapping("/username/{username}")
    public ResponseEntity<UserDto> getUserByUsername(@PathVariable String username) {
        log.info("Internal GET /internal/users/username/{}", username);
        UserDto user = userService.getUserByUsername(username);
        return ResponseEntity.ok(user);
    }
}
