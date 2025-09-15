package com.syntexsquad.futurefeed.Controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.syntexsquad.futurefeed.dto.PostDTO;
import com.syntexsquad.futurefeed.dto.PostRequest;
import com.syntexsquad.futurefeed.dto.UserPublicDTO;
import com.syntexsquad.futurefeed.model.AppUser;
import com.syntexsquad.futurefeed.model.Post;
import com.syntexsquad.futurefeed.service.MediaService;
import com.syntexsquad.futurefeed.service.PostService;
import org.springframework.data.domain.Page;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping(value = "/api/posts", produces = MediaType.APPLICATION_JSON_VALUE)
public class PostController {

    private final PostService postService;
    private final MediaService mediaService;
    private final ObjectMapper objectMapper;

    public PostController(PostService postService, MediaService mediaService, ObjectMapper objectMapper) {
        this.postService = postService;
        this.mediaService = mediaService;
        this.objectMapper = objectMapper;
    }

    // inline converters 
    private static UserPublicDTO toUserPublic(AppUser u) {
        if (u == null) return null;
        UserPublicDTO dto = new UserPublicDTO();
        dto.setId(u.getId());
        dto.setUsername(u.getUsername());
        dto.setDisplayName(u.getDisplayName());
        dto.setBio(u.getBio());
        dto.setProfilePictureUrl(u.getProfilePictureUrl());
        return dto;
    }
    private static PostDTO toPostDTO(Post p) {
        PostDTO dto = new PostDTO();
        dto.setId(p.getId());
        dto.setContent(p.getContent());
        dto.setImageUrl(p.getImageUrl());
        dto.setCreatedAt(p.getCreatedAt() != null ? p.getCreatedAt().toString() : null);
        dto.setUser(toUserPublic(p.getUser()));
        return dto;
    }
    private static List<PostDTO> toPostDTOs(Collection<Post> posts) {
        return posts.stream().map(PostController::toPostDTO).collect(Collectors.toList());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getPostById(@PathVariable Integer id) {
        try {
            Post post = postService.getPostById(id);
            return ResponseEntity.ok(toPostDTO(post));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(Map.of("error", "NotFound", "message", e.getMessage()));
        }
    }

    @GetMapping(params = "userId")
    public ResponseEntity<List<PostDTO>> getPostsByUserParam(@RequestParam Integer userId) {
        var posts = postService.getPostsByUserId(userId);
        return ResponseEntity.ok(toPostDTOs(posts));
    }

    @GetMapping
    public ResponseEntity<List<PostDTO>> getAllPosts() {
        return ResponseEntity.ok(toPostDTOs(postService.getAllPosts()));
    }

    @GetMapping("/paginated")
    public ResponseEntity<Map<String, Object>> getPaginatedPosts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Page<Post> pageObj = postService.getPaginatedPosts(page, size);
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("content", toPostDTOs(pageObj.getContent()));
        body.put("page", pageObj.getNumber());
        body.put("size", pageObj.getSize());
        body.put("totalPages", pageObj.getTotalPages());
        body.put("totalElements", pageObj.getTotalElements());
        body.put("last", pageObj.isLast());
        return ResponseEntity.ok(body);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<PostDTO>> getPostsByUser(@PathVariable Integer userId) {
        return ResponseEntity.ok(toPostDTOs(postService.getPostsByUserId(userId)));
    }

    @GetMapping("/liked/{userId}")
    public ResponseEntity<List<PostDTO>> getLikedPosts(@PathVariable Integer userId) {
        return ResponseEntity.ok(toPostDTOs(postService.getLikedPostsByUserId(userId)));
    }

    @GetMapping("/commented/{userId}")
    public ResponseEntity<List<PostDTO>> getCommentedPosts(@PathVariable Integer userId) {
        return ResponseEntity.ok(toPostDTOs(postService.getPostsCommentedByUser(userId)));
    }

    @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> createPostJson(@RequestBody PostRequest postRequest) {
        return createPostInternal(postRequest, null);
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> createPostMultipart(
            @RequestPart("post") String postJson,
            @RequestPart(value = "media", required = false) MultipartFile mediaFile) {

        try {
            PostRequest postRequest = objectMapper.readValue(postJson, PostRequest.class);
            return createPostInternal(postRequest, mediaFile);
        } catch (IOException e) {
            return ResponseEntity.badRequest()
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(Map.of("error", "BadRequest", "message", "Invalid JSON in 'post': " + e.getMessage()));
        }
    }

    private ResponseEntity<?> createPostInternal(PostRequest postRequest, MultipartFile file) {
        if (postRequest.getContent() == null || postRequest.getContent().trim().isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .contentType(MediaType.TEXT_PLAIN)
                    .body("Content must not be null or empty");
        }
        try {
            if (file != null && !file.isEmpty()) {
                String mediaUrl = mediaService.uploadFile(file);
                postRequest.setImageUrl(mediaUrl);
            }
            Post post = postService.createPost(postRequest);
            return ResponseEntity.ok(toPostDTO(post));
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(Map.of("error", "UploadFailed", "message", e.getMessage()));
        } catch (RuntimeException ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .contentType(MediaType.TEXT_PLAIN)
                    .body("Server error: " + ex.getMessage());
        }
    }

    @DeleteMapping("/del/{id}")
    public ResponseEntity<?> deletePost(@PathVariable Integer id) {
        try {
            boolean deleted = postService.deletePost(id);
            if (deleted) {
                return ResponseEntity.ok()
                        .contentType(MediaType.TEXT_PLAIN)
                        .body("Post deleted successfully");
            }
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .contentType(MediaType.TEXT_PLAIN)
                    .body("Post not found");
        } catch (RuntimeException ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .contentType(MediaType.TEXT_PLAIN)
                    .body("Server error: " + ex.getMessage());
        }
    }

    @GetMapping("/search")
    public ResponseEntity<?> searchPosts(@RequestParam("keyword") String keyword) {
        try {
            var results = postService.searchPosts(keyword);
            return ResponseEntity.ok(toPostDTOs(results));
        } catch (RuntimeException ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(Map.of("error", "SearchError", "message", ex.getMessage()));
        }
    }
}
