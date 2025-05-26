package com.syntexsquad.futurefeed.Controller;

import com.syntexsquad.futurefeed.dto.LoginRequest;
import com.syntexsquad.futurefeed.dto.RegisterRequest;
import com.syntexsquad.futurefeed.dto.UserProfileResponse;
import com.syntexsquad.futurefeed.model.AppUser;
import com.syntexsquad.futurefeed.security.JwtUtil;
import com.syntexsquad.futurefeed.service.MockUserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final MockUserService userService;
    private final JwtUtil jwtUtil;

    public AuthController(MockUserService userService, JwtUtil jwtUtil) {
        this.userService = userService;
        this.jwtUtil = jwtUtil;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        try {
            userService.registerUser(request);
            AppUser user = userService.getUserByUsername(request.getUsername());
            String token = jwtUtil.generateToken(user.getUsername());
            return ResponseEntity.ok()
                    .header("Authorization", "Bearer " + token)
                    .body(UserProfileResponse.fromUser(user));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        try {
            AppUser user = userService.authenticateUser(request.getUsername(), request.getPassword());
            String token = jwtUtil.generateToken(user.getUsername());
            return ResponseEntity.ok()
                    .header("Authorization", "Bearer " + token)
                    .body(UserProfileResponse.fromUser(user));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(401).body("Invalid credentials");
        }
    }
}