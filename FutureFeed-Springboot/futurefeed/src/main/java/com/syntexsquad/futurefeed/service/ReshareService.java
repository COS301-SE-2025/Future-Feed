package com.syntexsquad.futurefeed.service;

import com.syntexsquad.futurefeed.model.AppUser;
import com.syntexsquad.futurefeed.model.Post;
import com.syntexsquad.futurefeed.model.Reshare;
import com.syntexsquad.futurefeed.repository.AppUserRepository;
import com.syntexsquad.futurefeed.repository.PostRepository;
import com.syntexsquad.futurefeed.repository.ReshareRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class ReshareService {

    private static final Logger log = LoggerFactory.getLogger(ReshareService.class);

    private final ReshareRepository reshareRepository;
    private final AppUserRepository appUserRepository;
    private final PostRepository postRepository;

    public ReshareService(ReshareRepository reshareRepository,
                          AppUserRepository appUserRepository,
                          PostRepository postRepository) {
        this.reshareRepository = reshareRepository;
        this.appUserRepository = appUserRepository;
        this.postRepository = postRepository;
    }

    private AppUser getAuthenticatedUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null) throw new RuntimeException("Not authenticated");

        if (auth instanceof OAuth2AuthenticationToken oauth) {
            OAuth2User principal = oauth.getPrincipal();
            if (principal != null) {
                Map<String, Object> attrs = principal.getAttributes();
                Object emailAttr = attrs == null ? null : attrs.get("email");
                if (emailAttr != null) {
                    String email = String.valueOf(emailAttr);
                    return appUserRepository.findByEmail(email)
                            .orElseThrow(() -> new RuntimeException("Authenticated user not found in DB (email=" + email + ")"));
                }
            }
        }

        Object principal = auth.getPrincipal();
        try {
            Class<?> audClass = Class.forName("com.syntexsquad.futurefeed.security.AppUserDetails");
            if (audClass.isInstance(principal)) {
                Object aud = principal;

                try {
                    Integer id = (Integer) audClass.getMethod("getId").invoke(aud);
                    if (id != null) {
                        Optional<AppUser> byId = appUserRepository.findById(id);
                        if (byId.isPresent()) return byId.get();
                    }
                } catch (NoSuchMethodException ignored) {}

                try {
                    String email = String.valueOf(audClass.getMethod("getEmail").invoke(aud));
                    if (email != null && !email.isBlank()) {
                        Optional<AppUser> byEmail = appUserRepository.findByEmail(email);
                        if (byEmail.isPresent()) return byEmail.get();
                    }
                } catch (NoSuchMethodException ignored) {}

                try {
                    String username = String.valueOf(audClass.getMethod("getUsername").invoke(aud));
                    if (username != null && !username.isBlank()) {
                        return appUserRepository.findByEmail(username)
                                .or(() -> appUserRepository.findByUsername(username))
                                .orElseThrow(() -> new RuntimeException("Authenticated user not found (username=" + username + ")"));
                    }
                } catch (NoSuchMethodException ignored) {}
            }
        } catch (ClassNotFoundException ignored) {
        } catch (Exception reflectErr) {
            log.warn("getAuthenticatedUser: AppUserDetails reflection error: {}", reflectErr.toString());
        }

        if (principal instanceof UserDetails ud) {
            String name = ud.getUsername();
            if (name != null && !name.isBlank()) {
                return appUserRepository.findByEmail(name)
                        .or(() -> appUserRepository.findByUsername(name))
                        .orElseThrow(() -> new RuntimeException("Authenticated user not found (principal=" + name + ")"));
            }
        }

        if (principal instanceof String s && !s.isBlank()) {
            return appUserRepository.findByEmail(s)
                    .or(() -> appUserRepository.findByUsername(s))
                    .orElseThrow(() -> new RuntimeException("Authenticated user not found (principal=" + s + ")"));
        }

        String fallback = auth.getName();
        if (fallback != null && !fallback.isBlank()) {
            return appUserRepository.findByEmail(fallback)
                    .or(() -> appUserRepository.findByUsername(fallback))
                    .orElseThrow(() -> new RuntimeException("Authenticated user not found (name=" + fallback + ")"));
        }

        throw new RuntimeException("Could not extract authenticated user from security context");
    }

    @CacheEvict(value = {"reshareCount", "hasReshared", "userReshares"}, allEntries = true)
    public void resharePost(Integer postId) {
        AppUser user = getAuthenticatedUser();
        if (!reshareRepository.existsByUserIdAndPostId(user.getId(), postId)) {
            Reshare reshare = new Reshare();
            reshare.setUserId(user.getId());
            reshare.setPostId(postId);
            reshareRepository.save(reshare);
        }
    }

    @Transactional
    @CacheEvict(value = {"reshareCount", "hasReshared", "userReshares"}, allEntries = true)
    public void unresharePost(Integer postId) {
        AppUser user = getAuthenticatedUser();
        try {
            reshareRepository.deleteByUserIdAndPostId(user.getId(), postId);
        } catch (Exception e) {
            throw new RuntimeException("Failed to unreshare post", e);
        }
    }

    @Transactional(readOnly = true)
    public List<Reshare> getResharesByUser() {
        AppUser user = getAuthenticatedUser();
        return reshareRepository.findByUserId(user.getId());
    }

    @Cacheable(value = "reshareCount", key = "#postId")
    public long getReshareCount(Integer postId) {
        return reshareRepository.countByPostId(postId);
    }

    public boolean hasUserReshared(Integer postId) {
        AppUser user = getAuthenticatedUser();
        return reshareRepository.existsByUserIdAndPostId(user.getId(), postId);
    }

    @Transactional(readOnly = true)
    public List<Post> getResharedPostsByUserId(Integer userId) {
        return reshareRepository.findDistinctPostsResharedByUser(userId);
    }

    @Transactional(readOnly = true)
    public List<Post> getResharedPostsByAuthenticatedUser() {
        AppUser user = getAuthenticatedUser();
        return reshareRepository.findDistinctPostsResharedByUser(user.getId());
    }
}
