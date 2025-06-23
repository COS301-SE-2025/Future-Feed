package com.syntexsquad.futurefeed.service;
import  com.syntexsquad.futurefeed.model.AppUser;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import com.syntexsquad.futurefeed.dto.PostRequest;
import com.syntexsquad.futurefeed.model.*;
import com.syntexsquad.futurefeed.repository.AppUserRepository;
import com.syntexsquad.futurefeed.repository.FeedPresetRepository;
import com.syntexsquad.futurefeed.repository.FollowerRepository;
import com.syntexsquad.futurefeed.repository.PostRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

@Service
public class PostService {

    private final PostRepository postRepository;
    private final AppUserRepository appUserRepository;
    private final FeedPresetRepository feedPresetRepository;
    private final FollowerRepository followerRepository;

    public PostService(PostRepository postRepository, AppUserRepository appUserRepository, FeedPresetRepository feedPresetRepository, FollowerRepository followerRepository) {
        this.postRepository = postRepository;
        this.appUserRepository = appUserRepository;
        this.feedPresetRepository = feedPresetRepository;
        this.followerRepository = followerRepository;
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

    public List<AppUser> getUsersFollowedBy(Integer userId) {
        List<Follower> relationships = followerRepository.findByFollowerId(userId);

        // Convert Integer IDs to Long
        List<Long> followedIds = relationships.stream()
                .map(f -> f.getFollowedId().longValue())
                .toList();

        return appUserRepository.findAllById(followedIds);
    }


    private List<Post> fetchPostsMatchingRule(AppUser user, FeedRule rule, int limit) {
        Pageable pageable = PageRequest.of(0, limit);

        // Get users the current user follows
        List<AppUser> followedUsers = getUsersFollowedBy(user.getId());

        // Get posts matching the topic and authored by followed users
        return postRepository.findByTopicAndUserIn(rule.getTopic().getName(), followedUsers, pageable);
    }

    public List<Post> generateFeedForUser(Long userId) {
        AppUser user = appUserRepository.findById(userId).orElseThrow();

        // Get active/default preset
        FeedPreset preset = feedPresetRepository.findByOwner(user).stream()
                .filter(FeedPreset::isDefault)
                .findFirst()
                .orElse(null);

        if (preset == null) {
            return postRepository.findByUserInOrderByCreatedAtDesc(getUsersFollowedBy(user.getId()));
        }

        List<Post> feed = new ArrayList<>();
        int totalPosts = 100; // or whatever limit you want


        for (FeedRule rule : preset.getRules()) {
            int count = (rule.getPercentage() * totalPosts) / 100;
            feed.addAll(fetchPostsMatchingRule(user, rule, count));
        }

        feed.sort(Comparator.comparing(Post::getCreatedAt).reversed());
        return feed;
    }



}

