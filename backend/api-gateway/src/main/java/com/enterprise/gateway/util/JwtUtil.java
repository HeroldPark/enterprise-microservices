package com.enterprise.gateway.util;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.List;

@Slf4j
@Component
public class JwtUtil {

    @Value("${jwt.secret}")
    private String secret;

    @Value("${jwt.expiration}")
    private Long expiration;

    private SecretKey getSigningKey() {
        byte[] keyBytes = secret.getBytes(StandardCharsets.UTF_8);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    public String extractUsername(String token) {
        return extractAllClaims(token).getSubject();
    }

    public Date extractExpiration(String token) {
        return extractAllClaims(token).getExpiration();
    }

    /**
     * ⭐ JWT에서 Role 추출
     */
    public String extractRole(String token) {
        Claims claims = extractAllClaims(token);
        
        // JWT에 "role" 클레임이 있는 경우
        Object roleObj = claims.get("role");
        if (roleObj != null) {
            return roleObj.toString();
        }
        
        // JWT에 "roles" 또는 "authorities" 클레임이 있는 경우 (첫 번째 값 사용)
        Object rolesObj = claims.get("roles");
        if (rolesObj == null) {
            rolesObj = claims.get("authorities");
        }
        
        if (rolesObj instanceof List) {
            List<?> roles = (List<?>) rolesObj;
            if (!roles.isEmpty()) {
                return roles.get(0).toString();
            }
        }
        
        log.warn("No role found in JWT token for user: {}", extractUsername(token));
        return null;
    }

    private Claims extractAllClaims(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    private Boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    public Boolean validateToken(String token) {
        try {
            return !isTokenExpired(token);
        } catch (Exception e) {
            log.error("Token validation error: {}", e.getMessage());
            return false;
        }
    }
}