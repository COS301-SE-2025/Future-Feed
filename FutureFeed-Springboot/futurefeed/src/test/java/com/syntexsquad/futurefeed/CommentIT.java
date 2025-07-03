package com.syntexsquad.futurefeed;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.syntexsquad.futurefeed.model.AppUser;
import com.syntexsquad.futurefeed.model.Comment;
import com.syntexsquad.futurefeed.model.UserPost;
import com.syntexsquad.futurefeed.repository.AppUserRepository;
import com.syntexsquad.futurefeed.repository.CommentRepository;
import com.syntexsquad.futurefeed.repository.PostRepository;
import com.syntexsquad.futurefeed.repository.PostTopicRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;
import java.util.Map;
import java.util.Set;

import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
public class CommentIT {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private AppUserRepository userRepo;

    @Autowired
    private PostRepository postRepo;

    @Autowired
    private PostTopicRepository postTopicRepo;

    @Autowired
    private CommentRepository commentRepo;

    @Autowired
    private ObjectMapper objectMapper;

    private static final String TEST_USERNAME = "testuser";

    private Integer postId;

    @BeforeEach
    public void setup() {
        // Clean dependencies respecting FK constraints
        commentRepo.deleteAll();
        postTopicRepo.deleteAll();
        postRepo.deleteAll();
        userRepo.deleteAll();

        // Create test user
        AppUser user = new AppUser();
        user.setUsername(TEST_USERNAME);
        user.setEmail("testuser@example.com");
        user.setPassword("test123");
        user.setDisplayName("Test User");
        user.setDateOfBirth(LocalDate.of(2000, 1, 1));
        userRepo.save(user);

        // Create test post
        UserPost post = new UserPost();
        post.setContent("Post for comment tests");
        post.setUser(user);
        post = postRepo.save(post);
        postId = post.getId();

        // Mock OAuth2AuthenticationToken with email so CommentService finds the user
        OAuth2User oAuth2User = new DefaultOAuth2User(
            Set.of(() -> "ROLE_USER"),
            Map.of("email", user.getEmail()),
            "email"
        );
        OAuth2AuthenticationToken authenticationToken = new OAuth2AuthenticationToken(
            oAuth2User,
            oAuth2User.getAuthorities(),
            "google"
        );
        SecurityContextHolder.getContext().setAuthentication(authenticationToken);
    }

    @Test
    public void testAddCommentSuccess() throws Exception {
        String commentContent = "This is a test comment";

        mockMvc.perform(post("/api/comments/{postId}", postId)
                        .contentType(MediaType.TEXT_PLAIN)
                        .content(commentContent))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.postId", is(postId)))
                .andExpect(jsonPath("$.content", is(commentContent)))
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.userId").exists());
    }

    @Test
    public void testAddCommentEmptyContent() throws Exception {
        mockMvc.perform(post("/api/comments/{postId}", postId)
                        .contentType(MediaType.TEXT_PLAIN)
                        .content("   "))
                .andExpect(status().isBadRequest())
                .andExpect(content().string("Content cannot be empty"));
    }

    @Test
    public void testAddCommentPostNotFound() throws Exception {
        int invalidPostId = 999999;
        String commentContent = "Comment on invalid post";

        mockMvc.perform(post("/api/comments/{postId}", invalidPostId)
                        .contentType(MediaType.TEXT_PLAIN)
                        .content(commentContent))
                .andExpect(status().isBadRequest())
                .andExpect(content().string("Post not found"));
    }

    @Test
    public void testGetCommentsByPost() throws Exception {
        // Add two comments first
        commentRepo.deleteAll();
        commentRepo.save(createComment(postId, "First comment"));
        commentRepo.save(createComment(postId, "Second comment"));

        mockMvc.perform(get("/api/comments/post/{postId}", postId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(2)))
                .andExpect(jsonPath("$[0].content").value("First comment"))
                .andExpect(jsonPath("$[1].content").value("Second comment"));
    }

    // Helper to create Comment entities for direct repository saves
    private Comment createComment(Integer postId, String content) {
        Comment comment = new Comment();
        comment.setPostId(postId);
        comment.setUserId(userRepo.findByUsername(TEST_USERNAME).get().getId());
        comment.setContent(content);
        return comment;
    }
}
