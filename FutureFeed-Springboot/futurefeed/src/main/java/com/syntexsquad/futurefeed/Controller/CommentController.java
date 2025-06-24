package com.syntexsquad.futurefeed.Controller;

import com.syntexsquad.futurefeed.model.Comment;
import com.syntexsquad.futurefeed.service.CommentService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/comments")
public class CommentController {

    private final CommentService commentService;

    public CommentController(CommentService commentService) {
        this.commentService = commentService;
    }

    @PostMapping("/{postId}")
    public ResponseEntity<?> addComment(
            @PathVariable Integer postId,
            @RequestBody String content
    ) {
        if (content == null || content.trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Content cannot be empty");
        }

        try {
            Comment saved = commentService.addComment(postId, content.trim());
            return ResponseEntity.ok(saved);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/post/{postId}")
    public ResponseEntity<List<Comment>> getCommentsByPost(@PathVariable Integer postId) {
        return ResponseEntity.ok(commentService.getCommentsForPost(postId));
    }
}
