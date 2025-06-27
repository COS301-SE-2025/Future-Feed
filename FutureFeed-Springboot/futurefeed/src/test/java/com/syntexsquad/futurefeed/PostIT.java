package com.syntexsquad.futurefeed;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.syntexsquad.futurefeed.dto.PostRequest;
import com.syntexsquad.futurefeed.model.AppUser;
import com.syntexsquad.futurefeed.model.UserPost;
import com.syntexsquad.futurefeed.repository.AppUserRepository;
import com.syntexsquad.futurefeed.repository.CommentRepository;
import com.syntexsquad.futurefeed.repository.LikeRepository;
import com.syntexsquad.futurefeed.repository.PostRepository;
import com.syntexsquad.futurefeed.repository.PostTopicRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;
import java.util.Map;

import static java.util.Collections.singleton;
import static org.hamcrest.Matchers.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.authentication;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.oauth2Login;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
public class PostIT {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private AppUserRepository userRepo;

    @Autowired
    private PostRepository postRepo;

    @Autowired
    private PostTopicRepository postTopicRepo;

    @Autowired
    private LikeRepository likeRepo;

    @Autowired
    private CommentRepository commentRepo;

    @Autowired
    private ObjectMapper objectMapper;

    private static final String TEST_EMAIL = "testuser@example.com";

    @BeforeEach
    public void setup() {
        likeRepo.deleteAll();
        commentRepo.deleteAll();
        postTopicRepo.deleteAll();
        postRepo.deleteAll();
        userRepo.deleteAll();

        AppUser user = new AppUser();
        user.setUsername("testuser");
        user.setEmail(TEST_EMAIL);
        user.setPassword("test123");
        user.setDisplayName("Test User");
        user.setDateOfBirth(LocalDate.of(2000, 1, 1));
        userRepo.save(user);
    }

    @Test
    public void testCreatePostSuccess() throws Exception {
        PostRequest request = new PostRequest();
        request.setContent("Hello world!");

        OAuth2User oAuth2User = new DefaultOAuth2User(
                singleton(() -> "ROLE_USER"),
                Map.of("email", TEST_EMAIL),
                "email"
        );
        OAuth2AuthenticationToken token = new OAuth2AuthenticationToken(oAuth2User, oAuth2User.getAuthorities(), "google");

        mockMvc.perform(post("/api/posts")
                        .with(authentication(token))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").value("Hello world!"))
                .andExpect(jsonPath("$.id").isNumber());
    }

    @Test
    public void testCreatePostBadRequestEmptyContent() throws Exception {
        PostRequest request = new PostRequest();
        request.setContent("   ");

        mockMvc.perform(post("/api/posts")
                        .with(oauth2Login().attributes(attrs -> attrs.put("email", TEST_EMAIL)))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(content().string("Content must not be null or empty"));
    }

    @Test
    public void testDeletePostSuccess() throws Exception {
        AppUser user = userRepo.findByEmail(TEST_EMAIL).orElseThrow();
        UserPost post = new UserPost();
        post.setContent("Delete me");
        post.setUser(user);
        post = postRepo.save(post);

        mockMvc.perform(delete("/api/posts/del/{id}", post.getId())
                        .with(oauth2Login().attributes(attrs -> attrs.put("email", TEST_EMAIL))))
                .andExpect(status().isOk())
                .andExpect(content().string("Post deleted successfully"));
    }

    @Test
    public void testDeletePostNotFound() throws Exception {
        mockMvc.perform(delete("/api/posts/del/{id}", 999)
                        .with(oauth2Login().attributes(attrs -> attrs.put("email", TEST_EMAIL))))
                .andExpect(status().isNotFound())
                .andExpect(content().string("Post not found"));
    }

    @Test
    public void testSearchPosts() throws Exception {
        AppUser user = userRepo.findByEmail(TEST_EMAIL).orElseThrow();

        UserPost post1 = new UserPost();
        post1.setContent("Spring Boot testing");
        post1.setUser(user);
        postRepo.save(post1);

        UserPost post2 = new UserPost();
        post2.setContent("Another post");
        post2.setUser(user);
        postRepo.save(post2);

        mockMvc.perform(get("/api/posts/search")
                        .param("keyword", "spring")
                        .with(oauth2Login().attributes(attrs -> attrs.put("email", TEST_EMAIL))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].content", containsStringIgnoringCase("spring")));
    }

    @Test
    public void testGetAllPosts() throws Exception {
        AppUser user = userRepo.findByEmail(TEST_EMAIL).orElseThrow();

        UserPost post = new UserPost();
        post.setContent("All posts test");
        post.setUser(user);
        postRepo.save(post);

        mockMvc.perform(get("/api/posts")
                        .with(oauth2Login().attributes(attrs -> attrs.put("email", TEST_EMAIL))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", not(empty())))
                .andExpect(jsonPath("$[0].content", is("All posts test")));
    }

    @Test
    public void testGetPostsByUser() throws Exception {
        AppUser user = userRepo.findByEmail(TEST_EMAIL).orElseThrow();

        UserPost post = new UserPost();
        post.setContent("User posts test");
        post.setUser(user);
        postRepo.save(post);

        mockMvc.perform(get("/api/posts/user/{userId}", user.getId())
                        .with(oauth2Login().attributes(attrs -> attrs.put("email", TEST_EMAIL))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", not(empty())))
                .andExpect(jsonPath("$[0].content", is("User posts test")));
    }
}

