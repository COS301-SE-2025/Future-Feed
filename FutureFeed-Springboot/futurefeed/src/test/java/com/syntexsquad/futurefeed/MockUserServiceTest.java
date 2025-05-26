package com.syntexsquad.futurefeed;

import com.syntexsquad.futurefeed.model.AppUser;
import com.syntexsquad.futurefeed.dto.RegisterRequest;
import com.syntexsquad.futurefeed.service.MockUserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;

import static org.junit.jupiter.api.Assertions.*;

public class MockUserServiceTest {

    private MockUserService userService;

    @BeforeEach
    void setup() {
        userService = new MockUserService();
    }

    @Test
    void registerUser_success() {
        RegisterRequest request = new RegisterRequest();
        request.setUsername("testuser");
        request.setPassword("pass");
        request.setEmail("test@example.com");
        request.setDateOfBirth(LocalDate.of(2000, 1, 1)); // ✅ FIX

        assertDoesNotThrow(() -> userService.registerUser(request));
    }

    @Test
    void registerUser_duplicateUsername_throws() {
        RegisterRequest request = new RegisterRequest();
        request.setUsername("testuser");
        request.setPassword("pass");
        request.setEmail("test@example.com");
        request.setDateOfBirth(LocalDate.of(2000, 1, 1)); // ✅ FIX

        userService.registerUser(request);

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () -> userService.registerUser(request));
        assertEquals("Username already taken.", ex.getMessage());
    }

    @Test
    void registerUser_invalidEmail_throws() {
        RegisterRequest request = new RegisterRequest();
        request.setUsername("user2");
        request.setPassword("pass");
        request.setEmail("invalidemail");
        request.setDateOfBirth(LocalDate.of(2000, 1, 1)); // ✅ FIX

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () -> userService.registerUser(request));
        assertEquals("Valid email is required.", ex.getMessage());
    }

    @Test
    void authenticateUser_success() {
        RegisterRequest request = new RegisterRequest();
        request.setUsername("authuser");
        request.setPassword("pass");
        request.setEmail("auth@example.com");
        request.setDateOfBirth(LocalDate.of(2000, 1, 1)); // ✅ FIX
        userService.registerUser(request);

        AppUser user = userService.authenticateUser("authuser", "pass");
        assertNotNull(user);
        assertEquals("authuser", user.getUsername());
    }

    @Test
    void authenticateUser_wrongPassword_throws() {
        RegisterRequest request = new RegisterRequest();
        request.setUsername("authuser2");
        request.setPassword("pass");
        request.setEmail("auth2@example.com");
        request.setDateOfBirth(LocalDate.of(2000, 1, 1)); // ✅ FIX
        userService.registerUser(request);

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () -> userService.authenticateUser("authuser2", "wrongpass"));
        assertEquals("Invalid username or password.", ex.getMessage());
    }
}

