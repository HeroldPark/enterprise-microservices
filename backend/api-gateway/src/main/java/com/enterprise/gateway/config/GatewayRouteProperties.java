package com.enterprise.gateway.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;

import java.util.List;

// 각 서비스별 라우팅 설정을 관리하는 Properties 클래스:

@Data
@ConfigurationProperties(prefix = "gateway.routes")
public class GatewayRouteProperties {
    
    private int stripPrefix = 1;
    
    private UserServiceConfig user = new UserServiceConfig();
    private ProductServiceConfig product = new ProductServiceConfig();
    private OrderServiceConfig order = new OrderServiceConfig();
    private BoardServiceConfig board = new BoardServiceConfig();
    private AdminServiceConfig admin = new AdminServiceConfig();
    
    @Data
    public static class UserServiceConfig {
        private String serviceUri = "lb://user-service";
        private String authPath = "/api/auth/**";
        private String apiPath = "/api/users/**";
        private String apiAdminPath = "/api/admin/users/**";
        private String apiSystemPath = "/api/admin/settings/**";
        private String apiModelPath = "/api/admin/model-configs/**";
    }
    
    @Data
    public static class ProductServiceConfig {
        private String serviceUri = "lb://product-service";
        private String apiPath = "/api/products/**";
        private boolean requireAuth = false;
    }
    
    @Data
    public static class OrderServiceConfig {
        private String serviceUri = "lb://order-service";
        private String apiPath = "/api/orders/**";
        private boolean requireAuth = true;
    }
    
    @Data
    public static class BoardServiceConfig {
        private String serviceUri = "lb://board-service";
        private String apiPath = "/api/boards/**";
        private String searchPath = "/api/boards/search/**";
        private List<String> publicMethods = List.of("GET");
        private List<String> authMethods = List.of("POST", "PUT", "DELETE");
    }
    
    @Data
    public static class AdminServiceConfig {
        private String serviceUri = "lb://admin-service";
        private String apiPath = "/api/admin/menus/**";
        private boolean requireAuth = true;
        private boolean adminOnly = true;
    }
}