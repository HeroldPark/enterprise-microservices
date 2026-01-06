package com.enterprise.admin.controller;

import com.enterprise.admin.dto.MenuDto;
import com.enterprise.admin.service.MenuService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;

@Slf4j
@RestController
@RequestMapping("/admin/menus")
@RequiredArgsConstructor
@Tag(name = "Menu Management", description = "메뉴 관리 API")
public class MenuController {

    private final MenuService menuService;

    @GetMapping
    @Operation(summary = "모든 메뉴 조회", description = "시스템에 등록된 모든 메뉴를 조회합니다.")
    public ResponseEntity<List<MenuDto.Response>> getAllMenus() {
        log.info("GET /admin/menus - 모든 메뉴 조회 요청");
        List<MenuDto.Response> menus = menuService.getAllMenus();
        return ResponseEntity.ok(menus);
    }

    @GetMapping("/{id}")
    @Operation(summary = "특정 메뉴 조회", description = "ID로 특정 메뉴를 조회합니다.")
    public ResponseEntity<MenuDto.Response> getMenuById(
            @Parameter(description = "메뉴 ID") @PathVariable String id) {
        log.info("GET /admin/menus/{} - 메뉴 조회 요청", id);
        MenuDto.Response menu = menuService.getMenuById(id);
        return ResponseEntity.ok(menu);
    }

    @GetMapping("/role/{role}")
    @Operation(summary = "권한별 메뉴 조회", description = "특정 권한으로 필터링된 메뉴를 조회합니다.")
    public ResponseEntity<List<MenuDto.Response>> getMenusByRole(
            @Parameter(description = "사용자 권한 (GUEST, USER, MANAGER, ADMIN)") @PathVariable String role) {
        log.info("GET /admin/menus/role/{} - 권한별 메뉴 조회 요청", role);
        List<MenuDto.Response> menus = menuService.getMenusByRole(role);
        return ResponseEntity.ok(menus);
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "새 메뉴 생성", description = "새로운 메뉴를 생성합니다. (ADMIN 권한 필요)")
    public ResponseEntity<MenuDto.Response> createMenu(
            @Valid @RequestBody MenuDto.CreateRequest request) {
        log.info("POST /admin/menus - 메뉴 생성 요청: {}", request.getId());
        MenuDto.Response menu = menuService.createMenu(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(menu);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "메뉴 수정", description = "기존 메뉴를 수정합니다. (ADMIN 권한 필요)")
    public ResponseEntity<MenuDto.Response> updateMenu(
            @Parameter(description = "메뉴 ID") @PathVariable String id,
            @Valid @RequestBody MenuDto.UpdateRequest request) {
        log.info("PUT /admin/menus/{} - 메뉴 수정 요청", id);
        MenuDto.Response menu = menuService.updateMenu(id, request);
        return ResponseEntity.ok(menu);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "메뉴 삭제", description = "메뉴를 삭제합니다. (ADMIN 권한 필요)")
    public ResponseEntity<Void> deleteMenu(
            @Parameter(description = "메뉴 ID") @PathVariable String id) {
        log.info("DELETE /admin/menus/{} - 메뉴 삭제 요청", id);
        menuService.deleteMenu(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/reorder")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "메뉴 순서 변경", description = "여러 메뉴의 순서를 일괄 변경합니다. (ADMIN 권한 필요)")
    public ResponseEntity<Void> updateMenuOrder(
            @Valid @RequestBody List<MenuDto.MenuOrderRequest> orderRequests) {
        log.info("PUT /admin/menus/reorder - 메뉴 순서 변경 요청: {} 건", orderRequests.size());
        menuService.updateMenuOrder(orderRequests);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{parentMenuId}/submenu")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "서브메뉴 생성", description = "특정 메뉴에 서브메뉴를 추가합니다. (ADMIN 권한 필요)")
    public ResponseEntity<MenuDto.Response> createSubMenu(
            @Parameter(description = "부모 메뉴 ID") @PathVariable String parentMenuId,
            @Valid @RequestBody MenuDto.SubMenuItemDto subMenuDto) {
        log.info("POST /admin/menus/{}/submenu - 서브메뉴 생성 요청", parentMenuId);
        MenuDto.Response menu = menuService.createSubMenu(parentMenuId, subMenuDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(menu);
    }

    @PutMapping("/{parentMenuId}/submenu/{subMenuId}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "서브메뉴 수정", description = "서브메뉴를 수정합니다. (ADMIN 권한 필요)")
    public ResponseEntity<MenuDto.Response> updateSubMenu(
            @Parameter(description = "부모 메뉴 ID") @PathVariable String parentMenuId,
            @Parameter(description = "서브메뉴 ID") @PathVariable String subMenuId,
            @Valid @RequestBody MenuDto.SubMenuItemDto subMenuDto) {
        log.info("PUT /admin/menus/{}/submenu/{} - 서브메뉴 수정 요청", parentMenuId, subMenuId);
        MenuDto.Response menu = menuService.updateSubMenu(parentMenuId, subMenuId, subMenuDto);
        return ResponseEntity.ok(menu);
    }

    @DeleteMapping("/{parentMenuId}/submenu/{subMenuId}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "서브메뉴 삭제", description = "서브메뉴를 삭제합니다. (ADMIN 권한 필요)")
    public ResponseEntity<MenuDto.Response> deleteSubMenu(
            @Parameter(description = "부모 메뉴 ID") @PathVariable String parentMenuId,
            @Parameter(description = "서브메뉴 ID") @PathVariable String subMenuId) {
        log.info("DELETE /admin/menus/{}/submenu/{} - 서브메뉴 삭제 요청", parentMenuId, subMenuId);
        MenuDto.Response menu = menuService.deleteSubMenu(parentMenuId, subMenuId);
        return ResponseEntity.ok(menu);
    }
}
