package com.enterprise.mqtt.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.enterprise.mqtt.dto.PublishRequest;
import com.enterprise.mqtt.dto.PublishResponse;
import com.enterprise.mqtt.service.MqttPublishService;

/**
 * MQTT Controller
 * MQTT 메시지 송신 API
 */
@Slf4j
@RestController
@RequestMapping("/api/mqtt")
@RequiredArgsConstructor
@Tag(name = "MQTT", description = "MQTT 메시지 송수신 API")
public class MqttController {

    private final MqttPublishService mqttPublishService;

    /**
     * MQTT 메시지 발행
     */
    @Operation(summary = "MQTT 메시지 발행", description = "디바이스로 MQTT 메시지를 발행합니다")
    @PostMapping("/publish")
    public ResponseEntity<PublishResponse> publishMessage(@Valid @RequestBody PublishRequest request) {
        log.info("Publish MQTT message request - Device ID: {}, Type: {}", 
                request.getDeviceId(), request.getMessageType());
        
        PublishResponse response = mqttPublishService.publishMessage(request);
        
        return response.isSuccess() 
                ? ResponseEntity.ok(response)
                : ResponseEntity.internalServerError().body(response);
    }

    /**
     * Echo 메시지 발행 (테스트용)
     */
    @Operation(summary = "Echo 메시지 발행", description = "디바이스 테스트를 위한 Echo 메시지를 발행합니다")
    @PostMapping("/echo/{deviceId}")
    public ResponseEntity<PublishResponse> publishEcho(
            @PathVariable String deviceId,
            @RequestBody String payload,
            @RequestParam(defaultValue = "0") Integer qos) {
        
        log.info("Publish Echo message - Device ID: {}", deviceId);
        
        PublishResponse response = mqttPublishService.publishEchoMessage(deviceId, payload, qos);
        
        return response.isSuccess() 
                ? ResponseEntity.ok(response)
                : ResponseEntity.internalServerError().body(response);
    }

    /**
     * FOTA 메시지 발행
     */
    @Operation(summary = "FOTA 메시지 발행", description = "펌웨어 업데이트(FOTA) 메시지를 발행합니다")
    @PostMapping("/fota/{deviceId}")
    public ResponseEntity<PublishResponse> publishFota(
            @PathVariable String deviceId,
            @RequestBody String payload) {
        
        log.info("Publish FOTA message - Device ID: {}", deviceId);
        
        PublishResponse response = mqttPublishService.publishFotaMessage(deviceId, payload);
        
        return response.isSuccess() 
                ? ResponseEntity.ok(response)
                : ResponseEntity.internalServerError().body(response);
    }

    /**
     * Reboot 메시지 발행
     */
    @Operation(summary = "Reboot 메시지 발행", description = "디바이스 재시작 메시지를 발행합니다")
    @PostMapping("/reboot/{deviceId}")
    public ResponseEntity<PublishResponse> publishReboot(
            @PathVariable String deviceId,
            @RequestBody String payload) {
        
        log.info("Publish Reboot message - Device ID: {}", deviceId);
        
        PublishResponse response = mqttPublishService.publishRebootMessage(deviceId, payload);
        
        return response.isSuccess() 
                ? ResponseEntity.ok(response)
                : ResponseEntity.internalServerError().body(response);
    }

    /**
     * NTP 메시지 발행
     */
    @Operation(summary = "NTP 메시지 발행", description = "시간 동기화(NTP) 메시지를 발행합니다")
    @PostMapping("/ntp/{deviceId}")
    public ResponseEntity<PublishResponse> publishNtp(
            @PathVariable String deviceId,
            @RequestBody String payload) {
        
        log.info("Publish NTP message - Device ID: {}", deviceId);
        
        PublishResponse response = mqttPublishService.publishNtpMessage(deviceId, payload);
        
        return response.isSuccess() 
                ? ResponseEntity.ok(response)
                : ResponseEntity.internalServerError().body(response);
    }

    /**
     * Health Check
     */
    @Operation(summary = "헬스 체크", description = "MQTT 서비스 상태를 확인합니다")
    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("MQTT Service is running");
    }
}
