package com.enterprise.board.repository;

import com.enterprise.board.entity.Comment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommentRepository extends JpaRepository<Comment, Long> {
    
    // 게시글 ID로 댓글 조회
    List<Comment> findByBoardId(Long boardId);
    
    // 작성자로 댓글 조회
    List<Comment> findByAuthor(String author);
}
