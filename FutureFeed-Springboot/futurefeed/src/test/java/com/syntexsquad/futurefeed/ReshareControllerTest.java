package com.syntexsquad.futurefeed;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.syntexsquad.futurefeed.Controller.ReshareController;
import com.syntexsquad.futurefeed.dto.ReshareRequest;
import com.syntexsquad.futurefeed.model.Reshare;
import com.syntexsquad.futurefeed.service.CustomOAuth2UserService;
import com.syntexsquad.futurefeed.service.ReshareService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.core.userdetails.*;
import org.springframework.security.provisioning.InMemoryUserDetailsManager;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.test.web.servlet.MockMvc;

import java.util.ArrayList;
import java.util.List;

import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(controllers = ReshareController.class)
@AutoConfigureMockMvc(addFilters = true) 
@Import(ReshareControllerTest.TestSecurity.class) 
public class ReshareControllerTest {

    @TestConfiguration
    static class TestSecurity {
        @Bean
        SecurityFilterChain testFilterChain(HttpSecurity http) throws Exception {
            http
                .csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(auth -> auth
                    .requestMatchers("/api/reshares/**").authenticated()
                    .anyRequest().permitAll()
                )
                .formLogin(Customizer.withDefaults()); 
            return http.build();
        }

        @Bean
        UserDetailsService userDetailsService() {
            UserDetails user = User.withUsername("user").password("{noop}password").roles("USER").build();
            return new InMemoryUserDetailsManager(user);
        }
    }

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private com.syntexsquad.futurefeed.mapper.PostViewMapper postViewMapper;

    @MockBean
    private ReshareService reshareService;

    @MockBean
    private CustomOAuth2UserService customOAuth2UserService;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @WithMockUser
    public void reshare_ShouldReturnSuccessMessage() throws Exception {
        ReshareRequest request = new ReshareRequest();
        request.setPostId(10);

        doNothing().when(reshareService).resharePost(10);

        mockMvc.perform(post("/api/reshares")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isOk())
            .andExpect(content().string("Post reshared."));
    }

    @Test
    @WithMockUser
    public void reshare_ShouldReturnInternalServerErrorOnException() throws Exception {
        ReshareRequest request = new ReshareRequest();
        request.setPostId(10);

        doThrow(new RuntimeException("Reshare failed")).when(reshareService).resharePost(10);

        mockMvc.perform(post("/api/reshares")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isInternalServerError());
    }

    @Test
    @WithMockUser
    public void unreshare_ShouldReturnSuccessMessage() throws Exception {
        doNothing().when(reshareService).unresharePost(10);

        mockMvc.perform(delete("/api/reshares/10"))
            .andExpect(status().isOk())
            .andExpect(content().string("Post unreshared."));
    }

    @Test
    @WithMockUser
    public void unreshare_ShouldReturnBadRequestOnException() throws Exception {
        doThrow(new RuntimeException("Unreshare failed")).when(reshareService).unresharePost(10);

        mockMvc.perform(delete("/api/reshares/10"))
            .andExpect(status().isBadRequest())
            .andExpect(content().string(org.hamcrest.Matchers.containsString("Error: Unreshare failed")));
    }

    @Test
    @WithMockUser
    public void myReshares_ShouldReturnListOfReshares() throws Exception {
        List<Reshare> reshares = new ArrayList<>();
        Reshare r = new Reshare();
        r.setUserId(1);
        r.setPostId(10);
        reshares.add(r);

        when(reshareService.getResharesByUser()).thenReturn(reshares);

        mockMvc.perform(get("/api/reshares"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$[0].userId").value(1))
            .andExpect(jsonPath("$[0].postId").value(10));
    }

    @Test
    public void reshare_ShouldRedirectIfNotAuthenticated() throws Exception {
        ReshareRequest request = new ReshareRequest();
        request.setPostId(10);

        mockMvc.perform(post("/api/reshares")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isFound()) 
            .andExpect(header().string("Location", org.hamcrest.Matchers.startsWith("http://localhost/login")));
    }
}
