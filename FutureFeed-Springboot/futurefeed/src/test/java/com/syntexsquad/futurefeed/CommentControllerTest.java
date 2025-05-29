package com.syntexsquad.futurefeed;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.syntexsquad.futurefeed.Controller.CommentController;
import com.syntexsquad.futurefeed.dto.CommentRequest;
import com.syntexsquad.futurefeed.model.Comment;
import com.syntexsquad.futurefeed.service.CommentService;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(controllers = CommentController.class)
@Import(CommentControllerTest.TestSecurityConfig.class)
public class CommentControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private CommentService commentService;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void testAddComment_shouldReturnSavedComment() throws Exception {
        CommentRequest request = new CommentRequest();
        request.setPostId(1);
        request.setUserId(2);
        request.setContent("Nice post!");

        Comment comment = new Comment();
        comment.setId(1);
        comment.setPostId(1);
        comment.setUserId(2);
        comment.setContent("Nice post!");
        comment.setCreatedAt(LocalDateTime.now());

        Mockito.when(commentService.addComment(any(CommentRequest.class))).thenReturn(comment);

        mockMvc.perform(post("/api/comments")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(comment.getId()))
                .andExpect(jsonPath("$.postId").value(comment.getPostId()))
                .andExpect(jsonPath("$.userId").value(comment.getUserId()))
                .andExpect(jsonPath("$.content").value(comment.getContent()));
    }

    @Test
    void testAddComment_shouldReturnBadRequest_whenContentMissing() throws Exception {
        CommentRequest request = new CommentRequest();
        request.setPostId(1);
        request.setUserId(2);
        request.setContent(""); // Empty content

        mockMvc.perform(post("/api/comments")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void testAddComment_shouldReturnBadRequest_onMalformedJson() throws Exception {
        String malformedJson = "{ \"userId\": 1, \"postId\": 2, \"content\": "; // Incomplete JSON

        mockMvc.perform(post("/api/comments")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(malformedJson))
                .andExpect(status().isBadRequest());
    }

    @Test
    void testGetCommentsForPost_shouldReturnCommentList() throws Exception {
        Comment comment1 = new Comment();
        comment1.setId(1);
        comment1.setPostId(1);
        comment1.setUserId(2);
        comment1.setContent("Comment 1");
        comment1.setCreatedAt(LocalDateTime.now());

        Comment comment2 = new Comment();
        comment2.setId(2);
        comment2.setPostId(1);
        comment2.setUserId(3);
        comment2.setContent("Comment 2");
        comment2.setCreatedAt(LocalDateTime.now());

        List<Comment> comments = Arrays.asList(comment1, comment2);

        Mockito.when(commentService.getCommentsForPost(1)).thenReturn(comments);

        mockMvc.perform(get("/api/comments/post/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2));
    }

    @Test
    void testGetCommentsForPost_shouldReturnEmptyList() throws Exception {
        Mockito.when(commentService.getCommentsForPost(999)).thenReturn(Collections.emptyList());

        mockMvc.perform(get("/api/comments/post/999"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(0));
    }

    @TestConfiguration
    static class TestSecurityConfig {
        @Bean
        public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
            http.csrf().disable().authorizeHttpRequests(auth -> auth.anyRequest().permitAll());
            return http.build();
        }
    }
}
