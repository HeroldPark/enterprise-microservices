package com.enterprise.mqtt.config;

import com.amazonaws.services.iot.client.AWSIotException;
import com.amazonaws.services.iot.client.AWSIotMqttClient;
import com.enterprise.mqtt.listener.MqttMessageListener;

import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Configuration;

/**
 * MQTT 연결 및 구독 초기화 설정
 */
@Slf4j
@Configuration
@RequiredArgsConstructor
public class MqttConnectionConfig {

    private final AWSIotMqttClient awsIotMqttClient;
    private final MqttMessageListener mqttMessageListener;

    /**
     * 애플리케이션 시작 시 MQTT 연결 및 구독 설정
     */
    @PostConstruct
    public void init() throws AWSIotException {
        log.info("Initializing MQTT connection...");
        
        try {
            // MQTT 브로커에 연결
            awsIotMqttClient.connect();
            log.info("Successfully connected to AWS IoT MQTT broker");

            // 토픽 구독
            mqttMessageListener.subscribe(awsIotMqttClient);
            log.info("Successfully subscribed to MQTT topics");

        } catch (AWSIotException e) {
            log.error("Failed to initialize MQTT connection", e);
            throw e;
        }
    }

    /**
     * 애플리케이션 종료 시 MQTT 연결 해제
     */
    @PreDestroy
    public void cleanup() {
        log.info("Closing MQTT connection...");
        try {
            if (awsIotMqttClient != null) {
                awsIotMqttClient.disconnect();
                log.info("Successfully disconnected from AWS IoT MQTT broker");
            }
        } catch (Exception e) {
            log.error("Error while disconnecting MQTT client", e);
        }
    }
}
