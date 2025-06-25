package com.syntexsquad.futurefeed;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.syntexsquad.futurefeed.Controller.FeedPresetController;
import com.syntexsquad.futurefeed.config.SecurityConfig;
import com.syntexsquad.futurefeed.dto.FeedPresetDTO;
import com.syntexsquad.futurefeed.dto.PresetRuleDTO;
import com.syntexsquad.futurefeed.model.FeedPreset;
import com.syntexsquad.futurefeed.model.PresetRule;
import com.syntexsquad.futurefeed.model.UserPost;
import com.syntexsquad.futurefeed.model.Post;
import com.syntexsquad.futurefeed.service.CustomOAuth2UserService;
import com.syntexsquad.futurefeed.service.FeedPresetService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;
import java.util.ArrayList;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(controllers = FeedPresetController.class)
@Import(SecurityConfig.class)
public class FeedPresetControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private FeedPresetService feedPresetService;

    @MockBean
    private CustomOAuth2UserService customOAuth2UserService;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @WithMockUser
    public void createPreset_ShouldReturnCreatedPreset() throws Exception {
        FeedPresetDTO dto = new FeedPresetDTO();
        dto.setName("Test Preset");
        dto.setDefaultPreset(false);

        FeedPreset preset = new FeedPreset();
        preset.setId(1);
        preset.setName("Test Preset");
        preset.setDefaultPreset(false);

        when(feedPresetService.createPreset(any(FeedPresetDTO.class))).thenReturn(preset);

        mockMvc.perform(post("/api/presets")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.name").value("Test Preset"));
    }

    @Test
    @WithMockUser
    public void getPresets_ShouldReturnPresetList() throws Exception {
        FeedPreset preset = new FeedPreset();
        preset.setId(1);
        preset.setName("Preset One");

        when(feedPresetService.getUserPresets()).thenReturn(List.of(preset));

        mockMvc.perform(get("/api/presets"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(1))
                .andExpect(jsonPath("$[0].name").value("Preset One"));
    }

    @Test
    @WithMockUser
    public void createRule_ShouldReturnCreatedRule() throws Exception {
        PresetRuleDTO dto = new PresetRuleDTO();
        dto.setPresetId(1);
        dto.setTopicId(2);
        dto.setSourceType("user");
        dto.setSpecificUserId(5);
        dto.setPercentage(50);

        PresetRule rule = new PresetRule();
        rule.setId(10);
        rule.setPresetId(1);
        rule.setTopicId(2);
        rule.setSourceType("user");
        rule.setSpecificUserId(5);
        rule.setPercentage(50);

        when(feedPresetService.createRule(any(PresetRuleDTO.class))).thenReturn(rule);

        mockMvc.perform(post("/api/presets/rules")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(10))
                .andExpect(jsonPath("$.presetId").value(1));
    }

    @Test
    @WithMockUser
    public void getRules_ShouldReturnRulesList() throws Exception {
        PresetRule rule = new PresetRule();
        rule.setId(11);
        rule.setPresetId(1);

        when(feedPresetService.getRulesForPreset(1)).thenReturn(List.of(rule));

        mockMvc.perform(get("/api/presets/rules/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(11))
                .andExpect(jsonPath("$[0].presetId").value(1));
    }

    @Test
    @WithMockUser
    public void generateFeed_ShouldReturnPosts() throws Exception {
        UserPost post = new UserPost();
        post.setId(100);
        post.setContent("Hello feed");

        when(feedPresetService.generateFeedForPreset(1)).thenReturn(List.of(post));

        mockMvc.perform(get("/api/presets/feed/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(100))
                .andExpect(jsonPath("$[0].content").value("Hello feed"));
    }

    @Test
    @WithMockUser
    public void generateFeed_ShouldReturnErrorOnException() throws Exception {
        when(feedPresetService.generateFeedForPreset(999)).thenThrow(new RuntimeException("Preset not found"));

        mockMvc.perform(get("/api/presets/feed/999"))
                .andExpect(status().isInternalServerError())
                .andExpect(content().string(org.hamcrest.Matchers.containsString("Error: Preset not found")));
    }
}
