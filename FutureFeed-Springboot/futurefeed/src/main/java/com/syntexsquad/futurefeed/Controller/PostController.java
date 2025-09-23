package com.syntexsquad.futurefeed.Controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.syntexsquad.futurefeed.dto.PostDTO;
import com.syntexsquad.futurefeed.dto.PostRequest;
import com.syntexsquad.futurefeed.dto.UserPublicDTO;
import com.syntexsquad.futurefeed.model.AppUser;
import com.syntexsquad.futurefeed.model.Post;
import com.syntexsquad.futurefeed.service.MediaService;
import com.syntexsquad.futurefeed.service.PostService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestClientResponseException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.io.*;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping(value = "/api/posts", produces = MediaType.APPLICATION_JSON_VALUE)
public class PostController {

    private final PostService postService;
    private final MediaService mediaService;
    private final ObjectMapper objectMapper;

    // FastAPI base URL for image generation (can override via properties or env)
    @Value("${fastapi.base-url:http://localhost:8000}")
    private String fastapiBaseUrl;

    public PostController(PostService postService,
                          MediaService mediaService,
                          ObjectMapper objectMapper) {
        this.postService = postService;
        this.mediaService = mediaService;
        this.objectMapper = objectMapper;
    }

    // ---------- DTO helpers ----------

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

    // ---------- Endpoints ----------

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

    // Keep support for query param "userId"
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

    // JSON create (no file part)
    @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> createPostJson(@RequestBody PostRequest postRequest) {
        return createPostInternal(postRequest, null);
    }

    // Multipart create (file upload optional)
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

    // ---------- Core create logic (upload OR image-gen) ----------

    private ResponseEntity<?> createPostInternal(PostRequest postRequest, MultipartFile file) {
        if (postRequest.getContent() == null || postRequest.getContent().trim().isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .contentType(MediaType.TEXT_PLAIN)
                    .body("Content must not be null or empty");
        }
        try {
            // 1) If client uploaded a file, it wins (backward compatible)
            if (file != null && !file.isEmpty()) {
                String mediaUrl = mediaService.uploadFile(file);
                postRequest.setImageUrl(mediaUrl);
            }
            // 2) Otherwise, if an imagePrompt is provided, generate and upload a PNG
            else if (hasText(postRequest.getImagePrompt())) {
                String b64 = callImageGen(
                        postRequest.getImagePrompt(),
                        postRequest.getImageWidth(),
                        postRequest.getImageHeight(),
                        postRequest.getImageSteps(),
                        postRequest.getImageModel()
                );
                // Wrap bytes as MultipartFile and reuse existing mediaService
                byte[] png = Base64.getDecoder().decode(b64);
                MultipartFile genFile = new BytesMultipartFile(
                        "media",
                        "generated.png",
                        "image/png",
                        png
                );
                String mediaUrl = mediaService.uploadFile(genFile);
                postRequest.setImageUrl(mediaUrl);
            }

            // 3) Persist post (with or without imageUrl)
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

    private boolean hasText(String s) {
        return s != null && !s.trim().isEmpty();
    }

    /**
     * Calls FastAPI /generate-image and returns base64 PNG string.
     * No extra Spring beans are required here.
     */
    private String callImageGen(String prompt,
                                Integer width,
                                Integer height,
                                Integer steps,
                                String model) {

        try {
            String url = fastapiBaseUrl + "/generate-image";

            Map<String, Object> body = new LinkedHashMap<>();
            body.put("prompt", prompt);
            body.put("width", width == null ? 1024 : width);
            body.put("height", height == null ? 1024 : height);
            body.put("steps", steps);      // may be null; backend clamps for FLUX.1 schnell
            body.put("model", model);      // may be null; backend default applies
            body.put("safe_check", true);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            String json = objectMapper.writeValueAsString(body);
            HttpEntity<String> entity = new HttpEntity<>(json, headers);

            RestTemplate rt = new RestTemplate();
            ResponseEntity<String> resp = rt.exchange(url, HttpMethod.POST, entity, String.class);

            if (!resp.getStatusCode().is2xxSuccessful() || resp.getBody() == null) {
                throw new RuntimeException("Image service error: " + resp.getStatusCode());
            }
            JsonNode root = objectMapper.readTree(resp.getBody());
            JsonNode b64Node = root.get("b64");
            if (b64Node == null || b64Node.isNull() || b64Node.asText().isBlank()) {
                throw new RuntimeException("Image service returned no 'b64'");
            }
            return b64Node.asText();

        } catch (RestClientResponseException e) {
            throw new RuntimeException("Image service " + e.getRawStatusCode() + ": " + e.getResponseBodyAsString(), e);
        } catch (Exception e) {
            throw new RuntimeException("Image generation failed: " + e.getMessage(), e);
        }
    }

    // ---------- Minimal MultipartFile adapter for raw bytes (no spring-test needed) ----------

    private static class BytesMultipartFile implements MultipartFile {
        private final String name;
        private final String originalFilename;
        private final String contentType;
        private final byte[] bytes;

        BytesMultipartFile(String name, String originalFilename, String contentType, byte[] bytes) {
            this.name = name;
            this.originalFilename = originalFilename;
            this.contentType = contentType;
            this.bytes = bytes != null ? bytes : new byte[0];
        }

        @Override public String getName() { return name; }
        @Override public String getOriginalFilename() { return originalFilename; }
        @Override public String getContentType() { return contentType; }
        @Override public boolean isEmpty() { return bytes.length == 0; }
        @Override public long getSize() { return bytes.length; }
        @Override public byte[] getBytes() { return bytes; }
        @Override public InputStream getInputStream() { return new ByteArrayInputStream(bytes); }
        @Override public void transferTo(File dest) throws IOException, IllegalStateException {
            try (FileOutputStream fos = new FileOutputStream(dest)) {
                fos.write(bytes);
            }
        }
    }
}
