// package com.syntexsquad.futurefeed.Controller;

// import com.syntexsquad.futurefeed.dto.UserUpdateRequest;
// import com.syntexsquad.futurefeed.model.AppUser;
// import com.syntexsquad.futurefeed.repository.AppUserRepository;
// import org.springframework.beans.factory.annotation.Autowired;
// import org.springframework.http.ResponseEntity;
// import org.springframework.web.bind.annotation.*;

// import java.security.Principal;
// import java.util.Optional;

// @RestController
// @RequestMapping("/api/user")
// public class UserController {

//     @Autowired
//     private AppUserRepository userRepo;

//     @PutMapping("/update/{id}")
// public ResponseEntity<?> updateUser(@RequestBody UserUpdateRequest request, Principal principal) {
//     Optional<AppUser> optionalUser = userRepo.findByUsername(principal.getName());

//     if (optionalUser.isEmpty()) {
//         return ResponseEntity.notFound().build();
//     }

//     AppUser user = optionalUser.get();

//     // Update only if the fields are not null
//     if (request.getDisplayName() != null) {
//         user.setDisplayName(request.getDisplayName());
//     }
//     if (request.getProfilePicture() != null) {
//         user.setProfilePicture(request.getProfilePicture());
//     }
//     if (request.getDateOfBirth() != null) {
//         user.setDateOfBirth(request.getDateOfBirth());
//     }
//     if (request.getBio() != null) {
//         user.setBio(request.getBio());
//     }

//     userRepo.save(user);

//     return ResponseEntity.ok("User updated successfully.");
// }
//     @GetMapping("/profile")
//     public ResponseEntity<AppUser> getUserProfile(Principal principal) {
//         Optional<AppUser> optionalUser = userRepo.findByUsername(principal.getName());

//         if (optionalUser.isEmpty()) {
//             return ResponseEntity.notFound().build();
//         }

//         return ResponseEntity.ok(optionalUser.get());
//     }

//     @GetMapping("/profile/{username}")  
//     public ResponseEntity<AppUser> getUserProfileByUsername(@PathVariable String username) {
//         Optional<AppUser> optionalUser = userRepo.findByUsername(username);

//         if (optionalUser.isEmpty()) {
//             return ResponseEntity.notFound().build();
//         }

//         return ResponseEntity.ok(optionalUser.get());
//     }
//     @DeleteMapping("/delete/{username}")
//     public ResponseEntity<?> deleteUser(@PathVariable String username, Principal principal) {
//         if (!principal.getName().equals(username)) {
//             return ResponseEntity.status(403).body("You can only delete your own account.");
//         }

//         Optional<AppUser> optionalUser = userRepo.findByUsername(username);
//         if (optionalUser.isEmpty()) {
//             return ResponseEntity.notFound().build();
//         }

//         userRepo.delete(optionalUser.get());
//         return ResponseEntity.ok("User deleted successfully.");
//     }
  

// }


package com.syntexsquad.futurefeed.Controller;

import com.syntexsquad.futurefeed.dto.UserUpdateRequest;
import com.syntexsquad.futurefeed.model.AppUser;
import com.syntexsquad.futurefeed.repository.AppUserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/user")
public class UserController {

    @Autowired
    private AppUserRepository userRepo;

    @PutMapping("/update")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> updateUser(
            @RequestBody UserUpdateRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        
        if (userDetails == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Authentication required");
        }

        Optional<AppUser> optionalUser = userRepo.findByUsername(userDetails.getUsername());

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

    @GetMapping("/profile")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<AppUser> getUserProfile(@AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        Optional<AppUser> optionalUser = userRepo.findByUsername(userDetails.getUsername());

        if (optionalUser.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(optionalUser.get());
    }

    @GetMapping("/profile/{username}")
    public ResponseEntity<AppUser> getUserProfileByUsername(@PathVariable String username) {
        Optional<AppUser> optionalUser = userRepo.findByUsername(username);

        if (optionalUser.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(optionalUser.get());
    }

    @DeleteMapping("/delete/{username}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> deleteUser(
            @PathVariable String username,
            @AuthenticationPrincipal UserDetails userDetails) {
        
        if ( !userDetails.getUsername().equals(username)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("You can only delete your own account.");
        }
        if ( userDetails == null ) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("No user found.");
        }

        Optional<AppUser> optionalUser = userRepo.findByUsername(username);
        if (optionalUser.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        userRepo.delete(optionalUser.get());
        return ResponseEntity.ok("User deleted successfully.");
    }
}