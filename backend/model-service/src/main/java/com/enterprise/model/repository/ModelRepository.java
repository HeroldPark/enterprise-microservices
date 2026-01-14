package com.enterprise.model.repository;

import com.enterprise.model.entity.Model;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ModelRepository extends JpaRepository<Model, Long> {
    
    Page<Model> findByType(Model.ModelType type, Pageable pageable);
    
    Page<Model> findByStatus(Model.ModelStatus status, Pageable pageable);
    
    Page<Model> findByCreatedBy(String createdBy, Pageable pageable);
    
    Page<Model> findByNameContaining(String name, Pageable pageable);
    
    Optional<Model> findByNameAndCreatedBy(String name, String createdBy);
    
    List<Model> findByTypeAndStatus(Model.ModelType type, Model.ModelStatus status);
    
    @Query("SELECT COUNT(m) FROM Model m")
    long countAllModels();
    
    @Query("SELECT COUNT(m) FROM Model m WHERE m.status = :status")
    long countByStatus(Model.ModelStatus status);
    
    @Query("SELECT m.type, COUNT(m) FROM Model m GROUP BY m.type")
    List<Object[]> countByType();
}
