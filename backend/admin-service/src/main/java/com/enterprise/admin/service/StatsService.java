package com.enterprise.admin.service;

import com.enterprise.admin.dto.StatsResponseDto.ActivityResponse;
import com.enterprise.admin.dto.StatsResponseDto.StatsResponse;
import com.enterprise.admin.entity.ActivityLog;
import com.enterprise.admin.repository.ActivityLogRepository;
import com.enterprise.admin.repository.MenuRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.stream.Collectors;
import com.enterprise.admin.entity.Menu;

@Service
@RequiredArgsConstructor
@Slf4j
public class StatsService {
    
    // 로컬 Repository
    private final MenuRepository menuRepository;
    private final ActivityLogRepository activityLogRepository;
    
    // RestTemplate for calling other microservices
    private final RestTemplate restTemplate;
    
    // 다른 마이크로서비스 URL (application.yml에서 주입)
    @Value("${microservices.user-service.url:http://localhost:8081}")
    private String userServiceUrl;
    
    @Value("${microservices.board-service.url:http://localhost:8084}")
    private String boardServiceUrl;
    
    /**
     * 대시보드 통계 조회
     * - Admin Service: 메뉴 통계
     * - User Service: 사용자 통계 (REST 호출)
     * - Board Service: 게시판 통계 (REST 호출)
     */
    public StatsResponse getDashboardStats() {
        log.debug("📊 대시보드 통계 조회 시작");
        
        try {
            // 1. 사용자 통계 (User Service에서 가져오기)
            UserStatsDto userStats = getUserStatsFromUserService();
            
            // 2. 메뉴 통계 (로컬)
            long totalMenus = menuRepository.count();
            log.debug("📋 메뉴 통계: {}", totalMenus);
            
            // 3. 게시판 통계 (Board Service에서 가져오기)
            BoardStatsDto boardStats = getBoardStatsFromBoardService();
            
            // 4. 최근 활동 (로컬 - 최근 5개)
            List<ActivityLog> activities = activityLogRepository.findTop5ByOrderByCreatedAtDesc();
            List<ActivityResponse> activityResponses = activities.stream()
                .map(this::toActivityResponse)
                .collect(Collectors.toList());
            
            log.debug("✅ 대시보드 통계 조회 완료 - Users: {}, Menus: {}, Boards: {}", 
                userStats != null ? userStats.getTotalUsers() : 0, 
                totalMenus, 
                boardStats != null ? boardStats.getTotalBoards() : 0);
            
            return StatsResponse.builder()
                .totalUsers(userStats != null ? userStats.getTotalUsers() : 0L)
                .activeUsers(userStats != null ? userStats.getActiveUsers() : 0L)
                .inactiveUsers(userStats != null ? userStats.getInactiveUsers() : 0L)
                .loginUsers(userStats != null ? userStats.getLoginUsers() : 0L)
                .totalMenus(totalMenus)
                .totalBoards(boardStats != null ? boardStats.getTotalBoards() : 0L)
                .todayBoards(boardStats != null ? boardStats.getTodayBoards() : 0L)
                .recentActivities(activityResponses)
                .build();
                
        } catch (Exception e) {
            log.error("❌ 대시보드 통계 조회 중 오류 발생", e);
            
            // 부분적으로라도 데이터 반환
            long totalMenus = 0;
            try {
                totalMenus = menuRepository.count();
            } catch (Exception menuError) {
                log.error("❌ 메뉴 카운트 실패", menuError);
            }
            
            return StatsResponse.builder()
                .totalUsers(0L)
                .activeUsers(0L)
                .inactiveUsers(0L)
                .totalMenus(totalMenus)
                .totalBoards(0L)
                .todayBoards(0L)
                .recentActivities(Collections.emptyList())
                .build();
        }
    }

    /**
     * User Service에서 사용자 통계 가져오기
     */
    private UserStatsDto getUserStatsFromUserService() {
        try {
            String url = userServiceUrl + "/admin/users/stats";
            log.debug("🔗 User Service 호출: {}", url);
            
            UserStatsDto stats = restTemplate.getForObject(url, UserStatsDto.class);
            log.debug("✅ User Service 응답: totalUsers={}, activeUsers={}, loginUsers={}", 
                stats != null ? stats.getTotalUsers() : 0,
                stats != null ? stats.getActiveUsers() : 0,
                stats != null ? stats.getLoginUsers() : 0);
            
            return stats;
        } catch (Exception e) {
            log.error("❌ User Service 호출 실패: {}", e.getMessage());
            log.debug("상세 오류:", e);
            // 기본값 반환
            return new UserStatsDto(0L, 0L, 0L, 0L);
        }
    }
    
    /**
     * Board Service에서 게시판 통계 가져오기
     */
    private BoardStatsDto getBoardStatsFromBoardService() {
        try {
            String url = boardServiceUrl + "/boards/stats";
            log.info("🔗 Board Service 호출: {}", url);
            
            BoardStatsDto stats = restTemplate.getForObject(url, BoardStatsDto.class);
            log.info("✅ Board Service 응답: totalBoards={}, todayBoards={}", 
                stats != null ? stats.getTotalBoards() : 0, 
                stats != null ? stats.getTodayBoards() : 0);
            
            return stats;
        } catch (Exception e) {
            log.error("❌ Board Service 호출 실패: {}", e.getMessage());
            log.debug("상세 오류:", e);
            // 기본값 반환
            return new BoardStatsDto(0L, 0L);
        }
    }
    
    /**
     * ActivityLog를 ActivityResponse로 변환
     * User entity 사용 버전
     */
    private ActivityResponse toActivityResponse(ActivityLog activityLog) {
        String username = "Unknown";
        String name = "Unknown";
        String userId = "Unknown";
        
        try {
            // User entity에서 정보 가져오기
            if (activityLog.getUser() != null) {
                username = activityLog.getUser().getUsername();
                name = activityLog.getUser().getName();
                userId = activityLog.getUser().getId().toString();
            }
        } catch (Exception e) {
            log.warn("⚠️ 사용자 정보 조회 실패 (ActivityLog ID: {}): {}", 
                activityLog.getId(), e.getMessage());
        }
        
        return ActivityResponse.builder()
            .id(activityLog.getId())
            .action(activityLog.getAction())
            .description(activityLog.getDescription())
            .user(username)
            .username(name)
            .userId(userId)
            .timestamp(activityLog.getCreatedAt())
            .time(getRelativeTime(activityLog.getCreatedAt()))
            .type(activityLog.getType().name())
            .build();
    }
    
    /**
     * 상대 시간 계산 (예: "5분 전")
     */
    private String getRelativeTime(LocalDateTime dateTime) {
        try {
            Duration duration = Duration.between(dateTime, LocalDateTime.now());
            
            if (duration.toMinutes() < 1) return "방금 전";
            if (duration.toMinutes() < 60) return duration.toMinutes() + "분 전";
            if (duration.toHours() < 24) return duration.toHours() + "시간 전";
            return duration.toDays() + "일 전";
        } catch (Exception e) {
            log.warn("⚠️ 상대 시간 계산 실패: {}", e.getMessage());
            return "알 수 없음";
        }
    }

    /**
     * 메뉴 통계 조회
     */
    public Map<String, Object> getMenuStats() {
        log.info("📊 메뉴 통계 조회 시작");
        
        // 전체 메뉴 조회
        List<Menu> allMenus = menuRepository.findAll();
        
        // 전체 메뉴 수
        long totalMenus = allMenus.size();
        
        // 드롭다운 메뉴 수
        long dropdownMenus = allMenus.stream()
            .filter(menu -> Boolean.TRUE.equals(menu.getIsDropdown()))
            .count();
        
        // 일반 메뉴 수 (드롭다운이 아닌)
        long regularMenus = totalMenus - dropdownMenus;
        
        // 전체 서브메뉴 수
        long totalSubMenus = allMenus.stream()
            .filter(menu -> menu.getSubItems() != null)
            .mapToLong(menu -> menu.getSubItems().size())
            .sum();
        
        // 인증 필요 메뉴 수
        long authRequiredMenus = allMenus.stream()
            .filter(menu -> Boolean.TRUE.equals(menu.getRequiresAuth()))
            .count();
        
        // 권한별 메뉴 수 통계
        Map<String, Long> menusByRole = new HashMap<>();
        for (Menu menu : allMenus) {
            if (menu.getRoles() != null) {
                for (String role : menu.getRoles()) {
                    menusByRole.merge(role, 1L, Long::sum);
                }
            }
        }
        
        // 최근 생성된 메뉴 (최근 5개)
        List<Map<String, Object>> recentMenus = allMenus.stream()
            .filter(menu -> menu.getCreatedAt() != null)
            .sorted((m1, m2) -> m2.getCreatedAt().compareTo(m1.getCreatedAt()))
            .limit(5)
            .map(menu -> {
                Map<String, Object> menuInfo = new HashMap<>();
                menuInfo.put("id", menu.getId());
                menuInfo.put("name", menu.getName());
                menuInfo.put("createdAt", menu.getCreatedAt().toString());
                return menuInfo;
            })
            .collect(Collectors.toList());
        
        // 통계 결과 반환
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalMenus", totalMenus);
        stats.put("dropdownMenus", dropdownMenus);
        stats.put("regularMenus", regularMenus);
        stats.put("totalSubMenus", totalSubMenus);
        stats.put("authRequiredMenus", authRequiredMenus);
        stats.put("menusByRole", menusByRole);
        stats.put("recentMenus", recentMenus);
        
        log.info("✅ 메뉴 통계 조회 완료 - 전체: {}, 드롭다운: {}, 서브메뉴: {}", 
            totalMenus, dropdownMenus, totalSubMenus);
        
        return stats;
    }
        
    
    // ============================================
    // 내부 DTO (다른 서비스 응답용)
    // ============================================
    
    /**
     * User Service 통계 응답 DTO
     */
    @lombok.Data
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    public static class UserStatsDto {
        private Long totalUsers;
        private Long activeUsers;
        private Long inactiveUsers;
        private Long loginUsers;
    }
    
    /**
     * Board Service 통계 응답 DTO
     */
    @lombok.Data
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    public static class BoardStatsDto {
        private Long totalBoards;
        private Long todayBoards;
    }
}