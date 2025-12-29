package com.enterprise.board.controller;

import com.enterprise.board.dto.AttachmentDto;
import com.enterprise.board.entity.Attachment;
import com.enterprise.board.service.AttachmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.UnsupportedEncodingException;
import java.net.URLEncoder;
import java.util.List;

@RestController
@RequestMapping("/api/boards/{boardId}/attachments")
@RequiredArgsConstructor
public class AttachmentController {
    
    private final AttachmentService attachmentService;
    
    @GetMapping
    public ResponseEntity<List<AttachmentDto.Response>> getAttachmentsByBoardId(@PathVariable Long boardId) {
        List<AttachmentDto.Response> attachments = attachmentService.getAttachmentsByBoardId(boardId);
        return ResponseEntity.ok(attachments);
    }
    
    @GetMapping("/{attachmentId}/download")
    public ResponseEntity<Resource> downloadAttachment(
            @PathVariable Long boardId,
            @PathVariable Long attachmentId) throws UnsupportedEncodingException {
        
        Resource resource = attachmentService.downloadAttachment(attachmentId);
        Attachment attachment = attachmentService.getAttachment(attachmentId);
        
        String encodedFileName = URLEncoder.encode(attachment.getOriginalFileName(), "UTF-8")
                .replaceAll("\\+", "%20");
        
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(attachment.getContentType()))
                .header(HttpHeaders.CONTENT_DISPOSITION, 
                        "attachment; filename=\"" + encodedFileName + "\"")
                .body(resource);
    }
    
    @DeleteMapping("/{attachmentId}")
    public ResponseEntity<Void> deleteAttachment(
            @PathVariable Long boardId,
            @PathVariable Long attachmentId) {
        attachmentService.deleteAttachment(attachmentId);
        return ResponseEntity.noContent().build();
    }
}
