package com.enterprise.admin.dto;

import com.enterprise.admin.entity.SystemSetting;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SystemSettingDto {
    
    private Long id;
    private String key;
    private String value;
    private SystemSetting.ValueType type;
    private SystemSetting.Category category;
    private String description;
    private String defaultValue;
    private Boolean isEncrypted;
    private Boolean isActive;
    private String updatedBy;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}