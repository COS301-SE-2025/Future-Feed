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

import java.time.LocalDate;
import java.util.Map;
import java.util.Set;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
public class LikeIT {

    @Autowired private MockMvc mockMvc;
    @Autowired private AppUserRepository userRepo;
    @Autowired private PostRepository postRepo;
    @Autowired private PostTopicRepository postTopicRepo;
    @Autowired private LikeRepository likeRepo;
    @Autowired private CommentRepository commentRepo;
    @Autowired private FeedPresetRepository presetRepo;
    @Autowired private PresetRuleRepository ruleRepo;

    private static final String TEST_EMAIL = "testuser@example.com";
    private static final String TEST_USERNAME = "testuser";

    private Integer postId;

    @BeforeEach
    public void setup() {
        // --- CLEANUP IN FK ORDER ---
        postTopicRepo.deleteAll();     // post_topics -> posts
        likeRepo.deleteAll();          // likes -> posts
        commentRepo.deleteAll();       // comments -> posts
        ruleRepo.deleteAll();          // preset_rules -> feed_presets
        presetRepo.deleteAll();        // feed_presets -> users
        postRepo.deleteAll();          // posts -> users
        userRepo.deleteAll();          // users

        // --- CREATE USER ---
        AppUser user = new AppUser();
        user.setUsername(TEST_USERNAME);
        user.setEmail(TEST_EMAIL);
        user.setPassword("test123");
        user.setDisplayName("Test User");
        user.setDateOfBirth(LocalDate.of(2000, 1, 1));
        user = userRepo.save(user);

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
