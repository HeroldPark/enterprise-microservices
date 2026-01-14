package com.enterprise.model.dto;

import lombok.*;

import java.time.LocalDateTime;

public class TrainingHistoryDto {
    
    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Response {
        private Long id;
        private Long modelId;
        private Integer epoch;
        private Double trainingLoss;
        private Double validationLoss;
        private Double trainingAccuracy;
        private Double validationAccuracy;
        private String metrics;
        private LocalDateTime createdAt;
    }
}
