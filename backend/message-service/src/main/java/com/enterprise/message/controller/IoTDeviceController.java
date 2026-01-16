package com.enterprise.message.controller;

import com.enterprise.message.dto.iot.IoTCommandDto;
import com.enterprise.message.kafka.IoTCommandProducer;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * IoT 디바이스 제어 API
 * IoT 디바이스로 명령을 전송하는 REST API
 */
@Slf4j
@RestController
@RequestMapping("/api/iot")
@RequiredArgsConstructor
@Tag(name = "IoT Device Control", description = "IoT 디바이스 제어 API")
public class IoTDeviceController {

    private final IoTCommandProducer iotCommandProducer;

    /**
     * IoT 디바이스로 명령 전송
     */
    @Operation(summary = "IoT 명령 전송", description = "IoT 디바이스로 명령을 전송합니다")
    @PostMapping("/command")
    public ResponseEntity<Map<String, Object>> sendCommand(@Valid @RequestBody IoTCommandDto command) {
        log.info("Received IoT command request - Device: {}, Type: {}", 
                command.getDeviceId(), command.getMessageType());

        try {
            iotCommandProducer.sendCommand(command);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("commandId", command.getCommandId());
            response.put("deviceId", command.getDeviceId());
            response.put("messageType", command.getMessageType());
            response.put("message", "Command sent successfully");

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Failed to send IoT command", e);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Failed to send command: " + e.getMessage());

            return ResponseEntity.internalServerError().body(response);
        }
    }

    /**
     * Echo 명령 전송 (테스트용)
     */
    @Operation(summary = "Echo 명령 전송", description = "디바이스 테스트를 위한 Echo 명령을 전송합니다")
    @PostMapping("/echo/{deviceId}")
    public ResponseEntity<Map<String, Object>> sendEcho(
            @PathVariable String deviceId,
            @RequestBody String payload) {

        log.info("Received Echo command request - Device: {}", deviceId);

        try {
            iotCommandProducer.sendEchoCommand(deviceId, payload);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("deviceId", deviceId);
            response.put("message", "Echo command sent successfully");

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Failed to send Echo command", e);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Failed to send Echo command: " + e.getMessage());

            return ResponseEntity.internalServerError().body(response);
        }
    }

    /**
     * FOTA 명령 전송
     */
    @Operation(summary = "FOTA 명령 전송", description = "펌웨어 업데이트(FOTA) 명령을 전송합니다")
    @PostMapping("/fota/{deviceId}")
    public ResponseEntity<Map<String, Object>> sendFota(
            @PathVariable String deviceId,
            @RequestBody String payload) {

        log.info("Received FOTA command request - Device: {}", deviceId);

        try {
            iotCommandProducer.sendFotaCommand(deviceId, payload);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("deviceId", deviceId);
            response.put("message", "FOTA command sent successfully");

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Failed to send FOTA command", e);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Failed to send FOTA command: " + e.getMessage());

            return ResponseEntity.internalServerError().body(response);
        }
    }

    /**
     * Reboot 명령 전송
     */
    @Operation(summary = "Reboot 명령 전송", description = "디바이스 재시작 명령을 전송합니다")
    @PostMapping("/reboot/{deviceId}")
    public ResponseEntity<Map<String, Object>> sendReboot(
            @PathVariable String deviceId,
            @RequestBody String payload) {

        log.info("Received Reboot command request - Device: {}", deviceId);

        try {
            iotCommandProducer.sendRebootCommand(deviceId, payload);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("deviceId", deviceId);
            response.put("message", "Reboot command sent successfully");

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Failed to send Reboot command", e);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Failed to send Reboot command: " + e.getMessage());

            return ResponseEntity.internalServerError().body(response);
        }
    }

    /**
     * NTP 명령 전송
     */
    @Operation(summary = "NTP 명령 전송", description = "시간 동기화(NTP) 명령을 전송합니다")
    @PostMapping("/ntp/{deviceId}")
    public ResponseEntity<Map<String, Object>> sendNtp(
            @PathVariable String deviceId,
            @RequestBody String payload) {

        log.info("Received NTP command request - Device: {}", deviceId);

        try {
            iotCommandProducer.sendNtpCommand(deviceId, payload);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("deviceId", deviceId);
            response.put("message", "NTP command sent successfully");

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Failed to send NTP command", e);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Failed to send NTP command: " + e.getMessage());

            return ResponseEntity.internalServerError().body(response);
        }
    }
}
