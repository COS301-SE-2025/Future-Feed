package com.syntexsquad.futurefeed.service;

import com.syntexsquad.futurefeed.model.AppUser;
import com.syntexsquad.futurefeed.model.Like;
import com.syntexsquad.futurefeed.repository.AppUserRepository;
import com.syntexsquad.futurefeed.repository.LikeRepository;
import jakarta.transaction.Transactional;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

@Service
public class LikeService {

    private final LikeRepository likeRepository;
    private final AppUserRepository appUserRepository;
    private final PostService postService;

    public LikeService(LikeRepository likeRepository, AppUserRepository appUserRepository, PostService postService) {
        this.likeRepository = likeRepository;
        this.appUserRepository = appUserRepository;
        this.postService = postService;
    }

    private AppUser getAuthenticatedUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication instanceof OAuth2AuthenticationToken oauthToken) {
            OAuth2User oAuth2User = oauthToken.getPrincipal();
            Object emailAttr = oAuth2User.getAttributes().get("email");
            if (emailAttr != null) {
                return appUserRepository.findByEmail(emailAttr.toString())
                        .orElseThrow(() -> new RuntimeException("Authenticated user not found in DB"));
            }
        }

        throw new RuntimeException("Could not extract authenticated user from security context");
    }

    public boolean likePost(Integer postId) {
        AppUser user = getAuthenticatedUser();

        if (!postService.existsById(postId)) {
            throw new IllegalArgumentException("Post not found");
        }

        if (likeRepository.existsByUserIdAndPostId(user.getId(), postId)) {
            return false;
        }

        Like like = new Like();
        like.setUserId(user.getId());
        like.setPostId(postId);
        likeRepository.save(like);
        return true;
    }

    @Transactional
    public boolean unlikePost(Integer postId) {
        AppUser user = getAuthenticatedUser();

        if (!likeRepository.existsByUserIdAndPostId(user.getId(), postId)) {
            return false;
        }

        likeRepository.deleteByUserIdAndPostId(user.getId(), postId);
        return true;
    }

    public long countLikes(Integer postId) {
        return likeRepository.countByPostId(postId);
    }
}
