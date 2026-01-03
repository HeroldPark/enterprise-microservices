package com.enterprise.admin.repository;

import com.enterprise.admin.entity.Menu;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MenuRepository extends JpaRepository<Menu, String> {
    
    /**
     * 순서로 정렬된 모든 메뉴 조회
     */
    @Query("SELECT DISTINCT m FROM Menu m LEFT JOIN FETCH m.subItems ORDER BY m.order ASC")
    List<Menu> findAllByOrderByOrderAsc();
    
    /**
     * 특정 권한을 가진 메뉴 조회
     */
    @Query("SELECT DISTINCT m FROM Menu m JOIN m.roles r WHERE r = :role ORDER BY m.order ASC")
    List<Menu> findByRolesContaining(@Param("role") String role);
    
    /**
     * ID로 메뉴 존재 여부 확인
     */
    boolean existsById(String id);
    
    /**
     * 경로로 메뉴 조회
     */
    Optional<Menu> findByPath(String path);
}
