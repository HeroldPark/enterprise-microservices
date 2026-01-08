package com.enterprise.admin.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

/**
 * 모델 설정 엔티티
 * ML/AI 모델의 하이퍼파라미터 및 설정 관리
 */
@Entity
@Table(name = "model_configs")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ModelConfig {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    /**
     * 모델 타입
     * ISOLATION_FOREST, LSTM, GRU, RANDOM_FOREST, XGBOOST
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "model_type", nullable = false, length = 30)
    private ModelType modelType;
    
    /**
     * 설정 이름 (고유값)
     * 예: "production", "dev", "test", "custom_v1"
     */
    @Column(name = "config_name", nullable = false, length = 100)
    private String configName;
    
    /**
     * 설정 설명
     */
    @Column(columnDefinition = "TEXT")
    private String description;
    
    /**
     * 하이퍼파라미터 (JSON 형태)
     * 모델별로 다른 파라미터 저장
     */
    @Column(columnDefinition = "JSON")
    private String parameters;
    
    /**
     * 모델 버전
     */
    @Column(length = 20)
    private String version;
    
    /**
     * 학습 데이터셋 정보
     */
    @Column(name = "training_dataset")
    private String trainingDataset;
    
    /**
     * 정확도/성능 메트릭
     */
    @Column
    private Double accuracy;
    
    /**
     * F1 스코어
     */
    @Column
    private Double f1Score;
    
    /**
     * 기본 설정 여부 (모델별 하나만 기본)
     */
    @Column(name = "is_default")
    @Builder.Default  // ✅ 추가: Builder 사용 시에도 기본값 적용
    private Boolean isDefault = false;
    
    /**
     * 활성화 여부
     */
    @Column(name = "is_active")
    @Builder.Default  // ✅ 추가: Builder 사용 시에도 기본값 적용
    private Boolean isActive = true;
    
    /**
     * 환경 (DEVELOPMENT, STAGING, PRODUCTION)
     */
    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    @Builder.Default  // ✅ 추가: Builder 사용 시에도 기본값 적용
    private Environment environment = Environment.DEVELOPMENT;
    
    /**
     * 마지막 학습 일시
     */
    @Column(name = "last_trained_at")
    private LocalDateTime lastTrainedAt;
    
    /**
     * 생성자/수정자
     */
    @Column(name = "created_by")
    private String createdBy;
    
    @Column(name = "updated_by")
    private String updatedBy;
    
    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    /**
     * 모델 타입 열거형
     */
    public enum ModelType {
        ISOLATION_FOREST("Isolation Forest", "이상치 탐지"),
        LSTM("LSTM", "시계열 예측"),
        GRU("GRU", "시계열 예측"),
        RANDOM_FOREST("Random Forest", "분류/회귀"),
        XGBOOST("XGBoost", "분류/회귀");
        
        private final String displayName;
        private final String description;
        
        ModelType(String displayName, String description) {
            this.displayName = displayName;
            this.description = description;
        }
        
        public String getDisplayName() {
            return displayName;
        }
        
        public String getDescription() {
            return description;
        }
    }
    
    /**
     * 환경 열거형
     */
    public enum Environment {
        DEVELOPMENT("개발"),
        STAGING("스테이징"),
        PRODUCTION("운영");
        
        private final String displayName;
        
        Environment(String displayName) {
            this.displayName = displayName;
        }
        
        public String getDisplayName() {
            return displayName;
        }
    }
}