package com.enterprise.model.repository;

import com.enterprise.model.entity.Prediction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface PredictionRepository extends JpaRepository<Prediction, Long> {
    
    Page<Prediction> findByModelId(Long modelId, Pageable pageable);
    
    Page<Prediction> findByPredictedBy(String predictedBy, Pageable pageable);
    
    List<Prediction> findByModelIdAndCreatedAtBetween(
        Long modelId, 
        LocalDateTime start, 
        LocalDateTime end
    );
    
    @Query("SELECT COUNT(p) FROM Prediction p WHERE p.model.id = :modelId")
    long countByModelId(Long modelId);
    
    @Query("SELECT AVG(p.confidence) FROM Prediction p WHERE p.model.id = :modelId")
    Double averageConfidenceByModelId(Long modelId);
}
