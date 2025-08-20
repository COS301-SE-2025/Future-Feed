package com.syntexsquad.futurefeed.service;

import com.syntexsquad.futurefeed.model.AppUser;
import com.syntexsquad.futurefeed.model.Comment;
import com.syntexsquad.futurefeed.model.Post;
import com.syntexsquad.futurefeed.model.UserPost;
import com.syntexsquad.futurefeed.repository.AppUserRepository;
import com.syntexsquad.futurefeed.repository.CommentRepository;
import com.syntexsquad.futurefeed.repository.PostRepository;
import jakarta.transaction.Transactional;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.Caching;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class CommentService {

    private final CommentRepository commentRepository;
    private final AppUserRepository appUserRepository;
    private final PostRepository postRepository;
    private  final NotificationService notificationService;
    public CommentService(CommentRepository commentRepository,
                          AppUserRepository appUserRepository,
                          PostRepository postRepository,NotificationService notificationService) {
        this.commentRepository = commentRepository;
        this.appUserRepository = appUserRepository;
        this.postRepository = postRepository;
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

    @Transactional
    public Comment addComment(Integer postId, String content) {
        AppUser user = getAuthenticatedUser();
        AppUser sender = getAuthenticatedUser();
        Integer userId = user.getId();

        if (!postRepository.existsById(postId)) {
            throw new IllegalArgumentException("Post not found");
        }

        Comment comment = new Comment();
        comment.setPostId(postId);
        comment.setUserId(userId);
        comment.setContent(content);

        Comment saved = commentRepository.save(comment);

        // Manually evict caches related to this post/user
 Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));

         // 🔔 Notify post owner (COMMENT notification)
        if (post instanceof UserPost userPost) {
            AppUser recipient = userPost.getUser();
            if (recipient != null && !recipient.getId().equals(sender.getId())) {
                notificationService.createNotification(
                        recipient.getId(),
                        sender.getId(),
                        "COMMENT",
                        postId
                );
            }
        }

        // 🔔 Notify mentioned users (MENTION notification)
        handleMentions(content, sender, postId);

        evictCaches(postId, userId);

        return saved;
    }

    @Cacheable(value = "commentsByPost", key = "#postId")
    public List<Comment> getCommentsForPost(Integer postId) {
        return commentRepository.findByPostId(postId);
    }

    @Cacheable(value = "hasCommented", key = "'post_' + #postId + '_user_' + #userId")
    public boolean hasUserCommented(Integer postId) {
        AppUser user = getAuthenticatedUser();
        Integer userId = user.getId();
        return commentRepository.existsByUser_IdAndPost_Id(userId, postId);
    }

    // helper to clear specific cache entries
    @Caching(evict = {
        @CacheEvict(value = "commentsByPost", key = "#postId"),
        @CacheEvict(value = "hasCommented", key = "'post_' + #postId + '_user_' + #userId")
    })
    public void evictCaches(Integer postId, Integer userId) {
    }

     private void handleMentions(String content, AppUser sender, Integer postId) {
        // Regex: @ followed by one or more words (letters, numbers, underscores, spaces allowed)
        Pattern mentionPattern = Pattern.compile("@([A-Za-z0-9_]+(?: [A-Za-z0-9_]+)*)");
        Matcher matcher = mentionPattern.matcher(content);

        while (matcher.find()) {
            String mentionedUsername = matcher.group(1).trim(); // e.g. "Rethabile Mokoena"

            appUserRepository.findByUsername(mentionedUsername).ifPresent(mentionedUser -> {
                if (!mentionedUser.getId().equals(sender.getId())) { // avoid self-mentions
                    notificationService.createNotification(
                            mentionedUser.getId(),
                            sender.getId(),
                            "MENTION",
                            postId
                    );
                }
            });
        }
    }

}