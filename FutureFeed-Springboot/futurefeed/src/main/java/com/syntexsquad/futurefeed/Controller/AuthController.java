package com.syntexsquad.futurefeed.Controller;

import com.syntexsquad.futurefeed.model.AppUser;
import com.syntexsquad.futurefeed.service.AppUserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AppUserService userService;

    public AuthController(AppUserService userService) {
        this.userService = userService;
    }

    @GetMapping("/me")
    public ResponseEntity<?> oauth2Login(@AuthenticationPrincipal OAuth2User principal) {
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
