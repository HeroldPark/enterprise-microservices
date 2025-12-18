package com.enterprise.order.client;

import com.enterprise.order.dto.ProductDto;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestParam;

@FeignClient(name = "product-service")
public interface ProductClient {
    
    @GetMapping("/products/{id}")
    ProductDto getProductById(@PathVariable Long id);
    
    @PutMapping("/products/{id}/stock")
    void updateStock(@PathVariable Long id, @RequestParam Integer quantity);
}
