package com.syntexsquad.futurefeed.Controller;
import com.syntexsquad.futurefeed.model.FeedPreset;
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
    @PostMapping("/create/{userId}")
    public ResponseEntity<FeedPreset> createPreset(@PathVariable Long userId, @RequestBody FeedPreset preset) {
        return ResponseEntity.ok(presetService.createPreset(userId, preset));
    }
    @GetMapping("/get/{userId}")
    public ResponseEntity<List<FeedPreset>> getUserPresets(@PathVariable Long userId) {
        return ResponseEntity.ok(presetService.getPresetsForUser(userId));
    }
    @PostMapping("/{userId}/{presetId}/activate")
    public ResponseEntity<String> activateFeedPreset(@PathVariable Long userId, @PathVariable Long presetId) {
        if (presetService.activatePreset(presetId, userId)) {
            return ResponseEntity.ok("Preset activated.");
        }
        return ResponseEntity.notFound().build();
    }
    @PostMapping("/{userId}/{presetId}/deactivate")
    public ResponseEntity<String> deactivateFeedPreset(@PathVariable Long userId, @PathVariable Long presetId) {
        if (presetService.deactivatePreset(presetId, userId)) {
            return ResponseEntity.ok("Preset deactivated.");
        }
        return ResponseEntity.notFound().build();
    }
}
