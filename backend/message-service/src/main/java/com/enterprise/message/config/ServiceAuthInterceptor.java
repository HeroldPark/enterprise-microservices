package com.enterprise.message.config;

import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpRequest;
import org.springframework.http.client.ClientHttpRequestExecution;
import org.springframework.http.client.ClientHttpRequestInterceptor;
import org.springframework.http.client.ClientHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.io.IOException;

/**
 * Inter-service 호출 시 Authorization 헤더를 전달하기 위한 Interceptor
 */
@Slf4j
@Component
public class ServiceAuthInterceptor implements ClientHttpRequestInterceptor {

    @Override
    public ClientHttpResponse intercept(HttpRequest request, byte[] body, ClientHttpRequestExecution execution) throws IOException {
        ServletRequestAttributes attrs = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();

        if (attrs != null) {
            HttpServletRequest currentRequest = attrs.getRequest();
            String authHeader = currentRequest.getHeader(HttpHeaders.AUTHORIZATION);

            if (authHeader != null && !authHeader.isBlank()) {
                request.getHeaders().add(HttpHeaders.AUTHORIZATION, authHeader);
                log.debug("Forwarding Authorization header to {}", request.getURI());
            }
        }

        return execution.execute(request, body);
    }
}
