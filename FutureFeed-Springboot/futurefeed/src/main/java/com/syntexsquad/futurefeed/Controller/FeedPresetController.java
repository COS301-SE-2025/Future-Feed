package com.syntexsquad.futurefeed.Controller;

import com.syntexsquad.futurefeed.dto.FeedPresetDTO;
import com.syntexsquad.futurefeed.dto.PostDTO;
import com.syntexsquad.futurefeed.dto.PresetRuleDTO;
import com.syntexsquad.futurefeed.mapper.PostViewMapper;
import com.syntexsquad.futurefeed.model.FeedPreset;
import com.syntexsquad.futurefeed.model.PresetRule;
import com.syntexsquad.futurefeed.model.Post;
import com.syntexsquad.futurefeed.service.FeedPresetService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/presets")
public class FeedPresetController {

    private final FeedPresetService presetService;

    /**
     * Optional field injection keeps the existing single-arg constructor
     * so your @WebMvcTest(controllers=FeedPresetController.class) still works
     * without needing to mock PostViewMapper.
     */
    @Autowired(required = false)
    private PostViewMapper postViewMapper;

    public FeedPresetController(FeedPresetService presetService) {
        this.presetService = presetService;
    }

    @PostMapping
    public ResponseEntity<FeedPreset> createPreset(@RequestBody FeedPresetDTO dto) {
        return ResponseEntity.ok(presetService.createPreset(dto));
    }

    @GetMapping
    public ResponseEntity<List<FeedPreset>> getPresets() {
        return ResponseEntity.ok(presetService.getUserPresets());
    }

    @PostMapping("/rules")
    public ResponseEntity<PresetRule> createRule(@RequestBody PresetRuleDTO dto) {
        return ResponseEntity.ok(presetService.createRule(dto));
    }

    @GetMapping("/rules/{presetId}")
    public ResponseEntity<List<PresetRule>> getRules(@PathVariable Integer presetId) {
        return ResponseEntity.ok(presetService.getRulesForPreset(presetId));
    }

    /**
     * UNCHANGED: legacy endpoint used by your tests.
     * Returns List<Post> (entities), not DTOs.
     */
    @GetMapping("/feed/{presetId}")
    public ResponseEntity<?> generateFeed(@PathVariable Integer presetId) {
        try {
            List<Post> feed = presetService.generateFeedForPreset(presetId);
            return ResponseEntity.ok(feed);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error: " + e.getMessage());
        }
    }

    /**
     * NEW: paginated + mapped endpoint.
     * Returns page object with List<PostDTO> in "content".
     * Does not interfere with existing tests.
     */
    @GetMapping("/feed/{presetId}/paginated")
    public ResponseEntity<Map<String, Object>> generateFeedPaginated(
            @PathVariable Integer presetId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        try {
            Page<Post> pageObj = presetService.generateFeedForPreset(presetId, page, size);

            List<PostDTO> content;
            if (postViewMapper != null) {
                content = postViewMapper.toDtoList(pageObj.getContent());
            } else {
                // Fallback for environments without mapper bean
                content = pageObj.getContent().stream().map(p -> {
                    PostDTO dto = new PostDTO();
                    dto.setId(p.getId());
                    dto.setContent(p.getContent());
                    dto.setImageUrl(p.getImageUrl());
                    dto.setCreatedAt(p.getCreatedAt() == null ? null : p.getCreatedAt().toString());
                    dto.setIsBot("BOT".equalsIgnoreCase(p.getPostType()));
                    return dto;
                }).toList();
            }

            Map<String, Object> body = new LinkedHashMap<>();
            body.put("content", content);
            body.put("page", pageObj.getNumber());
            body.put("size", pageObj.getSize());
            body.put("totalPages", pageObj.getTotalPages());
            body.put("totalElements", pageObj.getTotalElements());
            body.put("last", pageObj.isLast());

            return ResponseEntity.ok(body);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{presetId}")
    public ResponseEntity<FeedPreset> updatePreset(@PathVariable Integer presetId, @RequestBody FeedPresetDTO dto) {
        return ResponseEntity.ok(presetService.updatePreset(presetId, dto));
    }

    @DeleteMapping("/{presetId}")
    public ResponseEntity<String> deletePreset(@PathVariable Integer presetId) {
        presetService.deletePreset(presetId);
        return ResponseEntity.ok("Preset deleted successfully.");
    }

    @PutMapping("/rules/{ruleId}")
    public ResponseEntity<PresetRule> updateRule(@PathVariable Integer ruleId, @RequestBody PresetRuleDTO dto) {
        return ResponseEntity.ok(presetService.updateRule(ruleId, dto));
    }

    @DeleteMapping("/rules/{ruleId}")
    public ResponseEntity<String> deleteRule(@PathVariable Integer ruleId) {
        presetService.deleteRule(ruleId);
        return ResponseEntity.ok("Rule deleted successfully.");
    }

    @PutMapping("/{presetId}/default")
    public ResponseEntity<String> setDefaultPreset(@PathVariable Integer presetId) {
        presetService.setDefaultPreset(presetId);
        return ResponseEntity.ok("Preset set as default.");
    }

    @GetMapping("/default")
    public ResponseEntity<FeedPreset> getDefaultPreset() {
        FeedPreset defaultPreset = presetService.getDefaultPreset();
        return ResponseEntity.ok(defaultPreset);
    }
}
