package com.syntexsquad.futurefeed;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.syntexsquad.futurefeed.config.S3Config;
import com.syntexsquad.futurefeed.model.AppUser;
import com.syntexsquad.futurefeed.model.Comment;
import com.syntexsquad.futurefeed.model.UserPost;
import com.syntexsquad.futurefeed.repository.AppUserRepository;
import com.syntexsquad.futurefeed.repository.BookmarkRepository;
import com.syntexsquad.futurefeed.repository.BotPostRepository;
import com.syntexsquad.futurefeed.repository.BotRepository;
import com.syntexsquad.futurefeed.repository.CommentRepository;
import com.syntexsquad.futurefeed.repository.FeedPresetRepository;
import com.syntexsquad.futurefeed.repository.FollowerRepository;
import com.syntexsquad.futurefeed.repository.LikeRepository;
import com.syntexsquad.futurefeed.repository.PostRepository;
import com.syntexsquad.futurefeed.repository.PostTopicRepository;
import com.syntexsquad.futurefeed.repository.PresetRuleRepository;
import com.syntexsquad.futurefeed.repository.ReshareRepository;
import com.syntexsquad.futurefeed.service.MediaService;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.Map;
import java.util.Set;

import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(properties = {
        "spring.datasource.url=jdbc:h2:mem:testdb;DB_CLOSE_DELAY=-1",
        "spring.datasource.driverClassName=org.h2.Driver",
        "spring.datasource.username=sa",
        "spring.datasource.password=",
        "spring.jpa.hibernate.ddl-auto=create-drop"
})
@ActiveProfiles("test")
@AutoConfigureMockMvc
//@Transactional
public class CommentIT {

    @Autowired
    private MockMvc mockMvc;

    @Autowired private AppUserRepository userRepo;
    @Autowired private FollowerRepository followerRepo;
    @Autowired private PostRepository postRepo;
    @Autowired private PostTopicRepository postTopicRepo;
    @Autowired private CommentRepository commentRepo;
    @Autowired private ReshareRepository reshareRepo;
    @Autowired private LikeRepository likeRepo;
    @Autowired private BookmarkRepository bookmarkRepo;
    @Autowired private BotPostRepository botPostRepo;
    @Autowired private BotRepository botRepo;
    @Autowired private FeedPresetRepository presetRepo;
    @Autowired private PresetRuleRepository ruleRepo;
    @MockBean private S3Config s3Config;
    @MockBean private MediaService mediaService;

    @Autowired
    private ObjectMapper objectMapper;

    private static final String TEST_USERNAME = "testuser";

    private Integer postId;

    @BeforeEach
    public void setup() {
        // Clean dependencies respecting FK constraints
        ruleRepo.deleteAll();
        presetRepo.deleteAll();
        reshareRepo.deleteAll();
        commentRepo.deleteAll();
        likeRepo.deleteAll();
        bookmarkRepo.deleteAll();
        botPostRepo.deleteAll();
        postTopicRepo.deleteAll();
        postRepo.deleteAll();
        followerRepo.deleteAll();
        botRepo.deleteAll();
        //userRepo.deleteAll();

        // Create test user
        AppUser user = userRepo.findByUsername("testuser")
            .orElseGet(() -> {
                AppUser u = new AppUser();
                u.setUsername("testuser");
                u.setEmail("testuser@example.com");
                u.setPassword("test123");
                u.setDisplayName("Test User");
                u.setBio("Test bio");
                u.setDateOfBirth(LocalDate.of(2000, 1, 1));
                return userRepo.save(u);
            });
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
