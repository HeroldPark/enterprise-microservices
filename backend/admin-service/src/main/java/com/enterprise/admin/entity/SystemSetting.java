package com.enterprise.admin.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

/**
 * 시스템 설정 엔티티
 * Key-Value 형태로 각종 파라미터 저장
 */
@Entity
@Table(name = "system_settings")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SystemSetting {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    /**
     * 설정 키 (고유값)
     * 예: "site.name", "mail.smtp.host", "security.max.login.attempts"
     */
    @Column(name = "setting_key", unique = true, nullable = false, length = 100)
    private String key;
    
    /**
     * 설정 값
     */
    @Column(name = "setting_value", columnDefinition = "TEXT")
    private String value;
    
    /**
     * 설정 타입
     * STRING, NUMBER, BOOLEAN, JSON, EMAIL, URL
     */
    @Enumerated(EnumType.STRING)
    @Column
    @Builder.Default  // ✅ 추가: Builder 사용 시에도 기본값 적용
    private ValueType type = ValueType.STRING;
    
    /**
     * 카테고리
     * GENERAL, EMAIL, SECURITY, PAYMENT, NOTIFICATION
     */
    @Enumerated(EnumType.STRING)
    @Column
    @Builder.Default  // ✅ 추가: Builder 사용 시에도 기본값 적용
    private Category category = Category.GENERAL;
    
    /**
     * 설정 설명
     */
    @Column(columnDefinition = "TEXT")
    private String description;
    
    /**
     * 기본값
     */
    @Column(name = "default_value", columnDefinition = "TEXT")
    private String defaultValue;
    
    /**
     * 암호화 필요 여부 (비밀번호, API 키 등)
     */
    @Column
    @Builder.Default  // ✅ 추가: Builder 사용 시에도 기본값 적용
    private Boolean isEncrypted = false;
    
    /**
     * 활성화 여부
     */
    @Column
    @Builder.Default  // ✅ 추가: Builder 사용 시에도 기본값 적용
    private Boolean isActive = true;
    
    /**
     * 마지막 수정자
     */
    @Column
    private String updatedBy;
    
    @CreationTimestamp
    @Column
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column
    private LocalDateTime updatedAt;
    
    /**
     * 설정 값 타입 열거형
     */
    public enum ValueType {
        STRING,     // 일반 문자열
        NUMBER,     // 숫자
        BOOLEAN,    // true/false
        JSON,       // JSON 형태
        EMAIL,      // 이메일
        URL,        // URL
        PASSWORD    // 비밀번호 (암호화)
    }
    
    /**
     * 설정 카테고리 열거형
     */
    public enum Category {
        GENERAL,        // 일반 설정
        EMAIL,          // 이메일 설정
        SECURITY,       // 보안 설정
        PAYMENT,        // 결제 설정
        NOTIFICATION,   // 알림 설정
        MAINTENANCE,    // 유지보수 설정
        INTEGRATION     // 외부 연동 설정
    }
}