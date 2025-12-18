package com.enterprise.product.config;

import com.enterprise.product.entity.Product;
import com.enterprise.product.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataLoader implements CommandLineRunner {

    private final ProductRepository productRepository;

    @Override
    public void run(String... args) {
        if (productRepository.count() == 0) {
            log.info("Loading fake product data...");
            
            // Electronics
            Product laptop = Product.builder()
                    .name("Professional Laptop")
                    .description("High-performance laptop with 16GB RAM and 512GB SSD")
                    .price(new BigDecimal("1299.99"))
                    .stock(25)
                    .category("Electronics")
                    .imageUrl("https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400")
                    .active(true)
                    .build();
            productRepository.save(laptop);
            
            Product smartphone = Product.builder()
                    .name("Smartphone Pro")
                    .description("Latest smartphone with 5G connectivity and advanced camera")
                    .price(new BigDecimal("899.99"))
                    .stock(50)
                    .category("Electronics")
                    .imageUrl("https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400")
                    .active(true)
                    .build();
            productRepository.save(smartphone);
            
            Product headphones = Product.builder()
                    .name("Wireless Headphones")
                    .description("Premium noise-cancelling wireless headphones")
                    .price(new BigDecimal("249.99"))
                    .stock(100)
                    .category("Electronics")
                    .imageUrl("https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400")
                    .active(true)
                    .build();
            productRepository.save(headphones);
            
            Product tablet = Product.builder()
                    .name("Tablet Ultra")
                    .description("10-inch tablet with stylus support and long battery life")
                    .price(new BigDecimal("599.99"))
                    .stock(30)
                    .category("Electronics")
                    .imageUrl("https://images.unsplash.com/photo-1561154464-82e9adf32764?w=400")
                    .active(true)
                    .build();
            productRepository.save(tablet);
            
            // Clothing
            Product tshirt = Product.builder()
                    .name("Premium Cotton T-Shirt")
                    .description("Comfortable 100% cotton t-shirt in various colors")
                    .price(new BigDecimal("29.99"))
                    .stock(200)
                    .category("Clothing")
                    .imageUrl("https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400")
                    .active(true)
                    .build();
            productRepository.save(tshirt);
            
            Product jeans = Product.builder()
                    .name("Classic Denim Jeans")
                    .description("Stylish and durable denim jeans")
                    .price(new BigDecimal("79.99"))
                    .stock(150)
                    .category("Clothing")
                    .imageUrl("https://images.unsplash.com/photo-1542272604-787c3835535d?w=400")
                    .active(true)
                    .build();
            productRepository.save(jeans);
            
            Product jacket = Product.builder()
                    .name("Winter Jacket")
                    .description("Warm and waterproof winter jacket")
                    .price(new BigDecimal("149.99"))
                    .stock(75)
                    .category("Clothing")
                    .imageUrl("https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400")
                    .active(true)
                    .build();
            productRepository.save(jacket);
            
            // Home & Garden
            Product coffeeMaker = Product.builder()
                    .name("Smart Coffee Maker")
                    .description("Programmable coffee maker with app control")
                    .price(new BigDecimal("129.99"))
                    .stock(60)
                    .category("Home & Garden")
                    .imageUrl("https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=400")
                    .active(true)
                    .build();
            productRepository.save(coffeeMaker);
            
            Product blender = Product.builder()
                    .name("High-Speed Blender")
                    .description("Professional-grade blender for smoothies and more")
                    .price(new BigDecimal("89.99"))
                    .stock(80)
                    .category("Home & Garden")
                    .imageUrl("https://images.unsplash.com/photo-1585515320310-259814833e62?w=400")
                    .active(true)
                    .build();
            productRepository.save(blender);
            
            Product lamp = Product.builder()
                    .name("Modern Desk Lamp")
                    .description("LED desk lamp with adjustable brightness")
                    .price(new BigDecimal("49.99"))
                    .stock(120)
                    .category("Home & Garden")
                    .imageUrl("https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=400")
                    .active(true)
                    .build();
            productRepository.save(lamp);
            
            // Sports & Outdoors
            Product yogaMat = Product.builder()
                    .name("Premium Yoga Mat")
                    .description("Non-slip yoga mat with carrying strap")
                    .price(new BigDecimal("39.99"))
                    .stock(150)
                    .category("Sports & Outdoors")
                    .imageUrl("https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=400")
                    .active(true)
                    .build();
            productRepository.save(yogaMat);
            
            Product dumbbell = Product.builder()
                    .name("Adjustable Dumbbell Set")
                    .description("Space-saving adjustable dumbbells (5-50 lbs)")
                    .price(new BigDecimal("199.99"))
                    .stock(40)
                    .category("Sports & Outdoors")
                    .imageUrl("https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400")
                    .active(true)
                    .build();
            productRepository.save(dumbbell);
            
            Product backpack = Product.builder()
                    .name("Hiking Backpack")
                    .description("Durable 40L hiking backpack with rain cover")
                    .price(new BigDecimal("119.99"))
                    .stock(65)
                    .category("Sports & Outdoors")
                    .imageUrl("https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400")
                    .active(true)
                    .build();
            productRepository.save(backpack);
            
            // Books
            Product techBook = Product.builder()
                    .name("Clean Code")
                    .description("A Handbook of Agile Software Craftsmanship")
                    .price(new BigDecimal("34.99"))
                    .stock(90)
                    .category("Books")
                    .imageUrl("https://images.unsplash.com/photo-1532012197267-da84d127e765?w=400")
                    .active(true)
                    .build();
            productRepository.save(techBook);
            
            Product novel = Product.builder()
                    .name("The Great Adventure")
                    .description("Bestselling fiction novel")
                    .price(new BigDecimal("24.99"))
                    .stock(110)
                    .category("Books")
                    .imageUrl("https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400")
                    .active(true)
                    .build();
            productRepository.save(novel);
            
            log.info("Loaded {} products", productRepository.count());
        } else {
            log.info("Product data already exists, skipping data load");
        }
    }
}
