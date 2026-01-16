package com.enterprise.mqtt.exception;

/**
 * MQTT 관련 예외
 */
public class MqttException extends RuntimeException {
    
    public MqttException(String message) {
        super(message);
    }
    
    public MqttException(String message, Throwable cause) {
        super(message, cause);
    }
}
