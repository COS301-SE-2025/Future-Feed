package com.syntexsquad.futurefeed.service;

import com.syntexsquad.futurefeed.model.AppUser;
import com.syntexsquad.futurefeed.model.Comment;
import com.syntexsquad.futurefeed.model.Post;
import com.syntexsquad.futurefeed.model.UserPost;
import com.syntexsquad.futurefeed.repository.AppUserRepository;
import com.syntexsquad.futurefeed.repository.CommentRepository;
import com.syntexsquad.futurefeed.repository.PostRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class CommentService {

    private static final Logger log = LoggerFactory.getLogger(CommentService.class);

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

    // ---------- unified user resolution (OAuth2 + DAO + fallbacks) ----------
    private Optional<AppUser> tryGetCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null) return Optional.empty();

        // 1) OAuth2 (Google, etc.)
        if (auth instanceof OAuth2AuthenticationToken oauth) {
            OAuth2User principal = oauth.getPrincipal();
            if (principal != null) {
                Object emailAttr = principal.getAttributes() == null ? null : principal.getAttributes().get("email");
                if (emailAttr != null) {
                    String email = String.valueOf(emailAttr);
                    Optional<AppUser> byEmail = appUserRepository.findByEmail(email);
                    if (byEmail.isPresent()) return byEmail;
                }
            }
        }

        Object principal = auth.getPrincipal();

        // 2) Custom AppUserDetails (if present)
        try {
            Class<?> audClass = Class.forName("com.syntexsquad.futurefeed.security.AppUserDetails");
            if (audClass.isInstance(principal)) {
                Object aud = principal;
                try {
                    Integer id = (Integer) audClass.getMethod("getId").invoke(aud);
                    if (id != null) {
                        Optional<AppUser> byId = appUserRepository.findById(id);
                        if (byId.isPresent()) return byId;
                    }
                } catch (NoSuchMethodException ignored) {}
                try {
                    String email = String.valueOf(audClass.getMethod("getEmail").invoke(aud));
                    if (email != null && !email.isBlank()) {
                        Optional<AppUser> byEmail = appUserRepository.findByEmail(email);
                        if (byEmail.isPresent()) return byEmail;
                    }
                } catch (NoSuchMethodException ignored) {}
                try {
                    String username = String.valueOf(audClass.getMethod("getUsername").invoke(aud));
                    if (username != null && !username.isBlank()) {
                        Optional<AppUser> byName = appUserRepository.findByEmail(username)
                                .or(() -> appUserRepository.findByUsername(username));
                        if (byName.isPresent()) return byName;
                    }
                } catch (NoSuchMethodException ignored) {}
            }
        } catch (ClassNotFoundException ignored) {
        } catch (Exception reflectErr) {
            log.warn("tryGetCurrentUser (CommentService): AppUserDetails reflection error: {}", reflectErr.toString());
        }

        // 3) Standard Spring UserDetails
        if (principal instanceof UserDetails ud) {
            String name = ud.getUsername();
            if (name != null && !name.isBlank()) {
                Optional<AppUser> byName = appUserRepository.findByEmail(name)
                        .or(() -> appUserRepository.findByUsername(name));
                if (byName.isPresent()) return byName;
            }
        }

        // 4) Principal as String
        if (principal instanceof String s && !s.isBlank()) {
            Optional<AppUser> byName = appUserRepository.findByEmail(s)
                    .or(() -> appUserRepository.findByUsername(s));
            if (byName.isPresent()) return byName;
        }

        // 5) Fallback: auth.getName()
        String fallback = auth.getName();
        if (fallback != null && !fallback.isBlank()) {
            Optional<AppUser> byName = appUserRepository.findByEmail(fallback)
                    .or(() -> appUserRepository.findByUsername(fallback));
            if (byName.isPresent()) return byName;
        }

        return Optional.empty();
    }

    /** Strict variant used by methods below (keeps test expectations). */
    private AppUser getAuthenticatedUser() {
        return tryGetCurrentUser()
                .orElseThrow(() -> new RuntimeException("Could not extract authenticated user from security context"));
    }
    // -------------------------------------------------------------------------

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
        return commentRepository.findDistinctPostsCommentedByUser(user.getId());
    }

    @Transactional(readOnly = true)
    public List<Post> getPostsCommentedByUser(Integer userId) {
        return commentRepository.findDistinctPostsCommentedByUser(userId);
    }
}
