package com.syntexsquad.futurefeed.service;

import com.syntexsquad.futurefeed.model.AppUser;
import com.syntexsquad.futurefeed.model.Comment;
import com.syntexsquad.futurefeed.model.Post;
import com.syntexsquad.futurefeed.model.UserPost;
import com.syntexsquad.futurefeed.repository.AppUserRepository;
import com.syntexsquad.futurefeed.repository.CommentRepository;
import com.syntexsquad.futurefeed.repository.PostRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class CommentService {

    private final CommentRepository commentRepository;
    private final AppUserRepository appUserRepository;
    private final PostRepository postRepository;
    private final NotificationService notificationService;

    public CommentService(CommentRepository commentRepository,
                          AppUserRepository appUserRepository,
                          PostRepository postRepository,
                          NotificationService notificationService) {
        this.commentRepository = commentRepository;
        this.appUserRepository = appUserRepository;
        this.postRepository = postRepository;
        this.notificationService = notificationService;
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


    // New transaction and flush so the row is visible immediately to other requests
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public Comment addComment(Integer postId, String content) {
        AppUser sender = getAuthenticatedUser();

        if (!postRepository.existsById(postId)) {
            throw new IllegalArgumentException("Post not found");
        }

        Post postRef = postRepository.getReferenceById(postId);

        Comment c = new Comment();
        c.setPost(postRef);
        c.setUser(sender);
        c.setContent(content);

        Comment saved = commentRepository.saveAndFlush(c);

        // Notifications
        Post post = postRepository.findById(postId).orElseThrow();
        if (post instanceof UserPost up) {
            AppUser recipient = up.getUser();
            if (recipient != null && !recipient.getId().equals(sender.getId())) {
                notificationService.createNotification(
                        recipient.getId(),
                        sender.getId(),
                        "COMMENT",
                        " commented on your post",
                        sender.getUsername() + "",
                        postId
                );
            }
        }

        handleMentions(content, sender, postId);
        return saved;
    }

    private void handleMentions(String content, AppUser sender, Integer postId) {
        Pattern mentionPattern = Pattern.compile("@([A-Za-z0-9_]+(?: [A-Za-z0-9_]+)*)");
        Matcher matcher = mentionPattern.matcher(content);

        while (matcher.find()) {
            String mentionedUsername = matcher.group(1).trim();
            appUserRepository.findByUsername(mentionedUsername).ifPresent(mentionedUser -> {
                if (!mentionedUser.getId().equals(sender.getId())) {
                    notificationService.createNotification(
                            mentionedUser.getId(),
                            sender.getId(),
                            "MENTION",
                            " mentioned you on a post",
                            sender.getUsername() + "",
                            postId
                    );
                }
            });
        }
    }

    // ✅ Legacy signature your tests expect. Uses fetch-join to avoid LAZY issues.
    @Transactional(readOnly = true, propagation = Propagation.SUPPORTS)
    public List<Comment> getCommentsForPost(Integer postId) {
        return commentRepository.findByPostIdWithUser(postId);
    }

    @Transactional(readOnly = true)
    public boolean hasUserCommented(Integer postId) {
        AppUser user = getAuthenticatedUser();
        return commentRepository.existsByUser_IdAndPost_Id(user.getId(), postId);
    }

    @Transactional(readOnly = true)
    public List<Post> getCommentedPosts() {
        AppUser user = getAuthenticatedUser();
        var comments = commentRepository.findByUserId(user.getId());
        return comments.stream()
                .map(c -> postRepository.findById(c.getPost().getId()).orElse(null))
                .filter(p -> p != null)
                .distinct()
                .toList();
    }

    @Transactional(readOnly = true)
    public List<Post> getPostsCommentedByUser(Integer userId) {
        var comments = commentRepository.findByUserId(userId);
        var postIds = comments.stream().map(c -> c.getPost().getId()).distinct().toList();
        return postRepository.findAllById(postIds);
    }
}
