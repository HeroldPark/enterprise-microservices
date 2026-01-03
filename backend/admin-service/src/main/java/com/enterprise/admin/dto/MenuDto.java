package com.enterprise.admin.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.util.List;

public class MenuDto {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateRequest {
        @NotBlank(message = "메뉴 ID는 필수입니다")
        private String id;
        
        @NotBlank(message = "메뉴 이름은 필수입니다")
        private String name;
        
        private String path;
        
        private String icon;
        
        @NotEmpty(message = "최소 하나 이상의 권한이 필요합니다")
        private List<String> roles;
        
        @NotNull(message = "순서는 필수입니다")
        private Integer order;
        
        private Boolean requiresAuth;
        
        private Boolean showUsername;
        
        private Boolean isDropdown;
        
        private List<SubMenuItemDto> subItems;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UpdateRequest {
        private String name;
        private String path;
        private String icon;
        private List<String> roles;
        private Integer order;
        private Boolean requiresAuth;
        private Boolean showUsername;
        private Boolean isDropdown;
        private List<SubMenuItemDto> subItems;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Response {
        private String id;
        private String name;
        private String path;
        private String icon;
        private List<String> roles;
        private Integer order;
        private Boolean requiresAuth;
        private Boolean showUsername;
        private Boolean isDropdown;
        private List<SubMenuItemDto> subItems;
        private String createdAt;
        private String updatedAt;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SubMenuItemDto {
        @NotBlank(message = "서브메뉴 ID는 필수입니다")
        private String id;
        
        @NotBlank(message = "서브메뉴 이름은 필수입니다")
        private String name;
        
        private String subtitle;
        private String description;
        private String application;
        private String strengths;
        private String weaknesses;
        
        @NotBlank(message = "서브메뉴 경로는 필수입니다")
        private String path;
        
        @NotEmpty(message = "최소 하나 이상의 권한이 필요합니다")
        private List<String> roles;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MenuOrderRequest {
        @NotBlank(message = "메뉴 ID는 필수입니다")
        private String id;
        
        @NotNull(message = "순서는 필수입니다")
        private Integer order;
    }
}
