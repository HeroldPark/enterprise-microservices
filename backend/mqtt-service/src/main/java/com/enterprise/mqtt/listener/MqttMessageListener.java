package com.enterprise.mqtt.listener;

import com.amazonaws.services.iot.client.AWSIotException;
import com.amazonaws.services.iot.client.AWSIotMessage;
import com.amazonaws.services.iot.client.AWSIotMqttClient;
import com.amazonaws.services.iot.client.AWSIotQos;
import com.amazonaws.services.iot.client.AWSIotTopic;
import com.enterprise.mqtt.dto.MqttMessage;
import com.enterprise.mqtt.service.KafkaProducerService;

// import com.rozeta.mqtt.dto.MqttMessage;
// import com.rozeta.mqtt.service.KafkaProducerService;
import lombok.extern.slf4j.Slf4j;

import java.time.LocalDateTime;
import java.util.Base64;
import java.util.UUID;

/**
 * MQTT 메시지 리스너
 * AWS IoT로부터 메시지를 수신하고 Kafka로 전달
 */
@Slf4j
public class MqttMessageListener {

    private final KafkaProducerService kafkaProducerService;
    private final String[] subscribeTopics;
    private final int qos;

    public MqttMessageListener(
            KafkaProducerService kafkaProducerService,
            String[] subscribeTopics,
            int qos) {
        this.kafkaProducerService = kafkaProducerService;
        this.subscribeTopics = subscribeTopics;
        this.qos = qos;
    }

    /**
     * MQTT 토픽 구독
     */
    public void subscribe(AWSIotMqttClient client) throws AWSIotException {
        AWSIotQos iotQos = AWSIotQos.valueOf("QOS" + qos);
        
        for (String topic : subscribeTopics) {
            log.info("Subscribing to MQTT topic: {} with QoS: {}", topic, qos);
            
            AWSIotTopic iotTopic = new AWSIotTopic(topic, iotQos) {
                @Override
                public void onMessage(AWSIotMessage message) {
                    handleMessage(message);
                }
            };
            
            client.subscribe(iotTopic, true);
            log.info("Successfully subscribed to topic: {}", topic);
        }
    }

    /**
     * MQTT 메시지 처리
     */
    private void handleMessage(AWSIotMessage message) {
        try {
            String topic = message.getTopic();
            String payload = message.getStringPayload();

            log.info("Received MQTT message from topic: {}", topic);
            log.debug("Raw payload: {}", payload);

            // 페이로드 정리 (따옴표 제거)
            String cleanedPayload = payload.replaceAll("\"", "").trim();

            // 메시지 타입: 기본값 PLAINTEXT (device/topic/C0 등)
            MqttMessage.MessageType messageType = MqttMessage.MessageType.PLAINTEXT;
            String deviceId = null;
            String hexString = null;

            // device/topic/A0 또는 B0인 경우만 Base64 디코딩 및 파싱
            if (topic.equals("device/topic/A0") || topic.equals("device/topic/B0")) {
                // Base64 디코딩
                byte[] byteArray;
                try {
                    String base64Cleaned = cleanedPayload.replaceAll("\\s", "");
                    byteArray = Base64.getDecoder().decode(base64Cleaned);
                    log.debug("Successfully decoded Base64 payload - {} bytes", byteArray.length);
                } catch (IllegalArgumentException e) {
                    log.error("Failed to decode Base64 payload", e);
                    return;
                }

                // 메시지 타입 및 deviceId 추출
                if (byteArray.length > 4) {
                    byte topicTypeByte = byteArray[4];
                    messageType = MqttMessage.MessageType.fromCode(topicTypeByte);
                    log.info("Message type: {} (code: {})", messageType, topicTypeByte);
                    
                    // 디바이스 ID 추출 (메시지 페이로드에서)
                    deviceId = extractDeviceIdFromPayload(byteArray, messageType);

                    // ✅ Hex로 변환
                    hexString = bytesToHex(byteArray);
                    log.debug("Converted to Hex: {}", hexString);
                }

                // Hex 덤프 로깅 (디버그용)
                if (log.isDebugEnabled()) {
                    logHexDump(byteArray);
                }
            } else {
                // PLAINTEXT 메시지 (device/topic/C0 등)
                log.info("PLAINTEXT message from topic: {}, payload length: {}", topic, cleanedPayload.length());
                // deviceId는 null로 유지 (PLAINTEXT 메시지는 deviceId 없음)
            }

            // MqttMessage DTO 생성
            MqttMessage mqttMessage = MqttMessage.builder()
                    .messageId(UUID.randomUUID().toString())
                    .topic(topic)
                    .messageType(messageType)
                    .deviceId(deviceId)  // TEXT인 경우 null
                    .rawMessage(cleanedPayload)
                    .parsedMessage(hexString)  // 파싱은 다른 서비스에서 처리
                    .qos(qos)
                    .receivedAt(LocalDateTime.now())
                    .build();

            // Kafka로 메시지 전송 (deviceId가 null이어도 전송됨)
            kafkaProducerService.sendMqttMessage(mqttMessage);
            
            log.info("Successfully processed MQTT message - Type: {}, DeviceId: {}", 
                    messageType, deviceId);

        } catch (Exception e) {
            log.error("Error processing MQTT message", e);
        }
    }

    /**
     * 메시지 페이로드에서 디바이스 ID (Serial Number) 추출
     * 
     * REQUEST 메시지 구조:
     * - [0-3]:  deviceID (4바이트, 고정값 0)
     * - [4]:    topicType (1바이트, REQUEST=2)
     * - [5-21]: serialNo (17바이트, 실제 디바이스 ID) ← 여기서 추출
     * 
     * @param byteArray 디코딩된 메시지 바이트 배열
     * @param messageType 메시지 타입
     * @return 디바이스 Serial Number (예: "EST-ROZ-250010001")
     */
    private String extractDeviceIdFromPayload(byte[] byteArray, MqttMessage.MessageType messageType) {
        try {
            byte[] serialNoBytes = new byte[20];
            
            // REQUEST 메시지의 최소 길이: 4(deviceID) + 1(topicType) + 17(serialNo) = 22바이트
            if (messageType == MqttMessage.MessageType.REQUEST) {
                if (byteArray.length < 22) {
                    log.warn("REQUEST message too short: {} bytes (expected 22+)", byteArray.length);
                    return null;
                }
                // serialNo는 5번째 바이트부터 17바이트 (인덱스 5-21)
                System.arraycopy(byteArray, 5, serialNoBytes, 0, 17);
            } else {
                // 다른 메시지 타입: deviceID는 0번째 바이트부터 4바이트 (인덱스 0-3)
                if (byteArray.length < 4) {
                    log.warn("Message too short for deviceID extraction: {} bytes", byteArray.length);
                    return null;
                }
                System.arraycopy(byteArray, 0, serialNoBytes, 0, 4);
            }

            String deviceId = new String(serialNoBytes, "UTF-8").trim();

            // 유효한 Serial Number인지 확인
            // - 빈 문자열이 아님
            // - ASCII 출력 가능 문자만 포함 (공백~틸데)
            // - EST로 시작 (EST-ROZ 형식)
            if (!deviceId.isEmpty() &&
                    deviceId.matches("[\\x20-\\x7E]+") &&
                    deviceId.startsWith("EST")) {
                log.debug("Extracted device serial number from payload: {}", deviceId);
                return deviceId;
            } else {
                log.warn("Invalid serial number format: {}", deviceId);
            }
        } catch (Exception e) {
            log.debug("Failed to extract device ID from payload", e);
        }
        return null;
    }

    /**
     * Hex 덤프 로깅
     */
    private void logHexDump(byte[] byteArray) {
        StringBuilder hexOutput = new StringBuilder();
        hexOutput.append("\n=== Hex Dump ===\n");
        
        for (int i = 0; i < byteArray.length; i++) {
            hexOutput.append(String.format("%02X ", byteArray[i] & 0xFF));
            if ((i + 1) % 16 == 0) {
                hexOutput.append("\n");
            }
        }
        
        hexOutput.append(String.format("\nTotal: %d bytes\n", byteArray.length));
        log.debug(hexOutput.toString());
    }

    // ✅ Hex 변환 헬퍼 메서드 추가
    private String bytesToHex(byte[] bytes) {
        StringBuilder sb = new StringBuilder(bytes.length * 2);
        for (byte b : bytes) {
            sb.append(String.format("%02X", b));
        }
        return sb.toString();
    }
}
