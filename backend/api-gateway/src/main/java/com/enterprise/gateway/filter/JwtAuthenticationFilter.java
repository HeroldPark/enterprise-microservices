package com.enterprise.gateway.filter;

import com.enterprise.gateway.util.JwtUtil;
import lombok.Data;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cloud.gateway.filter.GatewayFilter;
import org.springframework.cloud.gateway.filter.factory.AbstractGatewayFilterFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

@Slf4j
@Component
public class JwtAuthenticationFilter extends AbstractGatewayFilterFactory<JwtAuthenticationFilter.Config> {

    private final JwtUtil jwtUtil;

    public JwtAuthenticationFilter(JwtUtil jwtUtil) {
        super(Config.class);
        this.jwtUtil = jwtUtil;
    }

    @Override
    public GatewayFilter apply(Config config) {
        return (exchange, chain) -> {
            String path = exchange.getRequest().getPath().value();
            String method = exchange.getRequest().getMethod().name();
            
            log.debug("Processing request: {} {}, authRequired: {}", method, path, config.isAuthRequired());
            
            // ✅ 인증이 필요 없는 경우 바로 통과
            if (!config.isAuthRequired()) {
                log.debug("Auth not required for: {} {}", method, path);
                return chain.filter(exchange);
            }

            ServerHttpRequest request = exchange.getRequest();
            
            // Authorization 헤더 확인
            if (!request.getHeaders().containsKey(HttpHeaders.AUTHORIZATION)) {
                log.warn("Missing authorization header for: {} {}", method, path);
                return onError(exchange, "Missing authorization header", HttpStatus.UNAUTHORIZED);
            }

            String authHeader = request.getHeaders().getFirst(HttpHeaders.AUTHORIZATION);
            
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                log.warn("Invalid authorization header format for: {} {}", method, path);
                return onError(exchange, "Invalid authorization header", HttpStatus.UNAUTHORIZED);
            }

            String token = authHeader.substring(7);
            log.debug("JWT token found: {}...", token.substring(0, Math.min(20, token.length())));

            try {
                // JWT 토큰 검증
                if (!jwtUtil.validateToken(token)) {
                    log.warn("Invalid or expired token for: {} {}", method, path);
                    return onError(exchange, "Invalid or expired token", HttpStatus.UNAUTHORIZED);
                }

                String username = jwtUtil.extractUsername(token);
                String role = jwtUtil.extractRole(token);  // ⭐ Role 추출
                
                log.info("JWT authentication successful for user: {} (role: {}) on {} {}", 
                        username, role, method, path);
                
                // ✅ 사용자 정보를 헤더에 추가 (다운스트림 서비스에서 사용 가능)
                ServerHttpRequest.Builder requestBuilder = exchange.getRequest().mutate()
                        .header("X-User-Name", username)
                        .header("X-Auth-Token", token);
                
                // ⭐ Role 정보도 헤더에 추가
                if (role != null) {
                    requestBuilder.header("X-User-Role", role);
                    log.debug("Adding role header: X-User-Role={}", role);
                }
                
                ServerHttpRequest modifiedRequest = requestBuilder.build();

                return chain.filter(exchange.mutate().request(modifiedRequest).build());
                
            } catch (Exception e) {
                log.error("JWT validation error for {} {}: {}", method, path, e.getMessage());
                return onError(exchange, "Token validation failed: " + e.getMessage(), HttpStatus.UNAUTHORIZED);
            }
        };
    }

    private Mono<Void> onError(ServerWebExchange exchange, String err, HttpStatus httpStatus) {
        exchange.getResponse().setStatusCode(httpStatus);
        exchange.getResponse().getHeaders().add("X-Error-Message", err);
        log.error("Authentication error: {}", err);
        return exchange.getResponse().setComplete();
    }

    @Data
    public static class Config {
        private boolean authRequired = false;  // 기본값: 인증 불필요

        public Config() {
        }

        public Config(boolean authRequired) {
            this.authRequired = authRequired;
        }
    }
}