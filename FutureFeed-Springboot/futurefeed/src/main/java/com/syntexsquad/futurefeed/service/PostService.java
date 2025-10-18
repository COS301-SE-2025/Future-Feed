package com.syntexsquad.futurefeed.service;

import com.syntexsquad.futurefeed.dto.PostRequest;
import com.syntexsquad.futurefeed.model.*;
import com.syntexsquad.futurefeed.repository.AppUserRepository;
import com.syntexsquad.futurefeed.repository.PostRepository;
import com.syntexsquad.futurefeed.repository.LikeRepository;
import com.syntexsquad.futurefeed.repository.CommentRepository;
import com.syntexsquad.futurefeed.repository.FollowerRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.data.domain.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;

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
    @Autowired
    private FollowerRepository followRepository;

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
        AppUser user = resolveCurrentUser(authentication); 

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
        log.info("[post] created id={} isBot={} content.len={}",
                saved.getId(),
                postRequest.getIsBot(),
                saved.getContent() == null ? 0 : saved.getContent().length());

        try {
            log.info("[post] autoTagIfMissing -> postId={}", saved.getId());
            topicService.autoTagIfMissing(saved.getId());
        } catch (Exception e) {
            log.warn("[post] autoTag failed postId={} err={}", saved.getId(), e.toString(), e);
        }

        if (em != null) em.clear();
        return saved;
    }

    private AppUser resolveCurrentUser(Authentication auth) {
        if (auth == null) {
            throw new RuntimeException("Not authenticated");
        }

        if (auth instanceof OAuth2AuthenticationToken oauth) {
            OAuth2User o = oauth.getPrincipal();
            if (o != null) {
                Map<String, Object> attrs = o.getAttributes();
                Object emailAttr = attrs == null ? null : attrs.get("email");
                if (emailAttr != null) {
                    String email = String.valueOf(emailAttr);
                    return appUserRepository.findByEmail(email)
                            .orElseThrow(() -> new RuntimeException("User not found (email=" + email + ")"));
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
                } catch (NoSuchMethodException ignored) { /* skip */ }

                try {
                    String email = String.valueOf(audClass.getMethod("getEmail").invoke(aud));
                    if (email != null && !email.isBlank()) {
                        Optional<AppUser> byEmail = appUserRepository.findByEmail(email);
                        if (byEmail.isPresent()) return byEmail.get();
                    }
                } catch (NoSuchMethodException ignored) { /* skip */ }

                try {
                    String username = String.valueOf(audClass.getMethod("getUsername").invoke(aud));
                    if (username != null && !username.isBlank()) {
                        return appUserRepository.findByEmail(username)
                                .or(() -> appUserRepository.findByUsername(username))
                                .orElseThrow(() -> new RuntimeException("User not found (username=" + username + ")"));
                    }
                } catch (NoSuchMethodException ignored) { /* skip */ }
            }
        } catch (ClassNotFoundException ignored) {
        } catch (Exception reflectErr) {
            log.warn("resolveCurrentUser: AppUserDetails reflection error: {}", reflectErr.toString());
        }

        if (principal instanceof UserDetails ud) {
            String name = ud.getUsername();
            if (name != null && !name.isBlank()) {
                return appUserRepository.findByEmail(name)
                        .or(() -> appUserRepository.findByUsername(name))
                        .orElseThrow(() -> new RuntimeException("User not found (principal=" + name + ")"));
            }
        }

        if (principal instanceof String s && !s.isBlank()) {
            return appUserRepository.findByEmail(s)
                    .or(() -> appUserRepository.findByUsername(s))
                    .orElseThrow(() -> new RuntimeException("User not found (principal=" + s + ")"));
        }

        String fallback = auth.getName();
        if (fallback != null && !fallback.isBlank()) {
            return appUserRepository.findByEmail(fallback)
                    .or(() -> appUserRepository.findByUsername(fallback))
                    .orElseThrow(() -> new RuntimeException("User not found (name=" + fallback + ")"));
        }

        throw new RuntimeException("User not found");
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
        if (em != null) em.clear();
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

    @Transactional(readOnly = true)
    public List<Integer> getFollowedUserIds(Integer userId) {
        return followRepository.findFollowedIdsByFollowerId(userId);
    }

    public AppUser getCurrentAuthenticatedUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            return null;
        }
        return resolveCurrentUser(auth);
    }


    @Transactional(readOnly = true)
    public Page<Post> getFollowingPosts(List<Integer> followedUserIds, int page, int size) {
        if (followedUserIds == null || followedUserIds.isEmpty()) {
            return Page.empty();
        }

        if (em != null) em.clear();

        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));

        Page<Post> result = postRepository.findPostsByFollowedUsers(
                new ArrayList<>(followedUserIds), pageable
        );

        List<Post> freshPosts = result.getContent().stream()
                .filter(p -> followedUserIds.contains(p.getUser().getId()))
                .toList();

        return new PageImpl<>(freshPosts, pageable, freshPosts.size());
    }

}
