package com.syntexsquad.futurefeed.service;

import com.syntexsquad.futurefeed.dto.FeedPresetDTO;
import com.syntexsquad.futurefeed.dto.PresetRuleDTO;
import com.syntexsquad.futurefeed.model.*;
import com.syntexsquad.futurefeed.repository.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class FeedPresetService {

    private final FeedPresetRepository presetRepo;
    private final PresetRuleRepository ruleRepo;
    private final AppUserRepository appUserRepository;
    private final PostRepository postRepository;
    private final PostTopicRepository postTopicRepository;

    public FeedPresetService(
            FeedPresetRepository presetRepo,
            PresetRuleRepository ruleRepo,
            AppUserRepository appUserRepository,
            PostRepository postRepository,
            PostTopicRepository postTopicRepository
    ) {
        this.presetRepo = presetRepo;
        this.ruleRepo = ruleRepo;
        this.appUserRepository = appUserRepository;
        this.postRepository = postRepository;
        this.postTopicRepository = postTopicRepository;
    }

    private AppUser getAuthenticatedUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication instanceof OAuth2AuthenticationToken oauthToken) {
            OAuth2User oAuth2User = oauthToken.getPrincipal();
            String email = (String) oAuth2User.getAttributes().get("email");
            return appUserRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("Authenticated user not found in DB"));
        }
        throw new RuntimeException("User not authenticated");
    }

    public FeedPreset createPreset(FeedPresetDTO dto) {
        FeedPreset preset = new FeedPreset();
        preset.setName(dto.getName());
        preset.setDefaultPreset(dto.isDefaultPreset());
        preset.setUserId(getAuthenticatedUser().getId());
        return presetRepo.save(preset);
    }

    public List<FeedPreset> getUserPresets() {
        return presetRepo.findByUserId(getAuthenticatedUser().getId());
    }

    public PresetRule createRule(PresetRuleDTO dto) {
        PresetRule rule = new PresetRule();
        rule.setPresetId(dto.getPresetId());
        rule.setTopicId(dto.getTopicId());
        rule.setSourceType(dto.getSourceType());
        rule.setSpecificUserId(dto.getSpecificUserId());
        rule.setPercentage(dto.getPercentage());
        return ruleRepo.save(rule);
    }

    public List<PresetRule> getRulesForPreset(Integer presetId) {
        return ruleRepo.findByPresetId(presetId);
    }

    public List<Post> generateFeedForPreset(Integer presetId) {
        List<PresetRule> rules = ruleRepo.findByPresetId(presetId);
        Set<Post> resultFeed = new HashSet<>();

        for (PresetRule rule : rules) {
            List<Post> filteredPosts = new ArrayList<>();

            if (rule.getTopicId() != null) {
                List<PostTopic> postTopics = postTopicRepository.findByTopicId(rule.getTopicId());
                List<Integer> postIds = postTopics.stream().map(PostTopic::getPostId).toList();
                filteredPosts.addAll(postRepository.findAllById(postIds));
            }

            if ("user".equalsIgnoreCase(rule.getSourceType())) {
                filteredPosts = filteredPosts.stream()
                        .filter(p -> p instanceof UserPost)
                        .collect(Collectors.toList());
            } else if ("bot".equalsIgnoreCase(rule.getSourceType())) {
                filteredPosts = filteredPosts.stream()
                        .filter(p -> p instanceof BotPost)
                        .collect(Collectors.toList());
            }

            if (rule.getSpecificUserId() != null) {
                filteredPosts = filteredPosts.stream()
                        .filter(p -> (p instanceof UserPost) && ((UserPost) p).getUser().getId().equals(rule.getSpecificUserId()))
                        .collect(Collectors.toList());
            }

            int limit = (rule.getPercentage() != null && rule.getPercentage() > 0)
                    ? (filteredPosts.size() * rule.getPercentage()) / 100
                    : filteredPosts.size();

            resultFeed.addAll(filteredPosts.stream().limit(limit).toList());
        }

        return new ArrayList<>(resultFeed);
    }
}
