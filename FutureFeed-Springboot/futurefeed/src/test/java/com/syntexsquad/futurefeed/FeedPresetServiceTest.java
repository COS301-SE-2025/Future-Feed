package com.syntexsquad.futurefeed;

import com.syntexsquad.futurefeed.dto.FeedPresetDTO;
import com.syntexsquad.futurefeed.dto.PresetRuleDTO;
import com.syntexsquad.futurefeed.model.*;
import com.syntexsquad.futurefeed.repository.*;
import com.syntexsquad.futurefeed.service.FeedPresetService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.OAuth2User;

import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class FeedPresetServiceTest {

    @Mock
    private FeedPresetRepository presetRepo;

    @Mock
    private PresetRuleRepository ruleRepo;

    @Mock
    private AppUserRepository appUserRepository;

    @Mock
    private PostRepository postRepository;

    @Mock
    private PostTopicRepository postTopicRepository;

    @Mock
    private SecurityContext securityContext;

    @Mock
    private OAuth2AuthenticationToken oauth2AuthenticationToken;

    @Mock
    private OAuth2User oAuth2User;

    @InjectMocks
    private FeedPresetService feedPresetService;

    private AppUser authenticatedUser;

    @BeforeEach
    public void setup() {
        // Lenient stubs to avoid unnecessary stubbing errors
        lenient().when(oAuth2User.getAttributes()).thenReturn(Map.of("email", "testuser@example.com"));
        lenient().when(oauth2AuthenticationToken.getPrincipal()).thenReturn(oAuth2User);
        lenient().when(securityContext.getAuthentication()).thenReturn(oauth2AuthenticationToken);
        SecurityContextHolder.setContext(securityContext);

        authenticatedUser = new AppUser();
        authenticatedUser.setId(1);
        authenticatedUser.setEmail("testuser@example.com");
        lenient().when(appUserRepository.findByEmail("testuser@example.com")).thenReturn(Optional.of(authenticatedUser));
    }

    @Test
    public void testCreatePreset_SavesAndReturnsPreset() {
        FeedPresetDTO dto = new FeedPresetDTO();
        dto.setName("My Preset");
        dto.setDefaultPreset(true);

        FeedPreset savedPreset = new FeedPreset();
        savedPreset.setId(10);
        savedPreset.setName(dto.getName());
        savedPreset.setDefaultPreset(dto.isDefaultPreset());
        savedPreset.setUserId(authenticatedUser.getId());

        when(presetRepo.save(any(FeedPreset.class))).thenReturn(savedPreset);

        FeedPreset result = feedPresetService.createPreset(dto);

        assertEquals(10, result.getId());
        assertEquals("My Preset", result.getName());
        assertTrue(result.isDefaultPreset());
        assertEquals(authenticatedUser.getId(), result.getUserId());

        verify(presetRepo).save(any(FeedPreset.class));
    }

    @Test
    public void testGetUserPresets_ReturnsList() {
        FeedPreset preset1 = new FeedPreset();
        preset1.setId(1);
        FeedPreset preset2 = new FeedPreset();
        preset2.setId(2);

        when(presetRepo.findByUserId(authenticatedUser.getId())).thenReturn(List.of(preset1, preset2));

        List<FeedPreset> presets = feedPresetService.getUserPresets();

        assertEquals(2, presets.size());
        verify(presetRepo).findByUserId(authenticatedUser.getId());
    }

    @Test
    public void testCreateRule_SavesAndReturnsRule() {
        PresetRuleDTO dto = new PresetRuleDTO();
        dto.setPresetId(5);
        dto.setTopicId(7);
        dto.setSourceType("user");
        dto.setSpecificUserId(3);
        dto.setPercentage(50);

        PresetRule savedRule = new PresetRule();
        savedRule.setId(20);
        savedRule.setPresetId(dto.getPresetId());
        savedRule.setTopicId(dto.getTopicId());
        savedRule.setSourceType(dto.getSourceType());
        savedRule.setSpecificUserId(dto.getSpecificUserId());
        savedRule.setPercentage(dto.getPercentage());

        when(ruleRepo.save(any(PresetRule.class))).thenReturn(savedRule);

        PresetRule result = feedPresetService.createRule(dto);

        assertEquals(20, result.getId());
        assertEquals(5, result.getPresetId());
        assertEquals("user", result.getSourceType());
        verify(ruleRepo).save(any(PresetRule.class));
    }

    @Test
    public void testGetRulesForPreset_ReturnsList() {
        PresetRule rule1 = new PresetRule();
        PresetRule rule2 = new PresetRule();

        when(ruleRepo.findByPresetId(10)).thenReturn(List.of(rule1, rule2));

        List<PresetRule> rules = feedPresetService.getRulesForPreset(10);

        assertEquals(2, rules.size());
        verify(ruleRepo).findByPresetId(10);
    }

    @Test
    public void testGenerateFeedForPreset_GeneratesCorrectPosts() {
        int presetId = 1;

        // Prepare rules
        PresetRule rule1 = new PresetRule();
        rule1.setPresetId(presetId);
        rule1.setTopicId(100);
        rule1.setSourceType("user");
        rule1.setPercentage(100);

        PresetRule rule2 = new PresetRule();
        rule2.setPresetId(presetId);
        rule2.setTopicId(200);
        rule2.setSourceType("bot");
        rule2.setPercentage(50);

        when(ruleRepo.findByPresetId(presetId)).thenReturn(List.of(rule1, rule2));

        // Mock posts and topics for rule1
        PostTopic pt1 = new PostTopic();
        pt1.setPostId(1);
        PostTopic pt2 = new PostTopic();
        pt2.setPostId(2);

        when(postTopicRepository.findByTopicId(100)).thenReturn(List.of(pt1, pt2));

        UserPost userPost1 = new UserPost();
        userPost1.setId(1);
        UserPost userPost2 = new UserPost();
        userPost2.setId(2);
        // These posts correspond to pt1 and pt2
        when(postRepository.findAllById(List.of(1, 2))).thenReturn(List.of(userPost1, userPost2));

        // Mock posts and topics for rule2
        PostTopic pt3 = new PostTopic();
        pt3.setPostId(3);
        PostTopic pt4 = new PostTopic();
        pt4.setPostId(4);

        when(postTopicRepository.findByTopicId(200)).thenReturn(List.of(pt3, pt4));

        BotPost botPost1 = new BotPost();
        botPost1.setId(3);
        BotPost botPost2 = new BotPost();
        botPost2.setId(4);

        when(postRepository.findAllById(List.of(3, 4))).thenReturn(List.of(botPost1, botPost2));

        // Generate feed
        List<Post> feed = feedPresetService.generateFeedForPreset(presetId);

        // The feed should contain posts from both rules filtered by sourceType and percentage
        // rule1: all user posts (2 posts)
        // rule2: 50% of bot posts (2 * 50% = 1 post)
        assertTrue(feed.contains(userPost1));
        assertTrue(feed.contains(userPost2));
        assertTrue(feed.contains(botPost1) || feed.contains(botPost2));
        assertEquals(3, feed.size()); // 2 user + 1 bot due to percentage limit
    }

    @Test
    public void testGenerateFeedForPreset_WithSpecificUserIdFilter() {
        int presetId = 2;

        PresetRule rule = new PresetRule();
        rule.setPresetId(presetId);
        rule.setTopicId(300);
        rule.setSourceType("user");
        rule.setSpecificUserId(42);
        rule.setPercentage(100);

        when(ruleRepo.findByPresetId(presetId)).thenReturn(List.of(rule));

        PostTopic pt = new PostTopic();
        pt.setPostId(10);
        when(postTopicRepository.findByTopicId(300)).thenReturn(List.of(pt));

        AppUser user42 = new AppUser();
        user42.setId(42);

        UserPost userPost = new UserPost();
        userPost.setId(10);
        userPost.setUser(user42);

        when(postRepository.findAllById(List.of(10))).thenReturn(List.of(userPost));

        List<Post> feed = feedPresetService.generateFeedForPreset(presetId);

        assertEquals(1, feed.size());
        assertEquals(userPost, feed.get(0));
    }
}
