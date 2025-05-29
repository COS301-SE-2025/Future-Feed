package com.syntexsquad.futurefeed.Controller;

import com.syntexsquad.futurefeed.dto.PostRequest;
import com.syntexsquad.futurefeed.model.Post;
import com.syntexsquad.futurefeed.service.PostService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/posts")
public class PostController {

    private final PostService postService;

    public PostController(PostService postService) {
        this.postService = postService;
    }

    @PostMapping
    public ResponseEntity<?> createPost(@RequestBody PostRequest postRequest) {
        if (postRequest.getContent() == null || postRequest.getContent().trim().isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Content must not be null or empty");
        }

        try {
            Post post = postService.createPost(postRequest);
            return ResponseEntity.ok(post);
        } catch (RuntimeException ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Server error: " + ex.getMessage());
        }
    }

    @DeleteMapping("/del/{id}")
    public ResponseEntity<?> deletePost(@PathVariable Integer id) {
        try {
            boolean deleted = postService.deletePost(id);
            if (deleted) {
                return ResponseEntity.ok("Post deleted successfully");
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Post not found");
            }
        } catch (RuntimeException ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Server error: " + ex.getMessage());
        }
    }

    @GetMapping("/search")
    public ResponseEntity<?> searchPosts(@RequestParam("keyword") String keyword) {
        try {
            List<Post> results = postService.searchPosts(keyword);
            return ResponseEntity.ok(results);
        } catch (RuntimeException ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Search error: " + ex.getMessage());
        }
    }
}
