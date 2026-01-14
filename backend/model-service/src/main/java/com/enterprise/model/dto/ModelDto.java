package com.enterprise.model.dto;

import com.enterprise.model.entity.Model;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

public class ModelDto {
    
    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CreateRequest {
        @NotBlank(message = "Model name is required")
        private String name;
        
        @NotNull(message = "Model type is required")
        private Model.ModelType type;
        
        private String description;
        
        @NotBlank(message = "Creator is required")
        private String createdBy;
        
        private String datasetPath;
        
        private String config;
    }
    
    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class UpdateRequest {
        private String name;
        private String description;
        private Model.ModelStatus status;
        private String config;
    }
    
    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Response {
        private Long id;
        private String name;
        private Model.ModelType type;
        private String description;
        private String createdBy;
        private Model.ModelStatus status;
        private String modelPath;
        private String datasetPath;
        private String config;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
    }
    
    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class DetailResponse {
        private Long id;
        private String name;
        private Model.ModelType type;
        private String description;
        private String createdBy;
        private Model.ModelStatus status;
        private String modelPath;
        private String datasetPath;
        private String config;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
        private List<TrainingHistoryDto.Response> trainingHistories;
        private Long predictionCount;
        private Double averageConfidence;
    }
    
    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class TrainRequest {
        @NotNull(message = "Model ID is required")
        private Long modelId;
        
        private Integer epochs;
        private Integer batchSize;
        private Double learningRate;
        private String config;
    }
    
    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class PredictRequest {
        @NotNull(message = "Model ID is required")
        private Long modelId;
        
        @NotBlank(message = "Input data is required")
        private String inputData;
        
        private String predictedBy;
        private String metadata;
    }
}
