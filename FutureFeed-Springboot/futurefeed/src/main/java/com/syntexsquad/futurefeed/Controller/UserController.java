package com.syntexsquad.futurefeed.Controller;

import com.syntexsquad.futurefeed.dto.UserProfileResponse;
import com.syntexsquad.futurefeed.dto.UserUpdateRequest;
import com.syntexsquad.futurefeed.model.AppUser;
import com.syntexsquad.futurefeed.service.MockUserService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/user")
public class UserController {

    private final MockUserService userService;

    public UserController(MockUserService userService) {
        this.userService = userService;
    }

    @GetMapping("/myInfo")
    public ResponseEntity<?> getCurrentUser(HttpServletRequest request) {
        String username = (String) request.getAttribute("username");
        AppUser user = userService.getUserByUsername(username);

        if (user == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(UserProfileResponse.fromUser(user));
    }

    @PutMapping("/update")
    public ResponseEntity<?> updateUser(@RequestBody UserUpdateRequest requestBody, HttpServletRequest request) {
        String username = (String) request.getAttribute("username");
        AppUser user = userService.getUserByUsername(username);

        if (user == null) {
            return ResponseEntity.notFound().build();
        }

        if (requestBody.getDisplayName() != null) user.setDisplayName(requestBody.getDisplayName());
        if (requestBody.getProfilePicture() != null) user.setProfilePicture(requestBody.getProfilePicture());
        if (requestBody.getDateOfBirth() != null) user.setDateOfBirth(requestBody.getDateOfBirth());
        if (requestBody.getBio() != null) user.setBio(requestBody.getBio());

        return ResponseEntity.ok(UserProfileResponse.fromUser(user));
    }

    @DeleteMapping("/delete")
    public ResponseEntity<?> deleteUser(HttpServletRequest request) {
        String username = (String) request.getAttribute("username");
        boolean deleted = userService.deleteUserByUsername(username);

        if (!deleted) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok("User '" + username + "' deleted successfully.");
    }
}