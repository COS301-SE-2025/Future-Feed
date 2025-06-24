package com.syntexsquad.futurefeed.Controller;

import com.syntexsquad.futurefeed.dto.UserProfileResponse;
import com.syntexsquad.futurefeed.dto.UserUpdateRequest;
import com.syntexsquad.futurefeed.model.AppUser;
import com.syntexsquad.futurefeed.service.AppUserService;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/user")
public class UserController {

    private final AppUserService userService;

    public UserController(AppUserService userService) {
        this.userService = userService;
    }

    private String getCurrentUsername() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return (authentication != null) ? authentication.getName() : null;
    }

    @GetMapping("/myInfo")
    public ResponseEntity<?> getCurrentUser(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).body("Unauthorized");
        }

        AppUser user = null;

        // Handle OAuth2
        if (authentication instanceof OAuth2AuthenticationToken oauthToken) {
            String email = oauthToken.getPrincipal().getAttribute("email");
            if (email == null) {
                return ResponseEntity.status(400).body("Email not found in OAuth2 token");
            }
            user = userService.getUserByEmail(email);
        } else {
            String username = authentication.getName();
            user = userService.getUserByUsername(username);
        }

        if (user == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(UserProfileResponse.fromUser(user));
    }

    @PutMapping("/update")
    public ResponseEntity<?> updateUser(@RequestBody UserUpdateRequest request, Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).body("Unauthorized");
        }

        AppUser user = null;

        // Handle OAuth2
        if (authentication instanceof OAuth2AuthenticationToken oauthToken) {
            String email = oauthToken.getPrincipal().getAttribute("email");
            if (email == null) {
                return ResponseEntity.status(400).body("Email not found in OAuth2 token");
            }
            user = userService.getUserByEmail(email);
        } else {
            String username = authentication.getName();
            user = userService.getUserByUsername(username);
        }

        if (user == null) {
            return ResponseEntity.notFound().build();
        }

        if (request.getDisplayName() != null) user.setDisplayName(request.getDisplayName());
        if (request.getProfilePicture() != null) user.setProfilePicture(request.getProfilePicture());
        if (request.getDateOfBirth() != null) user.setDateOfBirth(request.getDateOfBirth());
        if (request.getBio() != null) user.setBio(request.getBio());

        userService.saveUser(user);

        return ResponseEntity.ok(UserProfileResponse.fromUser(user));
    }


    @DeleteMapping("/delete")
    public ResponseEntity<?> deleteUser(HttpServletRequest request, HttpServletResponse response, Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).body("Unauthorized");
        }

        String username;

        if (authentication instanceof OAuth2AuthenticationToken oauthToken) {
            String email = oauthToken.getPrincipal().getAttribute("email");
            if (email == null) {
                return ResponseEntity.status(400).body("Email not found in OAuth2 token");
            }

            AppUser user = userService.getUserByEmail(email);
            if (user == null) {
                return ResponseEntity.status(404).body("User not found for email: " + email);
            }

            username = user.getUsername();
        } else {
            username = authentication.getName();
        }

        boolean deleted = userService.deleteUserByUsername(username);
        if (!deleted) {
            return ResponseEntity.status(404).body("User not found: " + username);
        }

        // 🔐 Invalidate session and clear SecurityContext
        request.getSession().invalidate();
        SecurityContextHolder.clearContext();

        return ResponseEntity.ok("User '" + username + "' deleted and session invalidated.");
    }

}
