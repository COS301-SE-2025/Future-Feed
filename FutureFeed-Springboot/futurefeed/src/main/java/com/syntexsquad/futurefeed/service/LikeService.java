package com.syntexsquad.futurefeed.service;

import com.syntexsquad.futurefeed.model.AppUser;
import com.syntexsquad.futurefeed.model.Like;
import com.syntexsquad.futurefeed.model.Post;
import com.syntexsquad.futurefeed.model.UserPost;
import com.syntexsquad.futurefeed.repository.AppUserRepository;
import com.syntexsquad.futurefeed.repository.LikeRepository;
import com.syntexsquad.futurefeed.repository.PostRepository;
import jakarta.transaction.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class LikeService {

    private static final Logger log = LoggerFactory.getLogger(LikeService.class);

    private final LikeRepository likeRepository;
    private final AppUserRepository appUserRepository;
    private final PostService postService;
    private final NotificationService notificationService;
    private final PostRepository postRepository;

    public LikeService(LikeRepository likeRepository,
                       AppUserRepository appUserRepository,
                       PostService postService,
                       NotificationService notificationService,
                       PostRepository postRepository) {
        this.likeRepository = likeRepository;
        this.appUserRepository = appUserRepository;
        this.postService = postService;
        this.notificationService = notificationService;
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

    @Transactional
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

        Post post = postService.getPostById(postId);
        if (post instanceof UserPost userPost) {
            AppUser recipient = userPost.getUser();
            if (recipient != null && !recipient.getId().equals(user.getId())) {
                notificationService.createNotification(
                        recipient.getId(),
                        user.getId(),
                        "LIKE",
                        " liked your post",
                        String.valueOf(user.getUsername()),
                        postId
                );
            }
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
        if (!postService.existsById(postId)) throw new IllegalArgumentException("Post not found");
        return likeRepository.existsByUserIdAndPostId(user.getId(), postId);
    }

    public List<Post> getLikedPosts() {
        AppUser user = getAuthenticatedUser();
        return likeRepository.findByUser(user.getId())
                .stream()
                .map(Like::getPost)
                .toList();
    }

    public List<Post> getLikedPostsByUserId(Integer userId) {
        List<Integer> postIds = likeRepository.findPostIdsByUserId(userId);
        return postRepository.findAllById(postIds);
    }
}
