package com.syntexsquad.futurefeed;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.syntexsquad.futurefeed.Controller.PostController;
import com.syntexsquad.futurefeed.dto.PostRequest;
import com.syntexsquad.futurefeed.mapper.PostViewMapper;
import com.syntexsquad.futurefeed.model.Post;
import com.syntexsquad.futurefeed.model.UserPost;
import com.syntexsquad.futurefeed.repository.BotPostRepository; 
import com.syntexsquad.futurefeed.service.MediaService;
import com.syntexsquad.futurefeed.service.PostService;
import org.junit.jupiter.api.BeforeEach; 
import org.junit.jupiter.api.Test;
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
import java.util.List;
import java.util.Optional; 

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(controllers = PostController.class)
@Import({PostControllerTest.TestSecurityConfig.class, PostViewMapper.class})
public class PostControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private PostService postService;

    @MockBean
    private MediaService mediaService;

    @MockBean
    private BotPostRepository botPostRepository; 
    @Autowired
    private ObjectMapper objectMapper;

    @BeforeEach
    void stubBotRepo() {
        when(botPostRepository.findBotByPostId(anyInt())).thenReturn(Optional.empty());
    }

    @Test
    void testCreatePost_shouldReturnCreatedPost() throws Exception {
        PostRequest postRequest = new PostRequest();
        postRequest.setContent("Valid content");
        postRequest.setImageUrl("https://example.com/image.jpg");

        UserPost post = new UserPost();
        post.setId(1);
        post.setContent(postRequest.getContent());
        post.setImageUrl(postRequest.getImageUrl());
        post.setCreatedAt(LocalDateTime.now());

        when(postService.createPost(any(PostRequest.class))).thenReturn(post);

        mockMvc.perform(post("/api/posts")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(postRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(post.getId()))
                .andExpect(jsonPath("$.content").value(post.getContent()))
                .andExpect(jsonPath("$.imageUrl").value(post.getImageUrl()));
    }

    @Test
    void testCreatePost_missingContent_shouldReturnBadRequest() throws Exception {
        PostRequest postRequest = new PostRequest();
        postRequest.setContent(""); 
        postRequest.setImageUrl("https://example.com/image.jpg");

        mockMvc.perform(post("/api/posts")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(postRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(content().string("Content must not be null or empty"));
    }

    @Test
    void testCreatePost_serviceThrowsException_shouldReturnServerError() throws Exception {
        PostRequest postRequest = new PostRequest();
        postRequest.setContent("Error trigger");
        postRequest.setImageUrl("https://example.com/image.jpg");

        when(postService.createPost(any(PostRequest.class)))
                .thenThrow(new RuntimeException("Unexpected failure"));

        mockMvc.perform(post("/api/posts")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(postRequest)))
                .andExpect(status().isInternalServerError())
                .andExpect(content().string("Server error: Unexpected failure"));
    }

    @Test
    void testSearchPosts_shouldReturnMatchingPosts() throws Exception {
        UserPost post1 = new UserPost();
        post1.setId(1);
        post1.setContent("Keyword match one");
        post1.setImageUrl("https://example.com/1.jpg");

        UserPost post2 = new UserPost();
        post2.setId(2);
        post2.setContent("Keyword match two");
        post2.setImageUrl("https://example.com/2.jpg");

        List<Post> mockResults = List.of(post1, post2);
        when(postService.searchPosts("keyword")).thenReturn(mockResults);

        mockMvc.perform(get("/api/posts/search")
                        .param("keyword", "keyword")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].id").value(post1.getId()))
                .andExpect(jsonPath("$[0].content").value(post1.getContent()))
                .andExpect(jsonPath("$[1].id").value(post2.getId()))
                .andExpect(jsonPath("$[1].content").value(post2.getContent()));
    }

    @Test
    void testDeletePost_shouldReturnSuccessMessage() throws Exception {
        int postId = 1;
        when(postService.deletePost(postId)).thenReturn(true);

        mockMvc.perform(delete("/api/posts/del/{id}", postId))
                .andExpect(status().isOk())
                .andExpect(content().string("Post deleted successfully"));
    }

    @Test
    void testDeletePost_notFound_shouldReturn404() throws Exception {
        int postId = 999;
        when(postService.deletePost(postId)).thenReturn(false);

        mockMvc.perform(delete("/api/posts/del/{id}", postId))
                .andExpect(status().isNotFound())
                .andExpect(content().string("Post not found"));
    }

    @Test
    void testDeletePost_serverError_shouldReturn500() throws Exception {
        int postId = 1;
        when(postService.deletePost(postId)).thenThrow(new RuntimeException("DB failure"));

        mockMvc.perform(delete("/api/posts/del/{id}", postId))
                .andExpect(status().isInternalServerError())
                .andExpect(content().string("Server error: DB failure"));
    }

    @TestConfiguration
    static class TestSecurityConfig {
        @Bean
        public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
            http.csrf().disable()
                    .authorizeHttpRequests(auth -> auth.anyRequest().permitAll());
            return http.build();
        }
    }
}
