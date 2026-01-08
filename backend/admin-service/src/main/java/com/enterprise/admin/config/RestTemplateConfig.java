package com.enterprise.admin.config;

import lombok.RequiredArgsConstructor;
import org.springframework.cloud.client.loadbalancer.LoadBalanced;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;

import java.util.Collections;

/**
 * RestTemplate 설정
 * 다른 마이크로서비스와 통신하기 위한 설정
 */
@Configuration
@RequiredArgsConstructor
public class RestTemplateConfig {
    
    private final ServiceAuthInterceptor serviceAuthInterceptor; // 주입
    
    @Bean
    @LoadBalanced
    public RestTemplate restTemplate() {
        RestTemplate restTemplate = new RestTemplate();
        // ⭐ Interceptor 등록
        restTemplate.setInterceptors(Collections.singletonList(serviceAuthInterceptor));
        return restTemplate;
    }
    
    @Bean("plainRestTemplate")
    public RestTemplate plainRestTemplate() {
        RestTemplate restTemplate = new RestTemplate();
        // ⭐ Interceptor 등록
        restTemplate.setInterceptors(Collections.singletonList(serviceAuthInterceptor));
        return restTemplate;
    }
}