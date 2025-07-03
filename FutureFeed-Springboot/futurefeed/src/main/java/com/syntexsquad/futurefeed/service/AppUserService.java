package com.syntexsquad.futurefeed.service;

import com.syntexsquad.futurefeed.dto.RegisterRequest;
import com.syntexsquad.futurefeed.model.AppUser;
import com.syntexsquad.futurefeed.repository.AppUserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.Map;
import java.util.Optional;
import java.util.List;

@Service
public class AppUserService {

    private final AppUserRepository userRepo;
    private final PasswordEncoder passwordEncoder;

    public AppUserService(AppUserRepository userRepo, PasswordEncoder passwordEncoder) {
        this.userRepo = userRepo;
        this.passwordEncoder = passwordEncoder;
    }

    public void registerUser(RegisterRequest request) {
        if (request.getUsername() == null || request.getUsername().trim().isEmpty()) {
            throw new IllegalArgumentException("Username is required.");
        }
        if (request.getPassword() == null || request.getPassword().trim().isEmpty()) {
            throw new IllegalArgumentException("Password is required.");
        }
        if (request.getEmail() == null || !request.getEmail().contains("@")) {
            throw new IllegalArgumentException("Valid email is required.");
        }
        if (request.getDateOfBirth() == null || request.getDateOfBirth().isAfter(LocalDate.now())) {
            throw new IllegalArgumentException("Date of birth cannot be in the future.");
        }

        if (userRepo.findByUsername(request.getUsername()).isPresent()) {
            throw new IllegalArgumentException("Username already taken.");
        }

        AppUser user = new AppUser();
        user.setUsername(request.getUsername());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setEmail(request.getEmail());
        user.setDisplayName(request.getDisplayName());
        user.setProfilePicture(request.getProfilePicture());
        user.setDateOfBirth(request.getDateOfBirth());
        user.setRole("USER");

        userRepo.save(user);
    }

    public AppUser authenticateUser(String username, String rawPassword) {
        AppUser user = userRepo.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("Invalid username or password."));
        if (!passwordEncoder.matches(rawPassword, user.getPassword())) {
            throw new IllegalArgumentException("Invalid username or password.");
        }
        return user;
    }

    public AppUser getUserByUsername(String username) {
        return userRepo.findByUsername(username).orElse(null);
    }

    public AppUser getUserByEmail(String email) {
        return userRepo.findByEmail(email).orElse(null);
    }

    public boolean deleteUserByUsername(String username) {
        Optional<AppUser> optionalUser = userRepo.findByUsername(username);
        if (optionalUser.isPresent()) {
            userRepo.delete(optionalUser.get());
            return true;
        }
        return false;
    }

    public AppUser saveUser(AppUser user) {
        return userRepo.save(user);
    }

    /**
     * Used by OAuth2UserService to find or create a user based on email.
     */
    public AppUser findOrCreateUserByEmail(String email, Map<String, Object> attributes) {
        return userRepo.findByEmail(email).orElseGet(() -> {
            AppUser newUser = new AppUser();
            newUser.setEmail(email);
            newUser.setUsername(generateUsernameFromEmail(email));
            newUser.setDisplayName((String) attributes.getOrDefault("name", "User"));
            newUser.setProfilePicture((String) attributes.getOrDefault("picture", null));
            newUser.setDateOfBirth(LocalDate.of(2000, 1, 1)); // Default if unknown
            newUser.setPassword(""); // Not used in OAuth
            newUser.setRole("USER");
            return userRepo.save(newUser);
        });
    }

    public List<AppUser> getAllUsers() {
    return userRepo.findAll();
    }

    public List<AppUser> searchUsers(String keyword) {
    return userRepo.findByUsernameContainingIgnoreCaseOrDisplayNameContainingIgnoreCase(keyword, keyword);  
    }

    private String generateUsernameFromEmail(String email) {
        return email.split("@")[0] + "_" + System.currentTimeMillis(); // ensures uniqueness
    }

    public AppUser getUserById(Integer id) {
    return userRepo.findById(id).orElse(null);
    }

}
