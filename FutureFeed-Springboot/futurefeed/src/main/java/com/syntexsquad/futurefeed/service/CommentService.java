package com.syntexsquad.futurefeed.service;

import com.syntexsquad.futurefeed.model.AppUser;
import com.syntexsquad.futurefeed.model.Comment;
import com.syntexsquad.futurefeed.repository.AppUserRepository;
import com.syntexsquad.futurefeed.repository.CommentRepository;
import com.syntexsquad.futurefeed.repository.PostRepository;
import jakarta.transaction.Transactional;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CommentService {

    private final CommentRepository commentRepository;
    private final AppUserRepository appUserRepository;
    private final PostRepository postRepository;

    public CommentService(CommentRepository commentRepository,
                          AppUserRepository appUserRepository,
                          PostRepository postRepository) {
        this.commentRepository = commentRepository;
        this.appUserRepository = appUserRepository;
        this.postRepository = postRepository;
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

        if (!postRepository.existsById(postId)) {
            throw new IllegalArgumentException("Post not found");
        }

        Comment comment = new Comment();
        comment.setPostId(postId);
        comment.setUserId(user.getId());
        comment.setContent(content);

        return commentRepository.save(comment);
    }

    public List<Comment> getCommentsForPost(Integer postId) {
        return commentRepository.findByPostId(postId);
    }
}

