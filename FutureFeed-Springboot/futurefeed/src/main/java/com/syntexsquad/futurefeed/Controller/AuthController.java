package com.syntexsquad.futurefeed.controller;
import com.syntexsquad.futurefeed.model.AppUser;
import com.syntexsquad.futurefeed.service.AppUserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
public class AuthController {

    @Autowired
    private AppUserService userService;

    @PostMapping("/register")
    public String register(@RequestBody AppUser user) {
        AppUser registered = userService.registerUser(user);
        return "User registered with username: " + registered.getUsername();
    }

    @GetMapping("/login")
    public String login() {
        return "Login endpoint (secured via Spring Security config)";
    }
    
}

