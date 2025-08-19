package com.syntexsquad.futurefeed.Controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.syntexsquad.futurefeed.dto.PostRequest;
import com.syntexsquad.futurefeed.model.Post;
import com.syntexsquad.futurefeed.service.MediaService;
import com.syntexsquad.futurefeed.service.PostService;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/posts")
public class PostController {

    private final PostService postService;
    private final MediaService mediaService;
    private final ObjectMapper objectMapper;

    public PostController(PostService postService, MediaService mediaService, ObjectMapper objectMapper) {
        this.postService = postService;
        this.mediaService = mediaService;
        this.objectMapper = objectMapper;
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getPostById(@PathVariable Integer id) {
        try {
            Post post = postService.getPostById(id);
            return ResponseEntity.ok(post);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Error: " + e.getMessage());
        }
    }

    // Raw JSON post (no media)
    @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> createPostJson(@RequestBody PostRequest postRequest) {
        return createPostInternal(postRequest, null);
    }

    // Multipart post (media + JSON string)
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> createPostMultipart(
            @RequestPart("post") String postJson,
            @RequestPart(value = "media", required = false) MultipartFile mediaFile) {

        try {
            PostRequest postRequest = objectMapper.readValue(postJson, PostRequest.class);
            return createPostInternal(postRequest, mediaFile);
        } catch (IOException e) {
            return ResponseEntity.badRequest().body("Invalid JSON in 'post': " + e.getMessage());
        }
    }

    private ResponseEntity<?> createPostInternal(PostRequest postRequest, MultipartFile file) {
        if (postRequest.getContent() == null || postRequest.getContent().trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Content must not be null or empty");
        }
        try {
            if (file != null && !file.isEmpty()) {
                String mediaUrl = mediaService.uploadFile(file);
                postRequest.setImageUrl(mediaUrl);
            }

            Post post = postService.createPost(postRequest);
            return ResponseEntity.ok(post);
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Media upload failed: " + e.getMessage());
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

    @GetMapping
    public ResponseEntity<List<Post>> getAllPosts() {
        return ResponseEntity.ok(postService.getAllPosts());
    }

    @GetMapping("/paginated")
    public ResponseEntity<Page<Post>> getPaginatedPosts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(postService.getPaginatedPosts(page, size));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Post>> getPostsByUser(@PathVariable Integer userId) {
        return ResponseEntity.ok(postService.getPostsByUserId(userId));
    }

    @GetMapping("/liked/{userId}")
    public ResponseEntity<List<Post>> getLikedPosts(@PathVariable Integer userId) {
        List<Post> likedPosts = postService.getLikedPostsByUserId(userId);
        return ResponseEntity.ok(likedPosts);
    }

    @GetMapping("/commented/{userId}")
    public ResponseEntity<List<Post>> getCommentedPosts(@PathVariable Integer userId) {
        List<Post> posts = postService.getPostsCommentedByUser(userId);
        return ResponseEntity.ok(posts);
    }
}
