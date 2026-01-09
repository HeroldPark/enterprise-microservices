package com.enterprise.gateway.filter;

import com.enterprise.gateway.dto.event.GatewayRequestEvent;
import com.enterprise.gateway.dto.event.GatewayResponseEvent;
import com.enterprise.gateway.service.GatewayEventProducer;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

/**
 * Gateway 로깅 필터
 * 모든 요청/응답을 Kafka로 전송
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class GatewayLoggingFilter implements GlobalFilter, Ordered {

    private final GatewayEventProducer eventProducer;

    private static final String REQUEST_TIME_ATTR = "requestTime";
    private static final String REQUEST_ID_ATTR = "requestId";

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        ServerHttpRequest request = exchange.getRequest();

        // Request ID 생성
        String requestId = UUID.randomUUID().toString();
        exchange.getAttributes().put(REQUEST_ID_ATTR, requestId);

        // 요청 시작 시간 기록
        long startTime = System.currentTimeMillis();
        exchange.getAttributes().put(REQUEST_TIME_ATTR, startTime);

        // 요청 이벤트 발행
        publishRequestEvent(request, requestId, exchange);

        // 응답 후 이벤트 발행
        return chain.filter(exchange)
                .doOnSuccess(aVoid -> {
                    publishResponseEvent(exchange, requestId, startTime);
                })
                .doOnError(error -> {
                    publishErrorEvent(exchange, requestId, startTime, error);
                });
    }

    /**
     * 요청 이벤트 발행
     */
    private void publishRequestEvent(ServerHttpRequest request, String requestId, ServerWebExchange exchange) {
        try {
            // 헤더 추출 (민감 정보 제외)
            Map<String, String> headers = new HashMap<>();
            request.getHeaders().forEach((key, values) -> {
                if (!isSensitiveHeader(key)) {
                    headers.put(key, String.join(",", values));
                }
            });

            // 타겟 서비스 정보 추출
            String targetService = extractTargetService(exchange);
            String targetPath = extractTargetPath(exchange);

            GatewayRequestEvent event = GatewayRequestEvent.builder()
                    .requestId(requestId)
                    .method(request.getMethod().name())
                    .path(request.getPath().value())
                    .queryString(request.getURI().getQuery())
                    .headers(headers)
                    .sourceIp(getClientIp(request))
                    .userAgent(request.getHeaders().getFirst("User-Agent"))
                    .userId(extractUserId(exchange))
                    .targetService(targetService)
                    .targetPath(targetPath)
                    .timestamp(LocalDateTime.now())
                    .eventType("GATEWAY_REQUEST")
                    .build();

            eventProducer.sendRequestEvent(event);

        } catch (Exception e) {
            log.error("Failed to publish request event", e);
        }
    }

    /**
     * 응답 이벤트 발행
     */
    private void publishResponseEvent(ServerWebExchange exchange, String requestId, long startTime) {
        try {
            ServerHttpRequest request = exchange.getRequest();
            ServerHttpResponse response = exchange.getResponse();
            long responseTime = System.currentTimeMillis() - startTime;

            GatewayResponseEvent event = GatewayResponseEvent.builder()
                    .requestId(requestId)
                    .statusCode(response.getStatusCode() != null ? response.getStatusCode().value() : 0)
                    .statusMessage(response.getStatusCode() != null ? response.getStatusCode().toString() : "UNKNOWN")
                    .responseTimeMs(responseTime)
                    .contentLength(response.getHeaders().getContentLength())
                    .method(request.getMethod().name())
                    .path(request.getPath().value())
                    .targetService(extractTargetService(exchange))
                    .success(response.getStatusCode() != null && response.getStatusCode().is2xxSuccessful())
                    .timestamp(LocalDateTime.now())
                    .eventType("GATEWAY_RESPONSE")
                    .build();

            eventProducer.sendResponseEvent(event);

        } catch (Exception e) {
            log.error("Failed to publish response event", e);
        }
    }

    /**
     * 에러 이벤트 발행
     */
    private void publishErrorEvent(ServerWebExchange exchange, String requestId, long startTime, Throwable error) {
        try {
            ServerHttpRequest request = exchange.getRequest();
            long responseTime = System.currentTimeMillis() - startTime;

            GatewayResponseEvent event = GatewayResponseEvent.builder()
                    .requestId(requestId)
                    .statusCode(500)
                    .statusMessage("INTERNAL_SERVER_ERROR")
                    .responseTimeMs(responseTime)
                    .method(request.getMethod().name())
                    .path(request.getPath().value())
                    .targetService(extractTargetService(exchange))
                    .success(false)
                    .errorMessage(error.getMessage())
                    .timestamp(LocalDateTime.now())
                    .eventType("GATEWAY_ERROR")
                    .build();

            eventProducer.sendResponseEvent(event);
            eventProducer.sendErrorLog(requestId, request.getPath().value(),
                    error.getMessage(), (Exception) error);

        } catch (Exception e) {
            log.error("Failed to publish error event", e);
        }
    }

    /**
     * 민감한 헤더 확인
     */
    private boolean isSensitiveHeader(String headerName) {
        String lowerName = headerName.toLowerCase();
        return lowerName.contains("authorization") ||
                lowerName.contains("cookie") ||
                lowerName.contains("token") ||
                lowerName.contains("password");
    }

    /**
     * 클라이언트 IP 추출
     */
    private String getClientIp(ServerHttpRequest request) {
        String ip = request.getHeaders().getFirst("X-Forwarded-For");
        if (ip == null || ip.isEmpty()) {
            ip = request.getHeaders().getFirst("X-Real-IP");
        }
        if (ip == null || ip.isEmpty()) {
            ip = request.getRemoteAddress() != null ? request.getRemoteAddress().getAddress().getHostAddress()
                    : "unknown";
        }
        return ip;
    }

    /**
     * 사용자 ID 추출 (JWT에서)
     */
    private String extractUserId(ServerWebExchange exchange) {
        // JWT 필터에서 설정한 사용자 ID 추출
        Object userId = exchange.getAttribute("userId");
        return userId != null ? userId.toString() : null;
    }

    /**
     * 타겟 서비스 추출
     */
    private String extractTargetService(ServerWebExchange exchange) {
        Object serviceId = exchange
                .getAttribute("org.springframework.cloud.gateway.support.ServerWebExchangeUtils.gatewayRequestUrl");
        if (serviceId != null) {
            String url = serviceId.toString();
            if (url.startsWith("lb://")) {
                return url.substring(5).split("/")[0];
            }
        }
        return "unknown";
    }

    /**
     * 타겟 경로 추출
     */
    private String extractTargetPath(ServerWebExchange exchange) {
        Object requestUrl = exchange
                .getAttribute("org.springframework.cloud.gateway.support.ServerWebExchangeUtils.gatewayRequestUrl");
        if (requestUrl != null) {
            String url = requestUrl.toString();
            int pathStart = url.indexOf("/", url.indexOf("://") + 3);
            if (pathStart > 0) {
                return url.substring(pathStart);
            }
        }
        return exchange.getRequest().getPath().value();
    }

    @Override
    public int getOrder() {
        return Ordered.LOWEST_PRECEDENCE; // 가장 마지막에 실행
    }
}
