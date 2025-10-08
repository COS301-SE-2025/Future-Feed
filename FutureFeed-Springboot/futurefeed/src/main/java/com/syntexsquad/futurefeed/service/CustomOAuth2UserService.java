package com.syntexsquad.futurefeed.service;

import com.syntexsquad.futurefeed.model.AppUser;
import com.syntexsquad.futurefeed.repository.AppUserRepository;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.client.userinfo.*;
import org.springframework.security.oauth2.core.*;
import org.springframework.security.oauth2.core.user.*;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.*;

@Service
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    private final AppUserRepository repo;
    private final PasswordEncoder encoder;

    public CustomOAuth2UserService(AppUserRepository repo, PasswordEncoder encoder) {
        this.repo = repo;
        this.encoder = encoder;
    }

    @Override
    public OAuth2User loadUser(OAuth2UserRequest req) throws OAuth2AuthenticationException {
        OAuth2User o = super.loadUser(req);

        String email = (String) o.getAttributes().get("email");
        if (email == null || email.isBlank()) {
            throw new OAuth2AuthenticationException(new OAuth2Error("invalid_user"), "Email not provided by provider");
        }
        String name  = (String) o.getAttributes().getOrDefault("name", "User");
        String pic   = (String) o.getAttributes().get("picture");

        AppUser user = repo.findByEmail(email).orElseGet(() -> {
            AppUser nu = new AppUser();
            nu.setEmail(email);
            nu.setUsername(uniqueUsernameFromEmail(email));
            nu.setDisplayName(name);
            nu.setProfilePicture(pic);
            nu.setDateOfBirth(LocalDate.of(2000, 1, 1));
            nu.setPassword(encoder.encode(UUID.randomUUID().toString()));
            nu.setRole("USER");
            nu.setAuthProvider(AppUser.AuthProvider.GOOGLE);
            return repo.save(nu);
        });

        Map<String, Object> attrs = new HashMap<>(o.getAttributes());
        attrs.put("id", user.getId());

        return new DefaultOAuth2User(
            List.of(new SimpleGrantedAuthority("ROLE_" + user.getRole())),
            attrs,
            "email"
        );
    }

    private String uniqueUsernameFromEmail(String email) {
        String base = email.substring(0, email.indexOf('@'))
                .replaceAll("[^a-zA-Z0-9._-]", "_");
        String candidate = base;
        int i = 1;
        while (repo.existsByUsername(candidate)) {
            candidate = base + "_" + i++;
        }
        return candidate;
    }
}
