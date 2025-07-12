package com.syntexsquad.futurefeed.service;

import com.syntexsquad.futurefeed.dto.PostRequest;
import com.syntexsquad.futurefeed.model.*;
import com.syntexsquad.futurefeed.repository.AppUserRepository;
import com.syntexsquad.futurefeed.repository.PostRepository;
import com.syntexsquad.futurefeed.repository.LikeRepository;
import com.syntexsquad.futurefeed.repository.CommentRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PostService {

    private final PostRepository postRepository;
    private final AppUserRepository appUserRepository;
    private final LikeRepository likerepository;
    private final CommentRepository commentRepository;

    public PostService(PostRepository postRepository, AppUserRepository appUserRepository, LikeRepository likerepository, CommentRepository commentRepository) {
        this.postRepository = postRepository;
        this.appUserRepository = appUserRepository;
        this.likerepository = likerepository;
        this.commentRepository = commentRepository;
    }

    public Post getPostById(Integer id) {
    return postRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Post with ID " + id + " not found"));
    }

    public boolean existsById(Integer postId) {
    return postRepository.existsById(postId);
    }

    public Post createPost(PostRequest postRequest) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        // Extract email from OAuth2 login
        String email = null;
        if (authentication instanceof OAuth2AuthenticationToken oauthToken) {
            OAuth2User oAuth2User = oauthToken.getPrincipal();
            Object emailAttr = oAuth2User.getAttributes().get("email");
            if (emailAttr != null) {
                email = emailAttr.toString();
            }
        }

        if (email == null) {
            throw new RuntimeException("Email not found in authentication context");
        }

        AppUser user = appUserRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (Boolean.TRUE.equals(postRequest.getIsBot())) {
            BotPost botPost = new BotPost();
            botPost.setContent(postRequest.getContent());
            botPost.setImageUrl(postRequest.getImageUrl());
            return postRepository.save(botPost);
        } else {
            UserPost userPost = new UserPost();
            userPost.setContent(postRequest.getContent());
            userPost.setImageUrl(postRequest.getImageUrl());
            userPost.setUser(user);
            return postRepository.save(userPost);
        }
    }

    public boolean deletePost(Integer id) {
        if (!postRepository.existsById(id)) {
            return false;
        }
        postRepository.deleteById(id);
        return true;
    }

    public List<Post> searchPosts(String keyword) {
        return postRepository.searchByKeyword(keyword);
    }

    public List<Post> getAllPosts() {
    return postRepository.findAll();
    }

    public List<Post> getPostsByUserId(Integer userId) {
        return postRepository.findAllByUserId(userId);
    }

    public List<Post> getLikedPostsByUserId(Integer userId) {
        List<Integer> postIds = likerepository.findPostIdsByUserId(userId);
        return postRepository.findAllById(postIds);
    }
    public List<Post> getPostsCommentedByUser(Integer userId) {
        List<Comment> comments = commentRepository.findByUserId(userId);
        List<Integer> postIds = comments.stream()
                .map(Comment::getPostId)
                .distinct()
                .toList();

        return postRepository.findAllById(postIds);
    }


}
