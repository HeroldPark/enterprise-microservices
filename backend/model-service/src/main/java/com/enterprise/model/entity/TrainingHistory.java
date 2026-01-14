package com.enterprise.model.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "training_histories")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TrainingHistory {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "model_id", nullable = false)
    private Model model;
    
    @Column(nullable = false)
    private Integer epoch;
    
    @Column(nullable = false)
    private Double trainingLoss;
    
    private Double validationLoss;
    
    private Double trainingAccuracy;
    
    private Double validationAccuracy;
    
    @Column(columnDefinition = "TEXT")
    private String metrics;
    
    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
