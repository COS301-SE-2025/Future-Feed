package com.syntexsquad.futurefeed.service;

import com.syntexsquad.futurefeed.model.AppUser;
import com.syntexsquad.futurefeed.model.Post;
import com.syntexsquad.futurefeed.model.Reshare;
import com.syntexsquad.futurefeed.repository.ReshareRepository;
import com.syntexsquad.futurefeed.repository.PostRepository;
import com.syntexsquad.futurefeed.repository.AppUserRepository;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ReshareService {

    private final ReshareRepository reshareRepository;
    private final AppUserRepository appUserRepository;
    private final PostRepository postRepository;

    public ReshareService(ReshareRepository reshareRepository, AppUserRepository appUserRepository, PostRepository postRepository) {
        this.reshareRepository = reshareRepository;
        this.appUserRepository = appUserRepository;
        this.postRepository = postRepository;
    }

    private AppUser getAuthenticatedUser() {
    Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

    if (authentication == null || !authentication.isAuthenticated()) {
        throw new RuntimeException("User not authenticated");
    }

    // --- Case 1: OAuth2 login (e.g., Google) ---
    if (authentication instanceof OAuth2AuthenticationToken oauthToken) {
        OAuth2User oAuth2User = oauthToken.getPrincipal();
        String email = (String) oAuth2User.getAttributes().get("email");

        if (email == null) {
            throw new RuntimeException("Email not found in OAuth2 attributes");
        }

        return appUserRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Authenticated OAuth2 user not found in DB"));
    }

    // --- Case 2: Manual login (form-based) ---
    Object principal = authentication.getPrincipal();
    String usernameOrEmail;

    if (principal instanceof com.syntexsquad.futurefeed.security.AppUserDetails appUserDetails) {
        usernameOrEmail = appUserDetails.getUsername();
    } else if (principal instanceof org.springframework.security.core.userdetails.User userDetails) {
        usernameOrEmail = userDetails.getUsername();
    } else if (principal instanceof String strPrincipal) {
        usernameOrEmail = strPrincipal;
    } else {
        throw new RuntimeException("Unsupported authentication principal type: " + principal.getClass());
    }

    // Try lookup by email first, fallback to username
    return appUserRepository.findByEmail(usernameOrEmail)
            .or(() -> appUserRepository.findByUsername(usernameOrEmail))
            .orElseThrow(() -> new RuntimeException("Authenticated user not found in DB"));
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
    @Cacheable(value = "userReshares", key = "'user_' + #userId")
    public List<Reshare> getResharesByUser() {
        AppUser user = getAuthenticatedUser();
        Integer userId = user.getId();
        return reshareRepository.findByUserId(userId);
    }

    @Cacheable(value = "reshareCount", key = "#postId")
    public long getReshareCount(Integer postId) {
        return reshareRepository.countByPostId(postId);
    }

    @Cacheable(value = "hasReshared", key = "'post_' + #postId + '_user_' + #userId")
    public boolean hasUserReshared(Integer postId) {
        AppUser user = getAuthenticatedUser();
        Integer userId = user.getId();
        return reshareRepository.existsByUserIdAndPostId(userId, postId);
    }

    public List<Post> getResharedPostsByUserId(Integer userId) {
        List<Reshare> reshares = reshareRepository.findByUserId(userId);
        List<Integer> postIds = reshares.stream()
                .map(Reshare::getPostId)
                .distinct()
                .toList();
        return postRepository.findAllById(postIds);
    }
}