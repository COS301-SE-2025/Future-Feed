package com.syntexsquad.futurefeed.Controller;
import com.syntexsquad.futurefeed.dto.LoginRequest;
import com.syntexsquad.futurefeed.dto.RegisterRequest;
import com.syntexsquad.futurefeed.dto.UserProfileResponse;
import com.syntexsquad.futurefeed.model.AppUser;
import com.syntexsquad.futurefeed.service.MockUserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final MockUserService userService;

    public AuthController(MockUserService userService) {
        this.userService = userService;
    }

    @PostMapping("/register")
    public ResponseEntity<String> register(@RequestBody RegisterRequest request) {
        try {
            userService.registerUser(request);
            return ResponseEntity.ok("Registration successful for: " + request.getUsername());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        try {
            AppUser user = userService.authenticateUser(request.getUsername(), request.getPassword());
            return ResponseEntity.ok(UserProfileResponse.fromUser(user));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(401).body("Invalid credentials");
        }
    }
}
