package com.syntexsquad.futurefeed.service;

import com.syntexsquad.futurefeed.model.AppUser;
import com.syntexsquad.futurefeed.model.Like;
import com.syntexsquad.futurefeed.model.Post;
import com.syntexsquad.futurefeed.model.UserPost;
import com.syntexsquad.futurefeed.repository.AppUserRepository;
import com.syntexsquad.futurefeed.repository.LikeRepository;
import jakarta.transaction.Transactional;
import com.syntexsquad.futurefeed.model.Post;
import com.syntexsquad.futurefeed.model.UserPost;

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
    private final NotificationService notificationService;

    public LikeService(LikeRepository likeRepository, AppUserRepository appUserRepository, PostService postService, NotificationService notificationService) {
        this.likeRepository = likeRepository;
        this.appUserRepository = appUserRepository;
        this.postService = postService;
        this.notificationService = notificationService;
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
        AppUser sender = getAuthenticatedUser();
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

          // Notify only if it's a UserPost

        Post post = postService.getPostById(postId);
        if (post instanceof UserPost userPost) {
            AppUser recipient = userPost.getUser(); // Now it's valid
            notificationService.createNotification(
                    recipient.getId(),
                    sender.getId(),
                    "LIKE",
                    user.getUsername() + " liked your post",
                    user.getUsername() + "",
                    //user.getUsername() + " liked your post",
                    postId
            );
        }
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

    public boolean hasUserLikedPost(Integer postId) {
    AppUser user = getAuthenticatedUser();

    if (!postService.existsById(postId)) {
        throw new IllegalArgumentException("Post not found");
    }

    return likeRepository.existsByUserIdAndPostId(user.getId(), postId);
    }

}
