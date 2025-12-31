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
        routes.route("user-service-auth", r -> r
                .path(routeProperties.getUser().getAuthPath())
                .filters(f -> f
                        .stripPrefix(routeProperties.getStripPrefix())
                        .filter(jwtAuthenticationFilter.apply(
                                new JwtAuthenticationFilter.Config(false))))
                .uri(routeProperties.getUser().getServiceUri()));
        
        routes.route("user-service", r -> r
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
                                        routeProperties.getProduct().isRequireAuth()))))
                .uri(routeProperties.getProduct().getServiceUri()));
        
        // Order Service Routes
        routes.route("order-service", r -> r
                .path(routeProperties.getOrder().getApiPath())
                .filters(f -> f
                        .stripPrefix(routeProperties.getStripPrefix())
                        .filter(jwtAuthenticationFilter.apply(
                                new JwtAuthenticationFilter.Config(
                                        routeProperties.getOrder().isRequireAuth()))))
                .uri(routeProperties.getOrder().getServiceUri()));

        // Board Service Routes - Search
        routes.route("board-service-search", r -> r
                .path(routeProperties.getBoard().getSearchPath())
                .and()
                .method(routeProperties.getBoard().getPublicMethods().toArray(new String[0]))
                .filters(f -> f
                        .stripPrefix(routeProperties.getStripPrefix())
                        .filter(jwtAuthenticationFilter.apply(
                                new JwtAuthenticationFilter.Config(false))))
                .uri(routeProperties.getBoard().getServiceUri()));
        
        // Board Service Routes - Write/Update/Delete
        routes.route("board-service-write", r -> r
                .path(routeProperties.getBoard().getApiPath())
                .and()
                .method(routeProperties.getBoard().getAuthMethods().toArray(new String[0]))
                .filters(f -> f
                        .stripPrefix(routeProperties.getStripPrefix())
                        .filter(jwtAuthenticationFilter.apply(
                                new JwtAuthenticationFilter.Config(true))))
                .uri(routeProperties.getBoard().getServiceUri()));
        
        // Board Service Routes - Read
        routes.route("board-service-read", r -> r
                .path(routeProperties.getBoard().getApiPath())
                .and()
                .method(routeProperties.getBoard().getPublicMethods().toArray(new String[0]))
                .filters(f -> f
                        .stripPrefix(routeProperties.getStripPrefix())
                        .filter(jwtAuthenticationFilter.apply(
                                new JwtAuthenticationFilter.Config(false))))
                .uri(routeProperties.getBoard().getServiceUri()));
        
        return routes.build();
    }
}