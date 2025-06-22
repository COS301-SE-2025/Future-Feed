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
    
}
