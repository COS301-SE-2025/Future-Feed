package com.syntexsquad.futurefeed;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.syntexsquad.futurefeed.model.AppUser;
import com.syntexsquad.futurefeed.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.MediaType;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import java.time.LocalDate;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@ActiveProfiles("test")
@AutoConfigureMockMvc
public class UserIT {

    @Autowired  private MockMvc mockMvc;
    @MockBean  private FeedPresetRepository presetRepo;
    @MockBean  private PresetRuleRepository ruleRepo;
    @MockBean  private AppUserRepository userRepo;
    @MockBean  private FollowerRepository followerRepo;
    @MockBean  private PostRepository postRepo;
    @MockBean  private PostTopicRepository postTopicRepo;
    @MockBean  private CommentRepository commentRepo;
    @MockBean  private ReshareRepository reshareRepo;
    @MockBean  private LikeRepository likeRepo;
    @MockBean  private BookmarkRepository bookmarkRepo;
    @MockBean  private BotPostRepository botPostRepo;
    @MockBean  private BotRepository botRepo;
    @MockBean  private ObjectMapper objectMapper;

    private AppUser testUser;

    @BeforeEach
    public void setup() {
        // Clean database in strict foreign key order
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

        // Create a test user
        testUser = userRepo.findByUsername("testuser")
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
    @WithMockUser(username = "deleteuser")
    public void testDeleteUser() throws Exception {
        AppUser delUser = new AppUser();
        delUser.setUsername("deleteuser");
        delUser.setEmail("deleteuser@example.com");
        delUser.setPassword("pass123");
        delUser.setDisplayName("Delete Me");
        delUser = userRepo.save(delUser);

        mockMvc.perform(delete("/api/user/delete"))
                .andExpect(status().isOk())
                .andExpect(content().string("User 'deleteuser' deleted and session invalidated."));
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

    // --- Test security config to avoid OAuth2 context errors ---
    @Configuration
    @EnableWebSecurity
    static class TestSecurityConfig {
        @Bean
        public org.springframework.security.web.SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
            http.csrf().disable()
                .authorizeHttpRequests(auth -> auth.anyRequest().permitAll());
            return http.build();
        }
    }
}
