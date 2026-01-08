package com.enterprise.admin.dto;

import com.enterprise.admin.entity.ModelConfig;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ModelConfigDto {
    
    private Long id;
    private ModelConfig.ModelType modelType;
    private String configName;
    private String description;
    private String parameters;
    private String version;
    private String trainingDataset;
    private Double accuracy;
    private Double f1Score;
    private Boolean isDefault;
    private Boolean isActive;
    private ModelConfig.Environment environment;
    private LocalDateTime lastTrainedAt;
    private String createdBy;
    private String updatedBy;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}