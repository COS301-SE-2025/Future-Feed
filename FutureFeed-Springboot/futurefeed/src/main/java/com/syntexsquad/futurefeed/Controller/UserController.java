package com.syntexsquad.futurefeed.Controller;

import com.syntexsquad.futurefeed.dto.FollowedUserDto;
import com.syntexsquad.futurefeed.dto.UserProfileResponse;
import com.syntexsquad.futurefeed.dto.UserUpdateRequest;
import com.syntexsquad.futurefeed.model.AppUser;
import com.syntexsquad.futurefeed.service.AppUserService;

import com.syntexsquad.futurefeed.service.FollowService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.util.stream.Collectors;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/user")
public class UserController {

    private final AppUserService userService;
    private final FollowService followService;


    public UserController(AppUserService userService, FollowService followService ) {
        this.userService = userService;
        this.followService = followService;
    }

    private String getCurrentUsername() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return (authentication != null) ? authentication.getName() : null;
    }
    @GetMapping("/top-followed")
    public ResponseEntity<List<FollowedUserDto>> getTopFollowedUsers() {
        return ResponseEntity.ok(followService.getTopFollowedUsers(3));
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

    // Search users by keyword
    @GetMapping("/search")
    public ResponseEntity<?> searchUsers(@RequestParam("q") String query) {
        List<AppUser> results = userService.searchUsers(query);
        List<UserProfileResponse> response = results.stream()
                .map(UserProfileResponse::fromUser)
                .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getUserById(@PathVariable Integer id) {
        AppUser user = userService.getUserById(id);
        if (user == null) {
            return ResponseEntity.status(404).body("User not found with id: " + id);
        }
        return ResponseEntity.ok(UserProfileResponse.fromUser(user));
    }

    // Get all users
    @GetMapping("/all")
    public ResponseEntity<?> getAllUsers() {
        List<AppUser> users = userService.getAllUsers();
        List<UserProfileResponse> response = users.stream()
                .map(UserProfileResponse::fromUser)
                .collect(Collectors.toList());
        return ResponseEntity.ok(response);
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

        // Invalidate session and clear SecurityContext
        request.getSession().invalidate();
        SecurityContextHolder.clearContext();

        return ResponseEntity.ok("User '" + username + "' deleted and session invalidated.");
    }

}
