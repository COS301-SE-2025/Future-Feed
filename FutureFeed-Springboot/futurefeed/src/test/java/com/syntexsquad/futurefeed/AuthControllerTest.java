package com.syntexsquad.futurefeed;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.syntexsquad.futurefeed.Controller.AuthController;
import com.syntexsquad.futurefeed.config.SecurityConfig;
import com.syntexsquad.futurefeed.dto.LoginRequest;
import com.syntexsquad.futurefeed.dto.RegisterRequest;
import com.syntexsquad.futurefeed.model.AppUser;
import com.syntexsquad.futurefeed.service.MockUserService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;

import static org.hamcrest.Matchers.containsString;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(AuthController.class)
@Import(SecurityConfig.class)
public class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private MockUserService userService;

    private final ObjectMapper objectMapper = new ObjectMapper()
            .registerModule(new JavaTimeModule())
            .disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);

    @Test
    void testSuccessfulRegistration() throws Exception {
        RegisterRequest request = new RegisterRequest();
        request.setUsername("user1");
        request.setPassword("pass123");
        request.setEmail("user1@example.com");
        request.setDateOfBirth(LocalDate.of(1990, 1, 1));

        doNothing().when(userService).registerUser(any());

        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(content().string(containsString("Registration successful")));
    }

    @Test
    void testRegistrationFailsOnMissingUsername() throws Exception {
        RegisterRequest request = new RegisterRequest();
        request.setPassword("pass123");
        request.setEmail("user1@example.com");

        doThrow(new IllegalArgumentException("Username is required."))
                .when(userService).registerUser(any());

        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(content().string("Username is required."));
    }

    @Test
    void testRegistrationFailsOnInvalidEmail() throws Exception {
        RegisterRequest request = new RegisterRequest();
        request.setUsername("user1");
        request.setPassword("pass123");
        request.setEmail("invalid-email");

        doThrow(new IllegalArgumentException("Valid email is required."))
                .when(userService).registerUser(any());

        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(content().string("Valid email is required."));
    }

    @Test
    void testRegistrationFailsOnDuplicateUsername() throws Exception {
        RegisterRequest request = new RegisterRequest();
        request.setUsername("user1");
        request.setPassword("pass123");
        request.setEmail("user1@example.com");

        doThrow(new IllegalArgumentException("Username already taken."))
                .when(userService).registerUser(any());

        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(content().string("Username already taken."));
    }

    @Test
    void testSuccessfulLogin() throws Exception {
        LoginRequest request = new LoginRequest();
        request.setUsername("user1");
        request.setPassword("pass123");

        AppUser mockUser = new AppUser();
        mockUser.setUsername("user1");
        mockUser.setEmail("user1@example.com");

        when(userService.authenticateUser("user1", "pass123")).thenReturn(mockUser);

        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.username").value("user1"));
    }

    @Test
    void testLoginFailsOnWrongPassword() throws Exception {
        LoginRequest request = new LoginRequest();
        request.setUsername("user1");
        request.setPassword("wrongpass");

        when(userService.authenticateUser("user1", "wrongpass"))
                .thenThrow(new IllegalArgumentException("Invalid username or password."));

        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized())
                .andExpect(content().string("Invalid credentials"));
    }
}
