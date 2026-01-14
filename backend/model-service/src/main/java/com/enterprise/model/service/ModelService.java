package com.enterprise.model.service;

import com.enterprise.model.dto.ModelDto;
import com.enterprise.model.dto.PredictionDto;
import com.enterprise.model.dto.TrainingHistoryDto;
import com.enterprise.model.entity.Model;
import com.enterprise.model.entity.Prediction;
import com.enterprise.model.entity.TrainingHistory;
import com.enterprise.model.exception.ResourceNotFoundException;
import com.enterprise.model.repository.ModelRepository;
import com.enterprise.model.repository.PredictionRepository;
import com.enterprise.model.repository.TrainingHistoryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ModelService {
    
    private final ModelRepository modelRepository;
    private final TrainingHistoryRepository trainingHistoryRepository;
    private final PredictionRepository predictionRepository;
    
    @Transactional
    public ModelDto.Response createModel(ModelDto.CreateRequest request) {
        log.info("Creating model: {}", request.getName());
        
        Model model = Model.builder()
                .name(request.getName())
                .type(request.getType())
                .description(request.getDescription())
                .createdBy(request.getCreatedBy())
                .datasetPath(request.getDatasetPath())
                .config(request.getConfig())
                .status(Model.ModelStatus.CREATED)
                .build();
        
        model = modelRepository.save(model);
        return toResponse(model);
    }
    
    @Transactional(readOnly = true)
    public Page<ModelDto.Response> getAllModels(Pageable pageable) {
        log.info("Getting all models");
        return modelRepository.findAll(pageable).map(this::toResponse);
    }
    
    @Transactional(readOnly = true)
    public ModelDto.DetailResponse getModel(Long id) {
        log.info("Getting model: {}", id);
        Model model = findModelById(id);
        
        List<TrainingHistoryDto.Response> histories = trainingHistoryRepository
                .findByModelIdOrderByEpochAsc(id)
                .stream()
                .map(this::toTrainingHistoryResponse)
                .collect(Collectors.toList());
        
        Long predictionCount = predictionRepository.countByModelId(id);
        Double avgConfidence = predictionRepository.averageConfidenceByModelId(id);
        
        return ModelDto.DetailResponse.builder()
                .id(model.getId())
                .name(model.getName())
                .type(model.getType())
                .description(model.getDescription())
                .createdBy(model.getCreatedBy())
                .status(model.getStatus())
                .modelPath(model.getModelPath())
                .datasetPath(model.getDatasetPath())
                .config(model.getConfig())
                .createdAt(model.getCreatedAt())
                .updatedAt(model.getUpdatedAt())
                .trainingHistories(histories)
                .predictionCount(predictionCount)
                .averageConfidence(avgConfidence)
                .build();
    }
    
    @Transactional
    public ModelDto.Response updateModel(Long id, ModelDto.UpdateRequest request) {
        log.info("Updating model: {}", id);
        Model model = findModelById(id);
        
        if (request.getName() != null) {
            model.setName(request.getName());
        }
        if (request.getDescription() != null) {
            model.setDescription(request.getDescription());
        }
        if (request.getStatus() != null) {
            model.setStatus(request.getStatus());
        }
        if (request.getConfig() != null) {
            model.setConfig(request.getConfig());
        }
        
        model = modelRepository.save(model);
        return toResponse(model);
    }
    
    @Transactional
    public void deleteModel(Long id) {
        log.info("Deleting model: {}", id);
        Model model = findModelById(id);
        modelRepository.delete(model);
    }
    
    @Transactional(readOnly = true)
    public Page<ModelDto.Response> searchByName(String name, Pageable pageable) {
        log.info("Searching models by name: {}", name);
        return modelRepository.findByNameContaining(name, pageable)
                .map(this::toResponse);
    }
    
    @Transactional(readOnly = true)
    public Page<ModelDto.Response> getModelsByType(Model.ModelType type, Pageable pageable) {
        log.info("Getting models by type: {}", type);
        return modelRepository.findByType(type, pageable)
                .map(this::toResponse);
    }
    
    @Transactional(readOnly = true)
    public Page<ModelDto.Response> getModelsByStatus(Model.ModelStatus status, Pageable pageable) {
        log.info("Getting models by status: {}", status);
        return modelRepository.findByStatus(status, pageable)
                .map(this::toResponse);
    }
    
    @Transactional(readOnly = true)
    public Map<String, Object> getModelStats() {
        log.info("Getting model statistics");
        
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalModels", modelRepository.countAllModels());
        stats.put("trainedModels", modelRepository.countByStatus(Model.ModelStatus.TRAINED));
        stats.put("trainingModels", modelRepository.countByStatus(Model.ModelStatus.TRAINING));
        stats.put("deployedModels", modelRepository.countByStatus(Model.ModelStatus.DEPLOYED));
        
        List<Object[]> typeStats = modelRepository.countByType();
        Map<String, Long> modelsByType = new HashMap<>();
        for (Object[] stat : typeStats) {
            modelsByType.put(stat[0].toString(), (Long) stat[1]);
        }
        stats.put("modelsByType", modelsByType);
        
        return stats;
    }
    
    private Model findModelById(Long id) {
        return modelRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Model not found with id: " + id));
    }
    
    private ModelDto.Response toResponse(Model model) {
        return ModelDto.Response.builder()
                .id(model.getId())
                .name(model.getName())
                .type(model.getType())
                .description(model.getDescription())
                .createdBy(model.getCreatedBy())
                .status(model.getStatus())
                .modelPath(model.getModelPath())
                .datasetPath(model.getDatasetPath())
                .config(model.getConfig())
                .createdAt(model.getCreatedAt())
                .updatedAt(model.getUpdatedAt())
                .build();
    }
    
    private TrainingHistoryDto.Response toTrainingHistoryResponse(TrainingHistory history) {
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
