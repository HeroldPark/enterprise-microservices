package com.enterprise.model.controller;

import com.enterprise.model.dto.ModelDto;
import com.enterprise.model.dto.PredictionDto;
import com.enterprise.model.service.PredictionService;
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

@Slf4j
@RestController
@RequestMapping("/predictions")
@RequiredArgsConstructor
public class PredictionController {
    
    private final PredictionService predictionService;
    
    @PostMapping
    public ResponseEntity<PredictionDto.Response> predict(@Valid @RequestBody ModelDto.PredictRequest request) {
        log.info("POST /predictions - 예측 실행: {}", request.getModelId());
        PredictionDto.Response response = predictionService.predict(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
    
    @GetMapping("/model/{modelId}")
    public ResponseEntity<Page<PredictionDto.Response>> getPredictionsByModel(
            @PathVariable Long modelId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        log.info("GET /predictions/model/{} - 모델별 예측 조회", modelId);
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<PredictionDto.Response> predictions = predictionService.getPredictionsByModel(modelId, pageable);
        return ResponseEntity.ok(predictions);
    }
    
    @GetMapping("/user/{username}")
    public ResponseEntity<Page<PredictionDto.Response>> getPredictionsByUser(
            @PathVariable String username,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        log.info("GET /predictions/user/{} - 사용자별 예측 조회", username);
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<PredictionDto.Response> predictions = predictionService.getPredictionsByUser(username, pageable);
        return ResponseEntity.ok(predictions);
    }
}
