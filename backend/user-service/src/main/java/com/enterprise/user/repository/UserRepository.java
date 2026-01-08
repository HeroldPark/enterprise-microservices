package com.enterprise.user.repository;

import com.enterprise.user.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    // 기존 메서드들
    Optional<User> findByUsername(String username);
    
    Optional<User> findByEmail(String email);
    
    boolean existsByUsername(String username);
    
    boolean existsByEmail(String email);

    // 사용자 관리를 위한 추가 메서드들
    
    /**
     * 키워드로 사용자 검색 (username, email, firstName, lastName)
     */
    @Query("SELECT u FROM User u WHERE " +
           "LOWER(u.username) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(u.email) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(u.firstName) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(u.lastName) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    Page<User> searchByKeyword(@Param("keyword") String keyword, Pageable pageable);

    /**
     * 권한별 사용자 조회
     */
    Page<User> findByRole(User.Role role, Pageable pageable);

    /**
     * 상태별 사용자 수 조회
     */
    long countByEnabled(boolean enabled);

    /**
     * 로그인 상태 업데이트
     * (Gateway 로그아웃 시 사용자 식별은 username 기준)
     */
    @Transactional
    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("UPDATE User u SET u.login = :login WHERE u.username = :username")
    int updateLoginByUsername(@Param("username") String username, @Param("login") boolean login);

    long countByLogin(boolean login);
    
    /**
     * 권한별 사용자 수 조회
     */
    long countByRole(User.Role role);
}
