package com.enterprise.model.repository;

import com.enterprise.model.entity.TrainingHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TrainingHistoryRepository extends JpaRepository<TrainingHistory, Long> {
    
    List<TrainingHistory> findByModelIdOrderByEpochAsc(Long modelId);
    
    @Query("SELECT th FROM TrainingHistory th WHERE th.model.id = :modelId ORDER BY th.epoch DESC")
    List<TrainingHistory> findLatestByModelId(Long modelId);
    
    @Query("SELECT th FROM TrainingHistory th WHERE th.model.id = :modelId ORDER BY th.validationLoss ASC")
    List<TrainingHistory> findBestByModelId(Long modelId);
}
