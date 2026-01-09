package com.enterprise.message.config;

import lombok.RequiredArgsConstructor;
import org.springframework.cloud.client.loadbalancer.LoadBalanced;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;

import java.util.Collections;

@Configuration
@RequiredArgsConstructor
public class RestTemplateConfig {

    private final ServiceAuthInterceptor serviceAuthInterceptor;

    @Bean
    @LoadBalanced
    public RestTemplate restTemplate() {
        RestTemplate restTemplate = new RestTemplate();
        restTemplate.setInterceptors(Collections.singletonList(serviceAuthInterceptor));
        return restTemplate;
    }

    @Bean("plainRestTemplate")
    public RestTemplate plainRestTemplate() {
        RestTemplate restTemplate = new RestTemplate();
        restTemplate.setInterceptors(Collections.singletonList(serviceAuthInterceptor));
        return restTemplate;
    }
}
