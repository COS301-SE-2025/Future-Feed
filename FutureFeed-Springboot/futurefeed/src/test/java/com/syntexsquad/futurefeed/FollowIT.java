package com.syntexsquad.futurefeed;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.syntexsquad.futurefeed.model.AppUser;
import com.syntexsquad.futurefeed.model.Follower;
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
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.Map;
import java.util.Set;

import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.containsString;
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
public class FollowIT {

    @Autowired private MockMvc mockMvc;
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
    @Autowired private ObjectMapper objectMapper;

    private AppUser user;
    private AppUser target;

    @BeforeEach
    public void setup() {
        // Clear only users and followers (no posts, comments, etc.)
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
       String uniqueSuffix = String.valueOf(System.currentTimeMillis());

        user = new AppUser();
        user.setUsername("follower" + uniqueSuffix);
        user.setEmail("follower" + uniqueSuffix + "@example.com");
        user.setPassword("test123");
        user.setDisplayName("Follower User");
        user.setDateOfBirth(LocalDate.of(2000, 1, 1));
        user = userRepo.save(user);

        target = new AppUser();
        target.setUsername("followed" + uniqueSuffix);
        target.setEmail("followed" + uniqueSuffix + "@example.com");
        target.setPassword("test123");
        target.setDisplayName("Followed User");
        target.setDateOfBirth(LocalDate.of(2000, 1, 1));
        target = userRepo.save(target);


        // Simulate OAuth2 login for user
        OAuth2User oAuth2User = new DefaultOAuth2User(
                Set.of(() -> "ROLE_USER"),
                Map.of("email", user.getEmail()),
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
    public void testFollowSuccess() throws Exception {
        String payload = "{\"followedId\": " + target.getId() + "}";
        mockMvc.perform(post("/api/follow")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isOk())
                .andExpect(content().string("Followed successfully."));
    }

    @Test
    public void testCannotFollowYourself() throws Exception {
        String payload = "{\"followedId\": " + user.getId() + "}";
        mockMvc.perform(post("/api/follow")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isBadRequest())
                .andExpect(content().string(containsString("Cannot follow yourself")));
    }

    @Test
    public void testFollowDuplicateIgnored() throws Exception {
        followerRepo.save(createFollower(user.getId(), target.getId()));

        String payload = "{\"followedId\": " + target.getId() + "}";
        mockMvc.perform(post("/api/follow")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isOk())
                .andExpect(content().string("Followed successfully."));

        // Only one entry should exist
        assert(followerRepo.findAll().size() == 1);
    }

    @Test
    public void testUnfollowSuccess() throws Exception {
        followerRepo.save(createFollower(user.getId(), target.getId()));

        mockMvc.perform(delete("/api/follow/" + target.getId()))
                .andExpect(status().isOk())
                .andExpect(content().string("Unfollowed successfully."));
    }

    @Test
    public void testUnfollowFailIfNotFollowing() throws Exception {
        mockMvc.perform(delete("/api/follow/" + target.getId()))
                .andExpect(status().isBadRequest())
                .andExpect(content().string(containsString("not following")));
    }

    @Test
    public void testIsFollowingTrue() throws Exception {
        followerRepo.save(createFollower(user.getId(), target.getId()));

        mockMvc.perform(get("/api/follow/status/" + target.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.isFollowing").value(true));
    }

    @Test
    public void testIsFollowingFalse() throws Exception {
        mockMvc.perform(get("/api/follow/status/" + target.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.isFollowing").value(false));
    }

    @Test
    public void testGetFollowersAndFollowing() throws Exception {
        followerRepo.save(createFollower(user.getId(), target.getId()));

        mockMvc.perform(get("/api/follow/followers/" + target.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)));

        mockMvc.perform(get("/api/follow/following/" + user.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)));
    }

    private Follower createFollower(Integer followerId, Integer followedId) {
        Follower f = new Follower();
        f.setFollowerId(followerId);
        f.setFollowedId(followedId);
        return f;
    }
}
