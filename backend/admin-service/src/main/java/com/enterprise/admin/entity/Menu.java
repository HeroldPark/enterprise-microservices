package com.enterprise.admin.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "menus")
public class Menu {
    
    @Id
    private String id;
    
    @Column(nullable = false)
    private String name;
    
    private String path;
    
    private String icon;
    
    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "menu_roles", joinColumns = @JoinColumn(name = "menu_id"))
    @Column(name = "role")
    @Builder.Default
    private List<String> roles = new ArrayList<>();
    
    @Column(name = "display_order")
    private Integer order;
    
    @Column(name = "requires_auth")
    private Boolean requiresAuth;
    
    @Column(name = "show_username")
    private Boolean showUsername;
    
    @Column(name = "is_dropdown")
    private Boolean isDropdown;
    
    @OneToMany(mappedBy = "menu", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @Builder.Default
    private List<SubMenuItem> subItems = new ArrayList<>();
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
    
    // 서브메뉴 추가 헬퍼 메서드
    public void addSubItem(SubMenuItem subItem) {
        subItems.add(subItem);
        subItem.setMenu(this);
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @Entity
    @Table(name = "sub_menu_items")
    @JsonIgnoreProperties({"menu"})
    public static class SubMenuItem {
        
        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        private Long subId;
        
        @Column(nullable = false)
        private String id;
        
        @Column(nullable = false)
        private String name;
        
        private String subtitle;
        
        @Column(length = 1000)
        private String description;
        
        @Column(length = 1000)
        private String application;
        
        @Column(length = 1000)
        private String strengths;
        
        @Column(length = 1000)
        private String weaknesses;
        
        @Column(nullable = false)
        private String path;
        
        @ElementCollection(fetch = FetchType.EAGER)
        @CollectionTable(name = "sub_menu_roles", joinColumns = @JoinColumn(name = "sub_menu_id"))
        @Column(name = "role")
        @Builder.Default
        private List<String> roles = new ArrayList<>();
        
        @ManyToOne(fetch = FetchType.LAZY)
        @JoinColumn(name = "menu_id")
        private Menu menu;
    }
}
