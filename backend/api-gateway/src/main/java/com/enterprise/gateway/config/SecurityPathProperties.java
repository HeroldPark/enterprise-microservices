package com.enterprise.gateway.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;

import java.util.ArrayList;
import java.util.List;

// 보안 경로 설정을 관리하는 Properties 클래스:

@Data
@ConfigurationProperties(prefix = "gateway.security")
public class SecurityPathProperties {
    
    private boolean authenticateAll = false;  // 기본값: 나머지 경로 permitAll
    
    private PublicPaths publicPaths = new PublicPaths();
    private AuthenticatedPaths authenticatedPaths = new AuthenticatedPaths();
    
    @Data
    public static class PublicPaths {
        private List<String> auth = new ArrayList<>(List.of(
            "/api/auth/**",
            "/auth/**"
        ));
        
        private List<String> boardsGet = new ArrayList<>(List.of(
            "/api/boards/**",
            "/boards/**"
        ));
        
        private List<String> productsGet = new ArrayList<>(List.of(
            "/api/products/**"
        ));
        
        private List<String> orders = new ArrayList<>(List.of(
            "/api/orders/**"
        ));
        
        private List<String> actuator = new ArrayList<>(List.of(
            "/actuator/**"
        ));
    }
    
    @Data
    public static class AuthenticatedPaths {
        private List<String> boardsWrite = new ArrayList<>(List.of(
            "/api/boards/**"
        ));

        private List<String> admins = new ArrayList<>(List.of(
            "/api/admin/menus/**"
        ));
    }
}