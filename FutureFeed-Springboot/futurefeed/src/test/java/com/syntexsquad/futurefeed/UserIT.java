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
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import org.springframework.boot.autoconfigure.EnableAutoConfiguration;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(
    webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT,
    properties = {
        "spring.datasource.url=jdbc:h2:mem:testdb;DB_CLOSE_DELAY=-1",
        "spring.datasource.driverClassName=org.h2.Driver",
        "spring.datasource.username=sa",
        "spring.datasource.password=",
        "spring.jpa.hibernate.ddl-auto=create-drop"
    },
    classes = FuturefeedApplication.class
)
@ActiveProfiles("test")
@AutoConfigureMockMvc
//@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_EACH_TEST_METHOD)
//@Transactional
public class UserIT {

    @Autowired private MockMvc mockMvc;
    @Autowired private FeedPresetRepository presetRepo;
    @Autowired private PresetRuleRepository ruleRepo;
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
    @Autowired private ObjectMapper objectMapper;

    private AppUser testUser;

    @BeforeEach
    public void setup() {
        // Clean up in strict foreign key order

        // Child records first
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


        // Recreate a test user
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
        // create a unique user for this test
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
}
