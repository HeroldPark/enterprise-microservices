package com.enterprise.user.service;

import com.enterprise.user.dto.UserDto;
import com.enterprise.user.dto.UserManagementRequest;
import com.enterprise.user.entity.User;
import com.enterprise.user.exception.ResourceNotFoundException;
import com.enterprise.user.exception.UserAlreadyExistsException;
import com.enterprise.user.mapper.UserMapper;
import com.enterprise.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UserManagementService {

    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;

    /**
     * 모든 사용자 조회 (페이징)
     */
    public Page<UserDto> getAllUsers(Pageable pageable) {
        log.info("Fetching all users with pagination");
        Page<User> users = userRepository.findAll(pageable);
        return users.map(userMapper::toDto);
    }

    /**
     * 사용자 ID로 조회
     */
    public UserDto getUserById(Long id) {
        log.info("Fetching user by id: {}", id);
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
        return userMapper.toDto(user);
    }

    /**
     * 새 사용자 생성 (관리자용)
     */
    @Transactional
    public UserDto createUser(UserManagementRequest request) {
        log.info("Creating new user: {}", request.getUsername());

        // 중복 체크
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new UserAlreadyExistsException("Username already exists: " + request.getUsername());
        }

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new UserAlreadyExistsException("Email already exists: " + request.getEmail());
        }

        // 사용자 생성
        User user = User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword() != null 
                        ? request.getPassword() 
                        : "defaultPassword123")) // 기본 비밀번호
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .phoneNumber(request.getPhoneNumber())
                .role(request.getRole() != null ? request.getRole() : User.Role.USER)
                .enabled(request.getEnabled() != null ? request.getEnabled() : true)
                .build();

        User savedUser = userRepository.save(user);
        log.info("User created successfully: {}", savedUser.getUsername());
        return userMapper.toDto(savedUser);
    }

    /**
     * 사용자 정보 수정
     */
    @Transactional
    public UserDto updateUser(Long id, UserManagementRequest request) {
        log.info("Updating user: {}", id);

        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));

        // 이메일 중복 체크 (자신의 이메일이 아닌 경우)
        if (request.getEmail() != null && !request.getEmail().equals(user.getEmail())) {
            if (userRepository.existsByEmail(request.getEmail())) {
                throw new UserAlreadyExistsException("Email already exists: " + request.getEmail());
            }
            user.setEmail(request.getEmail());
        }

        // 정보 업데이트
        if (request.getFirstName() != null) {
            user.setFirstName(request.getFirstName());
        }
        if (request.getLastName() != null) {
            user.setLastName(request.getLastName());
        }
        if (request.getPhoneNumber() != null) {
            user.setPhoneNumber(request.getPhoneNumber());
        }
        if (request.getRole() != null) {
            user.setRole(request.getRole());
        }
        if (request.getEnabled() != null) {
            user.setEnabled(request.getEnabled());
        }

        // 비밀번호 변경 (제공된 경우만)
        if (request.getPassword() != null && !request.getPassword().isEmpty()) {
            user.setPassword(passwordEncoder.encode(request.getPassword()));
        }

        User updatedUser = userRepository.save(user);
        log.info("User updated successfully: {}", updatedUser.getId());
        return userMapper.toDto(updatedUser);
    }

    /**
     * 사용자 삭제
     */
    @Transactional
    public void deleteUser(Long id) {
        log.info("Deleting user: {}", id);

        if (!userRepository.existsById(id)) {
            throw new ResourceNotFoundException("User not found with id: " + id);
        }

        userRepository.deleteById(id);
        log.info("User deleted successfully: {}", id);
    }

    /**
     * 사용자 검색 (이름, 이메일, 아이디)
     */
    public Page<UserDto> searchUsers(String keyword, Pageable pageable) {
        log.info("Searching users with keyword: {}", keyword);

        Page<User> users = userRepository.searchByKeyword(keyword, pageable);
        return users.map(userMapper::toDto);
    }

    /**
     * 권한별 사용자 조회
     */
    public Page<UserDto> getUsersByRole(User.Role role, Pageable pageable) {
        log.info("Fetching users by role: {}", role);

        Page<User> users = userRepository.findByRole(role, pageable);
        return users.map(userMapper::toDto);
    }

    /**
     * 사용자 상태 변경 (활성화/비활성화)
     */
    @Transactional
    public UserDto toggleUserStatus(Long id, Boolean enabled) {
        log.info("Toggling user status: {} - enabled: {}", id, enabled);

        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));

        user.setEnabled(enabled);
        User updatedUser = userRepository.save(user);

        log.info("User status updated: {}", updatedUser.getId());
        return userMapper.toDto(updatedUser);
    }

    /**
     * 사용자 권한 변경
     */
    @Transactional
    public UserDto changeUserRole(Long id, User.Role role) {
        log.info("Changing user role: {} - role: {}", id, role);

        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));

        user.setRole(role);
        User updatedUser = userRepository.save(user);

        log.info("User role updated: {}", updatedUser.getId());
        return userMapper.toDto(updatedUser);
    }

    /**
     * 사용자 통계
     */
    public Map<String, Object> getUserStats() {
        log.info("Fetching user statistics");

        long totalUsers = userRepository.count();
        long activeUsers = userRepository.countByEnabled(true);
        long inactiveUsers = userRepository.countByEnabled(false);
        long adminCount = userRepository.countByRole(User.Role.ADMIN);
        long userCount = userRepository.countByRole(User.Role.USER);
        long guestCount = userRepository.countByRole(User.Role.GUEST);

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalUsers", totalUsers);
        stats.put("activeUsers", activeUsers);
        stats.put("inactiveUsers", inactiveUsers);
        stats.put("adminCount", adminCount);
        stats.put("userCount", userCount);
        stats.put("guestCount", guestCount);

        return stats;
    }
}
