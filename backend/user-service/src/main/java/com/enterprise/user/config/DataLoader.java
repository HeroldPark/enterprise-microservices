package com.enterprise.user.config;

import com.enterprise.user.entity.User;
import com.enterprise.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataLoader implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (userRepository.count() == 0) {
            log.info("Loading fake user data...");
            
            // Admin user
            User admin = User.builder()
                    .username("admin")
                    .email("admin@enterprise.com")
                    .password(passwordEncoder.encode("admin123"))
                    .firstName("Admin")
                    .lastName("User")
                    .phoneNumber("+1234567890")
                    .role(User.Role.ADMIN)
                    .enabled(true)
                    .build();
            userRepository.save(admin);
            
            // Regular users
            User john = User.builder()
                    .username("john_doe")
                    .email("john.doe@example.com")
                    .password(passwordEncoder.encode("password123"))
                    .firstName("John")
                    .lastName("Doe")
                    .phoneNumber("+1234567891")
                    .role(User.Role.USER)
                    .enabled(true)
                    .build();
            userRepository.save(john);
            
            User jane = User.builder()
                    .username("jane_smith")
                    .email("jane.smith@example.com")
                    .password(passwordEncoder.encode("password123"))
                    .firstName("Jane")
                    .lastName("Smith")
                    .phoneNumber("+1234567892")
                    .role(User.Role.USER)
                    .enabled(true)
                    .build();
            userRepository.save(jane);
            
            User bob = User.builder()
                    .username("bob_wilson")
                    .email("bob.wilson@example.com")
                    .password(passwordEncoder.encode("password123"))
                    .firstName("Bob")
                    .lastName("Wilson")
                    .phoneNumber("+1234567893")
                    .role(User.Role.USER)
                    .enabled(true)
                    .build();
            userRepository.save(bob);
            
            User alice = User.builder()
                    .username("alice_brown")
                    .email("alice.brown@example.com")
                    .password(passwordEncoder.encode("password123"))
                    .firstName("Alice")
                    .lastName("Brown")
                    .phoneNumber("+1234567894")
                    .role(User.Role.USER)
                    .enabled(true)
                    .build();
            userRepository.save(alice);
            
            log.info("Loaded {} users", userRepository.count());
        } else {
            log.info("User data already exists, skipping data load");
        }
    }
}
