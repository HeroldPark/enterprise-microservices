package com.enterprise.board.dto;

import com.enterprise.board.entity.Board;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

public class BoardDto {
    
    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CreateRequest {
        @NotBlank(message = "제목은 필수입니다")
        @Size(max = 200, message = "제목은 200자를 초과할 수 없습니다")
        private String title;
        
        @NotBlank(message = "내용은 필수입니다")
        private String content;
        
        @NotBlank(message = "작성자는 필수입니다")
        @Size(max = 50, message = "작성자명은 50자를 초과할 수 없습니다")
        private String author;
        
        public Board toEntity() {
            return Board.builder()
                    .title(title)
                    .content(content)
                    .author(author)
                    .viewCount(0)
                    .build();
        }
    }
    
    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class UpdateRequest {
        @NotBlank(message = "제목은 필수입니다")
        @Size(max = 200, message = "제목은 200자를 초과할 수 없습니다")
        private String title;
        
        @NotBlank(message = "내용은 필수입니다")
        private String content;
    }
    
    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Response {
        private Long id;
        private String title;
        private String content;
        private String author;
        private Integer viewCount;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
        private Integer commentCount;
        private Integer attachmentCount;
        
        public static Response from(Board board) {
            return Response.builder()
                    .id(board.getId())
                    .title(board.getTitle())
                    .content(board.getContent())
                    .author(board.getAuthor())
                    .viewCount(board.getViewCount())
                    .createdAt(board.getCreatedAt())
                    .updatedAt(board.getUpdatedAt())
                    .commentCount(board.getComments().size())
                    .attachmentCount(board.getAttachments().size())
                    .build();
        }
    }
    
    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class DetailResponse {
        private Long id;
        private String title;
        private String content;
        private String author;
        private Integer viewCount;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
        private List<CommentDto.Response> comments;
        private List<AttachmentDto.Response> attachments;
        
        public static DetailResponse from(Board board) {
            return DetailResponse.builder()
                    .id(board.getId())
                    .title(board.getTitle())
                    .content(board.getContent())
                    .author(board.getAuthor())
                    .viewCount(board.getViewCount())
                    .createdAt(board.getCreatedAt())
                    .updatedAt(board.getUpdatedAt())
                    .comments(board.getComments().stream()
                            .map(CommentDto.Response::from)
                            .collect(Collectors.toList()))
                    .attachments(board.getAttachments().stream()
                            .map(AttachmentDto.Response::from)
                            .collect(Collectors.toList()))
                    .build();
        }
    }
}
