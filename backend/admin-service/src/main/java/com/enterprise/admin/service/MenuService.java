package com.enterprise.admin.service;

import com.enterprise.admin.dto.MenuDto;
import com.enterprise.admin.entity.Menu;
import com.enterprise.admin.exception.ResourceNotFoundException;
import com.enterprise.admin.exception.DuplicateResourceException;
import com.enterprise.admin.repository.MenuRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class MenuService {

    private final MenuRepository menuRepository;

    /**
     * 모든 메뉴 조회
     */
    public List<MenuDto.Response> getAllMenus() {
        log.info("모든 메뉴 조회 요청");
        List<Menu> menus = menuRepository.findAllByOrderByOrderAsc();
        return menus.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    /**
     * 특정 메뉴 조회
     */
    public MenuDto.Response getMenuById(String id) {
        log.info("메뉴 조회 요청: {}", id);
        Menu menu = menuRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("메뉴를 찾을 수 없습니다: " + id));
        return convertToResponse(menu);
    }

    /**
     * 권한별 메뉴 조회
     */
    public List<MenuDto.Response> getMenusByRole(String role) {
        log.info("권한별 메뉴 조회 요청: {}", role);
        List<Menu> menus = menuRepository.findByRolesContaining(role);
        return menus.stream()
                .sorted((m1, m2) -> m1.getOrder().compareTo(m2.getOrder()))
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    /**
     * 새 메뉴 생성
     */
    @Transactional
    public MenuDto.Response createMenu(MenuDto.CreateRequest request) {
        log.info("메뉴 생성 요청: {}", request.getId());
        
        // 중복 확인
        if (menuRepository.existsById(request.getId())) {
            throw new DuplicateResourceException("이미 존재하는 메뉴 ID입니다: " + request.getId());
        }

        // 드롭다운이 아닌 경우 경로 필수 확인
        if (Boolean.FALSE.equals(request.getIsDropdown()) && 
            (request.getPath() == null || request.getPath().trim().isEmpty())) {
            throw new IllegalArgumentException("드롭다운이 아닌 메뉴는 경로가 필수입니다.");
        }

        Menu menu = Menu.builder()
                .id(request.getId())
                .name(request.getName())
                .path(request.getPath())
                .icon(request.getIcon())
                .roles(request.getRoles())
                .order(request.getOrder())
                .requiresAuth(request.getRequiresAuth() != null ? request.getRequiresAuth() : false)
                .showUsername(request.getShowUsername() != null ? request.getShowUsername() : false)
                .isDropdown(request.getIsDropdown() != null ? request.getIsDropdown() : false)
                .subItems(convertSubItems(request.getSubItems()))
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        Menu savedMenu = menuRepository.save(menu);
        log.info("메뉴 생성 완료: {}", savedMenu.getId());
        
        return convertToResponse(savedMenu);
    }

    /**
     * 메뉴 수정
     */
    @Transactional
    public MenuDto.Response updateMenu(String id, MenuDto.UpdateRequest request) {
        log.info("메뉴 수정 요청: {}", id);
        
        Menu menu = menuRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("메뉴를 찾을 수 없습니다: " + id));

        if (request.getName() != null) {
            menu.setName(request.getName());
        }
        if (request.getPath() != null) {
            menu.setPath(request.getPath());
        }
        if (request.getIcon() != null) {
            menu.setIcon(request.getIcon());
        }
        if (request.getRoles() != null) {
            menu.setRoles(request.getRoles());
        }
        if (request.getOrder() != null) {
            menu.setOrder(request.getOrder());
        }
        if (request.getRequiresAuth() != null) {
            menu.setRequiresAuth(request.getRequiresAuth());
        }
        if (request.getShowUsername() != null) {
            menu.setShowUsername(request.getShowUsername());
        }
        if (request.getIsDropdown() != null) {
            menu.setIsDropdown(request.getIsDropdown());
        }
        if (request.getSubItems() != null) {
            menu.setSubItems(convertSubItems(request.getSubItems()));
        }

        menu.setUpdatedAt(LocalDateTime.now());

        Menu updatedMenu = menuRepository.save(menu);
        log.info("메뉴 수정 완료: {}", updatedMenu.getId());
        
        return convertToResponse(updatedMenu);
    }

    /**
     * 메뉴 삭제
     */
    @Transactional
    public void deleteMenu(String id) {
        log.info("메뉴 삭제 요청: {}", id);
        
        if (!menuRepository.existsById(id)) {
            throw new ResourceNotFoundException("메뉴를 찾을 수 없습니다: " + id);
        }

        menuRepository.deleteById(id);
        log.info("메뉴 삭제 완료: {}", id);
    }

    /**
     * 메뉴 순서 변경
     */
    @Transactional
    public void updateMenuOrder(List<MenuDto.MenuOrderRequest> orderRequests) {
        log.info("메뉴 순서 변경 요청: {} 건", orderRequests.size());
        
        for (MenuDto.MenuOrderRequest orderRequest : orderRequests) {
            Menu menu = menuRepository.findById(orderRequest.getId())
                    .orElseThrow(() -> new ResourceNotFoundException("메뉴를 찾을 수 없습니다: " + orderRequest.getId()));
            
            menu.setOrder(orderRequest.getOrder());
            menu.setUpdatedAt(LocalDateTime.now());
            menuRepository.save(menu);
        }
        
        log.info("메뉴 순서 변경 완료");
    }

    /**
     * 서브메뉴 생성
     */
    @Transactional
    public MenuDto.Response createSubMenu(String parentMenuId, MenuDto.SubMenuItemDto subMenuDto) {
        log.info("서브메뉴 생성 요청: 부모={}, 서브메뉴={}", parentMenuId, subMenuDto.getId());
        
        Menu menu = menuRepository.findById(parentMenuId)
                .orElseThrow(() -> new ResourceNotFoundException("메뉴를 찾을 수 없습니다: " + parentMenuId));

        if (!Boolean.TRUE.equals(menu.getIsDropdown())) {
            throw new IllegalArgumentException("드롭다운 메뉴만 서브메뉴를 가질 수 있습니다.");
        }

        Menu.SubMenuItem subMenuItem = Menu.SubMenuItem.builder()
                .id(subMenuDto.getId())
                .name(subMenuDto.getName())
                .subtitle(subMenuDto.getSubtitle())
                .description(subMenuDto.getDescription())
                .application(subMenuDto.getApplication())
                .strengths(subMenuDto.getStrengths())
                .weaknesses(subMenuDto.getWeaknesses())
                .path(subMenuDto.getPath())
                .roles(subMenuDto.getRoles())
                .build();

        if (menu.getSubItems() == null) {
            menu.setSubItems(List.of(subMenuItem));
        } else {
            menu.getSubItems().add(subMenuItem);
        }

        menu.setUpdatedAt(LocalDateTime.now());
        Menu updatedMenu = menuRepository.save(menu);
        
        log.info("서브메뉴 생성 완료");
        return convertToResponse(updatedMenu);
    }

    /**
     * 서브메뉴 수정
     */
    @Transactional
    public MenuDto.Response updateSubMenu(String parentMenuId, String subMenuId, MenuDto.SubMenuItemDto subMenuDto) {
        log.info("서브메뉴 수정 요청: 부모={}, 서브메뉴={}", parentMenuId, subMenuId);
        
        Menu menu = menuRepository.findById(parentMenuId)
                .orElseThrow(() -> new ResourceNotFoundException("메뉴를 찾을 수 없습니다: " + parentMenuId));

        if (menu.getSubItems() == null || menu.getSubItems().isEmpty()) {
            throw new ResourceNotFoundException("서브메뉴를 찾을 수 없습니다: " + subMenuId);
        }

        Menu.SubMenuItem subMenuItem = menu.getSubItems().stream()
                .filter(item -> item.getId().equals(subMenuId))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("서브메뉴를 찾을 수 없습니다: " + subMenuId));

        // 수정
        subMenuItem.setName(subMenuDto.getName());
        subMenuItem.setSubtitle(subMenuDto.getSubtitle());
        subMenuItem.setDescription(subMenuDto.getDescription());
        subMenuItem.setApplication(subMenuDto.getApplication());
        subMenuItem.setStrengths(subMenuDto.getStrengths());
        subMenuItem.setWeaknesses(subMenuDto.getWeaknesses());
        subMenuItem.setPath(subMenuDto.getPath());
        subMenuItem.setRoles(subMenuDto.getRoles());

        menu.setUpdatedAt(LocalDateTime.now());
        Menu updatedMenu = menuRepository.save(menu);
        
        log.info("서브메뉴 수정 완료");
        return convertToResponse(updatedMenu);
    }

    /**
     * 서브메뉴 삭제
     */
    @Transactional
    public MenuDto.Response deleteSubMenu(String parentMenuId, String subMenuId) {
        log.info("서브메뉴 삭제 요청: 부모={}, 서브메뉴={}", parentMenuId, subMenuId);
        
        Menu menu = menuRepository.findById(parentMenuId)
                .orElseThrow(() -> new ResourceNotFoundException("메뉴를 찾을 수 없습니다: " + parentMenuId));

        if (menu.getSubItems() == null || menu.getSubItems().isEmpty()) {
            throw new ResourceNotFoundException("서브메뉴를 찾을 수 없습니다: " + subMenuId);
        }

        boolean removed = menu.getSubItems().removeIf(item -> item.getId().equals(subMenuId));
        
        if (!removed) {
            throw new ResourceNotFoundException("서브메뉴를 찾을 수 없습니다: " + subMenuId);
        }

        menu.setUpdatedAt(LocalDateTime.now());
        Menu updatedMenu = menuRepository.save(menu);
        
        log.info("서브메뉴 삭제 완료");
        return convertToResponse(updatedMenu);
    }

    // Helper methods
    
    private MenuDto.Response convertToResponse(Menu menu) {
        return MenuDto.Response.builder()
                .id(menu.getId())
                .name(menu.getName())
                .path(menu.getPath())
                .icon(menu.getIcon())
                .roles(menu.getRoles())
                .order(menu.getOrder())
                .requiresAuth(menu.getRequiresAuth())
                .showUsername(menu.getShowUsername())
                .isDropdown(menu.getIsDropdown())
                .subItems(convertSubItemsToDto(menu.getSubItems()))
                .createdAt(menu.getCreatedAt() != null ? menu.getCreatedAt().toString() : null)
                .updatedAt(menu.getUpdatedAt() != null ? menu.getUpdatedAt().toString() : null)
                .build();
    }

    private List<Menu.SubMenuItem> convertSubItems(List<MenuDto.SubMenuItemDto> subItemDtos) {
        if (subItemDtos == null) {
            return null;
        }
        
        return subItemDtos.stream()
                .map(dto -> Menu.SubMenuItem.builder()
                        .id(dto.getId())
                        .name(dto.getName())
                        .subtitle(dto.getSubtitle())
                        .description(dto.getDescription())
                        .application(dto.getApplication())
                        .strengths(dto.getStrengths())
                        .weaknesses(dto.getWeaknesses())
                        .path(dto.getPath())
                        .roles(dto.getRoles())
                        .build())
                .collect(Collectors.toList());
    }

    private List<MenuDto.SubMenuItemDto> convertSubItemsToDto(List<Menu.SubMenuItem> subItems) {
        if (subItems == null) {
            return null;
        }
        
        return subItems.stream()
                .map(item -> MenuDto.SubMenuItemDto.builder()
                        .id(item.getId())
                        .name(item.getName())
                        .subtitle(item.getSubtitle())
                        .description(item.getDescription())
                        .application(item.getApplication())
                        .strengths(item.getStrengths())
                        .weaknesses(item.getWeaknesses())
                        .path(item.getPath())
                        .roles(item.getRoles())
                        .build())
                .collect(Collectors.toList());
    }
}
