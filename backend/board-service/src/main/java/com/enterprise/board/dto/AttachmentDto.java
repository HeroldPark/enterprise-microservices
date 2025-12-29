package com.enterprise.board.dto;

import com.enterprise.board.entity.Attachment;
import lombok.*;

import java.time.LocalDateTime;

public class AttachmentDto {
    
    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Response {
        private Long id;
        private String originalFileName;
        private String storedFileName;
        private Long fileSize;
        private String contentType;
        private LocalDateTime uploadedAt;
        
        public static Response from(Attachment attachment) {
            return Response.builder()
                    .id(attachment.getId())
                    .originalFileName(attachment.getOriginalFileName())
                    .storedFileName(attachment.getStoredFileName())
                    .fileSize(attachment.getFileSize())
                    .contentType(attachment.getContentType())
                    .uploadedAt(attachment.getUploadedAt())
                    .build();
        }
    }
}
