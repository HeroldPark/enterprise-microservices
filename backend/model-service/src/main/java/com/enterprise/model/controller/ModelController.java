package com.enterprise.model.controller;

import com.enterprise.model.dto.ModelDto;
import com.enterprise.model.entity.Model;
import com.enterprise.model.service.ModelService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/models")
@RequiredArgsConstructor
public class ModelController {
    
    private final ModelService modelService;
    
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getModelStats() {
        log.info("GET /models/stats - 모델 통계 조회 요청");
        Map<String, Object> stats = modelService.getModelStats();
        return ResponseEntity.ok(stats);
    }
    
    @PostMapping
    public ResponseEntity<ModelDto.Response> createModel(@Valid @RequestBody ModelDto.CreateRequest request) {
        log.info("POST /models - 모델 생성 요청: {}", request.getName());
        ModelDto.Response response = modelService.createModel(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
    
    @GetMapping
    public ResponseEntity<Page<ModelDto.Response>> getAllModels(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "DESC") String direction) {
        
        log.info("GET /models - 모델 목록 조회");
        Sort.Direction sortDirection = direction.equalsIgnoreCase("ASC") ? 
                Sort.Direction.ASC : Sort.Direction.DESC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(sortDirection, sortBy));
        
        Page<ModelDto.Response> models = modelService.getAllModels(pageable);
        return ResponseEntity.ok(models);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<ModelDto.DetailResponse> getModel(@PathVariable Long id) {
        log.info("GET /models/{} - 모델 상세 조회", id);
        ModelDto.DetailResponse response = modelService.getModel(id);
        return ResponseEntity.ok(response);
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<ModelDto.Response> updateModel(
            @PathVariable Long id,
            @Valid @RequestBody ModelDto.UpdateRequest request) {
        log.info("PUT /models/{} - 모델 수정", id);
        ModelDto.Response response = modelService.updateModel(id, request);
        return ResponseEntity.ok(response);
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteModel(@PathVariable Long id) {
        log.info("DELETE /models/{} - 모델 삭제", id);
        modelService.deleteModel(id);
        return ResponseEntity.noContent().build();
    }
    
    @GetMapping("/search")
    public ResponseEntity<Page<ModelDto.Response>> searchByName(
            @RequestParam String name,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        log.info("GET /models/search?name={} - 모델 검색", name);
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<ModelDto.Response> models = modelService.searchByName(name, pageable);
        return ResponseEntity.ok(models);
    }
    
    @GetMapping("/type/{type}")
    public ResponseEntity<Page<ModelDto.Response>> getModelsByType(
            @PathVariable Model.ModelType type,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        log.info("GET /models/type/{} - 타입별 모델 조회", type);
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<ModelDto.Response> models = modelService.getModelsByType(type, pageable);
        return ResponseEntity.ok(models);
    }
    
    @GetMapping("/status/{status}")
    public ResponseEntity<Page<ModelDto.Response>> getModelsByStatus(
            @PathVariable Model.ModelStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        log.info("GET /models/status/{} - 상태별 모델 조회", status);
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<ModelDto.Response> models = modelService.getModelsByStatus(status, pageable);
        return ResponseEntity.ok(models);
    }
}
