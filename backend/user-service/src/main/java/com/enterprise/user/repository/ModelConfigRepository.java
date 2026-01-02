package com.enterprise.user.repository;

import com.enterprise.user.entity.ModelConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ModelConfigRepository extends JpaRepository<ModelConfig, Long> {
    
    /**
     * 모델 타입별 조회
     */
    List<ModelConfig> findByModelType(ModelConfig.ModelType modelType);
    
    /**
     * 모델 타입 + 설정 이름으로 조회
     */
    Optional<ModelConfig> findByModelTypeAndConfigName(
            ModelConfig.ModelType modelType, 
            String configName
    );
    
    /**
     * 활성화된 설정만 조회
     */
    List<ModelConfig> findByIsActive(Boolean isActive);
    
    /**
     * 모델 타입 + 활성화 상태로 조회
     */
    List<ModelConfig> findByModelTypeAndIsActive(
            ModelConfig.ModelType modelType, 
            Boolean isActive
    );
    
    /**
     * 기본 설정 조회
     */
    Optional<ModelConfig> findByModelTypeAndIsDefault(
            ModelConfig.ModelType modelType, 
            Boolean isDefault
    );
    
    /**
     * 환경별 조회
     */
    List<ModelConfig> findByEnvironment(ModelConfig.Environment environment);
    
    /**
     * 설정 이름 존재 여부
     */
    boolean existsByModelTypeAndConfigName(
            ModelConfig.ModelType modelType, 
            String configName
    );
}