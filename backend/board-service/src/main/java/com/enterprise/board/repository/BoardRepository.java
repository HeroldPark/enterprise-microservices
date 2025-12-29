package com.enterprise.board.repository;

import com.enterprise.board.entity.Board;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BoardRepository extends JpaRepository<Board, Long> {
    
    // 제목으로 검색
    Page<Board> findByTitleContaining(String title, Pageable pageable);
    
    // 작성자로 검색
    Page<Board> findByAuthor(String author, Pageable pageable);
    
    // 제목 또는 내용으로 검색
    @Query("SELECT b FROM Board b WHERE b.title LIKE %:keyword% OR b.content LIKE %:keyword%")
    Page<Board> searchByKeyword(@Param("keyword") String keyword, Pageable pageable);
    
    // 최신순 정렬
    List<Board> findTop10ByOrderByCreatedAtDesc();
}
