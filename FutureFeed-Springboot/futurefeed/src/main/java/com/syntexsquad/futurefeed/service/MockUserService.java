package com.syntexsquad.futurefeed.service;

import com.syntexsquad.futurefeed.dto.RegisterRequest;
import com.syntexsquad.futurefeed.model.AppUser;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
public class MockUserService {
    private final Map<String, AppUser> users = new HashMap<>();

    public void registerUser(RegisterRequest request) {
        if (users.containsKey(request.getUsername())) {
            throw new IllegalArgumentException("Username already taken.");
        }

        AppUser user = new AppUser(request.getUsername(), request.getPassword());
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
// This is a mock service for demonstration purposes.   