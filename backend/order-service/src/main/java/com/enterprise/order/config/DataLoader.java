package com.enterprise.order.config;

import com.enterprise.order.entity.Order;
import com.enterprise.order.entity.OrderItem;
import com.enterprise.order.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataLoader implements CommandLineRunner {

    private final OrderRepository orderRepository;

    @Override
    public void run(String... args) {
        if (orderRepository.count() == 0) {
            log.info("Loading fake order data...");
            
            // Order 1 - John Doe (userId: 2)
            Order order1 = Order.builder()
                    .userId(2L)
                    .username("john_doe")
                    .totalAmount(new BigDecimal("1549.98"))
                    .status(Order.OrderStatus.DELIVERED)
                    .shippingAddress("123 Main St, New York, NY 10001")
                    .build();
            
            OrderItem item1_1 = OrderItem.builder()
                    .productId(1L)
                    .productName("Professional Laptop")
                    .price(new BigDecimal("1299.99"))
                    .quantity(1)
                    .subtotal(new BigDecimal("1299.99"))
                    .build();
            
            OrderItem item1_2 = OrderItem.builder()
                    .productId(3L)
                    .productName("Wireless Headphones")
                    .price(new BigDecimal("249.99"))
                    .quantity(1)
                    .subtotal(new BigDecimal("249.99"))
                    .build();
            
            order1.addItem(item1_1);
            order1.addItem(item1_2);
            orderRepository.save(order1);
            
            // Order 2 - Jane Smith (userId: 3)
            Order order2 = Order.builder()
                    .userId(3L)
                    .username("jane_smith")
                    .totalAmount(new BigDecimal("1499.98"))
                    .status(Order.OrderStatus.SHIPPED)
                    .shippingAddress("456 Oak Ave, Los Angeles, CA 90001")
                    .build();
            
            OrderItem item2_1 = OrderItem.builder()
                    .productId(2L)
                    .productName("Smartphone Pro")
                    .price(new BigDecimal("899.99"))
                    .quantity(1)
                    .subtotal(new BigDecimal("899.99"))
                    .build();
            
            OrderItem item2_2 = OrderItem.builder()
                    .productId(4L)
                    .productName("Tablet Ultra")
                    .price(new BigDecimal("599.99"))
                    .quantity(1)
                    .subtotal(new BigDecimal("599.99"))
                    .build();
            
            order2.addItem(item2_1);
            order2.addItem(item2_2);
            orderRepository.save(order2);
            
            // Order 3 - Bob Wilson (userId: 4)
            Order order3 = Order.builder()
                    .userId(4L)
                    .username("bob_wilson")
                    .totalAmount(new BigDecimal("259.97"))
                    .status(Order.OrderStatus.PROCESSING)
                    .shippingAddress("789 Pine Rd, Chicago, IL 60601")
                    .build();
            
            OrderItem item3_1 = OrderItem.builder()
                    .productId(7L)
                    .productName("Winter Jacket")
                    .price(new BigDecimal("149.99"))
                    .quantity(1)
                    .subtotal(new BigDecimal("149.99"))
                    .build();
            
            OrderItem item3_2 = OrderItem.builder()
                    .productId(10L)
                    .productName("Modern Desk Lamp")
                    .price(new BigDecimal("49.99"))
                    .quantity(1)
                    .subtotal(new BigDecimal("49.99"))
                    .build();
            
            OrderItem item3_3 = OrderItem.builder()
                    .productId(5L)
                    .productName("Premium Cotton T-Shirt")
                    .price(new BigDecimal("29.99"))
                    .quantity(2)
                    .subtotal(new BigDecimal("59.98"))
                    .build();
            
            order3.addItem(item3_1);
            order3.addItem(item3_2);
            order3.addItem(item3_3);
            orderRepository.save(order3);
            
            // Order 4 - Alice Brown (userId: 5)
            Order order4 = Order.builder()
                    .userId(5L)
                    .username("alice_brown")
                    .totalAmount(new BigDecimal("359.96"))
                    .status(Order.OrderStatus.CONFIRMED)
                    .shippingAddress("321 Elm St, Houston, TX 77001")
                    .build();
            
            OrderItem item4_1 = OrderItem.builder()
                    .productId(11L)
                    .productName("Premium Yoga Mat")
                    .price(new BigDecimal("39.99"))
                    .quantity(1)
                    .subtotal(new BigDecimal("39.99"))
                    .build();
            
            OrderItem item4_2 = OrderItem.builder()
                    .productId(12L)
                    .productName("Adjustable Dumbbell Set")
                    .price(new BigDecimal("199.99"))
                    .quantity(1)
                    .subtotal(new BigDecimal("199.99"))
                    .build();
            
            OrderItem item4_3 = OrderItem.builder()
                    .productId(13L)
                    .productName("Hiking Backpack")
                    .price(new BigDecimal("119.99"))
                    .quantity(1)
                    .subtotal(new BigDecimal("119.99"))
                    .build();
            
            order4.addItem(item4_1);
            order4.addItem(item4_2);
            order4.addItem(item4_3);
            orderRepository.save(order4);
            
            // Order 5 - John Doe (second order)
            Order order5 = Order.builder()
                    .userId(2L)
                    .username("john_doe")
                    .totalAmount(new BigDecimal("219.97"))
                    .status(Order.OrderStatus.PENDING)
                    .shippingAddress("123 Main St, New York, NY 10001")
                    .build();
            
            OrderItem item5_1 = OrderItem.builder()
                    .productId(8L)
                    .productName("Smart Coffee Maker")
                    .price(new BigDecimal("129.99"))
                    .quantity(1)
                    .subtotal(new BigDecimal("129.99"))
                    .build();
            
            OrderItem item5_2 = OrderItem.builder()
                    .productId(9L)
                    .productName("High-Speed Blender")
                    .price(new BigDecimal("89.99"))
                    .quantity(1)
                    .subtotal(new BigDecimal("89.99"))
                    .build();
            
            order5.addItem(item5_1);
            order5.addItem(item5_2);
            orderRepository.save(order5);
            
            // Order 6 - Jane Smith (second order)
            Order order6 = Order.builder()
                    .userId(3L)
                    .username("jane_smith")
                    .totalAmount(new BigDecimal("59.98"))
                    .status(Order.OrderStatus.DELIVERED)
                    .shippingAddress("456 Oak Ave, Los Angeles, CA 90001")
                    .build();
            
            OrderItem item6_1 = OrderItem.builder()
                    .productId(14L)
                    .productName("Clean Code")
                    .price(new BigDecimal("34.99"))
                    .quantity(1)
                    .subtotal(new BigDecimal("34.99"))
                    .build();
            
            OrderItem item6_2 = OrderItem.builder()
                    .productId(15L)
                    .productName("The Great Adventure")
                    .price(new BigDecimal("24.99"))
                    .quantity(1)
                    .subtotal(new BigDecimal("24.99"))
                    .build();
            
            order6.addItem(item6_1);
            order6.addItem(item6_2);
            orderRepository.save(order6);
            
            log.info("Loaded {} orders", orderRepository.count());
        } else {
            log.info("Order data already exists, skipping data load");
        }
    }
}
