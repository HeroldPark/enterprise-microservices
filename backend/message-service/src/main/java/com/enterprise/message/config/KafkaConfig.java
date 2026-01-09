package com.enterprise.message.config;

import org.apache.kafka.clients.admin.NewTopic;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.config.TopicBuilder;

/**
 * Kafka 토픽 및 기본 설정
 */
@Configuration
public class KafkaConfig {

    @Value("${kafka.topic.message-created}")
    private String messageCreatedTopic;

    @Value("${kafka.topic.message-read}")
    private String messageReadTopic;

    @Value("${kafka.topic.message-deleted}")
    private String messageDeletedTopic;

    /**
     * 메시지 생성 이벤트 토픽
     */
    @Bean
    public NewTopic messageCreatedTopic() {
        return TopicBuilder.name(messageCreatedTopic)
                .partitions(3)
                .replicas(1)
                .build();
    }

    /**
     * 메시지 읽음 처리 이벤트 토픽
     */
    @Bean
    public NewTopic messageReadTopic() {
        return TopicBuilder.name(messageReadTopic)
                .partitions(3)
                .replicas(1)
                .build();
    }

    /**
     * 메시지 삭제 이벤트 토픽
     */
    @Bean
    public NewTopic messageDeletedTopic() {
        return TopicBuilder.name(messageDeletedTopic)
                .partitions(3)
                .replicas(1)
                .build();
    }
}
