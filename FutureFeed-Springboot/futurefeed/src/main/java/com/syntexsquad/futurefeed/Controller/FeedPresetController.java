package com.syntexsquad.futurefeed.Controller;

import com.syntexsquad.futurefeed.dto.FeedPresetDTO;
import com.syntexsquad.futurefeed.dto.PresetRuleDTO;
import com.syntexsquad.futurefeed.model.FeedPreset;
import com.syntexsquad.futurefeed.model.PresetRule;
import com.syntexsquad.futurefeed.model.Post;
import com.syntexsquad.futurefeed.service.FeedPresetService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/presets")
public class FeedPresetController {

    private final FeedPresetService presetService;

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

    @GetMapping("/feed/{presetId}")
    public ResponseEntity<?> generateFeed(@PathVariable Integer presetId) {
        try {
            System.out.println("Generating feed for preset: " + presetId);
            List<Post> feed = presetService.generateFeedForPreset(presetId);
            System.out.println("Feed size: " + feed.size());
            return ResponseEntity.ok(feed);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error: " + e.getMessage());
        }
    }

    // --- Update a preset ---
    @PutMapping("/{presetId}")
    public ResponseEntity<FeedPreset> updatePreset(@PathVariable Integer presetId, @RequestBody FeedPresetDTO dto) {
        return ResponseEntity.ok(presetService.updatePreset(presetId, dto));
    }

    // --- Delete a preset ---
    @DeleteMapping("/{presetId}")
    public ResponseEntity<String> deletePreset(@PathVariable Integer presetId) {
        presetService.deletePreset(presetId);
        return ResponseEntity.ok("Preset deleted successfully.");
    }

    // --- Update a rule ---
    @PutMapping("/rules/{ruleId}")
    public ResponseEntity<PresetRule> updateRule(@PathVariable Integer ruleId, @RequestBody PresetRuleDTO dto) {
        return ResponseEntity.ok(presetService.updateRule(ruleId, dto));
    }

    // --- Delete a rule ---
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