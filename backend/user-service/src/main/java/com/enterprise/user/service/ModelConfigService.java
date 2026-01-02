package com.enterprise.user.service;

import com.enterprise.user.dto.ModelConfigDto;
import com.enterprise.user.entity.ModelConfig;
import com.enterprise.user.exception.ResourceNotFoundException;
import com.enterprise.user.repository.ModelConfigRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ModelConfigService {
    
    private final ModelConfigRepository configRepository;
    
    /**
     * 모든 모델 설정 조회 (페이징)
     */
    public Page<ModelConfigDto> getAllConfigs(Pageable pageable) {
        log.info("Fetching all model configs with pagination");
        return configRepository.findAll(pageable)
                .map(this::toDto);
    }
    
    /**
     * 모델 타입별 설정 조회
     */
    public List<ModelConfigDto> getConfigsByModelType(ModelConfig.ModelType modelType) {
        log.info("Fetching configs for model type: {}", modelType);
        return configRepository.findByModelType(modelType).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }
    
    /**
     * ID로 설정 조회
     */
    public ModelConfigDto getConfigById(Long id) {
        log.info("Fetching config by id: {}", id);
        ModelConfig config = configRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Config not found with id: " + id));
        return toDto(config);
    }
    
    /**
     * 기본 설정 조회
     */
    public ModelConfigDto getDefaultConfig(ModelConfig.ModelType modelType) {
        log.info("Fetching default config for model type: {}", modelType);
        return configRepository.findByModelTypeAndIsDefault(modelType, true)
                .map(this::toDto)
                .orElseThrow(() -> new ResourceNotFoundException("No default config found for model: " + modelType));
    }
    
    /**
     * 설정 생성
     */
    @Transactional
    public ModelConfigDto createConfig(ModelConfigDto dto) {
        log.info("Creating new model config: {} - {}", dto.getModelType(), dto.getConfigName());
        
        // 중복 체크
        if (configRepository.existsByModelTypeAndConfigName(dto.getModelType(), dto.getConfigName())) {
            throw new IllegalArgumentException("Config already exists: " + dto.getConfigName());
        }
        
        // 기본 설정으로 지정 시, 기존 기본 설정 해제
        if (Boolean.TRUE.equals(dto.getIsDefault())) {
            unsetDefaultConfig(dto.getModelType());
        }
        
        ModelConfig config = ModelConfig.builder()
                .modelType(dto.getModelType())
                .configName(dto.getConfigName())
                .description(dto.getDescription())
                .parameters(dto.getParameters())
                .version(dto.getVersion())
                .trainingDataset(dto.getTrainingDataset())
                .accuracy(dto.getAccuracy())
                .f1Score(dto.getF1Score())
                .isDefault(dto.getIsDefault() != null ? dto.getIsDefault() : false)
                .isActive(dto.getIsActive() != null ? dto.getIsActive() : true)
                .environment(dto.getEnvironment() != null ? dto.getEnvironment() : ModelConfig.Environment.DEVELOPMENT)
                .lastTrainedAt(dto.getLastTrainedAt())
                .createdBy(getCurrentUsername())
                .updatedBy(getCurrentUsername())
                .build();
        
        ModelConfig saved = configRepository.save(config);
        log.info("Model config created successfully: {}", saved.getId());
        return toDto(saved);
    }
    
    /**
     * 설정 수정
     */
    @Transactional
    public ModelConfigDto updateConfig(Long id, ModelConfigDto dto) {
        log.info("Updating model config: {}", id);
        
        ModelConfig config = configRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Config not found with id: " + id));
        
        // 이름 변경 시 중복 체크
        if (!config.getConfigName().equals(dto.getConfigName()) &&
            configRepository.existsByModelTypeAndConfigName(dto.getModelType(), dto.getConfigName())) {
            throw new IllegalArgumentException("Config name already exists: " + dto.getConfigName());
        }
        
        // 기본 설정으로 변경 시, 기존 기본 설정 해제
        if (Boolean.TRUE.equals(dto.getIsDefault()) && !Boolean.TRUE.equals(config.getIsDefault())) {
            unsetDefaultConfig(dto.getModelType());
        }
        
        config.setModelType(dto.getModelType());
        config.setConfigName(dto.getConfigName());
        config.setDescription(dto.getDescription());
        config.setParameters(dto.getParameters());
        config.setVersion(dto.getVersion());
        config.setTrainingDataset(dto.getTrainingDataset());
        config.setAccuracy(dto.getAccuracy());
        config.setF1Score(dto.getF1Score());
        config.setIsDefault(dto.getIsDefault());
        config.setIsActive(dto.getIsActive());
        config.setEnvironment(dto.getEnvironment());
        config.setLastTrainedAt(dto.getLastTrainedAt());
        config.setUpdatedBy(getCurrentUsername());
        
        ModelConfig updated = configRepository.save(config);
        log.info("Model config updated successfully: {}", updated.getId());
        return toDto(updated);
    }
    
    /**
     * 설정 삭제
     */
    @Transactional
    public void deleteConfig(Long id) {
        log.info("Deleting model config: {}", id);
        
        ModelConfig config = configRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Config not found with id: " + id));
        
        // 기본 설정은 삭제 불가
        if (Boolean.TRUE.equals(config.getIsDefault())) {
            throw new IllegalStateException("Cannot delete default config. Set another config as default first.");
        }
        
        configRepository.deleteById(id);
        log.info("Model config deleted successfully: {}", id);
    }
    
    /**
     * 활성화/비활성화 토글
     */
    @Transactional
    public ModelConfigDto toggleConfig(Long id) {
        log.info("Toggling model config: {}", id);
        
        ModelConfig config = configRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Config not found with id: " + id));
        
        config.setIsActive(!config.getIsActive());
        config.setUpdatedBy(getCurrentUsername());
        
        ModelConfig updated = configRepository.save(config);
        log.info("Config toggled: {} - isActive: {}", id, updated.getIsActive());
        return toDto(updated);
    }
    
    /**
     * 기본 설정으로 지정
     */
    @Transactional
    public ModelConfigDto setAsDefault(Long id) {
        log.info("Setting config as default: {}", id);
        
        ModelConfig config = configRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Config not found with id: " + id));
        
        // 기존 기본 설정 해제
        unsetDefaultConfig(config.getModelType());
        
        // 새로운 기본 설정 지정
        config.setIsDefault(true);
        config.setUpdatedBy(getCurrentUsername());
        
        ModelConfig updated = configRepository.save(config);
        log.info("Config set as default: {}", id);
        return toDto(updated);
    }
    
    /**
     * 설정 복제
     */
    @Transactional
    public ModelConfigDto cloneConfig(Long id, String newConfigName) {
        log.info("Cloning config: {} to {}", id, newConfigName);
        
        ModelConfig original = configRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Config not found with id: " + id));
        
        if (configRepository.existsByModelTypeAndConfigName(original.getModelType(), newConfigName)) {
            throw new IllegalArgumentException("Config name already exists: " + newConfigName);
        }
        
        ModelConfig cloned = ModelConfig.builder()
                .modelType(original.getModelType())
                .configName(newConfigName)
                .description(original.getDescription() + " (복제본)")
                .parameters(original.getParameters())
                .version(original.getVersion())
                .trainingDataset(original.getTrainingDataset())
                .accuracy(original.getAccuracy())
                .f1Score(original.getF1Score())
                .isDefault(false)  // 복제본은 기본 설정 아님
                .isActive(true)
                .environment(original.getEnvironment())
                .createdBy(getCurrentUsername())
                .updatedBy(getCurrentUsername())
                .build();
        
        ModelConfig saved = configRepository.save(cloned);
        log.info("Config cloned successfully: {}", saved.getId());
        return toDto(saved);
    }
    
    /**
     * 기존 기본 설정 해제
     */
    private void unsetDefaultConfig(ModelConfig.ModelType modelType) {
        configRepository.findByModelTypeAndIsDefault(modelType, true)
                .ifPresent(existing -> {
                    existing.setIsDefault(false);
                    configRepository.save(existing);
                    log.info("Unset previous default config for model type: {}", modelType);
                });
    }
    
    /**
     * Entity to DTO
     */
    private ModelConfigDto toDto(ModelConfig config) {
        return ModelConfigDto.builder()
                .id(config.getId())
                .modelType(config.getModelType())
                .configName(config.getConfigName())
                .description(config.getDescription())
                .parameters(config.getParameters())
                .version(config.getVersion())
                .trainingDataset(config.getTrainingDataset())
                .accuracy(config.getAccuracy())
                .f1Score(config.getF1Score())
                .isDefault(config.getIsDefault())
                .isActive(config.getIsActive())
                .environment(config.getEnvironment())
                .lastTrainedAt(config.getLastTrainedAt())
                .createdBy(config.getCreatedBy())
                .updatedBy(config.getUpdatedBy())
                .createdAt(config.getCreatedAt())
                .updatedAt(config.getUpdatedAt())
                .build();
    }
    
    /**
     * 현재 로그인한 사용자명
     */
    private String getCurrentUsername() {
        try {
            return SecurityContextHolder.getContext().getAuthentication().getName();
        } catch (Exception e) {
            return "system";
        }
    }
}