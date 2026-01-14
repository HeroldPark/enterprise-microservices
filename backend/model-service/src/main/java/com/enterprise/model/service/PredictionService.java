package com.enterprise.model.service;

import com.enterprise.model.dto.ModelDto;
import com.enterprise.model.dto.PredictionDto;
import com.enterprise.model.entity.Model;
import com.enterprise.model.entity.Prediction;
import com.enterprise.model.exception.ModelException;
import com.enterprise.model.exception.ResourceNotFoundException;
import com.enterprise.model.repository.ModelRepository;
import com.enterprise.model.repository.PredictionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Random;

@Slf4j
@Service
@RequiredArgsConstructor
public class PredictionService {
    
    private final ModelRepository modelRepository;
    private final PredictionRepository predictionRepository;
    
    @Transactional
    public PredictionDto.Response predict(ModelDto.PredictRequest request) {
        log.info("Making prediction with model: {}", request.getModelId());
        
        Model model = modelRepository.findById(request.getModelId())
                .orElseThrow(() -> new ResourceNotFoundException("Model not found with id: " + request.getModelId()));
        
        if (model.getStatus() != Model.ModelStatus.TRAINED && 
            model.getStatus() != Model.ModelStatus.DEPLOYED) {
            throw new ModelException("Model is not ready for prediction. Status: " + model.getStatus());
        }
        
        // Simulate prediction
        String outputData = simulatePrediction(model, request.getInputData());
        double confidence = 0.7 + new Random().nextDouble() * 0.3; // 0.7 ~ 1.0
        
        Prediction prediction = Prediction.builder()
                .model(model)
                .inputData(request.getInputData())
                .outputData(outputData)
                .confidence(confidence)
                .predictedBy(request.getPredictedBy())
                .metadata(request.getMetadata())
                .build();
        
        prediction = predictionRepository.save(prediction);
        
        return toResponse(prediction);
    }
    
    @Transactional(readOnly = true)
    public Page<PredictionDto.Response> getPredictionsByModel(Long modelId, Pageable pageable) {
        log.info("Getting predictions for model: {}", modelId);
        return predictionRepository.findByModelId(modelId, pageable)
                .map(this::toResponse);
    }
    
    @Transactional(readOnly = true)
    public Page<PredictionDto.Response> getPredictionsByUser(String username, Pageable pageable) {
        log.info("Getting predictions by user: {}", username);
        return predictionRepository.findByPredictedBy(username, pageable)
                .map(this::toResponse);
    }
    
    private String simulatePrediction(Model model, String inputData) {
        // Simulate different prediction outputs based on model type
        Random random = new Random();
        
        switch (model.getType()) {
            case ISOLATION_FOREST:
                return random.nextBoolean() ? "normal" : "anomaly";
            case LSTM:
            case GRU:
                return String.format("%.4f", random.nextDouble() * 100);
            case RANDOM_FOREST:
            case XGBOOST:
                return random.nextBoolean() ? "class_A" : "class_B";
            default:
                return "predicted_value";
        }
    }
    
    private PredictionDto.Response toResponse(Prediction prediction) {
        return PredictionDto.Response.builder()
                .id(prediction.getId())
                .modelId(prediction.getModel().getId())
                .modelName(prediction.getModel().getName())
                .inputData(prediction.getInputData())
                .outputData(prediction.getOutputData())
                .confidence(prediction.getConfidence())
                .predictedBy(prediction.getPredictedBy())
                .metadata(prediction.getMetadata())
                .createdAt(prediction.getCreatedAt())
                .build();
    }
}
