package com.syntexsquad.futurefeed.Controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.syntexsquad.futurefeed.dto.PostDTO;
import com.syntexsquad.futurefeed.dto.PostRequest;
import com.syntexsquad.futurefeed.mapper.PostViewMapper;
import com.syntexsquad.futurefeed.moderation.ModerationClient;
import com.syntexsquad.futurefeed.moderation.ModerationResult;
import com.syntexsquad.futurefeed.model.Post;
import com.syntexsquad.futurefeed.service.MediaService;
import com.syntexsquad.futurefeed.service.PostService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
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

@RestController
@RequestMapping(value = "/api/posts", produces = MediaType.APPLICATION_JSON_VALUE)
public class PostController {

    private static final Logger log = LoggerFactory.getLogger(PostController.class);

    private final PostService postService;
    private final MediaService mediaService;
    private final ObjectMapper objectMapper;
    private final ModerationClient moderationClient; 
    private final PostViewMapper postViewMapper;

    @Value("${fastapi.base-url:http://localhost:8000}")
    private String fastapiBaseUrl;

    @Value("${app.moderation.required:false}")
    private boolean moderationRequired;

    public PostController(PostService postService,
                          MediaService mediaService,
                          ObjectMapper objectMapper,
                          Optional<ModerationClient> moderationClient,
                          PostViewMapper postViewMapper) {
        this.postService = postService;
        this.mediaService = mediaService;
        this.objectMapper = objectMapper;
        this.moderationClient = moderationClient.orElse(null);
        this.postViewMapper = postViewMapper;
    }

    private static final Pattern URL_RE = Pattern.compile("\\bhttps?://[^\\s)]+", Pattern.CASE_INSENSITIVE);

    private static List<String> extractLinks(String text) {
        if (text == null) return List.of();
        Matcher m = URL_RE.matcher(text);
        List<String> out = new ArrayList<>();
        while (m.find()) out.add(m.group());
        return out;
    }

    private boolean hasText(String s) {
        return s != null && !s.trim().isEmpty();
    }

    private static void tryDeleteQuietly(Path p) {
        if (p == null) return;
        try { Files.deleteIfExists(p); } catch (Exception ignored) {}
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getPostById(@PathVariable Integer id) {
        try {
            Post post = postService.getPostById(id);
            return ResponseEntity.ok(postViewMapper.toDto(post));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "NotFound", "message", e.getMessage()));
        }
    }

    @GetMapping
    public ResponseEntity<List<PostDTO>> getAllPosts() {
        return ResponseEntity.ok(postViewMapper.toDtoList(postService.getAllPosts()));
    }

    @GetMapping("/paginated")
    public ResponseEntity<Map<String, Object>> getPaginatedPosts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Page<Post> pageObj = postService.getPaginatedPosts(page, size);
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("content", postViewMapper.toDtoList(pageObj.getContent()));
        body.put("page", pageObj.getNumber());
        body.put("size", pageObj.getSize());
        body.put("totalPages", pageObj.getTotalPages());
        body.put("totalElements", pageObj.getTotalElements());
        body.put("last", pageObj.isLast());
        return ResponseEntity.ok(body);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<PostDTO>> getPostsByUser(@PathVariable Integer userId) {
        return ResponseEntity.ok(postViewMapper.toDtoList(postService.getPostsByUserId(userId)));
    }

    @GetMapping(params = "userId")
    public ResponseEntity<List<PostDTO>> getPostsByUserParam(@RequestParam Integer userId) {
        return ResponseEntity.ok(postViewMapper.toDtoList(postService.getPostsByUserId(userId)));
    }

    @GetMapping("/liked/{userId}")
    public ResponseEntity<List<PostDTO>> getLikedPosts(@PathVariable Integer userId) {
        return ResponseEntity.ok(postViewMapper.toDtoList(postService.getLikedPostsByUserId(userId)));
    }

    @GetMapping("/commented/{userId}")
    public ResponseEntity<List<PostDTO>> getPostsCommentedByUser(@PathVariable Integer userId) {
        return ResponseEntity.ok(postViewMapper.toDtoList(postService.getPostsCommentedByUser(userId)));
    }

    @GetMapping("/search")
    public ResponseEntity<?> searchPosts(@RequestParam("keyword") String keyword) {
        try {
            return ResponseEntity.ok(postViewMapper.toDtoList(postService.searchPosts(keyword)));
        } catch (RuntimeException ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "SearchError", "message", ex.getMessage()));
        }
    }

    @DeleteMapping("/del/{id}")
    public ResponseEntity<?> deletePost(@PathVariable Integer id) {
        try {
            boolean deleted = postService.deletePost(id);
            if (deleted) return ResponseEntity.ok("Post deleted successfully");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Post not found");
        } catch (RuntimeException ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Server error: " + ex.getMessage());
        }
    }

    @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> createPostJson(@RequestBody PostRequest postRequest) {
        if (postRequest.getContent() == null || postRequest.getContent().trim().isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .contentType(MediaType.TEXT_PLAIN)
                    .body("Content must not be null or empty");
        }
        return createPostInternal(postRequest, null);
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> createPostMultipart(
            @RequestPart("post") String postJson,
            @RequestPart(value = "media", required = false) MultipartFile mediaFile) {
        try {
            PostRequest postRequest = objectMapper.readValue(postJson, PostRequest.class);
            if (postRequest.getContent() == null || postRequest.getContent().trim().isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .contentType(MediaType.TEXT_PLAIN)
                        .body("Content must not be null or empty");
            }
            return createPostInternal(postRequest, mediaFile);
        } catch (IOException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "BadRequest", "message", "Invalid JSON in 'post'"));
        }
    }

    private ResponseEntity<?> createPostInternal(PostRequest postRequest, MultipartFile file) {
        List<String> links = extractLinks(postRequest.getContent());
        Path tempPath = null;

        try {
            if (file != null && !file.isEmpty()) {
                byte[] originalBytes;
                try {
                    originalBytes = file.getBytes();
                } catch (IOException io) {
                    log.error("Reading uploaded file failed: {}", io.toString());
                    return ResponseEntity.internalServerError().body(Map.of(
                            "error", "UploadFailed",
                            "message", "Could not read uploaded media"
                    ));
                }

                String originalName = Optional.ofNullable(file.getOriginalFilename()).orElse("upload.bin");
                String contentType  = Optional.ofNullable(file.getContentType()).orElse("application/octet-stream");

                if (moderationClient != null) {
                    try {
                        tempPath = Files.createTempFile("upload-", "-" + originalName);
                        Files.write(tempPath, originalBytes);

                        ModerationResult mod = moderationClient.moderatePost(
                                postRequest.getContent(), links, List.of(tempPath.toString()), true);

                        if (!mod.isSafe()) {
                            tryDeleteQuietly(tempPath);
                            tempPath = null;
                            return ResponseEntity.unprocessableEntity().body(Map.of(
                                    "error", "ContentRejected",
                                    "message", Optional.ofNullable(mod.getMessageToUser()).orElse("Content rejected by moderation."),
                                    "labels", mod.getLabels()
                            ));
                        }
                    } catch (Exception modErr) {
                        log.warn("Image moderation unavailable: {}", modErr.toString());
                        if (moderationRequired) {
                            tryDeleteQuietly(tempPath);
                            tempPath = null;
                            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(Map.of(
                                    "error", "ModerationUnavailable",
                                    "message", "Moderation service is temporarily unavailable"
                            ));
                        }
                    } finally {
                        tryDeleteQuietly(tempPath);
                        tempPath = null;
                    }
                }

                try {
                    MultipartFile forwardFile = new BytesMultipartFile(
                            "media", originalName, contentType, originalBytes
                    );
                    String mediaUrl = mediaService.uploadFile(forwardFile);
                    postRequest.setImageUrl(mediaUrl);
                } catch (Exception uploadErr) {
                    log.error("Media upload failed: {}", uploadErr.toString());
                    return ResponseEntity.internalServerError().body(Map.of(
                            "error", "UploadFailed",
                            "message", "Could not store media"
                    ));
                }
            }

            else if (hasText(postRequest.getImagePrompt())) {
                if (moderationClient != null) {
                    try {
                        ModerationResult preGen = moderationClient.moderatePost(postRequest.getContent(), links, List.of(), true);
                        if (!preGen.isSafe()) {
                            return ResponseEntity.unprocessableEntity().body(Map.of(
                                    "error", "ContentRejected",
                                    "message", Optional.ofNullable(preGen.getMessageToUser()).orElse("Content rejected by moderation."),
                                    "labels", preGen.getLabels()
                            ));
                        }
                    } catch (Exception modErr) {
                        log.warn("Text moderation unavailable (preGen): {}", modErr.toString());
                        if (moderationRequired) {
                            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(Map.of(
                                    "error", "ModerationUnavailable",
                                    "message", "Moderation service is temporarily unavailable"
                            ));
                        }
                    }
                }

                String b64 = callImageGen(postRequest.getImagePrompt(), postRequest.getImageWidth(),
                        postRequest.getImageHeight(), postRequest.getImageSteps(), postRequest.getImageModel());
                byte[] png = Base64.getDecoder().decode(b64);

                if (moderationClient != null) {
                    try {
                        tempPath = Files.createTempFile("gen-", ".png");
                        Files.write(tempPath, png);
                        ModerationResult postGen = moderationClient.moderatePost(
                                postRequest.getContent(), links, List.of(tempPath.toString()), true);
                        if (!postGen.isSafe()) {
                            tryDeleteQuietly(tempPath);
                            tempPath = null;
                            return ResponseEntity.unprocessableEntity().body(Map.of(
                                    "error", "ImageRejected",
                                    "message", Optional.ofNullable(postGen.getMessageToUser()).orElse("Generated image rejected by moderation."),
                                    "labels", postGen.getLabels()
                            ));
                        }
                    } catch (Exception modErr) {
                        log.warn("Image moderation unavailable (postGen): {}", modErr.toString());
                        if (moderationRequired) {
                            tryDeleteQuietly(tempPath);
                            tempPath = null;
                            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(Map.of(
                                    "error", "ModerationUnavailable",
                                    "message", "Moderation service is temporarily unavailable"
                            ));
                        }
                    } finally {
                        tryDeleteQuietly(tempPath);
                        tempPath = null;
                    }
                }

                try {
                    MultipartFile genFile = new BytesMultipartFile("media", "generated.png", "image/png", png);
                    String mediaUrl = mediaService.uploadFile(genFile);
                    postRequest.setImageUrl(mediaUrl);
                } catch (Exception uploadErr) {
                    log.error("Generated image upload failed: {}", uploadErr.toString());
                    return ResponseEntity.internalServerError().body(Map.of(
                            "error", "UploadFailed",
                            "message", "Could not store generated media"
                    ));
                }
            }
            else if (moderationClient != null) {
                try {
                    ModerationResult mod = moderationClient.moderatePost(postRequest.getContent(), links, List.of(), true);
                    if (!mod.isSafe()) {
                        return ResponseEntity.unprocessableEntity().body(Map.of(
                                "error", "ContentRejected",
                                "message", Optional.ofNullable(mod.getMessageToUser()).orElse("Content rejected by moderation."),
                                "labels", mod.getLabels()
                        ));
                    }
                } catch (Exception modErr) {
                    log.warn("Text moderation unavailable: {}", modErr.toString());
                    if (moderationRequired) {
                        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(Map.of(
                                "error", "ModerationUnavailable",
                                "message", "Moderation service is temporarily unavailable"
                        ));
                    }
                }
            }

            // Create the post
            Post post = postService.createPost(postRequest);
            return ResponseEntity.ok(postViewMapper.toDto(post));

        } catch (RestClientResponseException e) {
            tryDeleteQuietly(tempPath);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "ImageService", "message", "Upstream image service error"));
        } catch (RuntimeException ex) {
            tryDeleteQuietly(tempPath);
            log.error("Post creation failed: {}", ex.toString());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .contentType(MediaType.TEXT_PLAIN)
                    .body("Server error: " + ex.getMessage());
        }
    }

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

            JsonNode root = objectMapper.readTree(resp.getBody());
            return root.get("b64").asText();
        } catch (Exception e) {
            throw new RuntimeException("Image generation failed", e);
        }
    }

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
