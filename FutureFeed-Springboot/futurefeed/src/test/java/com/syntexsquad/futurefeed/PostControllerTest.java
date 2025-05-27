package com.syntexsquad.futurefeed;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.syntexsquad.futurefeed.Controller.PostController;
import com.syntexsquad.futurefeed.dto.PostRequest;
import com.syntexsquad.futurefeed.model.Post;
import com.syntexsquad.futurefeed.service.PostService;
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

import static org.mockito.ArgumentMatchers.any;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(controllers = PostController.class)
@Import(PostControllerTest.TestSecurityConfig.class)
public class PostControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private PostService postService;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void testCreatePost_shouldReturnCreatedPost() throws Exception {
        PostRequest postRequest = new PostRequest();
        postRequest.setUserId(1);
        postRequest.setContent("Valid content");
        postRequest.setImageUrl("https://example.com/image.jpg");
        postRequest.setIsBot(false);

        Post post = new Post();
        post.setId(1);
        post.setUserId(postRequest.getUserId());
        post.setContent(postRequest.getContent());
        post.setImageUrl(postRequest.getImageUrl());
        post.setIsBot(false);
        post.setCreatedAt(LocalDateTime.now());

        Mockito.when(postService.createPost(any(PostRequest.class))).thenReturn(post);

        mockMvc.perform(post("/api/posts")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(postRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(post.getId()))
                .andExpect(jsonPath("$.userId").value(post.getUserId()))
                .andExpect(jsonPath("$.content").value(post.getContent()))
                .andExpect(jsonPath("$.imageUrl").value(post.getImageUrl()))
                .andExpect(jsonPath("$.isBot").value(post.getIsBot()));
    }

    @Test
    void testCreatePost_missingContent_shouldReturnBadRequest() throws Exception {
        PostRequest postRequest = new PostRequest();
        postRequest.setUserId(1);
        postRequest.setContent(""); // invalid
        postRequest.setImageUrl("https://example.com/image.jpg");
        postRequest.setIsBot(false);

        mockMvc.perform(post("/api/posts")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(postRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(content().string("Content must not be null or empty"));
    }

    @Test
    void testCreatePost_serviceThrowsException_shouldReturnServerError() throws Exception {
        PostRequest postRequest = new PostRequest();
        postRequest.setUserId(1);
        postRequest.setContent("Error trigger");
        postRequest.setImageUrl("https://example.com/image.jpg");
        postRequest.setIsBot(false);

        Mockito.when(postService.createPost(any(PostRequest.class)))
                .thenThrow(new RuntimeException("Unexpected failure"));

        mockMvc.perform(post("/api/posts")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(postRequest)))
                .andExpect(status().isInternalServerError())
                .andExpect(content().string("Server error: Unexpected failure"));
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
