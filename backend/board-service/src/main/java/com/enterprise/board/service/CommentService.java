package com.enterprise.board.service;

import com.enterprise.board.dto.CommentDto;
import com.enterprise.board.entity.Board;
import com.enterprise.board.entity.Comment;
import com.enterprise.board.exception.ResourceNotFoundException;
import com.enterprise.board.repository.BoardRepository;
import com.enterprise.board.repository.CommentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CommentService {
    
    private final CommentRepository commentRepository;
    private final BoardRepository boardRepository;
    
    @Transactional
    public CommentDto.Response createComment(Long boardId, CommentDto.CreateRequest request) {
        Board board = boardRepository.findById(boardId)
                .orElseThrow(() -> new ResourceNotFoundException("게시글을 찾을 수 없습니다. ID: " + boardId));
        
        Comment comment = Comment.builder()
                .content(request.getContent())
                .author(request.getAuthor())
                .board(board)
                .build();
        
        Comment savedComment = commentRepository.save(comment);
        return CommentDto.Response.from(savedComment);
    }
    
    public List<CommentDto.Response> getCommentsByBoardId(Long boardId) {
        List<Comment> comments = commentRepository.findByBoardId(boardId);
        return comments.stream()
                .map(CommentDto.Response::from)
                .collect(Collectors.toList());
    }
    
    @Transactional
    public CommentDto.Response updateComment(Long commentId, CommentDto.UpdateRequest request) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new ResourceNotFoundException("댓글을 찾을 수 없습니다. ID: " + commentId));
        
        comment.setContent(request.getContent());
        return CommentDto.Response.from(comment);
    }
    
    @Transactional
    public void deleteComment(Long commentId) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new ResourceNotFoundException("댓글을 찾을 수 없습니다. ID: " + commentId));
        
        commentRepository.delete(comment);
    }
}
