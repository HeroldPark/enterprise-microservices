package com.enterprise.model.service;

import com.enterprise.model.dto.ModelDto;
import com.enterprise.model.dto.TrainingHistoryDto;
import com.enterprise.model.entity.Model;
import com.enterprise.model.entity.TrainingHistory;
import com.enterprise.model.exception.ModelException;
import com.enterprise.model.exception.ResourceNotFoundException;
import com.enterprise.model.repository.ModelRepository;
import com.enterprise.model.repository.TrainingHistoryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Random;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class TrainingService {
    
    private final ModelRepository modelRepository;
    private final TrainingHistoryRepository trainingHistoryRepository;
    
    @Transactional
    public void trainModel(ModelDto.TrainRequest request) {
        log.info("Starting training for model: {}", request.getModelId());
        
        Model model = modelRepository.findById(request.getModelId())
                .orElseThrow(() -> new ResourceNotFoundException("Model not found with id: " + request.getModelId()));
        
        if (model.getStatus() == Model.ModelStatus.TRAINING) {
            throw new ModelException("Model is already training");
        }
        
        model.setStatus(Model.ModelStatus.TRAINING);
        modelRepository.save(model);
        
        try {
            // Simulate training process
            int epochs = request.getEpochs() != null ? request.getEpochs() : 10;
            simulateTraining(model, epochs);
            
            model.setStatus(Model.ModelStatus.TRAINED);
            model.setModelPath("./models/model_" + model.getId() + ".pkl");
            modelRepository.save(model);
            
            log.info("Training completed for model: {}", model.getId());
        } catch (Exception e) {
            model.setStatus(Model.ModelStatus.FAILED);
            modelRepository.save(model);
            log.error("Training failed for model: {}", model.getId(), e);
            throw new ModelException("Training failed: " + e.getMessage());
        }
    }
    
    @Transactional(readOnly = true)
    public List<TrainingHistoryDto.Response> getTrainingHistory(Long modelId) {
        log.info("Getting training history for model: {}", modelId);
        
        return trainingHistoryRepository.findByModelIdOrderByEpochAsc(modelId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }
    
    private void simulateTraining(Model model, int epochs) {
        Random random = new Random();
        double initialLoss = 1.0;
        double initialAccuracy = 0.5;
        
        for (int epoch = 1; epoch <= epochs; epoch++) {
            // Simulate decreasing loss and increasing accuracy
            double trainingLoss = initialLoss * Math.exp(-0.1 * epoch) + random.nextDouble() * 0.05;
            double validationLoss = trainingLoss + random.nextDouble() * 0.1;
            double trainingAccuracy = 1 - (initialAccuracy * Math.exp(-0.1 * epoch)) + random.nextDouble() * 0.05;
            double validationAccuracy = trainingAccuracy - random.nextDouble() * 0.05;
            
            TrainingHistory history = TrainingHistory.builder()
                    .model(model)
                    .epoch(epoch)
                    .trainingLoss(trainingLoss)
                    .validationLoss(validationLoss)
                    .trainingAccuracy(Math.min(trainingAccuracy, 1.0))
                    .validationAccuracy(Math.min(validationAccuracy, 1.0))
                    .metrics(String.format("{\"precision\": %.4f, \"recall\": %.4f}", 
                            0.7 + random.nextDouble() * 0.2, 
                            0.7 + random.nextDouble() * 0.2))
                    .build();
            
            trainingHistoryRepository.save(history);
            
            // Simulate training delay
            try {
                Thread.sleep(100);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        }
    }
    
    private TrainingHistoryDto.Response toResponse(TrainingHistory history) {
        return TrainingHistoryDto.Response.builder()
                .id(history.getId())
                .modelId(history.getModel().getId())
                .epoch(history.getEpoch())
                .trainingLoss(history.getTrainingLoss())
                .validationLoss(history.getValidationLoss())
                .trainingAccuracy(history.getTrainingAccuracy())
                .validationAccuracy(history.getValidationAccuracy())
                .metrics(history.getMetrics())
                .createdAt(history.getCreatedAt())
                .build();
    }
}
