package com.enterprise.gateway.config;

import org.apache.kafka.clients.admin.NewTopic;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.config.TopicBuilder;

/**
 * Kafka 토픽 설정
 */
@Configuration
public class KafkaTopicConfig {

    @Value("${spring.kafka.topic.gateway-request:gateway.request}")
    private String gatewayRequestTopic;

    @Value("${spring.kafka.topic.gateway-response:gateway.response}")
    private String gatewayResponseTopic;

    @Value("${spring.kafka.topic.auth-event:gateway.auth.event}")
    private String authEventTopic;

    @Value("${spring.kafka.topic.api-stats:gateway.api.stats}")
    private String apiStatsTopic;

    @Value("${spring.kafka.topic.rate-limit:gateway.rate.limit}")
    private String rateLimitTopic;

    @Value("${spring.kafka.topic.error-log:gateway.error.log}")
    private String errorLogTopic;

    /**
     * Gateway 요청 토픽
     * 모든 API 요청 정보를 저장
     */
    @Bean
    public NewTopic gatewayRequestTopic() {
        return TopicBuilder.name(gatewayRequestTopic)
                .partitions(3)
                .replicas(1)
                .build();
    }

    /**
     * Gateway 응답 토픽
     * 모든 API 응답 정보를 저장
     */
    @Bean
    public NewTopic gatewayResponseTopic() {
        return TopicBuilder.name(gatewayResponseTopic)
                .partitions(3)
                .replicas(1)
                .build();
    }

    /**
     * 인증 이벤트 토픽
     * 로그인, 로그아웃, 인증 실패 등
     */
    @Bean
    public NewTopic authEventTopic() {
        return TopicBuilder.name(authEventTopic)
                .partitions(3)
                .replicas(1)
                .build();
    }

    /**
     * API 통계 토픽
     * API 호출 통계 및 성능 메트릭
     */
    @Bean
    public NewTopic apiStatsTopic() {
        return TopicBuilder.name(apiStatsTopic)
                .partitions(3)
                .replicas(1)
                .build();
    }

    /**
     * Rate Limit 토픽
     * Rate Limit 초과 이벤트
     */
    @Bean
    public NewTopic rateLimitTopic() {
        return TopicBuilder.name(rateLimitTopic)
                .partitions(3)
                .replicas(1)
                .build();
    }

    /**
     * 에러 로그 토픽
     * Gateway에서 발생한 에러 로그
     */
    @Bean
    public NewTopic errorLogTopic() {
        return TopicBuilder.name(errorLogTopic)
                .partitions(3)
                .replicas(1)
                .build();
    }
}
