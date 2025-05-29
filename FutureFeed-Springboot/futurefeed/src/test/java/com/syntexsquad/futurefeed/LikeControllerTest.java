package com.syntexsquad.futurefeed;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.syntexsquad.futurefeed.Controller.LikeController;
import com.syntexsquad.futurefeed.dto.LikeRequest;
import com.syntexsquad.futurefeed.service.LikeService;
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

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(controllers = LikeController.class)
@Import(LikeControllerTest.TestSecurityConfig.class)
public class LikeControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private LikeService likeService;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void testLikePost_shouldReturnSuccessMessage() throws Exception {
        LikeRequest request = new LikeRequest();
        request.setUserId(1);
        request.setPostId(2);

        when(likeService.likePost(1, 2)).thenReturn(true);

        mockMvc.perform(post("/api/likes")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(content().string("Post liked"));
    }

    @Test
    void testLikePost_shouldReturnBadRequestIfAlreadyLiked() throws Exception {
        LikeRequest request = new LikeRequest();
        request.setUserId(1);
        request.setPostId(2);

        when(likeService.likePost(1, 2)).thenReturn(false);

        mockMvc.perform(post("/api/likes")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(content().string("Already liked"));
    }

    @Test
    void testUnlikePost_shouldReturnSuccessMessage() throws Exception {
        LikeRequest request = new LikeRequest();
        request.setUserId(1);
        request.setPostId(2);

        when(likeService.unlikePost(1, 2)).thenReturn(true);

        mockMvc.perform(delete("/api/likes")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(content().string("Post unliked"));
    }

    @Test
    void testUnlikePost_shouldReturnBadRequestIfNotLiked() throws Exception {
        LikeRequest request = new LikeRequest();
        request.setUserId(1);
        request.setPostId(2);

        when(likeService.unlikePost(1, 2)).thenReturn(false);

        mockMvc.perform(delete("/api/likes")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(content().string("Not liked yet"));
    }

    @Test
    void testCountLikes_shouldReturnLikeCount() throws Exception {
        Integer postId = 2;
        when(likeService.countLikes(postId)).thenReturn(5L);

        mockMvc.perform(get("/api/likes/count/{postId}", postId))
                .andExpect(status().isOk())
                .andExpect(content().string("5"));
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
