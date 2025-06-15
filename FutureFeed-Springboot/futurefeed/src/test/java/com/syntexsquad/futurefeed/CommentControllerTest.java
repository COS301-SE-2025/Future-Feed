package com.syntexsquad.futurefeed;

import com.syntexsquad.futurefeed.Controller.CommentController;
import com.syntexsquad.futurefeed.model.Comment;
import com.syntexsquad.futurefeed.service.AppUserService;
import com.syntexsquad.futurefeed.service.CommentService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Collections;
import java.util.List;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(controllers = CommentController.class)
@Import(CommentControllerTest.TestSecurityConfig.class)
public class CommentControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private CommentService commentService;

    @MockBean
    private AppUserService appUserService;

    private final String mockEmail = "user@example.com";
    private final Integer postId = 123;

    private SecurityMockMvcRequestPostProcessors.OAuth2LoginRequestPostProcessor oauthUser() {
        return SecurityMockMvcRequestPostProcessors.oauth2Login()
                .attributes(attrs -> attrs.put("email", mockEmail));
    }

    @Test
    void testAddComment_shouldReturnSavedComment() throws Exception {
        Comment savedComment = new Comment();
        savedComment.setId(1);
        savedComment.setContent("Test comment");

        when(commentService.addComment(postId, "Test comment")).thenReturn(savedComment);

        mockMvc.perform(post("/api/comments/{postId}", postId)
                        .content("Test comment")
                        .contentType(MediaType.TEXT_PLAIN)
                        .with(oauthUser()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.content").value("Test comment"));
    }

    @Test
    void testAddComment_shouldReturnBadRequest_whenContentEmpty() throws Exception {
        mockMvc.perform(post("/api/comments/{postId}", postId)
                        .content("")
                        .contentType(MediaType.TEXT_PLAIN)
                        .with(oauthUser()))
                .andExpect(status().isBadRequest())
                .andExpect(content().string("Content cannot be empty"));
    }

    @Test
    void testGetCommentsByPost_shouldReturnList() throws Exception {
        Comment comment = new Comment();
        comment.setId(1);
        comment.setContent("comment1");

        when(commentService.getCommentsForPost(postId)).thenReturn(List.of(comment));

        mockMvc.perform(get("/api/comments/post/{postId}", postId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(1))
                .andExpect(jsonPath("$[0].content").value("comment1"));
    }

    @Test
    void testGetCommentsByPost_shouldReturnEmptyList() throws Exception {
        when(commentService.getCommentsForPost(postId)).thenReturn(Collections.emptyList());

        mockMvc.perform(get("/api/comments/post/{postId}", postId))
                .andExpect(status().isOk())
                .andExpect(content().string("[]"));
    }

@TestConfiguration
static class TestSecurityConfig {
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf().disable()
            .authorizeHttpRequests(auth -> auth.anyRequest().permitAll())
            .oauth2Login().disable()
            .formLogin().disable()
            .httpBasic().disable();
        return http.build();
    }
}
}
