package com.enterprise.order.client;

import com.enterprise.order.dto.UserDto;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "user-service")
public interface UserClient {
    
    @GetMapping("/internal/users/{id}")
    UserDto getUserById(@PathVariable Long id);
}
