package com.syntexsquad.futurefeed.service;

import com.syntexsquad.futurefeed.dto.RegisterRequest;
import com.syntexsquad.futurefeed.model.AppUser;
import com.syntexsquad.futurefeed.repository.AppUserRepository;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.*;

@Service
public class AppUserService {

    private static final int MIN_PASSWORD_LENGTH = 8;
    private final AppUserRepository userRepo;
    private final PasswordEncoder passwordEncoder;

    public AppUserService(AppUserRepository userRepo, PasswordEncoder passwordEncoder) {
        this.userRepo = userRepo;
        this.passwordEncoder = passwordEncoder;
    }

    @CacheEvict(value = {"users", "userByUsername", "userByEmail", "userById"}, allEntries = true)
    public void registerUser(RegisterRequest request) {
        if (request.getUsername() == null || request.getUsername().trim().isEmpty()) {
            throw new IllegalArgumentException("Username is required.");
        }
        if (request.getPassword() == null || request.getPassword().trim().isEmpty()) {
            throw new IllegalArgumentException("Password is required.");
        }

        validatePasswordStrength(request.getPassword());

        if (request.getEmail() == null || !request.getEmail().contains("@")) {
            throw new IllegalArgumentException("Valid email is required.");
        }
        if (request.getDateOfBirth() == null || request.getDateOfBirth().isAfter(LocalDate.now())) {
            throw new IllegalArgumentException("Date of birth cannot be in the future.");
        }
        if (userRepo.findByUsername(request.getUsername()).isPresent()) {
            throw new IllegalArgumentException("Username already taken.");
        }
        if (userRepo.findByEmail(request.getEmail()).isPresent()) {
            throw new IllegalArgumentException("Email already registered.");
        }

        AppUser user = new AppUser();
        user.setUsername(request.getUsername());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setEmail(request.getEmail());
        user.setDisplayName(request.getDisplayName());
        user.setProfilePicture(request.getProfilePicture());
        user.setDateOfBirth(request.getDateOfBirth());
        user.setRole("USER");
        user.setAuthProvider(AppUser.AuthProvider.LOCAL);

        userRepo.save(user);
    }

    public List<AppUser> getAllUsersExceptCurrent(AppUser currentUser) {
        return userRepo.findAll().stream()
                .filter(user -> !user.getId().equals(currentUser.getId()))
                .toList();
    }

    public AppUser authenticateUser(String username, String rawPassword) {
        AppUser user = userRepo.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("Invalid username or password."));
        if (!passwordEncoder.matches(rawPassword, user.getPassword())) {
            throw new IllegalArgumentException("Invalid username or password.");
        }
        return user;
    }

    @Cacheable(value = "userByUsername", key = "#username")
    public AppUser getUserByUsername(String username) {
        return userRepo.findByUsername(username).orElse(null);
    }

    @Cacheable(value = "userByEmail", key = "#email")
    public AppUser getUserByEmail(String email) {
        return userRepo.findByEmail(email).orElse(null);
    }

    @CacheEvict(value = {"users", "userByUsername", "userByEmail", "userById"}, allEntries = true)
    public boolean deleteUserByUsername(String username) {
        Optional<AppUser> optionalUser = userRepo.findByUsername(username);
        if (optionalUser.isPresent()) {
            userRepo.delete(optionalUser.get());
            return true;
        }
        return false;
    }

    @CacheEvict(value = {"users", "userByUsername", "userByEmail", "userById"}, allEntries = true)
    public AppUser saveUser(AppUser user) {
        return userRepo.save(user);
    }

    @CacheEvict(value = {"users", "userByUsername", "userByEmail", "userById"}, allEntries = true)
    public AppUser findOrCreateUserByEmail(String email, Map<String, Object> attributes) {
        return userRepo.findByEmail(email).orElseGet(() -> {
            AppUser newUser = new AppUser();
            newUser.setEmail(email);
            newUser.setUsername(uniqueUsernameFromEmail(email));
            newUser.setDisplayName((String) attributes.getOrDefault("name", "User"));
            newUser.setProfilePicture((String) attributes.getOrDefault("picture", null));
            newUser.setDateOfBirth(LocalDate.of(2000, 1, 1));
            newUser.setPassword(passwordEncoder.encode(UUID.randomUUID().toString()));
            newUser.setRole("USER");
            newUser.setAuthProvider(AppUser.AuthProvider.GOOGLE);
            return userRepo.save(newUser);
        });
    }

    @Cacheable(value = "users")
    public List<AppUser> getAllUsers() {
        return userRepo.findAll();
    }

    @Cacheable(value = "searchUsers", key = "#keyword")
    public List<AppUser> searchUsers(String keyword) {
        return userRepo.findByUsernameContainingIgnoreCaseOrDisplayNameContainingIgnoreCase(keyword, keyword);
    }

    private String uniqueUsernameFromEmail(String email) {
        String base = email.substring(0, email.indexOf('@'))
                .replaceAll("[^a-zA-Z0-9._-]", "_");
        String candidate = base;
        int i = 1;
        while (userRepo.existsByUsername(candidate)) {
            candidate = base + "_" + i++;
        }
        return candidate;
    }

    @Cacheable(value = "userById", key = "#id")
    public AppUser getUserById(Integer id) {
        return userRepo.findById(id).orElse(null);
    }

    private void validatePasswordStrength(String password) {
        if (password.length() < MIN_PASSWORD_LENGTH) {
            throw new IllegalArgumentException("Password must be at least " + MIN_PASSWORD_LENGTH + " characters long.");
        }
        boolean hasLetter = false;
        boolean hasDigit = false;
        for (char c : password.toCharArray()) {
            if (Character.isLetter(c)) hasLetter = true;
            if (Character.isDigit(c))  hasDigit = true;
            if (hasLetter && hasDigit) break;
        }
        if (!hasLetter || !hasDigit) {
            throw new IllegalArgumentException("Password must contain at least one letter and one number.");
        }
    }
}
