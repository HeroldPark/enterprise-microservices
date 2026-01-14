package com.enterprise.model.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "models")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Model {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, length = 100)
    private String name;
    
    @Column(nullable = false, length = 50)
    @Enumerated(EnumType.STRING)
    private ModelType type;
    
    @Column(length = 500)
    private String description;
    
    @Column(nullable = false, length = 50)
    private String createdBy;
    
    @Column(nullable = false, length = 20)
    @Enumerated(EnumType.STRING)
    @Builder.Default
    private ModelStatus status = ModelStatus.CREATED;
    
    @Column(length = 500)
    private String modelPath;
    
    @Column(length = 500)
    private String datasetPath;
    
    // Training configuration as JSON
    @Column(columnDefinition = "TEXT")
    private String config;
    
    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(nullable = false)
    private LocalDateTime updatedAt;
    
    @OneToMany(mappedBy = "model", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<TrainingHistory> trainingHistories = new ArrayList<>();
    
    @OneToMany(mappedBy = "model", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Prediction> predictions = new ArrayList<>();
    
    public enum ModelType {
        ISOLATION_FOREST,
        LSTM,
        GRU,
        RANDOM_FOREST,
        XGBOOST
    }
    
    public enum ModelStatus {
        CREATED,
        TRAINING,
        TRAINED,
        FAILED,
        DEPLOYED,
        ARCHIVED
    }
}
