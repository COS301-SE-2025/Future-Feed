package com.syntexsquad.futurefeed.Controller;

import com.syntexsquad.futurefeed.dto.UserProfileResponse;
import com.syntexsquad.futurefeed.dto.UserUpdateRequest;
import com.syntexsquad.futurefeed.model.AppUser;
import com.syntexsquad.futurefeed.service.MockUserService;
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
    public ResponseEntity<?> getCurrentUser() {
        String username = "john_doe"; // temporary hardcoded username
        AppUser user = userService.getUserByUsername(username);

        if (user == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(UserProfileResponse.fromUser(user));
    }

    @PutMapping("/update")
    public ResponseEntity<?> updateUser(@RequestBody UserUpdateRequest request) {
        String username = "john_doe"; // temporary hardcoded username
        AppUser user = userService.getUserByUsername(username);

        if (user == null) {
            return ResponseEntity.notFound().build();
        }

        if (request.getDisplayName() != null) user.setDisplayName(request.getDisplayName());
        if (request.getProfilePicture() != null) user.setProfilePicture(request.getProfilePicture());
        if (request.getDateOfBirth() != null) user.setDateOfBirth(request.getDateOfBirth());
        if (request.getBio() != null) user.setBio(request.getBio());

        return ResponseEntity.ok(UserProfileResponse.fromUser(user));
    }
}
