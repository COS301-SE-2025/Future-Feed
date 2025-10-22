package com.syntexsquad.futurefeed.Controller;

import com.syntexsquad.futurefeed.dto.PostDTO;
import com.syntexsquad.futurefeed.mapper.PostViewMapper;
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
    private final PostViewMapper postViewMapper;

    public CommentController(CommentService commentService, PostViewMapper postViewMapper) {
        this.commentService = commentService;
        this.postViewMapper = postViewMapper;
    }

    @PostMapping("/{postId}")
    public ResponseEntity<?> addComment(@PathVariable Integer postId, @RequestBody String content) {
        if (content == null || content.trim().isEmpty())
            return ResponseEntity.badRequest().body("Content cannot be empty");
        try {
            Comment saved = commentService.addComment(postId, content.trim());
            return ResponseEntity.ok(saved);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/post/{postId}")
    public ResponseEntity<List<Comment>> getCommentsByPost(@PathVariable Integer postId) {
        return ResponseEntity.ok()
                .cacheControl(CacheControl.noStore())
                .body(commentService.getCommentsForPost(postId));
    }

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

    @GetMapping("/my-comments")
    public ResponseEntity<List<PostDTO>> getMyCommentedPosts() {
        try {
            List<Post> posts = commentService.getCommentedPosts();
            return ResponseEntity.ok(postViewMapper.toDtoList(posts));
        } catch (RuntimeException e) {
            return ResponseEntity.status(401).build();
        }
    }

    @GetMapping("/my-comments/{userId}")
    public ResponseEntity<List<PostDTO>> getCommentedPosts(@PathVariable Integer userId) {
        return ResponseEntity.ok(postViewMapper.toDtoList(commentService.getPostsCommentedByUser(userId)));
    }
}
