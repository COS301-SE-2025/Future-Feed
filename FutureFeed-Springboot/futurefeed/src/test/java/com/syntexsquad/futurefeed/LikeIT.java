package com.syntexsquad.futurefeed;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.syntexsquad.futurefeed.model.AppUser;
import com.syntexsquad.futurefeed.model.UserPost;
import com.syntexsquad.futurefeed.repository.*;

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
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.Map;
import java.util.Set;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(properties = {
        "spring.datasource.url=jdbc:h2:mem:testdb;DB_CLOSE_DELAY=-1",
        "spring.datasource.driverClassName=org.h2.Driver",
        "spring.datasource.username=sa",
        "spring.datasource.password=",
        "spring.jpa.hibernate.ddl-auto=create-drop"
})
@AutoConfigureMockMvc
//@Transactional
public class LikeIT {

    @Autowired private MockMvc mockMvc;
    @Autowired private TopicRepository topicRepo;
    @Autowired private AppUserRepository userRepo;
    @Autowired private FollowerRepository followerRepo;
    @Autowired private FeedPresetRepository presetRepo;
    @Autowired private PresetRuleRepository ruleRepo;
    @Autowired private PostRepository postRepo;
    @Autowired private PostTopicRepository postTopicRepo;
    @Autowired private CommentRepository commentRepo;
    @Autowired private ReshareRepository reshareRepo;
    @Autowired private LikeRepository likeRepo;
    @Autowired private BookmarkRepository bookmarkRepo;
    @Autowired private BotPostRepository botPostRepo;
    @Autowired private BotRepository botRepo;

    private static final String TEST_EMAIL = "testuser@example.com";
    private static final String TEST_USERNAME = "testuser";

    private Integer postId;

    @BeforeEach
    
    public void setup() {
        // --- CLEANUP IN FK ORDER ---
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

        // --- CREATE USER ---
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

        // --- CREATE POST ---
        UserPost post = new UserPost();
        post.setContent("Test post for like tests");
        post.setUser(user);
        post = postRepo.save(post);
        postId = post.getId();

        // --- MOCK OAUTH2 LOGIN ---
        OAuth2User oAuth2User = new DefaultOAuth2User(
                Set.of(new SimpleGrantedAuthority("ROLE_USER")),
                Map.of("email", TEST_EMAIL),
                "email"
        );
        OAuth2AuthenticationToken auth = new OAuth2AuthenticationToken(
                oAuth2User,
                oAuth2User.getAuthorities(),
                "google"
        );
        SecurityContextHolder.getContext().setAuthentication(auth);
    }

    @Test
    public void testLikePostSuccess() throws Exception {
        mockMvc.perform(post("/api/likes/{postId}", postId))
                .andExpect(status().isOk())
                .andExpect(content().string("Post liked"));
    }

    @Test
    public void testLikePostAlreadyLiked() throws Exception {
        mockMvc.perform(post("/api/likes/{postId}", postId)).andExpect(status().isOk());
        mockMvc.perform(post("/api/likes/{postId}", postId))
                .andExpect(status().isBadRequest())
                .andExpect(content().string("Already liked"));
    }

    @Test
    public void testUnlikePostSuccess() throws Exception {
        mockMvc.perform(post("/api/likes/{postId}", postId)).andExpect(status().isOk());
        mockMvc.perform(delete("/api/likes/{postId}", postId))
                .andExpect(status().isOk())
                .andExpect(content().string("Post unliked"));
    }

    @Test
    public void testUnlikePostNotLiked() throws Exception {
        mockMvc.perform(delete("/api/likes/{postId}", postId))
                .andExpect(status().isBadRequest())
                .andExpect(content().string("Not liked yet"));
    }

    @Test
    public void testHasLikedTrue() throws Exception {
        mockMvc.perform(post("/api/likes/{postId}", postId)).andExpect(status().isOk());
        mockMvc.perform(get("/api/likes/has-liked/{postId}", postId))
                .andExpect(status().isOk())
                .andExpect(content().string("true"));
    }

    @Test
    public void testHasLikedFalse() throws Exception {
        mockMvc.perform(get("/api/likes/has-liked/{postId}", postId))
                .andExpect(status().isOk())
                .andExpect(content().string("false"));
    }

    @Test
    public void testCountLikes() throws Exception {
        mockMvc.perform(get("/api/likes/count/{postId}", postId))
                .andExpect(status().isOk())
                .andExpect(content().string("0"));

        mockMvc.perform(post("/api/likes/{postId}", postId)).andExpect(status().isOk());

        mockMvc.perform(get("/api/likes/count/{postId}", postId))
                .andExpect(status().isOk())
                .andExpect(content().string("1"));
    }
}
