package com.syntexsquad.futurefeed;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.syntexsquad.futurefeed.dto.FeedPresetDTO;
import com.syntexsquad.futurefeed.dto.PresetRuleDTO;
import com.syntexsquad.futurefeed.model.AppUser;
import com.syntexsquad.futurefeed.model.FeedPreset;
import com.syntexsquad.futurefeed.model.PresetRule;
import com.syntexsquad.futurefeed.repository.*;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;
import java.util.Map;
import java.util.Set;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(properties = {
        "spring.datasource.url=jdbc:h2:mem:testdb;DB_CLOSE_DELAY=-1",
        "spring.datasource.driverClassName=org.h2.Driver",
        "spring.datasource.username=sa",
        "spring.datasource.password=",
        "spring.jpa.hibernate.ddl-auto=create-drop"
})
@ActiveProfiles("test")
@AutoConfigureMockMvc
//@Transactional
public class FeedPresetControllerIT {

    @Autowired private MockMvc mockMvc;
    @Autowired private FeedPresetRepository presetRepo;
    @Autowired private PresetRuleRepository ruleRepo;
    @Autowired private AppUserRepository userRepo;
    @Autowired private FollowerRepository followerRepo;
    @Autowired private PostRepository postRepo;
    @Autowired private PostTopicRepository postTopicRepo;
    @Autowired private CommentRepository commentRepo;
    @Autowired private ReshareRepository reshareRepo;
    @Autowired private LikeRepository likeRepo;
    @Autowired private BookmarkRepository bookmarkRepo;
    @Autowired private BotPostRepository botPostRepo;
    @Autowired private BotRepository botRepo;
    @Autowired private ObjectMapper objectMapper;

    private AppUser testUser;

    @BeforeEach
    public void setup() {
        // Delete everything in FK-safe order
        ruleRepo.deleteAll();
        presetRepo.deleteAll();
        reshareRepo.deleteAll();
        commentRepo.deleteAll();
        likeRepo.deleteAll();
        bookmarkRepo.deleteAll();
        botPostRepo.deleteAll();
        postTopicRepo.deleteAll();
        postRepo.deleteAll();
        followerRepo.deleteAll();
        botRepo.deleteAll();
        //userRepo.deleteAll();

        // Recreate test user
        testUser = userRepo.findByUsername("testuser")
            .orElseGet(() -> {
                AppUser u = new AppUser();
                u.setUsername("testuser");
                u.setEmail("testuser@example.com");
                u.setPassword("test123");
                u.setDisplayName("Test User");
                u.setBio("Test bio");
                u.setDateOfBirth(LocalDate.of(2000, 1, 1));
                return userRepo.save(u);
            });

        // Mock login
        Map<String, Object> attributes = Map.of("email", testUser.getEmail());
        OAuth2User oAuth2User = new DefaultOAuth2User(
                Set.of(new SimpleGrantedAuthority("ROLE_USER")),
                attributes,
                "email"
        );
        OAuth2AuthenticationToken auth = new OAuth2AuthenticationToken(
                oAuth2User,
                oAuth2User.getAuthorities(),
                "google"
        );
        SecurityContextHolder.getContext().setAuthentication(auth);
    }

    @Test
    public void testCreatePreset() throws Exception {
        FeedPresetDTO dto = new FeedPresetDTO();
        dto.setName("MyPreset");
        dto.setDefaultPreset(true);

        mockMvc.perform(post("/api/presets")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("MyPreset"))
                .andExpect(jsonPath("$.defaultPreset").value(true))
                .andExpect(jsonPath("$.userId").value(testUser.getId()));
    }

    @Test
    public void testGetPresets() throws Exception {
        FeedPreset preset = new FeedPreset();
        preset.setName("ExistingPreset");
        preset.setDefaultPreset(false);
        preset.setUserId(testUser.getId());
        presetRepo.save(preset);

        mockMvc.perform(get("/api/presets"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].name").value("ExistingPreset"))
                .andExpect(jsonPath("$[0].userId").value(testUser.getId()));
    }

    @Test
    public void testCreateRule() throws Exception {
        FeedPreset preset = new FeedPreset();
        preset.setName("RulePreset");
        preset.setDefaultPreset(false);
        preset.setUserId(testUser.getId());
        preset = presetRepo.save(preset);

        PresetRuleDTO ruleDto = new PresetRuleDTO();
        ruleDto.setPresetId(preset.getId());
        ruleDto.setTopicId(null);
        ruleDto.setSourceType("user");
        ruleDto.setSpecificUserId(testUser.getId());
        ruleDto.setPercentage(50);

        mockMvc.perform(post("/api/presets/rules")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(ruleDto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.presetId").value(preset.getId()))
                .andExpect(jsonPath("$.sourceType").value("user"))
                .andExpect(jsonPath("$.specificUserId").value(testUser.getId()))
                .andExpect(jsonPath("$.percentage").value(50));
    }

    @Test
    public void testGetRules() throws Exception {
        FeedPreset preset = new FeedPreset();
        preset.setName("PresetForRules");
        preset.setDefaultPreset(false);
        preset.setUserId(testUser.getId());
        preset = presetRepo.save(preset);

        PresetRule rule = new PresetRule();
        rule.setPresetId(preset.getId());
        rule.setSourceType("bot");
        rule.setPercentage(100);
        ruleRepo.save(rule);

        mockMvc.perform(get("/api/presets/rules/" + preset.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].presetId").value(preset.getId()))
                .andExpect(jsonPath("$[0].sourceType").value("bot"))
                .andExpect(jsonPath("$[0].percentage").value(100));
    }

    @Test
    public void testGenerateFeed() throws Exception {
        FeedPreset preset = new FeedPreset();
        preset.setName("FeedPreset");
        preset.setDefaultPreset(false);
        preset.setUserId(testUser.getId());
        preset = presetRepo.save(preset);

        PresetRule rule = new PresetRule();
        rule.setPresetId(preset.getId());
        rule.setSourceType("user");
        rule.setPercentage(100);
        ruleRepo.save(rule);

        mockMvc.perform(get("/api/presets/feed/" + preset.getId()))
                .andExpect(status().isOk());
    }
}
