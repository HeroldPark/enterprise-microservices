package com.enterprise.mqtt.config;

import lombok.extern.slf4j.Slf4j;
import org.apache.kafka.clients.admin.NewTopic;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.config.TopicBuilder;

/**
 * Kafka Topic 설정
 */
@Slf4j
@Configuration
public class KafkaConfig {

    @Value("${kafka.topics.mqtt-message}")
    private String mqttMessageTopic;

    @Value("${kafka.topics.device-data}")
    private String deviceDataTopic;

    @Value("${kafka.topics.device-request}")
    private String deviceRequestTopic;

    @Value("${kafka.topics.device-response}")
    private String deviceResponseTopic;

    @Value("${kafka.topics.fota}")
    private String fotaTopic;

    @Value("${kafka.topics.reboot}")
    private String rebootTopic;

    @Value("${kafka.topics.mqtt-command}")
    private String mqttCommandTopic;

    /**
     * MQTT 메시지 토픽 생성
     */
    @Bean
    public NewTopic mqttMessageTopic() {
        return TopicBuilder.name(mqttMessageTopic)
                .partitions(3)
                .replicas(1)
                .build();
    }

    /**
     * 디바이스 데이터 토픽 생성
     */
    @Bean
    public NewTopic deviceDataTopic() {
        return TopicBuilder.name(deviceDataTopic)
                .partitions(3)
                .replicas(1)
                .build();
    }

    /**
     * 디바이스 요청 토픽 생성
     */
    @Bean
    public NewTopic deviceRequestTopic() {
        return TopicBuilder.name(deviceRequestTopic)
                .partitions(3)
                .replicas(1)
                .build();
    }

    /**
     * 디바이스 응답 토픽 생성
     */
    @Bean
    public NewTopic deviceResponseTopic() {
        return TopicBuilder.name(deviceResponseTopic)
                .partitions(3)
                .replicas(1)
                .build();
    }

    /**
     * FOTA 토픽 생성
     */
    @Bean
    public NewTopic fotaTopic() {
        return TopicBuilder.name(fotaTopic)
                .partitions(3)
                .replicas(1)
                .build();
    }

    /**
     * Reboot 토픽 생성
     */
    @Bean
    public NewTopic rebootTopic() {
        return TopicBuilder.name(rebootTopic)
                .partitions(3)
                .replicas(1)
                .build();
    }

    /**
     * MQTT 명령 토픽 생성 (message-service → mqtt-service)
     */
    @Bean
    public NewTopic mqttCommandTopic() {
        return TopicBuilder.name(mqttCommandTopic)
                .partitions(3)
                .replicas(1)
                .build();
    }
}
