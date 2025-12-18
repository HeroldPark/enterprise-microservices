package com.enterprise.product.service;

import com.enterprise.product.dto.ProductDto;
import com.enterprise.product.entity.Product;
import com.enterprise.product.exception.ResourceNotFoundException;
import com.enterprise.product.mapper.ProductMapper;
import com.enterprise.product.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final ProductMapper productMapper;

    public Page<ProductDto> getAllProducts(Pageable pageable) {
        log.info("Fetching all products, page: {}", pageable.getPageNumber());
        return productRepository.findAll(pageable)
                .map(productMapper::toDto);
    }

    public Page<ProductDto> getActiveProducts(Pageable pageable) {
        log.info("Fetching active products, page: {}", pageable.getPageNumber());
        return productRepository.findByActiveTrue(pageable)
                .map(productMapper::toDto);
    }

    public Page<ProductDto> getProductsByCategory(String category, Pageable pageable) {
        log.info("Fetching products by category: {}", category);
        return productRepository.findByCategory(category, pageable)
                .map(productMapper::toDto);
    }

    public Page<ProductDto> searchProducts(String name, Pageable pageable) {
        log.info("Searching products by name: {}", name);
        return productRepository.findByNameContainingIgnoreCase(name, pageable)
                .map(productMapper::toDto);
    }

    public ProductDto getProductById(Long id) {
        log.info("Fetching product by id: {}", id);
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));
        return productMapper.toDto(product);
    }

    @Transactional
    public ProductDto createProduct(ProductDto productDto) {
        log.info("Creating new product: {}", productDto.getName());
        Product product = productMapper.toEntity(productDto);
        Product savedProduct = productRepository.save(product);
        log.info("Product created with id: {}", savedProduct.getId());
        return productMapper.toDto(savedProduct);
    }

    @Transactional
    public ProductDto updateProduct(Long id, ProductDto productDto) {
        log.info("Updating product: {}", id);
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));
        
        productMapper.updateEntityFromDto(productDto, product);
        Product updatedProduct = productRepository.save(product);
        log.info("Product updated: {}", updatedProduct.getId());
        return productMapper.toDto(updatedProduct);
    }

    @Transactional
    public void deleteProduct(Long id) {
        log.info("Deleting product: {}", id);
        if (!productRepository.existsById(id)) {
            throw new ResourceNotFoundException("Product not found with id: " + id);
        }
        productRepository.deleteById(id);
        log.info("Product deleted: {}", id);
    }

    @Transactional
    public void updateStock(Long id, Integer quantity) {
        log.info("Updating stock for product {}: {}", id, quantity);
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));
        
        int newStock = product.getStock() + quantity;
        if (newStock < 0) {
            throw new IllegalArgumentException("Insufficient stock");
        }
        
        product.setStock(newStock);
        productRepository.save(product);
        log.info("Stock updated for product {}: new stock = {}", id, newStock);
    }
}
