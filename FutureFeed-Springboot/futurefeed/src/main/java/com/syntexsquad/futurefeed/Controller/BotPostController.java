package com.syntexsquad.futurefeed.Controller;

import com.syntexsquad.futurefeed.dto.BotPostDTO;
import com.syntexsquad.futurefeed.service.BotPostService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bot-posts")
public class BotPostController {

    @Autowired
    private BotPostService botPostService;

    @PostMapping("/link")
    public ResponseEntity<BotPostDTO> linkBotToPost(@RequestParam Integer botId, @RequestParam Integer postId) {
        return ResponseEntity.ok(botPostService.linkBotToPost(botId, postId));
    }

    @GetMapping("/by-bot/{botId}")
    public ResponseEntity<List<BotPostDTO>> getPostsByBot(@PathVariable Integer botId) {
        return ResponseEntity.ok(botPostService.getPostsByBot(botId));
    }
}
