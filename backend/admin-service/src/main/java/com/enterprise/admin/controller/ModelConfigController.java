package com.enterprise.admin.controller;

import com.enterprise.admin.dto.ModelConfigDto;
import com.enterprise.admin.entity.ModelConfig;
import com.enterprise.admin.service.ModelConfigService;
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
@RequestMapping("/admin/model-configs")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@SecurityRequirement(name = "bearer-jwt")
@Tag(name = "Admin - Model Configs", description = "모델 설정 관리 API")
public class ModelConfigController {
    
    private final ModelConfigService configService;
    
    @GetMapping
    @Operation(summary = "모든 모델 설정 조회 (페이징)", description = "관리자가 모든 모델 설정을 조회")
    public ResponseEntity<Page<ModelConfigDto>> getAllConfigs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "modelType") String sortBy,
            @RequestParam(defaultValue = "ASC") String direction) {
        
        log.info("GET /admin/model-configs - page: {}, size: {}", page, size);
        
        Sort.Direction sortDirection = direction.equalsIgnoreCase("ASC") 
                ? Sort.Direction.ASC 
                : Sort.Direction.DESC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(sortDirection, sortBy));
        
        Page<ModelConfigDto> configs = configService.getAllConfigs(pageable);
        return ResponseEntity.ok(configs);
    }
    
    @GetMapping("/model/{modelType}")
    @Operation(summary = "모델 타입별 설정 조회", description = "특정 모델의 모든 설정 조회")
    public ResponseEntity<List<ModelConfigDto>> getConfigsByModelType(
            @PathVariable ModelConfig.ModelType modelType) {
        
        log.info("GET /admin/model-configs/model/{}", modelType);
        List<ModelConfigDto> configs = configService.getConfigsByModelType(modelType);
        return ResponseEntity.ok(configs);
    }
    
    @GetMapping("/{id}")
    @Operation(summary = "설정 상세 조회", description = "ID로 특정 설정 조회")
    public ResponseEntity<ModelConfigDto> getConfigById(@PathVariable Long id) {
        log.info("GET /admin/model-configs/{}", id);
        ModelConfigDto config = configService.getConfigById(id);
        return ResponseEntity.ok(config);
    }
    
    @GetMapping("/model/{modelType}/default")
    @Operation(summary = "기본 설정 조회", description = "모델의 기본 설정 조회")
    public ResponseEntity<ModelConfigDto> getDefaultConfig(
            @PathVariable ModelConfig.ModelType modelType) {
        
        log.info("GET /admin/model-configs/model/{}/default", modelType);
        ModelConfigDto config = configService.getDefaultConfig(modelType);
        return ResponseEntity.ok(config);
    }
    
    @PostMapping
    @Operation(summary = "새 설정 생성", description = "새로운 모델 설정 추가")
    public ResponseEntity<ModelConfigDto> createConfig(@Valid @RequestBody ModelConfigDto dto) {
        log.info("POST /admin/model-configs - model: {}, config: {}", dto.getModelType(), dto.getConfigName());
        ModelConfigDto created = configService.createConfig(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }
    
    @PutMapping("/{id}")
    @Operation(summary = "설정 수정", description = "기존 설정 수정")
    public ResponseEntity<ModelConfigDto> updateConfig(
            @PathVariable Long id,
            @Valid @RequestBody ModelConfigDto dto) {
        
        log.info("PUT /admin/model-configs/{}", id);
        ModelConfigDto updated = configService.updateConfig(id, dto);
        return ResponseEntity.ok(updated);
    }
    
    @DeleteMapping("/{id}")
    @Operation(summary = "설정 삭제", description = "설정 영구 삭제")
    public ResponseEntity<Void> deleteConfig(@PathVariable Long id) {
        log.info("DELETE /admin/model-configs/{}", id);
        configService.deleteConfig(id);
        return ResponseEntity.noContent().build();
    }
    
    @PatchMapping("/{id}/toggle")
    @Operation(summary = "설정 활성화/비활성화", description = "설정의 활성화 상태 토글")
    public ResponseEntity<ModelConfigDto> toggleConfig(@PathVariable Long id) {
        log.info("PATCH /admin/model-configs/{}/toggle", id);
        ModelConfigDto toggled = configService.toggleConfig(id);
        return ResponseEntity.ok(toggled);
    }
    
    @PatchMapping("/{id}/set-default")
    @Operation(summary = "기본 설정으로 지정", description = "해당 설정을 모델의 기본 설정으로 지정")
    public ResponseEntity<ModelConfigDto> setAsDefault(@PathVariable Long id) {
        log.info("PATCH /admin/model-configs/{}/set-default", id);
        ModelConfigDto updated = configService.setAsDefault(id);
        return ResponseEntity.ok(updated);
    }
    
    @PostMapping("/{id}/clone")
    @Operation(summary = "설정 복제", description = "기존 설정을 복제하여 새 설정 생성")
    public ResponseEntity<ModelConfigDto> cloneConfig(
            @PathVariable Long id,
            @RequestParam String newConfigName) {
        
        log.info("POST /admin/model-configs/{}/clone - new name: {}", id, newConfigName);
        ModelConfigDto cloned = configService.cloneConfig(id, newConfigName);
        return ResponseEntity.status(HttpStatus.CREATED).body(cloned);
    }
}