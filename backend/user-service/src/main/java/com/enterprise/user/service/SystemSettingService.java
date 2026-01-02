package com.enterprise.user.service;

import com.enterprise.user.dto.SystemSettingDto;
import com.enterprise.user.entity.SystemSetting;
import com.enterprise.user.exception.ResourceNotFoundException;
import com.enterprise.user.repository.SystemSettingRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class SystemSettingService {
    
    private final SystemSettingRepository settingRepository;
    
    /**
     * 모든 설정 조회 (페이징)
     */
    public Page<SystemSettingDto> getAllSettings(Pageable pageable) {
        log.info("Fetching all system settings with pagination");
        return settingRepository.findAll(pageable)
                .map(this::toDto);
    }
    
    /**
     * 카테고리별 설정 조회
     */
    public List<SystemSettingDto> getSettingsByCategory(SystemSetting.Category category) {
        log.info("Fetching settings for category: {}", category);
        return settingRepository.findByCategory(category).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }
    
    /**
     * ID로 설정 조회
     */
    public SystemSettingDto getSettingById(Long id) {
        log.info("Fetching setting by id: {}", id);
        SystemSetting setting = settingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Setting not found with id: " + id));
        return toDto(setting);
    }
    
    /**
     * Key로 설정 값 조회 (실제 사용)
     */
    public String getSettingValue(String key) {
        log.debug("Getting value for key: {}", key);
        return settingRepository.findByKey(key)
                .map(SystemSetting::getValue)
                .orElse(null);
    }
    
    /**
     * Key로 설정 값 조회 (기본값 포함)
     */
    public String getSettingValue(String key, String defaultValue) {
        String value = getSettingValue(key);
        return value != null ? value : defaultValue;
    }
    
    /**
     * 설정 생성
     */
    @Transactional
    public SystemSettingDto createSetting(SystemSettingDto dto) {
        log.info("Creating new setting: {}", dto.getKey());
        
        // 중복 키 체크
        if (settingRepository.existsByKey(dto.getKey())) {
            throw new IllegalArgumentException("Setting key already exists: " + dto.getKey());
        }
        
        SystemSetting setting = SystemSetting.builder()
                .key(dto.getKey())
                .value(dto.getValue())
                .type(dto.getType() != null ? dto.getType() : SystemSetting.ValueType.STRING)
                .category(dto.getCategory() != null ? dto.getCategory() : SystemSetting.Category.GENERAL)
                .description(dto.getDescription())
                .defaultValue(dto.getDefaultValue())
                .isEncrypted(dto.getIsEncrypted() != null ? dto.getIsEncrypted() : false)
                .isActive(dto.getIsActive() != null ? dto.getIsActive() : true)
                .updatedBy(getCurrentUsername())
                .build();
        
        SystemSetting saved = settingRepository.save(setting);
        log.info("Setting created successfully: {}", saved.getKey());
        return toDto(saved);
    }
    
    /**
     * 설정 수정
     */
    @Transactional
    public SystemSettingDto updateSetting(Long id, SystemSettingDto dto) {
        log.info("Updating setting with id: {}", id);
        
        SystemSetting setting = settingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Setting not found with id: " + id));
        
        // 키 변경 시 중복 체크
        if (!setting.getKey().equals(dto.getKey()) && settingRepository.existsByKey(dto.getKey())) {
            throw new IllegalArgumentException("Setting key already exists: " + dto.getKey());
        }
        
        setting.setKey(dto.getKey());
        setting.setValue(dto.getValue());
        setting.setType(dto.getType());
        setting.setCategory(dto.getCategory());
        setting.setDescription(dto.getDescription());
        setting.setDefaultValue(dto.getDefaultValue());
        setting.setIsEncrypted(dto.getIsEncrypted());
        setting.setIsActive(dto.getIsActive());
        setting.setUpdatedBy(getCurrentUsername());
        
        SystemSetting updated = settingRepository.save(setting);
        log.info("Setting updated successfully: {}", updated.getKey());
        return toDto(updated);
    }
    
    /**
     * 설정 삭제
     */
    @Transactional
    public void deleteSetting(Long id) {
        log.info("Deleting setting with id: {}", id);
        
        if (!settingRepository.existsById(id)) {
            throw new ResourceNotFoundException("Setting not found with id: " + id);
        }
        
        settingRepository.deleteById(id);
        log.info("Setting deleted successfully: {}", id);
    }
    
    /**
     * 설정 토글 (활성화/비활성화)
     */
    @Transactional
    public SystemSettingDto toggleSetting(Long id) {
        log.info("Toggling setting: {}", id);
        
        SystemSetting setting = settingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Setting not found with id: " + id));
        
        setting.setIsActive(!setting.getIsActive());
        setting.setUpdatedBy(getCurrentUsername());
        
        SystemSetting updated = settingRepository.save(setting);
        log.info("Setting toggled: {} - isActive: {}", id, updated.getIsActive());
        return toDto(updated);
    }
    
    /**
     * 기본값으로 초기화
     */
    @Transactional
    public SystemSettingDto resetToDefault(Long id) {
        log.info("Resetting setting to default: {}", id);
        
        SystemSetting setting = settingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Setting not found with id: " + id));
        
        if (setting.getDefaultValue() != null) {
            setting.setValue(setting.getDefaultValue());
            setting.setUpdatedBy(getCurrentUsername());
            
            SystemSetting updated = settingRepository.save(setting);
            log.info("Setting reset to default: {}", id);
            return toDto(updated);
        } else {
            throw new IllegalStateException("No default value set for this setting");
        }
    }
    
    /**
     * Entity to DTO
     */
    private SystemSettingDto toDto(SystemSetting setting) {
        return SystemSettingDto.builder()
                .id(setting.getId())
                .key(setting.getKey())
                .value(setting.getValue())
                .type(setting.getType())
                .category(setting.getCategory())
                .description(setting.getDescription())
                .defaultValue(setting.getDefaultValue())
                .isEncrypted(setting.getIsEncrypted())
                .isActive(setting.getIsActive())
                .updatedBy(setting.getUpdatedBy())
                .createdAt(setting.getCreatedAt())
                .updatedAt(setting.getUpdatedAt())
                .build();
    }
    
    /**
     * 현재 로그인한 사용자명 가져오기
     */
    private String getCurrentUsername() {
        try {
            return SecurityContextHolder.getContext().getAuthentication().getName();
        } catch (Exception e) {
            return "system";
        }
    }
}