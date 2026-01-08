package com.enterprise.board.service;

import com.enterprise.board.dto.BoardDto;
import com.enterprise.board.entity.Attachment;
import com.enterprise.board.entity.Board;
import com.enterprise.board.exception.ResourceNotFoundException;
import com.enterprise.board.repository.AttachmentRepository;
import com.enterprise.board.repository.BoardRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class BoardService {
    
    private final BoardRepository boardRepository;
    private final AttachmentRepository attachmentRepository;
    private final FileStorageService fileStorageService;
    
    /**
     * 게시판 통계 조회
     */
    public Map<String, Object> getBoardStats() {
        log.info("📊 게시판 통계 조회 시작");
        
        // 전체 게시글 조회
        List<Board> allBoards = boardRepository.findAll();
        
        // 전체 게시글 수
        long totalBoards = allBoards.size();
        
        // 오늘 작성된 게시글 수
        LocalDateTime todayStart = LocalDateTime.now().withHour(0).withMinute(0).withSecond(0).withNano(0);
        long todayBoards = allBoards.stream()
            .filter(board -> board.getCreatedAt() != null && board.getCreatedAt().isAfter(todayStart))
            .count();
        
        // 이번 주 작성된 게시글 수
        LocalDateTime weekStart = LocalDateTime.now().minusDays(7);
        long weekBoards = allBoards.stream()
            .filter(board -> board.getCreatedAt() != null && board.getCreatedAt().isAfter(weekStart))
            .count();
        
        // 이번 달 작성된 게시글 수
        LocalDateTime monthStart = LocalDateTime.now().withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0).withNano(0);
        long monthBoards = allBoards.stream()
            .filter(board -> board.getCreatedAt() != null && board.getCreatedAt().isAfter(monthStart))
            .count();
        
        // 작성자별 게시글 수 (상위 10명)
        Map<String, Long> boardsByAuthor = allBoards.stream()
            .filter(board -> board.getAuthor() != null)
            .collect(Collectors.groupingBy(Board::getAuthor, Collectors.counting()))
            .entrySet().stream()
            .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
            .limit(10)
            .collect(Collectors.toMap(
                Map.Entry::getKey,
                Map.Entry::getValue,
                (e1, e2) -> e1,
                LinkedHashMap::new
            ));
        
        // 최근 게시글 (최근 5개)
        List<Map<String, Object>> recentBoards = allBoards.stream()
            .filter(board -> board.getCreatedAt() != null)
            .sorted((b1, b2) -> b2.getCreatedAt().compareTo(b1.getCreatedAt()))
            .limit(5)
            .map(board -> {
                Map<String, Object> boardInfo = new HashMap<>();
                boardInfo.put("id", board.getId());
                boardInfo.put("title", board.getTitle());
                boardInfo.put("author", board.getAuthor());
                boardInfo.put("createdAt", board.getCreatedAt().toString());
                return boardInfo;
            })
            .collect(Collectors.toList());
        
        // 첨부파일이 있는 게시글 수
        long boardsWithAttachments = allBoards.stream()
            .filter(board -> board.getAttachments() != null && !board.getAttachments().isEmpty())
            .count();
        
        // 통계 결과 반환
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalBoards", totalBoards);
        stats.put("todayBoards", todayBoards);
        stats.put("weekBoards", weekBoards);
        stats.put("monthBoards", monthBoards);
        stats.put("boardsWithAttachments", boardsWithAttachments);
        stats.put("boardsByAuthor", boardsByAuthor);
        stats.put("recentBoards", recentBoards);
        
        log.info("✅ 게시판 통계 조회 완료 - 전체: {}, 오늘: {}, 이번주: {}, 이번달: {}", 
            totalBoards, todayBoards, weekBoards, monthBoards);
        
        return stats;
    }

    @Transactional
    public BoardDto.Response createBoard(BoardDto.CreateRequest request) {
        Board board = request.toEntity();
        Board savedBoard = boardRepository.save(board);
        return BoardDto.Response.from(savedBoard);
    }
    
    @Transactional
    public BoardDto.Response createBoardWithFiles(BoardDto.CreateRequest request, List<MultipartFile> files) {
        Board board = request.toEntity();
        Board savedBoard = boardRepository.save(board);
        
        if (files != null && !files.isEmpty()) {
            for (MultipartFile file : files) {
                if (!file.isEmpty()) {
                    String storedFileName = fileStorageService.storeFile(file);
                    
                    Attachment attachment = Attachment.builder()
                            .originalFileName(file.getOriginalFilename())
                            .storedFileName(storedFileName)
                            .filePath(fileStorageService.getFileStorageLocation().toString())
                            .fileSize(file.getSize())
                            .contentType(file.getContentType())
                            .board(savedBoard)
                            .build();
                    
                    attachmentRepository.save(attachment);
                }
            }
        }
        
        return BoardDto.Response.from(savedBoard);
    }
    
    public Page<BoardDto.Response> getAllBoards(Pageable pageable) {
        Page<Board> boards = boardRepository.findAll(pageable);
        return boards.map(BoardDto.Response::from);
    }
    
    @Transactional
    public BoardDto.DetailResponse getBoard(Long id) {
        Board board = boardRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("게시글을 찾을 수 없습니다. ID: " + id));
        
        board.incrementViewCount();
        return BoardDto.DetailResponse.from(board);
    }
    
    @Transactional
    public BoardDto.Response updateBoard(Long id, BoardDto.UpdateRequest request) {
        Board board = boardRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("게시글을 찾을 수 없습니다. ID: " + id));
        
        board.setTitle(request.getTitle());
        board.setContent(request.getContent());
        
        return BoardDto.Response.from(board);
    }
    
    @Transactional
    public BoardDto.Response updateBoardWithFiles(Long id, BoardDto.UpdateRequest request, List<MultipartFile> files) {
        Board board = boardRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("게시글을 찾을 수 없습니다. ID: " + id));
        
        board.setTitle(request.getTitle());
        board.setContent(request.getContent());
        
        // 새로운 파일 추가
        if (files != null && !files.isEmpty()) {
            for (MultipartFile file : files) {
                if (!file.isEmpty()) {
                    String storedFileName = fileStorageService.storeFile(file);
                    
                    Attachment attachment = Attachment.builder()
                            .originalFileName(file.getOriginalFilename())
                            .storedFileName(storedFileName)
                            .filePath(fileStorageService.getFileStorageLocation().toString())
                            .fileSize(file.getSize())
                            .contentType(file.getContentType())
                            .board(board)
                            .build();
                    
                    attachmentRepository.save(attachment);
                }
            }
        }
        
        return BoardDto.Response.from(board);
    }
    
    @Transactional
    public void deleteBoard(Long id) {
        Board board = boardRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("게시글을 찾을 수 없습니다. ID: " + id));
        
        for (Attachment attachment : board.getAttachments()) {
            fileStorageService.deleteFile(attachment.getStoredFileName());
        }
        
        boardRepository.delete(board);
    }
    
    public Page<BoardDto.Response> searchByTitle(String title, Pageable pageable) {
        Page<Board> boards = boardRepository.findByTitleContaining(title, pageable);
        return boards.map(BoardDto.Response::from);
    }
    
    public Page<BoardDto.Response> searchByKeyword(String keyword, Pageable pageable) {
        Page<Board> boards = boardRepository.searchByKeyword(keyword, pageable);
        return boards.map(BoardDto.Response::from);
    }
    
    public Page<BoardDto.Response> searchByAuthor(String author, Pageable pageable) {
        Page<Board> boards = boardRepository.findByAuthor(author, pageable);
        return boards.map(BoardDto.Response::from);
    }
}
