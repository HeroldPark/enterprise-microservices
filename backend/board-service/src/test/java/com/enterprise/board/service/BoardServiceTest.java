package com.enterprise.board.service;

import com.enterprise.board.dto.BoardDto;
import com.enterprise.board.entity.Board;
import com.enterprise.board.exception.ResourceNotFoundException;
import com.enterprise.board.repository.BoardRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class BoardServiceTest {
    
    @Mock
    private BoardRepository boardRepository;
    
    @InjectMocks
    private BoardService boardService;
    
    private Board testBoard;
    private BoardDto.CreateRequest createRequest;
    
    @BeforeEach
    void setUp() {
        testBoard = Board.builder()
                .id(1L)
                .title("Test Title")
                .content("Test Content")
                .author("Test Author")
                .viewCount(0)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .comments(new ArrayList<>())
                .attachments(new ArrayList<>())
                .build();
        
        createRequest = BoardDto.CreateRequest.builder()
                .title("Test Title")
                .content("Test Content")
                .author("Test Author")
                .build();
    }
    
    @Test
    void createBoard_Success() {
        when(boardRepository.save(any(Board.class))).thenReturn(testBoard);
        
        BoardDto.Response response = boardService.createBoard(createRequest);
        
        assertNotNull(response);
        assertEquals("Test Title", response.getTitle());
        assertEquals("Test Content", response.getContent());
        assertEquals("Test Author", response.getAuthor());
        verify(boardRepository, times(1)).save(any(Board.class));
    }
    
    @Test
    void getAllBoards_Success() {
        Pageable pageable = PageRequest.of(0, 10);
        Page<Board> boardPage = new PageImpl<>(Arrays.asList(testBoard));
        when(boardRepository.findAll(pageable)).thenReturn(boardPage);
        
        Page<BoardDto.Response> result = boardService.getAllBoards(pageable);
        
        assertNotNull(result);
        assertEquals(1, result.getTotalElements());
        verify(boardRepository, times(1)).findAll(pageable);
    }
    
    @Test
    void getBoard_Success() {
        when(boardRepository.findById(1L)).thenReturn(Optional.of(testBoard));
        
        BoardDto.DetailResponse response = boardService.getBoard(1L);
        
        assertNotNull(response);
        assertEquals("Test Title", response.getTitle());
        assertEquals(1, testBoard.getViewCount());
        verify(boardRepository, times(1)).findById(1L);
    }
    
    @Test
    void getBoard_NotFound() {
        when(boardRepository.findById(1L)).thenReturn(Optional.empty());
        
        assertThrows(ResourceNotFoundException.class, () -> {
            boardService.getBoard(1L);
        });
        verify(boardRepository, times(1)).findById(1L);
    }
    
    @Test
    void updateBoard_Success() {
        BoardDto.UpdateRequest updateRequest = BoardDto.UpdateRequest.builder()
                .title("Updated Title")
                .content("Updated Content")
                .build();
        
        when(boardRepository.findById(1L)).thenReturn(Optional.of(testBoard));
        
        BoardDto.Response response = boardService.updateBoard(1L, updateRequest);
        
        assertNotNull(response);
        assertEquals("Updated Title", testBoard.getTitle());
        assertEquals("Updated Content", testBoard.getContent());
        verify(boardRepository, times(1)).findById(1L);
    }
    
    @Test
    void deleteBoard_Success() {
        when(boardRepository.findById(1L)).thenReturn(Optional.of(testBoard));
        
        boardService.deleteBoard(1L);
        
        verify(boardRepository, times(1)).findById(1L);
        verify(boardRepository, times(1)).delete(testBoard);
    }
}
