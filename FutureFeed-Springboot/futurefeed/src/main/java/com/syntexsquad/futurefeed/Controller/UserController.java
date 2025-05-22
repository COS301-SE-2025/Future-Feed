package com.syntexsquad.futurefeed.controller;

import com.syntexsquad.futurefeed.dto.UserUpdateRequest;
import com.syntexsquad.futurefeed.model.AppUser;
import com.syntexsquad.futurefeed.repository.AppUserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.Optional;

@RestController
@RequestMapping("/api/user")
public class UserController {

    @Autowired
    private AppUserRepository userRepo;

    @PutMapping("/update")
public ResponseEntity<?> updateUser(@RequestBody UserUpdateRequest request, Principal principal) {
    Optional<AppUser> optionalUser = userRepo.findByUsername(principal.getName());

    if (optionalUser.isEmpty()) {
        return ResponseEntity.notFound().build();
    }

    AppUser user = optionalUser.get();

    // Update only if the fields are not null
    if (request.getDisplayName() != null) {
        user.setDisplayName(request.getDisplayName());
    }
    if (request.getProfilePicture() != null) {
        user.setProfilePicture(request.getProfilePicture());
    }
    if (request.getDateOfBirth() != null) {
        user.setDateOfBirth(request.getDateOfBirth());
    }
    if (request.getBio() != null) {
        user.setBio(request.getBio());
    }

    userRepo.save(user);

    return ResponseEntity.ok("User updated successfully.");
}

}
