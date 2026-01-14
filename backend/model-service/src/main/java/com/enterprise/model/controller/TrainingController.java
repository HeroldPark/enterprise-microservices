package com.enterprise.model.controller;

import com.enterprise.model.dto.ModelDto;
import com.enterprise.model.dto.TrainingHistoryDto;
import com.enterprise.model.service.TrainingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/training")
@RequiredArgsConstructor
public class TrainingController {
    
    private final TrainingService trainingService;
    
    @PostMapping
    public ResponseEntity<Void> trainModel(@Valid @RequestBody ModelDto.TrainRequest request) {
        log.info("POST /training - 모델 학습 시작: {}", request.getModelId());
        trainingService.trainModel(request);
        return ResponseEntity.status(HttpStatus.ACCEPTED).build();
    }
    
    @GetMapping("/history/{modelId}")
    public ResponseEntity<List<TrainingHistoryDto.Response>> getTrainingHistory(@PathVariable Long modelId) {
        log.info("GET /training/history/{} - 학습 이력 조회", modelId);
        List<TrainingHistoryDto.Response> history = trainingService.getTrainingHistory(modelId);
        return ResponseEntity.ok(history);
    }
}
