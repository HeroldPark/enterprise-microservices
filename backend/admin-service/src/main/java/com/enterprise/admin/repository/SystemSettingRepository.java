package com.enterprise.admin.repository;

import com.enterprise.admin.entity.SystemSetting;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SystemSettingRepository extends JpaRepository<SystemSetting, Long> {
    
    /**
     * Key로 설정 조회
     */
    Optional<SystemSetting> findByKey(String key);
    
    /**
     * 카테고리별 설정 조회
     */
    List<SystemSetting> findByCategory(SystemSetting.Category category);
    
    /**
     * 활성화된 설정만 조회
     */
    List<SystemSetting> findByIsActive(Boolean isActive);
    
    /**
     * 카테고리 + 활성화 상태로 조회
     */
    List<SystemSetting> findByCategoryAndIsActive(SystemSetting.Category category, Boolean isActive);
    
    /**
     * Key 존재 여부 확인
     */
    boolean existsByKey(String key);
}