package com.enterprise.gateway.service;

import com.enterprise.gateway.dto.event.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.support.SendResult;
import org.springframework.stereotype.Service;

import java.util.concurrent.CompletableFuture;

/**
 * Gateway 이벤트 발행 서비스
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class GatewayEventProducer {

    private final KafkaTemplate<String, Object> kafkaTemplate;

    @Value("${spring.kafka.topic.gateway-request:gateway.request}")
    private String gatewayRequestTopic;

    @Value("${spring.kafka.topic.gateway-response:gateway.response}")
    private String gatewayResponseTopic;

    @Value("${spring.kafka.topic.auth-event:gateway.auth.event}")
    private String authEventTopic;

    @Value("${spring.kafka.topic.api-stats:gateway.api.stats}")
    private String apiStatsTopic;

    @Value("${spring.kafka.topic.error-log:gateway.error.log}")
    private String errorLogTopic;

    /**
     * Gateway 요청 이벤트 발행
     */
    public void sendRequestEvent(GatewayRequestEvent event) {
        CompletableFuture<SendResult<String, Object>> future = 
            kafkaTemplate.send(gatewayRequestTopic, event.getRequestId(), event);

        future.whenComplete((result, ex) -> {
            if (ex == null) {
                log.debug("Request event sent: requestId={}, path={}", 
                    event.getRequestId(), event.getPath());
            } else {
                log.error("Failed to send request event: requestId={}", 
                    event.getRequestId(), ex);
            }
        });
    }

    /**
     * Gateway 응답 이벤트 발행
     */
    public void sendResponseEvent(GatewayResponseEvent event) {
        CompletableFuture<SendResult<String, Object>> future = 
            kafkaTemplate.send(gatewayResponseTopic, event.getRequestId(), event);

        future.whenComplete((result, ex) -> {
            if (ex == null) {
                log.debug("Response event sent: requestId={}, status={}, time={}ms", 
                    event.getRequestId(), event.getStatusCode(), event.getResponseTimeMs());
            } else {
                log.error("Failed to send response event: requestId={}", 
                    event.getRequestId(), ex);
            }
        });
    }

    /**
     * 인증 이벤트 발행
     */
    public void sendAuthEvent(AuthEvent event) {
        String key = event.getUserId() != null ? event.getUserId() : event.getSourceIp();
        
        CompletableFuture<SendResult<String, Object>> future = 
            kafkaTemplate.send(authEventTopic, key, event);

        future.whenComplete((result, ex) -> {
            if (ex == null) {
                log.info("Auth event sent: action={}, user={}, ip={}", 
                    event.getAction(), event.getUsername(), event.getSourceIp());
            } else {
                log.error("Failed to send auth event: action={}", 
                    event.getAction(), ex);
            }
        });
    }

    /**
     * API 통계 이벤트 발행
     */
    public void sendApiStatsEvent(ApiStatsEvent event) {
        String key = event.getServiceName() + ":" + event.getEndpoint();
        
        CompletableFuture<SendResult<String, Object>> future = 
            kafkaTemplate.send(apiStatsTopic, key, event);

        future.whenComplete((result, ex) -> {
            if (ex == null) {
                log.debug("API stats event sent: service={}, endpoint={}", 
                    event.getServiceName(), event.getEndpoint());
            } else {
                log.error("Failed to send API stats event", ex);
            }
        });
    }

    /**
     * 에러 로그 이벤트 발행
     */
    public void sendErrorLog(String requestId, String path, String errorMessage, Exception exception) {
        var errorLog = ErrorLogEvent.builder()
                .requestId(requestId)
                .path(path)
                .errorMessage(errorMessage)
                .exceptionClass(exception != null ? exception.getClass().getName() : null)
                .stackTrace(exception != null ? getStackTrace(exception) : null)
                .build();

        CompletableFuture<SendResult<String, Object>> future = 
            kafkaTemplate.send(errorLogTopic, requestId, errorLog);

        future.whenComplete((result, ex) -> {
            if (ex == null) {
                log.debug("Error log sent: requestId={}", requestId);
            } else {
                log.error("Failed to send error log: requestId={}", requestId, ex);
            }
        });
    }

    private String getStackTrace(Exception e) {
        if (e == null) return null;
        
        StringBuilder sb = new StringBuilder();
        for (StackTraceElement element : e.getStackTrace()) {
            sb.append(element.toString()).append("\n");
            if (sb.length() > 1000) break; // 최대 1000자로 제한
        }
        return sb.toString();
    }

    /**
     * 에러 로그 이벤트 DTO
     */
    @lombok.Data
    @lombok.Builder
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    public static class ErrorLogEvent {
        private String requestId;
        private String path;
        private String errorMessage;
        private String exceptionClass;
        private String stackTrace;
        
        @lombok.Builder.Default
        private java.time.LocalDateTime timestamp = java.time.LocalDateTime.now();
        
        @lombok.Builder.Default
        private String eventType = "ERROR_LOG";
    }
}
