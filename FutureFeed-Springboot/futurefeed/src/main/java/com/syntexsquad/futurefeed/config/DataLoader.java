package com.syntexsquad.futurefeed.config;

import com.syntexsquad.futurefeed.model.AppUser;
import com.syntexsquad.futurefeed.repository.AppUserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class DataLoader {

@Bean
CommandLineRunner run(AppUserRepository userRepo, PasswordEncoder encoder) {
    return args -> {
        if (userRepo.findByEmail("user@example.com").isEmpty()) {
            AppUser user = new AppUser("username", encoder.encode("password"));
            user.setEmail("user@example.com");
            userRepo.save(user);
        }

        if (userRepo.findByEmail("admin@example.com").isEmpty()) {
            AppUser admin = new AppUser("admin", encoder.encode("admin123"));
            admin.setEmail("admin@example.com");
            userRepo.save(admin);
        }
    };
}

}
