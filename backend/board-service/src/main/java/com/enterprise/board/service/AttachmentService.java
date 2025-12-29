package com.enterprise.board.service;

import com.enterprise.board.dto.AttachmentDto;
import com.enterprise.board.entity.Attachment;
import com.enterprise.board.exception.ResourceNotFoundException;
import com.enterprise.board.repository.AttachmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AttachmentService {
    
    private final AttachmentRepository attachmentRepository;
    private final FileStorageService fileStorageService;
    
    public List<AttachmentDto.Response> getAttachmentsByBoardId(Long boardId) {
        List<Attachment> attachments = attachmentRepository.findByBoardId(boardId);
        return attachments.stream()
                .map(AttachmentDto.Response::from)
                .collect(Collectors.toList());
    }
    
    public Resource downloadAttachment(Long attachmentId) {
        Attachment attachment = attachmentRepository.findById(attachmentId)
                .orElseThrow(() -> new ResourceNotFoundException("첨부파일을 찾을 수 없습니다. ID: " + attachmentId));
        
        return fileStorageService.loadFileAsResource(attachment.getStoredFileName());
    }
    
    public Attachment getAttachment(Long attachmentId) {
        return attachmentRepository.findById(attachmentId)
                .orElseThrow(() -> new ResourceNotFoundException("첨부파일을 찾을 수 없습니다. ID: " + attachmentId));
    }
    
    @Transactional
    public void deleteAttachment(Long attachmentId) {
        Attachment attachment = attachmentRepository.findById(attachmentId)
                .orElseThrow(() -> new ResourceNotFoundException("첨부파일을 찾을 수 없습니다. ID: " + attachmentId));
        
        fileStorageService.deleteFile(attachment.getStoredFileName());
        attachmentRepository.delete(attachment);
    }
}
