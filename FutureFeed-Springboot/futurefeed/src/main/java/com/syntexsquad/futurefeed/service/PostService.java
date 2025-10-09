package com.syntexsquad.futurefeed.service;

import com.syntexsquad.futurefeed.dto.PostRequest;
import com.syntexsquad.futurefeed.model.*;
import com.syntexsquad.futurefeed.repository.AppUserRepository;
import com.syntexsquad.futurefeed.repository.PostRepository;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;

import com.syntexsquad.futurefeed.repository.LikeRepository;
import com.syntexsquad.futurefeed.repository.CommentRepository;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import java.util.List;

@Service
public class PostService {

    private static final Logger log = LoggerFactory.getLogger(PostService.class);
    @PersistenceContext
    private EntityManager em;
    private final PostRepository postRepository;
    private final AppUserRepository appUserRepository;
    private final LikeRepository likerepository;
    private final CommentRepository commentRepository;
    private final TopicService topicService;

    public PostService(PostRepository postRepository,
                       AppUserRepository appUserRepository,
                       LikeRepository likerepository,
                       CommentRepository commentRepository,
                       TopicService topicService) {
        this.postRepository = postRepository;
        this.appUserRepository = appUserRepository;
        this.likerepository = likerepository;
        this.commentRepository = commentRepository;
        this.topicService = topicService;
    }

    @Cacheable(value = "post", key = "#id")
    public Post getPostById(Integer id) {
        return postRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Post with ID " + id + " not found"));
    }

    public boolean existsById(Integer postId) {
        return postRepository.existsById(postId);
    }

@Transactional
@CacheEvict(value = {"posts", "post", "userPosts"}, allEntries = true)
public Post createPost(PostRequest postRequest) {
    Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

    if (authentication == null || !authentication.isAuthenticated()) {
        throw new RuntimeException("User not authenticated");
    }

    String emailOrUsername = null;

    // --- Case 1: OAuth2 login (e.g., Google) ---
    if (authentication instanceof OAuth2AuthenticationToken oauthToken) {
        OAuth2User oAuth2User = oauthToken.getPrincipal();
        Object emailAttr = oAuth2User.getAttributes().get("email");
        if (emailAttr != null) {
            emailOrUsername = emailAttr.toString();
        }
    }
    // --- Case 2: Manual login (username/password) ---
    else {
        Object principal = authentication.getPrincipal();
        if (principal instanceof org.springframework.security.core.userdetails.User userDetails) {
            emailOrUsername = userDetails.getUsername();
        } else if (principal instanceof String strPrincipal) {
            emailOrUsername = strPrincipal;
        }
    }

    if (emailOrUsername == null) {
        throw new RuntimeException("Email or username not found in authentication context");
    }

    // Create a final reference for use in lambda
    final String finalEmailOrUsername = emailOrUsername;

    // --- Try finding user by email, fallback to username ---
    AppUser user = appUserRepository.findByEmail(finalEmailOrUsername)
            .or(() -> appUserRepository.findByUsername(finalEmailOrUsername))
            .orElseThrow(() -> new RuntimeException("Authenticated user not found in DB"));

    // ... rest of your method remains the same


    // --- Create post (Bot or User type) ---
    Post saved;
    if (Boolean.TRUE.equals(postRequest.getIsBot())) {
        BotPost botPost = new BotPost();
        botPost.setContent(postRequest.getContent());
        botPost.setImageUrl(postRequest.getImageUrl());
        botPost.setUser(user);
        saved = postRepository.save(botPost);
    } else {
        UserPost userPost = new UserPost();
        userPost.setContent(postRequest.getContent());
        userPost.setImageUrl(postRequest.getImageUrl());
        userPost.setUser(user);
        saved = postRepository.save(userPost);
    }

    postRepository.flush();
    log.info("[post] created id={} isBot={} content.len={}", saved.getId(), postRequest.getIsBot(),
            saved.getContent() == null ? 0 : saved.getContent().length());

    try {
        log.info("[post] autoTagIfMissing -> postId={}", saved.getId());
        topicService.autoTagIfMissing(saved.getId());
    } catch (Exception e) {
        log.warn("[post] autoTag failed postId={} err={}", saved.getId(), e.toString(), e);
    }

    if (em != null) {
        em.clear();
    }

    return saved;
}

    @CacheEvict(value = {"posts", "post", "userPosts"}, allEntries = true)
    public boolean deletePost(Integer id) {
        if (!postRepository.existsById(id)) {
            return false;
        }
        postRepository.deleteById(id);
        return true;
    }

    @Cacheable(value = "searchPosts", key = "#keyword")
    public List<Post> searchPosts(String keyword) {
        if (keyword == null || keyword.trim().isEmpty()) {
            return List.of();
        }
        List<Post> results = postRepository.searchByKeyword(keyword);
        return results != null ? results : List.of();
    }

    @Cacheable(value = "posts")
    public List<Post> getAllPosts() {
        return postRepository.findAll();
    }

    @Transactional(readOnly = true, propagation = Propagation.REQUIRES_NEW)
    public Page<Post> getPaginatedPosts(int page, int size) {
        if (em != null) {
            em.clear();
        }
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return postRepository.findAll(pageable);
    }

    @Cacheable(value = "userPosts", key = "#userId")
    public List<Post> getPostsByUserId(Integer userId) {
        return postRepository.findAllByUserId(userId);
    }

    @Cacheable(value = "likedPosts", key = "#userId")
    public List<Post> getLikedPostsByUserId(Integer userId) {
        List<Integer> postIds = likerepository.findPostIdsByUserId(userId);
        return postRepository.findAllById(postIds);
    }

    @Cacheable(value = "commentedPosts", key = "#userId")
    public List<Post> getPostsCommentedByUser(Integer userId) {
        List<Comment> comments = commentRepository.findByUserId(userId);
        List<Integer> postIds = comments.stream()
                .map(Comment::getPostId)
                .distinct()
                .toList();
        return postRepository.findAllById(postIds);
    }
}
