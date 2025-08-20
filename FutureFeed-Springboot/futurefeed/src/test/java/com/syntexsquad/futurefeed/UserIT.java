package com.syntexsquad.futurefeed;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.syntexsquad.futurefeed.model.AppUser;
import com.syntexsquad.futurefeed.repository.*;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
public class UserIT {

    @Autowired private MockMvc mockMvc;

    @Autowired private AppUserRepository userRepo;
    @Autowired private LikeRepository likeRepo;
    @Autowired private CommentRepository commentRepo;
    @Autowired private PostRepository postRepo;
    @Autowired private PostTopicRepository postTopicRepo;
    @Autowired private FollowerRepository followerRepo;
    @Autowired private ReshareRepository reshareRepo;
    @Autowired private FeedPresetRepository presetRepo;
    @Autowired private PresetRuleRepository ruleRepo;
    @Autowired private ObjectMapper objectMapper;

    private AppUser testUser;

    @BeforeEach
    public void setup() {
        // Clean up in strict foreign key order

        // Child records first
        postTopicRepo.deleteAll();       // post_topics → posts
        likeRepo.deleteAll();            // likes → posts
        commentRepo.deleteAll();         // comments → posts
        reshareRepo.deleteAll();         // reshares → posts
        ruleRepo.deleteAll();            // preset_rules → feed_presets
        presetRepo.deleteAll();          // feed_presets → users
        postRepo.deleteAll();            // posts → users
        followerRepo.deleteAll();        // followers → users

        // Finally, users
        userRepo.deleteAll();

        // Recreate a test user
        testUser = new AppUser();
        testUser.setUsername("testuser");
        testUser.setEmail("testuser@example.com");
        testUser.setPassword("test123");
        testUser.setDisplayName("Test User");
        testUser.setBio("Test bio");
        testUser.setDateOfBirth(LocalDate.of(2000, 1, 1));
        testUser = userRepo.save(testUser);
    }

    @Test
    @WithMockUser(username = "testuser")
    public void testGetCurrentUser() throws Exception {
        mockMvc.perform(get("/api/user/myInfo"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.username").value("testuser"))
                .andExpect(jsonPath("$.email").value("testuser@example.com"));
    }

    @Test
    @WithMockUser(username = "testuser")
    public void testUpdateUser() throws Exception {
        String updateJson = """
            {
                "displayName": "Updated Name",
                "bio": "Updated Bio"
            }
        """;

        mockMvc.perform(put("/api/user/update")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(updateJson))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.displayName").value("Updated Name"))
                .andExpect(jsonPath("$.bio").value("Updated Bio"));
    }

    @Test
    @WithMockUser(username = "testuser")
    public void testDeleteUser() throws Exception {
        mockMvc.perform(delete("/api/user/delete"))
                .andExpect(status().isOk())
                .andExpect(content().string("User 'testuser' deleted and session invalidated."));
    }

    @Test
    @WithMockUser(username = "testuser")
    public void testGetAllUsers() throws Exception {
        mockMvc.perform(get("/api/user/all"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].username").value("testuser"));
    }

    @Test
    @WithMockUser(username = "testuser")
    public void testSearchUser() throws Exception {
        mockMvc.perform(get("/api/user/search?q=test"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].username").value("testuser"));
    }
}
