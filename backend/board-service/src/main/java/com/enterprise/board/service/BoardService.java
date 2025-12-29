package com.enterprise.board.service;

import com.enterprise.board.dto.BoardDto;
import com.enterprise.board.entity.Attachment;
import com.enterprise.board.entity.Board;
import com.enterprise.board.exception.ResourceNotFoundException;
import com.enterprise.board.repository.AttachmentRepository;
import com.enterprise.board.repository.BoardRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class BoardService {
    
    private final BoardRepository boardRepository;
    private final AttachmentRepository attachmentRepository;
    private final FileStorageService fileStorageService;
    
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
