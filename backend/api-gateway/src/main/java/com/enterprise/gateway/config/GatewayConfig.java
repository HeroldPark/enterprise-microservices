package com.enterprise.gateway.config;

import com.enterprise.gateway.filter.JwtAuthenticationFilter;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.cloud.gateway.route.builder.RouteLocatorBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Slf4j
@Configuration
@RequiredArgsConstructor
@EnableConfigurationProperties(GatewayRouteProperties.class)
public class GatewayConfig {

        private final JwtAuthenticationFilter jwtAuthenticationFilter;
        private final GatewayRouteProperties routeProperties;

        @Bean
        public RouteLocator customRouteLocator(RouteLocatorBuilder builder) {
                log.info("Configuring Gateway routes with properties: {}", routeProperties);

                RouteLocatorBuilder.Builder routes = builder.routes();

                // User Service Routes
                // ⭐ 1. Admin 라우트 (가장 먼저 - 우선순위 높음)
                routes.route("user-service-admin", r -> r
                                .path(routeProperties.getUser().getApiAdminPath()) // /api/admin/users/**
                                .filters(f -> f
                                                .stripPrefix(routeProperties.getStripPrefix())
                                                .filter(jwtAuthenticationFilter.apply(
                                                                new JwtAuthenticationFilter.Config(true)))) // 인증 필수
                                .uri(routeProperties.getUser().getServiceUri()));

                // 2. Auth 라우트 - logout (인증 필요) ✅ /api/auth/logout -> /auth/logout
                // (주의) /api/auth/** 전체를 public 으로 두면 logout에서도 X-User-* 헤더가 붙지 않습니다.
                routes.route("user-service-auth-logout-api", r -> r
                                .path("/api/auth/logout")
                                .filters(f -> f
                                                .stripPrefix(routeProperties.getStripPrefix()) // /api 제거 ->
                                                                                               // /auth/logout
                                                .filter(jwtAuthenticationFilter.apply(
                                                                new JwtAuthenticationFilter.Config(true))))
                                .uri(routeProperties.getUser().getServiceUri()));

                // 3. Auth 라우트 - login/register (인증 불필요) ✅ /api/auth/login|register
                routes.route("user-service-auth-public", r -> r
                                .path("/api/auth/login", "/api/auth/register")
                                .filters(f -> f
                                                .stripPrefix(routeProperties.getStripPrefix()) // /api 제거 -> /auth/login
                                                .filter(jwtAuthenticationFilter.apply(
                                                                new JwtAuthenticationFilter.Config(false))))
                                .uri(routeProperties.getUser().getServiceUri()));

                // 4. Auth 라우트 - /auth/logout 직접 호출 지원 (인증 필요) ✅ /auth/logout -> /auth/logout
                // (주의) stripPrefix(1)을 하면 /auth/logout 이 /logout 으로 변형되어 user-service에서 404가 납니다.
                routes.route("user-service-auth-logout-direct", r -> r
                                .path("/auth/logout")
                                .filters(f -> f
                                                .stripPrefix(0) // 그대로 전달
                                                .filter(jwtAuthenticationFilter.apply(
                                                                new JwtAuthenticationFilter.Config(true))))
                                .uri(routeProperties.getUser().getServiceUri()));

                // 5. 일반 User API 라우트 (인증 필요)
                routes.route("user-service-api", r -> r
                                .path(routeProperties.getUser().getApiPath())
                                .filters(f -> f
                                                .stripPrefix(routeProperties.getStripPrefix())
                                                .filter(jwtAuthenticationFilter.apply(
                                                                new JwtAuthenticationFilter.Config(true))))
                                .uri(routeProperties.getUser().getServiceUri()));

                // Product Service Routes
                routes.route("product-service", r -> r
                                .path(routeProperties.getProduct().getApiPath())
                                .filters(f -> f
                                                .stripPrefix(routeProperties.getStripPrefix())
                                                .filter(jwtAuthenticationFilter.apply(
                                                                new JwtAuthenticationFilter.Config(
                                                                                routeProperties.getProduct()
                                                                                                .isRequireAuth()))))
                                .uri(routeProperties.getProduct().getServiceUri()));

                // Order Service Routes
                routes.route("order-service", r -> r
                                .path(routeProperties.getOrder().getApiPath())
                                .filters(f -> f
                                                .stripPrefix(routeProperties.getStripPrefix())
                                                .filter(jwtAuthenticationFilter.apply(
                                                                new JwtAuthenticationFilter.Config(
                                                                                routeProperties.getOrder()
                                                                                                .isRequireAuth()))))
                                .uri(routeProperties.getOrder().getServiceUri()));

                // 1. Board Service Routes - Search
                routes.route("board-service-search", r -> r
                                .path(routeProperties.getBoard().getSearchPath())
                                .and()
                                .method(routeProperties.getBoard().getPublicMethods().toArray(new String[0]))
                                .filters(f -> f
                                                .stripPrefix(routeProperties.getStripPrefix())
                                                .filter(jwtAuthenticationFilter.apply(
                                                                new JwtAuthenticationFilter.Config(false))))
                                .uri(routeProperties.getBoard().getServiceUri()));

                // 2. Board Service Routes - Write/Update/Delete
                routes.route("board-service-write", r -> r
                                .path(routeProperties.getBoard().getApiPath())
                                .and()
                                .method(routeProperties.getBoard().getAuthMethods().toArray(new String[0]))
                                .filters(f -> f
                                                .stripPrefix(routeProperties.getStripPrefix())
                                                .filter(jwtAuthenticationFilter.apply(
                                                                new JwtAuthenticationFilter.Config(true))))
                                .uri(routeProperties.getBoard().getServiceUri()));

                // 3. Board Service Routes - Read
                routes.route("board-service-read", r -> r
                                .path(routeProperties.getBoard().getApiPath())
                                .and()
                                .method(routeProperties.getBoard().getPublicMethods().toArray(new String[0]))
                                .filters(f -> f
                                                .stripPrefix(routeProperties.getStripPrefix())
                                                .filter(jwtAuthenticationFilter.apply(
                                                                new JwtAuthenticationFilter.Config(false))))
                                .uri(routeProperties.getBoard().getServiceUri()));

                // 1. Admin Service Routes (메뉴 관리 - ADMIN 권한 필요) ⭐⭐⭐
                routes.route("admin-service", r -> r
                                .path(routeProperties.getAdmin().getApiPath()) // /api/menus/**
                                .filters(f -> f
                                                .stripPrefix(routeProperties.getStripPrefix()) // /api 제거 → /menus
                                                .filter(jwtAuthenticationFilter.apply(
                                                                new JwtAuthenticationFilter.Config(
                                                                                routeProperties.getAdmin()
                                                                                                .isRequireAuth())))) // 인증
                                                                                                                     // 필수
                                .uri(routeProperties.getAdmin().getServiceUri())); // lb://admin-service

                // 2. 시스템 설정 API 라우트 (인증 필요)
                routes.route("system-settings", r -> r
                                .path(routeProperties.getAdmin().getApiSystemPath()) // /api/admin/settings/**
                                .filters(f -> f
                                                .stripPrefix(1) // /api 제거
                                                .filter(jwtAuthenticationFilter.apply(
                                                                new JwtAuthenticationFilter.Config(true))))
                                .uri(routeProperties.getAdmin().getServiceUri()));

                // 3. 모델 설정 API 라우트 (인증 필요)
                routes.route("model-configs", r -> r
                                .path(routeProperties.getAdmin().getApiModelPath()) // /api/admin/model-configs/**
                                .filters(f -> f
                                                .stripPrefix(1) // /api 제거
                                                .filter(jwtAuthenticationFilter.apply(
                                                                new JwtAuthenticationFilter.Config(true))))
                                .uri(routeProperties.getAdmin().getServiceUri()));

                // 4. 모델 설정 API 라우트 (인증 필요)
                routes.route("admin-dashboard", r -> r
                                .path(routeProperties.getAdmin().getApiDashboardPath()) // /api/admin/dashboard/**
                                .filters(f -> f
                                                .stripPrefix(1) // /api 제거
                                                .filter(jwtAuthenticationFilter.apply(
                                                                new JwtAuthenticationFilter.Config(true))))
                                .uri(routeProperties.getAdmin().getServiceUri()));

                log.debug("✅ Admin Service route configured: {} -> {}",
                                routeProperties.getAdmin().getApiPath(),
                                routeProperties.getAdmin().getServiceUri());

                // Message Service Routes
                routes.route("message-service", r -> r
                                .path(routeProperties.getMessage().getApiPath())
                                .filters(f -> f
                                                .stripPrefix(routeProperties.getStripPrefix())
                                                .filter(jwtAuthenticationFilter.apply(
                                                                new JwtAuthenticationFilter.Config(
                                                                                routeProperties.getMessage()
                                                                                                .isRequireAuth()))))
                                .uri(routeProperties.getMessage().getServiceUri()));

                log.debug("✅ Message Service route configured: {} -> {}",
                                routeProperties.getMessage().getApiPath(),
                                routeProperties.getMessage().getServiceUri());

                return routes.build();
        }
}