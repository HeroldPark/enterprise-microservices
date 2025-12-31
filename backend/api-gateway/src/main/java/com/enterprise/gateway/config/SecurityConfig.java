package com.enterprise.gateway.config;

import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.reactive.EnableWebFluxSecurity;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.web.server.SecurityWebFilterChain;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Configuration
@EnableWebFluxSecurity
@RequiredArgsConstructor
@EnableConfigurationProperties(SecurityPathProperties.class)
public class SecurityConfig {

    private final SecurityPathProperties securityPaths;

    @Bean
    @Order(2)  // CORS 필터(Order 1) 다음에 실행
    public SecurityWebFilterChain securityWebFilterChain(ServerHttpSecurity http) {
        log.info("Configuring SecurityWebFilterChain with properties");
        log.debug("Security paths: {}", securityPaths);
        
        http
            .csrf(csrf -> csrf.disable())           // CSRF 비활성화
            .httpBasic(basic -> basic.disable())    // HTTP Basic 비활성화
            .formLogin(form -> form.disable())      // Form 로그인 비활성화
            .authorizeExchange(exchanges -> {       // 권한 설정
                // ⭐ OPTIONS 요청 최우선 허용
                exchanges.pathMatchers(HttpMethod.OPTIONS, "/**").permitAll();
                
                // 🔓 Public Paths (인증 불필요)
                
                // 인증 관련 경로
                securityPaths.getPublicPaths().getAuth().forEach(path ->
                    exchanges.pathMatchers(path).permitAll()
                );
                
                // 게시판 조회 (GET)
                securityPaths.getPublicPaths().getBoardsGet().forEach(path ->
                    exchanges.pathMatchers(HttpMethod.GET, path).permitAll()
                );
                
                // 상품 조회 (GET)
                securityPaths.getPublicPaths().getProductsGet().forEach(path ->
                    exchanges.pathMatchers(HttpMethod.GET, path).permitAll()
                );
                
                // 주문 (⚠️ 임시 public)
                securityPaths.getPublicPaths().getOrders().forEach(path ->
                    exchanges.pathMatchers(path).permitAll()
                );
                
                // Actuator
                securityPaths.getPublicPaths().getActuator().forEach(path ->
                    exchanges.pathMatchers(path).permitAll()
                );
                
                // 🔒 Authenticated Paths (인증 필요)
                
                // 게시판 작성/수정/삭제
                securityPaths.getAuthenticatedPaths().getBoardsWrite().forEach(path -> {
                    exchanges.pathMatchers(HttpMethod.POST, path).authenticated();
                    exchanges.pathMatchers(HttpMethod.PUT, path).authenticated();
                    exchanges.pathMatchers(HttpMethod.DELETE, path).authenticated();
                });
                
                // 로그아웃
                exchanges.pathMatchers(HttpMethod.POST, "/logout").authenticated();
                
                // 나머지 경로
                if (securityPaths.isAuthenticateAll()) {
                    exchanges.anyExchange().authenticated();
                } else {
                    exchanges.anyExchange().permitAll();
                }
            });
        
        return http.build();    // SecurityWebFilterChain 생성
    }
}