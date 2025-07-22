package com.syntexsquad.futurefeed.Controller;

import com.syntexsquad.futurefeed.model.BotPosts;
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
    public ResponseEntity<BotPosts> linkBotToPost(@RequestParam Integer botId, @RequestParam Integer postId) {
        BotPosts botPost = botPostService.linkBotToPost(botId, postId);
        return ResponseEntity.ok(botPost);
    }

    @GetMapping("/by-bot/{botId}")
    public ResponseEntity<List<BotPosts>> getPostsByBot(@PathVariable Integer botId) {
        return ResponseEntity.ok(botPostService.getPostsByBot(botId));
    }
}
