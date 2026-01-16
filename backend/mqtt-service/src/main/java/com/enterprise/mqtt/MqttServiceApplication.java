package com.enterprise.mqtt;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.kafka.annotation.EnableKafka;

/**
 * MQTT Service Application
 * IoT 디바이스와 MQTT 통신을 처리하고 Kafka로 메시지를 전달하는 마이크로서비스
 */
@EnableKafka
@EnableDiscoveryClient
@SpringBootApplication
public class MqttServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(MqttServiceApplication.class, args);
    }
}
