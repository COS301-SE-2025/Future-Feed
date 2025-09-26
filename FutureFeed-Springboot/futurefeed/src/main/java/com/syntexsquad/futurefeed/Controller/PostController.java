package com.syntexsquad.futurefeed.Controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.syntexsquad.futurefeed.dto.PostDTO;
import com.syntexsquad.futurefeed.dto.PostRequest;
import com.syntexsquad.futurefeed.dto.UserPublicDTO;
import com.syntexsquad.futurefeed.model.AppUser;
import com.syntexsquad.futurefeed.model.Post;
import com.syntexsquad.futurefeed.moderation.ModerationClient;
import com.syntexsquad.futurefeed.moderation.ModerationResult;
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
import java.nio.file.*;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@RestController
@RequestMapping(value = "/api/posts", produces = MediaType.APPLICATION_JSON_VALUE)
public class PostController {

    private final PostService postService;
    private final MediaService mediaService;
    private final ObjectMapper objectMapper;
    /** Optional: will be null in tests unless you provide a bean. */
    private final ModerationClient moderationClient;

    // Reuse FastAPI base URL for image generation only
    @Value("${fastapi.base-url:http://localhost:8000}")
    private String fastapiBaseUrl;

    public PostController(PostService postService,
                          MediaService mediaService,
                          ObjectMapper objectMapper,
                          java.util.Optional<ModerationClient> moderationClient // optional injection
    ) {
        this.postService = postService;
        this.mediaService = mediaService;
        this.objectMapper = objectMapper;
        this.moderationClient = moderationClient.orElse(null);
    }

    // ---------- DTO helpers ----------
    private static UserPublicDTO toUserPublic(AppUser u) {
        if (u == null) return null;
        UserPublicDTO dto = new UserPublicDTO();
        dto.setId(u.getId());
        dto.setUsername(u.getUsername());
        dto.setDisplayName(u.getDisplayName());
        dto.setBio(u.getBio());
        String pic = (u.getProfilePictureUrl() != null && !u.getProfilePictureUrl().isBlank())
                ? u.getProfilePictureUrl()
                : u.getProfilePicture();
        dto.setProfilePictureUrl(pic);
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

    // ---------- URL extract helper ----------
    private static final Pattern URL_RE = Pattern.compile("\\bhttps?://[^\\s)]+", Pattern.CASE_INSENSITIVE);
    private static List<String> extractLinks(String text) {
        if (text == null) return List.of();
        Matcher m = URL_RE.matcher(text);
        List<String> out = new ArrayList<>();
        while (m.find()) out.add(m.group());
        return out;
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
    public ResponseEntity<List<PostDTO>> getPostsCommentedByUser(@PathVariable Integer userId) {
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

    // ---------- Core create logic (with optional moderation) ----------
    private ResponseEntity<?> createPostInternal(PostRequest postRequest, MultipartFile file) {
        if (postRequest.getContent() == null || postRequest.getContent().trim().isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .contentType(MediaType.TEXT_PLAIN)
                    .body("Content must not be null or empty");
        }

        List<String> links = extractLinks(postRequest.getContent());
        Path tempPath = null;

        try {
            // (A) Uploaded file flow
            if (file != null && !file.isEmpty()) {
                // If moderation is available, scan a temp copy before upload
                if (moderationClient != null) {
                    tempPath = Files.createTempFile("upload-", "-" + file.getOriginalFilename());
                    file.transferTo(tempPath.toFile());
                    ModerationResult mod = moderationClient.moderatePost(
                            postRequest.getContent(), links, List.of(tempPath.toString()), true);
                    if (!mod.isSafe()) {
                        tryDeleteQuietly(tempPath);
                        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                                .body(Map.of(
                                        "error", "ContentRejected",
                                        "message", mod.getMessageToUser(),
                                        "labels", mod.getLabels()
                                ));
                    }
                }
                // Upload (either after moderation or directly when moderation is absent)
                String mediaUrl = mediaService.uploadFile(file);
                postRequest.setImageUrl(mediaUrl);
                tryDeleteQuietly(tempPath);
                tempPath = null;
            }
            // (B) Generated image flow
            else if (hasText(postRequest.getImagePrompt())) {
                // If moderation exists, check text first
                if (moderationClient != null) {
                    ModerationResult preGen = moderationClient.moderatePost(
                            postRequest.getContent(), links, List.of(), true);
                    if (!preGen.isSafe()) {
                        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                                .body(Map.of(
                                        "error", "ContentRejected",
                                        "message", preGen.getMessageToUser(),
                                        "labels", preGen.getLabels()
                                ));
                    }
                }

                String b64 = callImageGen(
                        postRequest.getImagePrompt(),
                        postRequest.getImageWidth(),
                        postRequest.getImageHeight(),
                        postRequest.getImageSteps(),
                        postRequest.getImageModel()
                );
                byte[] png = Base64.getDecoder().decode(b64);

                // If moderation exists, scan generated image before persisting
                if (moderationClient != null) {
                    tempPath = Files.createTempFile("gen-", ".png");
                    Files.write(tempPath, png);
                    ModerationResult postGen = moderationClient.moderatePost(
                            postRequest.getContent(), links, List.of(tempPath.toString()), true);
                    if (!postGen.isSafe()) {
                        tryDeleteQuietly(tempPath);
                        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                                .body(Map.of(
                                        "error", "ImageRejected",
                                        "message", postGen.getMessageToUser(),
                                        "labels", postGen.getLabels()
                                ));
                    }
                }

                // Upload safe (or unmoderated in tests) image
                MultipartFile genFile = new BytesMultipartFile("media", "generated.png", "image/png", png);
                String mediaUrl = mediaService.uploadFile(genFile);
                postRequest.setImageUrl(mediaUrl);
                tryDeleteQuietly(tempPath);
                tempPath = null;
            }
            // (C) No image: moderate text+links only if available
            else if (moderationClient != null) {
                ModerationResult mod = moderationClient.moderatePost(
                        postRequest.getContent(), links, List.of(), true);
                if (!mod.isSafe()) {
                    return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                            .body(Map.of(
                                    "error", "ContentRejected",
                                    "message", mod.getMessageToUser(),
                                    "labels", mod.getLabels()
                            ));
                }
            }

            // Persist post (same as before)
            Post post = postService.createPost(postRequest);
            return ResponseEntity.ok(toPostDTO(post));

        } catch (RestClientResponseException e) {
            // Image service error
            tryDeleteQuietly(tempPath);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "ImageService", "message", e.getResponseBodyAsString()));
        } catch (RuntimeException ex) {
            // <-- Restores what your tests expect
            tryDeleteQuietly(tempPath);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .contentType(MediaType.TEXT_PLAIN)
                    .body("Server error: " + ex.getMessage());
        } catch (Exception e) {
            // Moderation or IO unexpected error
            tryDeleteQuietly(tempPath);
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                    .body(Map.of("error", "ModerationUnavailable", "message", e.getMessage()));
        }
    }

    private boolean hasText(String s) {
        return s != null && !s.trim().isEmpty();
    }

    /** Calls FastAPI /generate-image and returns base64 PNG string. */
    private String callImageGen(String prompt, Integer width, Integer height, Integer steps, String model) {
        try {
            String url = fastapiBaseUrl + "/generate-image";
            Map<String, Object> body = new LinkedHashMap<>();
            body.put("prompt", prompt);
            body.put("width", width == null ? 1024 : width);
            body.put("height", height == null ? 1024 : height);
            body.put("steps", steps);
            body.put("model", model);
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

    private static void tryDeleteQuietly(Path p) {
        if (p == null) return;
        try { Files.deleteIfExists(p); } catch (Exception ignored) {}
    }

    // Minimal MultipartFile adapter for raw bytes
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
        @Override public void transferTo(File dest) throws IOException {
            try (FileOutputStream fos = new FileOutputStream(dest)) {
                fos.write(bytes);
            }
        }
    }
}
