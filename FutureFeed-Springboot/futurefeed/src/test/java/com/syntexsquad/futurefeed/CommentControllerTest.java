package com.syntexsquad.futurefeed;

import com.syntexsquad.futurefeed.Controller.CommentController;
import com.syntexsquad.futurefeed.model.AppUser;
import com.syntexsquad.futurefeed.model.Comment;
import com.syntexsquad.futurefeed.service.CommentService;
import com.syntexsquad.futurefeed.repository.AppUserRepository;
import com.syntexsquad.futurefeed.repository.PostRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(controllers = CommentController.class)
@Import(CommentControllerTest.TestSecurityConfig.class)
public class CommentControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private CommentService commentService;

    @MockBean
    private AppUserRepository appUserRepository;

    @MockBean
    private PostRepository postRepository;

    private final Integer postId = 1;
    private final String userEmail = "user@example.com";

    // Mock an OAuth2 authenticated user with email attribute
    private SecurityMockMvcRequestPostProcessors.OAuth2LoginRequestPostProcessor oauthUser() {
        return SecurityMockMvcRequestPostProcessors.oauth2Login()
                .attributes(attrs -> attrs.put("email", userEmail));
    }

    @Test
    void testAddComment_shouldReturnSavedComment() throws Exception {
        Comment savedComment = new Comment();
        savedComment.setId(42);
        savedComment.setContent("Hello comment");
        savedComment.setPostId(postId);
        savedComment.setUserId(99);

        // Mock service call
        when(commentService.addComment(postId, "Hello comment")).thenReturn(savedComment);

        mockMvc.perform(post("/api/comments/{postId}", postId)
                        .content("Hello comment")
                        .contentType(MediaType.TEXT_PLAIN)
                        .with(oauthUser()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(42))
                .andExpect(jsonPath("$.content").value("Hello comment"));
    }

    @Test
    void testAddComment_shouldReturnBadRequest_whenContentEmpty() throws Exception {
        mockMvc.perform(post("/api/comments/{postId}", postId)
                        .content("   ")  // empty after trim
                        .contentType(MediaType.TEXT_PLAIN)
                        .with(oauthUser()))
                .andExpect(status().isBadRequest())
                .andExpect(content().string("Content cannot be empty"));
    }

    @Test
    void testGetCommentsByPost_shouldReturnList() throws Exception {
        Comment comment = new Comment();
        comment.setId(7);
        comment.setContent("comment 7");

        when(commentService.getCommentsForPost(postId)).thenReturn(List.of(comment));

        // No authentication needed, GET is public
        mockMvc.perform(get("/api/comments/post/{postId}", postId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(7))
                .andExpect(jsonPath("$[0].content").value("comment 7"));
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
        SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
            http
                .csrf(csrf -> csrf.ignoringRequestMatchers("/api/**"))
                .authorizeHttpRequests(auth -> auth
                    .requestMatchers("/api/comments/post/**").permitAll()
                    .anyRequest().authenticated()
                )
                .oauth2Login();

            return http.build();
        }
    }
}
