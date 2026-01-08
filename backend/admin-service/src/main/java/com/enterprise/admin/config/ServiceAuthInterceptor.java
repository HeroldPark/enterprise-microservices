package com.enterprise.admin.config;

import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpRequest;
import org.springframework.http.client.ClientHttpRequestExecution;
import org.springframework.http.client.ClientHttpRequestInterceptor;
import org.springframework.http.client.ClientHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.io.IOException;

/**
 * ⭐ 서비스 간 호출 시 Gateway 인증 헤더를 전달하는 Interceptor
 * 
 * admin-service가 다른 마이크로서비스를 호출할 때,
 * 현재 요청의 Gateway 인증 헤더를 자동으로 복사해서 전달합니다.
 */
@Slf4j
@Component
public class ServiceAuthInterceptor implements ClientHttpRequestInterceptor {

    private static final String HEADER_USER_NAME = "X-User-Name";
    private static final String HEADER_USER_ROLE = "X-User-Role";
    private static final String HEADER_AUTH_TOKEN = "X-Auth-Token";

    @Override
    public ClientHttpResponse intercept(
            HttpRequest request,
            byte[] body,
            ClientHttpRequestExecution execution) throws IOException {

        // 현재 HTTP 요청에서 Gateway 헤더 가져오기
        ServletRequestAttributes attributes = 
            (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();

        if (attributes != null) {
            HttpServletRequest currentRequest = attributes.getRequest();

            // Gateway에서 전달된 인증 헤더들을 가져와서 서비스 호출에 포함
            String username = currentRequest.getHeader(HEADER_USER_NAME);
            String role = currentRequest.getHeader(HEADER_USER_ROLE);
            String token = currentRequest.getHeader(HEADER_AUTH_TOKEN);

            if (username != null) {
                request.getHeaders().set(HEADER_USER_NAME, username);
                log.debug("🔐 Forwarding auth header: {} = {}", HEADER_USER_NAME, username);
            }

            if (role != null) {
                request.getHeaders().set(HEADER_USER_ROLE, role);
                log.debug("🔐 Forwarding auth header: {} = {}", HEADER_USER_ROLE, role);
            }

            if (token != null) {
                request.getHeaders().set(HEADER_AUTH_TOKEN, token);
                log.debug("🔐 Forwarding auth header: {} = present", HEADER_AUTH_TOKEN);
            }

            log.info("🔗 Service call to: {} with auth headers - User: {}, Role: {}, Token: {}", 
                    request.getURI(), 
                    username != null ? username : "none",
                    role != null ? role : "none",
                    token != null ? "present" : "none");
        } else {
            log.warn("⚠️ No request context available for service call to: {}", request.getURI());
        }

        return execution.execute(request, body);
    }
}
