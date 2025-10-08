package com.syntexsquad.futurefeed.Controller;

import com.syntexsquad.futurefeed.dto.RegisterRequest;
import com.syntexsquad.futurefeed.dto.UserProfileResponse;
import com.syntexsquad.futurefeed.model.AppUser;
import com.syntexsquad.futurefeed.service.AppUserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AppUserService userService;

    public AuthController(AppUserService userService) {
        this.userService = userService;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        userService.registerUser(request);
        return ResponseEntity.status(201).build();
    }

    @GetMapping("/status")
    public ResponseEntity<?> status(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).body("Not authenticated");
        }

        AppUser user;
        if (authentication instanceof OAuth2AuthenticationToken oauthToken) {
            String email = oauthToken.getPrincipal().getAttribute("email");
            if (email == null) return ResponseEntity.badRequest().body("Email not found in OAuth2 token");
            user = userService.getUserByEmail(email);
        } else {
            String username = authentication.getName();
            user = userService.getUserByUsername(username);
        }

        if (user == null) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(UserProfileResponse.fromUser(user));
    }

    @GetMapping("/csrf")
    public ResponseEntity<?> csrf(CsrfToken token) {
        return ResponseEntity.ok(Map.of(
            "headerName", token.getHeaderName(),
            "parameterName", token.getParameterName(),
            "token", token.getToken()
        ));
    }

    @GetMapping("/me")
    public ResponseEntity<?> oauth2Login(@org.springframework.security.core.annotation.AuthenticationPrincipal OAuth2User principal) {
        if (principal == null) {
            return ResponseEntity.status(401).body("Not authenticated");
        }

        String email = (String) principal.getAttribute("email");
        if (email == null) {
            return ResponseEntity.badRequest().body("Email not found in OAuth2 user attributes");
        }

        AppUser user = userService.findOrCreateUserByEmail(email, principal.getAttributes());
        return ResponseEntity.ok(user);
    }
}
