package com.syntexsquad.futurefeed.service;

import com.syntexsquad.futurefeed.dto.ReshareRequest;
import com.syntexsquad.futurefeed.model.AppUser;
import com.syntexsquad.futurefeed.model.Reshare;
import com.syntexsquad.futurefeed.repository.ReshareRepository;
import com.syntexsquad.futurefeed.repository.AppUserRepository;
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

    public ReshareService(ReshareRepository reshareRepository, AppUserRepository appUserRepository) {
        this.reshareRepository = reshareRepository;
        this.appUserRepository = appUserRepository;
    }

    private AppUser getAuthenticatedUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication instanceof OAuth2AuthenticationToken oauthToken) {
            OAuth2User oAuth2User = oauthToken.getPrincipal();
            String email = (String) oAuth2User.getAttributes().get("email");
            return appUserRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("Authenticated user not found in DB"));
        }
        throw new RuntimeException("User not authenticated");
    }

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
    public void unresharePost(Integer postId) {
        AppUser user = getAuthenticatedUser();
        try {
            reshareRepository.deleteByUserIdAndPostId(user.getId(), postId);
        } catch (Exception e) {
            throw new RuntimeException("Failed to unreshare post: " + e.getMessage(), e);
        }
    }


    public List<Reshare> getResharesByUser() {
        AppUser user = getAuthenticatedUser();
        return reshareRepository.findByUserId(user.getId());
    }
}
