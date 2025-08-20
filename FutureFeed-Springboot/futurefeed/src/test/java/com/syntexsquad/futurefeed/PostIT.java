package com.syntexsquad.futurefeed;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.syntexsquad.futurefeed.config.S3Config;
import com.syntexsquad.futurefeed.dto.PostRequest;
import com.syntexsquad.futurefeed.model.AppUser;
import com.syntexsquad.futurefeed.model.UserPost;
import com.syntexsquad.futurefeed.repository.AppUserRepository;
import com.syntexsquad.futurefeed.repository.CommentRepository;
import com.syntexsquad.futurefeed.repository.LikeRepository;
import com.syntexsquad.futurefeed.repository.PostRepository;
import com.syntexsquad.futurefeed.service.MediaService;

import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.cache.CacheManager;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.oauth2Login;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(properties = {
        "spring.cache.type=NONE",
        "spring.datasource.url=jdbc:h2:mem:testdb;DB_CLOSE_DELAY=-1",
        "spring.datasource.driverClassName=org.h2.Driver",
        "spring.datasource.username=sa",
        "spring.datasource.password=",
        "spring.jpa.hibernate.ddl-auto=create-drop"
})
@ActiveProfiles("test")
@AutoConfigureMockMvc
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
class PostIT {

    @Autowired private MockMvc mockMvc;
    @Autowired private ObjectMapper objectMapper;
    @Autowired private PostRepository postRepository;
    @Autowired private AppUserRepository userRepository;
    @Autowired private LikeRepository likeRepository;
    @Autowired private CommentRepository commentRepository;
    @Autowired private ClientRegistrationRepository clientRegistrationRepository;
    @MockBean private S3Config s3Config;
    @MockBean private MediaService mediaService;

    private AppUser testUser;

    @Autowired
    private CacheManager cacheManager;

    @BeforeEach
    void clearCache() {
        cacheManager.getCacheNames().forEach(name -> cacheManager.getCache(name).clear());
    }
    @BeforeEach
    void setUp() {
        testUser = new AppUser();
        testUser.setUsername("alice@example.com");
        testUser.setEmail("alice@example.com");
        testUser.setRole("ROLE_USER");
        testUser.setPassword("dummyPassword");
        testUser = userRepository.save(testUser); // always get managed entity
    }

    @AfterEach
    void cleanUp() {
        likeRepository.deleteAll();
        commentRepository.deleteAll();
        postRepository.deleteAll();
        userRepository.deleteAll();
    }

    // -------------------- CREATE POSTS --------------------
    @Test @Order(1)
    void createJsonPost_shouldSucceed() throws Exception {
        PostRequest request = new PostRequest();
        request.setContent("Hello OAuth2 world!");
        request.setIsBot(false);

        mockMvc.perform(post("/api/posts")
                        .with(oauth2Login().attributes(attrs -> attrs.put("email", testUser.getEmail())))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").value("Hello OAuth2 world!"));

        postRepository.flush(); // ensure H2 sees it

        // Only count posts owned by testUser
        long count = postRepository.findAll().stream()
                .filter(p -> p.getUser().getId().equals(testUser.getId()))
                .count();

        assertThat(count).isEqualTo(1);
    }

    @Test @Order(2)
    void createMultipartPost_shouldSucceed() throws Exception {
        PostRequest request = new PostRequest();
        request.setContent("Multipart OAuth2 post");
        request.setIsBot(false);

        MockMultipartFile postJson = new MockMultipartFile(
                "post", "", "application/json", objectMapper.writeValueAsBytes(request)
        );
        MockMultipartFile mediaFile = new MockMultipartFile(
                "media", "test.png", "image/png", "fakeimg".getBytes()
        );

        mockMvc.perform(multipart("/api/posts")
                        .file(postJson)
                        .file(mediaFile)
                        .with(req -> { req.setMethod("POST"); return req; })
                        .with(oauth2Login().attributes(attrs -> attrs.put("email", testUser.getEmail()))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").value("Multipart OAuth2 post"))
                .andExpect(jsonPath("$.imageUrl", notNullValue()));
    }

    @Test @Order(3)
    void createPost_missingContent_shouldFail() throws Exception {
        PostRequest request = new PostRequest();
        request.setContent("   ");
        request.setIsBot(false);

        mockMvc.perform(post("/api/posts")
                        .with(oauth2Login().attributes(attrs -> attrs.put("email", testUser.getEmail())))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(content().string("Content must not be null or empty"));
    }

    @Test @Order(4)
    void createPost_nullContent_shouldFail() throws Exception {
        PostRequest request = new PostRequest();
        request.setContent(null);
        request.setIsBot(false);

        mockMvc.perform(post("/api/posts")
                        .with(oauth2Login().attributes(attrs -> attrs.put("email", testUser.getEmail())))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(content().string("Content must not be null or empty"));
    }

    // -------------------- GET POSTS --------------------
    @Test @Order(5)
    void getPostById_notFound() throws Exception {
        mockMvc.perform(get("/api/posts/999")
                        .with(oauth2Login().attributes(attrs -> attrs.put("email", testUser.getEmail()))))
                .andExpect(status().isNotFound())
                .andExpect(content().string(containsString("not found")));
    }

    @Test @Order(6)
    void getPostById_found() throws Exception {
        UserPost post = new UserPost();
        post.setContent("Find me");
        post.setUser(testUser);
        postRepository.save(post);

        mockMvc.perform(get("/api/posts/" + post.getId())
                        .with(oauth2Login().attributes(attrs -> attrs.put("email", testUser.getEmail()))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").value("Find me"));
    }

    @Test @Order(7)
    void getAllPosts_emptyInitially() throws Exception {
        mockMvc.perform(get("/api/posts")
                        .with(oauth2Login().attributes(attrs -> attrs.put("email", testUser.getEmail()))))
                .andExpect(status().isOk())
                .andExpect(content().string("[]"));
    }

    @Test @Order(8)
    void getAllPosts_shouldReturnPosts() throws Exception {
        AppUser managedUser = userRepository.saveAndFlush(testUser);

        UserPost p1 = new UserPost(); p1.setContent("P1"); p1.setUser(managedUser);
        UserPost p2 = new UserPost(); p2.setContent("P2"); p2.setUser(managedUser);
        postRepository.save(p1);
        postRepository.save(p2);

        mockMvc.perform(get("/api/posts")
                        .with(oauth2Login().attributes(attrs -> attrs.put("email", managedUser.getEmail()))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(2)));
    }

    @Test @Order(9)
    void getPaginatedPosts_shouldReturnPage() throws Exception {
        for (int i = 1; i <= 5; i++) {
            UserPost post = new UserPost();
            post.setContent("Page" + i);
            post.setUser(testUser);
            postRepository.save(post);
        }

        mockMvc.perform(get("/api/posts/paginated?page=0&size=2")
                        .with(oauth2Login().attributes(attrs -> attrs.put("email", testUser.getEmail()))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(2)))
                .andExpect(jsonPath("$.totalElements").value(5));
    }

    @Test @Order(10)
    void getPostsByUser_shouldReturnUserPosts() throws Exception {
        UserPost post = new UserPost();
        post.setContent("UserPost1");
        post.setUser(testUser);
        postRepository.save(post);

        mockMvc.perform(get("/api/posts/user/" + testUser.getId())
                        .with(oauth2Login().attributes(attrs -> attrs.put("email", testUser.getEmail()))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].content").value("UserPost1"));
    }

    @Test @Order(11)
    void getPostsByUser_nonexistent_shouldReturnEmpty() throws Exception {
        mockMvc.perform(get("/api/posts/user/999")
                        .with(oauth2Login().attributes(attrs -> attrs.put("email", testUser.getEmail()))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(0)));
    }

    // -------------------- DELETE --------------------
    @Test @Order(12)
    void deletePost_shouldReturnOk() throws Exception {
        UserPost post = new UserPost();
        post.setContent("Delete me");
        post.setUser(testUser);
        postRepository.save(post);

        mockMvc.perform(delete("/api/posts/del/" + post.getId())
                        .with(oauth2Login().attributes(attrs -> attrs.put("email", testUser.getEmail()))))
                .andExpect(status().isOk())
                .andExpect(content().string("Post deleted successfully"));
    }

    @Test @Order(13)
    void deleteNonexistentPost_shouldReturn404() throws Exception {
        mockMvc.perform(delete("/api/posts/del/999")
                        .with(oauth2Login().attributes(attrs -> attrs.put("email", testUser.getEmail()))))
                .andExpect(status().isNotFound())
                .andExpect(content().string("Post not found"));
    }

    // -------------------- SEARCH --------------------
    @Test @Order(14)
    void searchPosts_shouldReturnMatching() throws Exception {
        UserPost p = new UserPost(); p.setContent("Magic keyword"); p.setUser(testUser);
        postRepository.save(p);

        mockMvc.perform(get("/api/posts/search").param("keyword", "magic")
                        .with(oauth2Login().attributes(attrs -> attrs.put("email", testUser.getEmail()))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].content").value("Magic keyword"));
    }

    @Test @Order(15)
    void searchPosts_emptyKeyword_shouldReturnEmpty() throws Exception {
        mockMvc.perform(get("/api/posts/search").param("keyword", "  ")
                        .with(oauth2Login().attributes(attrs -> attrs.put("email", testUser.getEmail()))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(0)));
    }

    @Test @Order(16)
    void searchPosts_caseInsensitive() throws Exception {
        UserPost p = new UserPost(); p.setContent("CaseTest"); p.setUser(testUser);
        postRepository.save(p);

        mockMvc.perform(get("/api/posts/search").param("keyword", "casetest")
                        .with(oauth2Login().attributes(attrs -> attrs.put("email", testUser.getEmail()))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].content").value("CaseTest"));
    }

    // -------------------- EDGE CASES --------------------
    @Test @Order(17)
    void createPost_largeContent_shouldSucceed() throws Exception {
        PostRequest request = new PostRequest();
        request.setContent("x".repeat(10000));
        request.setIsBot(false);

        mockMvc.perform(post("/api/posts")
                        .with(oauth2Login().attributes(attrs -> attrs.put("email", testUser.getEmail())))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasLength(10000)));
    }

    @Test @Order(18)
    void countPosts_afterMultipleCreates() {
        for (int i = 1; i <= 3; i++) {
            UserPost post = new UserPost();
            post.setContent("count" + i);
            post.setUser(testUser);
            postRepository.save(post);
        }
        assertThat(postRepository.count()).isEqualTo(3);
    }
}
