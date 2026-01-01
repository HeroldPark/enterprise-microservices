package com.enterprise.board.filter;

import com.enterprise.board.util.JwtUtil;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;

@Slf4j
@Component
@RequiredArgsConstructor
public class BoardJwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain) throws ServletException, IOException {
        
        String path = request.getRequestURI();
        String method = request.getMethod();
        
        log.debug("Processing request: {} {}", method, path);
        
        // Authorization 헤더 추출
        String authHeader = request.getHeader("Authorization");
        
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            log.debug("No JWT token found in request headers");
            filterChain.doFilter(request, response);
            return;
        }
        
        try {
            // "Bearer " 제거
            String token = authHeader.substring(7);
            log.debug("JWT token found: {}...", token.substring(0, Math.min(20, token.length())));
            
            // JWT 토큰 검증
            if (!jwtUtil.validateToken(token)) {
                log.warn("Invalid or expired JWT token");
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                response.setContentType("application/json");
                response.getWriter().write("{\"error\":\"Invalid or expired token\"}");
                return;
            }
            
            // 사용자 정보 추출
            String username = jwtUtil.extractUsername(token);
            log.info("JWT authentication successful for user: {}", username);
            
            // SecurityContext에 인증 정보 설정
            UsernamePasswordAuthenticationToken authentication = 
                new UsernamePasswordAuthenticationToken(
                    username,
                    null,
                    Collections.singletonList(new SimpleGrantedAuthority("ROLE_USER"))
                );
            
            authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
            SecurityContextHolder.getContext().setAuthentication(authentication);
            
            log.debug("Security context updated for user: {}", username);
            
        } catch (Exception e) {
            log.error("JWT authentication failed: {}", e.getMessage());
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentType("application/json");
            response.getWriter().write("{\"error\":\"Authentication failed: " + e.getMessage() + "\"}");
            return;
        }
        
        filterChain.doFilter(request, response);
    }
}