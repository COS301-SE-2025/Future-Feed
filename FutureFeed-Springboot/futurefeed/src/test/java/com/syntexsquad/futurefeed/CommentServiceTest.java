package com.syntexsquad.futurefeed;

import com.syntexsquad.futurefeed.dto.CommentRequest;
import com.syntexsquad.futurefeed.model.Comment;
import com.syntexsquad.futurefeed.repository.CommentRepository;
import com.syntexsquad.futurefeed.service.CommentService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

public class CommentServiceTest {

    private CommentRepository commentRepository;
    private CommentService commentService;

    @BeforeEach
    void setUp() {
        commentRepository = mock(CommentRepository.class);
        commentService = new CommentService(commentRepository);
    }

    @Test
    void testAddComment_shouldReturnSavedComment() {
        CommentRequest request = new CommentRequest();
        request.setPostId(1);
        request.setUserId(2);
        request.setContent("This is a test comment");

        Comment saved = new Comment();
        saved.setId(1);
        saved.setPostId(request.getPostId());
        saved.setUserId(request.getUserId());
        saved.setContent(request.getContent());
        saved.setCreatedAt(LocalDateTime.now());

        when(commentRepository.save(any(Comment.class))).thenReturn(saved);

        Comment result = commentService.addComment(request);

        assertNotNull(result);
        assertEquals(saved.getPostId(), result.getPostId());
        assertEquals(saved.getUserId(), result.getUserId());
        assertEquals(saved.getContent(), result.getContent());
        verify(commentRepository, times(1)).save(any(Comment.class));
    }

    @Test
    void testGetCommentsForPost_shouldReturnListOfComments() {
        Comment comment1 = new Comment();
        comment1.setId(1);
        comment1.setPostId(1);
        comment1.setUserId(2);
        comment1.setContent("First");

        Comment comment2 = new Comment();
        comment2.setId(2);
        comment2.setPostId(1);
        comment2.setUserId(3);
        comment2.setContent("Second");

        when(commentRepository.findByPostId(1)).thenReturn(Arrays.asList(comment1, comment2));

        List<Comment> comments = commentService.getCommentsForPost(1);

        assertEquals(2, comments.size());
        assertEquals("First", comments.get(0).getContent());
        assertEquals("Second", comments.get(1).getContent());
    }

    @Test
    void testGetCommentsForPost_shouldReturnEmptyList() {
        when(commentRepository.findByPostId(999)).thenReturn(Collections.emptyList());

        List<Comment> comments = commentService.getCommentsForPost(999);

        assertNotNull(comments);
        assertTrue(comments.isEmpty());
    }
}
