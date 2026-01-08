package com.enterprise.admin.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

public class StatsResponseDto {
    
    /**
     * 대시보드 통계 응답 DTO
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class StatsResponse {
        private Long totalUsers;
        private Long activeUsers;
        private Long inactiveUsers;
        private Long loginUsers;
        private Long totalMenus;
        private Long totalBoards;
        private Long todayBoards;
        private List<ActivityResponse> recentActivities;
    }
    
    /**
     * 활동 로그 응답 DTO
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ActivityResponse {
        private Long id;
        private String action;
        private String description;
        private String user;
        private String username;
        private String userId;
        private LocalDateTime timestamp;
        private String time;
        private String type;
    }
}