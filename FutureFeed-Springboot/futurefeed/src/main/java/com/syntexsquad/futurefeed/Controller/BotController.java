package com.syntexsquad.futurefeed.Controller;

import com.syntexsquad.futurefeed.dto.BotRequestDTO;
import com.syntexsquad.futurefeed.dto.BotResponseDTO;
import com.syntexsquad.futurefeed.service.BotExecutionService;
import com.syntexsquad.futurefeed.service.BotService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/bots")
public class BotController {

    private final BotService botService;
    private final BotExecutionService botExecutionService;

    @Autowired
    public BotController(BotService botService, BotExecutionService botExecutionService) {
        this.botService = botService;
        this.botExecutionService = botExecutionService;
    }

    @PostMapping
    public ResponseEntity<BotResponseDTO> createBot(@RequestBody BotRequestDTO dto) {
        BotResponseDTO response = botService.createBot(dto);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/my")
    public ResponseEntity<List<BotResponseDTO>> getMyBots() {
        List<BotResponseDTO> bots = botService.getMyBots();
        return ResponseEntity.ok(bots);
    }

    @GetMapping("/{botId}/execute")
    public ResponseEntity<?> executeBot(@PathVariable Integer botId) {
        try {
            String output = botExecutionService.executeBot(botId);
            return ResponseEntity.ok(Map.of("output", output));
        } catch (RuntimeException e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }
}
