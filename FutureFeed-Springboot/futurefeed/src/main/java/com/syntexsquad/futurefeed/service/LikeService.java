package com.syntexsquad.futurefeed.service;

import com.syntexsquad.futurefeed.model.AppUser;
import com.syntexsquad.futurefeed.model.Like;
import com.syntexsquad.futurefeed.model.Post;
import com.syntexsquad.futurefeed.model.UserPost;
import com.syntexsquad.futurefeed.repository.AppUserRepository;
import com.syntexsquad.futurefeed.repository.PostRepository;
import com.syntexsquad.futurefeed.repository.LikeRepository;
import jakarta.transaction.Transactional;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class LikeService {

    private final LikeRepository likeRepository;
    private final AppUserRepository appUserRepository;
    private final PostService postService;
    private final NotificationService notificationService;
    private final  PostRepository postRepository;

    public LikeService(LikeRepository likeRepository, AppUserRepository appUserRepository, PostService postService, NotificationService notificationService, PostRepository postRepository) {
        this.likeRepository = likeRepository;
        this.appUserRepository = appUserRepository;
        this.postService = postService;
        this.notificationService = notificationService;
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


        Post post = postService.getPostById(postId);
        if (post instanceof UserPost userPost) {
            AppUser recipient = userPost.getUser(); // Now it's valid
            notificationService.createNotification(
                    recipient.getId(),
                    sender.getId(),
                    "LIKE",
                     " liked your post",
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

    public List<Post> getLikedPosts() {
        AppUser user = getAuthenticatedUser();
        return   likeRepository.findByUser(user.getId()).stream()
                .map(like -> like.getPost())
                .toList();
    }

    public List<Post> getLikedPostsByUserId(Integer userId) {
        List<Integer> postIds = likeRepository.findPostIdsByUserId(userId);
        return postRepository.findAllById(postIds);
    }


}