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

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Set;

import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.containsString;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
public class FollowIT {

    @Autowired private MockMvc mockMvc;
    @Autowired private AppUserRepository userRepo;
    @Autowired private FollowerRepository followerRepo;
    @Autowired private PostRepository postRepo;
    @Autowired private PostTopicRepository postTopicRepo;
    @Autowired private CommentRepository commentRepo;
    @Autowired private ReshareRepository reshareRepo;
    @Autowired private FeedPresetRepository presetRepo;
    @Autowired private PresetRuleRepository ruleRepo;
    @Autowired private ObjectMapper objectMapper;

    private AppUser user;
    private AppUser target;

    @BeforeEach
    public void setup() {
        // Delete all related entities in FK-safe order
        postTopicRepo.deleteAll();     // post_topics → posts
        commentRepo.deleteAll();       // comments → posts
        reshareRepo.deleteAll();       // reshares → posts
        followerRepo.deleteAll();      // followers → users
        ruleRepo.deleteAll();          // preset_rules → presets
        presetRepo.deleteAll();        // feed_presets → users
        postRepo.deleteAll();          // posts → users
        userRepo.deleteAll();          // users

        // Create test user
        user = new AppUser();
        user.setUsername("follower");
        user.setEmail("follower@example.com");
        user.setPassword("test123");
        user.setDisplayName("Follower User");
        user.setDateOfBirth(LocalDate.of(2000, 1, 1));
        user = userRepo.save(user);

        // Create target user
        target = new AppUser();
        target.setUsername("followed");
        target.setEmail("followed@example.com");
        target.setPassword("test123");
        target.setDisplayName("Followed User");
        target.setDateOfBirth(LocalDate.of(2000, 1, 1));
        target = userRepo.save(target);

        // Simulate OAuth2 login for `user`
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
                .andExpect(status().isInternalServerError()); // Assuming service throws exception
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

        List<Follower> all = followerRepo.findAll();
        assert(all.size() == 1);
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
                .andExpect(jsonPath("$.following").value(true));
    }

    @Test
    public void testIsFollowingFalse() throws Exception {
        mockMvc.perform(get("/api/follow/status/" + target.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.following").value(false));
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
