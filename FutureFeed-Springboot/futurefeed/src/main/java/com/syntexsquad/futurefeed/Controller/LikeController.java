package com.syntexsquad.futurefeed.Controller;

import com.syntexsquad.futurefeed.dto.LikeRequest;
import com.syntexsquad.futurefeed.service.LikeService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/likes")
public class LikeController {

    private final LikeService likeService;

    public LikeController(LikeService likeService) {
        this.likeService = likeService;
    }

    @PostMapping
    public ResponseEntity<?> likePost(@RequestBody LikeRequest request) {
        boolean liked = likeService.likePost(request.getUserId(), request.getPostId());
        return liked ? ResponseEntity.ok("Post liked") : ResponseEntity.badRequest().body("Already liked");
    }

    @DeleteMapping
    public ResponseEntity<?> unlikePost(@RequestBody LikeRequest request) {
        boolean unliked = likeService.unlikePost(request.getUserId(), request.getPostId());
        return unliked ? ResponseEntity.ok("Post unliked") : ResponseEntity.badRequest().body("Not liked yet");
    }

    @GetMapping("/count/{postId}")
    public ResponseEntity<Long> countLikes(@PathVariable Integer postId) {
        return ResponseEntity.ok(likeService.countLikes(postId));
    }
}
