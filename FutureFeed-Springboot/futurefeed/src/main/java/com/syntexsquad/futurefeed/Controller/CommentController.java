package com.syntexsquad.futurefeed.Controller;

import com.syntexsquad.futurefeed.model.Comment;
import com.syntexsquad.futurefeed.model.Post;
import com.syntexsquad.futurefeed.service.CommentService;
import org.springframework.http.CacheControl;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/comments")
public class CommentController {

    private final CommentService commentService;
    public CommentController(CommentService commentService) { this.commentService = commentService; }

    @PostMapping("/{postId}")
    public ResponseEntity<?> addComment(@PathVariable Integer postId, @RequestBody String content) {
        if (content == null || content.trim().isEmpty()) return ResponseEntity.badRequest().body("Content cannot be empty");
        try {
            Comment saved = commentService.addComment(postId, content.trim());
            return ResponseEntity.ok(saved);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // Canonical GET (returns List<Comment> so your existing tests and clients keep working)
    @GetMapping("/post/{postId}")
    public ResponseEntity<List<Comment>> getCommentsByPost(@PathVariable Integer postId) {
        return ResponseEntity.ok()
                .cacheControl(CacheControl.noStore())
                .body(commentService.getCommentsForPost(postId));
    }

    // Alias so GET /api/comments/{postId} works too
    @GetMapping("/{postId}")
    public ResponseEntity<List<Comment>> getCommentsByPostAlias(@PathVariable Integer postId) {
        return getCommentsByPost(postId);
    }

    @GetMapping("/has-commented/{postId}")
    public ResponseEntity<?> hasUserCommented(@PathVariable Integer postId) {
        try {
            boolean hasCommented = commentService.hasUserCommented(postId);
            return ResponseEntity.ok(hasCommented);
        } catch (RuntimeException e) {
            return ResponseEntity.status(401).body("Unauthorized or user not found");
        }
    }

    @GetMapping("/my-comments/{userId}")
    public ResponseEntity<List<Post>> getCommentedPosts(@PathVariable Integer userId) {
        return ResponseEntity.ok(commentService.getPostsCommentedByUser(userId));
    }
}
