package com.enterprise.model.dto;

import lombok.*;

import java.time.LocalDateTime;

public class PredictionDto {
    
    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Response {
        private Long id;
        private Long modelId;
        private String modelName;
        private String inputData;
        private String outputData;
        private Double confidence;
        private String predictedBy;
        private String metadata;
        private LocalDateTime createdAt;
    }
}
