package com.syntexsquad.futurefeed.Controller;

import com.syntexsquad.futurefeed.dto.PostDTO;
import com.syntexsquad.futurefeed.mapper.PostViewMapper;
import com.syntexsquad.futurefeed.model.Post;
import com.syntexsquad.futurefeed.service.LikeService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/likes")
public class LikeController {

    private final LikeService likeService;
    private final PostViewMapper postViewMapper;

    public LikeController(LikeService likeService, PostViewMapper postViewMapper) {
        this.likeService = likeService;
        this.postViewMapper = postViewMapper;
    }

    @PostMapping("/{postId}")
    public ResponseEntity<?> likePost(@PathVariable Integer postId) {
        try {
            boolean liked = likeService.likePost(postId);
            return liked ? ResponseEntity.ok("Post liked") : ResponseEntity.badRequest().body("Already liked");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error: " + e.getMessage());
        }
    }

    @DeleteMapping("/{postId}")
    public ResponseEntity<?> unlikePost(@PathVariable Integer postId) {
        try {
            boolean unliked = likeService.unlikePost(postId);
            return unliked ? ResponseEntity.ok("Post unliked") : ResponseEntity.badRequest().body("Not liked yet");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error: " + e.getMessage());
        }
    }

    @GetMapping("/has-liked/{postId}")
    public ResponseEntity<?> hasLiked(@PathVariable Integer postId) {
        try {
            boolean hasLiked = likeService.hasUserLikedPost(postId);
            return ResponseEntity.ok(hasLiked);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error: " + e.getMessage());
        }
    }


    @GetMapping("/count/{postId}")
    public ResponseEntity<Long> countLikes(@PathVariable Integer postId) {
        return ResponseEntity.ok(likeService.countLikes(postId));
    }

    @GetMapping("/my-likes/{userId}")
    public ResponseEntity<List<PostDTO>> getLikedPosts(@PathVariable Integer userId) {
            return ResponseEntity.ok(postViewMapper.toDtoList(likeService.getLikedPostsByUserId(userId)));
    }


}
