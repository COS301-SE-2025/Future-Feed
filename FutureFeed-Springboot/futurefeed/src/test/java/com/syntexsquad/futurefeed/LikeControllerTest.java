package com.syntexsquad.futurefeed;

import com.syntexsquad.futurefeed.Controller.LikeController;
import com.syntexsquad.futurefeed.model.AppUser;
import com.syntexsquad.futurefeed.service.AppUserService;
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
import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors;
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

    @MockBean
    private AppUserService appUserService;

    private final String mockEmail = "user@example.com";
    private final Integer mockUserId = 1;
    private final Integer postId = 2;

    private SecurityMockMvcRequestPostProcessors.OAuth2LoginRequestPostProcessor oauthUser() {
        return SecurityMockMvcRequestPostProcessors.oauth2Login()
                .attributes(attrs -> attrs.put("email", mockEmail));
    }

    @Test
    void testLikePost_shouldReturnSuccessMessage() throws Exception {
        when(appUserService.getUserByEmail(mockEmail)).thenReturn(new AppUser() {{
            setId(mockUserId);
        }});
        when(likeService.likePost(postId)).thenReturn(true);

        mockMvc.perform(post("/api/likes/{postId}", postId)
                        .with(oauthUser()))
                .andExpect(status().isOk())
                .andExpect(content().string("Post liked"));
    }

    @Test
    void testLikePost_shouldReturnBadRequestIfAlreadyLiked() throws Exception {
        when(appUserService.getUserByEmail(mockEmail)).thenReturn(new AppUser() {{
            setId(mockUserId);
        }});
        when(likeService.likePost(postId)).thenReturn(false);

        mockMvc.perform(post("/api/likes/{postId}", postId)
                        .with(oauthUser()))
                .andExpect(status().isBadRequest())
                .andExpect(content().string("Already liked"));
    }

    @Test
    void testUnlikePost_shouldReturnSuccessMessage() throws Exception {
        when(appUserService.getUserByEmail(mockEmail)).thenReturn(new AppUser() {{
            setId(mockUserId);
        }});
        when(likeService.unlikePost(postId)).thenReturn(true);

        mockMvc.perform(delete("/api/likes/{postId}", postId)
                        .with(oauthUser()))
                .andExpect(status().isOk())
                .andExpect(content().string("Post unliked"));
    }

    @Test
    void testUnlikePost_shouldReturnBadRequestIfNotLiked() throws Exception {
        when(appUserService.getUserByEmail(mockEmail)).thenReturn(new AppUser() {{
            setId(mockUserId);
        }});
        when(likeService.unlikePost(postId)).thenReturn(false);

        mockMvc.perform(delete("/api/likes/{postId}", postId)
                        .with(oauthUser()))
                .andExpect(status().isBadRequest())
                .andExpect(content().string("Not liked yet"));
    }

    @Test
    void testCountLikes_shouldReturnLikeCount() throws Exception {
        when(likeService.countLikes(postId)).thenReturn(5L);

        mockMvc.perform(get("/api/likes/count/{postId}", postId))
                .andExpect(status().isOk())
                .andExpect(content().string("5"));
    }

    @TestConfiguration
    static class TestSecurityConfig {
        @Bean
        public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
            http
                .csrf().disable()
                .authorizeHttpRequests(auth -> auth.anyRequest().permitAll())
                .oauth2Login(o -> o.disable())  // Disable OAuth2 login
                .formLogin(f -> f.disable())    // Disable form login
                .httpBasic(b -> b.disable());   // Disable HTTP Basic auth
            return http.build();
        }
    }
}
