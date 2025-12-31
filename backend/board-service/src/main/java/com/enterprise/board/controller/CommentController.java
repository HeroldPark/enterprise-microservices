package com.enterprise.board.controller;

import com.enterprise.board.dto.CommentDto;
import com.enterprise.board.service.CommentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/boards/{boardId}/comments")
@RequiredArgsConstructor
public class CommentController {
    
    private final CommentService commentService;
    
    @PostMapping
    public ResponseEntity<CommentDto.Response> createComment(
            @PathVariable Long boardId,
            @Valid @RequestBody CommentDto.CreateRequest request) {
        CommentDto.Response response = commentService.createComment(boardId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
    
    @GetMapping
    public ResponseEntity<List<CommentDto.Response>> getCommentsByBoardId(@PathVariable Long boardId) {
        List<CommentDto.Response> comments = commentService.getCommentsByBoardId(boardId);
        return ResponseEntity.ok(comments);
    }
    
    @PutMapping("/{commentId}")
    public ResponseEntity<CommentDto.Response> updateComment(
            @PathVariable Long boardId,
            @PathVariable Long commentId,
            @Valid @RequestBody CommentDto.UpdateRequest request) {
        CommentDto.Response response = commentService.updateComment(commentId, request);
        return ResponseEntity.ok(response);
    }
    
    @DeleteMapping("/{commentId}")
    public ResponseEntity<Void> deleteComment(
            @PathVariable Long boardId,
            @PathVariable Long commentId) {
        commentService.deleteComment(commentId);
        return ResponseEntity.noContent().build();
    }
}
