package com.enterprise.admin.controller;

import com.enterprise.admin.dto.StatsResponseDto.StatsResponse;
import com.enterprise.admin.service.StatsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.Map;
import io.swagger.v3.oas.annotations.Operation;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequestMapping("/admin")
@RequiredArgsConstructor
public class StatsController {
    
    private final StatsService statsService;

    @GetMapping("/dashboard/stats")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<StatsResponse> getDashboardStats() {

        log.debug("GET /admin/dashboard/stats - 대시보드 통계 조회 요청");

        StatsResponse stats = statsService.getDashboardStats();
        return ResponseEntity.ok(stats);
    }

    /**
     * 메뉴 통계 조회
     */
    @GetMapping("/menus/stats")
    @Operation(summary = "메뉴 통계 조회", description = "메뉴 관련 통계 정보를 조회합니다.")
    public ResponseEntity<Map<String, Object>> getMenuStats() {
        
        log.debug("GET /admin/menus/stats - 메뉴 통계 조회 요청");

        Map<String, Object> stats = statsService.getMenuStats();
        return ResponseEntity.ok(stats);
    }

}