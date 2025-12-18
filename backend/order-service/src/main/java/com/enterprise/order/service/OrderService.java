package com.enterprise.order.service;

import com.enterprise.order.client.ProductClient;
import com.enterprise.order.client.UserClient;
import com.enterprise.order.dto.*;
import com.enterprise.order.entity.Order;
import com.enterprise.order.entity.OrderItem;
import com.enterprise.order.exception.ResourceNotFoundException;
import com.enterprise.order.mapper.OrderMapper;
import com.enterprise.order.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final OrderMapper orderMapper;
    private final ProductClient productClient;
    private final UserClient userClient;

    @Transactional
    public OrderDto createOrder(CreateOrderRequest request) {
        log.info("Creating order for user: {}", request.getUserId());
        
        // Validate user
        UserDto user = userClient.getUserById(request.getUserId());
        
        // Create order
        Order order = Order.builder()
                .userId(request.getUserId())
                .username(user.getUsername())
                .shippingAddress(request.getShippingAddress())
                .status(Order.OrderStatus.PENDING)
                .build();
        
        BigDecimal totalAmount = BigDecimal.ZERO;
        
        // Process order items
        for (OrderItemDto itemDto : request.getItems()) {
            ProductDto product = productClient.getProductById(itemDto.getProductId());
            
            if (!product.getActive()) {
                throw new IllegalArgumentException("Product is not available: " + product.getName());
            }
            
            if (product.getStock() < itemDto.getQuantity()) {
                throw new IllegalArgumentException("Insufficient stock for product: " + product.getName());
            }
            
            BigDecimal subtotal = product.getPrice().multiply(BigDecimal.valueOf(itemDto.getQuantity()));
            
            OrderItem orderItem = OrderItem.builder()
                    .productId(product.getId())
                    .productName(product.getName())
                    .price(product.getPrice())
                    .quantity(itemDto.getQuantity())
                    .subtotal(subtotal)
                    .build();
            
            order.addItem(orderItem);
            totalAmount = totalAmount.add(subtotal);
            
            // Update product stock
            productClient.updateStock(product.getId(), -itemDto.getQuantity());
        }
        
        order.setTotalAmount(totalAmount);
        Order savedOrder = orderRepository.save(order);
        
        log.info("Order created successfully: {}", savedOrder.getId());
        return orderMapper.toDto(savedOrder);
    }

    public OrderDto getOrderById(Long id) {
        log.info("Fetching order by id: {}", id);
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + id));
        return orderMapper.toDto(order);
    }

    public Page<OrderDto> getAllOrders(Pageable pageable) {
        log.info("Fetching all orders, page: {}", pageable.getPageNumber());
        return orderRepository.findAll(pageable)
                .map(orderMapper::toDto);
    }

    public Page<OrderDto> getOrdersByUserId(Long userId, Pageable pageable) {
        log.info("Fetching orders for user: {}", userId);
        return orderRepository.findByUserId(userId, pageable)
                .map(orderMapper::toDto);
    }

    public List<OrderDto> getOrderHistoryByUserId(Long userId) {
        log.info("Fetching order history for user: {}", userId);
        return orderRepository.findByUserId(userId).stream()
                .map(orderMapper::toDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public OrderDto updateOrderStatus(Long id, Order.OrderStatus status) {
        log.info("Updating order {} status to: {}", id, status);
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + id));
        
        order.setStatus(status);
        Order updatedOrder = orderRepository.save(order);
        
        log.info("Order status updated: {}", updatedOrder.getId());
        return orderMapper.toDto(updatedOrder);
    }

    @Transactional
    public void cancelOrder(Long id) {
        log.info("Cancelling order: {}", id);
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + id));
        
        if (order.getStatus() != Order.OrderStatus.PENDING) {
            throw new IllegalStateException("Only pending orders can be cancelled");
        }
        
        // Restore product stock
        for (OrderItem item : order.getItems()) {
            productClient.updateStock(item.getProductId(), item.getQuantity());
        }
        
        order.setStatus(Order.OrderStatus.CANCELLED);
        orderRepository.save(order);
        
        log.info("Order cancelled: {}", id);
    }
}
