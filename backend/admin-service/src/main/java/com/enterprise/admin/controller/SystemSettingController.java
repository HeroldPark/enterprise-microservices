package com.enterprise.admin.controller;

import com.enterprise.admin.dto.SystemSettingDto;
import com.enterprise.admin.entity.SystemSetting;
import com.enterprise.admin.service.SystemSettingService;
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

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/admin/settings")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@SecurityRequirement(name = "bearer-jwt")
@Tag(name = "Admin - System Settings", description = "시스템 설정 관리 API")
public class SystemSettingController {
    
    private final SystemSettingService settingService;
    
    @GetMapping
    @Operation(summary = "모든 시스템 설정 조회 (페이징)", description = "관리자가 모든 시스템 설정을 조회")
    public ResponseEntity<Page<SystemSettingDto>> getAllSettings(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "category") String sortBy,
            @RequestParam(defaultValue = "ASC") String direction) {
        
        log.info("GET /admin/settings - page: {}, size: {}", page, size);
        
        Sort.Direction sortDirection = direction.equalsIgnoreCase("ASC") 
                ? Sort.Direction.ASC 
                : Sort.Direction.DESC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(sortDirection, sortBy));
        
        Page<SystemSettingDto> settings = settingService.getAllSettings(pageable);
        return ResponseEntity.ok(settings);
    }
    
    @GetMapping("/category/{category}")
    @Operation(summary = "카테고리별 설정 조회", description = "특정 카테고리의 설정만 조회")
    public ResponseEntity<List<SystemSettingDto>> getSettingsByCategory(
            @PathVariable SystemSetting.Category category) {
        
        log.info("GET /admin/settings/category/{}", category);
        List<SystemSettingDto> settings = settingService.getSettingsByCategory(category);
        return ResponseEntity.ok(settings);
    }
    
    @GetMapping("/{id}")
    @Operation(summary = "설정 상세 조회", description = "ID로 특정 설정 조회")
    public ResponseEntity<SystemSettingDto> getSettingById(@PathVariable Long id) {
        log.info("GET /admin/settings/{}", id);
        SystemSettingDto setting = settingService.getSettingById(id);
        return ResponseEntity.ok(setting);
    }
    
    @GetMapping("/value/{key}")
    @Operation(summary = "설정 값 조회", description = "Key로 설정 값만 조회")
    public ResponseEntity<String> getSettingValue(@PathVariable String key) {
        log.info("GET /admin/settings/value/{}", key);
        String value = settingService.getSettingValue(key);
        return ResponseEntity.ok(value);
    }
    
    @PostMapping
    @Operation(summary = "새 설정 생성", description = "새로운 시스템 설정 추가")
    public ResponseEntity<SystemSettingDto> createSetting(@Valid @RequestBody SystemSettingDto dto) {
        log.info("POST /admin/settings - key: {}", dto.getKey());
        SystemSettingDto created = settingService.createSetting(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }
    
    @PutMapping("/{id}")
    @Operation(summary = "설정 수정", description = "기존 설정 수정")
    public ResponseEntity<SystemSettingDto> updateSetting(
            @PathVariable Long id,
            @Valid @RequestBody SystemSettingDto dto) {
        
        log.info("PUT /admin/settings/{}", id);
        SystemSettingDto updated = settingService.updateSetting(id, dto);
        return ResponseEntity.ok(updated);
    }
    
    @DeleteMapping("/{id}")
    @Operation(summary = "설정 삭제", description = "설정 영구 삭제")
    public ResponseEntity<Void> deleteSetting(@PathVariable Long id) {
        log.info("DELETE /admin/settings/{}", id);
        settingService.deleteSetting(id);
        return ResponseEntity.noContent().build();
    }
    
    @PatchMapping("/{id}/toggle")
    @Operation(summary = "설정 활성화/비활성화", description = "설정의 활성화 상태 토글")
    public ResponseEntity<SystemSettingDto> toggleSetting(@PathVariable Long id) {
        log.info("PATCH /admin/settings/{}/toggle", id);
        SystemSettingDto toggled = settingService.toggleSetting(id);
        return ResponseEntity.ok(toggled);
    }
    
    @PatchMapping("/{id}/reset")
    @Operation(summary = "기본값으로 초기화", description = "설정을 기본값으로 되돌림")
    public ResponseEntity<SystemSettingDto> resetToDefault(@PathVariable Long id) {
        log.info("PATCH /admin/settings/{}/reset", id);
        SystemSettingDto reset = settingService.resetToDefault(id);
        return ResponseEntity.ok(reset);
    }
}