package com.enterprise.admin.repository;

import com.enterprise.admin.entity.ActivityLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ActivityLogRepository extends JpaRepository<ActivityLog, Long> {
    
    /**
     * 최근 5개의 활동 로그 조회 (생성일 기준 내림차순)
     */
    List<ActivityLog> findTop5ByOrderByCreatedAtDesc();
    
    /**
     * 특정 날짜 이후의 활동 로그 조회
     */
    @Query("SELECT a FROM ActivityLog a WHERE a.createdAt >= :startDate ORDER BY a.createdAt DESC")
    List<ActivityLog> findRecentActivities(@Param("startDate") LocalDateTime startDate);
    
    /**
     * 특정 사용자의 활동 로그 조회
     */
    @Query("SELECT a FROM ActivityLog a WHERE a.user.id = :userId ORDER BY a.createdAt DESC")
    List<ActivityLog> findByUserId(@Param("userId") Long userId);
    
    /**
     * 특정 기간 내의 활동 로그 개수
     */
    @Query("SELECT COUNT(a) FROM ActivityLog a WHERE a.createdAt BETWEEN :startDate AND :endDate")
    Long countByDateRange(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);
}