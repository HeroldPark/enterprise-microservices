package com.enterprise.board.controller;

import com.enterprise.board.dto.BoardDto;
import com.enterprise.board.service.BoardService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/boards")
@RequiredArgsConstructor
public class BoardController {
    
    private final BoardService boardService;
    
    @PostMapping
    public ResponseEntity<BoardDto.Response> createBoard(@Valid @RequestBody BoardDto.CreateRequest request) {
        BoardDto.Response response = boardService.createBoard(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
    
    @PostMapping("/with-files")
    public ResponseEntity<BoardDto.Response> createBoardWithFiles(
            @Valid @RequestPart("board") BoardDto.CreateRequest request,
            @RequestPart(value = "files", required = false) List<MultipartFile> files) {
        BoardDto.Response response = boardService.createBoardWithFiles(request, files);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
    
    @GetMapping
    public ResponseEntity<Page<BoardDto.Response>> getAllBoards(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "DESC") String direction) {

        log.debug("getAllBoards 시작");
        
        Sort.Direction sortDirection = direction.equalsIgnoreCase("ASC") ? 
                Sort.Direction.ASC : Sort.Direction.DESC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(sortDirection, sortBy));
        
        Page<BoardDto.Response> boards = boardService.getAllBoards(pageable);
        return ResponseEntity.ok(boards);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<BoardDto.DetailResponse> getBoard(@PathVariable Long id) {

        log.debug("getBoard 시작");

        BoardDto.DetailResponse response = boardService.getBoard(id);
        return ResponseEntity.ok(response);
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<BoardDto.Response> updateBoard(
            @PathVariable Long id,
            @Valid @RequestBody BoardDto.UpdateRequest request) {
        BoardDto.Response response = boardService.updateBoard(id, request);
        return ResponseEntity.ok(response);
    }
    
    @PutMapping("/{id}/with-files")
    public ResponseEntity<BoardDto.Response> updateBoardWithFiles(
            @PathVariable Long id,
            @Valid @RequestPart("board") BoardDto.UpdateRequest request,
            @RequestPart(value = "files", required = false) List<MultipartFile> files) {
        BoardDto.Response response = boardService.updateBoardWithFiles(id, request, files);
        return ResponseEntity.ok(response);
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBoard(@PathVariable Long id) {
        boardService.deleteBoard(id);
        return ResponseEntity.noContent().build();
    }
    
    @GetMapping("/search/title")
    public ResponseEntity<Page<BoardDto.Response>> searchByTitle(
            @RequestParam String title,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<BoardDto.Response> boards = boardService.searchByTitle(title, pageable);
        return ResponseEntity.ok(boards);
    }
    
    @GetMapping("/search")
    public ResponseEntity<Page<BoardDto.Response>> searchByKeyword(
            @RequestParam String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<BoardDto.Response> boards = boardService.searchByKeyword(keyword, pageable);
        return ResponseEntity.ok(boards);
    }
    
    @GetMapping("/search/author")
    public ResponseEntity<Page<BoardDto.Response>> searchByAuthor(
            @RequestParam String author,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<BoardDto.Response> boards = boardService.searchByAuthor(author, pageable);
        return ResponseEntity.ok(boards);
    }
}
