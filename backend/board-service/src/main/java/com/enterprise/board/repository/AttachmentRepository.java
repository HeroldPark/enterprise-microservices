package com.enterprise.board.repository;

import com.enterprise.board.entity.Attachment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AttachmentRepository extends JpaRepository<Attachment, Long> {
    
    // 게시글 ID로 첨부파일 조회
    List<Attachment> findByBoardId(Long boardId);
    
    // 저장된 파일명으로 조회
    Attachment findByStoredFileName(String storedFileName);
}
