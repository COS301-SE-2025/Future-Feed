package com.syntexsquad.futurefeed.service;

import com.syntexsquad.futurefeed.dto.RegisterRequest;
import com.syntexsquad.futurefeed.model.AppUser;
//import com.syntexsquad.futurefeed.repository.AppUserRepository;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;

@Service
public class AppUserService {

  private final Map<String, AppUser> users = new HashMap<>();

    public void registerUser(RegisterRequest request) {
        // Manual validation
        if (request.getUsername() == null || request.getUsername().trim().isEmpty()) {
            throw new IllegalArgumentException("Username is required.");
        }
        if (request.getPassword() == null || request.getPassword().trim().isEmpty()) {
            throw new IllegalArgumentException("Password is required.");
        }
        if (request.getEmail() == null || !request.getEmail().contains("@")) {
            throw new IllegalArgumentException("Valid email is required.");
        }

        LocalDate dob = request.getDateOfBirth();
        if (dob  == null || (dob != null && dob.isAfter(LocalDate.now()))) {
            throw new IllegalArgumentException("Date of birth cannot be in the future.");
        }

        if (users.containsKey(request.getUsername())) {
            throw new IllegalArgumentException("Username already taken.");
        }

        AppUser user = new AppUser();
        user.setUsername(request.getUsername());
        user.setPassword(request.getPassword());
        user.setRole("USER");
        user.setEmail(request.getEmail());
        user.setDisplayName(request.getDisplayName());
        user.setProfilePicture(request.getProfilePicture());
        user.setDateOfBirth(dob);

        users.put(user.getUsername(), user);
    }

    public AppUser authenticateUser(String username, String password) {
        AppUser user = users.get(username);
        if (user == null || !user.getPassword().equals(password)) {
            throw new IllegalArgumentException("Invalid username or password.");
        }
        return user;
    }
}
