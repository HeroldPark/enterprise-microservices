package com.enterprise.user.controller;

import com.enterprise.user.dto.UserDto;
import com.enterprise.user.dto.UserManagementRequest;
import com.enterprise.user.entity.User;
import com.enterprise.user.service.UserManagementService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/admin/users")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@SecurityRequirement(name = "bearer-jwt")
@Tag(name = "Admin - User Management", description = "관리자 전용 사용자 관리 API")
public class UserManagementController {

    private final UserManagementService userManagementService;

    @GetMapping
    @Operation(summary = "모든 사용자 조회 (페이징)", description = "관리자가 모든 사용자를 페이징 처리하여 조회")
    public ResponseEntity<Page<UserDto>> getAllUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "DESC") String direction) {
        
        log.info("GET /admin/users - page: {}, size: {}", page, size);
        
        Sort.Direction sortDirection = direction.equalsIgnoreCase("ASC") 
                ? Sort.Direction.ASC 
                : Sort.Direction.DESC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(sortDirection, sortBy));
        
        Page<UserDto> users = userManagementService.getAllUsers(pageable);
        return ResponseEntity.ok(users);
    }

    @GetMapping("/{id}")
    @Operation(summary = "사용자 상세 조회", description = "ID로 특정 사용자 조회")
    public ResponseEntity<UserDto> getUserById(@PathVariable Long id) {
        log.info("GET /admin/users/{}", id);
        UserDto user = userManagementService.getUserById(id);
        return ResponseEntity.ok(user);
    }

    @PostMapping
    @Operation(summary = "새 사용자 생성", description = "관리자가 새로운 사용자 생성")
    public ResponseEntity<UserDto> createUser(@Valid @RequestBody UserManagementRequest request) {
        log.info("POST /admin/users - username: {}", request.getUsername());
        UserDto createdUser = userManagementService.createUser(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdUser);
    }

    @PutMapping("/{id}")
    @Operation(summary = "사용자 정보 수정", description = "사용자 정보 전체 수정")
    public ResponseEntity<UserDto> updateUser(
            @PathVariable Long id,
            @Valid @RequestBody UserManagementRequest request) {
        log.info("PUT /admin/users/{}", id);
        UserDto updatedUser = userManagementService.updateUser(id, request);
        return ResponseEntity.ok(updatedUser);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "사용자 삭제", description = "사용자 영구 삭제")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        log.info("DELETE /admin/users/{}", id);
        userManagementService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/search")
    @Operation(summary = "사용자 검색", description = "이름, 이메일, 아이디로 검색")
    public ResponseEntity<Page<UserDto>> searchUsers(
            @RequestParam String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        log.info("GET /admin/users/search - keyword: {}", keyword);
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        
        Page<UserDto> users = userManagementService.searchUsers(keyword, pageable);
        return ResponseEntity.ok(users);
    }

    @GetMapping("/by-role")
    @Operation(summary = "권한별 사용자 조회", description = "특정 권한을 가진 사용자 조회")
    public ResponseEntity<Page<UserDto>> getUsersByRole(
            @RequestParam User.Role role,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        log.info("GET /admin/users/by-role - role: {}", role);
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        
        Page<UserDto> users = userManagementService.getUsersByRole(role, pageable);
        return ResponseEntity.ok(users);
    }

    @PatchMapping("/{id}/status")
    @Operation(summary = "사용자 상태 변경", description = "계정 활성화/비활성화")
    public ResponseEntity<UserDto> toggleUserStatus(
            @PathVariable Long id,
            @RequestBody Map<String, Boolean> request) {
        
        Boolean enabled = request.get("enabled");
        log.info("PATCH /admin/users/{}/status - enabled: {}", id, enabled);
        
        UserDto user = userManagementService.toggleUserStatus(id, enabled);
        return ResponseEntity.ok(user);
    }

    @PatchMapping("/{id}/role")
    @Operation(summary = "사용자 권한 변경", description = "사용자 권한 변경")
    public ResponseEntity<UserDto> changeUserRole(
            @PathVariable Long id,
            @RequestBody Map<String, User.Role> request) {
        
        User.Role role = request.get("role");
        log.info("PATCH /admin/users/{}/role - role: {}", id, role);
        
        UserDto user = userManagementService.changeUserRole(id, role);
        return ResponseEntity.ok(user);
    }

    @GetMapping("/stats")
    @Operation(summary = "사용자 통계", description = "전체/권한별/상태별 사용자 통계")
    public ResponseEntity<Map<String, Object>> getUserStats() {

        log.info("GET /admin/users/stats");
        
        Map<String, Object> stats = userManagementService.getUserStats();
        return ResponseEntity.ok(stats);
    }

}
