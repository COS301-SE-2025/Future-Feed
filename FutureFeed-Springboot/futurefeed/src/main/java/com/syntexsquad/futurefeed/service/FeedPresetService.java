package com.syntexsquad.futurefeed.service;

import com.syntexsquad.futurefeed.dto.FeedPresetDTO;
import com.syntexsquad.futurefeed.dto.PresetRuleDTO;
import com.syntexsquad.futurefeed.model.AppUser;
import com.syntexsquad.futurefeed.model.BotPost;
import com.syntexsquad.futurefeed.model.FeedPreset;
import com.syntexsquad.futurefeed.model.PresetRule;
import com.syntexsquad.futurefeed.model.Post;
import com.syntexsquad.futurefeed.model.PostTopic;
import com.syntexsquad.futurefeed.model.UserPost;
import com.syntexsquad.futurefeed.repository.AppUserRepository;
import com.syntexsquad.futurefeed.repository.FeedPresetRepository;
import com.syntexsquad.futurefeed.repository.PostRepository;
import com.syntexsquad.futurefeed.repository.PostTopicRepository;
import com.syntexsquad.futurefeed.repository.PresetRuleRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
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

    // Preset CRUD 

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

    public FeedPreset updatePreset(Integer presetId, FeedPresetDTO dto) {
        FeedPreset preset = presetRepo.findById(presetId)
                .orElseThrow(() -> new RuntimeException("Preset not found"));

        if (!preset.getUserId().equals(getAuthenticatedUser().getId())) {
            throw new RuntimeException("Not authorized to update this preset");
        }

        preset.setName(dto.getName());
        preset.setDefaultPreset(dto.isDefaultPreset());
        return presetRepo.save(preset);
    }

    public void deletePreset(Integer presetId) {
        FeedPreset preset = presetRepo.findById(presetId)
                .orElseThrow(() -> new RuntimeException("Preset not found"));

        if (!preset.getUserId().equals(getAuthenticatedUser().getId())) {
            throw new RuntimeException("Not authorized to delete this preset");
        }

        ruleRepo.deleteByPresetId(presetId);
        presetRepo.delete(preset);
    }

    public void setDefaultPreset(Integer presetId) {
        FeedPreset preset = presetRepo.findById(presetId)
                .orElseThrow(() -> new RuntimeException("Preset not found"));

        Integer userId = getAuthenticatedUser().getId();
        if (!preset.getUserId().equals(userId)) {
            throw new RuntimeException("Not authorized to update this preset");
        }

        List<FeedPreset> userPresets = presetRepo.findByUserId(userId);
        for (FeedPreset p : userPresets) {
            if (p.isDefaultPreset()) {
                p.setDefaultPreset(false);
                presetRepo.save(p);
            }
        }

        preset.setDefaultPreset(true);
        presetRepo.save(preset);
    }

    public FeedPreset getDefaultPreset() {
        Integer userId = getAuthenticatedUser().getId();
        return presetRepo.findByUserIdAndDefaultPresetTrue(userId)
                .orElseThrow(() -> new RuntimeException("No default preset found for this user"));
    }

    //Rule CRUD

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

    public PresetRule updateRule(Integer ruleId, PresetRuleDTO dto) {
        PresetRule rule = ruleRepo.findById(ruleId)
                .orElseThrow(() -> new RuntimeException("Rule not found"));

        FeedPreset preset = presetRepo.findById(rule.getPresetId())
                .orElseThrow(() -> new RuntimeException("Preset not found"));
        if (!preset.getUserId().equals(getAuthenticatedUser().getId())) {
            throw new RuntimeException("Not authorized to update this rule");
        }

        rule.setTopicId(dto.getTopicId());
        rule.setSourceType(dto.getSourceType());
        rule.setSpecificUserId(dto.getSpecificUserId());
        rule.setPercentage(dto.getPercentage());
        return ruleRepo.save(rule);
    }

    public void deleteRule(Integer ruleId) {
        PresetRule rule = ruleRepo.findById(ruleId)
                .orElseThrow(() -> new RuntimeException("Rule not found"));

        FeedPreset preset = presetRepo.findById(rule.getPresetId())
                .orElseThrow(() -> new RuntimeException("Preset not found"));

        if (!preset.getUserId().equals(getAuthenticatedUser().getId())) {
            throw new RuntimeException("Not authorized to delete this rule");
        }

        ruleRepo.delete(rule);
    }

    public List<Post> generateFeedForPreset(Integer presetId) {
        List<PresetRule> rules = ruleRepo.findByPresetId(presetId);
        Set<Post> resultFeed = new HashSet<>();

        for (PresetRule rule : rules) {
            List<Post> filteredPosts;

            if (rule.getTopicId() != null) {
                List<PostTopic> postTopics = postTopicRepository.findByTopicId(rule.getTopicId());
                List<Integer> postIds = postTopics.stream().map(PostTopic::getPostId).toList();
                filteredPosts = postRepository.findAllById(postIds);
            } else {
                filteredPosts = postRepository.findAll();
            }

            if ("user".equalsIgnoreCase(rule.getSourceType())) {
                filteredPosts = filteredPosts.stream()
                        .filter(p -> "USER".equalsIgnoreCase(p.getPostType()))
                        .collect(Collectors.toList());
            } else if ("bot".equalsIgnoreCase(rule.getSourceType())) {
                filteredPosts = filteredPosts.stream()
                        .filter(p -> "BOT".equalsIgnoreCase(p.getPostType()))
                        .collect(Collectors.toList());
            }

            if (rule.getSpecificUserId() != null) {
                filteredPosts = filteredPosts.stream()
                        .filter(p -> (p instanceof UserPost)
                                && ((UserPost) p).getUser() != null
                                && ((UserPost) p).getUser().getId().equals(rule.getSpecificUserId()))
                        .collect(Collectors.toList());
            }

            int limit = (rule.getPercentage() != null && rule.getPercentage() > 0)
                    ? (filteredPosts.size() * rule.getPercentage()) / 100
                    : filteredPosts.size();

            resultFeed.addAll(filteredPosts.stream().limit(limit).toList());
        }

        return new ArrayList<>(resultFeed);
    }

    public Page<Post> generateFeedForPreset(Integer presetId, int page, int size) {
        List<Post> all = generateFeedForPreset(presetId);

        all.sort(Comparator
                .comparing(Post::getCreatedAt, Comparator.nullsLast(Comparator.naturalOrder()))
                .reversed());

        int from = Math.min(page * size, all.size());
        int to = Math.min(from + size, all.size());
        List<Post> slice = (from <= to) ? all.subList(from, to) : List.of();

        return new PageImpl<>(slice, PageRequest.of(page, size), all.size());
    }
}
