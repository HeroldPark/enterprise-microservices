package com.enterprise.message.kafka;

import com.enterprise.message.dto.iot.IoTDeviceMessageDto;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import java.util.Map;

import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.support.KafkaHeaders;
import org.springframework.messaging.handler.annotation.Header;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Service;

/**
 * IoT 디바이스 메시지 수신 서비스
 * mqtt-service에서 Kafka를 통해 전달받은 IoT 디바이스 메시지를 처리
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class IoTDeviceMessageConsumer {

    private final ObjectMapper objectMapper;

    /**
     * 디바이스 데이터 수신 (PERIODIC, DISCRETE, ECHO)
     */
    @KafkaListener(
            topics = "${kafka.topic.device-data}",
            groupId = "${spring.kafka.consumer.group-id}",
            containerFactory = "stringKafkaListenerContainerFactory"
    )
    public void consumeDeviceData(
            @Payload String messageJson,
            @Header(KafkaHeaders.RECEIVED_PARTITION) int partition,
            @Header(KafkaHeaders.OFFSET) long offset) {

        log.info("Received device data from partition {}, offset {}", partition, offset);

        try {
            IoTDeviceMessageDto message = objectMapper.readValue(messageJson, IoTDeviceMessageDto.class);
            
            log.info("Processing device data - Device: {}, Type: {}, Message ID: {}", 
                    message.getDeviceId(), message.getMessageType(), message.getMessageId());

            // 메시지 타입에 따른 처리
            switch (message.getMessageType()) {
                case PERIODIC -> processPeriodicData(message);
                case DISCRETE -> processDiscreteData(message);
                case ECHO -> processEchoData(message);
                default -> log.warn("Unhandled message type in device-data: {}", message.getMessageType());
            }

        } catch (Exception e) {
            log.error("Error processing device data message", e);
        }
    }

    /**
     * 디바이스 요청 수신 (REQUEST) - 단말기 등록 요청 처리
     */
    @KafkaListener(
            topics = "${kafka.topic.device-request}",
            groupId = "${spring.kafka.consumer.group-id}",
            containerFactory = "stringKafkaListenerContainerFactory"
    )
    public void consumeDeviceRequest(
            @Payload String messageJson,
            @Header(KafkaHeaders.RECEIVED_PARTITION) int partition,
            @Header(KafkaHeaders.OFFSET) long offset) {

        log.info("Received device request from partition {}, offset {}", partition, offset);

        try {
            // ✅ 로그 추가: 받은 JSON 확인
            log.debug("Raw JSON: {}", messageJson);

            IoTDeviceMessageDto message = objectMapper.readValue(messageJson, IoTDeviceMessageDto.class);
            
            // ✅ 역직렬화 성공 로그
            log.info("Deserialized message - Device: {}, Type: {}",
                    message.getDeviceId(), message.getMessageType());

            processDeviceRequest(message);

        } catch (Exception e) {
            log.error("Error processing device request message", e);
        }
    }

    /**
     * 디바이스 응답 수신 (RESPONSE) - 단말기 등록 요청 응답
     */
    @KafkaListener(
            topics = "${kafka.topic.device-response}",
            groupId = "${spring.kafka.consumer.group-id}",
            containerFactory = "stringKafkaListenerContainerFactory"
    )
    public void consumeDeviceResponse(
            @Payload String messageJson,
            @Header(KafkaHeaders.RECEIVED_PARTITION) int partition,
            @Header(KafkaHeaders.OFFSET) long offset) {

        log.info("Received device response from partition {}, offset {}", partition, offset);

        try {
            IoTDeviceMessageDto message = objectMapper.readValue(messageJson, IoTDeviceMessageDto.class);
            
            log.info("Processing device response - Device: {}, Message ID: {}", 
                    message.getDeviceId(), message.getMessageId());

            processDeviceResponse(message);

        } catch (Exception e) {
            log.error("Error processing device response message", e);
        }
    }

    /**
     * FOTA 메시지 수신
     */
    @KafkaListener(
            topics = "${kafka.topic.fota}",
            groupId = "${spring.kafka.consumer.group-id}",
            containerFactory = "stringKafkaListenerContainerFactory"
    )
    public void consumeFotaMessage(
            @Payload String messageJson,
            @Header(KafkaHeaders.RECEIVED_PARTITION) int partition,
            @Header(KafkaHeaders.OFFSET) long offset) {

        log.info("Received FOTA message from partition {}, offset {}", partition, offset);

        try {
            IoTDeviceMessageDto message = objectMapper.readValue(messageJson, IoTDeviceMessageDto.class);
            
            log.info("Processing FOTA message - Device: {}, Message ID: {}", 
                    message.getDeviceId(), message.getMessageId());

            processFotaMessage(message);

        } catch (Exception e) {
            log.error("Error processing FOTA message", e);
        }
    }

    /**
     * Reboot 메시지 수신
     */
    @KafkaListener(
            topics = "${kafka.topic.reboot}",
            groupId = "${spring.kafka.consumer.group-id}",
            containerFactory = "stringKafkaListenerContainerFactory"
    )
    public void consumeRebootMessage(
            @Payload String messageJson,
            @Header(KafkaHeaders.RECEIVED_PARTITION) int partition,
            @Header(KafkaHeaders.OFFSET) long offset) {

        log.info("Received reboot message from partition {}, offset {}", partition, offset);

        try {
            IoTDeviceMessageDto message = objectMapper.readValue(messageJson, IoTDeviceMessageDto.class);
            
            log.info("Processing reboot message - Device: {}, Message ID: {}", 
                    message.getDeviceId(), message.getMessageId());

            processRebootMessage(message);

        } catch (Exception e) {
            log.error("Error processing reboot message", e);
        }
    }

    // === Private Processing Methods ===

    /**
     * 주기적 데이터 처리
     */
    private void processPeriodicData(IoTDeviceMessageDto message) {
        log.info("Processing PERIODIC data - Device: {}, Raw: {}", 
                message.getDeviceId(), message.getRawMessage());
        
        // TODO: 실제 비즈니스 로직 구현
        // 1. 디바이스 상태 업데이트
        // 2. 센서 데이터 저장
        // 3. 이상 감지 알고리즘 실행
        // 4. 필요시 알림 발송
    }

    /**
     * 이벤트성 데이터 처리
     */
    private void processDiscreteData(IoTDeviceMessageDto message) {
        log.info("Processing DISCRETE data - Device: {}, Raw: {}", 
                message.getDeviceId(), message.getRawMessage());
        
        // TODO: 실제 비즈니스 로직 구현
        // 1. 이벤트 로그 저장
        // 2. 긴급 알림 발송
        // 3. 대응 프로세스 트리거
    }

    /**
     * Echo 데이터 처리
     */
    private void processEchoData(IoTDeviceMessageDto message) {
        log.info("Processing ECHO data - Device: {}, Raw: {}", 
                message.getDeviceId(), message.getRawMessage());
        
        // TODO: Echo 응답 생성 및 전송
    }

    /**
     * 디바이스 등록 요청 처리
     */
    private void processDeviceRequest(IoTDeviceMessageDto message) {
        log.info("Processing device REQUEST - Device: {}, Raw: {}", 
                message.getDeviceId(), message.getRawMessage());
        
        // TODO: 실제 비즈니스 로직 구현
        // 1. 디바이스 등록 처리
        // 2. 인증 정보 생성
        // 3. 응답 메시지 전송
    }

    /**
     * 디바이스 응답 처리
     */
    private void processDeviceResponse(IoTDeviceMessageDto message) {
        log.info("Processing device RESPONSE - Device: {}, Raw: {}", 
                message.getDeviceId(), message.getRawMessage());
        
        // TODO: 실제 비즈니스 로직 구현
        // 1. 명령 실행 결과 확인
        // 2. 상태 업데이트
    }

    /**
     * FOTA 메시지 처리
     */
    private void processFotaMessage(IoTDeviceMessageDto message) {
        log.info("Processing FOTA message - Device: {}, Raw: {}", 
                message.getDeviceId(), message.getRawMessage());
        
        // TODO: 실제 비즈니스 로직 구현
        // 1. 펌웨어 업데이트 진행 상황 추적
        // 2. 업데이트 완료 확인
        // 3. 상태 업데이트
    }

    /**
     * Reboot 메시지 처리
     */
    private void processRebootMessage(IoTDeviceMessageDto message) {
        log.info("Processing REBOOT message - Device: {}, Raw: {}", 
                message.getDeviceId(), message.getRawMessage());
        
        // TODO: 실제 비즈니스 로직 구현
        // 1. 재시작 완료 확인
        // 2. 상태 업데이트
    }
}
