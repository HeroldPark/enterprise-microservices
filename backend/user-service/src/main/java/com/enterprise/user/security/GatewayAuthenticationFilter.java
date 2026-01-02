package com.enterprise.user.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;
import java.util.List;

/**
 * ⭐ API Gateway에서 전달된 사용자 정보를 Spring Security Context에 설정
 */
@Slf4j
@Component
public class GatewayAuthenticationFilter extends OncePerRequestFilter {

    private static final String HEADER_USER_NAME = "X-User-Name";
    private static final String HEADER_USER_ROLE = "X-User-Role";
    private static final String HEADER_AUTH_TOKEN = "X-Auth-Token";

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain) throws ServletException, IOException {

        String username = request.getHeader(HEADER_USER_NAME);
        String role = request.getHeader(HEADER_USER_ROLE);
        String token = request.getHeader(HEADER_AUTH_TOKEN);

        log.debug("Gateway headers - Username: {}, Role: {}, Token present: {}", 
                username, role, token != null);

        // Gateway에서 인증된 사용자 정보가 있으면 SecurityContext에 설정
        if (username != null && token != null) {
            List<SimpleGrantedAuthority> authorities;
            
            if (role != null && !role.isEmpty()) {
                // Role이 "ADMIN"이면 "ROLE_ADMIN"으로 변환 (Spring Security 규칙)
                String authority = role.startsWith("ROLE_") ? role : "ROLE_" + role;
                authorities = Collections.singletonList(new SimpleGrantedAuthority(authority));
                log.debug("Setting authority: {}", authority);
            } else {
                // Role이 없으면 기본 권한 부여
                authorities = Collections.singletonList(new SimpleGrantedAuthority("ROLE_USER"));
                log.warn("No role in header, using default ROLE_USER for: {}", username);
            }

            // ⭐ Authentication 객체 생성 및 SecurityContext에 설정
            UsernamePasswordAuthenticationToken authentication =
                    new UsernamePasswordAuthenticationToken(username, null, authorities);

            SecurityContextHolder.getContext().setAuthentication(authentication);
            
            log.info("Authentication set for user: {} with authorities: {}", username, authorities);
        } else {
            log.debug("No gateway authentication headers found");
        }

        filterChain.doFilter(request, response);
    }
}